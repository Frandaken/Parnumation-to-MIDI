import { ParsedNote, ParsedSong, SATBVoice } from '../types';

export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number; // in seconds
  currentBeat: number;
  totalDuration: number;
  activeNoteIds: Set<string>;
  masterVolume: number;
  trackVolumes: Record<string, number>;
}

export type PlaybackListener = (state: PlaybackState) => void;

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private song: ParsedSong | null = null;
  private startTime: number = 0;
  private pausedAt: number = 0;
  private isPlaying: boolean = false;
  private tempoMultiplier: number = 1.0;
  private isLooping: boolean = false;
  private masterVolume: number = 0.85;

  private activeOscillators: { stop: () => void }[] = [];
  private animationFrameId: number | null = null;
  private listeners: Set<PlaybackListener> = new Set();

  private trackMutes: Map<SATBVoice, boolean> = new Map();
  private trackSolos: Map<SATBVoice, boolean> = new Map();
  private trackVolumes: Map<SATBVoice, number> = new Map();

  private initAudio() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public subscribe(listener: PlaybackListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const current = this.getCurrentTime();
    const currentBeat = this.song ? (current * (this.song.metadata.bpm * this.tempoMultiplier)) / 60 : 0;
    const activeNoteIds = new Set<string>();

    if (this.song && this.isPlaying) {
      for (const track of this.song.tracks) {
        if (this.isMuted(track.voice)) continue;
        for (const note of track.notes) {
          if (note.pitch.isRest) continue;
          const noteStart = (note.timeSeconds ?? 0) / this.tempoMultiplier;
          const noteDuration = (note.durationBeats * (60 / this.song.metadata.bpm)) / this.tempoMultiplier;
          if (current >= noteStart && current <= noteStart + noteDuration) {
            activeNoteIds.add(note.id);
          }
        }
      }
    }

    const trackVolumesObj: Record<string, number> = {};
    this.trackVolumes.forEach((v, k) => {
      trackVolumesObj[k] = v;
    });

    const state: PlaybackState = {
      isPlaying: this.isPlaying,
      currentTime: current,
      currentBeat,
      totalDuration: this.getTotalDuration(),
      activeNoteIds,
      masterVolume: this.masterVolume,
      trackVolumes: trackVolumesObj,
    };

    this.listeners.forEach((l) => l(state));
  }

  public setSong(song: ParsedSong) {
    this.stop();
    this.song = song;
    this.pausedAt = 0;
    this.notify();
  }

  public setMasterVolume(volume: number) {
    const clamped = Math.max(0, Math.min(1, volume));
    this.masterVolume = clamped;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(clamped, this.ctx.currentTime);
    }
    this.notify();
  }

  public getMasterVolume(): number {
    return this.masterVolume;
  }

  public setTrackVolume(voice: SATBVoice, volume: number) {
    const clamped = Math.max(0, Math.min(1.5, volume));
    this.trackVolumes.set(voice, clamped);
    this.notify();
  }

  public getTrackVolume(voice: SATBVoice): number {
    return this.trackVolumes.get(voice) ?? 1.0;
  }

  public setTempoMultiplier(mult: number) {
    const current = this.getCurrentTime();
    this.tempoMultiplier = Math.max(0.25, Math.min(3.0, mult));
    if (this.isPlaying) {
      this.stopVoices();
      this.startTime = this.ctx!.currentTime - current;
      this.schedulePlayback(current);
    }
    this.notify();
  }

  public setLoop(loop: boolean) {
    this.isLooping = loop;
  }

  public setTrackMute(voice: SATBVoice, muted: boolean) {
    this.trackMutes.set(voice, muted);
    if (this.isPlaying) {
      this.restartFromCurrent();
    }
    this.notify();
  }

  public setTrackSolo(voice: SATBVoice, solo: boolean) {
    this.trackSolos.set(voice, solo);
    if (this.isPlaying) {
      this.restartFromCurrent();
    }
    this.notify();
  }

  public isMuted(voice: SATBVoice): boolean {
    const anySolo = Array.from(this.trackSolos.values()).some((s) => s);
    if (anySolo) {
      return !this.trackSolos.get(voice);
    }
    return !!this.trackMutes.get(voice);
  }

  public play() {
    if (!this.song || this.song.tracks.length === 0) return;
    this.initAudio();

    if (this.isPlaying) return;

    const totalDur = this.getTotalDuration();
    if (this.pausedAt >= totalDur) {
      this.pausedAt = 0;
    }

    this.isPlaying = true;
    this.startTime = this.ctx!.currentTime - this.pausedAt;
    this.schedulePlayback(this.pausedAt);
    this.startTracking();
    this.notify();
  }

  public pause() {
    if (!this.isPlaying) return;
    this.pausedAt = this.getCurrentTime();
    this.isPlaying = false;
    this.stopVoices();
    this.stopTracking();
    this.notify();
  }

  public stop() {
    this.isPlaying = false;
    this.pausedAt = 0;
    this.stopVoices();
    this.stopTracking();
    this.notify();
  }

  public seek(timeSeconds: number) {
    const total = this.getTotalDuration();
    const clamped = Math.max(0, Math.min(total, timeSeconds));
    this.pausedAt = clamped;
    if (this.isPlaying) {
      this.stopVoices();
      this.startTime = this.ctx!.currentTime - clamped;
      this.schedulePlayback(clamped);
    }
    this.notify();
  }

  public seekToBeat(beat: number) {
    if (!this.song) return;
    const bpm = this.song.metadata.bpm || 100;
    const seconds = (beat * (60 / bpm)) / this.tempoMultiplier;
    this.seek(seconds);
  }

  public getCurrentTime(): number {
    if (!this.isPlaying) {
      return this.pausedAt;
    }
    if (!this.ctx) return 0;
    const elapsed = this.ctx.currentTime - this.startTime;
    const total = this.getTotalDuration();
    if (total > 0 && elapsed >= total) {
      if (this.isLooping) {
        this.startTime = this.ctx.currentTime;
        this.schedulePlayback(0);
        return 0;
      } else {
        this.stop();
        return total;
      }
    }
    return Math.min(total, elapsed);
  }

  public getTotalDuration(): number {
    if (!this.song) return 0;
    return this.song.totalDurationSeconds / this.tempoMultiplier;
  }

  private restartFromCurrent() {
    const current = this.getCurrentTime();
    this.stopVoices();
    this.schedulePlayback(current);
  }

  private stopVoices() {
    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch {
        // ignore already stopped
      }
    });
    this.activeOscillators = [];
  }

  private startTracking() {
    this.stopTracking();
    const tick = () => {
      this.notify();
      if (this.isPlaying) {
        this.animationFrameId = requestAnimationFrame(tick);
      }
    };
    this.animationFrameId = requestAnimationFrame(tick);
  }

  private stopTracking() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Schedules Web Audio nodes for notes from given offset time
   */
  private schedulePlayback(fromTime: number) {
    if (!this.ctx || !this.song || !this.masterGain) return;

    const ctxNow = this.ctx.currentTime;
    const bpm = this.song.metadata.bpm * this.tempoMultiplier;
    const secondsPerBeat = 60.0 / bpm;

    for (const track of this.song.tracks) {
      if (this.isMuted(track.voice)) continue;

      // Panning per voice: S (left), A (mid-left), T (mid-right), B (right)
      const panNode = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
      if (panNode) {
        const panValue = (track.pan - 64) / 64; // -1 to 1
        panNode.pan.setValueAtTime(panValue, ctxNow);
        panNode.connect(this.masterGain);
      }

      const dest = panNode || this.masterGain;

      for (const note of track.notes) {
        if (note.pitch.isRest || note.pitch.midiNote <= 0) continue;

        const noteStartSongTime = (note.timeSeconds ?? (note.beatOffset * (60 / this.song.metadata.bpm))) / this.tempoMultiplier;
        const noteDuration = (note.durationBeats * (60 / this.song.metadata.bpm)) / this.tempoMultiplier;

        if (noteStartSongTime + noteDuration < fromTime) {
          continue; // Note already finished
        }

        const scheduledStart = Math.max(ctxNow, ctxNow + (noteStartSongTime - fromTime));
        const scheduledDuration = noteDuration - Math.max(0, fromTime - noteStartSongTime);

        if (scheduledDuration <= 0) continue;

        this.synthesizeNote(note, track.voice, scheduledStart, scheduledDuration, dest);
      }
    }
  }

  /**
   * Rich multi-oscillator synthesizer for Choir / Piano / Solfège voices
   */
  private synthesizeNote(
    note: ParsedNote,
    voice: SATBVoice,
    startTime: number,
    duration: number,
    destination: AudioNode
  ) {
    if (!this.ctx) return;

    const midi = note.pitch.midiNote;
    const freq = 440 * Math.pow(2, (midi - 69) / 12);

    // Filter to simulate vocal formants / warm acoustic body
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    
    // Vocal timbre character
    if (voice === 'S' || voice === 'A') {
      filter.frequency.setValueAtTime(2200, startTime);
    } else if (voice === 'T') {
      filter.frequency.setValueAtTime(1600, startTime);
    } else if (voice === 'B') {
      filter.frequency.setValueAtTime(1000, startTime);
    } else {
      filter.frequency.setValueAtTime(3200, startTime);
    }

    const gainNode = this.ctx.createGain();
    const trackVol = this.trackVolumes.get(voice) ?? 1.0;
    const velocityGain = ((note.articulation.velocity || 88) / 127) * trackVol;
    const peakGain = 0.22 * velocityGain;

    // ADSR Envelope
    const attack = 0.04;
    const decay = 0.1;
    const sustain = 0.75 * peakGain;
    const release = 0.08;

    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.exponentialRampToValueAtTime(Math.max(0.001, peakGain), startTime + attack);
    gainNode.gain.exponentialRampToValueAtTime(Math.max(0.001, sustain), startTime + attack + decay);

    const stopTime = startTime + duration;
    gainNode.gain.setValueAtTime(Math.max(0.001, sustain), stopTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, stopTime + release);

    // Primary Tone Oscillator (Sine + subtle saw for choir richness)
    const osc1 = this.ctx.createOscillator();
    osc1.type = voice === 'M' ? 'triangle' : 'sine';
    osc1.frequency.setValueAtTime(freq, startTime);

    // Sub/Harmonic Oscillator for choir warmth
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, startTime); // 1 octave above harmonic
    const osc2Gain = this.ctx.createGain();
    osc2Gain.gain.setValueAtTime(0.18, startTime);

    osc1.connect(gainNode);
    osc2.connect(osc2Gain);
    osc2Gain.connect(gainNode);

    gainNode.connect(filter);
    filter.connect(destination);

    osc1.start(startTime);
    osc2.start(startTime);

    osc1.stop(stopTime + release + 0.05);
    osc2.stop(stopTime + release + 0.05);

    const stopHandle = () => {
      try {
        osc1.stop();
        osc2.stop();
        gainNode.disconnect();
        filter.disconnect();
      } catch {
        // ignore
      }
    };

    this.activeOscillators.push({ stop: stopHandle });
  }

  /**
   * Play a single preview tone (used by Not Generator and interactive keys)
   */
  public playSingleTone(midiNote: number, duration: number = 0.6) {
    this.initAudio();
    if (!this.ctx || !this.masterGain) return;

    const startTime = this.ctx.currentTime;
    const freq = 440 * Math.pow(2, (midiNote - 69) / 12);

    const gainNode = this.ctx.createGain();
    const peakGain = 0.28 * this.masterVolume;
    const attack = 0.02;
    const decay = 0.08;
    const sustain = peakGain * 0.7;
    const release = 0.12;

    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.exponentialRampToValueAtTime(Math.max(0.001, peakGain), startTime + attack);
    gainNode.gain.exponentialRampToValueAtTime(Math.max(0.001, sustain), startTime + attack + decay);

    const stopTime = startTime + duration;
    gainNode.gain.setValueAtTime(Math.max(0.001, sustain), stopTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, stopTime + release);

    const osc1 = this.ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, startTime);

    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, startTime);
    const osc2Gain = this.ctx.createGain();
    osc2Gain.gain.setValueAtTime(0.15, startTime);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2800, startTime);

    osc1.connect(gainNode);
    osc2.connect(osc2Gain);
    osc2Gain.connect(gainNode);
    gainNode.connect(filter);
    filter.connect(this.masterGain);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(stopTime + release + 0.05);
    osc2.stop(stopTime + release + 0.05);
  }
}

export const audioPlayer = new AudioEngine();
