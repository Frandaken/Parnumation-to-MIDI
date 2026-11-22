import React, { useState, useRef } from 'react';
import {
  FileUp,
  Sliders,
  Play,
  FileCode,
  Music2,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Clock,
  Key,
  Layers,
  Sparkles,
  Settings2,
} from 'lucide-react';
import { SongMetadata, SATBVoice } from '../types';
import { extractTextFromFile } from '../lib/fileExtractors';

interface EditorSectionProps {
  text: string;
  onChangeText: (newText: string) => void;
  metadata: SongMetadata;
  onChangeMetadata: (newMeta: Partial<SongMetadata>) => void;
  onParse: () => void;
  detectedVoices: SATBVoice[];
  warnings: string[];
  onOpenNoteGenerator?: () => void;
}

const KEYS = [
  'C', 'C#', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'
];

export const EditorSection: React.FC<EditorSectionProps> = ({
  text,
  onChangeText,
  metadata,
  onChangeMetadata,
  onParse,
  detectedVoices,
  warnings,
  onOpenNoteGenerator,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [fileStatus, setFileStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setIsLoadingFile(true);
    setFileStatus(`Mengekstrak "${file.name}"...`);
    try {
      const res = await extractTextFromFile(file);
      onChangeText(res.text);
      setFileStatus(`Berhasil mengekstrak ${res.charCount} karakter dari ${file.name}`);
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Gagal mengekstrak teks file';
      setFileStatus(`Error: ${msg}`);
    } finally {
      setIsLoadingFile(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const lineCount = text.split('\n').length;

  return (
    <div data-ui="editor" className="bg-[#131417] rounded-xl p-5 space-y-4">
      {/* Top Header & Voice Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#C5A059]"></div>
          <div>
            <h2 className="text-sm font-semibold text-[#C5A059]">
              Source Notation
            </h2>
            <p className="text-xs text-[#9CA3AF]">
              Ketik atau unggah karakter notasi angka ({lineCount} baris)
            </p>
          </div>
        </div>

        {/* Detected Voice Structure */}
        <div className="flex items-center space-x-2">
          {detectedVoices.length > 0 ? (
            <div className="flex items-center space-x-1.5 bg-[#1C1D23] px-3 py-1.5 rounded-md text-xs text-[#C5A059]">
              <Layers className="w-3.5 h-3.5 text-[#C5A059]" />
              <span className="text-xs font-medium">
                {detectedVoices.includes('S') || detectedVoices.includes('A') || detectedVoices.includes('T') || detectedVoices.includes('B')
                  ? `SATB (${detectedVoices.join(', ')})`
                  : 'Melodi Tunggal'}
              </span>
            </div>
          ) : (
            <div className="text-xs text-[#6B7280]">Menunggu input...</div>
          )}
        </div>
      </div>

      {/* Quick Metadata Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#1A1B20] p-4 rounded-lg">
        {/* Nada Dasar (Key) */}
        <div>
          <label className="flex items-center space-x-1.5 text-xs font-medium text-[#9CA3AF] mb-1.5">
            <Key className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Nada Dasar (Do)</span>
          </label>
          <select
            value={metadata.key}
            onChange={(e) => onChangeMetadata({ key: e.target.value })}
            className="w-full bg-[#24262E] text-[#E5E7EB] text-xs rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#C5A059] transition-colors"
          >
            {KEYS.map((k) => (
              <option key={k} value={k}>
                {k} (Do = {k})
              </option>
            ))}
          </select>
        </div>

        {/* Tempo (BPM) */}
        <div>
          <label className="flex items-center space-x-1.5 text-xs font-medium text-[#9CA3AF] mb-1.5">
            <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Tempo ({metadata.bpm} BPM)</span>
          </label>
          <input
            type="number"
            min="30"
            max="260"
            value={metadata.bpm}
            onChange={(e) => onChangeMetadata({ bpm: parseInt(e.target.value, 10) || 100 })}
            className="w-full bg-[#24262E] text-[#E5E7EB] text-xs rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#C5A059] tabular-nums transition-colors"
          />
        </div>

        {/* Birama / Time Signature */}
        <div>
          <label className="flex items-center space-x-1.5 text-xs font-medium text-[#9CA3AF] mb-1.5">
            <Music2 className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Birama</span>
          </label>
          <select
            value={`${metadata.timeSignature[0]}/${metadata.timeSignature[1]}`}
            onChange={(e) => {
              const [n, d] = e.target.value.split('/').map(Number);
              onChangeMetadata({ timeSignature: [n, d] });
            }}
            className="w-full bg-[#24262E] text-[#E5E7EB] text-xs rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#C5A059] transition-colors"
          >
            <option value="4/4">4/4 (Standard)</option>
            <option value="3/4">3/4 (Waltz)</option>
            <option value="2/4">2/4 (Mars)</option>
            <option value="6/8">6/8 (Compound)</option>
          </select>
        </div>

        {/* Judul Lagu */}
        <div>
          <label className="flex items-center space-x-1.5 text-xs font-medium text-[#9CA3AF] mb-1.5">
            <FileText className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Judul Partitur</span>
          </label>
          <input
            type="text"
            value={metadata.title}
            placeholder="Judul lagu..."
            onChange={(e) => onChangeMetadata({ title: e.target.value })}
            className="w-full bg-[#24262E] text-[#E5E7EB] text-xs rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#C5A059] truncate transition-colors"
          />
        </div>
      </div>

      {/* Advanced Interpretations settings */}
      <div className="flex flex-wrap items-center justify-between text-xs text-[#9CA3AF] bg-[#1A1B20] px-4 py-3 rounded-lg gap-3">
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer select-none text-xs text-[#9CA3AF] hover:text-[#E5E7EB]">
            <input
              type="checkbox"
              checked={metadata.interpretDotAsTie}
              onChange={(e) => onChangeMetadata({ interpretDotAsTie: e.target.checked })}
              className="rounded bg-[#24262E] text-[#C5A059] accent-[#C5A059] focus:ring-0 focus:ring-offset-0"
            />
            <span>Artikan titik (.) sebagai perpanjang nada (Sustain/Tie)</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer select-none text-xs text-[#9CA3AF] hover:text-[#E5E7EB]">
            <input
              type="checkbox"
              checked={metadata.unrollRepeats}
              onChange={(e) => onChangeMetadata({ unrollRepeats: e.target.checked })}
              className="rounded bg-[#24262E] text-[#C5A059] accent-[#C5A059] focus:ring-0 focus:ring-offset-0"
            />
            <span>Otomatis eksekusi tanda repeat [ ]</span>
          </label>
        </div>

        <div className="flex items-center space-x-2 text-xs text-[#9CA3AF]">
          <span>Fermata:</span>
          <select
            value={metadata.fermataMultiplier}
            onChange={(e) => onChangeMetadata({ fermataMultiplier: parseFloat(e.target.value) })}
            className="bg-[#24262E] text-[#E5E7EB] text-xs rounded px-2.5 py-1 outline-none focus:ring-1 focus:ring-[#C5A059]"
          >
            <option value="1.5">1.5x</option>
            <option value="1.75">1.75x</option>
            <option value="2.0">2.0x</option>
          </select>
        </div>
      </div>

      {/* Drag & Drop / File Input trigger & Textarea */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative flex flex-col rounded-lg transition-colors ${
          isDragging
            ? 'bg-[#251D14]'
            : 'bg-[#1A1B20]'
        }`}
      >
        {/* Drop overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0D0D0F]/95 rounded-lg border-2 border-[#C5A059]">
            <FileUp className="w-10 h-10 text-[#C5A059] mb-2" />
            <p className="text-xs font-semibold text-white">Lepaskan file di sini</p>
            <p className="text-xs text-[#9CA3AF] mt-1">Mendukung file .docx, .pdf, .txt, .par</p>
          </div>
        )}

        {/* Textarea */}
        <textarea
          value={text}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder={`Ketik atau tempel notasi Parnumation di sini...
Contoh SATB:
S: 1 2 3 4 | 5 . 3 5 | ! . . . |
A: 1 1 1 2 | 3 . 1 3 | 5 . . . |
T: 3 4 5 5 | ! . 5 ! | # . . . |
B: 1 7, 6, 5, | 1 . 1 1 | 1 . . . |

Atau klik tombol upload file .docx / .pdf di bawah.`}
          className="w-full h-64 sm:h-72 bg-transparent text-[#D1D5DB] focus:text-white font-mono text-xs sm:text-sm p-4 focus:outline-none resize-y leading-relaxed" /* taste-skill-ignore */
          spellCheck={false}
        />

        {/* Bottom toolbar inside editor */}
        <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-[#16171C] rounded-b-lg gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx,.pdf,.txt,.par"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoadingFile}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs bg-[#24262E] hover:bg-[#2F323D] text-[#E5E7EB] rounded-md transition-colors active:scale-[0.98]"
            >
              <FileUp className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>{isLoadingFile ? 'Membaca file...' : 'Upload .docx / .pdf / .txt'}</span>
            </button>

            {onOpenNoteGenerator && (
              <button
                onClick={onOpenNoteGenerator}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs bg-[#2A2314] hover:bg-[#362C18] text-[#E0B86C] rounded-md transition-colors font-medium cursor-pointer active:scale-[0.98]"
                title="Buka Kalkulator & Generator Notasi"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Not Generator</span>
              </button>
            )}

            {fileStatus && (
              <span className="text-xs text-[#C5A059] truncate max-w-xs">
                {fileStatus}
              </span>
            )}
          </div>

          <div className="text-xs tabular-nums text-[#6B7280]">
            {text.length} karakter · UTF-8 Plaintext
          </div>
        </div>
      </div>

      {/* Warnings & Validation feedback */}
      {warnings.length > 0 && (
        <div className="bg-[#241D12] rounded-lg p-4 text-xs text-[#E0B86C] space-y-2">
          <div className="flex items-center space-x-2 font-semibold text-xs text-[#C5A059]">
            <AlertTriangle className="w-4 h-4" />
            <span>Peringatan Parsing ({warnings.length}):</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-xs text-[#E5E7EB]/90 max-h-24 overflow-y-auto">
            {warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
