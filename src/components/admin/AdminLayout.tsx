import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Store,
  FolderTree,
  UtensilsCrossed,
  ScanText,
  Palette,
  QrCode,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Database,
  ChevronRight,
  AlertTriangle,
  Copy,
  Check,
  Plus,
} from 'lucide-react';
import { Restaurant } from '../../types/database';
import { isSupabaseConfigured } from '../../lib/supabase';
import { isSupabaseSchemaMissing, subscribeToSchemaMissing } from '../../lib/api';
import { EstablishmentSwitcher } from './EstablishmentSwitcher';

export type AdminTab =
  | 'dashboard'
  | 'establishment'
  | 'categories'
  | 'products'
  | 'scan'
  | 'themes'
  | 'qrcode'
  | 'settings';

export interface AdminLayoutProps {
  restaurant?: Restaurant | null;
  restaurants?: Restaurant[];
  activeTab?: AdminTab;
  currentTab?: AdminTab;
  onSelectTab?: (tab: AdminTab) => void;
  onTabChange?: (tab: AdminTab) => void;
  onSelectRestaurant?: (restaurant: Restaurant) => void;
  onOpenAddModal?: () => void;
  onLogout: () => void;
  onPreviewMenu?: () => void;
  onPreview?: () => void;
  restaurantName?: string;
  restaurantSlug?: string;
  isPublished?: boolean;
  children: React.ReactNode;
}

const NAV_ITEMS: { id: AdminTab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { id: 'establishment', label: 'Mon établissement', icon: Store },
  { id: 'categories', label: 'Catégories', icon: FolderTree },
  { id: 'products', label: 'Produits', icon: UtensilsCrossed },
  { id: 'scan', label: 'Scanner le menu', icon: ScanText },
  { id: 'themes', label: 'Modèle', icon: Palette },
  { id: 'qrcode', label: 'QR Code', icon: QrCode },
  { id: 'settings', label: 'Paramètres', icon: Settings },
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  restaurant,
  restaurants,
  activeTab,
  currentTab,
  onSelectTab,
  onTabChange,
  onSelectRestaurant,
  onOpenAddModal,
  onLogout,
  onPreviewMenu,
  onPreview,
  restaurantName,
  restaurantSlug,
  isPublished,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [schemaMissing, setSchemaMissing] = useState(isSupabaseSchemaMissing());
  const [copiedSql, setCopiedSql] = useState(false);
  const [dismissedNotice, setDismissedNotice] = useState(false);

  useEffect(() => {
    return subscribeToSchemaMissing((missing) => {
      setSchemaMissing(missing);
    });
  }, []);

  const currentActiveTab: AdminTab = activeTab || currentTab || 'dashboard';

  const handleNavClick = (tab: AdminTab) => {
    if (typeof onSelectTab === 'function') {
      onSelectTab(tab);
    } else if (typeof onTabChange === 'function') {
      onTabChange(tab);
    }
    setMobileMenuOpen(false);
  };

  const handlePreview = () => {
    if (typeof onPreviewMenu === 'function') {
      onPreviewMenu();
    } else if (typeof onPreview === 'function') {
      onPreview();
    }
  };

  const displayName = restaurant?.name || restaurantName || 'Mon Restaurant';
  const displaySlug = restaurant?.slug || restaurantSlug || 'restaurant';
  const displayPublished = restaurant?.is_published ?? isPublished ?? false;

  const handleCopySql = () => {
    const sql = `-- TouchBizz PostgreSQL Schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

CREATE TABLE IF NOT EXISTS public.restaurants (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references auth.users on delete cascade not null,
  name text not null,
  slug text not null unique,
  description text,
  address text,
  phone text,
  logo_url text,
  cover_image_url text,
  theme text default 'classic' not null,
  primary_color text default '#2563eb' not null,
  is_published boolean default false not null,
  currency text default 'DH' not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

CREATE TABLE IF NOT EXISTS public.establishments (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references auth.users on delete cascade not null,
  name text not null,
  slug text not null unique,
  description text,
  address text,
  phone text,
  logo_url text,
  cover_image_url text,
  theme text default 'classic' not null,
  primary_color text default '#2563eb' not null,
  is_published boolean default false not null,
  currency text default 'DH' not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

CREATE TABLE IF NOT EXISTS public.categories (
  id uuid default uuid_generate_v4() primary key,
  restaurant_id uuid references public.restaurants(id) on delete cascade not null,
  name_fr text not null,
  name_ar text,
  name_en text,
  description_fr text,
  description_ar text,
  description_en text,
  sort_order integer default 0 not null,
  is_visible boolean default true not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

CREATE TABLE IF NOT EXISTS public.menu_items (
  id uuid default uuid_generate_v4() primary key,
  restaurant_id uuid references public.restaurants(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete cascade not null,
  name_fr text not null,
  name_ar text,
  name_en text,
  description_fr text,
  description_ar text,
  description_en text,
  price numeric(10, 2) not null,
  old_price numeric(10, 2),
  image_url text,
  is_available boolean default true not null,
  is_visible boolean default true not null,
  sort_order integer default 0 not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public restaurants view" ON public.restaurants FOR SELECT USING (true);
CREATE POLICY "Public categories view" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public menu items view" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "Owner manage restaurants" ON public.restaurants FOR ALL USING (true);
CREATE POLICY "Owner manage categories" ON public.categories FOR ALL USING (true);
CREATE POLICY "Owner manage items" ON public.menu_items FOR ALL USING (true);`;

    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* -------------------------------------------------------- */}
      {/* MOBILE TOP HEADER BAR                                    */}
      {/* -------------------------------------------------------- */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 active:scale-95"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div>
            <span className="text-base font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black">
                TB
              </span>
              TouchBizz
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePreview}
            className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold flex items-center gap-1 hover:bg-blue-100"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Menu</span>
          </button>
          <button
            type="button"
            onClick={onLogout}
            title="Se déconnecter"
            className="px-2 py-1.5 rounded-lg bg-rose-50 text-rose-700 text-xs font-semibold flex items-center gap-1 hover:bg-rose-100 active:scale-95 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </header>

      {/* -------------------------------------------------------- */}
      {/* DESKTOP SIDEBAR / MOBILE DRAWER                          */}
      {/* -------------------------------------------------------- */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col justify-between transform transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                TB
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 leading-tight">
                  TouchBizz
                </h1>
                <p className="text-[11px] font-medium text-slate-400">
                  Digital Menu SaaS
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Multi-Restaurant Switcher or Current Restaurant Badge */}
          <div className="mx-4 my-3">
            {restaurants && restaurant && onSelectRestaurant && onOpenAddModal ? (
              <EstablishmentSwitcher
                restaurants={restaurants}
                currentRestaurant={restaurant}
                onSelectRestaurant={onSelectRestaurant}
                onOpenAddModal={onOpenAddModal}
              />
            ) : (
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {displayName}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        /r/{displaySlug}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                      displayPublished
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {displayPublished ? 'Publié' : 'Brouillon'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentActiveTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          {/* Quick Preview Link */}
          <button
            type="button"
            onClick={handlePreview}
            className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2 shadow-2xs"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
            <span>Voir le menu public</span>
          </button>

          {/* Supabase connection indicator */}
          <div className="px-3 py-1.5 rounded-lg bg-slate-50 text-[11px] flex items-center justify-between text-slate-500 border border-slate-100">
            <span className="flex items-center gap-1.5">
              <Database className={`w-3.5 h-3.5 ${schemaMissing ? 'text-amber-500' : 'text-emerald-500'}`} />
              <span>Supabase</span>
            </span>
            <span className={`text-[10px] font-medium ${schemaMissing ? 'text-amber-700 font-semibold' : 'text-emerald-700'}`}>
              {isSupabaseConfigured ? (schemaMissing ? 'Tables manquantes' : 'Connecté') : 'Mode Démo'}
            </span>
          </div>

          {/* Logout button */}
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* -------------------------------------------------------- */}
      {/* MAIN ADMIN CONTENT WRAPPER & HEADER                      */}
      {/* -------------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Header Bar with prominent Logout & Live Preview buttons */}
        <header className="hidden md:flex h-16 bg-white border-b border-slate-200 px-6 sm:px-8 items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400">
              Espace Administrateur
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-bold text-slate-900">
              {displayName}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                displayPublished
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {displayPublished ? '● En ligne' : '○ Brouillon'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePreview}
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
              <span>Voir le menu client</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100/80 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Se déconnecter</span>
            </button>
          </div>
        </header>

        <main className="flex-1 min-w-0 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {/* Banner if Supabase is connected but tables haven't been created yet */}
        {schemaMissing && !dismissedNotice && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                    Tables Supabase à initialiser
                  </h4>
                  <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                    Votre projet Supabase est connecté mais les tables de base de données (<code>restaurants</code>, <code>categories</code>, <code>menu_items</code>) ne sont pas encore créées. L'application fonctionne normalement en <strong>mode local sécurisé</strong> sans aucune perte de données.
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopySql}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors flex items-center gap-1.5 shadow-2xs"
                    >
                      {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSql ? 'Script SQL copié !' : 'Copier le script SQL'}</span>
                    </button>
                    <a
                      href="https://supabase.com/dashboard"
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-800 text-xs font-semibold hover:bg-amber-100/50 transition-colors flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Ouvrir Supabase SQL Editor</span>
                    </a>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDismissedNotice(true)}
                className="text-amber-500 hover:text-amber-700 p-1"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {children}
      </main>
      </div>
    </div>
  );
};
