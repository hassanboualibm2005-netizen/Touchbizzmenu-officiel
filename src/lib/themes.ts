import { ThemeId } from '../types/database';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  nameEn: string;
  description: string;
  accent: string;
  isDark: boolean;
  classes: {
    wrapper: string;
    headerBanner: string;
    headerTitle: string;
    headerSubtitle: string;
    navContainer: string;
    navItemActive: string;
    navItemInactive: string;
    sectionTitle: string;
    card: string;
    cardImage: string;
    cardTitle: string;
    cardDescription: string;
    cardPrice: string;
    oldPrice: string;
    badgeAvailable: string;
    badgeUnavailable: string;
    badgePromo: string;
  };
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    nameEn: 'Minimalist',
    description: 'Design épuré noir & blanc, typographie moderne et sans fioritures.',
    accent: '#18181b',
    isDark: false,
    classes: {
      wrapper: 'bg-white text-zinc-900 font-sans',
      headerBanner: 'bg-zinc-100 border-b border-zinc-200',
      headerTitle: 'text-zinc-950 font-bold tracking-tight',
      headerSubtitle: 'text-zinc-500 font-normal',
      navContainer: 'bg-white/95 backdrop-blur-md border-b border-zinc-200',
      navItemActive: 'bg-zinc-900 text-white font-medium shadow-sm',
      navItemInactive: 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 font-normal',
      sectionTitle: 'text-zinc-950 font-bold uppercase tracking-wider text-xs border-b border-zinc-200 pb-2',
      card: 'bg-white border border-zinc-200 rounded-xl hover:border-zinc-300 transition-all shadow-none',
      cardImage: 'rounded-t-xl object-cover',
      cardTitle: 'text-zinc-950 font-semibold',
      cardDescription: 'text-zinc-500 text-sm line-clamp-2',
      cardPrice: 'text-zinc-950 font-bold text-base',
      oldPrice: 'text-zinc-400 line-through text-xs font-normal',
      badgeAvailable: 'bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium px-2 py-0.5 rounded-full',
      badgeUnavailable: 'bg-zinc-100 text-zinc-500 border border-zinc-200 text-xs font-medium px-2 py-0.5 rounded-full',
      badgePromo: 'bg-zinc-900 text-white text-xs font-semibold px-2 py-0.5 rounded-full',
    },
  },
  classic: {
    id: 'classic',
    name: 'Classique',
    nameEn: 'Classic',
    description: 'Style intemporel chaleureux, touches café parisien et lisibilité optimale.',
    accent: '#2563eb',
    isDark: false,
    classes: {
      wrapper: 'bg-stone-50 text-stone-900 font-sans',
      headerBanner: 'bg-stone-100 border-b border-stone-200',
      headerTitle: 'text-stone-900 font-bold tracking-tight font-serif',
      headerSubtitle: 'text-stone-600',
      navContainer: 'bg-stone-50/95 backdrop-blur-md border-b border-stone-200',
      navItemActive: 'bg-blue-600 text-white font-medium shadow-sm',
      navItemInactive: 'text-stone-600 hover:text-blue-600 hover:bg-stone-100 font-medium',
      sectionTitle: 'text-stone-900 font-serif font-bold text-lg border-b border-stone-300 pb-2',
      card: 'bg-white border border-stone-200/80 rounded-2xl shadow-sm hover:shadow-md transition-all',
      cardImage: 'rounded-t-2xl object-cover',
      cardTitle: 'text-stone-900 font-semibold',
      cardDescription: 'text-stone-500 text-sm line-clamp-2',
      cardPrice: 'text-blue-600 font-bold text-base',
      oldPrice: 'text-stone-400 line-through text-xs font-normal',
      badgeAvailable: 'bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium px-2 py-0.5 rounded-full',
      badgeUnavailable: 'bg-stone-100 text-stone-500 border border-stone-200 text-xs font-medium px-2 py-0.5 rounded-full',
      badgePromo: 'bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full',
    },
  },
  luxury: {
    id: 'luxury',
    name: 'Luxe',
    nameEn: 'Luxury Dark',
    description: 'Ambiance nocturne raffinée, fond sombre obsidienne et détails dorés dorés.',
    accent: '#d97706',
    isDark: true,
    classes: {
      wrapper: 'bg-zinc-950 text-zinc-100 font-sans',
      headerBanner: 'bg-zinc-900 border-b border-zinc-800',
      headerTitle: 'text-amber-300 font-serif font-bold tracking-wide',
      headerSubtitle: 'text-zinc-400',
      navContainer: 'bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800',
      navItemActive: 'bg-gradient-to-r from-amber-600 to-amber-500 text-black font-semibold shadow-sm',
      navItemInactive: 'text-zinc-400 hover:text-amber-300 hover:bg-zinc-900 font-medium',
      sectionTitle: 'text-amber-400 font-serif font-semibold text-lg border-b border-zinc-800 pb-2 tracking-wider',
      card: 'bg-zinc-900/90 border border-zinc-800 rounded-2xl hover:border-amber-500/40 transition-all shadow-lg shadow-black/40',
      cardImage: 'rounded-t-2xl object-cover',
      cardTitle: 'text-zinc-100 font-semibold',
      cardDescription: 'text-zinc-400 text-sm line-clamp-2',
      cardPrice: 'text-amber-400 font-bold text-base',
      oldPrice: 'text-zinc-500 line-through text-xs font-normal',
      badgeAvailable: 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 text-xs font-medium px-2 py-0.5 rounded-full',
      badgeUnavailable: 'bg-zinc-800 text-zinc-400 border border-zinc-700 text-xs font-medium px-2 py-0.5 rounded-full',
      badgePromo: 'bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs font-bold px-2.5 py-0.5 rounded-full',
    },
  },
  moroccan: {
    id: 'moroccan',
    name: 'Marocain',
    nameEn: 'Moroccan',
    description: 'Tons chauds terracotta, safran et menthe douce, inspiré de la gastronomie marocaine.',
    accent: '#c2410c',
    isDark: false,
    classes: {
      wrapper: 'bg-orange-50/40 text-stone-900 font-sans',
      headerBanner: 'bg-orange-100/60 border-b border-orange-200/60',
      headerTitle: 'text-amber-950 font-bold tracking-tight',
      headerSubtitle: 'text-stone-600',
      navContainer: 'bg-orange-50/95 backdrop-blur-md border-b border-orange-200/70',
      navItemActive: 'bg-orange-700 text-white font-medium shadow-sm',
      navItemInactive: 'text-stone-700 hover:text-orange-700 hover:bg-orange-100/60 font-medium',
      sectionTitle: 'text-orange-900 font-bold text-lg border-b-2 border-orange-300 pb-2',
      card: 'bg-white border border-orange-200/70 rounded-2xl shadow-sm hover:shadow-md transition-all',
      cardImage: 'rounded-t-2xl object-cover',
      cardTitle: 'text-stone-900 font-semibold',
      cardDescription: 'text-stone-600 text-sm line-clamp-2',
      cardPrice: 'text-orange-700 font-bold text-base',
      oldPrice: 'text-stone-400 line-through text-xs font-normal',
      badgeAvailable: 'bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium px-2 py-0.5 rounded-full',
      badgeUnavailable: 'bg-stone-100 text-stone-500 border border-stone-200 text-xs font-medium px-2 py-0.5 rounded-full',
      badgePromo: 'bg-orange-600 text-white text-xs font-bold px-2 py-0.5 rounded-full',
    },
  },
  bistro: {
    id: 'bistro',
    name: 'Bistrot',
    nameEn: 'Bistro Modern',
    description: 'Élégance bistronomique, bleu nuit ardoise et touches cuivrées.',
    accent: '#0f172a',
    isDark: false,
    classes: {
      wrapper: 'bg-slate-50 text-slate-900 font-sans',
      headerBanner: 'bg-slate-900 text-white border-b border-slate-800',
      headerTitle: 'text-white font-bold tracking-tight',
      headerSubtitle: 'text-slate-300',
      navContainer: 'bg-slate-50/95 backdrop-blur-md border-b border-slate-200',
      navItemActive: 'bg-slate-900 text-white font-medium shadow-sm',
      navItemInactive: 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60 font-medium',
      sectionTitle: 'text-slate-900 font-bold text-lg border-b border-slate-300 pb-2',
      card: 'bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-slate-300 transition-all',
      cardImage: 'rounded-t-2xl object-cover',
      cardTitle: 'text-slate-900 font-semibold',
      cardDescription: 'text-slate-600 text-sm line-clamp-2',
      cardPrice: 'text-slate-900 font-bold text-base',
      oldPrice: 'text-slate-400 line-through text-xs font-normal',
      badgeAvailable: 'bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium px-2 py-0.5 rounded-full',
      badgeUnavailable: 'bg-slate-100 text-slate-500 border border-slate-200 text-xs font-medium px-2 py-0.5 rounded-full',
      badgePromo: 'bg-amber-600 text-white text-xs font-bold px-2 py-0.5 rounded-full',
    },
  },
};

export function getTheme(themeId?: string | null): ThemeConfig {
  if (!themeId || !(themeId in THEMES)) {
    return THEMES.classic;
  }
  return THEMES[themeId as ThemeId];
}
