import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, Sparkles, RefreshCw, ChevronDown, Wand2 } from 'lucide-react';
import { PRESET_SONGS } from '../lib/presets';
import { PresetSong } from '../types';

interface NavbarProps {
  onSelectPreset: (preset: PresetSong) => void;
  onOpenCheatsheet: () => void;
  onOpenNoteGenerator: () => void;
  onReset: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSelectPreset,
  onOpenCheatsheet,
  onOpenNoteGenerator,
  onReset,
}) => {
  const [isPresetOpen, setIsPresetOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsPresetOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-[#0F0F0F] border-b border-[#2A2A2A] text-[#E0E0E0] sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center space-x-3.5">
          <div className="w-8 h-8 rounded-full border-2 border-[#C5A059] flex items-center justify-center flex-shrink-0">
            <div className="w-1 h-4 bg-[#C5A059] rounded-full rotate-12"></div>
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-base sm:text-lg tracking-widest font-light text-white font-serif uppercase">
                PARNUMATION
              </h1>
              <span className="text-[10px] tracking-widest uppercase font-mono px-2 py-0.5 rounded border border-[#C5A059]/40 text-[#C5A059] bg-[#C5A059]/10">
                v1.04 SATB
              </span>
            </div>
            <p className="text-[10px] text-[#888] tracking-wider uppercase hidden sm:block">
              QWERTY Number Notation to MIDI Engine
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Preset Selector */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsPresetOpen(prev => !prev)}
              className="flex items-center bg-[#1A1A1A] border border-[#333] hover:border-[#C5A059] rounded px-3 py-1.5 text-xs text-[#E0E0E0] cursor-pointer transition-colors"
              aria-expanded={isPresetOpen}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059] mr-1.5" />
              <span className="font-medium text-[11px] uppercase tracking-wider">Contoh Lagu</span>
              <ChevronDown className={`w-3 h-3 ml-1.5 text-[#888] transition-transform ${isPresetOpen ? 'rotate-180 text-[#C5A059]' : ''}`} />
            </button>

            {isPresetOpen && (
              <div className="absolute right-0 top-full pt-1.5 w-80 z-50 animate-fadeIn">
                <div className="bg-[#121212] border border-[#2A2A2A] rounded shadow-2xl p-2 max-h-[80vh] overflow-y-auto">
                  <div className="text-[10px] font-bold text-[#C5A059] px-2 py-1 uppercase tracking-widest border-b border-[#222] mb-1 flex items-center justify-between">
                    <span>Pilih Preset Notasi</span>
                    <span className="text-[9px] text-[#707070] font-mono">{PRESET_SONGS.length} lagu</span>
                  </div>
                  <div className="space-y-1 mt-1">
                    {PRESET_SONGS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => {
                          onSelectPreset(preset);
                          setIsPresetOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-2 rounded hover:bg-[#1A1A1A] transition group border border-transparent hover:border-[#333]"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-[#E0E0E0] group-hover:text-[#C5A059]">
                            {preset.title}
                          </span>
                          <span className="text-[10px] bg-[#1A1A1A] text-[#888] px-1.5 py-0.5 rounded font-mono">
                            {preset.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#707070] truncate mt-0.5">
                          {preset.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Not Generator & Calculator Button */}
          <button
            onClick={onOpenNoteGenerator}
            className="flex items-center space-x-1.5 bg-[#C5A059]/10 hover:bg-[#C5A059]/20 border border-[#C5A059]/40 hover:border-[#C5A059] text-[#C5A059] text-[11px] uppercase tracking-wider px-3 py-1.5 rounded transition-colors font-semibold"
            title="Kalkulator & Generator Notasi (Not Balok <-> Solfège)"
          >
            <Wand2 className="w-3.5 h-3.5 text-[#C5A059]" />
            <span className="hidden sm:inline">Not Generator</span>
          </button>

          {/* Cheatsheet Guide Button */}
          <button
            onClick={onOpenCheatsheet}
            className="flex items-center space-x-1.5 bg-[#1A1A1A] hover:bg-[#222] border border-[#333] hover:border-[#C5A059] text-[#E0E0E0] text-[11px] uppercase tracking-wider px-3 py-1.5 rounded transition-colors font-medium"
            title="Panduan Sintaks Parnumation"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#C5A059]" />
            <span className="hidden sm:inline">Panduan Notasi</span>
          </button>

          {/* Reset Button */}
          <button
            onClick={onReset}
            className="flex items-center space-x-1 bg-[#1A1A1A] hover:bg-[#222] border border-[#333] hover:border-[#C5A059] text-[#A0A0A0] hover:text-white text-[11px] uppercase tracking-wider p-2 sm:px-3 sm:py-1.5 rounded transition-colors"
            title="Kosongkan Teks"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Status Indicator */}
          <div className="hidden md:flex px-2.5 py-1 rounded bg-[#C5A059] text-black font-bold text-[10px] uppercase tracking-widest">
            MIDI Active
          </div>
        </div>
      </div>
    </header>
  );
};
