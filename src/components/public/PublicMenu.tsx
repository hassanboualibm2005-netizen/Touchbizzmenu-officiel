import React, { useEffect, useState, useRef } from 'react';
import {
  Search,
  UtensilsCrossed,
  AlertCircle,
  Sparkles,
  Info,
  Share2,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Phone,
  Check,
  X,
  Instagram,
  Facebook,
  Music2,
} from 'lucide-react';
import { Restaurant, Category, MenuItem, LanguageCode } from '../../types/database';
import { fetchPublicMenu } from '../../lib/api';
import { getTheme } from '../../lib/themes';
import {
  I18N,
  isRtl,
  getLocalizedText,
  getLocalizedCategoryName,
  getLocalizedItemName,
  formatCurrency,
} from '../../lib/i18n';
import { LanguageSelector } from './LanguageSelector';
import { ProductCard } from './ProductCard';
import { ProductDetailModal } from './ProductDetailModal';

interface PublicMenuProps {
  slug?: string;
  restaurantSlug?: string;
  onBackToAdmin?: () => void;
}

export const PublicMenu: React.FC<PublicMenuProps> = ({ slug, restaurantSlug, onBackToAdmin }) => {
  const effectiveSlug = restaurantSlug || slug || 'cafe-nakhil';
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<'NOT_FOUND' | 'UNPUBLISHED' | 'FETCH_ERROR' | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [lang, setLang] = useState<LanguageCode>(() => {
    try {
      const saved =
        localStorage.getItem('touchbizz_menu_lang') ||
        localStorage.getItem('selected_language') ||
        localStorage.getItem('touchbizz_lang');
      if (saved === 'ar' || saved === 'en' || saved === 'fr') {
        return saved as LanguageCode;
      }
    } catch {
      // ignore
    }
    return 'fr';
  });

  const handleLanguageChange = (newLang: LanguageCode) => {
    setLang(newLang);
    try {
      localStorage.setItem('touchbizz_menu_lang', newLang);
      localStorage.setItem('selected_language', newLang);
      localStorage.setItem('touchbizz_lang', newLang);
    } catch {
      // ignore
    }
    // Synchronously update HTML direction and lang attribute
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  const navScrollRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isManualScroll = useRef<boolean>(false);
  const manualScrollTimer = useRef<NodeJS.Timeout | null>(null);

  // Load menu data
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setErrorStatus(null);

    fetchPublicMenu(effectiveSlug)
      .then((res) => {
        if (!isMounted) return;
        if (res.error) {
          setErrorStatus(res.error);
        } else if (res.data) {
          setRestaurant(res.data.restaurant);
          setCategories(res.data.categories);
          setItems(res.data.items);
          if (res.data.categories.length > 0) {
            setActiveCategory(res.data.categories[0].id);
          }
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Error loading public menu:', err);
        setErrorStatus('FETCH_ERROR');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [effectiveSlug]);

  // SCROLLSPY: Auto Active Sync as user scrolls down & auto-scrolls the active tab
  useEffect(() => {
    if (categories.length === 0) return;

    const visibleCats = categories.filter((c) => c.is_visible);
    if (visibleCats.length === 0) return;

    const handleScroll = () => {
      if (isManualScroll.current) return;

      const scrollPos = window.scrollY + 130; // sticky bar offset
      
      // If near the very top, keep first category active
      if (window.scrollY < 200) {
        const firstCatId = visibleCats[0].id;
        if (activeCategory !== firstCatId) {
          setActiveCategory(firstCatId);
          const pillEl = document.getElementById(`cat-nav-${firstCatId}`);
          if (pillEl && navScrollRef.current) {
            pillEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          }
        }
        return;
      }

      let currentCatId = visibleCats[0].id;
      for (const cat of visibleCats) {
        const el = document.getElementById(`section-${cat.id}`);
        if (el) {
          const top = el.offsetTop;
          if (scrollPos >= top) {
            currentCatId = cat.id;
          } else {
            break;
          }
        }
      }

      if (currentCatId && currentCatId !== activeCategory) {
        setActiveCategory(currentCatId);
        // Horizontal Auto-Scroll category bar so active tab stays visible
        const pillEl = document.getElementById(`cat-nav-${currentCatId}`);
        if (pillEl && navScrollRef.current) {
          pillEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [categories, activeCategory]);

  const t = I18N[lang];
  const rtl = isRtl(lang);
  const theme = getTheme(restaurant?.theme);
  const currency = formatCurrency(restaurant?.currency, lang);

  // Synchronize document dir and lang attribute
  useEffect(() => {
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    return () => {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'fr';
    };
  }, [rtl, lang]);

  // Scroll category bar horizontally via arrow buttons
  const handleScrollCategories = (direction: 'left' | 'right') => {
    if (!navScrollRef.current) return;
    const baseOffset = direction === 'left' ? -200 : 200;
    const scrollAmount = rtl ? -baseOffset : baseOffset;
    navScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  // Smooth scroll to category header on pill click
  const scrollToCategory = (categoryId: string) => {
    isManualScroll.current = true;
    if (manualScrollTimer.current) clearTimeout(manualScrollTimer.current);
    manualScrollTimer.current = setTimeout(() => {
      isManualScroll.current = false;
    }, 850);

    setActiveCategory(categoryId);

    // Auto-scroll horizontal pill into view
    const pillBtn = document.getElementById(`cat-nav-${categoryId}`);
    if (pillBtn && navScrollRef.current) {
      pillBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }

    const sectionEl = document.getElementById(`section-${categoryId}`);
    if (sectionEl) {
      const headerOffset = 110;
      const elementPosition = sectionEl.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  // Share menu link handler
  const handleShareMenu = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: restaurant?.name || 'TouchBizz Menu',
          text: `${t.sharePromptText} ${restaurant?.name || ''}`,
          url,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    } catch {
      // Ignored
    }
  };

  // Toggle search input
  const toggleSearch = () => {
    setIsSearchOpen((prev) => {
      const nextState = !prev;
      if (nextState) {
        setTimeout(() => searchInputRef.current?.focus(), 100);
      } else {
        setSearchQuery('');
      }
      return nextState;
    });
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const standardName = item.name_fr || (item as any).name || '';
    const standardDesc = item.description_fr || (item as any).description || '';
    const nameMatch =
      standardName.toLowerCase().includes(q) ||
      (item.name_ar && item.name_ar.toLowerCase().includes(q)) ||
      (item.name_en && item.name_en.toLowerCase().includes(q));
    const descMatch =
      standardDesc.toLowerCase().includes(q) ||
      (item.description_ar && item.description_ar.toLowerCase().includes(q)) ||
      (item.description_en && item.description_en.toLowerCase().includes(q));
    return nameMatch || descMatch;
  });

  const visibleCategories = categories.filter((cat) => {
    if (searchQuery.trim()) {
      return filteredItems.some((item) => item.category_id === cat.id);
    }
    return items.some((item) => item.category_id === cat.id);
  });

  // -------------------------------------------------------------
  // Render: Loading State
  // -------------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-full border-3 border-orange-200 border-t-[#FF6B00] animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-700 animate-pulse">
          {t.loadingMenu}
        </p>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Render: Error States
  // -------------------------------------------------------------
  if (errorStatus === 'NOT_FOUND' || !restaurant) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-stone-200/80 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-50 text-[#FF6B00] flex items-center justify-center mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">
            {t.menuNotFoundTitle}
          </h1>
          <p className="text-sm text-slate-500 mb-6">
            {t.menuNotFoundDesc}
          </p>
          <div className="text-xs text-slate-400">
            {t.poweredBy}
          </div>
        </div>
      </div>
    );
  }

  const locationText = restaurant.address
    ? getLocalizedText(
        lang,
        restaurant.address.split(',')[0].trim().toUpperCase(),
        restaurant.address.split(',')[0].trim(),
        restaurant.address.split(',')[0].trim().toUpperCase()
      )
    : (lang === 'ar' ? 'مراكش' : 'MARRAKECH');

  return (
    <div
      id="public-menu-container"
      dir={rtl ? 'rtl' : 'ltr'}
      className={`min-h-screen pb-24 bg-[#FAF7F2] text-slate-900 font-sans ${rtl ? 'font-cairo' : ''}`}
    >
      {/* Toast Notification when link is copied */}
      {copiedToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{t.linkCopied}</span>
        </div>
      )}

      {/* 1. PROFILE / HEADER SECTION (Strictly matches provided screenshot) */}
      <header className="relative w-full overflow-hidden">
        <div className="relative w-full min-h-[310px] sm:min-h-[350px] bg-stone-950 flex flex-col justify-between p-4 sm:p-6">
          {/* Hero Banner: Full-width dark cover photo background */}
          {restaurant.cover_image_url ? (
            <img
              src={restaurant.cover_image_url}
              alt={restaurant.name}
              className="absolute inset-0 w-full h-full object-cover brightness-[0.70]"
            />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-stone-900 via-stone-950 to-black" />
          )}

          {/* Dark gradient overlay matching screenshot atmospheric lighting */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 pointer-events-none" />

          {/* Top Bar: Quick Action Pills capsule (top end) */}
          <div className="relative z-30 flex items-center justify-end w-full">
            {/* Quick Action Pills: Top right corner floating capsule for (Info, Search, Share, Language Selector) */}
            <div className="flex items-center bg-black/50 backdrop-blur-md rounded-2xl p-1 text-white border border-white/15 shadow-xl">
              {/* Info Button */}
              <button
                type="button"
                onClick={() => setIsInfoModalOpen(true)}
                className="p-2 hover:bg-white/15 rounded-xl transition-colors cursor-pointer text-white/90 hover:text-white active:scale-90"
                title={t.restaurantInfo}
                aria-label={t.restaurantInfo}
              >
                <Info className="w-4 h-4" />
              </button>

              {/* Search Button */}
              <button
                type="button"
                onClick={toggleSearch}
                className="p-2 hover:bg-white/15 rounded-xl transition-colors cursor-pointer text-white/90 hover:text-white active:scale-90"
                title={t.searchPlaceholder}
                aria-label={t.searchPlaceholder}
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Share Button */}
              <button
                type="button"
                onClick={handleShareMenu}
                className="p-2 hover:bg-white/15 rounded-xl transition-colors cursor-pointer text-white/90 hover:text-white active:scale-90"
                title={t.shareMenu}
                aria-label={t.shareMenu}
              >
                <Share2 className="w-4 h-4" />
              </button>

              {/* Divider */}
              <div className="h-4 w-px bg-white/20 mx-1" />

              {/* Language Selector Dropdown */}
              <LanguageSelector
                currentLang={lang}
                onChange={handleLanguageChange}
                variant="capsule"
              />
            </div>
          </div>

          {/* Centered Logo: Clean rounded box with natural object-cover without harsh white card/borders */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto py-2">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-white/30 shadow-xl bg-black/20 backdrop-blur-sm mx-auto flex items-center justify-center transition-transform duration-300 hover:scale-105">
              {restaurant.logo_url ? (
                <img
                  src={restaurant.logo_url}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#FF6B00] text-white flex items-center justify-center font-black text-2xl">
                  {restaurant.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Text Info: Centered bold white Restaurant Name */}
            <h1 className="mt-3 text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
              {restaurant.name}
            </h1>

            {/* Sub-text for Location & Type */}
            <p className="mt-1 text-xs sm:text-sm font-semibold text-white/85 tracking-wider">
              {locationText} · {t.restaurantTag}
            </p>

            {/* Status badge */}
            <div className="mt-2 flex items-center justify-center gap-2 text-xs font-medium text-white/90">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-xs" />
              <span>{t.open} · {t.hoursValue}</span>
            </div>

            {/* Social Media Links (Instagram, Facebook, TikTok) */}
            {(restaurant.instagram_url || restaurant.facebook_url || restaurant.tiktok_url) && (
              <div className="mt-3 flex items-center justify-center gap-2.5">
                {restaurant.instagram_url && (
                  <a
                    id="menu-social-instagram"
                    href={restaurant.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/35 text-white backdrop-blur-md border border-white/25 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-xs"
                    title={t.instagram}
                    aria-label={t.instagram}
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {restaurant.facebook_url && (
                  <a
                    id="menu-social-facebook"
                    href={restaurant.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/35 text-white backdrop-blur-md border border-white/25 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-xs"
                    title={t.facebook}
                    aria-label={t.facebook}
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {restaurant.tiktok_url && (
                  <a
                    id="menu-social-tiktok"
                    href={restaurant.tiktok_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/35 text-white backdrop-blur-md border border-white/25 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-xs"
                    title={t.tiktok}
                    aria-label={t.tiktok}
                  >
                    <Music2 className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Spacing alignment */}
          <div className="relative z-10 h-1" />
        </div>
      </header>

      {/* Expandable Search Bar */}
      {isSearchOpen && (
        <div className="bg-white border-b border-stone-200/80 px-4 py-3 shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="max-w-4xl mx-auto relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute start-3 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full ps-9 pe-9 py-2.5 rounded-xl bg-[#FAF7F2] text-slate-900 placeholder-slate-400 text-xs sm:text-sm border border-stone-200/70 focus:border-[#FF6B00] focus:bg-white focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute end-3 p-1 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
                aria-label={t.clearSearch}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. SCROLLSPY CATEGORY BAR (Sticky top bar with category pills & auto active sync) */}
      <nav
        aria-label={t.categoriesLabel}
        className="sticky top-0 z-30 w-full bg-[#FAF7F2]/95 backdrop-blur-md border-b border-stone-200/70 py-2.5 shadow-2xs transition-all"
      >
        <div className="max-w-4xl mx-auto px-3 sm:px-4 flex items-center gap-1.5 sm:gap-2">
          {/* Horizontal scroll left button */}
          <button
            type="button"
            onClick={() => handleScrollCategories('left')}
            className="w-8 h-8 rounded-full bg-white border border-stone-200 text-slate-600 flex items-center justify-center shrink-0 shadow-2xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4 text-slate-500" />
          </button>

          {/* Horizontally scrollable list of pills */}
          <div
            ref={navScrollRef}
            className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 flex-1 px-0.5"
          >
            {categories
              .filter((c) => c.is_visible)
              .map((cat) => {
                const catName = getLocalizedCategoryName(cat, lang);
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    id={`cat-nav-${cat.id}`}
                    type="button"
                    onClick={() => scrollToCategory(cat.id)}
                    className={`px-5 py-2 rounded-full text-xs sm:text-sm shrink-0 transition-all duration-200 cursor-pointer select-none whitespace-nowrap active:scale-95 ${
                      isActive
                        ? 'bg-[#FF6B00] text-white font-bold shadow-xs border border-[#FF6B00]'
                        : 'bg-white text-slate-700 font-semibold border border-sky-300/80 hover:border-sky-400 hover:bg-slate-50'
                    }`}
                  >
                    {catName}
                  </button>
                );
              })}
          </div>

          {/* Horizontal scroll right arrow button */}
          <button
            type="button"
            onClick={() => handleScrollCategories('right')}
            className="w-8 h-8 rounded-full bg-white border border-stone-200 text-slate-600 flex items-center justify-center shrink-0 shadow-2xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          {/* Search Toggle icon at far right of the category bar */}
          <button
            type="button"
            onClick={toggleSearch}
            className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 shadow-2xs transition-all cursor-pointer active:scale-95 ${
              isSearchOpen
                ? 'bg-[#FF6B00] text-white border-[#FF6B00]'
                : 'bg-white border-stone-200 text-slate-600 hover:bg-slate-50'
            }`}
            title={t.searchPlaceholder}
            aria-label={t.searchPlaceholder}
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* 3. DISHES GRID & LIGHT THEME */}
      <main className="max-w-4xl mx-auto px-3 sm:px-4 mt-6">
        {/* Search status if active */}
        {searchQuery.trim() && (
          <div className="mb-6 flex items-center justify-between bg-white px-4 py-2.5 rounded-2xl border border-stone-200/80 shadow-2xs">
            <span className="text-xs sm:text-sm text-slate-600">
              {t.searchResultsFor} &ldquo;<span className="font-bold text-slate-900">{searchQuery}</span>&rdquo;
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-[#FF6B00]">
              {filteredItems.length} {t.itemsCount}
            </span>
          </div>
        )}

        {/* Empty Search State */}
        {searchQuery.trim() && filteredItems.length === 0 && (
          <div className="py-16 text-center bg-white rounded-3xl border border-stone-200/70 p-6 my-4 shadow-2xs">
            <UtensilsCrossed className="w-10 h-10 mx-auto text-stone-300 mb-3" />
            <p className="text-base font-bold text-slate-800">
              {t.noItemsFound}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {t.noItemsFoundDesc}
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="mt-4 px-4 py-2 rounded-xl bg-orange-50 text-[#FF6B00] text-xs font-bold hover:bg-orange-100 transition-colors cursor-pointer"
            >
              {t.clearSearch}
            </button>
          </div>
        )}

        {/* Categories and 2-Column Product Grid */}
        {visibleCategories.map((cat) => {
          const catName = getLocalizedCategoryName(cat, lang);
          const catItems = filteredItems.filter((item) => item.category_id === cat.id);

          if (catItems.length === 0) return null;

          return (
            <section
              key={cat.id}
              id={`section-${cat.id}`}
              className="mb-8 scroll-mt-24"
            >
              {/* Category Section Header matching screenshot:
                  Dark green vertical bar on start edge + uppercase orange category title */}
              <div className="flex items-center gap-2 mb-3.5">
                <span className="w-1 h-4.5 rounded-full bg-[#15803d]" />
                <h2 className="text-xs sm:text-sm font-black uppercase text-[#FF6B00] tracking-wider">
                  {catName}
                </h2>
              </div>

              {/* 2-Column grid on mobile (grid-cols-2 gap-3 md:grid-cols-3) */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                {catItems.map((item) => (
                  <ProductCard
                    key={item.id}
                    item={item}
                    theme={theme}
                    lang={lang}
                    currency={currency}
                    onSelect={(i) => setSelectedItem(i)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </main>

      {/* Footer */}
      <footer className="mt-14 text-center text-xs text-slate-500 max-w-sm mx-auto px-4 pb-8">
        <p className="font-bold text-slate-700">{restaurant.name}</p>
        {restaurant.address && (
          <p className="text-[11px] text-slate-400 mt-0.5">{restaurant.address}</p>
        )}
        <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
          <span>{t.poweredBy}</span>
        </p>
      </footer>

      {/* Product Detail Modal (Read-only, no "+" or cart buttons) */}
      <ProductDetailModal
        item={selectedItem}
        theme={theme}
        lang={lang}
        currency={currency}
        onClose={() => setSelectedItem(null)}
      />

      {/* Restaurant Info Modal (Opened via top right "i" pill button) */}
      {isInfoModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setIsInfoModalOpen(false)}
        >
          <div
            dir={rtl ? 'rtl' : 'ltr'}
            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-150 text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF6B00] flex items-center justify-center font-bold text-lg shadow-2xs shrink-0">
                  {restaurant.logo_url ? (
                    <img
                      src={restaurant.logo_url}
                      alt={restaurant.name}
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    restaurant.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {restaurant.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {locationText} · {t.restaurantTag}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsInfoModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                aria-label={t.close}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {restaurant.description && (
              <p className="text-xs sm:text-sm text-slate-600 mb-5 leading-relaxed bg-[#FAF7F2] p-3 rounded-2xl border border-stone-200/70">
                {restaurant.description}
              </p>
            )}

            <div className="space-y-3 text-xs sm:text-sm text-slate-700">
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <Clock className="w-4 h-4 text-[#FF6B00] shrink-0" />
                <div className="flex-1">
                  <span className="font-semibold text-slate-900 block text-xs">{t.hours}</span>
                  <span className="text-slate-500 text-xs">{t.hoursValue}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  {t.open}
                </span>
              </div>

              {restaurant.address && (
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <MapPin className="w-4 h-4 text-[#FF6B00] shrink-0" />
                  <div className="flex-1">
                    <span className="font-semibold text-slate-900 block text-xs">{t.address}</span>
                    <span className="text-slate-600 text-xs">{restaurant.address}</span>
                  </div>
                </div>
              )}

              {restaurant.phone && (
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <Phone className="w-4 h-4 text-[#FF6B00] shrink-0" />
                  <div className="flex-1">
                    <span className="font-semibold text-slate-900 block text-xs">{t.phone}</span>
                    <a
                      href={`tel:${restaurant.phone}`}
                      className="text-[#FF6B00] font-bold text-xs hover:underline"
                    >
                      {restaurant.phone}
                    </a>
                  </div>
                </div>
              )}

              {/* Social Media Links in Modal */}
              {(restaurant.instagram_url || restaurant.facebook_url || restaurant.tiktok_url) && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-900 block text-xs mb-2">
                    {t.followUs}
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {restaurant.instagram_url && (
                      <a
                        href={restaurant.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-pink-600 hover:bg-pink-50 transition-colors shadow-2xs"
                      >
                        <Instagram className="w-3.5 h-3.5" />
                        <span>Instagram</span>
                      </a>
                    )}
                    {restaurant.facebook_url && (
                      <a
                        href={restaurant.facebook_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors shadow-2xs"
                      >
                        <Facebook className="w-3.5 h-3.5" />
                        <span>Facebook</span>
                      </a>
                    )}
                    {restaurant.tiktok_url && (
                      <a
                        href={restaurant.tiktok_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 hover:bg-slate-100 transition-colors shadow-2xs"
                      >
                        <Music2 className="w-3.5 h-3.5" />
                        <span>TikTok</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsInfoModalOpen(false)}
              className="mt-6 w-full py-2.5 rounded-xl bg-[#FF6B00] text-white text-xs sm:text-sm font-bold shadow-sm hover:bg-orange-600 active:scale-98 transition-all cursor-pointer"
            >
              {t.close}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
