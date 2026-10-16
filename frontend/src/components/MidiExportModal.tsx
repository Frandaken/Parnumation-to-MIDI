import React, { useState } from 'react';
import {
  Download,
  X,
  Music,
  Check,
  Layers,
  FileCheck,
  PackageCheck,
  Sparkles,
} from 'lucide-react';
import { ParsedSong, SATBVoice } from '../types';
import {
  generateMidiBuffer,
  downloadMidiFile,
  MIDI_INSTRUMENTS,
} from '../lib/midiGenerator';

interface MidiExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: ParsedSong;
}

export const MidiExportModal: React.FC<MidiExportModalProps> = ({
  isOpen,
  onClose,
  song,
}) => {
  const [selectedInstrument, setSelectedInstrument] = useState<number>(52); // Default 52 = Choir Aahs
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const sanitizeName = (str: string) => {
    return (str || 'parnumation_song')
      .toLowerCase()
      .replace(/[^a-z0-9]/gi, '_')
      .replace(/_+/g, '_');
  };

  const baseFilename = sanitizeName(song.metadata.title);

  // Download Full SATB / Multi-track file
  const handleDownloadFull = () => {
    try {
      const buffer = generateMidiBuffer(song, {
        instrumentOverride: selectedInstrument,
        voicesToExport: song.tracks.map((t) => t.voice),
      });
      const filename = `${baseFilename}_full_SATB.mid`;
      downloadMidiFile(buffer, filename);
      setDownloadSuccess(`Berhasil mengunduh "${filename}"`);
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (err: unknown) {
      console.error(err);
      alert('Gagal menghasilkan file MIDI: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Download single specific voice
  const handleDownloadVoice = (voice: SATBVoice, voiceName: string) => {
    try {
      const buffer = generateMidiBuffer(song, {
        instrumentOverride: selectedInstrument,
        voicesToExport: [voice],
      });
      const filename = `${baseFilename}_${voice}_${sanitizeName(voiceName)}.mid`;
      downloadMidiFile(buffer, filename);
      setDownloadSuccess(`Berhasil mengunduh trek [${voice}] "${filename}"`);
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (err: unknown) {
      console.error(err);
      alert('Gagal menghasilkan file MIDI: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Download all voices individually
  const handleDownloadAllSeparate = () => {
    try {
      song.tracks.forEach((track, idx) => {
        setTimeout(() => {
          const buffer = generateMidiBuffer(song, {
            instrumentOverride: selectedInstrument,
            voicesToExport: [track.voice],
          });
          const filename = `${baseFilename}_${track.voice}_${sanitizeName(track.name)}.mid`;
          downloadMidiFile(buffer, filename);
        }, idx * 300);
      });
      setDownloadSuccess(`Mengunduh ${song.tracks.length} trek MIDI terpisah...`);
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (err: unknown) {
      console.error(err);
      alert('Gagal menghasilkan file MIDI: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const isSatb = song.tracks.length > 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#222] bg-[#0A0A0A]">
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded bg-[#1A1A1A] border border-[#333] text-[#C5A059] flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-[#E0E0E0] text-sm uppercase tracking-wider">
                Download File MIDI (.mid)
              </h3>
              <p className="text-[11px] text-[#707070]">
                Pilih opsi ekspor instrumen & separasi trek suara
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#707070] hover:text-[#E0E0E0] p-1.5 rounded hover:bg-[#1A1A1A] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Metadata Summary Pill */}
          <div className="bg-[#141414] p-3.5 rounded border border-[#222] flex items-center justify-between text-xs">
            <div>
              <span className="text-[#666]">Judul: </span>
              <span className="font-bold text-[#E0E0E0]">{song.metadata.title}</span>
            </div>
            <div className="flex items-center space-x-3 text-[#888] font-mono">
              <span>Do = <b className="text-[#C5A059]">{song.metadata.key}</b></span>
              <span>{song.metadata.bpm} BPM</span>
              <span>{song.metadata.timeSignature.join('/')}</span>
            </div>
          </div>

          {/* Instrument Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#A0A0A0] mb-1.5">
              Pilihan Suara Instrumen MIDI (General MIDI):
            </label>
            <select
              value={selectedInstrument}
              onChange={(e) => setSelectedInstrument(parseInt(e.target.value, 10))}
              className="w-full bg-[#141414] border border-[#2A2A2A] text-[#E0E0E0] text-xs rounded px-3 py-2.5 focus:outline-none focus:border-[#C5A059] font-mono"
            >
              {MIDI_INSTRUMENTS.map((inst) => (
                <option key={inst.id} value={inst.id} className="bg-[#141414] text-[#E0E0E0]">
                  GM #{inst.id} - {inst.name} ({inst.category})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-[#707070] mt-1">
              Catatan: Default untuk partitur paduan suara adalah <i>Choir Aahs (#52)</i>.
            </p>
          </div>

          {/* Download Options */}
          <div className="space-y-3">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#A0A0A0]">
              Opsi Ekspor Trek MIDI:
            </label>

            {/* Primary Action: Full SATB */}
            <button
              onClick={handleDownloadFull}
              className="w-full flex items-center justify-between p-4 rounded bg-[#C5A059] hover:bg-[#E0B86C] text-black font-bold transition group"
            >
              <div className="flex items-center space-x-3 text-left">
                <div className="h-10 w-10 rounded bg-black/10 flex items-center justify-center text-black">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs uppercase tracking-wider text-black">
                    {isSatb ? 'Download Full SATB (Semua 4 Trek)' : 'Download File MIDI (.mid)'}
                  </div>
                  <div className="text-[11px] text-black/75 font-medium">
                    {isSatb
                      ? 'Format Type 1 Multi-track (Soprano, Alto, Tenor, Bass tergabung)'
                      : 'Format Standard Type 0 Single Track'}
                  </div>
                </div>
              </div>
              <Download className="w-5 h-5 text-black group-hover:translate-x-0.5 transition" />
            </button>

            {/* Individual Voice Tracks if SATB exists */}
            {isSatb && (
              <div className="pt-2 space-y-2">
                <div className="flex items-center justify-between text-xs text-[#888]">
                  <span>Atau unduh satu per satu suara spesifik:</span>
                  <button
                    onClick={handleDownloadAllSeparate}
                    className="text-[#C5A059] hover:underline flex items-center space-x-1 font-bold text-[11px]"
                  >
                    <PackageCheck className="w-3.5 h-3.5" />
                    <span>Unduh Semua Terpisah</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {song.tracks.map((track) => (
                    <button
                      key={track.voice}
                      onClick={() => handleDownloadVoice(track.voice, track.name)}
                      className="flex items-center justify-between p-3 rounded bg-[#141414] hover:bg-[#1A1A1A] border border-[#222] hover:border-[#C5A059] text-left transition group"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="font-bold font-mono text-xs px-2 py-0.5 rounded bg-[#1E1E1E] text-[#C5A059] border border-[#333]">
                          {track.voice}
                        </span>
                        <div>
                          <div className="text-xs font-semibold text-[#E0E0E0]">
                            {track.name} Saja
                          </div>
                          <div className="text-[10px] text-[#707070] font-mono">
                            {track.notes.filter((n) => !n.pitch.isRest).length} notasi
                          </div>
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-[#707070] group-hover:text-[#C5A059] transition" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Success Notification Alert */}
          {downloadSuccess && (
            <div className="p-3 bg-[#112211] border border-emerald-500/40 rounded text-xs text-emerald-300 flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{downloadSuccess}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#222] bg-[#0A0A0A] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#262626] text-[#E0E0E0] text-xs font-bold rounded transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
