export type ThemeId = 'minimal' | 'classic' | 'luxury' | 'moroccan' | 'bistro';

export type LanguageCode = 'fr' | 'ar' | 'en';

export interface Profile {
  id: string;
  full_name: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Restaurant {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  theme: ThemeId;
  primary_color: string;
  is_published: boolean;
  currency?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  restaurant_id: string;
  name_fr: string;
  name_ar: string | null;
  name_en: string | null;
  description_fr: string | null;
  description_ar: string | null;
  description_en: string | null;
  sort_order: number;
  is_visible: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id: string;
  name_fr: string;
  name_ar: string | null;
  name_en: string | null;
  description_fr: string | null;
  description_ar: string | null;
  description_en: string | null;
  price: number;
  old_price: number | null;
  image_url: string | null;
  is_available: boolean;
  is_visible: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface ExtractedMenuItem {
  category_name: string;
  name_fr: string;
  name_ar?: string;
  name_en?: string;
  description_fr?: string;
  price: number;
}
