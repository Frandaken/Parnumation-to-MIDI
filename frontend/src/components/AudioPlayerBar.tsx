import React, { useEffect, useState } from 'react';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Volume2,
  VolumeX,
  Gauge,
  Repeat,
  Headphones,
  SlidersHorizontal,
} from 'lucide-react';
import { ParsedSong, SATBVoice } from '../types';
import { audioPlayer, PlaybackState } from '../lib/audioPlayer';

interface AudioPlayerBarProps {
  song: ParsedSong;
  onOpenExportModal: () => void;
}

const VOICE_COLORS: Record<SATBVoice, { bg: string; text: string; border: string; activeBg: string }> = {
  S: { bg: 'bg-[#121824]', text: 'text-blue-400', border: 'border-blue-500/30', activeBg: 'bg-blue-400' },
  A: { bg: 'bg-[#1e1315]', text: 'text-rose-400', border: 'border-rose-500/30', activeBg: 'bg-rose-400' },
  T: { bg: 'bg-[#0f1d17]', text: 'text-emerald-400', border: 'border-emerald-500/30', activeBg: 'bg-emerald-400' },
  B: { bg: 'bg-[#0f1b22]', text: 'text-sky-400', border: 'border-sky-500/30', activeBg: 'bg-sky-400' },
  M: { bg: 'bg-[#1A150A]', text: 'text-[#C5A059]', border: 'border-[#C5A059]/40', activeBg: 'bg-[#C5A059]' },
};

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  song,
  onOpenExportModal,
}) => {
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentTime: 0,
    currentBeat: 0,
    totalDuration: 0,
    activeNoteIds: new Set(),
  });

  const [tempoMultiplier, setTempoMultiplier] = useState(1.0);
  const [isLooping, setIsLooping] = useState(false);
  const [masterVolume, setMasterVolume] = useState(0.85);
  const [prevMasterVolume, setPrevMasterVolume] = useState(0.85);
  const [trackVolumes, setTrackVolumes] = useState<Record<string, number>>({});
  const [mutes, setMutes] = useState<Record<string, boolean>>({});
  const [solos, setSolos] = useState<Record<string, boolean>>({});

  useEffect(() => {
    audioPlayer.setSong(song);
    const unsubscribe = audioPlayer.subscribe((state) => {
      setPlaybackState(state);
      setMasterVolume(state.masterVolume);
      if (state.trackVolumes) {
        setTrackVolumes(state.trackVolumes);
      }
    });
    return () => {
      unsubscribe();
    };
  }, [song]);

  const handlePlayPause = () => {
    if (playbackState.isPlaying) {
      audioPlayer.pause();
    } else {
      audioPlayer.play();
    }
  };

  const handleStop = () => {
    audioPlayer.stop();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    audioPlayer.seek(time);
  };

  const handleMasterVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setMasterVolume(vol);
    if (vol > 0) setPrevMasterVolume(vol);
    audioPlayer.setMasterVolume(vol);
  };

  const handleToggleMasterMute = () => {
    if (masterVolume > 0) {
      setPrevMasterVolume(masterVolume);
      setMasterVolume(0);
      audioPlayer.setMasterVolume(0);
    } else {
      const restored = prevMasterVolume > 0 ? prevMasterVolume : 0.85;
      setMasterVolume(restored);
      audioPlayer.setMasterVolume(restored);
    }
  };

  const handleTrackVolumeChange = (voice: SATBVoice, vol: number) => {
    setTrackVolumes(prev => ({ ...prev, [voice]: vol }));
    audioPlayer.setTrackVolume(voice, vol);
  };

  const handleTempoChange = (mult: number) => {
    setTempoMultiplier(mult);
    audioPlayer.setTempoMultiplier(mult);
  };

  const handleToggleLoop = () => {
    const next = !isLooping;
    setIsLooping(next);
    audioPlayer.setLoop(next);
  };

  const handleToggleMute = (v: SATBVoice) => {
    const next = !mutes[v];
    const newMutes = { ...mutes, [v]: next };
    setMutes(newMutes);
    audioPlayer.setTrackMute(v, next);
  };

  const handleToggleSolo = (v: SATBVoice) => {
    const next = !solos[v];
    const newSolos = { ...solos, [v]: next };
    setSolos(newSolos);
    audioPlayer.setTrackSolo(v, next);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentBar = Math.floor(playbackState.currentBeat / (song.metadata.timeSignature[0] || 4)) + 1;
  const currentBeatInBar = (playbackState.currentBeat % (song.metadata.timeSignature[0] || 4)) + 1;

  return (
    <div className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl p-4 sm:p-5 shadow-none space-y-4">
      {/* Top Playback Bar: Controls + Scrubber + Volume + Time + Export Button */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Main Transport Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePlayPause}
            className="h-10 w-10 rounded bg-[#C5A059] hover:bg-[#E0B86C] text-black flex items-center justify-center font-bold transition-transform active:scale-95"
            title={playbackState.isPlaying ? 'Jeda (Pause)' : 'Putar Audio (Play)'}
          >
            {playbackState.isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={handleStop}
            className="h-9 w-9 rounded bg-[#1A1A1A] hover:bg-[#222] border border-[#333] hover:border-[#C5A059] text-[#E0E0E0] flex items-center justify-center transition-colors"
            title="Stop & Reset"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
          </button>

          <button
            onClick={handleToggleLoop}
            className={`h-9 w-9 rounded flex items-center justify-center transition border ${
              isLooping
                ? 'bg-[#C5A059] text-black border-[#C5A059] font-bold'
                : 'bg-[#1A1A1A] hover:bg-[#222] border-[#333] hover:border-[#C5A059] text-[#888]'
            }`}
            title="Ulangi Lagu (Loop)"
          >
            <Repeat className="w-3.5 h-3.5" />
          </button>

          {/* Bar / Beat Counter Display */}
          <div className="hidden sm:flex flex-col items-center bg-[#141414] px-3 py-1 rounded border border-[#2A2A2A] font-mono text-xs text-[#E0E0E0]">
            <span className="text-[9px] text-[#707070] uppercase tracking-widest font-bold">Posisi Skor</span>
            <span>
              Bar <b className="text-[#C5A059]">{currentBar}</b> &bull; Beat <b className="text-[#E0E0E0]">{currentBeatInBar.toFixed(1)}</b>
            </span>
          </div>
        </div>

        {/* Scrubber Timeline */}
        <div className="flex-1 w-full max-w-lg flex items-center space-x-3">
          <span className="text-xs font-mono text-[#888] w-10 text-right">
            {formatTime(playbackState.currentTime)}
          </span>

          <div className="flex-1 relative flex items-center">
            <input
              type="range"
              min="0"
              max={playbackState.totalDuration || 1}
              step="0.05"
              value={playbackState.currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-[#222] rounded appearance-none cursor-pointer accent-[#C5A059] focus:outline-none"
            />
          </div>

          <span className="text-xs font-mono text-[#888] w-10">
            {formatTime(playbackState.totalDuration)}
          </span>
        </div>

        {/* Volume & Tempo & Export MIDI */}
        <div className="flex items-center space-x-2.5 sm:space-x-3 w-full md:w-auto justify-end flex-wrap gap-y-2">
          {/* Master Volume Slider */}
          <div className="flex items-center bg-[#141414] px-2.5 py-1.5 rounded border border-[#2A2A2A] space-x-2 text-xs">
            <button
              onClick={handleToggleMasterMute}
              className="text-[#888] hover:text-[#C5A059] transition-colors"
              title={masterVolume === 0 ? 'Aktifkan Suara' : 'Senyapkan Master Volume'}
            >
              {masterVolume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#C5A059]" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={masterVolume}
              onChange={handleMasterVolumeChange}
              className="w-16 sm:w-20 h-1.5 bg-[#222] rounded appearance-none cursor-pointer accent-[#C5A059] focus:outline-none"
              title={`Master Volume: ${Math.round(masterVolume * 100)}%`}
            />
            <span className="text-[10px] font-mono text-[#888] w-7 text-right">
              {Math.round(masterVolume * 100)}%
            </span>
          </div>

          {/* Tempo Speed Pills */}
          <div className="flex items-center bg-[#141414] p-1 rounded border border-[#2A2A2A] text-[10px] uppercase font-mono">
            <span className="px-1.5 text-[#707070] hidden sm:inline">Speed:</span>
            {[0.75, 1.0, 1.25].map((speed) => (
              <button
                key={speed}
                onClick={() => handleTempoChange(speed)}
                className={`px-2 py-0.5 rounded font-bold transition ${
                  tempoMultiplier === speed
                    ? 'bg-[#C5A059] text-black'
                    : 'text-[#888] hover:text-[#E0E0E0]'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Export MIDI Modal Trigger */}
          <button
            onClick={onOpenExportModal}
            className="flex items-center space-x-1.5 bg-[#C5A059] hover:bg-[#E0B86C] text-black font-bold uppercase tracking-widest text-[11px] px-3.5 py-1.5 rounded transition-colors"
          >
            <span>MIDI</span>
          </button>
        </div>
      </div>

      {/* Voice Mixer Strip (SATB Mute, Solo & Individual Volume) */}
      {song.tracks.length > 0 && (
        <div className="pt-3 border-t border-[#222]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5 text-xs text-[#C5A059] font-bold uppercase tracking-widest">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Voice Mixer (SATB Channels & Level Volume)</span>
            </div>
            <span className="text-[10px] text-[#707070] uppercase font-mono tracking-wider">
              {song.tracks.length} Trek Suara Aktif
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            {song.tracks.map((track) => {
              const colors = VOICE_COLORS[track.voice] || VOICE_COLORS.M;
              const isMuted = audioPlayer.isMuted(track.voice);
              const isSolo = !!solos[track.voice];
              const voiceVol = trackVolumes[track.voice] ?? 1.0;

              // Check if any note of this track is currently active
              const hasActiveNote = track.notes.some((n) => playbackState.activeNoteIds.has(n.id));

              return (
                <div
                  key={track.voice}
                  className={`p-2.5 rounded border transition space-y-2 ${
                    isMuted
                      ? 'bg-[#0A0A0A] border-[#222] opacity-50'
                      : `${colors.bg} ${colors.border}`
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 min-w-0">
                      <div
                        className={`h-2 w-2 rounded-full transition ${
                          hasActiveNote && !isMuted ? `${colors.activeBg} animate-ping` : 'bg-[#333]'
                        }`}
                      />
                      <div className="truncate">
                        <div className="flex items-center space-x-1">
                          <span className={`font-bold font-mono text-sm ${colors.text}`}>
                            [{track.voice}]
                          </span>
                        </div>
                        <div className="text-[10px] text-[#707070] font-mono">
                          {track.notes.filter((n) => !n.pitch.isRest).length} notasi
                        </div>
                      </div>
                    </div>

                    {/* Solo / Mute Buttons */}
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleToggleSolo(track.voice)}
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border transition ${
                          isSolo
                            ? 'bg-[#C5A059] border-[#C5A059] text-black font-bold'
                            : 'bg-[#1A1A1A] border-[#333] text-[#888] hover:text-[#E0E0E0]'
                        }`}
                        title="Solo suara ini"
                      >
                        S
                      </button>
                      <button
                        onClick={() => handleToggleMute(track.voice)}
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border transition ${
                          isMuted
                            ? 'bg-[#8B0000] border-red-700 text-white'
                            : 'bg-[#1A1A1A] border-[#333] text-[#888] hover:text-[#E0E0E0]'
                        }`}
                        title="Mute / Senyapkan suara ini"
                      >
                        M
                      </button>
                    </div>
                  </div>

                  {/* Channel Volume Slider */}
                  <div className="flex items-center space-x-2 pt-1 border-t border-[#222]/60">
                    <span className="text-[9px] font-mono text-[#707070] uppercase">Vol</span>
                    <input
                      type="range"
                      min="0"
                      max="1.5"
                      step="0.05"
                      value={voiceVol}
                      disabled={isMuted}
                      onChange={(e) => handleTrackVolumeChange(track.voice, parseFloat(e.target.value))}
                      className="flex-1 h-1 bg-[#222] rounded appearance-none cursor-pointer accent-[#C5A059] focus:outline-none disabled:opacity-30"
                      title={`Volume ${track.name}: ${Math.round(voiceVol * 100)}%`}
                    />
                    <span className="text-[9px] font-mono text-[#888] w-6 text-right">
                      {Math.round(voiceVol * 100)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
