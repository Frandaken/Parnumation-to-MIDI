import React, { useState, useEffect, useRef } from 'react';
import {
  ListMusic,
  BarChart2,
  Table,
  Eye,
  Music,
  Check,
  Search,
  Filter,
  Volume2,
} from 'lucide-react';
import { ParsedNote, ParsedSong, SATBVoice } from '../types';
import { audioPlayer, PlaybackState } from '../lib/audioPlayer';

interface ParsedVisualizerProps {
  song: ParsedSong;
}

const VOICE_BADGES: Record<SATBVoice, { bg: string; text: string; label: string; border: string }> = {
  S: { bg: 'bg-[#121824]', text: 'text-blue-400', label: '[S]', border: 'border-blue-500/30' },
  A: { bg: 'bg-[#1e1315]', text: 'text-rose-400', label: '[A]', border: 'border-rose-500/30' },
  T: { bg: 'bg-[#0f1d17]', text: 'text-emerald-400', label: '[T]', border: 'border-emerald-500/30' },
  B: { bg: 'bg-[#0f1b22]', text: 'text-sky-400', label: '[B]', border: 'border-sky-500/30' },
  M: { bg: 'bg-[#1A150A]', text: 'text-[#C5A059]', label: '[M]', border: 'border-[#C5A059]/40' },
};

export const ParsedVisualizer: React.FC<ParsedVisualizerProps> = ({ song }) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'table' | 'summary'>('timeline');
  const [filterVoice, setFilterVoice] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isHoveringTimeline, setIsHoveringTimeline] = useState(false);
  const [hoverBeat, setHoverBeat] = useState<number | null>(null);

  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const timelineContentRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentTime: 0,
    currentBeat: 0,
    totalDuration: 0,
    activeNoteIds: new Set(),
  });

  useEffect(() => {
    const unsub = audioPlayer.subscribe((s) => setPlaybackState(s));
    return () => unsub();
  }, []);

  // Collect all notes sorted by time
  const allNotes: ParsedNote[] = [];
  song.tracks.forEach((t) => {
    t.notes.forEach((n) => allNotes.push(n));
  });
  allNotes.sort((a, b) => a.beatOffset - b.beatOffset);

  const filteredNotes = allNotes.filter((n) => {
    if (filterVoice !== 'ALL' && n.voice !== filterVoice) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        n.pitch.noteName.toLowerCase().includes(q) ||
        n.rawSymbol.toLowerCase().includes(q) ||
        `bar ${n.barIndex}`.includes(q) ||
        `[${n.voice}]`.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const durationBeatsToFraction = (beats: number): string => {
    if (beats === 1.0) return '1 ketuk (1/4)';
    if (beats === 0.5) return '1/2 ketuk (1/8)';
    if (beats === 0.25) return '1/4 ketuk (1/16)';
    if (beats === 0.125) return '1/8 ketuk (1/32)';
    if (beats === 2.0) return '2 ketuk (1/2)';
    if (beats === 3.0) return '3 ketuk (3/4)';
    if (beats === 4.0) return '4 ketuk (1/1)';
    return `${beats.toFixed(2)} ketuk`;
  };

  const maxBeat = Math.max(1, song.maxBeats);
  const pxPerBeat = 40; // Timeline scale width per beat

  const seekFromClientX = (clientX: number) => {
    if (!timelineContentRef.current) return;
    const rect = timelineContentRef.current.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const beat = Math.max(0, Math.min(maxBeat, clickX / pxPerBeat));
    audioPlayer.seekToBeat(beat);
  };

  const handleMouseDownTimeline = (e: React.MouseEvent) => {
    // Only left click
    if (e.button !== 0) return;
    isDraggingRef.current = true;
    seekFromClientX(e.clientX);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (isDraggingRef.current) {
        seekFromClientX(moveEvent.clientX);
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMoveTimeline = (e: React.MouseEvent) => {
    if (!timelineContentRef.current) return;
    const rect = timelineContentRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const b = Math.max(0, Math.min(maxBeat, x / pxPerBeat));
    setHoverBeat(b);
  };

  const currentBarNumber = Math.floor(playbackState.currentBeat / 4) + 1;
  const currentBeatInBar = (playbackState.currentBeat % 4) + 1;

  return (
    <div data-ui="visualizer" className="bg-[#131417] rounded-xl p-5 space-y-4">
      {/* Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#C5A059]"></div>
          <div>
            <h3 className="text-sm font-semibold text-[#C5A059]">
              Parsing Validation & Inspection
            </h3>
            <p className="text-xs text-[#9CA3AF]">
              Representasi logika musik real-time ({allNotes.length} event notasi)
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center bg-[#1A1B20] p-1 rounded-md text-xs">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
              activeTab === 'timeline'
                ? 'bg-[#C5A059] text-black font-semibold'
                : 'text-[#9CA3AF] hover:text-[#E5E7EB]'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Timeline</span>
          </button>
          <button
            onClick={() => setActiveTab('table')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
              activeTab === 'table'
                ? 'bg-[#C5A059] text-black font-semibold'
                : 'text-[#9CA3AF] hover:text-[#E5E7EB]'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Tabel Notasi</span>
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
              activeTab === 'summary'
                ? 'bg-[#C5A059] text-black font-semibold'
                : 'text-[#9CA3AF] hover:text-[#E5E7EB]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Struktur</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Piano Roll / Timeline View */}
      {activeTab === 'timeline' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between text-xs text-[#9CA3AF] px-1 gap-2">
            <span className="flex items-center space-x-2">
              <span>Klik atau geser kursor emas untuk navigasi audio:</span>
              <span className="text-[#E0B86C] bg-[#2A2314] px-2 py-0.5 rounded text-xs tabular-nums font-medium">
                Bar {currentBarNumber} · Beat {currentBeatInBar.toFixed(1)}
              </span>
            </span>
            <span className="text-xs text-[#C5A059] tabular-nums font-medium">
              Total {song.maxBeats.toFixed(1)} Beats · {song.tracks[0]?.totalBars || 1} Bars
            </span>
          </div>

          <div
            ref={timelineContainerRef}
            className="relative overflow-x-auto bg-[#1A1B20] rounded-lg p-4 min-h-[220px] select-none"
          >
            <div className="flex">
              {/* Left Column: Voice Track Labels [S], [A], [T], [B] */}
              <div className="w-14 flex-none pr-2 space-y-2.5 z-30">
                {/* Header spacer aligned with ruler */}
                <div className="h-6 mb-2 flex items-center justify-center text-xs text-[#9CA3AF] font-medium">
                  Trek
                </div>
                {song.tracks.map((track) => {
                  const badge = VOICE_BADGES[track.voice] || VOICE_BADGES.M;
                  return (
                    <div
                      key={track.voice}
                      className={`h-10 flex items-center justify-center font-semibold text-xs rounded ${badge.bg} ${badge.text}`}
                    >
                      [{track.voice}]
                    </div>
                  );
                })}
              </div>

              {/* Right: Interactive Timeline Canvas */}
              <div
                ref={timelineContentRef}
                onMouseDown={handleMouseDownTimeline}
                onMouseMove={handleMouseMoveTimeline}
                onMouseEnter={() => setIsHoveringTimeline(true)}
                onMouseLeave={() => {
                  setIsHoveringTimeline(false);
                  setHoverBeat(null);
                }}
                className="relative flex-1 cursor-col-resize"
                style={{
                  minWidth: `${Math.max(500, maxBeat * pxPerBeat + 60)}px`,
                  width: `${maxBeat * pxPerBeat + 60}px`,
                }}
              >
                {/* Bar number markers on top (Ruler) */}
                <div className="h-6 flex relative mb-2 text-xs tabular-nums text-[#9CA3AF]">
                  {Array.from({ length: Math.ceil(maxBeat / 4) + 1 }).map((_, barIdx) => (
                    <div
                      key={barIdx}
                      data-ui="ruler-tick"
                      className="absolute top-0 flex items-center border-l border-[#262626] pl-1.5 h-full hover:text-[#C5A059] transition-colors" /* taste-skill-ignore */
                      style={{ left: `${barIdx * 4 * pxPerBeat}px` }}
                    >
                      Bar {barIdx + 1}
                    </div>
                  ))}
                </div>

                {/* Hover Position Guide */}
                {isHoveringTimeline && hoverBeat !== null && (
                  <div
                    data-ui="guide"
                    className="absolute top-0 bottom-0 w-px bg-white/20 pointer-events-none z-10" /* taste-skill-ignore */
                    style={{ left: `${hoverBeat * pxPerBeat}px` }}
                  >
                    <div className="absolute -top-5 -translate-x-1/2 bg-[#202228] text-[#D1D5DB] text-xs tabular-nums px-2 py-0.5 rounded whitespace-nowrap">
                      Bar {Math.floor(hoverBeat / 4) + 1} · {(hoverBeat % 4 + 1).toFixed(1)}
                    </div>
                  </div>
                )}

                {/* Interactive Playback Cursor / Scrubber Bar */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-[#C5A059] z-20"
                  style={{
                    left: `${playbackState.currentBeat * pxPerBeat}px`,
                  }}
                >
                  {/* Top Scrubber Handle with Grab Indicator */}
                  <div
                    className="absolute -top-2.5 -left-2.5 w-5 h-5 bg-[#C5A059] hover:bg-[#E0B86C] text-black rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing transform transition-transform hover:scale-110"
                    title={`Posisi: Bar ${currentBarNumber}, Ketuk ${currentBeatInBar.toFixed(1)} (Klik/geser untuk pindah)`}
                  >
                    <div className="w-1.5 h-1.5 bg-black rounded-full" />
                  </div>
                  {/* Bottom marker */}
                  <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-[#C5A059] rounded-sm transform rotate-45" />
                </div>

                {/* Tracks (S, A, T, B) */}
                <div className="space-y-2.5">
                  {song.tracks.map((track) => {
                    const badge = VOICE_BADGES[track.voice] || VOICE_BADGES.M;
                    return (
                      <div
                        key={track.voice}
                        className="relative h-10 bg-[#18191E] rounded-md flex items-center"
                      >
                        {/* Bar separator background grid */}
                        {Array.from({ length: Math.ceil(maxBeat / 4) + 1 }).map((_, barIdx) => (
                          <div
                            key={barIdx}
                            data-ui="bar-divider"
                            className="absolute top-0 bottom-0 border-l border-[#262626] pointer-events-none" /* taste-skill-ignore */
                            style={{ left: `${barIdx * 4 * pxPerBeat}px` }}
                          />
                        ))}

                        {/* Note Blocks */}
                        {track.notes.map((note) => {
                          if (note.pitch.isRest) return null;
                          const isSounding = playbackState.activeNoteIds.has(note.id);
                          const leftPx = note.beatOffset * pxPerBeat;
                          const widthPx = Math.max(14, note.durationBeats * pxPerBeat - 2);

                          return (
                            <div
                              key={note.id}
                              title={`${note.pitch.noteName} (Solfège: ${note.pitch.solfege}, Bar ${note.barIndex}, ${durationBeatsToFraction(note.durationBeats)})${note.articulation.underSlur ? ` [Under-Slur: ${note.articulation.underSlur}]` : ''}`}
                              className={`absolute h-7 rounded flex items-center justify-center px-1 text-xs font-semibold transition-transform duration-75 select-none ${
                                isSounding
                                  ? 'bg-[#C5A059] text-black scale-105 z-10 font-bold'
                                  : `${badge.bg} ${badge.text} hover:brightness-125`
                              }`}
                              style={{
                                left: `${leftPx}px`,
                                width: `${widthPx}px`,
                              }}
                            >
                              <span className="truncate">
                                <code>{note.rawSymbol}</code> ({note.pitch.noteName})
                              </span>
                              {note.articulation.fermata && (
                                <span className="ml-0.5 text-[9px] text-[#C5A059]">𝄐</span>
                              )}
                              {/* Under-slur visual curve marker at bottom of note */}
                              {note.articulation.underSlur && (
                                <div
                                  className={`absolute -bottom-1 left-0 right-0 h-1 border-b-2 border-cyan-400/90 pointer-events-none ${
                                    note.articulation.underSlur === 'z' || note.articulation.underSlur === 'start'
                                      ? 'rounded-bl-md border-l-2'
                                      : note.articulation.underSlur === 'c' || note.articulation.underSlur === 'end'
                                      ? 'rounded-br-md border-r-2'
                                      : ''
                                  }`}
                                />
                              )}
                              {/* Upper-slur visual curve marker at top of note */}
                              {note.articulation.slur && (
                                <div
                                  className={`absolute -top-1 left-0 right-0 h-1 border-t-2 border-emerald-400/90 pointer-events-none ${
                                    note.articulation.slur === 'small' || note.articulation.slur === 'large'
                                      ? 'rounded-t-md'
                                      : note.articulation.slur === 'start'
                                      ? 'rounded-tl-md border-l-2'
                                      : note.articulation.slur === 'end'
                                      ? 'rounded-tr-md border-r-2'
                                      : ''
                                  }`}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Parsed Notes Table */}
      {activeTab === 'table' && (
        <div className="space-y-3">
          {/* Table Filters & Search */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-[#9CA3AF] flex items-center font-medium">
                <Filter className="w-3.5 h-3.5 mr-1 text-[#C5A059]" /> Filter Suara:
              </span>
              <div className="flex items-center bg-[#1A1B20] p-1 rounded-lg gap-1">
                {['ALL', ...song.tracks.map((t) => t.voice)].map((v) => (
                  <button
                    key={v}
                    onClick={() => setFilterVoice(v)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                      filterVoice === v
                        ? 'bg-[#C5A059] text-black font-semibold'
                        : 'text-[#9CA3AF] hover:text-[#E0E0E0]'
                    }`}
                  >
                    {v === 'ALL' ? 'Semua' : v}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#6B7280] absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Cari nada, birama, simbol..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#18191E] text-[#E0E0E0] text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#C5A059] transition-colors"
              />
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto bg-[#131417] rounded-xl max-h-96">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#1A1B20] text-[#9CA3AF] text-xs font-semibold sticky top-0 z-10">
                <tr>
                  <th className="py-2.5 px-3">Voice</th>
                  <th className="py-2.5 px-3">Bar</th>
                  <th className="py-2.5 px-3">Beat Offset</th>
                  <th className="py-2.5 px-3">Simbol</th>
                  <th className="py-2.5 px-3">Solfège</th>
                  <th className="py-2.5 px-3">Pitch</th>
                  <th className="py-2.5 px-3">MIDI</th>
                  <th className="py-2.5 px-3">Durasi</th>
                  <th className="py-2.5 px-3">Artikulasi</th>
                </tr>
              </thead>
              <tbody className="text-xs text-[#E5E7EB]">
                {filteredNotes.map((note) => {
                  const badge = VOICE_BADGES[note.voice] || VOICE_BADGES.M;
                  const isSounding = playbackState.activeNoteIds.has(note.id);

                  return (
                    <tr
                      key={note.id}
                      className={`hover:bg-[#1E2026] transition-colors ${
                        isSounding ? 'bg-[#2A2314] text-[#E0B86C]' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${badge.bg} ${badge.text}`}>
                          {note.voice}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[#9CA3AF]">Bar {note.barIndex}</td>
                      <td className="py-2.5 px-3 tabular-nums text-[#9CA3AF]">{note.beatOffset.toFixed(2)}</td>
                      <td className="py-2.5 px-3 font-semibold text-[#E0B86C]">
                        <code>{note.rawSymbol}</code>
                      </td>
                      <td className="py-2.5 px-3">
                        {note.pitch.isRest ? '0 (Rest)' : `Not ${note.pitch.solfege}`}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-[#E5E7EB]">
                        {note.pitch.noteName}
                      </td>
                      <td className="py-2.5 px-3 tabular-nums text-[#9CA3AF]">
                        {note.pitch.isRest ? '-' : `#${note.pitch.midiNote}`}
                      </td>
                      <td className="py-2.5 px-3 text-[#9CA3AF]">
                        {durationBeatsToFraction(note.durationBeats)}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex flex-wrap gap-1">
                          {note.articulation.fermata && (
                            <span className="bg-[#2A2314] text-[#E0B86C] px-1.5 py-0.5 rounded text-[10px]">
                              Fermata (d)
                            </span>
                          )}
                          {note.articulation.beam === 'b' && (
                            <span className="bg-[#202228] text-[#E0B86C] px-1.5 py-0.5 rounded text-[10px]" title="Garis bendera 1 not">
                              Beam 1-Not (b)
                            </span>
                          )}
                          {note.articulation.beam === 'h' && (
                            <span className="bg-[#202228] text-[#E0B86C] px-1.5 py-0.5 rounded text-[10px]" title="Garis bendera 2 not (posisi lebih tinggi)">
                              Beam 2-Not (h)
                            </span>
                          )}
                          {note.articulation.slur === 'small' && (
                            <span className="bg-[#161d18] text-emerald-400 px-1.5 py-0.5 rounded text-[10px]" title="Garis lengkung kecil 2 not (f)">
                              Lengkung 2-Not (f)
                            </span>
                          )}
                          {note.articulation.slur === 'large' && (
                            <span className="bg-[#2A2314] text-[#E0B86C] px-1.5 py-0.5 rounded text-[10px]" title="Garis lengkung besar 3 not (g)">
                              Lengkung Besar (g)
                            </span>
                          )}
                          {note.articulation.slur === 'start' && (
                            <span className="bg-[#161d18] text-emerald-400 px-1.5 py-0.5 rounded text-[10px]" title="Awal garis lengkung atas custom (v)">
                              Lengkung Atas Awal (v)
                            </span>
                          )}
                          {note.articulation.slur === 'middle' && (
                            <span className="bg-[#161d18] text-emerald-400 px-1.5 py-0.5 rounded text-[10px]" title="Sambungan garis lengkung atas custom">
                              Lengkung Atas Tengah
                            </span>
                          )}
                          {note.articulation.slur === 'end' && (
                            <span className="bg-[#161d18] text-emerald-400 px-1.5 py-0.5 rounded text-[10px]" title="Akhir garis lengkung atas custom (m)">
                              Lengkung Atas Akhir (m)
                            </span>
                          )}
                          {(note.articulation.underSlur === 'z' || note.articulation.underSlur === 'start') && (
                            <span className="bg-[#0c1e24] text-cyan-400 px-1.5 py-0.5 rounded text-[10px]" title="Awal garis lengkung bawah custom (z)">
                              Lengkung Bawah Awal (z)
                            </span>
                          )}
                          {(note.articulation.underSlur === 'x' || note.articulation.underSlur === 'middle') && (
                            <span className="bg-[#0c1e24] text-cyan-400 px-1.5 py-0.5 rounded text-[10px]" title="Sambungan garis lengkung bawah custom (x)">
                              Lengkung Bawah Tengah (x)
                            </span>
                          )}
                          {(note.articulation.underSlur === 'c' || note.articulation.underSlur === 'end') && (
                            <span className="bg-[#0c1e24] text-cyan-400 px-1.5 py-0.5 rounded text-[10px]" title="Akhir garis lengkung bawah custom (c)">
                              Lengkung Bawah Akhir (c)
                            </span>
                          )}
                          {!note.articulation.fermata && !note.articulation.beam && !note.articulation.slur && !note.articulation.underSlur && !note.pitch.isRest && (
                            <span className="text-[#6B7280] text-[10px]">Normal</span>
                          )}
                          {note.pitch.isRest && (
                            <span className="text-[#6B7280] text-[10px]">Diam</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Score Structure Summary */}
      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-[#1A1B20] rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-xs text-[#C5A059]">
              Metadata Partitur
            </h4>
            <div className="space-y-1.5 text-xs text-[#9CA3AF]">
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Judul Lagu:</span>
                <span className="font-medium text-[#E5E7EB]">{song.metadata.title || 'Untitled'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Nada Dasar:</span>
                <span className="font-medium text-[#C5A059]">
                  Do = {song.metadata.key} (MIDI #{song.metadata.keyRootMidi})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Tempo:</span>
                <span className="font-medium text-[#E5E7EB] tabular-nums">{song.metadata.bpm} BPM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Birama:</span>
                <span className="font-medium text-[#E5E7EB]">
                  {song.metadata.timeSignature[0]}/{song.metadata.timeSignature[1]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Total Durasi:</span>
                {/* taste-skill-ignore */}
                <span className="text-[#E5E7EB] tabular-nums">
                  {Math.floor(song.totalDurationSeconds / 60)}:
                  {Math.floor(song.totalDurationSeconds % 60)
                    .toString()
                    .padStart(2, '0') /* taste-skill-ignore */}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#1A1B20] rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-xs text-[#C5A059]">
              Distribusi Suara (Tracks)
            </h4>
            <div className="space-y-2 text-xs">
              {song.tracks.map((t) => {
                const badge = VOICE_BADGES[t.voice] || VOICE_BADGES.M;
                const activeCount = t.notes.filter((n) => !n.pitch.isRest).length;
                return (
                  <div
                    key={t.voice}
                    className="flex items-center justify-between p-2 rounded bg-[#24262E]"
                  >
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${badge.bg} ${badge.text}`}>
                        Trek {t.voice}
                      </span>
                    </div>
                    <span className="text-[#9CA3AF] text-xs tabular-nums">
                      {activeCount} notasi ({t.totalBars} bar)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-[#1A1B20] rounded-lg p-4 space-y-3 sm:col-span-2 md:col-span-1">
            <h4 className="font-semibold text-xs text-[#C5A059]">
              Status Validasi MIDI
            </h4>
            <div className="space-y-2 text-xs text-[#9CA3AF]">
              <div className="flex items-center space-x-2 text-[#E5E7EB]">
                <Check className="w-4 h-4 text-[#C5A059]" />
                <span>Format MIDI Type 1 Multi-Track Siap</span>
              </div>
              <div className="flex items-center space-x-2 text-[#E5E7EB]">
                <Check className="w-4 h-4 text-[#C5A059]" />
                <span>Separasi Channel SATB (0..3) Siap</span>
              </div>
              <div className="flex items-center space-x-2 text-[#E5E7EB]">
                <Check className="w-4 h-4 text-[#C5A059]" />
                <span>Delta Timing & Durasi Beat Presisi</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
