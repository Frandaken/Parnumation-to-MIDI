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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    setErrorMessage(null);
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
      setErrorMessage('Gagal menghasilkan file MIDI: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Download single specific voice
  const handleDownloadVoice = (voice: SATBVoice, voiceName: string) => {
    setErrorMessage(null);
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
      setErrorMessage('Gagal menghasilkan file MIDI: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Download all voices individually
  const handleDownloadAllSeparate = () => {
    setErrorMessage(null);
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
      setErrorMessage('Gagal menghasilkan file MIDI: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const isSatb = song.tracks.length > 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-fadeIn">
      <div data-ui="modal" className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
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

        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded bg-red-950/60 border border-red-800 text-xs text-red-200">
            {errorMessage}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Metadata Summary Pill */}
          <div className="bg-[#141519] p-3.5 rounded-lg flex items-center justify-between text-xs">
            <div>
              <span className="text-[#6B7280]">Judul: </span>
              <span className="font-semibold text-[#E5E7EB]">{song.metadata.title}</span>
            </div>
            <div className="flex items-center space-x-3 text-[#9CA3AF] tabular-nums">
              <span>Do = <b className="text-[#C5A059]">{song.metadata.key}</b></span>
              <span>{song.metadata.bpm} BPM</span>
              <span>{song.metadata.timeSignature.join('/')}</span>
            </div>
          </div>

          {/* Instrument Selector */}
          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">
              Pilihan Suara Instrumen MIDI (General MIDI):
            </label>
            <select
              value={selectedInstrument}
              onChange={(e) => setSelectedInstrument(parseInt(e.target.value, 10))}
              className="w-full bg-[#1A1B20] text-[#E5E7EB] text-xs rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
            >
              {MIDI_INSTRUMENTS.map((inst) => (
                <option key={inst.id} value={inst.id} className="bg-[#141414] text-[#E0E0E0]">
                  GM #{inst.id} - {inst.name} ({inst.category})
                </option>
              ))}
            </select>
            <p className="text-xs text-[#6B7280] mt-1">
              Catatan: Default untuk partitur paduan suara adalah Choir Aahs (#52).
            </p>
          </div>

          {/* Download Options */}
          <div className="space-y-3">
            <label className="block text-xs font-medium text-[#9CA3AF]">
              Opsi Ekspor Trek MIDI:
            </label>

            {/* Primary Action: Full SATB */}
            <button
              onClick={handleDownloadFull}
              className="w-full flex items-center justify-between p-4 rounded-lg bg-[#C5A059] hover:bg-[#E0B86C] text-black font-semibold transition group active:scale-[0.98]"
            >
              <div className="flex items-center space-x-3 text-left">
                <div className="h-10 w-10 rounded bg-black/10 flex items-center justify-center text-black">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-xs text-black">
                    {isSatb ? 'Download Full SATB (Semua 4 Trek)' : 'Download File MIDI (.mid)'}
                  </div>
                  <div className="text-xs text-black/75 font-normal">
                    {isSatb
                      ? 'Format Type 1 Multi-track (Soprano, Alto, Tenor, Bass tergabung)'
                      : 'Format Standard Type 0 Single Track'}
                  </div>
                </div>
              </div>
              <Download className="w-5 h-5 text-black group-hover:translate-x-0.5 transition-transform" />
            </button>

            {isSatb && (
              <div className="pt-2 space-y-2">
                <div className="flex items-center justify-between text-xs text-[#9CA3AF]">
                  <span>Atau unduh satu per satu suara spesifik:</span>
                  <button
                    onClick={handleDownloadAllSeparate}
                    className="text-[#C5A059] hover:underline flex items-center space-x-1 font-medium text-xs"
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
                      className="flex items-center justify-between p-3 rounded-lg bg-[#141519] hover:bg-[#1E2026] text-left transition group active:scale-[0.98]"
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="font-bold text-xs px-2 py-0.5 rounded bg-[#20222A] text-[#C5A059]">
                          {track.voice}
                        </span>
                        <div>
                          <div className="text-xs font-medium text-[#E5E7EB]">
                            {track.name} Saja
                          </div>
                          <div className="text-xs text-[#9CA3AF] tabular-nums">
                            {track.notes.filter((n) => !n.pitch.isRest).length} notasi
                          </div>
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#C5A059] transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Success Notification Alert */}
          {downloadSuccess && (
            <div className="p-3 bg-[#132B1A] rounded-lg text-xs text-emerald-300 flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{downloadSuccess}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#0A0A0A] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#1A1B20] hover:bg-[#22242B] text-[#E5E7EB] text-xs font-medium rounded-md transition-colors active:scale-[0.98]"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
