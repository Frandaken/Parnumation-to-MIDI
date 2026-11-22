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
    <header className="bg-[#0B0C0E] text-[#E5E7EB] sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center space-x-3.5">
          <div className="w-8 h-8 rounded-full bg-[#18191E] text-[#C5A059] flex items-center justify-center font-serif text-base font-bold select-none">
            §
          </div>
          <div>
            <div className="flex items-baseline space-x-2.5">
              <h1 className="text-base sm:text-lg tracking-wide font-normal text-white font-serif">
                Parnumation
              </h1>
              <span className="text-xs text-[#9CA3AF] tabular-nums font-normal">
                v1.04 SATB
              </span>
            </div>
            <p className="text-xs text-[#6B7280] hidden sm:block">
              Notasi Angka QWERTY to MIDI Synthesizer
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Preset Selector */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsPresetOpen(prev => !prev)}
              className="flex items-center bg-[#18191E] hover:bg-[#22242B] active:scale-[0.98] rounded-md px-3.5 py-2 text-xs text-[#E5E7EB] cursor-pointer transition-colors"
              aria-expanded={isPresetOpen}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059] mr-1.5" />
              <span className="font-medium text-xs">Contoh Lagu</span>
              <ChevronDown className={`w-3.5 h-3.5 ml-1.5 text-[#9CA3AF] transition-transform ${isPresetOpen ? 'rotate-180 text-[#C5A059]' : ''}`} />
            </button>

            {isPresetOpen && (
              <div className="absolute right-0 top-full pt-2 w-80 z-50">
                <div className="bg-[#141519] rounded-lg p-2 max-h-[80vh] overflow-y-auto">
                  <div className="text-xs font-medium text-[#C5A059] px-2.5 py-1.5 mb-1 flex items-center justify-between">
                    <span>Pilih Preset Notasi</span>
                    <span className="text-xs text-[#6B7280] tabular-nums">{PRESET_SONGS.length} lagu</span>
                  </div>
                  <div className="space-y-1">
                    {PRESET_SONGS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => {
                          onSelectPreset(preset);
                          setIsPresetOpen(false);
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-md hover:bg-[#20222A] transition group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-[#E5E7EB] group-hover:text-[#C5A059]">
                            {preset.title}
                          </span>
                          <span className="text-xs text-[#9CA3AF]">
                            {preset.category}
                          </span>
                        </div>
                        <p className="text-xs text-[#6B7280] truncate mt-0.5">
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
            className="flex items-center space-x-1.5 bg-[#2A2314] hover:bg-[#362C18] text-[#E0B86C] text-xs px-3.5 py-2 rounded-md transition-colors font-medium active:scale-[0.98]"
            title="Kalkulator & Generator Notasi (Not Balok <-> Solfège)"
          >
            <Wand2 className="w-3.5 h-3.5 text-[#C5A059]" />
            <span className="hidden sm:inline">Not Generator</span>
          </button>

          {/* Cheatsheet Guide Button */}
          <button
            onClick={onOpenCheatsheet}
            className="flex items-center space-x-1.5 bg-[#18191E] hover:bg-[#22242B] text-[#E5E7EB] text-xs px-3.5 py-2 rounded-md transition-colors font-medium active:scale-[0.98]"
            title="Panduan Sintaks Parnumation"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#C5A059]" />
            <span className="hidden sm:inline">Panduan Notasi</span>
          </button>

          {/* Reset Button */}
          <button
            onClick={onReset}
            className="flex items-center space-x-1 bg-[#18191E] hover:bg-[#22242B] text-[#9CA3AF] hover:text-white text-xs p-2 sm:px-3 sm:py-2 rounded-md transition-colors active:scale-[0.98]"
            title="Kosongkan Teks"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};
