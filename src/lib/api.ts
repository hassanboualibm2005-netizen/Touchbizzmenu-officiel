import { supabase, isSupabaseConfigured, localStore } from './supabase';
import { Restaurant, Category, MenuItem, ThemeId } from '../types/database';

export interface PublicMenuData {
  restaurant: Restaurant;
  categories: Category[];
  items: MenuItem[];
}

// -------------------------------------------------------------
// Schema Detection & Graceful Fallback
// -------------------------------------------------------------
let schemaMissingDetected = false;
const schemaListeners = new Set<(missing: boolean) => void>();

export function isSupabaseSchemaMissing(): boolean {
  return schemaMissingDetected;
}

export function subscribeToSchemaMissing(callback: (missing: boolean) => void): () => void {
  schemaListeners.add(callback);
  callback(schemaMissingDetected);
  return () => {
    schemaListeners.delete(callback);
  };
}

export function notifySchemaMissing(missing: boolean) {
  schemaMissingDetected = missing;
  schemaListeners.forEach((cb) => cb(missing));
}

function isTableMissingError(err: any): boolean {
  if (!err) return false;
  const code = err.code || '';
  const msg = (err.message || err.details || '').toLowerCase();
  return (
    code === 'PGRST205' ||
    code === '42P01' ||
    msg.includes('schema cache') ||
    msg.includes('could not find the table') ||
    msg.includes('relation') ||
    msg.includes('does not exist')
  );
}

function handleDbError(err: any, context: string): boolean {
  if (isTableMissingError(err)) {
    if (!schemaMissingDetected) {
      console.warn(
        `[TouchBizz] Tables Supabase non trouvées (${err.code || 'PGRST205'}) lors de ${context}. Basculement automatique vers le stockage local sécurisé.`
      );
      notifySchemaMissing(true);
    }
    return true;
  }
  return false;
}

// Helper to load fallback local menu
function getLocalPublicMenu(slug: string): {
  data?: PublicMenuData;
  error?: 'NOT_FOUND' | 'UNPUBLISHED' | 'FETCH_ERROR';
} {
  const fallbackRest = localStore.getRestaurant(slug);
  if (!fallbackRest) {
    return { error: 'NOT_FOUND' };
  }

  if (!fallbackRest.is_published) {
    return { error: 'UNPUBLISHED', data: { restaurant: fallbackRest, categories: [], items: [] } };
  }

  const fallbackCats = localStore.getCategories(fallbackRest.id).filter((c) => c.is_visible);
  const fallbackItems = localStore.getItems(fallbackRest.id).filter((i) => i.is_visible);

  return {
    data: {
      restaurant: fallbackRest,
      categories: fallbackCats,
      items: fallbackItems,
    },
  };
}

// -------------------------------------------------------------
// Public Menu API: /r/:slug
// -------------------------------------------------------------
export async function fetchPublicMenu(slug: string): Promise<{
  data?: PublicMenuData;
  error?: 'NOT_FOUND' | 'UNPUBLISHED' | 'FETCH_ERROR';
  errorMessage?: string;
}> {
  if (isSupabaseConfigured && !schemaMissingDetected) {
    try {
      // 1. Fetch restaurant/establishment by slug (checks establishments first, then restaurants)
      let rest: any = null;
      try {
        const { data: estData, error: estErr } = await supabase
          .from('establishments')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();
        if (!estErr && estData) {
          rest = estData;
        }
      } catch {
        // ignore
      }

      if (!rest) {
        const { data: restData, error: restErr } = await supabase
          .from('restaurants')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (restErr) {
          if (handleDbError(restErr, 'fetchPublicMenu')) {
            return getLocalPublicMenu(slug);
          }
          console.warn('Error fetching restaurant from Supabase, falling back to local:', restErr.message);
          return getLocalPublicMenu(slug);
        }
        rest = restData;
      }

      if (!rest) {
        // Check local store as well before returning 404
        const local = getLocalPublicMenu(slug);
        if (local.data) return local;
        return { error: 'NOT_FOUND' };
      }

      if (!rest.is_published) {
        return { error: 'UNPUBLISHED', data: { restaurant: rest as Restaurant, categories: [], items: [] } };
      }

      // 2. Fetch visible categories
      const { data: cats, error: catErr } = await supabase
        .from('categories')
        .select('*')
        .eq('restaurant_id', rest.id)
        .eq('is_visible', true)
        .order('sort_order', { ascending: true });

      if (catErr) {
        handleDbError(catErr, 'fetchPublicCategories');
      }

      // 3. Fetch visible items
      const { data: items, error: itemErr } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', rest.id)
        .eq('is_visible', true)
        .order('sort_order', { ascending: true });

      if (itemErr) {
        handleDbError(itemErr, 'fetchPublicItems');
      }

      const normalizedCats = (cats || []).map((c: any) => ({
        ...c,
        name_fr: c.name_fr || c.name || '',
        name: c.name || c.name_fr || '',
        description_fr: c.description_fr || c.description || null,
        description: c.description || c.description_fr || null,
      })) as Category[];

      const normalizedItems = (items || []).map((it: any) => ({
        ...it,
        name_fr: it.name_fr || it.name || '',
        name: it.name || it.name_fr || '',
        description_fr: it.description_fr || it.description || null,
        description: it.description || it.description_fr || null,
      })) as MenuItem[];

      return {
        data: {
          restaurant: rest as Restaurant,
          categories: normalizedCats,
          items: normalizedItems,
        },
      };
    } catch (err: any) {
      if (handleDbError(err, 'fetchPublicMenu')) {
        return getLocalPublicMenu(slug);
      }
      console.warn('Supabase query failed, falling back to local store:', err);
      return getLocalPublicMenu(slug);
    }
  }

  // Local fallback
  return getLocalPublicMenu(slug);
}

export async function getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
  const res = await fetchPublicMenu(slug);
  return res.data?.restaurant || localStore.getRestaurant(slug);
}

// -------------------------------------------------------------
// Admin APIs (Owner operations & Multi-Restaurant)
// -------------------------------------------------------------
export async function getOwnerRestaurants(userId: string): Promise<Restaurant[]> {
  const localList = localStore.getRestaurants();

  if (isSupabaseConfigured && !schemaMissingDetected) {
    try {
      // 1. Try establishments table first
      const { data: estData, error: estErr } = await supabase
        .from('establishments')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

      if (!estErr && estData && estData.length > 0) {
        const merged = [...(estData as Restaurant[])];
        for (const loc of localList) {
          if (!merged.some((m) => m.id === loc.id || m.slug === loc.slug)) {
            merged.push(loc);
          }
        }
        return merged;
      }

      // 2. Try restaurants table
      const { data: restData, error: restErr } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

      if (!restErr && restData && restData.length > 0) {
        const merged = [...(restData as Restaurant[])];
        for (const loc of localList) {
          if (!merged.some((m) => m.id === loc.id || m.slug === loc.slug)) {
            merged.push(loc);
          }
        }
        return merged;
      }
    } catch (err) {
      console.warn('Error fetching establishments from Supabase:', err);
    }
  }

  return localList;
}

export async function getOwnerRestaurant(userId: string): Promise<Restaurant | null> {
  const all = await getOwnerRestaurants(userId);
  if (all.length > 0) {
    const activeId = localStore.getActiveRestaurantId();
    if (activeId) {
      const active = all.find((r) => r.id === activeId);
      if (active) return active;
    }
    return all[0];
  }
  return localStore.getRestaurant();
}

export const getRestaurantForOwner = getOwnerRestaurant;

export async function createEstablishment(payload: {
  owner_id: string;
  name: string;
  slug: string;
  phone?: string | null;
  address?: string | null;
  theme?: ThemeId;
  currency?: string;
  description?: string | null;
  primary_color?: string;
}): Promise<Restaurant> {
  const cleanSlug = payload.slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-');

  const themeColors: Record<ThemeId, string> = {
    minimal: '#0f172a',
    classic: '#2563eb',
    luxury: '#d97706',
    moroccan: '#ea580c',
    bistro: '#be123c',
  };

  const selectedTheme: ThemeId = payload.theme || 'classic';

  const newEstablishment: Restaurant = {
    id: 'est-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString(36),
    owner_id: payload.owner_id,
    name: payload.name.trim(),
    slug: cleanSlug,
    description: payload.description || null,
    address: payload.address || null,
    phone: payload.phone || null,
    facebook_url: null,
    instagram_url: null,
    tiktok_url: null,
    logo_url: null,
    cover_image_url: null,
    theme: selectedTheme,
    primary_color: payload.primary_color || themeColors[selectedTheme] || '#2563eb',
    is_published: true,
    currency: payload.currency || 'DH',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // 1. Persist in local storage immediately
  localStore.saveRestaurant(newEstablishment);

  // 2. Save into Supabase `establishments` table (and sync with `restaurants`)
  if (isSupabaseConfigured && !schemaMissingDetected) {
    try {
      const { data: estData, error: estErr } = await supabase
        .from('establishments')
        .insert(newEstablishment)
        .select()
        .single();

      if (estErr) {
        console.warn('Inserting into establishments failed, trying restaurants table:', estErr.message);
        const { data: restData, error: restErr } = await supabase
          .from('restaurants')
          .insert(newEstablishment)
          .select()
          .single();

        if (!restErr && restData) {
          // Success with restaurants table
        }
      } else if (estData) {
        // Also mirror into restaurants table if it exists
        try {
          await supabase.from('restaurants').upsert(newEstablishment);
        } catch {
          // ignore
        }
      }
    } catch (err) {
      console.warn('Establishment insert error into Supabase, kept locally:', err);
    }
  }

  // 3. Seed starter categories for this new establishment so the menu is immediately functional
  const starterCategories: Category[] = [
    {
      id: 'cat-' + Math.random().toString(36).substring(2, 8),
      restaurant_id: newEstablishment.id,
      name_fr: 'Entrées & Salades',
      name_ar: 'المقبلات والسلطات',
      name_en: 'Starters & Salads',
      description_fr: 'Sélection fraîche pour débuter',
      description_ar: 'تشكيلة طازجة لبداية مميزة',
      description_en: 'Fresh starters selection',
      sort_order: 1,
      is_visible: true,
    },
    {
      id: 'cat-' + Math.random().toString(36).substring(2, 8),
      restaurant_id: newEstablishment.id,
      name_fr: 'Plats Principaux',
      name_ar: 'الأطباق الرئيسية',
      name_en: 'Main Courses',
      description_fr: 'Nos spécialités de la maison',
      description_ar: 'أطباقنا الخاصة والمميزة',
      description_en: 'House specialties',
      sort_order: 2,
      is_visible: true,
    },
    {
      id: 'cat-' + Math.random().toString(36).substring(2, 8),
      restaurant_id: newEstablishment.id,
      name_fr: 'Boissons & Thés',
      name_ar: 'المشروبات والشاي',
      name_en: 'Beverages & Teas',
      description_fr: 'Thés marocains, cafés et jus frais',
      description_ar: 'شاي مغربي، قهوة وعصائر طازجة',
      description_en: 'Moroccan teas, coffees, and juices',
      sort_order: 3,
      is_visible: true,
    },
  ];
  localStore.saveCategories(starterCategories);

  if (isSupabaseConfigured && !schemaMissingDetected) {
    try {
      await supabase.from('categories').insert(starterCategories);
    } catch {
      // ignore
    }
  }

  return newEstablishment;
}

export async function saveRestaurantProfile(
  restaurant: Partial<Restaurant> & { id?: string; owner_id: string; slug: string; name: string }
): Promise<Restaurant> {
  const updatedRest: Restaurant = {
    id: restaurant.id || 'rest-' + Math.random().toString(36).substring(2, 9),
    owner_id: restaurant.owner_id,
    name: restaurant.name,
    slug: restaurant.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'),
    description: restaurant.description || null,
    address: restaurant.address || null,
    phone: restaurant.phone || null,
    facebook_url: restaurant.facebook_url !== undefined ? (restaurant.facebook_url?.trim() || null) : null,
    instagram_url: restaurant.instagram_url !== undefined ? (restaurant.instagram_url?.trim() || null) : null,
    tiktok_url: restaurant.tiktok_url !== undefined ? (restaurant.tiktok_url?.trim() || null) : null,
    logo_url: restaurant.logo_url || null,
    cover_image_url: restaurant.cover_image_url || null,
    theme: (restaurant.theme as ThemeId) || 'classic',
    primary_color: restaurant.primary_color || '#2563eb',
    is_published: restaurant.is_published ?? true,
    currency: restaurant.currency || 'DH',
    updated_at: new Date().toISOString(),
  };

  // Always keep local store in sync
  localStore.saveRestaurant(updatedRest);

  if (isSupabaseConfigured && !schemaMissingDetected) {
    try {
      // Try establishments table first
      let saved = false;
      try {
        const { data: estData, error: estErr } = await supabase
          .from('establishments')
          .upsert(updatedRest)
          .select()
          .single();
        if (!estErr && estData) {
          saved = true;
        }
      } catch {
        // ignore
      }

      // Also upsert into restaurants table
      const { data, error } = await supabase
        .from('restaurants')
        .upsert(updatedRest)
        .select()
        .single();

      if (error && !saved) {
        if (handleDbError(error, 'saveRestaurantProfile')) {
          return updatedRest;
        }
        console.warn('Error saving restaurant to Supabase, saved locally:', error.message);
        return updatedRest;
      }
      return (data || updatedRest) as Restaurant;
    } catch (err) {
      if (handleDbError(err, 'saveRestaurantProfile')) {
        return updatedRest;
      }
      console.warn('Error saving restaurant profile, saved locally:', err);
    }
  }

  return updatedRest;
}

export async function getCategories(restaurantId: string): Promise<Category[]> {
  if (isSupabaseConfigured && !schemaMissingDetected) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('sort_order', { ascending: true });

      if (error) {
        if (handleDbError(error, 'getCategories')) {
          return localStore.getCategories(restaurantId);
        }
        console.warn('Error fetching categories from Supabase, using local:', error.message);
        return localStore.getCategories(restaurantId);
      }
      if (data && data.length > 0) {
        return data as Category[];
      }
    } catch (err) {
      if (handleDbError(err, 'getCategories')) {
        return localStore.getCategories(restaurantId);
      }
      console.warn('Error fetching categories, using local store:', err);
    }
  }
  return localStore.getCategories(restaurantId);
}

export async function saveCategory(
  category: Partial<Category> & { restaurant_id: string; name_fr: string }
): Promise<Category> {
  const cat: Category = {
    id: category.id || 'cat-' + Math.random().toString(36).substring(2, 9),
    restaurant_id: category.restaurant_id,
    name_fr: category.name_fr,
    name_ar: category.name_ar || null,
    name_en: category.name_en || null,
    description_fr: category.description_fr || null,
    description_ar: category.description_ar || null,
    description_en: category.description_en || null,
    sort_order: category.sort_order ?? 0,
    is_visible: category.is_visible ?? true,
    updated_at: new Date().toISOString(),
  };

  // Keep local store in sync
  const list = localStore.getCategories(cat.restaurant_id);
  const idx = list.findIndex((c) => c.id === cat.id);
  if (idx >= 0) {
    list[idx] = cat;
  } else {
    list.push(cat);
  }
  localStore.saveCategories(list);

  if (isSupabaseConfigured && !schemaMissingDetected) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .upsert(cat)
        .select()
        .single();

      if (error) {
        if (handleDbError(error, 'saveCategory')) {
          return cat;
        }
        console.warn('Error saving category to Supabase, saved locally:', error.message);
        return cat;
      }
      return data as Category;
    } catch (err) {
      if (handleDbError(err, 'saveCategory')) {
        return cat;
      }
      console.warn('Error saving category, saved locally:', err);
    }
  }

  return cat;
}

export async function deleteCategory(id: string, restaurantId: string): Promise<void> {
  // Always update local store
  const list = localStore.getCategories(restaurantId).filter((c) => c.id !== id);
  localStore.saveCategories(list);
  const items = localStore.getItems(restaurantId).filter((i) => i.category_id !== id);
  localStore.saveItems(items);

  if (isSupabaseConfigured && !schemaMissingDetected) {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) {
        handleDbError(error, 'deleteCategory');
      }
    } catch (err) {
      handleDbError(err, 'deleteCategory');
    }
  }
}

export async function getMenuItems(restaurantId: string): Promise<MenuItem[]> {
  if (isSupabaseConfigured && !schemaMissingDetected) {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('sort_order', { ascending: true });

      if (error) {
        if (handleDbError(error, 'getMenuItems')) {
          return localStore.getItems(restaurantId);
        }
        console.warn('Error fetching items from Supabase, using local:', error.message);
        return localStore.getItems(restaurantId);
      }
      if (data && data.length > 0) {
        return data as MenuItem[];
      }
    } catch (err) {
      if (handleDbError(err, 'getMenuItems')) {
        return localStore.getItems(restaurantId);
      }
      console.warn('Error fetching menu items, using local store:', err);
    }
  }
  return localStore.getItems(restaurantId);
}

export async function saveMenuItem(
  item: Partial<MenuItem> & { restaurant_id: string; category_id: string; name_fr: string; price: number }
): Promise<MenuItem> {
  const menuItem: MenuItem = {
    id: item.id || 'item-' + Math.random().toString(36).substring(2, 9),
    restaurant_id: item.restaurant_id,
    category_id: item.category_id,
    name_fr: item.name_fr,
    name_ar: item.name_ar || null,
    name_en: item.name_en || null,
    description_fr: item.description_fr || null,
    description_ar: item.description_ar || null,
    description_en: item.description_en || null,
    price: Number(item.price),
    old_price: item.old_price ? Number(item.old_price) : null,
    image_url: item.image_url || null,
    is_available: item.is_available ?? true,
    is_visible: item.is_visible ?? true,
    sort_order: item.sort_order ?? 0,
    updated_at: new Date().toISOString(),
  };

  // Always update local store
  const list = localStore.getItems(menuItem.restaurant_id);
  const idx = list.findIndex((i) => i.id === menuItem.id);
  if (idx >= 0) {
    list[idx] = menuItem;
  } else {
    list.push(menuItem);
  }
  localStore.saveItems(list);

  if (isSupabaseConfigured && !schemaMissingDetected) {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .upsert(menuItem)
        .select()
        .single();

      if (error) {
        if (handleDbError(error, 'saveMenuItem')) {
          return menuItem;
        }
        console.warn('Error saving menu item to Supabase, saved locally:', error.message);
        return menuItem;
      }
      return data as MenuItem;
    } catch (err) {
      if (handleDbError(err, 'saveMenuItem')) {
        return menuItem;
      }
      console.warn('Error saving menu item, saved locally:', err);
    }
  }

  return menuItem;
}

export async function deleteMenuItem(id: string, restaurantId: string): Promise<void> {
  // Always update local store
  const list = localStore.getItems(restaurantId).filter((i) => i.id !== id);
  localStore.saveItems(list);

  if (isSupabaseConfigured && !schemaMissingDetected) {
    try {
      const { error } = await supabase.from('menu_items').delete().eq('id', id);
      if (error) {
        handleDbError(error, 'deleteMenuItem');
      }
    } catch (err) {
      handleDbError(err, 'deleteMenuItem');
    }
  }
}

export async function batchInsertFromScan(
  restaurantId: string,
  categoriesToCreate: { name_fr: string; name_ar?: string; name_en?: string }[],
  itemsToCreate: { category_name: string; name_fr: string; name_ar?: string; name_en?: string; description_fr?: string; price: number }[]
): Promise<{ addedCategoriesCount: number; addedItemsCount: number }> {
  // 1. Existing categories
  const existingCats = await getCategories(restaurantId);
  const catMap = new Map<string, Category>();
  for (const c of existingCats) {
    catMap.set(c.name_fr.toLowerCase().trim(), c);
  }

  let addedCats = 0;
  for (const catInput of categoriesToCreate) {
    const key = catInput.name_fr.toLowerCase().trim();
    if (!catMap.has(key)) {
      const created = await saveCategory({
        restaurant_id: restaurantId,
        name_fr: catInput.name_fr,
        name_ar: catInput.name_ar || null,
        name_en: catInput.name_en || null,
        sort_order: existingCats.length + addedCats + 1,
      });
      catMap.set(key, created);
      addedCats++;
    }
  }

  let addedItems = 0;
  for (const itemInput of itemsToCreate) {
    const matchedCat = catMap.get(itemInput.category_name.toLowerCase().trim());
    if (matchedCat) {
      await saveMenuItem({
        restaurant_id: restaurantId,
        category_id: matchedCat.id,
        name_fr: itemInput.name_fr,
        name_ar: itemInput.name_ar || null,
        name_en: itemInput.name_en || null,
        description_fr: itemInput.description_fr || null,
        price: itemInput.price,
        sort_order: addedItems + 1,
      });
      addedItems++;
    }
  }

  return { addedCategoriesCount: addedCats, addedItemsCount: addedItems };
}
