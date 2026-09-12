import React from 'react';
import {
  Store,
  Plus,
  ExternalLink,
  MapPin,
  Phone,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Globe,
} from 'lucide-react';
import { Restaurant, Category, MenuItem } from '../../types/database';

interface EstablishmentListViewProps {
  restaurants: Restaurant[];
  activeRestaurant: Restaurant;
  onSelectRestaurant: (restaurant: Restaurant) => void;
  onOpenAddModal: () => void;
  onPreviewMenu: (slug: string) => void;
  categoriesMap?: Record<string, number>;
  itemsMap?: Record<string, number>;
}

export const EstablishmentListView: React.FC<EstablishmentListViewProps> = ({
  restaurants,
  activeRestaurant,
  onSelectRestaurant,
  onOpenAddModal,
  onPreviewMenu,
  categoriesMap = {},
  itemsMap = {},
}) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Multi-Établissements ({restaurants.length})
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Store className="w-6 h-6 text-slate-700" />
            <span>Mes Établissements</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Basculez facilement entre vos différents restaurants ou succursales pour gérer leurs cartes et produits respectifs.
          </p>
        </div>

        {/* Add Establishment Button */}
        <button
          type="button"
          onClick={onOpenAddModal}
          className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Ajouter un établissement</span>
        </button>
      </div>

      {/* Grid of Establishments */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {restaurants.map((rest) => {
          const isActive = rest.id === activeRestaurant.id;
          const catCount = categoriesMap[rest.id] ?? (isActive ? undefined : 0);
          const itemCount = itemsMap[rest.id] ?? (isActive ? undefined : 0);

          return (
            <div
              key={rest.id}
              className={`rounded-2xl border-2 transition-all p-5 flex flex-col justify-between relative overflow-hidden ${
                isActive
                  ? 'border-blue-600 bg-blue-50/20 shadow-md ring-2 ring-blue-500/10'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:shadow-xs'
              }`}
            >
              {/* Top status & Active badge */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    rest.is_published
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {rest.is_published ? '● En Ligne' : '○ Brouillon'}
                </span>

                {isActive ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold shadow-2xs">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Actif</span>
                  </span>
                ) : (
                  <span className="text-[11px] font-mono text-slate-400 capitalize">
                    {rest.theme || 'classic'}
                  </span>
                )}
              </div>

              {/* Establishment info */}
              <div>
                <div className="flex items-start gap-3">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-base font-extrabold text-white shrink-0 shadow-xs"
                    style={{ backgroundColor: rest.primary_color || '#2563eb' }}
                  >
                    {rest.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-slate-900 truncate">
                      {rest.name}
                    </h3>
                    <p className="text-xs font-mono text-slate-500 truncate">
                      /r/{rest.slug}
                    </p>
                  </div>
                </div>

                {/* Details (Address & Phone) */}
                <div className="mt-3.5 space-y-1.5 text-xs text-slate-600">
                  {rest.address ? (
                    <p className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{rest.address}</span>
                    </p>
                  ) : (
                    <p className="flex items-center gap-1.5 text-slate-400 italic text-[11px]">
                      <MapPin className="w-3.5 h-3.5 shrink-0 opacity-50" />
                      <span>Adresse non renseignée</span>
                    </p>
                  )}

                  {rest.phone ? (
                    <p className="flex items-center gap-1.5 truncate">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{rest.phone}</span>
                    </p>
                  ) : (
                    <p className="flex items-center gap-1.5 text-slate-400 italic text-[11px]">
                      <Phone className="w-3.5 h-3.5 shrink-0 opacity-50" />
                      <span>Téléphone non renseigné</span>
                    </p>
                  )}
                </div>

                {/* Theme & Currency Pills */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-slate-500" />
                    <span>Thème {rest.theme}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-mono font-medium">
                    Devise: {rest.currency || 'DH'}
                  </span>
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                {isActive ? (
                  <button
                    type="button"
                    disabled
                    className="flex-1 py-2 px-3 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-default"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>En cours de gestion</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSelectRestaurant(rest)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer"
                  >
                    <span>Gérer ce restaurant</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onPreviewMenu(rest.slug)}
                  title="Voir la carte client"
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 transition-colors shrink-0"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Quick Add Card */}
        <div
          onClick={onOpenAddModal}
          className="rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/20 p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all group min-h-[220px]"
        >
          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:border-blue-300 group-hover:scale-110 transition-all shadow-2xs mb-3">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h4 className="text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
            Ajouter un établissement
          </h4>
          <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
            Créer un restaurant, café ou succursale supplémentaire
          </p>
        </div>
      </div>
    </div>
  );
};
