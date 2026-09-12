import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured, localStore } from './lib/supabase';
import {
  Restaurant,
  Category,
  MenuItem,
} from './types/database';
import {
  getRestaurantBySlug,
  getRestaurantForOwner,
  getOwnerRestaurants,
  getCategories,
  getMenuItems,
} from './lib/api';

// Admin Components
import { AdminLayout, AdminTab } from './components/admin/AdminLayout';
import { DashboardHome } from './components/admin/DashboardHome';
import { RestaurantProfile } from './components/admin/RestaurantProfile';
import { CategoriesManager } from './components/admin/CategoriesManager';
import { ProductsManager } from './components/admin/ProductsManager';
import { ScanMenu } from './components/admin/ScanMenu';
import { ThemeSelector } from './components/admin/ThemeSelector';
import { QRCodeManager } from './components/admin/QRCodeManager';
import { SettingsView } from './components/admin/SettingsView';
import { AddEstablishmentModal } from './components/admin/AddEstablishmentModal';

// Public Components
import { PublicMenu } from './components/public/PublicMenu';
import { LandingPage } from './components/public/LandingPage';

// Auth Components
import { AdminLogin } from './components/auth/AdminLogin';

export default function App() {
  // Current URL path
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  // Active Admin Tab
  const [currentTab, setCurrentTab] = useState<AdminTab>('dashboard');

  // Auth state with local storage persistence
  const [user, setUser] = useState<{ id: string; email: string } | null>(() => {
    try {
      const savedUser = localStorage.getItem('touchbizz_admin_user');
      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch {
      // ignore
    }
    return null;
  });

  // Multi-Restaurant Data state
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Add Establishment Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Sync browser popstate
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update browser history and state
  const navigateTo = (path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
  };

  // Check Supabase Auth state if configured
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (session?.user) {
          const authUser = { id: session.user.id, email: session.user.email || '' };
          setUser(authUser);
          try {
            localStorage.setItem('touchbizz_admin_user', JSON.stringify(authUser));
          } catch {
            // ignore
          }
        }
      })
      .catch((err) => {
        console.warn('Supabase getSession warning:', err);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const authUser = { id: session.user.id, email: session.user.email || '' };
        setUser(authUser);
        try {
          localStorage.setItem('touchbizz_admin_user', JSON.stringify(authUser));
        } catch {
          // ignore
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        try {
          localStorage.removeItem('touchbizz_admin_user');
        } catch {
          // ignore
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle successful login
  const handleAuthenticated = (userId: string, email: string) => {
    const authenticatedUser = { id: userId, email };
    setUser(authenticatedUser);
    try {
      localStorage.setItem('touchbizz_admin_user', JSON.stringify(authenticatedUser));
    } catch {
      // ignore
    }
    navigateTo('/admin');
  };

  // Load Restaurant & Data
  const loadData = async () => {
    try {
      setLoading(true);
      // Check if current path is a public restaurant URL /r/:slug
      const isPublicRoute = currentPath.startsWith('/r/');
      if (isPublicRoute) {
        const slug = currentPath.replace('/r/', '').split('/')[0] || 'cafe-nakhil';
        const rest = await getRestaurantBySlug(slug);
        const resolvedRest = rest || localStore.getRestaurant(slug) || localStore.getRestaurant();
        if (resolvedRest) {
          setRestaurant(resolvedRest);
          const [cats, menuItems] = await Promise.all([
            getCategories(resolvedRest.id),
            getMenuItems(resolvedRest.id),
          ]);
          setCategories(cats || []);
          setItems(menuItems || []);
        }
      } else if (
        currentPath === '/admin' ||
        currentPath.startsWith('/admin/') ||
        currentPath === '/dashboard'
      ) {
        // Admin: Fetch all establishments for owner
        const ownerId = user?.id || 'demo-owner-123';
        const allRests = await getOwnerRestaurants(ownerId);
        const resolvedList = allRests && allRests.length > 0 ? allRests : localStore.getRestaurants();
        setRestaurants(resolvedList);

        // Pick current active or first establishment
        const activeId = localStore.getActiveRestaurantId();
        const activeRest =
          resolvedList.find((r) => r.id === activeId) ||
          resolvedList[0] ||
          localStore.getRestaurant();

        setRestaurant(activeRest);

        if (activeRest) {
          const [cats, menuItems] = await Promise.all([
            getCategories(activeRest.id),
            getMenuItems(activeRest.id),
          ]);
          setCategories(cats || []);
          setItems(menuItems || []);
        }
      }
    } catch (err) {
      console.warn('Fallback loading due to error:', err);
      const allFallback = localStore.getRestaurants();
      setRestaurants(allFallback);
      const fallbackRest = localStore.getRestaurant();
      setRestaurant(fallbackRest);
      if (fallbackRest) {
        setCategories(localStore.getCategories(fallbackRest.id));
        setItems(localStore.getItems(fallbackRest.id));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentPath, user?.id]);

  // Handle Switching between Restaurants
  const handleSelectRestaurant = async (selected: Restaurant) => {
    setRestaurant(selected);
    localStore.setActiveRestaurantId(selected.id);
    localStore.saveRestaurant(selected);

    try {
      const [cats, menuItems] = await Promise.all([
        getCategories(selected.id),
        getMenuItems(selected.id),
      ]);
      setCategories(cats || []);
      setItems(menuItems || []);
    } catch (err) {
      console.warn('Error loading categories and items for selected restaurant:', err);
      setCategories(localStore.getCategories(selected.id));
      setItems(localStore.getItems(selected.id));
    }
  };

  // Handle Adding a New Establishment
  const handleAddEstablishmentSuccess = async (newEstablishment: Restaurant) => {
    setRestaurants((prev) => {
      const filtered = prev.filter((r) => r.id !== newEstablishment.id && r.slug !== newEstablishment.slug);
      return [newEstablishment, ...filtered];
    });

    await handleSelectRestaurant(newEstablishment);
    setCurrentTab('dashboard');
  };

  // Handle Logout
  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Signout warning:', err);
      }
    }
    try {
      localStorage.removeItem('touchbizz_admin_user');
    } catch {
      // ignore
    }
    setUser(null);
    navigateTo('/admin');
  };

  // -------------------------------------------------------------
  // 1. PUBLIC CLIENT MENU ROUTE: /r/:slug
  // -------------------------------------------------------------
  if (currentPath.startsWith('/r/')) {
    const slug = currentPath.replace('/r/', '').split('/')[0] || 'cafe-nakhil';
    return (
      <div className="relative">
        <PublicMenu restaurantSlug={slug} />
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. PROTECTED ADMIN ROUTE: /admin or /dashboard
  // -------------------------------------------------------------
  if (
    currentPath === '/admin' ||
    currentPath.startsWith('/admin/') ||
    currentPath === '/dashboard' ||
    currentPath === '/login'
  ) {
    // If NOT logged in: Show clean Admin Login form
    if (!user) {
      return (
        <AdminLogin
          onAuthenticated={handleAuthenticated}
          onBackToHome={() => navigateTo('/')}
          onViewDemoMenu={() => navigateTo('/r/cafe-nakhil')}
        />
      );
    }

    // If logged in: Display the Admin Dashboard
    if (loading || !restaurant) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
          <div className="w-10 h-10 border-3 border-orange-200 border-t-[#FF6B00] rounded-full animate-spin mb-3" />
          <span className="text-xs font-semibold text-slate-500">
            Chargement de votre espace restaurateur...
          </span>
        </div>
      );
    }

    // Helper to open public preview
    const handlePreviewMenu = () => {
      navigateTo(`/r/${restaurant.slug}`);
    };

    const handlePreviewMenuSlug = (slug: string) => {
      navigateTo(`/r/${slug}`);
    };

    return (
      <>
        <AdminLayout
          restaurant={restaurant}
          restaurants={restaurants}
          activeTab={currentTab}
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onTabChange={setCurrentTab}
          onSelectRestaurant={handleSelectRestaurant}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          restaurantName={restaurant.name}
          restaurantSlug={restaurant.slug}
          isPublished={restaurant.is_published}
          onLogout={handleLogout}
          onPreviewMenu={handlePreviewMenu}
          onPreview={handlePreviewMenu}
        >
          {/* 1. Dashboard Tab */}
          {currentTab === 'dashboard' && (
            <DashboardHome
              restaurant={restaurant}
              restaurants={restaurants}
              categories={categories}
              items={items}
              onNavigate={setCurrentTab}
              onPreview={handlePreviewMenu}
              onPreviewMenuSlug={handlePreviewMenuSlug}
              onRestaurantUpdated={(updated) => {
                setRestaurant(updated);
                setRestaurants((prev) =>
                  prev.map((r) => (r.id === updated.id ? updated : r))
                );
              }}
              onSelectRestaurant={handleSelectRestaurant}
              onOpenAddModal={() => setIsAddModalOpen(true)}
            />
          )}

          {/* 2. Establishment Profile Tab */}
          {currentTab === 'establishment' && (
            <RestaurantProfile
              restaurant={restaurant}
              onUpdate={(updated) => {
                setRestaurant(updated);
                setRestaurants((prev) =>
                  prev.map((r) => (r.id === updated.id ? updated : r))
                );
              }}
              onPreview={handlePreviewMenu}
            />
          )}

          {/* 3. Categories Manager Tab */}
          {currentTab === 'categories' && (
            <CategoriesManager
              restaurantId={restaurant.id}
              categories={categories}
              onCategoriesChanged={setCategories}
            />
          )}

          {/* 4. Products & Menu Items Tab */}
          {currentTab === 'products' && (
            <ProductsManager
              restaurantId={restaurant.id}
              categories={categories}
              items={items}
              currency={restaurant.currency}
              onItemsChanged={setItems}
            />
          )}

          {/* 5. Scan Menu from Photo Tab */}
          {currentTab === 'scan' && (
            <ScanMenu
              restaurantId={restaurant.id}
              currency={restaurant.currency}
              onScanCompleted={(newCats, newItems) => {
                setCategories(newCats);
                setItems(newItems);
              }}
              onGoToProducts={() => setCurrentTab('products')}
            />
          )}

          {/* 6. Visual Themes Tab */}
          {currentTab === 'themes' && (
            <ThemeSelector
              restaurant={restaurant}
              onThemeChanged={(updated) => {
                setRestaurant(updated);
                setRestaurants((prev) =>
                  prev.map((r) => (r.id === updated.id ? updated : r))
                );
              }}
              onPreview={handlePreviewMenu}
            />
          )}

          {/* 7. QR Code Manager Tab */}
          {currentTab === 'qrcode' && (
            <QRCodeManager
              restaurant={restaurant}
              onPreview={handlePreviewMenu}
            />
          )}

          {/* 8. Supabase & Architecture Settings Tab */}
          {currentTab === 'settings' && <SettingsView />}
        </AdminLayout>

        {/* Add Establishment Modal */}
        <AddEstablishmentModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          ownerId={user?.id || 'demo-owner-123'}
          existingSlugs={restaurants.map((r) => r.slug)}
          onSuccess={handleAddEstablishmentSuccess}
        />
      </>
    );
  }

  // -------------------------------------------------------------
  // 3. PUBLIC LANDING PAGE (DEFAULT ROUTE: /)
  // -------------------------------------------------------------
  return (
    <LandingPage
      onNavigateToDemo={(slug) => navigateTo(`/r/${slug || 'cafe-nakhil'}`)}
    />
  );
}
