import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Category, MenuItem, Restaurant, Profile } from '../types/database';

// 1. Retrieve Supabase URL and Anon Key
const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {};
const envUrl = metaEnv.VITE_SUPABASE_URL;
const envKey = metaEnv.VITE_SUPABASE_ANON_KEY;

// Allow stored configuration in localStorage for quick testing without code edit
const customUrl = typeof window !== 'undefined' ? localStorage.getItem('touchbizz_supabase_url') : null;
const customKey = typeof window !== 'undefined' ? localStorage.getItem('touchbizz_supabase_key') : null;

export const supabaseUrl = customUrl || envUrl || '';
export const supabaseAnonKey = customKey || envKey || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('placeholder')
);

// Fallback dummy client if unconfigured to prevent crash at runtime
export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

export function saveCustomSupabaseConfig(url: string, key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('touchbizz_supabase_url', url.trim());
    localStorage.setItem('touchbizz_supabase_key', key.trim());
    window.location.reload();
  }
}

export function clearCustomSupabaseConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('touchbizz_supabase_url');
    localStorage.removeItem('touchbizz_supabase_key');
    window.location.reload();
  }
}

// -------------------------------------------------------------
// Client-side image compressor before upload
// -------------------------------------------------------------
export async function compressImage(file: File, maxWidth = 1200, quality = 0.82): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // If SVG or small file, don't re-encode
    if (file.type === 'image/svg+xml' || file.size < 80 * 1024) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              resolve(blob);
            } else {
              resolve(file);
            }
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = (err) => reject(err);
  });
}

// -------------------------------------------------------------
// Storage upload helper to Supabase bucket 'restaurant-assets'
// -------------------------------------------------------------
export async function uploadRestaurantAsset(
  file: File | Blob,
  path: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  if (onProgress) onProgress(20);

  // Compress if it's a File
  let uploadBlob: Blob = file;
  if (file instanceof File) {
    try {
      uploadBlob = await compressImage(file);
      if (onProgress) onProgress(50);
    } catch {
      uploadBlob = file;
    }
  }

  // If real Supabase is configured
  if (isSupabaseConfigured) {
    try {
      const fileName = `${Date.now()}-${path.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const { data, error } = await supabase.storage
        .from('restaurant-assets')
        .upload(fileName, uploadBlob, {
          cacheControl: '3600',
          upsert: true,
        });

      if (!error && data?.path) {
        if (onProgress) onProgress(90);

        const { data: publicUrlData } = supabase.storage
          .from('restaurant-assets')
          .getPublicUrl(data.path);

        if (onProgress) onProgress(100);
        return publicUrlData.publicUrl;
      }
      console.warn('Supabase storage upload returned error, using local fallback:', error?.message);
    } catch (err: any) {
      console.warn('Supabase storage upload failed, using local fallback:', err?.message);
    }
  }

  // If unconfigured or bucket upload failed, convert to local base64/dataURL so the user can test photo preview immediately
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (onProgress) onProgress(100);
      resolve(reader.result as string);
    };
    reader.readAsDataURL(uploadBlob);
  });
}

// -------------------------------------------------------------
// Seed / Mock Store for instant zero-config testing & preview
// -------------------------------------------------------------
const STORAGE_PREFIX = 'touchbizz_data_';

const DEFAULT_DEMO_RESTAURANT: Restaurant = {
  id: 'demo-rest-001',
  owner_id: 'demo-owner-123',
  name: 'Café Nakhil',
  slug: 'cafe-nakhil',
  description: 'Cuisine marocaine raffinée, pâtisseries artisanales & cafés d’exception au cœur de Marrakech.',
  address: '24 Avenue Mohammed VI, Hivernage, Marrakech',
  phone: '+212 5 24 43 00 00',
  logo_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
  cover_image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
  theme: 'moroccan',
  primary_color: '#c2410c',
  is_published: true,
  currency: 'DH',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const DEFAULT_DEMO_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    restaurant_id: 'demo-rest-001',
    name_fr: 'Petit-déjeuner',
    name_ar: 'فطور الصباح',
    name_en: 'Breakfast',
    description_fr: 'Servi de 08h00 à 12h00',
    description_ar: 'يقدم من 08:00 إلى 12:00',
    description_en: 'Served from 8:00 AM to 12:00 PM',
    sort_order: 1,
    is_visible: true,
  },
  {
    id: 'cat-2',
    restaurant_id: 'demo-rest-001',
    name_fr: 'Spécialités Marocaines',
    name_ar: 'أطباق مغربية أصيلة',
    name_en: 'Moroccan Specialties',
    description_fr: 'Tajines traditionnels & couscous au feu de bois',
    description_ar: 'طواجن تقليدية وكسكس أصيل',
    description_en: 'Traditional tagines & authentic couscous',
    sort_order: 2,
    is_visible: true,
  },
  {
    id: 'cat-3',
    restaurant_id: 'demo-rest-001',
    name_fr: 'Burgers & Grillades',
    name_ar: 'برجر ومشويات',
    name_en: 'Burgers & Grill',
    description_fr: 'Viande fraîche hachée à la minute, frites maison',
    description_ar: 'لحوم طازجة وبطاطس مقرمشة',
    description_en: 'Fresh minced beef, homemade crisp fries',
    sort_order: 3,
    is_visible: true,
  },
  {
    id: 'cat-4',
    restaurant_id: 'demo-rest-001',
    name_fr: 'Desserts & Pâtisseries',
    name_ar: 'حلويات',
    name_en: 'Desserts & Pastries',
    description_fr: 'Pâtisseries marocaines et françaises',
    description_ar: 'حلويات مغربية وفرنسية فاخرة',
    description_en: 'Artisan Moroccan & French pastries',
    sort_order: 4,
    is_visible: true,
  },
  {
    id: 'cat-5',
    restaurant_id: 'demo-rest-001',
    name_fr: 'Boissons & Thés',
    name_ar: 'مشروبات وشاي',
    name_en: 'Drinks & Tea',
    description_fr: 'Thé à la menthe fraîche, jus pressés',
    description_ar: 'شاي مغربي بالنعناع وعصائر طازجة',
    description_en: 'Fresh Moroccan mint tea, freshly squeezed juices',
    sort_order: 5,
    is_visible: true,
  },
];

const DEFAULT_DEMO_ITEMS: MenuItem[] = [
  {
    id: 'item-1',
    restaurant_id: 'demo-rest-001',
    category_id: 'cat-1',
    name_fr: 'Formule Beldi Marrakech',
    name_ar: 'فطور بلدي مراكشي',
    name_en: 'Beldi Breakfast Marrakech',
    description_fr: 'Œufs au khlii, msemen au miel pur, amlou d’argan, olives noires et thé à la menthe.',
    description_ar: 'بيض بالخليع، مسمن بالعسل الحر، أملو بزيت الأركان، زيتون أسود مع شاي بالنعناع المنعش.',
    description_en: 'Organic eggs with cured beef khlii, hot msemen, argan amlou, black olives and mint tea.',
    price: 65,
    old_price: 75,
    image_url: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=600&q=80',
    is_available: true,
    is_visible: true,
    sort_order: 1,
  },
  {
    id: 'item-2',
    restaurant_id: 'demo-rest-001',
    category_id: 'cat-1',
    name_fr: 'Toast Avocat & Œuf Poché',
    name_ar: 'توست الأفوكادو والبيض المسلوق',
    name_en: 'Avocado Toast & Poached Egg',
    description_fr: 'Pain de campagne au levain, avocat écrasé au citron vert, grenade et œuf fermier.',
    description_ar: 'خبز ريفي بالخميرة الطبيعية، أفوكادو مهروس بالليمون والرمان مع بيض بلدي مسلوق.',
    description_en: 'Artisan sourdough, smashed avocado with lime, pomegranate seeds and poached egg.',
    price: 55,
    old_price: null,
    image_url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
    is_available: true,
    is_visible: true,
    sort_order: 2,
  },
  {
    id: 'item-3',
    restaurant_id: 'demo-rest-001',
    category_id: 'cat-2',
    name_fr: 'Tajine d’Agneau aux Pruneaux & Amandes',
    name_ar: 'طاجين لحم الغنم بالبرقوق واللوز',
    name_en: 'Lamb Tagine with Prunes & Almonds',
    description_fr: 'Agneau fondant mijoté aux épices royales, pruneaux caramélisés et amandes grillées.',
    description_ar: 'لحم غنم طري مطهو بالتوابل الملكية، مع برقوق معسل ولوز مقلي مقرمش.',
    description_en: 'Slow-cooked tender lamb, caramelised prunes, toasted almonds and warm spices.',
    price: 110,
    old_price: 125,
    image_url: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=600&q=80',
    is_available: true,
    is_visible: true,
    sort_order: 1,
  },
  {
    id: 'item-4',
    restaurant_id: 'demo-rest-001',
    category_id: 'cat-2',
    name_fr: 'Pastilla Poulet & Amandes',
    name_ar: 'بسطيلة الدجاج واللوز',
    name_en: 'Chicken & Almond Pastilla',
    description_fr: 'Feuilleté croustillant d’effiloché de poulet fermier, cannelle, fleur d’oranger et amandes.',
    description_ar: 'ورقة مقرمشة محشوة بالدجاج البلدي المنسم بالقرفة، ماء الزهر ورقائق اللوز.',
    description_en: 'Crisp pastry layered with tender chicken, cinnamon, orange blossom and crushed almonds.',
    price: 95,
    old_price: null,
    image_url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80',
    is_available: true,
    is_visible: true,
    sort_order: 2,
  },
  {
    id: 'item-5',
    restaurant_id: 'demo-rest-001',
    category_id: 'cat-3',
    name_fr: 'Le Burger Nakhil Signature',
    name_ar: 'برجر النخيل المميز',
    name_en: 'Nakhil Signature Burger',
    description_fr: 'Boeuf Black Angus 180g, cheddar affiné, oignons confits au miel, sauce fumée maison.',
    description_ar: 'لحم بقري فاخر 180غ، جبن شيدر معتق، بصل مكرمل بالعسل وصلصة مدخنة خاصة.',
    description_en: '180g Black Angus beef patty, aged cheddar, honey-caramelised onions, signature smoked sauce.',
    price: 85,
    old_price: null,
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    is_available: true,
    is_visible: true,
    sort_order: 1,
  },
  {
    id: 'item-6',
    restaurant_id: 'demo-rest-001',
    category_id: 'cat-4',
    name_fr: 'Assortiment Cornes de Gazelle & Briouates',
    name_ar: 'تشكيلة كعب غزال وبريوات باللوز',
    name_en: 'Artisan Gazelle Horns & Almond Briouates',
    description_fr: 'Plateau de 4 douceurs marocaines confectionnées à l’eau de rose et amandes bio.',
    description_ar: 'طبق من 4 قطع حلويات تقليدية بماء الورد ولوز الأطلس الطبيعي.',
    description_en: '4 pieces of fine handcrafted Moroccan pastries with rosewater and pure almonds.',
    price: 45,
    old_price: null,
    image_url: 'https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=600&q=80',
    is_available: true,
    is_visible: true,
    sort_order: 1,
  },
  {
    id: 'item-7',
    restaurant_id: 'demo-rest-001',
    category_id: 'cat-5',
    name_fr: 'Thé Royal à la Menthe Fraîche',
    name_ar: 'شاي ملكي بالنعناع الطازج',
    name_en: 'Royal Fresh Mint Tea',
    description_fr: 'Infusé au thé vert gunpowder d’exception et menthe fraîche cueillie du jour.',
    description_ar: 'محضر بأجود أنواع الشاي الأخضر ونعناع طازج يقطف يومياً.',
    description_en: 'Steeped gunpowder green tea with fresh garden mint leaves.',
    price: 25,
    old_price: null,
    image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
    is_available: true,
    is_visible: true,
    sort_order: 1,
  },
];

// Helper to access LocalStorage for fallback persistence
export const localStore = {
  getRestaurants(): Restaurant[] {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}restaurants`);
    if (raw) {
      try {
        const list: Restaurant[] = JSON.parse(raw);
        if (Array.isArray(list) && list.length > 0) {
          return list;
        }
      } catch {
        // ignore
      }
    }
    // Fallback: check legacy single restaurant
    const singleRaw = localStorage.getItem(`${STORAGE_PREFIX}restaurant`);
    if (singleRaw) {
      try {
        const r: Restaurant = JSON.parse(singleRaw);
        if (r && r.id) {
          return [r];
        }
      } catch {
        // ignore
      }
    }
    return [DEFAULT_DEMO_RESTAURANT];
  },

  getRestaurant(idOrSlug?: string): Restaurant | null {
    const list = this.getRestaurants();
    if (!idOrSlug) {
      const activeId = localStorage.getItem(`${STORAGE_PREFIX}active_id`);
      if (activeId) {
        const found = list.find((r) => r.id === activeId);
        if (found) return found;
      }
      return list[0] || DEFAULT_DEMO_RESTAURANT;
    }

    const matched = list.find(
      (r) => r.id === idOrSlug || r.slug.toLowerCase() === idOrSlug.toLowerCase()
    );
    if (matched) return matched;

    if (idOrSlug === DEFAULT_DEMO_RESTAURANT.id || idOrSlug === DEFAULT_DEMO_RESTAURANT.slug) {
      return DEFAULT_DEMO_RESTAURANT;
    }

    return null;
  },

  saveRestaurant(r: Restaurant) {
    const list = this.getRestaurants();
    const idx = list.findIndex((item) => item.id === r.id || item.slug === r.slug);
    if (idx >= 0) {
      list[idx] = r;
    } else {
      list.push(r);
    }
    localStorage.setItem(`${STORAGE_PREFIX}restaurants`, JSON.stringify(list));
    localStorage.setItem(`${STORAGE_PREFIX}restaurant`, JSON.stringify(r));
    localStorage.setItem(`${STORAGE_PREFIX}active_id`, r.id);
  },

  setActiveRestaurantId(id: string) {
    localStorage.setItem(`${STORAGE_PREFIX}active_id`, id);
  },

  getActiveRestaurantId(): string | null {
    return localStorage.getItem(`${STORAGE_PREFIX}active_id`);
  },

  getCategories(restaurantId: string): Category[] {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}categories`);
    let allCats: Category[] = [];
    if (raw) {
      try {
        allCats = JSON.parse(raw);
      } catch {
        // ignore
      }
    } else {
      allCats = DEFAULT_DEMO_CATEGORIES;
    }

    const filtered = allCats.filter((c) => c.restaurant_id === restaurantId);
    if (filtered.length > 0) return filtered;

    if (restaurantId === DEFAULT_DEMO_RESTAURANT.id) {
      return DEFAULT_DEMO_CATEGORIES;
    }
    return [];
  },

  saveCategories(cats: Category[]) {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}categories`);
    let allCats: Category[] = [];
    if (raw) {
      try {
        allCats = JSON.parse(raw);
      } catch {
        allCats = [];
      }
    } else {
      allCats = [...DEFAULT_DEMO_CATEGORIES];
    }

    if (cats.length > 0) {
      const restId = cats[0].restaurant_id;
      // remove old ones for this restaurant, replace with new
      allCats = allCats.filter((c) => c.restaurant_id !== restId).concat(cats);
    }
    localStorage.setItem(`${STORAGE_PREFIX}categories`, JSON.stringify(allCats));
  },

  getItems(restaurantId: string): MenuItem[] {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}items`);
    let allItems: MenuItem[] = [];
    if (raw) {
      try {
        allItems = JSON.parse(raw);
      } catch {
        // ignore
      }
    } else {
      allItems = DEFAULT_DEMO_ITEMS;
    }

    const filtered = allItems.filter((i) => i.restaurant_id === restaurantId);
    if (filtered.length > 0) return filtered;

    if (restaurantId === DEFAULT_DEMO_RESTAURANT.id) {
      return DEFAULT_DEMO_ITEMS;
    }
    return [];
  },

  saveItems(items: MenuItem[]) {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}items`);
    let allItems: MenuItem[] = [];
    if (raw) {
      try {
        allItems = JSON.parse(raw);
      } catch {
        allItems = [];
      }
    } else {
      allItems = [...DEFAULT_DEMO_ITEMS];
    }

    if (items.length > 0) {
      const restId = items[0].restaurant_id;
      allItems = allItems.filter((i) => i.restaurant_id !== restId).concat(items);
    }
    localStorage.setItem(`${STORAGE_PREFIX}items`, JSON.stringify(allItems));
  },
};
