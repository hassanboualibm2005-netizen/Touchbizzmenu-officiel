import React, { useState } from 'react';
import {
  X,
  Store,
  Globe,
  Phone,
  MapPin,
  Sparkles,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Restaurant, ThemeId } from '../../types/database';
import { createEstablishment } from '../../lib/api';

interface AddEstablishmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  ownerId: string;
  onSuccess: (newEstablishment: Restaurant) => void;
  existingSlugs?: string[];
}

interface ThemeOption {
  id: ThemeId;
  name: string;
  arabicName: string;
  description: string;
  primaryColor: string;
  accentBg: string;
  textColor: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'classic',
    name: 'Classique Royal',
    arabicName: 'كلاسيكي متوازن',
    description: 'Bleu cobalt & design épuré intemporel',
    primaryColor: '#2563eb',
    accentBg: 'bg-blue-600',
    textColor: 'text-blue-600',
  },
  {
    id: 'moroccan',
    name: 'Marocain Chaleureux',
    arabicName: 'مغربي أصيل',
    description: 'Nuances terracotta & esprit zellige',
    primaryColor: '#ea580c',
    accentBg: 'bg-amber-600',
    textColor: 'text-amber-600',
  },
  {
    id: 'luxury',
    name: 'Lounge Gastronomique',
    arabicName: 'فاخر راقي',
    description: 'Sombre & finitions or brossé prestige',
    primaryColor: '#d97706',
    accentBg: 'bg-amber-500',
    textColor: 'text-amber-500',
  },
  {
    id: 'minimal',
    name: 'Minimaliste Pur',
    arabicName: 'بسيط عصري',
    description: 'Typographie haute lisibilité et blanc pur',
    primaryColor: '#0f172a',
    accentBg: 'bg-slate-900',
    textColor: 'text-slate-900',
  },
  {
    id: 'bistro',
    name: 'Bistrot & Brasserie',
    arabicName: 'بسترو دافئ',
    description: 'Tons bordeaux & ambiance chaleureuse',
    primaryColor: '#be123c',
    accentBg: 'bg-rose-700',
    textColor: 'text-rose-700',
  },
];

export const AddEstablishmentModal: React.FC<AddEstablishmentModalProps> = ({
  isOpen,
  onClose,
  ownerId,
  onSuccess,
  existingSlugs = [],
}) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>('classic');
  const [currency, setCurrency] = useState('DH');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Auto-generate slug from name if not manually modified
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isSlugManuallyEdited) {
      const generated = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generated);
    }
  };

  const handleSlugChange = (val: string) => {
    setIsSlugManuallyEdited(true);
    const sanitized = val
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-');
    setSlug(sanitized);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = name.trim();
    const cleanSlug = slug.trim().replace(/^-+|-+$/g, '');

    if (!trimmedName) {
      setErrorMessage("Veuillez saisir le nom de l'établissement.");
      return;
    }

    if (!cleanSlug || cleanSlug.length < 2) {
      setErrorMessage("L'identifiant URL (slug) doit contenir au moins 2 caractères valides.");
      return;
    }

    if (existingSlugs.map((s) => s.toLowerCase()).includes(cleanSlug.toLowerCase())) {
      setErrorMessage(`L'identifiant "${cleanSlug}" est déjà utilisé par un autre établissement.`);
      return;
    }

    try {
      setLoading(true);
      const created = await createEstablishment({
        owner_id: ownerId,
        name: trimmedName,
        slug: cleanSlug,
        phone: phone.trim() || null,
        address: address.trim() || null,
        theme: selectedTheme,
        currency: currency.trim() || 'DH',
      });

      // Reset and close
      setName('');
      setSlug('');
      setIsSlugManuallyEdited(false);
      setPhone('');
      setAddress('');
      setSelectedTheme('classic');
      setCurrency('DH');

      onSuccess(created);
      onClose();
    } catch (err: any) {
      console.error('Error creating establishment:', err);
      setErrorMessage(err.message || "Une erreur est survenue lors de la création de l'établissement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Ajouter un établissement
              </h2>
              <p className="text-xs text-slate-500">
                Créez une nouvelle succursale ou un nouveau restaurant avec sa propre carte
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Name & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nom du restaurant <span className="text-red-500">*</span>
                <span className="text-slate-400 font-normal ml-1">/ اسم المطعم</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ex: La Table de Guéliz, Café Moka..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Devise
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-2xs"
              >
                <option value="DH">DH (Dirham)</option>
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
          </div>

          {/* 2. Slug / URL path */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Identifiant URL (Slug) <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent shadow-2xs">
              <span className="px-3.5 py-2.5 text-xs text-slate-400 font-mono select-none bg-slate-100 border-r border-slate-200">
                touchbizz.menu/r/
              </span>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="la-table-marrakech"
                className="flex-1 px-3.5 py-2.5 bg-transparent text-sm font-mono text-slate-800 focus:outline-hidden"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Ce lien unique servira à générer le QR code et sera accessible par vos clients.
            </p>
          </div>

          {/* 3. Phone & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Téléphone / الهاتف</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+212 5 24 43 00 00"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Adresse / العنوان</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="15 Rue de la Liberté, Marrakech"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* 4. Visual Theme Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Thème Visuel du Menu</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {THEME_OPTIONS.map((theme) => {
                const isSelected = selectedTheme === theme.id;
                return (
                  <div
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                            style={{ backgroundColor: theme.primaryColor }}
                          />
                          <span className="text-xs font-bold text-slate-800">
                            {theme.name}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        {theme.description}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{theme.arabicName}</span>
                      <span className="font-mono text-[9px] uppercase font-bold text-slate-500">
                        {theme.id}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Création en cours...</span>
                </>
              ) : (
                <>
                  <Store className="w-4 h-4" />
                  <span>Créer l'établissement</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
