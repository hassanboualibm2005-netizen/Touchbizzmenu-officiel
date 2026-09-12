import React from 'react';
import {
  Leaf,
  ChefHat,
  Flame,
  Fish,
  Utensils,
} from 'lucide-react';
import { MenuItem, LanguageCode } from '../../types/database';
import { ThemeConfig } from '../../lib/themes';
import { getLocalizedItemName, I18N } from '../../lib/i18n';

interface ProductCardProps {
  item: MenuItem;
  theme?: ThemeConfig;
  lang: LanguageCode;
  currency: string;
  onSelect: (item: MenuItem) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  item,
  lang,
  currency,
  onSelect,
}) => {
  const t = I18N[lang];
  const name = getLocalizedItemName(item, lang);

  const discountPercent =
    item.old_price && item.old_price > item.price
      ? Math.round(((item.old_price - item.price) / item.old_price) * 100)
      : null;

  // Derive micro-badges matching the style in the screenshots
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
  const hasChef =
    lowerText.includes('tcheep') ||
    lowerText.includes('spaghetti') ||
    lowerText.includes('chef') ||
    lowerText.includes('maison') ||
    lowerText.includes('poulet') ||
    lowerText.includes('viande');

  return (
    <article
      id={`product-card-${item.id}`}
      onClick={() => onSelect(item)}
      className={`group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md border border-stone-200/70 flex flex-col justify-between transition-all duration-200 active:scale-[0.985] ${
        !item.is_available ? 'opacity-70 grayscale-[25%]' : ''
      }`}
    >
      <div>
        {/* 1. Product Image on top */}
        <div className="relative aspect-4/3 w-full overflow-hidden bg-stone-100">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-stone-100 flex items-center justify-center text-stone-300">
              <Utensils className="w-8 h-8 opacity-40" />
            </div>
          )}

          {/* Promo Tag */}
          {discountPercent && (
            <div className="absolute top-2 start-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FF6B00] text-white shadow-sm">
                -{discountPercent}%
              </span>
            </div>
          )}

          {/* Unavailable Overlay */}
          {!item.is_available && (
            <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] flex items-center justify-center p-2 text-center">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/95 text-slate-800 shadow-sm">
                {t.unavailable}
              </span>
            </div>
          )}
        </div>

        {/* 2. Title and Small Tags below */}
        <div className="p-3 pb-1 flex flex-col text-start">
          <h3 className="text-xs sm:text-sm font-bold text-[#D35400] hover:text-[#FF6B00] line-clamp-2 leading-snug tracking-tight">
            {name}
          </h3>

          {/* Micro Tags/Icons Row matching screenshot aesthetic */}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {/* Always show staple protein/gourmet badge */}
            <span
              title={t.homemade}
              className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-[10px] shadow-2xs shrink-0"
            >
              <Utensils className="w-3 h-3" />
            </span>

            {/* Veggie / Fresh badge */}
            {hasVeggie && (
              <span
                title={t.veggieFresh}
                className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] shadow-2xs shrink-0"
              >
                <Leaf className="w-3 h-3" />
              </span>
            )}

            {/* Chef signature badge */}
            {(hasChef || (!hasVeggie && !hasFish)) && (
              <span
                title={t.originalRecipe}
                className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] shadow-2xs shrink-0"
              >
                <ChefHat className="w-3 h-3" />
              </span>
            )}

            {/* Fish badge */}
            {hasFish && (
              <span
                title={t.fishSeafood}
                className="w-5 h-5 rounded-full bg-orange-100 text-[#FF6B00] flex items-center justify-center text-[10px] shadow-2xs shrink-0"
              >
                <Fish className="w-3 h-3" />
              </span>
            )}

            {/* Spicy badge */}
            {hasSpicy && (
              <span
                title={t.spicyHot}
                className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-[10px] shadow-2xs shrink-0"
              >
                <Flame className="w-3 h-3" />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Footer / Price at the bottom left. STRICT REQUIREMENT: NO "+" OR ORDERING BUTTONS */}
      <div className="px-3 pb-3 pt-2 mt-1 flex items-baseline justify-between">
        <div className="flex items-baseline gap-1">
          <span className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
            {typeof item.price === 'number'
              ? item.price.toLocaleString('fr-FR', {
                  minimumFractionDigits: item.price % 1 === 0 ? 2 : 2,
                  maximumFractionDigits: 2,
                })
              : item.price}{' '}
            {currency}
          </span>
          {item.old_price && (
            <span className="text-[10px] text-slate-400 line-through ml-1">
              {item.old_price}
            </span>
          )}
        </div>

        {/* Small subtle availability indicator */}
        {!item.is_available && (
          <span className="text-[10px] font-semibold text-slate-400">
            {t.unavailable}
          </span>
        )}
      </div>
    </article>
  );
};
