import React from 'react';
import {
  X,
  Sparkles,
  Leaf,
  ChefHat,
  Flame,
  Fish,
  Utensils,
  CheckCircle2,
} from 'lucide-react';
import { MenuItem, LanguageCode } from '../../types/database';
import { ThemeConfig } from '../../lib/themes';
import { getLocalizedItemName, getLocalizedItemDescription, I18N, isRtl } from '../../lib/i18n';

interface ProductDetailModalProps {
  item: MenuItem | null;
  theme?: ThemeConfig;
  lang: LanguageCode;
  currency: string;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  item,
  lang,
  currency,
  onClose,
}) => {
  if (!item) return null;

  const t = I18N[lang];
  const rtl = isRtl(lang);
  const name = getLocalizedItemName(item, lang);
  const desc = getLocalizedItemDescription(item, lang);

  const discountPercent =
    item.old_price && item.old_price > item.price
      ? Math.round(((item.old_price - item.price) / item.old_price) * 100)
      : null;

  const lowerText = `${item.name_fr || (item as any).name || ''} ${item.description_fr || (item as any).description || ''}`.toLowerCase();
  const hasFish =
    lowerText.includes('poisson') ||
    lowerText.includes('saumon') ||
    lowerText.includes('thon') ||
    lowerText.includes('crevette') ||
    lowerText.includes('fish');
  const hasSpicy =
    lowerText.includes('rouge') ||
    lowerText.includes('piment') ||
    lowerText.includes('spicy') ||
    lowerText.includes('harissa') ||
    lowerText.includes('piquant');
  const hasVeggie =
    lowerText.includes('salade') ||
    lowerText.includes('veggie') ||
    lowerText.includes('légume') ||
    lowerText.includes('vert') ||
    lowerText.includes('avocat') ||
    lowerText.includes('fromage');

  return (
    <div
      id="product-detail-modal-backdrop"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        id="product-detail-modal-content"
        dir={rtl ? 'rtl' : 'ltr'}
        className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto transform transition-all p-0 shadow-2xl relative bg-white text-slate-900 border border-stone-200/80"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="close-product-modal-btn"
          type="button"
          onClick={onClose}
          className="absolute top-4 end-4 z-20 p-2.5 rounded-full shadow-lg bg-black/55 text-white backdrop-blur-md hover:bg-black/75 transition-all cursor-pointer active:scale-90"
          aria-label={t.close}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Large Product Photo */}
        {item.image_url ? (
          <div className="relative aspect-4/3 w-full bg-stone-100 overflow-hidden">
            <img
              src={item.image_url}
              alt={name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {discountPercent && (
              <div className="absolute top-4 start-4">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-[#FF6B00] text-white shadow-md">
                  -{discountPercent}% {t.promo}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="h-28 bg-[#FAF7F2] border-b border-stone-200/70 flex items-center justify-center text-stone-400">
            <Utensils className="w-10 h-10 opacity-30" />
          </div>
        )}

        {/* Product Details Content */}
        <div className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div className="text-start">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                {name}
              </h2>
              <div className="mt-2 flex items-center gap-2">
                {item.is_available ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {t.available}
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    {t.unavailable}
                  </span>
                )}
              </div>
            </div>

            {/* Price Badge */}
            <div className="text-end shrink-0">
              <div className="text-2xl sm:text-3xl font-black text-[#FF6B00] tracking-tight">
                {typeof item.price === 'number'
                  ? item.price.toLocaleString('fr-FR', {
                      minimumFractionDigits: item.price % 1 === 0 ? 2 : 2,
                      maximumFractionDigits: 2,
                    })
                  : item.price}{' '}
                <span className="text-base font-bold text-slate-800">{currency}</span>
              </div>
              {item.old_price && (
                <div className="text-sm text-slate-400 line-through">
                  {item.old_price} {currency}
                </div>
              )}
            </div>
          </div>

          {/* Micro badges description */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-stone-100 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100">
              <Utensils className="w-3.5 h-3.5" />
              {t.homemade}
            </span>
            {hasVeggie && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                <Leaf className="w-3.5 h-3.5" />
                {t.veggieFresh}
              </span>
            )}
            {hasFish && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-[#FF6B00] border border-orange-100">
                <Fish className="w-3.5 h-3.5" />
                {t.fishSeafood}
              </span>
            )}
            {hasSpicy && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100">
                <Flame className="w-3.5 h-3.5" />
                {t.spicyHot}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
              <ChefHat className="w-3.5 h-3.5" />
              {t.originalRecipe}
            </span>
          </div>

          {/* Description */}
          <div className="mt-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              {t.dishDescriptionLabel}
            </h4>
            {desc ? (
              <p className="text-sm sm:text-base leading-relaxed text-slate-600">
                {desc}
              </p>
            ) : (
              <p className="text-sm italic text-slate-400">
                {t.defaultDishDesc}
              </p>
            )}
          </div>

          {/* Digital Menu Notice - Purely read-only */}
          <div className="mt-8 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>{t.consultativeNotice}</span>
            </span>
            <span>{t.poweredBy}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
