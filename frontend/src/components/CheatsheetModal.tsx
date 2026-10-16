import React from 'react';
import { X, BookOpen, Music, Code, HelpCircle, Layers, Check } from 'lucide-react';

interface CheatsheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheatsheetModal: React.FC<CheatsheetModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#222] bg-[#0A0A0A]">
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded bg-[#1A1A1A] border border-[#333] text-[#C5A059] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-[#E0E0E0] text-sm uppercase tracking-wider">
                Panduan Sintaks Notasi Parnumation
              </h3>
              <p className="text-[11px] text-[#707070]">
                Spesifikasi encoding notasi angka berbasis keyboard QWERTY standar
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

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs text-[#A0A0A0]">
          {/* Section 1: Pitch & Octaves */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-xs uppercase tracking-widest text-[#C5A059] flex items-center space-x-1.5">
              <Music className="w-3.5 h-3.5" />
              <span>A. Notasi Nada Dasar & Oktaf</span>
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse bg-[#121212] border border-[#222] rounded overflow-hidden">
                <thead className="bg-[#1A1A1A] text-[#888] border-b border-[#2A2A2A] text-[10px] uppercase font-bold tracking-widest">
                  <tr>
                    <th className="py-2 px-3">Karakter Keyboard</th>
                    <th className="py-2 px-3">Artian Nada (Solfège)</th>
                    <th className="py-2 px-3">Tingkat Oktaf</th>
                    <th className="py-2 px-3">Contoh Nada (Do=C)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A1A1A] font-mono text-xs">
                  <tr>
                    <td className="py-2 px-3 text-[#C5A059] font-bold">1 2 3 4 5 6 7</td>
                    <td className="py-2 px-3 text-[#E0E0E0]">do – si</td>
                    <td className="py-2 px-3 text-[#888]">Oktaf Tengah (Polos)</td>
                    <td className="py-2 px-3 text-[#666]">C4, D4, E4, F4, G4, A4, B4</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-[#C5A059] font-bold">! @ # $ % ^ &</td>
                    <td className="py-2 px-3 text-[#E0E0E0]">do – si (Shift+1-7)</td>
                    <td className="py-2 px-3 text-[#888]">Oktaf Tinggi (+1, titik atas)</td>
                    <td className="py-2 px-3 text-[#666]">C5, D5, E5, F5, G5, A5, B5</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-[#C5A059] font-bold">q w e r t y u</td>
                    <td className="py-2 px-3 text-[#E0E0E0]">do – si</td>
                    <td className="py-2 px-3 text-[#888]">Oktaf Rendah (-1, titik bawah)</td>
                    <td className="py-2 px-3 text-[#666]">C3, D3, E3, F3, G3, A3, B3</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-[#C5A059] font-bold">s1 s2 s3 s4 s5 s6 s7</td>
                    <td className="py-2 px-3 text-[#E0E0E0]">do – si (Prefix s)</td>
                    <td className="py-2 px-3 text-[#888]">Modifier Oktaf Rendah (-1 oktaf)</td>
                    <td className="py-2 px-3 text-[#666]">s1 = q (C3), s5 = t (G3)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-[#C5A059] font-bold">9 (suffix, misal: 19)</td>
                    <td className="py-2 px-3 text-[#E0E0E0]">Modifier Oktaf</td>
                    <td className="py-2 px-3 text-[#888]">+2 Oktaf dari tengah</td>
                    <td className="py-2 px-3 text-[#666]">C6</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-[#C5A059] font-bold">8 (suffix, misal: q8)</td>
                    <td className="py-2 px-3 text-[#E0E0E0]">Modifier Oktaf</td>
                    <td className="py-2 px-3 text-[#888]">-2 Oktaf dari tengah</td>
                    <td className="py-2 px-3 text-[#666]">C2</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-[#C5A059] font-bold">0</td>
                    <td className="py-2 px-3 text-[#E0E0E0]">Rest / Diam</td>
                    <td className="py-2 px-3 text-[#888]">-</td>
                    <td className="py-2 px-3 text-[#666]">Diam sesuai durasi aktif</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 1.5: Accidentals / Tanda Kromatis */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-xs uppercase tracking-widest text-[#C5A059] flex items-center space-x-1.5">
              <Music className="w-3.5 h-3.5" />
              <span>B. Tanda Kromatis / Kres & Mol (/ dan \)</span>
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse bg-[#121212] border border-[#222] rounded overflow-hidden">
                <thead className="bg-[#1A1A1A] text-[#888] border-b border-[#2A2A2A] text-[10px] uppercase font-bold tracking-widest">
                  <tr>
                    <th className="py-2 px-3">Prefiks</th>
                    <th className="py-2 px-3">Fungsi / Perubahan Nada</th>
                    <th className="py-2 px-3">Sebutan Solfège</th>
                    <th className="py-2 px-3">Contoh Notasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A1A1A] font-mono text-xs">
                  <tr>
                    <td className="py-2 px-3 text-[#C5A059] font-bold">/ (garis miring kanan)</td>
                    <td className="py-2 px-3 text-[#E0E0E0]">Naik 1/2 Nada (Kres / Sharp)</td>
                    <td className="py-2 px-3 text-[#888]">di, ri, fi, sel, lis</td>
                    <td className="py-2 px-3 text-[#666]">/5 (sel), /1 (di), /2 (ri), /4 (fi), /6 (lis)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-[#C5A059] font-bold">\ (garis miring kiri)</td>
                    <td className="py-2 px-3 text-[#E0E0E0]">Turun 1/2 Nada (Mol / Flat)</td>
                    <td className="py-2 px-3 text-[#888]">ra, me, se, le, sa</td>
                    <td className="py-2 px-3 text-[#666]">\7 (sa), \3 (me), \6 (le), \5 (se), \2 (ra)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Durations, Beams & Slurs */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-xs uppercase tracking-widest text-[#C5A059] flex items-center space-x-1.5">
              <Code className="w-3.5 h-3.5" />
              <span>C. Durasi, Garis Nilai (Beam) & Garis Lengkung (Slur)</span>
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse bg-[#121212] border border-[#222] rounded overflow-hidden">
                <thead className="bg-[#1A1A1A] text-[#888] border-b border-[#2A2A2A] text-[10px] uppercase font-bold tracking-widest">
                  <tr>
                    <th className="py-2 px-3">Kode Simbol</th>
                    <th className="py-2 px-3">Fungsi / Arti Notasi</th>
                    <th className="py-2 px-3">Jangkauan & Penempatan</th>
                    <th className="py-2 px-3">Contoh Penggunaan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A1A1A] font-mono text-xs">
                  <tr>
                    <td className="py-2 px-3 text-[#C5A059] font-bold">(tanpa flag)</td>
                    <td className="py-2 px-3 text-[#E0E0E0]">1 ketuk (default)</td>
                    <td className="py-2 px-3 text-[#888]">Quarter note (1/4)</td>
                    <td className="py-2 px-3 text-[#666]">1 2 3 4 (4 ketuk)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-[#C5A059] font-bold">j</td>
                    <td className="py-2 px-3 text-[#E0E0E0]">Flag 1/2 ketuk</td>
                    <td className="py-2 px-3 text-[#888]">Eighth note (1/8)</td>
                    <td className="py-2 px-3 text-[#666]">j12 (masing-masing 1/2 ketuk)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-[#C5A059] font-bold">k</td>
                    <td className="py-2 px-3 text-[#E0E0E0]">Flag 1/4 ketuk</td>
                    <td className="py-2 px-3 text-[#888]">Sixteenth note (1/16)</td>
                    <td className="py-2 px-3 text-[#666]">k1234 (masing-masing 1/4 ketuk)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-[#C5A059] font-bold">b</td>
                    <td className="py-2 px-3 text-[#E0E0E0]">Garis Nilai 1 Not</td>
                    <td className="py-2 px-3 text-[#888]">Garis di atas 1 not (pendek)</td>
                    <td className="py-2 px-3 text-[#666]">b1 (garis nilai sepanjang 1 not)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-[#C5A059] font-bold">h</td>
                    <td className="py-2 px-3 text-[#E0E0E0]">Garis Nilai 2 Not (Lebih Tinggi)</td>
                    <td className="py-2 px-3 text-[#888]">Garis di atas 2 not, posisi lebih tinggi dari b</td>
                    <td className="py-2 px-3 text-[#666]">h12 (garis nilai sepanjang 2 not)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-[#C5A059] font-bold">f</td>
                    <td className="py-2 px-3 text-[#E0E0E0]">Garis Lengkung Kecil 2 Not (Atas)</td>
                    <td className="py-2 px-3 text-[#888]">Legato / slur atas 2 not berdekatan</td>
                    <td className="py-2 px-3 text-[#666]">f12 (lengkung kecil antara not 1 dan 2)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-[#C5A059] font-bold">g</td>
                    <td className="py-2 px-3 text-[#E0E0E0]">Garis Lengkung Besar (Atas)</td>
                    <td className="py-2 px-3 text-[#888]">3 not tanpa spasi, atau 2 not dengan spasi</td>
                    <td className="py-2 px-3 text-[#666]">g123 (3 not) atau g 1 2 (2 not berjarak)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-cyan-400 font-bold">z</td>
                    <td className="py-2 px-3 text-[#E0E0E0]">Awal Lengkung Bawah (Custom Under-Slur Start)</td>
                    <td className="py-2 px-3 text-[#888]">Titik awal garis lengkung di bawah not</td>
                    <td className="py-2 px-3 text-[#666]">z1 (atau z12 untuk 2 not otomatis)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-cyan-400 font-bold">x</td>
                    <td className="py-2 px-3 text-[#E0E0E0]">Sambungan Lengkung Bawah (Under-Slur Middle)</td>
                    <td className="py-2 px-3 text-[#888]">Garis sambungan tengah di bawah not</td>
                    <td className="py-2 px-3 text-[#666]">z1 x2 c3 (not 2 adalah sambungan)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-cyan-400 font-bold">c</td>
                    <td className="py-2 px-3 text-[#E0E0E0]">Akhir Lengkung Bawah (Under-Slur End)</td>
                    <td className="py-2 px-3 text-[#888]">Titik penutup garis lengkung di bawah not</td>
                    <td className="py-2 px-3 text-[#666]">z1 c2 atau z1 x2 c3</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-emerald-400 font-bold">v .. m</td>
                    <td className="py-2 px-3 text-[#E0E0E0]">Lengkung Atas Custom (v: Awal, m: Akhir)</td>
                    <td className="py-2 px-3 text-[#888]">Garis lengkung custom di atas not (v awal, b sambung, m akhir)</td>
                    <td className="py-2 px-3 text-[#666]">v1 b2 m3 atau v1 m2</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Structural & SATB */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#141414] p-4 rounded border border-[#222] space-y-2">
              <h5 className="font-bold text-xs uppercase tracking-wider text-[#E0E0E0]">Simbol Struktural & Dinamika</h5>
              <ul className="space-y-1.5 text-[#888] font-mono text-[11px]">
                <li><b className="text-[#C5A059]">.</b> : Perpanjang nada sebelumnya (Sustain/Tie)</li>
                <li><b className="text-[#C5A059]">|</b> atau <b className="text-[#C5A059]">)</b> : Garis bar tunggal</li>
                <li><b className="text-[#C5A059]">_</b> atau <b className="text-[#C5A059]">(</b> : Garis bar ganda (akhir bagian)</li>
                <li><b className="text-[#C5A059]">[</b> atau <b className="text-[#C5A059]">&#123;</b> : Awal tanda ulang (repeat start)</li>
                <li><b className="text-[#C5A059]">]</b> atau <b className="text-[#C5A059]">&#125;</b> : Akhir tanda ulang (repeat end)</li>
                <li><b className="text-[#C5A059]">d</b> / <b className="text-[#C5A059]">D</b> : Fermata (durasi diperpanjang)</li>
              </ul>
            </div>

            <div className="bg-[#141414] p-4 rounded border border-[#222] space-y-2">
              <h5 className="font-bold text-xs uppercase tracking-wider text-[#E0E0E0]">Label Partitur SATB (Titik & Titik Dua)</h5>
              <ul className="space-y-1.5 text-[#888] text-[11px]">
                <li><b className="text-blue-400 font-mono">S.</b> atau <b className="text-blue-400 font-mono">S:</b> Suara Soprano</li>
                <li><b className="text-rose-400 font-mono">A.</b> atau <b className="text-rose-400 font-mono">A:</b> Suara Alto</li>
                <li><b className="text-emerald-400 font-mono">T.</b> atau <b className="text-emerald-400 font-mono">T:</b> Suara Tenor</li>
                <li><b className="text-sky-400 font-mono">B.</b> atau <b className="text-sky-400 font-mono">B:</b> Suara Bass</li>
                <li><b className="text-[#C5A059] font-mono">Judul:</b> Judul partitur</li>
                <li><b className="text-[#C5A059] font-mono">Nada Dasar:</b> Do = C / F / G / Bb, dll</li>
                <li><b className="text-[#C5A059] font-mono">Tempo:</b> Angka BPM (misal: 100)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#222] bg-[#0A0A0A] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#C5A059] hover:bg-[#E0B86C] text-black text-xs font-bold rounded uppercase tracking-wider transition"
          >
            Kembali ke Editor
          </button>
        </div>
      </div>
    </div>
  );
};
