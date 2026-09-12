import React, { useState } from 'react';
import {
  Database,
  Check,
  Copy,
  AlertCircle,
  ExternalLink,
  Key,
  ShieldCheck,
  Server,
  RefreshCw,
} from 'lucide-react';
import {
  isSupabaseConfigured,
  supabaseUrl,
  supabaseAnonKey,
  saveCustomSupabaseConfig,
  clearCustomSupabaseConfig,
} from '../../lib/supabase';

export const SettingsView: React.FC = () => {
  const [inputUrl, setInputUrl] = useState(supabaseUrl || '');
  const [inputKey, setInputKey] = useState(supabaseAnonKey || '');
  const [copiedSql, setCopiedSql] = useState(false);
  const [savedConfig, setSavedConfig] = useState(false);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim() || !inputKey.trim()) return;
    saveCustomSupabaseConfig(inputUrl.trim(), inputKey.trim());
    setSavedConfig(true);
  };

  const handleResetConfig = () => {
    if (window.confirm('Réinitialiser la configuration Supabase ?')) {
      clearCustomSupabaseConfig();
    }
  };

  const handleCopySqlScript = () => {
    const sql = `-- TouchBizz PostgreSQL Schema
-- Copiez et collez dans l'éditeur SQL de votre dashboard Supabase:
-- https://supabase.com/dashboard/project/_/sql

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
  facebook_url text,
  instagram_url text,
  tiktok_url text,
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

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
`;
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Database className="w-6 h-6 text-blue-600" />
          Paramètres & Connexion Supabase
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Gérez l’intégration Supabase (PostgreSQL, Authentification, Stockage & Row Level Security).
        </p>
      </div>

      {/* Connection Status Banner */}
      <div
        className={`p-6 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isSupabaseConfigured
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
            : 'bg-blue-50/80 border-blue-200 text-blue-900'
        }`}
      >
        <div className="flex items-start gap-3.5">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
              isSupabaseConfigured ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
            }`}
          >
            {isSupabaseConfigured ? (
              <ShieldCheck className="w-6 h-6" />
            ) : (
              <Database className="w-6 h-6" />
            )}
          </div>
          <div>
            <h2 className="text-base font-bold leading-tight">
              {isSupabaseConfigured
                ? 'Base de données Supabase connectée'
                : 'Mode Démonstration & Local Actif'}
            </h2>
            <p className="text-xs opacity-85 mt-1 max-w-xl">
              {isSupabaseConfigured
                ? 'Les requêtes transitent directement vers votre instance Supabase avec Row Level Security et stockage bucket.'
                : 'Vous pouvez tester toutes les fonctionnalités immédiatement. Pour connecter votre propre projet Supabase, configurez vos clés ci-dessous ou dans .env.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopySqlScript}
          className="px-4 py-2 rounded-xl bg-white text-slate-800 text-xs font-bold shadow-xs hover:bg-slate-50 flex items-center gap-1.5 self-start sm:self-auto border border-black/10 shrink-0"
        >
          {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedSql ? 'Script copié !' : 'Copier le script SQL'}</span>
        </button>
      </div>

      {/* Credentials configuration form */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
          <Key className="w-4 h-4 text-blue-600" />
          Identifiants Supabase (Client-Side Publics)
        </h2>

        <form onSubmit={handleSaveConfig} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              VITE_SUPABASE_URL
            </label>
            <input
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://xxxxxxxxxxxx.supabase.co"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              VITE_SUPABASE_ANON_KEY (Clé Publique)
            </label>
            <input
              type="text"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 focus:border-blue-600 focus:outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              ⚠️ N'utilisez JAMAIS votre clé <span className="font-mono text-rose-500">service_role</span> sur le client.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleResetConfig}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Réinitialiser
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm active:scale-95 transition-all"
            >
              Enregistrer et Recharger
            </button>
          </div>
        </form>
      </div>

      {/* Deployment & Architecture Guidelines */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Server className="w-4 h-4 text-blue-600" />
          Règles d'Architecture TouchBizz
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-1">Architecture Multi-Tenant</h3>
            <p className="text-slate-600 leading-relaxed">
              Une seule application Vercel et une seule base de données Supabase hébergent tous les restaurants. Chaque établissement dispose de son URL stable <span className="font-mono text-blue-600">/r/:slug</span>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-1">Sécurité & RLS (Row Level Security)</h3>
            <p className="text-slate-600 leading-relaxed">
              Les propriétaires ne peuvent modifier que leur propre restaurant et plats. Les clients accèdent au menu en lecture seule sans aucune trace de contrôles admin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
