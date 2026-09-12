import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { LanguageCode } from '../../types/database';

interface LanguageSelectorProps {
  currentLang: LanguageCode;
  onChange: (lang: LanguageCode) => void;
  variant?: 'pill' | 'capsule';
}

const LANGUAGES: { code: LanguageCode; label: string; fullLabel: string; flag: string }[] = [
  { code: 'fr', label: 'FR', fullLabel: 'Français', flag: '🇫🇷' },
  { code: 'ar', label: 'العربية', fullLabel: 'العربية', flag: '🇲🇦' },
  { code: 'en', label: 'EN', fullLabel: 'English', flag: '🇬🇧' },
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLang,
  onChange,
  variant = 'capsule',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeLang = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative inline-block text-left" id="public-language-selector">
      {/* Dropdown trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={
          variant === 'capsule'
            ? 'px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer select-none active:scale-95'
            : 'px-3 py-1.5 rounded-full bg-black/45 hover:bg-black/60 backdrop-blur-md text-white border border-white/20 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer select-none active:scale-95'
        }
        aria-label="Sélectionner la langue"
      >
        <span>{activeLang.fullLabel}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-white/80 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown options */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-2xl bg-white shadow-2xl border border-stone-200 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          {LANGUAGES.map((lang) => {
            const isActive = currentLang === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  onChange(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-orange-50 text-[#FF6B00] font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <span>{lang.fullLabel}</span>
                </div>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00]" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
