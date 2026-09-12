import { LanguageCode } from '../types/database';

export interface TranslationDictionary {
  currency: string;
  allCategories: string;
  searchPlaceholder: string;
  noItemsFound: string;
  noItemsFoundDesc: string;
  noCategoryItems: string;
  available: string;
  unavailable: string;
  promo: string;
  closed: string;
  open: string;
  scanNotice: string;
  poweredBy: string;
  menuUnavailableTitle: string;
  menuUnavailableDesc: string;
  menuNotFoundTitle: string;
  menuNotFoundDesc: string;
  contact: string;
  address: string;
  phone: string;
  close: string;
  details: string;
  hours: string;
  hoursValue: string;
  restaurantTag: string;
  searchResultsFor: string;
  itemsCount: string;
  clearSearch: string;
  homemade: string;
  veggieFresh: string;
  fishSeafood: string;
  spicyHot: string;
  originalRecipe: string;
  dishDescriptionLabel: string;
  defaultDishDesc: string;
  consultativeNotice: string;
  shareMenu: string;
  sharePromptText: string;
  linkCopied: string;
  followUs: string;
  loadingMenu: string;
  restaurantInfo: string;
  categoriesLabel: string;
  scrollLeft: string;
  scrollRight: string;
  selectLanguage: string;
}

export const I18N: Record<LanguageCode, TranslationDictionary> = {
  fr: {
    currency: 'DH',
    allCategories: 'Tout',
    searchPlaceholder: 'Rechercher un plat, une boisson...',
    noItemsFound: 'Aucun plat correspondant à votre recherche.',
    noItemsFoundDesc: 'Essayez un autre mot-clé (ex: salade, tajine, thé, burger).',
    noCategoryItems: 'Aucun plat dans cette catégorie pour le moment.',
    available: 'Disponible',
    unavailable: 'Épuisé',
    promo: 'Offre',
    closed: 'Fermé actuellement',
    open: 'Ouvert',
    scanNotice: 'Menu digital TouchBizz',
    poweredBy: 'Propulsé par TouchBizz Menu',
    menuUnavailableTitle: "Ce menu n'est pas encore disponible.",
    menuUnavailableDesc: "L'établissement prépare sa carte. Revenez très bientôt !",
    menuNotFoundTitle: 'Menu introuvable',
    menuNotFoundDesc: "Le restaurant demandé n'existe pas ou l'adresse est incorrecte.",
    contact: 'Contact & Accès',
    address: 'Adresse',
    phone: 'Téléphone',
    close: 'Fermer',
    details: 'Détails du plat',
    hours: 'Horaires',
    hoursValue: 'Tous les jours : 09:00 — 23:00',
    restaurantTag: 'Restaurant & Café',
    searchResultsFor: 'Résultats pour',
    itemsCount: 'plat(s)',
    clearSearch: 'Effacer la recherche',
    homemade: 'Fait maison',
    veggieFresh: 'Végétal / Frais',
    fishSeafood: 'Poisson & Fruits de mer',
    spicyHot: 'Épicé & Pimenté',
    originalRecipe: 'Spécialité du chef',
    dishDescriptionLabel: 'Description du plat',
    defaultDishDesc: 'Délicieuse préparation fraîchement cuisinée avec des ingrédients soigneusement sélectionnés.',
    consultativeNotice: 'Carte digitale consultative',
    shareMenu: 'Partager le menu',
    sharePromptText: 'Découvrez la carte de',
    linkCopied: 'Lien de la carte copié !',
    followUs: 'Suivez-nous sur les réseaux',
    loadingMenu: 'Chargement de la carte...',
    restaurantInfo: 'Informations du restaurant',
    categoriesLabel: 'Catégories du menu',
    scrollLeft: 'Défiler à gauche',
    scrollRight: 'Défiler à droite',
    selectLanguage: 'Choisir la langue',
  },
  ar: {
    currency: 'د.م',
    allCategories: 'الكل',
    searchPlaceholder: 'ابحث عن طبق أو مشروب...',
    noItemsFound: 'لا توجد أطباق مطابقة لبحثك.',
    noItemsFoundDesc: 'جرب كلمة بحث أخرى (مثال: طاجين، سلطة، شاي، برجر).',
    noCategoryItems: 'لا توجد أطباق في هذا القسم حالياً.',
    available: 'متوفر',
    unavailable: 'غير متوفر',
    promo: 'عرض خاص',
    closed: 'مغلق حالياً',
    open: 'مفتوح',
    scanNotice: 'قائمة رقمية TouchBizz',
    poweredBy: 'مشغل بواسطة TouchBizz Menu',
    menuUnavailableTitle: 'هذه القائمة غير متاحة حالياً.',
    menuUnavailableDesc: 'يقوم المطعم بتجهيز القائمة. يرجى العودة قريباً!',
    menuNotFoundTitle: 'القائمة غير موجودة',
    menuNotFoundDesc: 'المطعم المطلوب غير موجود أو الرابط غير صحيح.',
    contact: 'الاتصال والعنوان',
    address: 'العنوان',
    phone: 'الهاتف',
    close: 'إغلاق',
    details: 'تفاصيل الطبق',
    hours: 'أوقات العمل',
    hoursValue: 'يومياً: 09:00 — 23:00',
    restaurantTag: 'مطعم ومقهى',
    searchResultsFor: 'نتائج البحث عن',
    itemsCount: 'أطباق',
    clearSearch: 'مسح البحث',
    homemade: 'تحضير منزلي',
    veggieFresh: 'نباتي / طازج',
    fishSeafood: 'أسماك ومأكولات بحرية',
    spicyHot: 'حار ومتبل',
    originalRecipe: 'اختيار الشيف',
    dishDescriptionLabel: 'وصف الطبق',
    defaultDishDesc: 'تحضير شهي بمكونات طازجة ومختارة بعناية فائقة.',
    consultativeNotice: 'قائمة رقمية للاطلاع',
    shareMenu: 'مشاركة القائمة',
    sharePromptText: 'اكتشف قائمة طعام',
    linkCopied: 'تم نسخ رابط القائمة!',
    followUs: 'تابعونا على وسائل التواصل',
    loadingMenu: 'جاري تحميل القائمة...',
    restaurantInfo: 'معلومات المطعم',
    categoriesLabel: 'أقسام القائمة',
    scrollLeft: 'تمرير لليمين',
    scrollRight: 'تمرير لليسار',
    selectLanguage: 'اختر اللغة',
  },
  en: {
    currency: 'MAD',
    allCategories: 'All',
    searchPlaceholder: 'Search a dish, drink...',
    noItemsFound: 'No dishes matching your search.',
    noItemsFoundDesc: 'Try another keyword (e.g. tagine, salad, tea, burger).',
    noCategoryItems: 'No items in this category yet.',
    available: 'Available',
    unavailable: 'Sold out',
    promo: 'Special',
    closed: 'Currently closed',
    open: 'Open',
    scanNotice: 'TouchBizz Digital Menu',
    poweredBy: 'Powered by TouchBizz Menu',
    menuUnavailableTitle: 'This menu is not yet available.',
    menuUnavailableDesc: 'The restaurant is currently preparing its menu. Check back soon!',
    menuNotFoundTitle: 'Menu not found',
    menuNotFoundDesc: 'The requested restaurant does not exist or the link is incorrect.',
    contact: 'Contact & Location',
    address: 'Address',
    phone: 'Phone',
    close: 'Close',
    details: 'Dish details',
    hours: 'Opening Hours',
    hoursValue: 'Daily: 09:00 — 23:00',
    restaurantTag: 'Restaurant & Café',
    searchResultsFor: 'Results for',
    itemsCount: 'item(s)',
    clearSearch: 'Clear search',
    homemade: 'Homemade',
    veggieFresh: 'Plant-based / Fresh',
    fishSeafood: 'Fish & Seafood',
    spicyHot: 'Spicy & Hot',
    originalRecipe: "Chef's Special",
    dishDescriptionLabel: 'Dish description',
    defaultDishDesc: 'Delicious dish freshly prepared with carefully selected ingredients.',
    consultativeNotice: 'Digital consultative menu',
    shareMenu: 'Share menu',
    sharePromptText: 'Check out the menu of',
    linkCopied: 'Menu link copied!',
    followUs: 'Follow us on social media',
    loadingMenu: 'Loading menu...',
    restaurantInfo: 'Restaurant Information',
    categoriesLabel: 'Menu categories',
    scrollLeft: 'Scroll left',
    scrollRight: 'Scroll right',
    selectLanguage: 'Select language',
  },
};

export function isRtl(lang: LanguageCode): boolean {
  return lang === 'ar';
}

// Common dictionary for automatic fallback translation if name_ar / name_en is not set in DB
const COMMON_TRANSLATIONS: Record<string, { ar: string; en: string }> = {
  'petit-déjeuner': { ar: 'فطور الصباح', en: 'Breakfast' },
  'petit dejeuner': { ar: 'فطور الصباح', en: 'Breakfast' },
  'breakfast': { ar: 'فطور الصباح', en: 'Breakfast' },
  'entrées & salades': { ar: 'المقبلات والسلطات', en: 'Starters & Salads' },
  'entrees & salades': { ar: 'المقبلات والسلطات', en: 'Starters & Salads' },
  'entrées': { ar: 'المقبلات', en: 'Starters' },
  'entrees': { ar: 'المقبلات', en: 'Starters' },
  'salades': { ar: 'السلطات', en: 'Salads' },
  'plats principaux': { ar: 'الأطباق الرئيسية', en: 'Main Courses' },
  'plats': { ar: 'الأطباق', en: 'Main Dishes' },
  'spécialités marocaines': { ar: 'أطباق مغربية أصيلة', en: 'Moroccan Specialties' },
  'specialites marocaines': { ar: 'أطباق مغربية أصيلة', en: 'Moroccan Specialties' },
  'burgers & grillades': { ar: 'برجر ومشويات', en: 'Burgers & Grill' },
  'burgers': { ar: 'برجر', en: 'Burgers' },
  'grillades': { ar: 'مشويات', en: 'Grills' },
  'desserts & pâtisseries': { ar: 'حلويات ومعجنات', en: 'Desserts & Pastries' },
  'desserts & patisseries': { ar: 'حلويات ومعجنات', en: 'Desserts & Pastries' },
  'desserts': { ar: 'الحلويات', en: 'Desserts' },
  'boissons & thés': { ar: 'المشروبات والشاي', en: 'Beverages & Teas' },
  'boissons & thes': { ar: 'المشروبات والشاي', en: 'Beverages & Teas' },
  'boissons': { ar: 'المشروبات', en: 'Beverages' },
  'café & thé': { ar: 'قهوة وشاي', en: 'Coffee & Tea' },
  'jus frais': { ar: 'عصائر طازجة', en: 'Fresh Juices' },
  'sandwiches': { ar: 'سندويشات', en: 'Sandwiches' },
  'pizzas': { ar: 'بيتزا', en: 'Pizzas' },
  'pâtes': { ar: 'معكرونة', en: 'Pasta' },
  'pates': { ar: 'معكرونة', en: 'Pasta' },
  'poissons & fruits de mer': { ar: 'أسماك وفواكه البحر', en: 'Fish & Seafood' },
  'soupes': { ar: 'شوربات', en: 'Soups' },
  'marrakech': { ar: 'مراكش', en: 'Marrakech' },
  'casablanca': { ar: 'الدار البيضاء', en: 'Casablanca' },
  'rabat': { ar: 'الرباط', en: 'Rabat' },
  'tanger': { ar: 'طنجة', en: 'Tangier' },
};

export function getLocalizedText(
  lang: LanguageCode,
  frText?: string | null,
  arText?: string | null,
  enText?: string | null
): string {
  if (lang === 'ar' && arText?.trim()) return arText.trim();
  if (lang === 'en' && enText?.trim()) return enText.trim();

  // Try common dictionary fallback if specific language is requested but missing
  const cleanKey = (frText || '').toLowerCase().trim();
  if (cleanKey && COMMON_TRANSLATIONS[cleanKey]) {
    if (lang === 'ar' && COMMON_TRANSLATIONS[cleanKey].ar) {
      return COMMON_TRANSLATIONS[cleanKey].ar;
    }
    if (lang === 'en' && COMMON_TRANSLATIONS[cleanKey].en) {
      return COMMON_TRANSLATIONS[cleanKey].en;
    }
  }

  if (frText?.trim()) return frText.trim();
  return arText?.trim() || enText?.trim() || '';
}

/**
 * Dynamic Supabase fallback for dish names:
 * 1. Checks item.name_ar or item.name_en if requested
 * 2. If translated column is empty/missing, falls back to standard item.name (French) or item.name_fr
 * 3. Checks common food dictionary before raw fallback
 */
export function getLocalizedItemName(
  item: {
    name?: string | null;
    name_fr?: string | null;
    name_ar?: string | null;
    name_en?: string | null;
  } | null | undefined,
  lang: LanguageCode
): string {
  if (!item) return '';
  if (lang === 'ar' && item.name_ar && item.name_ar.trim()) {
    return item.name_ar.trim();
  }
  if (lang === 'en' && item.name_en && item.name_en.trim()) {
    return item.name_en.trim();
  }

  const standardFrench = item.name_fr?.trim() || item.name?.trim() || '';
  if (standardFrench) {
    const cleanKey = standardFrench.toLowerCase().trim();
    if (COMMON_TRANSLATIONS[cleanKey]) {
      if (lang === 'ar' && COMMON_TRANSLATIONS[cleanKey].ar) return COMMON_TRANSLATIONS[cleanKey].ar;
      if (lang === 'en' && COMMON_TRANSLATIONS[cleanKey].en) return COMMON_TRANSLATIONS[cleanKey].en;
    }
    return standardFrench;
  }

  return item.name_ar?.trim() || item.name_en?.trim() || '';
}

/**
 * Dynamic Supabase fallback for dish descriptions:
 * Checks description_ar / description_en, then description_fr or description
 */
export function getLocalizedItemDescription(
  item: {
    description?: string | null;
    description_fr?: string | null;
    description_ar?: string | null;
    description_en?: string | null;
  } | null | undefined,
  lang: LanguageCode
): string {
  if (!item) return '';
  if (lang === 'ar' && item.description_ar && item.description_ar.trim()) {
    return item.description_ar.trim();
  }
  if (lang === 'en' && item.description_en && item.description_en.trim()) {
    return item.description_en.trim();
  }
  return item.description_fr?.trim() || item.description?.trim() || item.description_ar?.trim() || item.description_en?.trim() || '';
}

/**
 * Dynamic Supabase fallback for category names:
 * Checks cat.name_ar or cat.name_en, then standard cat.name / cat.name_fr
 */
export function getLocalizedCategoryName(
  cat: {
    name?: string | null;
    name_fr?: string | null;
    name_ar?: string | null;
    name_en?: string | null;
  } | null | undefined,
  lang: LanguageCode
): string {
  if (!cat) return '';
  if (lang === 'ar' && cat.name_ar && cat.name_ar.trim()) {
    return cat.name_ar.trim();
  }
  if (lang === 'en' && cat.name_en && cat.name_en.trim()) {
    return cat.name_en.trim();
  }

  const standardFrench = cat.name_fr?.trim() || cat.name?.trim() || '';
  if (standardFrench) {
    const cleanKey = standardFrench.toLowerCase().trim();
    if (COMMON_TRANSLATIONS[cleanKey]) {
      if (lang === 'ar' && COMMON_TRANSLATIONS[cleanKey].ar) return COMMON_TRANSLATIONS[cleanKey].ar;
      if (lang === 'en' && COMMON_TRANSLATIONS[cleanKey].en) return COMMON_TRANSLATIONS[cleanKey].en;
    }
    return standardFrench;
  }

  return cat.name_ar?.trim() || cat.name_en?.trim() || '';
}

export function formatCurrency(currency: string | undefined, lang: LanguageCode): string {
  if (lang === 'ar') {
    if (!currency || currency === 'DH' || currency === 'MAD' || currency === 'MAD') {
      return 'د.م';
    }
    return currency;
  }
  if (lang === 'en') {
    if (!currency || currency === 'DH') {
      return 'MAD';
    }
    return currency;
  }
  return currency || 'DH';
}

