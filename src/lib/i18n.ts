import { LanguageCode } from '../types/database';

export interface TranslationDictionary {
  currency: string;
  allCategories: string;
  searchPlaceholder: string;
  noItemsFound: string;
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
}

export const I18N: Record<LanguageCode, TranslationDictionary> = {
  fr: {
    currency: 'DH',
    allCategories: 'Tout',
    searchPlaceholder: 'Rechercher un plat, une boisson...',
    noItemsFound: 'Aucun plat correspondant à votre recherche.',
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
  },
  ar: {
    currency: 'د.م',
    allCategories: 'الكل',
    searchPlaceholder: 'ابحث عن طبق أو مشروب...',
    noItemsFound: 'لا توجد أطباق مطابقة لبحثك.',
    noCategoryItems: 'لا توجد أطباق في هذا القسم حالياً.',
    available: 'متوفر',
    unavailable: 'نفذ',
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
  },
  en: {
    currency: 'MAD',
    allCategories: 'All',
    searchPlaceholder: 'Search a dish, drink...',
    noItemsFound: 'No dishes matching your search.',
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
  },
};

export function isRtl(lang: LanguageCode): boolean {
  return lang === 'ar';
}

export function getLocalizedText(
  lang: LanguageCode,
  frText?: string | null,
  arText?: string | null,
  enText?: string | null
): string {
  if (lang === 'ar' && arText?.trim()) return arText.trim();
  if (lang === 'en' && enText?.trim()) return enText.trim();
  if (frText?.trim()) return frText.trim();
  return arText?.trim() || enText?.trim() || '';
}
