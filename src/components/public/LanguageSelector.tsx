import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { LanguageCode } from '../../types/database';
import { isRtl } from '../../lib/i18n';

interface LanguageSelectorProps {
  currentLang: LanguageCode;
  onChange: (lang: LanguageCode) => void;
  variant?: 'pill' | 'capsule';
}

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  name: string;
  flag: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'fr', label: 'FR', name: 'Français', flag: '🇫🇷' },
  { code: 'ar', label: 'MA - العربية', name: 'العربية', flag: '🇲🇦' },
  { code: 'en', label: 'GB - English', name: 'English', flag: '🇬🇧' },
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLang,
  onChange,
  variant = 'capsule',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const rtl = isRtl(currentLang);

  const activeLang = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  const handleSelectLanguage = (code: LanguageCode, e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    // 1. Store in localStorage immediately
    try {
      localStorage.setItem('touchbizz_menu_lang', code);
      localStorage.setItem('selected_language', code);
      localStorage.setItem('touchbizz_lang', code);
    } catch {
      // ignore
    }

    // 2. Synchronize document direction and lang attribute immediately
    document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = code;

    // 3. Update parent state
    onChange(code);
    setIsOpen(false);
  };

  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      className="relative inline-block text-start"
      id="public-language-selector"
    >
      {/* Dropdown trigger button */}
      <button
        type="button"
        id="language-selector-trigger"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className={
          variant === 'capsule'
            ? 'px-2.5 py-1 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer select-none active:scale-95 shadow-xs'
            : 'px-3 py-1.5 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white border border-white/20 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer select-none active:scale-95'
        }
        aria-label="Sélectionner la langue / Select language / اختر اللغة"
        aria-expanded={isOpen}
      >
        <span className="text-sm shrink-0">{activeLang.flag}</span>
        <span className="font-semibold text-xs tracking-tight">{activeLang.label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-white/80 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown options with transparent backdrop to prevent race conditions */}
      {isOpen && (
        <>
          {/* Backdrop overlay catching clicks outside cleanly */}
          <div
            className="fixed inset-0 z-40 bg-transparent cursor-default"
            aria-hidden="true"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen(false);
            }}
          />

          {/* Options menu */}
          <div
            dir={rtl ? 'rtl' : 'ltr'}
            className={`absolute ${
              rtl ? 'left-0' : 'right-0'
            } mt-2 w-48 rounded-2xl bg-white shadow-2xl border border-stone-200 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150`}
          >
            {LANGUAGES.map((lang) => {
              const isActive = currentLang === lang.code;
              return (
                <button
                  key={lang.code}
                  id={`lang-option-${lang.code}`}
                  data-lang={lang.code}
                  type="button"
                  onMouseDown={(e) => handleSelectLanguage(lang.code, e)}
                  onClick={(e) => handleSelectLanguage(lang.code, e)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer select-none ${
                    isActive
                      ? 'bg-orange-50 text-[#FF6B00] font-bold shadow-2xs'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base leading-none shrink-0">{lang.flag}</span>
                    <span className="text-xs font-semibold">{lang.label}</span>
                  </div>
                  {isActive ? (
                    <Check className="w-3.5 h-3.5 text-[#FF6B00] shrink-0" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

