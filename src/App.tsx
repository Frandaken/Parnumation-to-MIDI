import React, { useState, useMemo, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { EditorSection } from './components/EditorSection';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { ParsedVisualizer } from './components/ParsedVisualizer';
import { MidiExportModal } from './components/MidiExportModal';
import { CheatsheetModal } from './components/CheatsheetModal';
import { NoteGeneratorModal } from './components/NoteGeneratorModal';
import { parseParnumation, DEFAULT_METADATA } from './lib/parser';
import { PRESET_SONGS } from './lib/presets';
import { PresetSong, SongMetadata, SATBVoice } from './types';

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
    <div className="min-h-screen bg-[#0D0D0D] text-[#E0E0E0] flex flex-col font-sans selection:bg-[#C5A059] selection:text-black">
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
      <footer className="border-t border-[#222] bg-[#0A0A0A] py-4 text-center text-xs text-[#707070]">
        <p className="tracking-wide">
          PARNUMATION TO MIDI ENGINE &mdash; Notasi Angka QWERTY &bull; Multi-Track SATB &bull; Web Audio Synthesizer
        </p>
      </footer>

      {/* Modals */}
      <MidiExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        song={parsedSong}
      />

      <CheatsheetModal
        isOpen={isCheatsheetOpen}
        onClose={() => setIsCheatsheetOpen(false)}
      />

      <NoteGeneratorModal
        isOpen={isNoteGeneratorOpen}
        onClose={() => setIsNoteGeneratorOpen(false)}
        currentSongKey={parsedSong.metadata.key}
        onInsertText={handleInsertText}
      />
    </div>
  );
}
