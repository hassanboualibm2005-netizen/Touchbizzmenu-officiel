import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  Check,
  AlertCircle,
  Link2,
  ExternalLink,
  Store,
  MapPin,
  Phone,
  FileText,
  Image as ImageIcon,
  Instagram,
  Facebook,
  Music2,
  Share2,
} from 'lucide-react';
import { Restaurant, ThemeId, OperatingHoursSchedule } from '../../types/database';
import { saveRestaurantProfile } from '../../lib/api';
import { uploadRestaurantAsset } from '../../lib/supabase';
import { THEMES } from '../../lib/themes';
import { OperatingHoursEditor } from './OperatingHoursEditor';
import { normalizeOperatingHours } from '../../lib/operatingHours';

interface RestaurantProfileProps {
  restaurant: Restaurant;
  onUpdate: (updated: Restaurant) => void;
  onPreview: () => void;
}

export const RestaurantProfile: React.FC<RestaurantProfileProps> = ({
  restaurant,
  onUpdate,
  onPreview,
}) => {
  const [name, setName] = useState(restaurant.name);
  const [slug, setSlug] = useState(restaurant.slug);
  const [description, setDescription] = useState(restaurant.description || '');
  const [address, setAddress] = useState(restaurant.address || '');
  const [phone, setPhone] = useState(restaurant.phone || '');
  const [facebookUrl, setFacebookUrl] = useState(restaurant.facebook_url || '');
  const [instagramUrl, setInstagramUrl] = useState(restaurant.instagram_url || '');
  const [tiktokUrl, setTiktokUrl] = useState(restaurant.tiktok_url || '');
  const [primaryColor, setPrimaryColor] = useState(restaurant.primary_color || '#2563eb');
  const [theme, setTheme] = useState<ThemeId>(restaurant.theme || 'classic');
  const [currency, setCurrency] = useState(restaurant.currency || 'DH');
  const [operatingHours, setOperatingHours] = useState<OperatingHoursSchedule>(() =>
    normalizeOperatingHours(restaurant.operating_hours || (restaurant as any).opening_hours)
  );

  useEffect(() => {
    setOperatingHours(
      normalizeOperatingHours(restaurant.operating_hours || (restaurant as any).opening_hours)
    );
  }, [restaurant.operating_hours, (restaurant as any).opening_hours]);

  const [logoUrl, setLogoUrl] = useState(restaurant.logo_url || '');
  const [coverUrl, setCoverUrl] = useState(restaurant.cover_image_url || '');

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [logoProgress, setLogoProgress] = useState(0);
  const [coverProgress, setCoverProgress] = useState(0);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-slugify when typing name if slug hasn't been manually set
  const handleNameChange = (val: string) => {
    setName(val);
  };

  // Upload Logo
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingLogo(true);
      setLogoProgress(10);
      const url = await uploadRestaurantAsset(file, `logo-${slug}`, setLogoProgress);
      setLogoUrl(url);
    } catch (err: any) {
      console.error('Logo upload error:', err);
      setErrorMessage("Erreur lors de l'envoi du logo: " + err.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  // Upload Cover Image
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingCover(true);
      setCoverProgress(10);
      const url = await uploadRestaurantAsset(file, `cover-${slug}`, setCoverProgress);
      setCoverUrl(url);
    } catch (err: any) {
      console.error('Cover upload error:', err);
      setErrorMessage("Erreur lors de l'envoi de la couverture: " + err.message);
    } finally {
      setUploadingCover(false);
    }
  };

  // Submit
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSavedSuccess(false);

    if (!name.trim()) {
      setErrorMessage("Le nom de l'établissement est requis.");
      return;
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    if (!cleanSlug) {
      setErrorMessage("L'identifiant URL (slug) est requis.");
      return;
    }

    try {
      setSaving(true);
      const updated = await saveRestaurantProfile({
        ...restaurant,
        name: name.trim(),
        slug: cleanSlug,
        description: description.trim() || null,
        address: address.trim() || null,
        phone: phone.trim() || null,
        facebook_url: facebookUrl.trim() || null,
        instagram_url: instagramUrl.trim() || null,
        tiktok_url: tiktokUrl.trim() || null,
        primary_color: primaryColor,
        theme,
        currency,
        operating_hours: operatingHours,
        logo_url: logoUrl || null,
        cover_image_url: coverUrl || null,
      });

      onUpdate(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      console.error('Save profile error:', err);
      setErrorMessage(err.message || 'Impossible d’enregistrer le profil.');
    } finally {
      setSaving(false);
    }
  };

  const publicUrl = `/r/${slug}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Mon établissement
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Personnalisez l’identité, la bannière, les coordonnées et l'adresse URL permanente.
          </p>
        </div>

        <button
          type="button"
          onClick={onPreview}
          className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 flex items-center gap-2 self-start shadow-2xs"
        >
          <ExternalLink className="w-4 h-4 text-blue-600" />
          <span>Voir en direct</span>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {savedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm flex items-center gap-3">
            <Check className="w-4 h-4 shrink-0" />
            <span>Modifications enregistrées avec succès !</span>
          </div>
        )}

        {/* 1. VISUAL BRANDING: COVER & LOGO */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-blue-600" />
            Photos & Identité Visuelle
          </h2>

          {/* Cover Photo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Image de couverture (bannière)
            </label>
            <div className="relative h-44 sm:h-52 w-full rounded-2xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center group">
              {coverUrl ? (
                <>
                  <img
                    src={coverUrl}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="cursor-pointer px-4 py-2 rounded-xl bg-white/90 text-slate-900 text-xs font-bold hover:bg-white transition-all shadow-md">
                      Remplacer l'image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center p-6 text-center w-full h-full">
                  <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-xs font-semibold text-slate-700">
                    Cliquez pour importer la photo de couverture
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1">
                    Recommandé: 1200x600px (JPG, PNG, WebP)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="hidden"
                  />
                </label>
              )}

              {uploadingCover && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex flex-col items-center justify-center">
                  <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${coverProgress}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-700">
                    Téléversement en cours... {coverProgress}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Logo Photo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Logo de l’établissement
            </label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Store className="w-8 h-8 text-slate-400" />
                )}
              </div>

              <div className="flex-1">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-all">
                  <UploadCloud className="w-4 h-4" />
                  <span>{logoUrl ? 'Changer le logo' : 'Téléverser un logo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-slate-400 mt-1">
                  Carré recommandé (minimum 300x300px)
                </p>
                {uploadingLogo && (
                  <div className="text-xs font-medium text-blue-600 mt-1">
                    Upload en cours ({logoProgress}%)...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2. GENERAL INFORMATIONS */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Store className="w-4 h-4 text-blue-600" />
            Informations Générales
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Restaurant Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nom du restaurant / café <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ex: Café Nakhil"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            {/* Permanent Slug / URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <Link2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Identifiant URL permanent (Slug)</span>
              </label>
              <div className="flex rounded-xl shadow-2xs border border-slate-200 focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 overflow-hidden">
                <span className="inline-flex items-center px-3 bg-slate-50 text-slate-400 text-xs font-mono border-r border-slate-200 select-none">
                  /r/
                </span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="cafe-nakhil"
                  className="flex-1 px-3 py-2.5 text-xs sm:text-sm font-mono text-slate-800 outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Lien public fixe: <span className="font-mono text-blue-600">https://menu.touchbizz.ma{publicUrl}</span>
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Description / Slogan
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Cuisine marocaine raffinée, pâtisseries artisanales & cafés d’exception..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* Address and Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Adresse physique</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ex: 24 Avenue Mohammed VI, Marrakech"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Téléphone de réservation / contact</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex: +212 5 24 00 00 00"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Devise affichée
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-600 focus:outline-none bg-white"
              >
                <option value="DH">Dirham Marocain (DH)</option>
                <option value="MAD">MAD</option>
                <option value="€">Euro (€)</option>
                <option value="$">Dollar ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Couleur d'accentuation
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 p-0.5"
                />
                <span className="text-xs font-mono text-slate-600 uppercase">
                  {primaryColor}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. RÉSEAUX SOCIAUX (Facebook, Instagram, TikTok) */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-blue-600" />
              <span>Réseaux Sociaux</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Connectez vos profils sociaux pour afficher des boutons d'accès direct sur votre carte digitale.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Instagram */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                  <Instagram className="w-3.5 h-3.5" />
                </span>
                <span>Lien Instagram</span>
              </label>
              <input
                id="restaurant-instagram-input"
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/votre_etablissement"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
              <p className="text-[11px] text-slate-400 mt-1">Ex: https://instagram.com/cafenakhil</p>
            </div>

            {/* Facebook */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Facebook className="w-3.5 h-3.5" />
                </span>
                <span>Lien Facebook</span>
              </label>
              <input
                id="restaurant-facebook-input"
                type="url"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                placeholder="https://facebook.com/votre_page"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
              <p className="text-[11px] text-slate-400 mt-1">Ex: https://facebook.com/cafenakhil</p>
            </div>

            {/* TikTok */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
                  <Music2 className="w-3.5 h-3.5" />
                </span>
                <span>Lien TikTok</span>
              </label>
              <input
                id="restaurant-tiktok-input"
                type="url"
                value={tiktokUrl}
                onChange={(e) => setTiktokUrl(e.target.value)}
                placeholder="https://tiktok.com/@votre_compte"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
              <p className="text-[11px] text-slate-400 mt-1">Ex: https://tiktok.com/@cafenakhil</p>
            </div>
          </div>
        </div>

        {/* 4. HORAIRES D'OUVERTURE (OPERATING HOURS) */}
        <OperatingHoursEditor
          value={operatingHours}
          onChange={setOperatingHours}
        />

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-sm active:scale-95 transition-all cursor-pointer disabled:opacity-60"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  );
};
