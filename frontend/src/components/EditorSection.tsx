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
    <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl p-5 shadow-none flex flex-col space-y-4">
      {/* Top Header & Voice Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#222]">
        <div className="flex items-center space-x-2.5">
          <div className="w-2 h-2 rounded-full bg-[#C5A059]"></div>
          <div>
            <h2 className="text-xs uppercase tracking-widest text-[#C5A059] font-bold">
              Source Notation
            </h2>
            <p className="text-[10px] text-[#707070] italic">
              Ketik atau unggah karakter notasi angka ({lineCount} baris)
            </p>
          </div>
        </div>

        {/* Detected Voice Structure */}
        <div className="flex items-center space-x-2">
          {detectedVoices.length > 0 ? (
            <div className="flex items-center space-x-1.5 bg-[#141414] border border-[#333] px-2.5 py-1 rounded text-xs text-[#C5A059] font-mono">
              <Layers className="w-3.5 h-3.5 text-[#C5A059]" />
              <span className="text-[11px] uppercase tracking-wider">
                {detectedVoices.includes('S') || detectedVoices.includes('A') || detectedVoices.includes('T') || detectedVoices.includes('B')
                  ? `SATB (${detectedVoices.join(', ')})`
                  : 'Melodi Tunggal'}
              </span>
            </div>
          ) : (
            <div className="text-[11px] text-[#666] italic">Menunggu input...</div>
          )}
        </div>
      </div>

      {/* Quick Metadata Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#111111] p-3.5 rounded-lg border border-[#222]">
        {/* Nada Dasar (Key) */}
        <div>
          <label className="flex items-center space-x-1 text-[10px] uppercase tracking-widest font-bold text-[#888] mb-1">
            <Key className="w-3 h-3 text-[#C5A059]" />
            <span>Nada Dasar (Do)</span>
          </label>
          <select
            value={metadata.key}
            onChange={(e) => onChangeMetadata({ key: e.target.value })}
            className="w-full bg-[#161616] border border-[#2A2A2A] text-[#E0E0E0] text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-[#C5A059] transition-colors"
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
          <label className="flex items-center space-x-1 text-[10px] uppercase tracking-widest font-bold text-[#888] mb-1">
            <Clock className="w-3 h-3 text-[#C5A059]" />
            <span>Tempo ({metadata.bpm} BPM)</span>
          </label>
          <input
            type="number"
            min="30"
            max="260"
            value={metadata.bpm}
            onChange={(e) => onChangeMetadata({ bpm: parseInt(e.target.value, 10) || 100 })}
            className="w-full bg-[#161616] border border-[#2A2A2A] text-[#E0E0E0] text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-[#C5A059] font-mono transition-colors"
          />
        </div>

        {/* Birama / Time Signature */}
        <div>
          <label className="flex items-center space-x-1 text-[10px] uppercase tracking-widest font-bold text-[#888] mb-1">
            <Music2 className="w-3 h-3 text-[#C5A059]" />
            <span>Birama (Time Sig)</span>
          </label>
          <select
            value={`${metadata.timeSignature[0]}/${metadata.timeSignature[1]}`}
            onChange={(e) => {
              const [n, d] = e.target.value.split('/').map(Number);
              onChangeMetadata({ timeSignature: [n, d] });
            }}
            className="w-full bg-[#161616] border border-[#2A2A2A] text-[#E0E0E0] text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-[#C5A059] transition-colors"
          >
            <option value="4/4">4/4 (Standard)</option>
            <option value="3/4">3/4 (Waltz)</option>
            <option value="2/4">2/4 (Mars)</option>
            <option value="6/8">6/8 (Compound)</option>
          </select>
        </div>

        {/* Judul Lagu */}
        <div>
          <label className="flex items-center space-x-1 text-[10px] uppercase tracking-widest font-bold text-[#888] mb-1">
            <FileText className="w-3 h-3 text-[#C5A059]" />
            <span>Judul Partitur</span>
          </label>
          <input
            type="text"
            value={metadata.title}
            placeholder="Judul lagu..."
            onChange={(e) => onChangeMetadata({ title: e.target.value })}
            className="w-full bg-[#161616] border border-[#2A2A2A] text-[#E0E0E0] text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-[#C5A059] truncate transition-colors"
          />
        </div>
      </div>

      {/* Advanced Interpretations settings */}
      <div className="flex flex-wrap items-center justify-between text-xs text-[#888] bg-[#111111] px-3.5 py-2.5 rounded-lg border border-[#222] gap-3">
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-1.5 cursor-pointer select-none text-[11px] text-[#A0A0A0] hover:text-[#E0E0E0]">
            <input
              type="checkbox"
              checked={metadata.interpretDotAsTie}
              onChange={(e) => onChangeMetadata({ interpretDotAsTie: e.target.checked })}
              className="rounded bg-[#1A1A1A] border-[#333] text-[#C5A059] accent-[#C5A059] focus:ring-0 focus:ring-offset-0"
            />
            <span>Artikan titik (.) sebagai perpanjang nada (Sustain/Tie)</span>
          </label>

          <label className="flex items-center space-x-1.5 cursor-pointer select-none text-[11px] text-[#A0A0A0] hover:text-[#E0E0E0]">
            <input
              type="checkbox"
              checked={metadata.unrollRepeats}
              onChange={(e) => onChangeMetadata({ unrollRepeats: e.target.checked })}
              className="rounded bg-[#1A1A1A] border-[#333] text-[#C5A059] accent-[#C5A059] focus:ring-0 focus:ring-offset-0"
            />
            <span>Otomatis eksekusi tanda repeat [ ]</span>
          </label>
        </div>

        <div className="flex items-center space-x-2 text-[11px] text-[#888]">
          <span>Fermata:</span>
          <select
            value={metadata.fermataMultiplier}
            onChange={(e) => onChangeMetadata({ fermataMultiplier: parseFloat(e.target.value) })}
            className="bg-[#1A1A1A] border border-[#333] text-[#E0E0E0] text-[11px] rounded px-2 py-0.5 outline-none focus:border-[#C5A059]"
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
        className={`relative flex flex-col rounded-lg border transition ${
          isDragging
            ? 'border-[#C5A059] bg-[#1A150A]'
            : 'border-[#222] bg-[#111111]'
        }`}
      >
        {/* Drop overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0D0D0D]/95 rounded-lg backdrop-blur-sm border-2 border-dashed border-[#C5A059]">
            <FileUp className="w-10 h-10 text-[#C5A059] animate-bounce mb-2" />
            <p className="text-xs uppercase tracking-widest font-bold text-white">Lepaskan file di sini</p>
            <p className="text-[10px] text-[#888] mt-1">Mendukung file .docx, .pdf, .txt, .par</p>
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
          className="w-full h-64 sm:h-72 bg-transparent text-[#A0A0A0] focus:text-[#E0E0E0] font-mono text-xs sm:text-sm p-4 focus:outline-none resize-y leading-relaxed"
          spellCheck={false}
        />

        {/* Bottom toolbar inside editor */}
        <div className="flex flex-wrap items-center justify-between px-3.5 py-2.5 bg-[#0F0F0F] border-t border-[#222] rounded-b-lg gap-2 text-xs">
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
              className="flex items-center space-x-1.5 px-3 py-1 text-[10px] uppercase tracking-wider bg-[#1A1A1A] border border-[#333] hover:bg-[#222] hover:border-[#C5A059] text-[#E0E0E0] rounded transition-colors"
            >
              <FileUp className="w-3 h-3 text-[#C5A059]" />
              <span>{isLoadingFile ? 'Membaca file...' : 'Upload .docx / .pdf / .txt'}</span>
            </button>

            {onOpenNoteGenerator && (
              <button
                onClick={onOpenNoteGenerator}
                className="flex items-center space-x-1.5 px-3 py-1 text-[10px] uppercase tracking-wider bg-[#C5A059]/10 border border-[#C5A059]/30 hover:bg-[#C5A059]/20 hover:border-[#C5A059] text-[#C5A059] rounded transition-colors font-medium cursor-pointer"
                title="Buka Kalkulator & Generator Notasi"
              >
                <Sparkles className="w-3 h-3 text-[#C5A059]" />
                <span>Not Generator</span>
              </button>
            )}

            {fileStatus && (
              <span className="text-[10px] text-[#C5A059] font-mono truncate max-w-xs">
                {fileStatus}
              </span>
            )}
          </div>

          <div className="text-[10px] opacity-40 uppercase font-mono tracking-widest text-[#888]">
            {text.length} chars &bull; UTF-8 Plaintext
          </div>
        </div>
      </div>

      {/* Warnings & Validation feedback */}
      {warnings.length > 0 && (
        <div className="bg-[#1A150A] border border-[#C5A059]/40 rounded-lg p-3 text-xs text-[#E0B86C] space-y-1">
          <div className="flex items-center space-x-1.5 font-bold uppercase tracking-wider text-[10px] text-[#C5A059]">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Peringatan Parsing ({warnings.length}):</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-[#E0E0E0]/80 max-h-24 overflow-y-auto font-mono">
            {warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
