import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { LanguageCode } from '../../types/database';
import { isRtl } from '../../lib/i18n';

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
  const rtl = isRtl(currentLang);

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
    <div
      ref={dropdownRef}
      dir={rtl ? 'rtl' : 'ltr'}
      className="relative inline-block text-start"
      id="public-language-selector"
    >
      {/* Dropdown trigger button */}
      <button
        type="button"
        id="language-selector-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        className={
          variant === 'capsule'
            ? 'px-2.5 py-1 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer select-none active:scale-95 shadow-xs'
            : 'px-3 py-1.5 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white border border-white/20 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer select-none active:scale-95'
        }
        aria-label="Sélectionner la langue / Select language / اختر اللغة"
        aria-expanded={isOpen}
      >
        <span className="text-sm shrink-0">{activeLang.flag}</span>
        <span className="font-semibold">{activeLang.fullLabel}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-white/80 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown options */}
      {isOpen && (
        <div
          dir={rtl ? 'rtl' : 'ltr'}
          className={`absolute ${
            rtl ? 'left-0' : 'right-0'
          } mt-2 w-44 rounded-2xl bg-white/95 backdrop-blur-md shadow-2xl border border-stone-200/90 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150`}
        >
          {LANGUAGES.map((lang) => {
            const isActive = currentLang === lang.code;
            return (
              <button
                key={lang.code}
                id={`lang-option-${lang.code}`}
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-orange-50 text-[#FF6B00] font-bold shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base leading-none">{lang.flag}</span>
                  <span className="text-xs font-semibold">{lang.fullLabel}</span>
                </div>
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-[#FF6B00]" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

