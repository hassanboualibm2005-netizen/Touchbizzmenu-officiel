import React, { useState } from 'react';
import {
  ExternalLink,
  CheckCircle2,
  Circle,
  FolderTree,
  UtensilsCrossed,
  ScanText,
  QrCode,
  Globe,
  ArrowRight,
  Sparkles,
  Plus,
  Store,
} from 'lucide-react';
import { Restaurant, Category, MenuItem } from '../../types/database';
import { saveRestaurantProfile } from '../../lib/api';
import { AdminTab } from './AdminLayout';
import { EstablishmentListView } from './EstablishmentListView';

interface DashboardHomeProps {
  restaurant: Restaurant;
  restaurants?: Restaurant[];
  categories: Category[];
  items: MenuItem[];
  onNavigate: (tab: AdminTab) => void;
  onPreview: () => void;
  onPreviewMenuSlug?: (slug: string) => void;
  onRestaurantUpdated: (updated: Restaurant) => void;
  onSelectRestaurant?: (restaurant: Restaurant) => void;
  onOpenAddModal?: () => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  restaurant,
  restaurants = [restaurant],
  categories,
  items,
  onNavigate,
  onPreview,
  onPreviewMenuSlug,
  onRestaurantUpdated,
  onSelectRestaurant,
  onOpenAddModal,
}) => {
  const [publishing, setPublishing] = useState(false);

  // Toggle publish status
  const handleTogglePublish = async () => {
    try {
      setPublishing(true);
      const newStatus = !restaurant.is_published;
      const updated = await saveRestaurantProfile({
        ...restaurant,
        is_published: newStatus,
      });
      onRestaurantUpdated(updated);
    } catch (err) {
      console.error('Failed to toggle publish status:', err);
    } finally {
      setPublishing(false);
    }
  };

  // Onboarding steps completion
  const stepCategoriesDone = categories.length > 0;
  const stepProductsDone = items.length > 0;
  const stepPublishedDone = restaurant.is_published;

  const completedSteps = [stepCategoriesDone, stepProductsDone, stepPublishedDone].filter(Boolean).length;
  const onboardingProgress = Math.round((completedSteps / 3) * 100);

  return (
    <div className="space-y-7">
      {/* 1. MULTI-RESTAURANT SWITCHER / LIST VIEW */}
      {onOpenAddModal && (
        <EstablishmentListView
          restaurants={restaurants}
          activeRestaurant={restaurant}
          onSelectRestaurant={(r) => {
            if (onSelectRestaurant) onSelectRestaurant(r);
          }}
          onOpenAddModal={onOpenAddModal}
          onPreviewMenu={(slug) => {
            if (onPreviewMenuSlug) {
              onPreviewMenuSlug(slug);
            } else {
              onPreview();
            }
          }}
          categoriesMap={{ [restaurant.id]: categories.length }}
          itemsMap={{ [restaurant.id]: items.length }}
        />
      )}

      {/* 2. WELCOME & STATUS BANNER FOR CURRENT ACTIVE RESTAURANT */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Établissement actif
              </span>
              <span className="text-slate-300">•</span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  restaurant.is_published
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    restaurant.is_published ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                {restaurant.is_published ? 'Menu Publié' : 'Menu en Brouillon'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <span>{restaurant.name}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Gestion de la carte, des catégories et des QR codes pour <span className="font-mono text-blue-600">/r/{restaurant.slug}</span>
            </p>
          </div>

          {/* Action buttons: Preview & Publish & Add Establishment */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onOpenAddModal && (
              <button
                type="button"
                onClick={onOpenAddModal}
                className="px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Nouveau</span>
              </button>
            )}

            <button
              type="button"
              onClick={onPreview}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 flex items-center gap-2 shadow-2xs active:scale-95 transition-all"
            >
              <ExternalLink className="w-4 h-4 text-blue-600" />
              <span>Voir la carte</span>
            </button>

            <button
              type="button"
              disabled={publishing}
              onClick={handleTogglePublish}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer ${
                restaurant.is_published
                  ? 'bg-slate-900 text-white hover:bg-slate-800'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>
                {publishing
                  ? 'Mise à jour...'
                  : restaurant.is_published
                  ? 'Dépublier'
                  : 'Mettre en ligne'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. USEFUL STATISTICS ONLY (NO FAKE SAAS ANALYTICS) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Catégories count */}
        <div
          onClick={() => onNavigate('categories')}
          className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:border-blue-300 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Catégories
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FolderTree className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-900">
            {categories.length}
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <span>{categories.filter((c) => c.is_visible).length} visibles sur le menu</span>
            <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-blue-600 ml-auto transition-colors" />
          </p>
        </div>

        {/* Produits count */}
        <div
          onClick={() => onNavigate('products')}
          className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:border-blue-300 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Produits & Plats
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-900">
            {items.length}
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <span>{items.filter((i) => i.is_available).length} disponibles en commande</span>
            <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-blue-600 ml-auto transition-colors" />
          </p>
        </div>

        {/* Menu Status */}
        <div
          onClick={handleTogglePublish}
          className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:border-blue-300 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Statut Public
            </span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${
                restaurant.is_published ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
              }`}
            >
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            {restaurant.is_published ? 'En Ligne' : 'Brouillon'}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {restaurant.is_published
              ? 'Accessible via le QR code client'
              : 'Cliquez pour mettre en ligne'}
          </p>
        </div>
      </div>

      {/* 3. ONBOARDING CHECKLIST */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Configuration de votre menu
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Complétez ces 3 étapes pour lancer votre menu digital TouchBizz
            </p>
          </div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            {onboardingProgress}% complété
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-blue-600 transition-all duration-500 rounded-full"
            style={{ width: `${onboardingProgress}%` }}
          />
        </div>

        {/* Step Items */}
        <div className="space-y-3">
          {/* Step 1 */}
          <div
            onClick={() => onNavigate('categories')}
            className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
              stepCategoriesDone
                ? 'bg-slate-50/70 border-slate-200 text-slate-700'
                : 'bg-white border-blue-200 hover:border-blue-400 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-3.5">
              {stepCategoriesDone ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-slate-300 shrink-0" />
              )}
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
                  1. Ajouter les catégories
                </h3>
                <p className="text-[11px] text-slate-500">
                  Entrées, Plats principaux, Boissons, Desserts...
                </p>
              </div>
            </div>
            <button
              type="button"
              className="text-xs font-semibold text-blue-600 hover:underline px-2 py-1"
            >
              {stepCategoriesDone ? 'Modifier' : 'Ajouter'}
            </button>
          </div>

          {/* Step 2 */}
          <div
            onClick={() => onNavigate('products')}
            className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
              stepProductsDone
                ? 'bg-slate-50/70 border-slate-200 text-slate-700'
                : 'bg-white border-blue-200 hover:border-blue-400 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-3.5">
              {stepProductsDone ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-slate-300 shrink-0" />
              )}
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
                  2. Ajouter les produits
                </h3>
                <p className="text-[11px] text-slate-500">
                  Photos, noms, descriptions en Français/Arabe et prix.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="text-xs font-semibold text-blue-600 hover:underline px-2 py-1"
            >
              {stepProductsDone ? 'Gérer' : 'Ajouter'}
            </button>
          </div>

          {/* Step 3 */}
          <div
            onClick={handleTogglePublish}
            className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
              stepPublishedDone
                ? 'bg-slate-50/70 border-slate-200 text-slate-700'
                : 'bg-white border-blue-200 hover:border-blue-400 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-3.5">
              {stepPublishedDone ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-slate-300 shrink-0" />
              )}
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
                  3. Publier le menu
                </h3>
                <p className="text-[11px] text-slate-500">
                  Rendre la carte accessible en scannant le QR code.
                </p>
              </div>
            </div>
            <button
              type="button"
              className={`text-xs font-bold px-3 py-1 rounded-lg ${
                stepPublishedDone
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-white bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {stepPublishedDone ? 'En ligne' : 'Publier'}
            </button>
          </div>
        </div>
      </div>

      {/* 4. QUICK ACTION SHORTCUTS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Scan physical menu */}
        <div
          onClick={() => onNavigate('scan')}
          className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white cursor-pointer shadow-md hover:shadow-lg transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4">
            <ScanText className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-base font-bold">
            Scanner le menu depuis une photo
          </h3>
          <p className="text-xs text-blue-100 mt-1">
            Prenez en photo votre carte papier pour extraire automatiquement les plats et prix.
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-white bg-white/20 px-3 py-1.5 rounded-xl hover:bg-white/30">
            <span>Commencer le scan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* QR Code generator */}
        <div
          onClick={() => onNavigate('qrcode')}
          className="bg-white border border-slate-200/80 rounded-3xl p-6 cursor-pointer shadow-xs hover:border-blue-300 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-4 text-slate-800">
            <QrCode className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Télécharger le QR Code
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Générez et imprimez vos supports de table, chevalets ou stickers vitrine.
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl hover:bg-blue-100">
            <span>Voir le QR Code</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
