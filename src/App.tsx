import React, { useState, useMemo, useCallback, Suspense } from 'react';
import { Navbar } from './components/Navbar';
import { EditorSection } from './components/EditorSection';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { ParsedVisualizer } from './components/ParsedVisualizer';
import { parseParnumation } from './lib/parser';
import { PRESET_SONGS } from './lib/presets';
import { PresetSong, SongMetadata } from './types';

// Lazy-load heavier modal components on-demand to optimize bundle splitting
const MidiExportModal = React.lazy(() =>
  import('./components/MidiExportModal').then((m) => ({ default: m.MidiExportModal }))
);
const CheatsheetModal = React.lazy(() =>
  import('./components/CheatsheetModal').then((m) => ({ default: m.CheatsheetModal }))
);
const NoteGeneratorModal = React.lazy(() =>
  import('./components/NoteGeneratorModal').then((m) => ({ default: m.NoteGeneratorModal }))
);

export default function App() {
  const [text, setText] = useState<string>(() => PRESET_SONGS[0].text);
  const [metadataOverrides, setMetadataOverrides] = useState<Partial<SongMetadata>>({});
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isCheatsheetOpen, setIsCheatsheetOpen] = useState<boolean>(false);
  const [isNoteGeneratorOpen, setIsNoteGeneratorOpen] = useState<boolean>(false);

  // Parse the song dynamically
  const parsedSong = useMemo(() => {
    return parseParnumation(text, metadataOverrides);
  }, [text, metadataOverrides]);

  const handleMetadataChange = useCallback((newMeta: Partial<SongMetadata>) => {
    setMetadataOverrides((prev) => ({ ...prev, ...newMeta }));
  }, []);

  const handleSelectPreset = (preset: PresetSong) => {
    setText(preset.text);
    setMetadataOverrides({});
  };

  const handleReset = () => {
    if (window.confirm('Kosongkan teks partitur?')) {
      setText('');
      setMetadataOverrides({});
    }
  };

  const handleInsertText = useCallback((insertedText: string) => {
    setText((prev) => {
      const trimmed = prev.trimEnd();
      if (!trimmed) return insertedText;
      return `${trimmed}\n\n${insertedText}`;
    });
  }, []);

  const detectedVoices = useMemo(() => {
    return parsedSong.tracks.map((t) => t.voice);
  }, [parsedSong]);

  return (
    <div className="min-h-dvh bg-[#0C0D0F] text-[#E5E7EB] flex flex-col font-sans selection:bg-[#C5A059] selection:text-black">
      {/* Top Navigation */}
      <Navbar
        onSelectPreset={handleSelectPreset}
        onOpenCheatsheet={() => setIsCheatsheetOpen(true)}
        onOpenNoteGenerator={() => setIsNoteGeneratorOpen(true)}
        onReset={handleReset}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Fixed or Sticky Audio Synthesizer Player Bar */}
        <AudioPlayerBar
          song={parsedSong}
          onOpenExportModal={() => setIsExportModalOpen(true)}
        />

        {/* Workspace Grid: Editor & Visualizer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Parnumation Input & Metadata Controls */}
          <div className="lg:col-span-6 space-y-6">
            <EditorSection
              text={text}
              onChangeText={setText}
              metadata={parsedSong.metadata}
              onChangeMetadata={handleMetadataChange}
              onParse={() => {}}
              detectedVoices={detectedVoices}
              warnings={parsedSong.warnings}
              onOpenNoteGenerator={() => setIsNoteGeneratorOpen(true)}
            />
          </div>

          {/* Right Column: Visualizer, Timeline & Table */}
          <div className="lg:col-span-6 space-y-6">
            <ParsedVisualizer song={parsedSong} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#080809] py-5 text-center text-xs text-[#6B7280]">
        <p className="tracking-normal">
          Parnumation to MIDI Engine · Notasi Angka QWERTY · Multi-Track SATB · Web Audio Synthesizer
        </p>
      </footer>

      {/* Modals loaded lazily on demand */}
      <Suspense fallback={null}>
        {isExportModalOpen && (
          <MidiExportModal
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
            song={parsedSong}
          />
        )}

        {isCheatsheetOpen && (
          <CheatsheetModal
            isOpen={isCheatsheetOpen}
            onClose={() => setIsCheatsheetOpen(false)}
          />
        )}

        {isNoteGeneratorOpen && (
          <NoteGeneratorModal
            isOpen={isNoteGeneratorOpen}
            onClose={() => setIsNoteGeneratorOpen(false)}
            currentSongKey={parsedSong.metadata.key}
            onInsertText={handleInsertText}
          />
        )}
      </Suspense>
    </div>
  );
}
