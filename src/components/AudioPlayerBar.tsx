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
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`; // taste-skill-ignore
  };

  const currentBar = Math.floor(playbackState.currentBeat / (song.metadata.timeSignature[0] || 4)) + 1;
  const currentBeatInBar = (playbackState.currentBeat % (song.metadata.timeSignature[0] || 4)) + 1;

  return (
    <div data-ui="synthesizer-console" className="bg-[#131417] rounded-xl p-5 space-y-5">
      {/* Top Playback Bar: Controls + Scrubber + Volume + Time + Export Button */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Main Transport Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePlayPause}
            className="h-10 px-4 rounded-md bg-[#C5A059] hover:bg-[#E0B86C] text-black flex items-center justify-center font-medium transition-colors active:scale-[0.98]"
            title={playbackState.isPlaying ? 'Jeda (Pause)' : 'Putar Audio (Play)'}
          >
            {playbackState.isPlaying ? (
              <Pause className="w-4 h-4 fill-current mr-1.5" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5 mr-1.5" />
            )}
            <span className="text-xs font-semibold">{playbackState.isPlaying ? 'Jeda' : 'Putar'}</span>
          </button>

          <button
            onClick={handleStop}
            className="h-10 w-10 rounded-md bg-[#1C1D23] hover:bg-[#252730] text-[#E5E7EB] flex items-center justify-center transition-colors active:scale-[0.98]"
            title="Stop & Reset"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
          </button>

          <button
            onClick={handleToggleLoop}
            className={`h-10 w-10 rounded-md flex items-center justify-center transition-colors active:scale-[0.98] ${
              isLooping
                ? 'bg-[#C5A059] text-black font-semibold'
                : 'bg-[#1C1D23] hover:bg-[#252730] text-[#9CA3AF]'
            }`}
            title="Ulangi Lagu (Loop)"
          >
            <Repeat className="w-4 h-4" />
          </button>

          {/* Bar / Beat Counter Display */}
          <div className="hidden sm:flex flex-col items-start bg-[#1C1D23] px-3.5 py-1.5 rounded-md text-xs text-[#E5E7EB]">
            <span className="text-xs text-[#9CA3AF]">Posisi birama</span>
            <span>
              Bar <b className="text-[#C5A059] tabular-nums">{currentBar}</b> · Beat <b className="text-[#E5E7EB] tabular-nums">{currentBeatInBar.toFixed(1)}</b>
            </span>
          </div>
        </div>

        {/* Scrubber Timeline */}
        <div className="flex-1 w-full max-w-lg flex items-center space-x-3">
          <span className="text-xs tabular-nums text-[#9CA3AF] w-12 text-right">
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
              className="w-full h-2 bg-[#252730] rounded-lg appearance-none cursor-pointer accent-[#C5A059] focus:outline-none"
            />
          </div>

          <span className="text-xs tabular-nums text-[#9CA3AF] w-12">
            {formatTime(playbackState.totalDuration)}
          </span>
        </div>

        {/* Volume & Tempo & Export MIDI */}
        <div className="flex items-center space-x-2.5 sm:space-x-3 w-full md:w-auto justify-end flex-wrap gap-y-2">
          {/* Master Volume Slider */}
          <div className="flex items-center bg-[#1C1D23] px-3 py-2 rounded-md space-x-2 text-xs">
            <button
              onClick={handleToggleMasterMute}
              className="text-[#9CA3AF] hover:text-[#C5A059] transition-colors"
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
              className="w-16 sm:w-20 h-1.5 bg-[#2A2C37] rounded appearance-none cursor-pointer accent-[#C5A059] focus:outline-none"
              title={`Master Volume: ${Math.round(masterVolume * 100)}%`}
            />
            <span className="text-xs tabular-nums text-[#9CA3AF] w-8 text-right">
              {Math.round(masterVolume * 100)}%
            </span>
          </div>

          {/* Tempo Speed Pills */}
          <div className="flex items-center bg-[#1C1D23] p-1 rounded-md text-xs">
            <span className="px-2 text-[#9CA3AF] hidden sm:inline">Tempo:</span>
            {[0.75, 1.0, 1.25].map((speed) => (
              <button
                key={speed}
                onClick={() => handleTempoChange(speed)}
                className={`px-2.5 py-1 rounded text-xs tabular-nums font-medium transition ${
                  tempoMultiplier === speed
                    ? 'bg-[#C5A059] text-black font-semibold'
                    : 'text-[#9CA3AF] hover:text-[#E5E7EB]'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Export MIDI Modal Trigger */}
          <button
            onClick={onOpenExportModal}
            className="flex items-center space-x-1.5 bg-[#C5A059] hover:bg-[#E0B86C] text-black font-medium text-xs px-4 py-2 rounded-md transition-colors active:scale-[0.98]"
          >
            <span>Ekspor MIDI</span>
          </button>
        </div>
      </div>

      {/* Voice Mixer Strip (SATB Mute, Solo & Individual Volume) */}
      {song.tracks.length > 0 && (
        <div className="pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#C5A059]">
              <SlidersHorizontal className="w-4 h-4 text-[#C5A059]" />
              <span>Voice Mixer (SATB Channels & Level Volume)</span>
            </div>
            <span className="text-xs text-[#9CA3AF] tabular-nums">
              {song.tracks.length} trek suara aktif
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
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
                  className={`p-3 rounded-lg transition-colors space-y-2.5 ${
                    isMuted
                      ? 'bg-[#0E0F12] opacity-50'
                      : colors.bg
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div
                        className={`h-2.5 w-2.5 rounded-full transition-colors ${
                          hasActiveNote && !isMuted ? colors.activeBg : 'bg-[#2A2C37]'
                        }`}
                      />
                      <div className="truncate">
                        <div className="flex items-center space-x-1">
                          <span className={`font-semibold text-sm ${colors.text}`}>
                            Trek {track.voice}
                          </span>
                        </div>
                        <div className="text-xs text-[#9CA3AF] tabular-nums">
                          {track.notes.filter((n) => !n.pitch.isRest).length} notasi
                        </div>
                      </div>
                    </div>

                    {/* Solo / Mute Buttons */}
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleToggleSolo(track.voice)}
                        className={`text-xs px-2 py-1 rounded transition font-medium ${
                          isSolo
                            ? 'bg-[#C5A059] text-black font-semibold'
                            : 'bg-[#20222A] text-[#9CA3AF] hover:text-[#E5E7EB]'
                        }`}
                        title="Solo suara ini"
                      >
                        S
                      </button>
                      <button
                        onClick={() => handleToggleMute(track.voice)}
                        className={`text-xs px-2 py-1 rounded transition font-medium ${
                          isMuted
                            ? 'bg-[#991B1B] text-white'
                            : 'bg-[#20222A] text-[#9CA3AF] hover:text-[#E5E7EB]'
                        }`}
                        title="Mute / Senyapkan suara ini"
                      >
                        M
                      </button>
                    </div>
                  </div>

                  {/* Channel Volume Slider */}
                  <div className="flex items-center space-x-2 pt-2">
                    <span className="text-xs text-[#9CA3AF]">Vol</span>
                    <input
                      type="range"
                      min="0"
                      max="1.5"
                      step="0.05"
                      value={voiceVol}
                      disabled={isMuted}
                      onChange={(e) => handleTrackVolumeChange(track.voice, parseFloat(e.target.value))}
                      className="flex-1 h-1.5 bg-[#252730] rounded appearance-none cursor-pointer accent-[#C5A059] focus:outline-none disabled:opacity-30"
                      title={`Volume ${track.name}: ${Math.round(voiceVol * 100)}%`}
                    />
                    <span className="text-xs tabular-nums text-[#9CA3AF] w-8 text-right">
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
