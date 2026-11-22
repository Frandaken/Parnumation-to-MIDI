import React from 'react';
import { X, BookOpen, Music, Code, HelpCircle, Layers, Check } from 'lucide-react';

interface CheatsheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheatsheetModal: React.FC<CheatsheetModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-fadeIn">
      <div data-ui="modal" className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
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
            <h4 className="font-semibold text-xs text-[#C5A059] flex items-center space-x-2">
              <Music className="w-3.5 h-3.5" />
              <span>A. Notasi Nada Dasar & Oktaf</span>
            </h4>
            <div className="overflow-x-auto">
              <table data-ui="reference-table" className="w-full text-left text-xs bg-[#141519] rounded-lg overflow-hidden">
                <thead className="bg-[#1A1B20] text-[#9CA3AF] text-xs font-medium">
                  <tr>
                    <th className="py-2.5 px-3">Karakter Keyboard</th>
                    <th className="py-2.5 px-3">Artian Nada (Solfège)</th>
                    <th className="py-2.5 px-3">Tingkat Oktaf</th>
                    <th className="py-2.5 px-3">Contoh Nada (Do=C)</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-[#9CA3AF]">
                  <tr>
                    <td className="py-2 px-3 text-[#C5A059] font-semibold"><code>1 2 3 4 5 6 7</code></td>
                    <td className="py-2 px-3 text-[#E5E7EB]">do - si</td>
                    <td className="py-2 px-3 text-[#9CA3AF]">Oktaf Tengah (Polos)</td>
                    <td className="py-2 px-3 text-[#6B7280]">C4, D4, E4, F4, G4, A4, B4</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-[#C5A059] font-semibold"><code>! @ # $ % ^ &amp;</code></td>
                    <td className="py-2 px-3 text-[#E5E7EB]">do - si (Shift+1-7)</td>
                    <td className="py-2 px-3 text-[#9CA3AF]">Oktaf Tinggi (+1, titik atas)</td>
                    <td className="py-2 px-3 text-[#6B7280]">C5, D5, E5, F5, G5, A5, B5</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-[#C5A059] font-semibold"><code>q w e r t y u</code></td>
                    <td className="py-2 px-3 text-[#E5E7EB]">do - si</td>
                    <td className="py-2 px-3 text-[#9CA3AF]">Oktaf Rendah (-1, titik bawah)</td>
                    <td className="py-2 px-3 text-[#6B7280]">C3, D3, E3, F3, G3, A3, B3</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-[#C5A059] font-semibold"><code>s1 s2 s3 s4 s5 s6 s7</code></td>
                    <td className="py-2 px-3 text-[#E5E7EB]">do - si (Prefix s)</td>
                    <td className="py-2 px-3 text-[#9CA3AF]">Modifier Oktaf Rendah (-1 oktaf)</td>
                    <td className="py-2 px-3 text-[#6B7280]">s1 = q (C3), s5 = t (G3)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-[#C5A059] font-semibold"><code>9 (suffix, misal: 19)</code></td>
                    <td className="py-2 px-3 text-[#E5E7EB]">Modifier Oktaf</td>
                    <td className="py-2 px-3 text-[#9CA3AF]">+2 Oktaf dari tengah</td>
                    <td className="py-2 px-3 text-[#6B7280]">C6</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-[#C5A059] font-semibold"><code>8 (suffix, misal: q8)</code></td>
                    <td className="py-2 px-3 text-[#E5E7EB]">Modifier Oktaf</td>
                    <td className="py-2 px-3 text-[#9CA3AF]">-2 Oktaf dari tengah</td>
                    <td className="py-2 px-3 text-[#6B7280]">C2</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-[#C5A059] font-semibold"><code>0</code></td>
                    <td className="py-2 px-3 text-[#E5E7EB]">Rest / Diam</td>
                    <td className="py-2 px-3 text-[#9CA3AF]">-</td>
                    <td className="py-2 px-3 text-[#6B7280]">Diam sesuai durasi aktif</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 1.5: Accidentals / Tanda Kromatis */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-xs text-[#C5A059] flex items-center space-x-2">
              <Music className="w-3.5 h-3.5" />
              <span>B. Tanda Kromatis / Kres & Mol (/ dan \)</span>
            </h4>
            <div className="overflow-x-auto">
              <table data-ui="reference-table" className="w-full text-left text-xs bg-[#141519] rounded-lg overflow-hidden">
                <thead className="bg-[#1A1B20] text-[#9CA3AF] text-xs font-medium">
                  <tr>
                    <th className="py-2.5 px-3">Prefiks</th>
                    <th className="py-2.5 px-3">Fungsi / Perubahan Nada</th>
                    <th className="py-2.5 px-3">Sebutan Solfège</th>
                    <th className="py-2.5 px-3">Contoh Notasi</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-[#9CA3AF]">
                  <tr>
                    <td className="py-2 px-3 text-[#C5A059] font-semibold"><code>/ (garis miring kanan)</code></td>
                    <td className="py-2 px-3 text-[#E5E7EB]">Naik 1/2 Nada (Kres / Sharp)</td>
                    <td className="py-2 px-3 text-[#9CA3AF]">di, ri, fi, sel, lis</td>
                    <td className="py-2 px-3 text-[#6B7280]"><code>/5 (sel), /1 (di), /2 (ri), /4 (fi), /6 (lis)</code></td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-[#C5A059] font-semibold"><code>\ (garis miring kiri)</code></td>
                    <td className="py-2 px-3 text-[#E5E7EB]">Turun 1/2 Nada (Mol / Flat)</td>
                    <td className="py-2 px-3 text-[#9CA3AF]">ra, me, se, le, sa</td>
                    <td className="py-2 px-3 text-[#6B7280]"><code>\7 (sa), \3 (me), \6 (le), \5 (se), \2 (ra)</code></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Durations, Beams & Slurs */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-xs text-[#C5A059] flex items-center space-x-2">
              <Code className="w-3.5 h-3.5" />
              <span>C. Durasi, Garis Nilai (Beam) & Garis Lengkung (Slur)</span>
            </h4>
            <div className="overflow-x-auto">
              <table data-ui="reference-table" className="w-full text-left text-xs bg-[#141519] rounded-lg overflow-hidden">
                <thead className="bg-[#1A1B20] text-[#9CA3AF] text-xs font-medium">
                  <tr>
                    <th className="py-2.5 px-3">Kode Simbol</th>
                    <th className="py-2.5 px-3">Fungsi / Arti Notasi</th>
                    <th className="py-2.5 px-3">Jangkauan & Penempatan</th>
                    <th className="py-2.5 px-3">Contoh Penggunaan</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-[#9CA3AF]">
                  <tr>
                    <td className="py-2 px-3 text-[#C5A059] font-semibold"><code>(tanpa flag)</code></td>
                    <td className="py-2 px-3 text-[#E5E7EB]">1 ketuk (default)</td>
                    <td className="py-2 px-3 text-[#9CA3AF]">Quarter note (1/4)</td>
                    <td className="py-2 px-3 text-[#6B7280]"><code>1 2 3 4</code> (4 ketuk)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-[#C5A059] font-semibold"><code>j</code></td>
                    <td className="py-2 px-3 text-[#E5E7EB]">Flag 1/2 ketuk</td>
                    <td className="py-2 px-3 text-[#9CA3AF]">Eighth note (1/8)</td>
                    <td className="py-2 px-3 text-[#6B7280]"><code>j12</code> (masing-masing 1/2 ketuk)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-[#C5A059] font-semibold"><code>k</code></td>
                    <td className="py-2 px-3 text-[#E5E7EB]">Flag 1/4 ketuk</td>
                    <td className="py-2 px-3 text-[#9CA3AF]">Sixteenth note (1/16)</td>
                    <td className="py-2 px-3 text-[#6B7280]"><code>k1234</code> (masing-masing 1/4 ketuk)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-[#C5A059] font-semibold"><code>b</code></td>
                    <td className="py-2 px-3 text-[#E5E7EB]">Garis Nilai 1 Not</td>
                    <td className="py-2 px-3 text-[#9CA3AF]">Garis di atas 1 not (pendek)</td>
                    <td className="py-2 px-3 text-[#6B7280]"><code>b1</code> (garis nilai sepanjang 1 not)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-[#C5A059] font-semibold"><code>h</code></td>
                    <td className="py-2 px-3 text-[#E5E7EB]">Garis Nilai 2 Not (Lebih Tinggi)</td>
                    <td className="py-2 px-3 text-[#9CA3AF]">Garis di atas 2 not, posisi lebih tinggi dari b</td>
                    <td className="py-2 px-3 text-[#6B7280]"><code>h12</code> (garis nilai sepanjang 2 not)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-[#C5A059] font-semibold"><code>f</code></td>
                    <td className="py-2 px-3 text-[#E5E7EB]">Garis Lengkung Kecil 2 Not (Atas)</td>
                    <td className="py-2 px-3 text-[#9CA3AF]">Legato / slur atas 2 not berdekatan</td>
                    <td className="py-2 px-3 text-[#6B7280]"><code>f12</code> (lengkung kecil antara not 1 dan 2)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-[#C5A059] font-semibold"><code>g</code></td>
                    <td className="py-2 px-3 text-[#E5E7EB]">Garis Lengkung Besar (Atas)</td>
                    <td className="py-2 px-3 text-[#9CA3AF]">3 not tanpa spasi, atau 2 not dengan spasi</td>
                    <td className="py-2 px-3 text-[#6B7280]"><code>g123</code> (3 not) atau <code>g 1 2</code> (2 not berjarak)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-cyan-400 font-semibold"><code>z</code></td>
                    <td className="py-2 px-3 text-[#E5E7EB]">Awal Lengkung Bawah (Custom Under-Slur Start)</td>
                    <td className="py-2 px-3 text-[#9CA3AF]">Titik awal garis lengkung di bawah not</td>
                    <td className="py-2 px-3 text-[#6B7280]"><code>z1</code> (atau <code>z12</code> untuk 2 not otomatis)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-cyan-400 font-semibold"><code>x</code></td>
                    <td className="py-2 px-3 text-[#E5E7EB]">Sambungan Lengkung Bawah (Under-Slur Middle)</td>
                    <td className="py-2 px-3 text-[#9CA3AF]">Garis sambungan tengah di bawah not</td>
                    <td className="py-2 px-3 text-[#6B7280]"><code>z1 x2 c3</code> (not 2 adalah sambungan)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-cyan-400 font-semibold"><code>c</code></td>
                    <td className="py-2 px-3 text-[#E5E7EB]">Akhir Lengkung Bawah (Under-Slur End)</td>
                    <td className="py-2 px-3 text-[#9CA3AF]">Titik penutup garis lengkung di bawah not</td>
                    <td className="py-2 px-3 text-[#6B7280]"><code>z1 c2</code> atau <code>z1 x2 c3</code></td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-emerald-400 font-semibold"><code>v .. m</code></td>
                    <td className="py-2 px-3 text-[#E5E7EB]">Lengkung Atas Custom (v: Awal, m: Akhir)</td>
                    <td className="py-2 px-3 text-[#9CA3AF]">Garis lengkung custom di atas not (v awal, b sambung, m akhir)</td>
                    <td className="py-2 px-3 text-[#6B7280]"><code>v1 b2 m3</code> atau <code>v1 m2</code></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Structural & SATB */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#141519] p-4 rounded-lg space-y-2">
              <h5 className="font-semibold text-xs text-[#E5E7EB]">Simbol Struktural & Dinamika</h5>
              <ul className="space-y-1.5 text-[#9CA3AF] text-xs">
                <li><code className="text-[#C5A059]">.</code> : Perpanjang nada sebelumnya (Sustain/Tie)</li>
                <li><code className="text-[#C5A059]">|</code> atau <code className="text-[#C5A059]">)</code> : Garis bar tunggal</li>
                <li><code className="text-[#C5A059]">_</code> atau <code className="text-[#C5A059]">(</code> : Garis bar ganda (akhir bagian)</li>
                <li><code className="text-[#C5A059]">[</code> atau <code className="text-[#C5A059]">&#123;</code> : Awal tanda ulang (repeat start)</li>
                <li><code className="text-[#C5A059]">]</code> atau <code className="text-[#C5A059]">&#125;</code> : Akhir tanda ulang (repeat end)</li>
                <li><code className="text-[#C5A059]">d</code> / <code className="text-[#C5A059]">D</code> : Fermata (durasi diperpanjang)</li>
              </ul>
            </div>

            <div className="bg-[#141519] p-4 rounded-lg space-y-2">
              <h5 className="font-semibold text-xs text-[#E5E7EB]">Label Partitur SATB (Titik & Titik Dua)</h5>
              <ul className="space-y-1.5 text-[#9CA3AF] text-xs">
                <li><code className="text-blue-400 font-bold">S.</code> atau <code className="text-blue-400 font-bold">S:</code> Suara Soprano</li>
                <li><code className="text-rose-400 font-bold">A.</code> atau <code className="text-rose-400 font-bold">A:</code> Suara Alto</li>
                <li><code className="text-emerald-400 font-bold">T.</code> atau <code className="text-emerald-400 font-bold">T:</code> Suara Tenor</li>
                <li><code className="text-sky-400 font-bold">B.</code> atau <code className="text-sky-400 font-bold">B:</code> Suara Bass</li>
                <li><code className="text-[#C5A059] font-bold">Judul:</code> Judul partitur</li>
                <li><code className="text-[#C5A059] font-bold">Nada Dasar:</code> Do = C / F / G / Bb, dll</li>
                <li><code className="text-[#C5A059] font-bold">Tempo:</code> Angka BPM (misal: 100)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#0A0A0A] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#C5A059] hover:bg-[#E0B86C] text-black text-xs font-semibold rounded-md transition-colors active:scale-[0.98]"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
