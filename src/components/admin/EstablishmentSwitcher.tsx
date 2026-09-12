import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Store,
  Plus,
  Check,
  ExternalLink,
} from 'lucide-react';
import { Restaurant } from '../../types/database';

interface EstablishmentSwitcherProps {
  restaurants: Restaurant[];
  currentRestaurant: Restaurant;
  onSelectRestaurant: (restaurant: Restaurant) => void;
  onOpenAddModal: () => void;
  className?: string;
  collapsed?: boolean;
}

export const EstablishmentSwitcher: React.FC<EstablishmentSwitcherProps> = ({
  restaurants,
  currentRestaurant,
  onSelectRestaurant,
  onOpenAddModal,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 transition-all text-left flex items-center justify-between gap-2 shadow-2xs group focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-2xs transition-transform group-hover:scale-105"
            style={{ backgroundColor: currentRestaurant.primary_color || '#2563eb' }}
          >
            {currentRestaurant.name.charAt(0).toUpperCase()}
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                {currentRestaurant.name}
              </p>
            </div>
            <p className="text-[10px] text-slate-400 font-mono truncate leading-tight mt-0.5">
              /r/{currentRestaurant.slug}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
              currentRestaurant.is_published
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {currentRestaurant.is_published ? 'Publié' : 'Brouillon'}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 z-40 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-fadeIn py-1 min-w-[260px]">
          <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Vos Établissements ({restaurants.length})
            </span>
          </div>

          <div className="max-h-60 overflow-y-auto divide-y divide-slate-50 py-1">
            {restaurants.map((rest) => {
              const isSelected = rest.id === currentRestaurant.id;
              return (
                <button
                  key={rest.id}
                  type="button"
                  onClick={() => {
                    onSelectRestaurant(rest);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2.5 text-left flex items-center justify-between gap-2 hover:bg-slate-50 transition-colors ${
                    isSelected ? 'bg-blue-50/60' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{ backgroundColor: rest.primary_color || '#2563eb' }}
                    >
                      {rest.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <p
                        className={`text-xs font-bold truncate ${
                          isSelected ? 'text-blue-700' : 'text-slate-800'
                        }`}
                      >
                        {rest.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono truncate">
                        /r/{rest.slug}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        rest.is_published
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {rest.is_published ? 'En ligne' : 'Brouillon'}
                    </span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Add establishment button */}
          <div className="p-1.5 border-t border-slate-100 bg-slate-50/50">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenAddModal();
              }}
              className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter un établissement</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
