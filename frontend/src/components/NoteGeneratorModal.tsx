import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Volume2,
  Copy,
  Check,
  Music,
  ArrowRightLeft,
  Table,
  Wand2,
  Sparkles,
  Play,
  Key,
  Info,
  CornerDownRight,
} from 'lucide-react';
import {
  ROOT_KEY_OPTIONS,
  CHROMATIC_PITCHES,
  SOLFEGE_STEPS,
  convertPitchToSolfege,
  convertSolfegeToPitch,
  getChromaticScaleForRoot,
  generatePredefinedPatterns,
  calculateMidiAndFreq,
  getRootKeySemitone,
} from '../lib/noteGenerator';
import { audioPlayer } from '../lib/audioPlayer';

interface NoteGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSongKey: string;
  onInsertText?: (textToInsert: string) => void;
}

type GeneratorTab = 'pitch-to-solfege' | 'solfege-to-pitch' | 'scale-matrix' | 'patterns';

export const NoteGeneratorModal: React.FC<NoteGeneratorModalProps> = ({
  isOpen,
  onClose,
  currentSongKey,
  onInsertText,
}) => {
  const [selectedRootKey, setSelectedRootKey] = useState<string>(currentSongKey || 'F');
  const [activeTab, setActiveTab] = useState<GeneratorTab>('pitch-to-solfege');

  // Tab 1 state: Pitch to Solfège
  const [selectedPitch, setSelectedPitch] = useState<string>('C#');
  const [pitchOctave, setPitchOctave] = useState<number>(4);

  // Tab 2 state: Solfège to Pitch
  const [selectedSolfege, setSelectedSolfege] = useState<string>('2');
  const [solfegeOctaveShift, setSolfegeOctaveShift] = useState<number>(0); // -1 (low), 0 (middle), +1 (high)

  // Feedback notifications
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [insertedFeedback, setInsertedFeedback] = useState<string | null>(null);

  // Sync with current song key when opened
  useEffect(() => {
    if (currentSongKey && isOpen) {
      setSelectedRootKey(currentSongKey);
    }
  }, [currentSongKey, isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleInsert = (text: string, label: string) => {
    if (onInsertText) {
      onInsertText(text);
      setInsertedFeedback(label);
      setTimeout(() => setInsertedFeedback(null), 2000);
    }
  };

  // Conversions
  const pitchToSolfegeResult = useMemo(() => {
    return convertPitchToSolfege(selectedPitch, selectedRootKey, pitchOctave);
  }, [selectedPitch, selectedRootKey, pitchOctave]);

  const solfegeToPitchResult = useMemo(() => {
    return convertSolfegeToPitch(selectedSolfege, selectedRootKey, 4 + solfegeOctaveShift);
  }, [selectedSolfege, selectedRootKey, solfegeOctaveShift]);

  const chromaticScale = useMemo(() => {
    return getChromaticScaleForRoot(selectedRootKey, 4);
  }, [selectedRootKey]);

  const patterns = useMemo(() => {
    return generatePredefinedPatterns(selectedRootKey);
  }, [selectedRootKey]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0D0D0D] border border-[#2A2A2A] rounded-xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:px-6 sm:py-4 border-b border-[#222] flex items-center justify-between bg-[#111111] flex-none">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#C5A059]/15 border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-semibold text-white font-serif tracking-wide">
                  NOT GENERATOR &amp; SOLFÈGE CALCULATOR
                </h2>
                <span className="bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/40 text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold">
                  Do = {selectedRootKey}
                </span>
              </div>
              <p className="text-[11px] text-[#888]">
                Konversi instan Not Balok (Pitch) &harr; Not Angka (Solfège), Tangga Nada Kromatis, dan Generator Pola
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#888] hover:text-white hover:bg-[#222] transition"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Root Key (Do = ...) Selector Bar */}
        <div className="bg-[#141414] border-b border-[#222] px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2.5 flex-none">
          <div className="flex items-center space-x-2">
            <Key className="w-3.5 h-3.5 text-[#C5A059]" />
            <span className="text-xs uppercase font-bold text-[#AAA] tracking-wider">
              Pilih Nada Dasar (Do =):
            </span>
          </div>

          <div className="flex flex-wrap gap-1">
            {ROOT_KEY_OPTIONS.map((k) => (
              <button
                key={k}
                onClick={() => setSelectedRootKey(k)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition ${
                  selectedRootKey.toUpperCase() === k.toUpperCase()
                    ? 'bg-[#C5A059] text-black shadow-md shadow-[#C5A059]/20'
                    : 'bg-[#1C1C1C] text-[#888] hover:text-white hover:bg-[#282828] border border-[#2A2A2A]'
                }`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#222] bg-[#0F0F0F] px-4 sm:px-6 overflow-x-auto flex-none">
          <button
            onClick={() => setActiveTab('pitch-to-solfege')}
            className={`flex items-center space-x-2 py-3 px-3.5 text-xs font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'pitch-to-solfege'
                ? 'border-[#C5A059] text-[#C5A059] bg-[#C5A059]/5 font-semibold'
                : 'border-transparent text-[#888] hover:text-[#E0E0E0]'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Not Balok &rarr; Not Angka (Misal C# di Do=F)</span>
          </button>

          <button
            onClick={() => setActiveTab('solfege-to-pitch')}
            className={`flex items-center space-x-2 py-3 px-3.5 text-xs font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'solfege-to-pitch'
                ? 'border-[#C5A059] text-[#C5A059] bg-[#C5A059]/5 font-semibold'
                : 'border-transparent text-[#888] hover:text-[#E0E0E0]'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Not Angka &rarr; Not Balok (Misal Re di Do=F)</span>
          </button>

          <button
            onClick={() => setActiveTab('scale-matrix')}
            className={`flex items-center space-x-2 py-3 px-3.5 text-xs font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'scale-matrix'
                ? 'border-[#C5A059] text-[#C5A059] bg-[#C5A059]/5 font-semibold'
                : 'border-transparent text-[#888] hover:text-[#E0E0E0]'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Tabel Matriks 12 Nada (Do = {selectedRootKey})</span>
          </button>

          <button
            onClick={() => setActiveTab('patterns')}
            className={`flex items-center space-x-2 py-3 px-3.5 text-xs font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'patterns'
                ? 'border-[#C5A059] text-[#C5A059] bg-[#C5A059]/5 font-semibold'
                : 'border-transparent text-[#888] hover:text-[#E0E0E0]'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Generator Pola Partitur</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Notification feedback */}
          {insertedFeedback && (
            <div className="bg-[#1A150A] border border-[#C5A059] rounded-lg p-2.5 text-xs text-[#C5A059] flex items-center justify-between animate-fadeIn">
              <span className="flex items-center space-x-2">
                <Check className="w-4 h-4" />
                <span>Berhasil menyisipkan <strong>{insertedFeedback}</strong> ke editor partitur!</span>
              </span>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 1: PITCH (NOT BALOK) -> SOLFÈGE (NOT ANGKA) */}
          {/* ============================================================ */}
          {activeTab === 'pitch-to-solfege' && (
            <div className="space-y-6">
              {/* Context Explanation */}
              <div className="bg-[#141414] border border-[#222] rounded-lg p-4 flex items-start space-x-3">
                <Info className="w-4 h-4 text-[#C5A059] flex-shrink-0 mt-0.5" />
                <div className="text-xs text-[#AAA] space-y-1">
                  <p>
                    <strong className="text-white">Pertanyaan Contoh:</strong> &quot;Not <strong>C#</strong> itu not angka apa jika <strong>Do = {selectedRootKey}</strong>?&quot;
                  </p>
                  <p className="text-[11px] text-[#777]">
                    Pilih nama not balok mutlak di bawah untuk mengetahui angka solfège, tanda kres/mol, dan simbol keyboard Parnumation.
                  </p>
                </div>
              </div>

              {/* Interactive Pitch Selector Keyboard */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#888]">
                  1. Pilih Not Balok / Pitch:
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-1.5">
                  {CHROMATIC_PITCHES.map((p) => {
                    const isSelected = selectedPitch.toUpperCase() === p.name.toUpperCase();
                    return (
                      <button
                        key={p.name}
                        onClick={() => {
                          setSelectedPitch(p.name);
                          const { midi } = calculateMidiAndFreq(p.semitone, pitchOctave);
                          audioPlayer.playSingleTone(midi);
                        }}
                        className={`p-2.5 rounded-lg text-center flex flex-col items-center justify-center transition border ${
                          isSelected
                            ? 'bg-[#C5A059] text-black border-[#C5A059] font-bold shadow-lg shadow-[#C5A059]/20 scale-105 z-10'
                            : p.isSharpOrFlat
                            ? 'bg-[#181818] hover:bg-[#242424] text-[#E0E0E0] border-[#2A2A2A]'
                            : 'bg-[#1F1F1F] hover:bg-[#2B2B2B] text-white border-[#333]'
                        }`}
                      >
                        <span className="text-sm font-mono font-bold">{p.name}</span>
                        {p.isSharpOrFlat && (
                          <span className={`text-[9px] font-mono ${isSelected ? 'text-black/70' : 'text-[#777]'}`}>
                            {p.enharmonic}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Octave Selector */}
                <div className="flex items-center space-x-2 pt-2 text-xs text-[#888]">
                  <span>Pilih Oktaf:</span>
                  {[3, 4, 5].map((oct) => (
                    <button
                      key={oct}
                      onClick={() => setPitchOctave(oct)}
                      className={`px-2.5 py-0.5 rounded text-xs font-mono transition ${
                        pitchOctave === oct
                          ? 'bg-[#C5A059] text-black font-bold'
                          : 'bg-[#1C1C1C] text-[#888] hover:text-white'
                      }`}
                    >
                      Oktaf {oct} ({oct === 4 ? 'Tengah' : oct === 3 ? 'Rendah' : 'Tinggi'})
                    </button>
                  ))}
                </div>
              </div>

              {/* Conversion Result Showcase Card */}
              <div className="bg-gradient-to-br from-[#161616] to-[#111111] border border-[#C5A059]/50 rounded-xl p-5 sm:p-6 space-y-5 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2A2A2A] pb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#888]">
                      Hasil Kalkulasi Notasi
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-white font-serif flex items-center space-x-2">
                      <span>Not {pitchToSolfegeResult.pitchName}</span>
                      <span className="text-sm font-sans font-normal text-[#888]">&bull; Do = {pitchToSolfegeResult.rootKey}</span>
                    </h3>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => audioPlayer.playSingleTone(pitchToSolfegeResult.midiNote)}
                      className="flex items-center space-x-1.5 bg-[#C5A059] hover:bg-[#E0B86C] text-black font-bold text-xs px-3.5 py-2 rounded-lg transition shadow cursor-pointer"
                      title="Dengarkan Nada Ini"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>Dengarkan ({pitchToSolfegeResult.fullNoteName})</span>
                    </button>
                  </div>
                </div>

                {/* Primary Metric Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Metric 1: Not Angka & Solfège */}
                  <div className="bg-[#0D0D0D] border border-[#262626] rounded-lg p-3.5 space-y-1">
                    <div className="text-[10px] font-mono uppercase text-[#888]">Not Angka / Solfège</div>
                    <div className="text-2xl font-bold font-mono text-[#C5A059]">
                      {pitchToSolfegeResult.parnumation}
                    </div>
                    <div className="text-xs font-semibold text-[#E0E0E0]">
                      {pitchToSolfegeResult.solfegeSharp}
                    </div>
                    <div className="text-[10px] text-[#707070]">
                      {pitchToSolfegeResult.isDiatonic ? 'Nada Diatonis Utama' : 'Nada Kromatis (Kres/Mol)'}
                    </div>
                  </div>

                  {/* Metric 2: Simbol Keyboard Parnumation */}
                  <div className="bg-[#0D0D0D] border border-[#262626] rounded-lg p-3.5 space-y-1">
                    <div className="text-[10px] font-mono uppercase text-[#888]">Simbol Keyboard Parnumation</div>
                    <div className="text-xl font-bold font-mono text-emerald-400">
                      {pitchToSolfegeResult.parnumation} <span className="text-xs text-[#777] font-normal">(Tengah)</span>
                    </div>
                    <div className="text-xs font-mono text-[#AAA]">
                      Tinggi: <span className="text-[#C5A059] font-bold">{pitchToSolfegeResult.parnumationHigh}</span> &bull; Rendah: <span className="text-sky-400 font-bold">{pitchToSolfegeResult.parnumationLow}</span>
                    </div>
                    <div className="text-[10px] text-[#707070]">
                      Ketik langsung di teks partitur
                    </div>
                  </div>

                  {/* Metric 3: Interval dari Do */}
                  <div className="bg-[#0D0D0D] border border-[#262626] rounded-lg p-3.5 space-y-1">
                    <div className="text-[10px] font-mono uppercase text-[#888]">Interval dari Tonika (Do)</div>
                    <div className="text-base font-bold text-white">
                      +{pitchToSolfegeResult.semitoneOffset} Semitone
                    </div>
                    <div className="text-xs text-[#AAA] truncate" title={pitchToSolfegeResult.intervalName}>
                      {pitchToSolfegeResult.intervalName}
                    </div>
                    <div className="text-[10px] text-[#707070]">
                      Jarak dari nada {pitchToSolfegeResult.rootKey}
                    </div>
                  </div>

                  {/* Metric 4: Detail Akustik & MIDI */}
                  <div className="bg-[#0D0D0D] border border-[#262626] rounded-lg p-3.5 space-y-1">
                    <div className="text-[10px] font-mono uppercase text-[#888]">Spesifikasi Akustik</div>
                    <div className="text-base font-mono font-bold text-sky-400">
                      {pitchToSolfegeResult.frequencyHz.toFixed(2)} Hz
                    </div>
                    <div className="text-xs font-mono text-[#AAA]">
                      MIDI Note: #{pitchToSolfegeResult.midiNote}
                    </div>
                    <div className="text-[10px] text-[#707070]">
                      Enharmonik: {pitchToSolfegeResult.enharmonic}
                    </div>
                  </div>
                </div>

                {/* Quick Insert & Copy Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center space-x-2 text-xs text-[#888]">
                    <span>Aksi Cepat:</span>
                    <button
                      onClick={() => copyToClipboard(pitchToSolfegeResult.parnumation, 'copy-parn')}
                      className="flex items-center space-x-1 bg-[#1C1C1C] hover:bg-[#282828] border border-[#333] px-3 py-1.5 rounded text-[#E0E0E0] transition"
                    >
                      {copiedKey === 'copy-parn' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#C5A059]" />}
                      <span>Salin Simbol ({pitchToSolfegeResult.parnumation})</span>
                    </button>

                    <button
                      onClick={() => copyToClipboard(`${pitchToSolfegeResult.pitchName} = ${pitchToSolfegeResult.solfegeSharp} (${pitchToSolfegeResult.parnumation}) pada Do = ${pitchToSolfegeResult.rootKey}`, 'copy-full')}
                      className="flex items-center space-x-1 bg-[#1C1C1C] hover:bg-[#282828] border border-[#333] px-3 py-1.5 rounded text-[#E0E0E0] transition"
                    >
                      {copiedKey === 'copy-full' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Salin Ringkasan Teks</span>
                    </button>
                  </div>

                  {onInsertText && (
                    <button
                      onClick={() => handleInsert(pitchToSolfegeResult.parnumation, pitchToSolfegeResult.parnumation)}
                      className="flex items-center space-x-1.5 bg-[#C5A059] hover:bg-[#E0B86C] text-black font-semibold text-xs px-4 py-1.5 rounded transition cursor-pointer"
                    >
                      <CornerDownRight className="w-3.5 h-3.5" />
                      <span>Sisipkan &quot;{pitchToSolfegeResult.parnumation}&quot; ke Editor</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: SOLFÈGE (NOT ANGKA) -> PITCH (NOT BALOK) */}
          {/* ============================================================ */}
          {activeTab === 'solfege-to-pitch' && (
            <div className="space-y-6">
              {/* Context Explanation */}
              <div className="bg-[#141414] border border-[#222] rounded-lg p-4 flex items-start space-x-3">
                <Info className="w-4 h-4 text-[#C5A059] flex-shrink-0 mt-0.5" />
                <div className="text-xs text-[#AAA] space-y-1">
                  <p>
                    <strong className="text-white">Pertanyaan Contoh:</strong> &quot;Not <strong>Re (2)</strong> atau <strong>Sel (/5)</strong> itu nada apa jika <strong>Do = {selectedRootKey}</strong>?&quot;
                  </p>
                  <p className="text-[11px] text-[#777]">
                    Pilih not angka atau suku kata solfège di bawah untuk melihat nama not balok mutlak, frekuensi Hertz, dan nilai MIDI.
                  </p>
                </div>
              </div>

              {/* Solfège Quick Selector Buttons */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#888]">
                  1. Pilih Not Angka / Solfège:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {SOLFEGE_STEPS.map((s) => {
                    const isSelected = selectedSolfege === s.parnumationMiddle;
                    return (
                      <button
                        key={s.semitoneOffset}
                        onClick={() => {
                          setSelectedSolfege(s.parnumationMiddle);
                          const rootSemi = getRootKeySemitone(selectedRootKey);
                          const targetSemi = (rootSemi + s.semitoneOffset) % 12;
                          const { midi } = calculateMidiAndFreq(targetSemi, 4 + solfegeOctaveShift);
                          audioPlayer.playSingleTone(midi);
                        }}
                        className={`p-3 rounded-lg text-left transition border ${
                          isSelected
                            ? 'bg-[#C5A059] text-black border-[#C5A059] font-bold shadow-lg shadow-[#C5A059]/20 scale-105 z-10'
                            : s.isDiatonic
                            ? 'bg-[#1C1C1C] hover:bg-[#282828] text-white border-[#333]'
                            : 'bg-[#141414] hover:bg-[#1E1E1E] text-[#AAA] border-[#262626]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-base font-mono font-bold">{s.parnumationMiddle}</span>
                          <span className={`text-[10px] font-mono px-1 rounded ${isSelected ? 'bg-black/20 text-black' : s.isDiatonic ? 'text-[#C5A059]' : 'text-[#777]'}`}>
                            {s.isDiatonic ? 'Diatonis' : 'Kromatis'}
                          </span>
                        </div>
                        <div className={`text-xs font-medium mt-0.5 ${isSelected ? 'text-black' : 'text-[#E0E0E0]'}`}>
                          {s.solfegeSharp}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Octave Range Toggle */}
                <div className="flex items-center space-x-2 pt-2 text-xs text-[#888]">
                  <span>Rentang Oktaf:</span>
                  {[
                    { label: 'Rendah (qwertyu / titik bawah)', val: -1 },
                    { label: 'Sedang / Tengah (1234567)', val: 0 },
                    { label: 'Tinggi (!@#$%^& / titik atas)', val: 1 },
                  ].map((item) => (
                    <button
                      key={item.val}
                      onClick={() => setSolfegeOctaveShift(item.val)}
                      className={`px-2.5 py-1 rounded text-xs transition ${
                        solfegeOctaveShift === item.val
                          ? 'bg-[#C5A059] text-black font-bold'
                          : 'bg-[#1C1C1C] text-[#888] hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Result Showcase Card */}
              <div className="bg-gradient-to-br from-[#161616] to-[#111111] border border-[#C5A059]/50 rounded-xl p-5 sm:p-6 space-y-5 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2A2A2A] pb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#888]">
                      Hasil Not Balok Mutlak
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-white font-serif flex items-center space-x-2">
                      <span>Solfège {solfegeToPitchResult.stepInfo.solfegeSharp} ({solfegeToPitchResult.stepInfo.parnumationMiddle})</span>
                      <span className="text-sm font-sans font-normal text-[#888]">&bull; Do = {solfegeToPitchResult.rootKey}</span>
                    </h3>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => audioPlayer.playSingleTone(solfegeToPitchResult.midiNote)}
                      className="flex items-center space-x-1.5 bg-[#C5A059] hover:bg-[#E0B86C] text-black font-bold text-xs px-3.5 py-2 rounded-lg transition shadow cursor-pointer"
                      title="Dengarkan Nada Ini"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>Dengarkan ({solfegeToPitchResult.fullNoteName})</span>
                    </button>
                  </div>
                </div>

                {/* Metric Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Metric 1: Absolute Pitch */}
                  <div className="bg-[#0D0D0D] border border-[#262626] rounded-lg p-3.5 space-y-1">
                    <div className="text-[10px] font-mono uppercase text-[#888]">Not Balok Mutlak (Pitch)</div>
                    <div className="text-2xl font-bold font-mono text-[#C5A059]">
                      {solfegeToPitchResult.pitchName}
                    </div>
                    <div className="text-xs font-semibold text-[#E0E0E0]">
                      {solfegeToPitchResult.fullNoteName}
                    </div>
                    <div className="text-[10px] text-[#707070]">
                      Enharmonik: {solfegeToPitchResult.enharmonic}
                    </div>
                  </div>

                  {/* Metric 2: Parnumation Input Key */}
                  <div className="bg-[#0D0D0D] border border-[#262626] rounded-lg p-3.5 space-y-1">
                    <div className="text-[10px] font-mono uppercase text-[#888]">Karakter Parnumation</div>
                    <div className="text-xl font-bold font-mono text-emerald-400">
                      {solfegeOctaveShift === 1
                        ? solfegeToPitchResult.stepInfo.parnumationHigh
                        : solfegeOctaveShift === -1
                        ? solfegeToPitchResult.stepInfo.parnumationLow
                        : solfegeToPitchResult.stepInfo.parnumationMiddle}
                    </div>
                    <div className="text-xs font-mono text-[#AAA]">
                      {solfegeOctaveShift === 1 ? 'Oktaf Tinggi (!@#$)' : solfegeOctaveShift === -1 ? 'Oktaf Rendah (qwer)' : 'Oktaf Standar (1234)'}
                    </div>
                    <div className="text-[10px] text-[#707070]">
                      Not Angka: {solfegeToPitchResult.stepInfo.notAngkaNumber}
                    </div>
                  </div>

                  {/* Metric 3: Interval */}
                  <div className="bg-[#0D0D0D] border border-[#262626] rounded-lg p-3.5 space-y-1">
                    <div className="text-[10px] font-mono uppercase text-[#888]">Interval dari Tonika</div>
                    <div className="text-base font-bold text-white">
                      +{solfegeToPitchResult.semitoneOffset} Semitone
                    </div>
                    <div className="text-xs text-[#AAA] truncate">
                      {solfegeToPitchResult.stepInfo.intervalName}
                    </div>
                    <div className="text-[10px] text-[#707070]">
                      Rasio: {solfegeToPitchResult.stepInfo.intervalRatio}
                    </div>
                  </div>

                  {/* Metric 4: Frequency & MIDI */}
                  <div className="bg-[#0D0D0D] border border-[#262626] rounded-lg p-3.5 space-y-1">
                    <div className="text-[10px] font-mono uppercase text-[#888]">Frekuensi &amp; MIDI</div>
                    <div className="text-base font-mono font-bold text-sky-400">
                      {solfegeToPitchResult.frequencyHz.toFixed(2)} Hz
                    </div>
                    <div className="text-xs font-mono text-[#AAA]">
                      MIDI Note: #{solfegeToPitchResult.midiNote}
                    </div>
                    <div className="text-[10px] text-[#707070]">
                      Skala Standard A4 = 440 Hz
                    </div>
                  </div>
                </div>

                {/* Quick Insert & Copy Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center space-x-2 text-xs text-[#888]">
                    <span>Aksi Cepat:</span>
                    <button
                      onClick={() => copyToClipboard(solfegeToPitchResult.pitchName, 'copy-pitch')}
                      className="flex items-center space-x-1 bg-[#1C1C1C] hover:bg-[#282828] border border-[#333] px-3 py-1.5 rounded text-[#E0E0E0] transition"
                    >
                      {copiedKey === 'copy-pitch' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#C5A059]" />}
                      <span>Salin Not ({solfegeToPitchResult.pitchName})</span>
                    </button>

                    <button
                      onClick={() => copyToClipboard(`Jika Do = ${solfegeToPitchResult.rootKey}, maka ${solfegeToPitchResult.stepInfo.solfegeSharp} (${solfegeToPitchResult.stepInfo.parnumationMiddle}) adalah ${solfegeToPitchResult.fullNoteName}`, 'copy-solf-full')}
                      className="flex items-center space-x-1 bg-[#1C1C1C] hover:bg-[#282828] border border-[#333] px-3 py-1.5 rounded text-[#E0E0E0] transition"
                    >
                      {copiedKey === 'copy-solf-full' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Salin Kalimat Lengkap</span>
                    </button>
                  </div>

                  {onInsertText && (
                    <button
                      onClick={() => handleInsert(solfegeToPitchResult.stepInfo.parnumationMiddle, solfegeToPitchResult.stepInfo.parnumationMiddle)}
                      className="flex items-center space-x-1.5 bg-[#C5A059] hover:bg-[#E0B86C] text-black font-semibold text-xs px-4 py-1.5 rounded transition cursor-pointer"
                    >
                      <CornerDownRight className="w-3.5 h-3.5" />
                      <span>Sisipkan &quot;{solfegeToPitchResult.stepInfo.parnumationMiddle}&quot; ke Editor</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 3: FULL 12-TONE SCALE MATRIX */}
          {/* ============================================================ */}
          {activeTab === 'scale-matrix' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between text-xs text-[#888] px-1 gap-2">
                <span>
                  Tabel 12 nada kromatis untuk tangga nada <strong>Do = {selectedRootKey}</strong>. Klik baris atau tombol audio untuk mendengar bunyi nadanya.
                </span>
                <span className="font-mono text-[#C5A059] font-bold">
                  12 Nada Kromatis &bull; A4 = 440 Hz
                </span>
              </div>

              <div className="overflow-x-auto border border-[#222] rounded-xl bg-[#111111]">
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="bg-[#161616] border-b border-[#262626] text-[10px] font-mono uppercase tracking-wider text-[#888]">
                      <th className="p-3">Solfège</th>
                      <th className="p-3">Not Angka</th>
                      <th className="p-3">Not Balok Mutlak</th>
                      <th className="p-3">Parnumation (M / H / L)</th>
                      <th className="p-3">Interval &amp; Semitone</th>
                      <th className="p-3">Frekuensi (Hz)</th>
                      <th className="p-3 text-right">Dengar / Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1D1D1D]">
                    {chromaticScale.map((item) => {
                      const { step, pitch, midiNote, frequencyHz, fullNoteName } = item;
                      return (
                        <tr
                          key={step.semitoneOffset}
                          className={`hover:bg-[#1A1A1A] transition ${
                            step.isDiatonic ? 'bg-white/[0.02]' : 'opacity-85'
                          }`}
                        >
                          {/* Solfège */}
                          <td className="p-3 font-semibold">
                            <span className={step.isDiatonic ? 'text-[#C5A059] font-bold text-sm' : 'text-[#BBB]'}>
                              {step.solfegeSharp}
                            </span>
                            {!step.isDiatonic && (
                              <span className="text-[10px] text-[#666] ml-1.5">
                                ({step.solfegeFlat})
                              </span>
                            )}
                          </td>

                          {/* Not Angka */}
                          <td className="p-3 font-mono font-bold">
                            <span className={`px-2 py-0.5 rounded ${
                              step.isDiatonic
                                ? 'bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/30'
                                : 'bg-[#222] text-[#AAA] border border-[#333]'
                            }`}>
                              {step.notAngkaNumber}
                            </span>
                          </td>

                          {/* Not Balok */}
                          <td className="p-3 font-mono font-bold text-white text-sm">
                            <span>{pitch.name}</span>
                            {pitch.isSharpOrFlat && (
                              <span className="text-[11px] font-normal text-[#777] ml-1">
                                / {pitch.enharmonic}
                              </span>
                            )}
                          </td>

                          {/* Parnumation Symbols */}
                          <td className="p-3 font-mono text-xs">
                            <span className="text-emerald-400 font-bold">{step.parnumationMiddle}</span>
                            <span className="text-[#666] mx-1">/</span>
                            <span className="text-[#C5A059]">{step.parnumationHigh}</span>
                            <span className="text-[#666] mx-1">/</span>
                            <span className="text-sky-400">{step.parnumationLow}</span>
                          </td>

                          {/* Interval */}
                          <td className="p-3 text-[11px] text-[#AAA]">
                            <span className="font-mono text-[#888]">+{step.semitoneOffset} st</span> &bull; {step.intervalName.split('/')[0]}
                          </td>

                          {/* Frequency */}
                          <td className="p-3 font-mono text-[#AAA]">
                            {frequencyHz.toFixed(1)} Hz
                          </td>

                          {/* Audio & Actions */}
                          <td className="p-3 text-right space-x-1.5">
                            <button
                              onClick={() => audioPlayer.playSingleTone(midiNote)}
                              className="p-1.5 bg-[#1F1F1F] hover:bg-[#C5A059] hover:text-black rounded text-[#C5A059] transition cursor-pointer"
                              title={`Dengarkan ${fullNoteName}`}
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>

                            {onInsertText && (
                              <button
                                onClick={() => handleInsert(step.parnumationMiddle, step.parnumationMiddle)}
                                className="px-2 py-1 bg-[#1F1F1F] hover:bg-[#2A2A2A] text-[#E0E0E0] hover:text-[#C5A059] rounded font-mono text-[10px] transition"
                                title="Sisipkan ke Editor"
                              >
                                + Sisip
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 4: PATTERN & PROGRESSION GENERATOR */}
          {/* ============================================================ */}
          {activeTab === 'patterns' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[#888] px-1">
                <span>
                  Pilih pola notasi siap pakai dalam nada dasar <strong>Do = {selectedRootKey}</strong> untuk langsung dimasukkan ke editor.
                </span>
                <span className="font-mono text-[#C5A059] font-bold">
                  {patterns.length} Template Pola
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {patterns.map((pat, idx) => (
                  <div
                    key={idx}
                    className="bg-[#121212] border border-[#262626] hover:border-[#3A3A3A] rounded-xl p-4 flex flex-col justify-between space-y-3 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                          <span>{pat.name}</span>
                        </h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1C1C1C] text-[#888] border border-[#2A2A2A]">
                          {pat.category}
                        </span>
                      </div>
                      <p className="text-xs text-[#888] mt-1">
                        {pat.description}
                      </p>

                      {/* Code Snippet Box */}
                      <pre className="mt-3 p-2.5 bg-[#090909] border border-[#202020] rounded text-xs font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap">
                        {pat.parnumationText}
                      </pre>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#1C1C1C]">
                      <button
                        onClick={() => copyToClipboard(pat.parnumationText, `pat-${idx}`)}
                        className="flex items-center space-x-1 text-xs text-[#888] hover:text-white transition"
                      >
                        {copiedKey === `pat-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Salin Teks</span>
                      </button>

                      {onInsertText && (
                        <button
                          onClick={() => handleInsert(pat.parnumationText, pat.name)}
                          className="flex items-center space-x-1.5 bg-[#C5A059] hover:bg-[#E0B86C] text-black font-semibold text-xs px-3.5 py-1.5 rounded transition cursor-pointer"
                        >
                          <CornerDownRight className="w-3.5 h-3.5" />
                          <span>Sisipkan ke Editor</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:px-6 border-t border-[#222] bg-[#0E0E0E] flex flex-wrap items-center justify-between gap-3 flex-none">
          <div className="text-[11px] text-[#707070] font-mono">
            Parnumation Engine &bull; Do = {selectedRootKey} (MIDI #{getRootKeySemitone(selectedRootKey) + 60})
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#1C1C1C] hover:bg-[#282828] text-[#E0E0E0] text-xs rounded transition"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
