import React, { useState } from 'react';
import { Palette, Check, Sparkles, ExternalLink } from 'lucide-react';
import { Restaurant, ThemeId } from '../../types/database';
import { THEMES, ThemeConfig } from '../../lib/themes';
import { saveRestaurantProfile } from '../../lib/api';

interface ThemeSelectorProps {
  restaurant: Restaurant;
  onThemeChanged: (updated: Restaurant) => void;
  onPreview: () => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  restaurant,
  onThemeChanged,
  onPreview,
}) => {
  const [selectedThemeId, setSelectedThemeId] = useState<ThemeId>(restaurant.theme || 'classic');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSelectTheme = async (themeId: ThemeId) => {
    setSelectedThemeId(themeId);
    try {
      setSaving(true);
      const updated = await saveRestaurantProfile({
        ...restaurant,
        theme: themeId,
      });
      onThemeChanged(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      console.error('Error updating theme:', err);
    } finally {
      setSaving(false);
    }
  };

  const themeList = Object.values(THEMES);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Palette className="w-6 h-6 text-blue-600" />
            Modèles & Thèmes Visuels
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Choisissez l’ambiance graphique de votre menu public. Le changement est instantané pour tous vos clients qui scannent le QR code.
          </p>
        </div>

        <button
          type="button"
          onClick={onPreview}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 flex items-center gap-2 self-start shadow-2xs"
        >
          <ExternalLink className="w-4 h-4 text-blue-600" />
          <span>Prévisualiser en direct</span>
        </button>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Thème visuel mis à jour avec succès ! Le menu public s’affiche désormais avec ce style.</span>
        </div>
      )}

      {/* Grid of 5 Visual Themes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {themeList.map((t) => {
          const isSelected = selectedThemeId === t.id;
          return (
            <div
              key={t.id}
              onClick={() => handleSelectTheme(t.id)}
              className={`rounded-3xl border-2 transition-all p-5 cursor-pointer flex flex-col justify-between relative shadow-xs hover:shadow-md ${
                isSelected
                  ? 'border-blue-600 bg-white ring-4 ring-blue-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div>
                {/* Header info */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {t.name}
                    </h3>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {t.nameEn}
                    </span>
                  </div>

                  {isSelected ? (
                    <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                      <Check className="w-4 h-4" />
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400 hover:text-blue-600">
                      Activer
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 mb-4 min-h-[32px]">
                  {t.description}
                </p>

                {/* Simulated Mini-Card Preview of Theme */}
                <div className={`p-3.5 rounded-2xl border transition-all ${t.classes.wrapper} border-black/10`}>
                  {/* Category pill demo */}
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] ${t.classes.navItemActive}`}>
                      Entrées
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] ${t.classes.navItemInactive}`}>
                      Plats
                    </span>
                  </div>

                  {/* Simulated Product Card */}
                  <div className={`p-2.5 rounded-xl border ${t.classes.card}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className={`text-xs font-bold ${t.classes.cardTitle}`}>
                          Tajine d'Agneau
                        </div>
                        <div className={`text-[10px] mt-0.5 ${t.classes.cardDescription}`}>
                          Pruneaux & amandes grillées
                        </div>
                      </div>
                      <div className={`text-xs font-black shrink-0 ${t.classes.cardPrice}`}>
                        95 DH
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer action */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {t.isDark ? 'Mode Sombre' : 'Mode Lumineux'}
                </span>

                <button
                  type="button"
                  disabled={saving && isSelected}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {isSelected ? 'Sélectionné' : 'Appliquer'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
