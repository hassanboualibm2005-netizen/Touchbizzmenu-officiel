import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  UploadCloud,
  Search,
  CheckCircle2,
  XCircle,
  X,
  AlertCircle,
  UtensilsCrossed,
  Tag,
} from 'lucide-react';
import { MenuItem, Category } from '../../types/database';
import { saveMenuItem, deleteMenuItem } from '../../lib/api';
import { uploadRestaurantAsset } from '../../lib/supabase';

interface ProductsManagerProps {
  restaurantId: string;
  categories: Category[];
  items: MenuItem[];
  currency: string;
  onItemsChanged: (items: MenuItem[]) => void;
}

export const ProductsManager: React.FC<ProductsManagerProps> = ({
  restaurantId,
  categories,
  items,
  currency,
  onItemsChanged,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Filter & Search states
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Form states
  const [categoryId, setCategoryId] = useState<string>('');
  const [nameFr, setNameFr] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [descFr, setDescFr] = useState('');
  const [descAr, setDescAr] = useState('');
  const [descEn, setDescEn] = useState('');
  const [price, setPrice] = useState<string>('');
  const [oldPrice, setOldPrice] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  // Uploading state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Open modal to Create
  const handleOpenCreate = () => {
    setEditingItem(null);
    setCategoryId(categories[0]?.id || '');
    setNameFr('');
    setNameAr('');
    setNameEn('');
    setDescFr('');
    setDescAr('');
    setDescEn('');
    setPrice('');
    setOldPrice('');
    setImageUrl('');
    setIsAvailable(true);
    setIsVisible(true);
    setErrorMessage('');
    setModalOpen(true);
  };

  // Open modal to Edit
  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setCategoryId(item.category_id);
    setNameFr(item.name_fr);
    setNameAr(item.name_ar || '');
    setNameEn(item.name_en || '');
    setDescFr(item.description_fr || '');
    setDescAr(item.description_ar || '');
    setDescEn(item.description_en || '');
    setPrice(item.price.toString());
    setOldPrice(item.old_price ? item.old_price.toString() : '');
    setImageUrl(item.image_url || '');
    setIsAvailable(item.is_available);
    setIsVisible(item.is_visible);
    setErrorMessage('');
    setModalOpen(true);
  };

  // Upload image to Supabase Storage with compression
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      setUploadProgress(15);
      const url = await uploadRestaurantAsset(
        file,
        `item-${Date.now()}`,
        setUploadProgress
      );
      setImageUrl(url);
    } catch (err: any) {
      console.error('Image upload error:', err);
      setErrorMessage("Erreur lors de l'envoi de l'image: " + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  // Save Item
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameFr.trim()) {
      setErrorMessage('Le nom en français est obligatoire.');
      return;
    }
    if (!categoryId) {
      setErrorMessage('Veuillez sélectionner une catégorie.');
      return;
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      setErrorMessage('Veuillez saisir un prix valide.');
      return;
    }

    try {
      setSaving(true);
      const saved = await saveMenuItem({
        id: editingItem?.id,
        restaurant_id: restaurantId,
        category_id: categoryId,
        name_fr: nameFr.trim(),
        name_ar: nameAr.trim() || null,
        name_en: nameEn.trim() || null,
        description_fr: descFr.trim() || null,
        description_ar: descAr.trim() || null,
        description_en: descEn.trim() || null,
        price: numPrice,
        old_price: oldPrice ? parseFloat(oldPrice) : null,
        image_url: imageUrl || null,
        is_available: isAvailable,
        is_visible: isVisible,
        sort_order: editingItem ? editingItem.sort_order : items.length + 1,
      });

      let updatedList: MenuItem[];
      if (editingItem) {
        updatedList = items.map((i) => (i.id === saved.id ? saved : i));
      } else {
        updatedList = [...items, saved];
      }

      onItemsChanged(updatedList);
      setModalOpen(false);
    } catch (err: any) {
      console.error('Save product error:', err);
      setErrorMessage(err.message || "Erreur lors de l'enregistrement du produit.");
    } finally {
      setSaving(false);
    }
  };

  // Delete Item
  const handleDelete = async (item: MenuItem) => {
    if (!window.confirm(`Supprimer le produit "${item.name_fr}" ?`)) return;
    try {
      await deleteMenuItem(item.id, restaurantId);
      onItemsChanged(items.filter((i) => i.id !== item.id));
    } catch (err) {
      console.error('Delete item error:', err);
      alert('Erreur lors de la suppression.');
    }
  };

  // Toggle Availability
  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      const updated = await saveMenuItem({
        ...item,
        is_available: !item.is_available,
      });
      onItemsChanged(items.map((i) => (i.id === updated.id ? updated : i)));
    } catch (err) {
      console.error('Error toggling availability:', err);
    }
  };

  // Toggle Visibility
  const handleToggleVisibility = async (item: MenuItem) => {
    try {
      const updated = await saveMenuItem({
        ...item,
        is_visible: !item.is_visible,
      });
      onItemsChanged(items.map((i) => (i.id === updated.id ? updated : i)));
    } catch (err) {
      console.error('Error toggling visibility:', err);
    }
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesCategory =
      selectedCategoryFilter === 'all' || item.category_id === selectedCategoryFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.name_fr.toLowerCase().includes(q) ||
      (item.name_ar && item.name_ar.toLowerCase().includes(q)) ||
      (item.description_fr && item.description_fr.toLowerCase().includes(q));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Produits & Carte
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Gérez vos plats, tarifs, photos, offres promotionnelles et statut de disponibilité en temps réel.
          </p>
        </div>

        <button
          type="button"
          disabled={categories.length === 0}
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm active:scale-95 transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un produit</span>
        </button>
      </div>

      {/* If no categories exist */}
      {categories.length === 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
          <span>
            Vous devez d'abord créer au moins une catégorie avant d'ajouter des produits.
          </span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un plat..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-blue-600 focus:outline-none"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="w-full sm:w-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 cursor-pointer transition-all ${
              selectedCategoryFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tous ({items.length})
          </button>
          {categories.map((cat) => {
            const count = items.filter((i) => i.category_id === cat.id).length;
            const isSelected = selectedCategoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategoryFilter(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.name_fr} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Products List */}
      {filteredItems.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center">
          <UtensilsCrossed className="w-10 h-10 mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            Aucun plat trouvé
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            {searchQuery
              ? 'Aucun résultat ne correspond à votre recherche.'
              : 'Commencez à ajouter les spécialités de votre restaurant.'}
          </p>
          {categories.length > 0 && !searchQuery && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-sm hover:bg-blue-700"
            >
              Ajouter un plat
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const cat = categories.find((c) => c.id === item.category_id);
            return (
              <div
                key={item.id}
                className={`bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between shadow-xs transition-all ${
                  !item.is_visible ? 'opacity-50' : ''
                }`}
              >
                <div>
                  {/* Photo & Category Tag */}
                  <div className="relative aspect-16/10 rounded-xl overflow-hidden bg-slate-100 mb-3">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name_fr}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <UtensilsCrossed className="w-8 h-8 opacity-40" />
                      </div>
                    )}

                    {cat && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-semibold text-white">
                        {cat.name_fr}
                      </span>
                    )}

                    {item.old_price && item.old_price > item.price && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-rose-600 text-[10px] font-bold text-white">
                        Promo
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      {item.name_fr}
                    </h3>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-blue-600">
                        {item.price} {currency}
                      </span>
                      {item.old_price && (
                        <div className="text-[10px] text-slate-400 line-through">
                          {item.old_price} {currency}
                        </div>
                      )}
                    </div>
                  </div>

                  {item.name_ar && (
                    <p className="text-xs text-slate-500 font-cairo mt-0.5">
                      {item.name_ar}
                    </p>
                  )}

                  {item.description_fr && (
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1.5">
                      {item.description_fr}
                    </p>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  {/* Availability Toggle button */}
                  <button
                    type="button"
                    onClick={() => handleToggleAvailability(item)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      item.is_available
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                    }`}
                  >
                    {item.is_available ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Disponible</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Épuisé</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1">
                    {/* Visibility Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(item)}
                      className={`p-1.5 rounded-lg text-xs ${
                        item.is_visible ? 'text-slate-500 hover:bg-slate-100' : 'text-slate-300'
                      }`}
                      title={item.is_visible ? 'Masquer' : 'Rendre visible'}
                    >
                      {item.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    {/* Edit button */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                      title="Modifier"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* -------------------------------------------------------- */}
      {/* MOBILE-FRIENDLY PRODUCT EDITOR MODAL                     */}
      {/* -------------------------------------------------------- */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                {editingItem ? 'Modifier le produit' : 'Nouveau produit'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 pt-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Photo Upload with compression */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Photo du plat (compressée automatiquement)
                </label>
                <div className="relative h-36 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                  {imageUrl ? (
                    <>
                      <img src={imageUrl} alt="Plat" className="w-full h-full object-cover" />
                      <label className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <span className="px-3 py-1.5 rounded-xl bg-white text-slate-900 text-xs font-bold shadow-md">
                          Remplacer la photo
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          className="hidden"
                        />
                      </label>
                    </>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center p-4 text-center w-full h-full">
                      <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />
                      <span className="text-xs font-semibold text-slate-700">
                        Choisir une photo
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        JPEG, PNG, WebP
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>
                  )}

                  {uploadingImage && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center">
                      <div className="w-28 h-2 bg-slate-200 rounded-full overflow-hidden mb-1.5">
                        <div
                          className="h-full bg-blue-600 transition-all duration-200"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-700">
                        Envoi... {uploadProgress}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Category selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catégorie <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-600 focus:outline-none bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name_fr}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price & Old price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Prix ({currency}) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Ex: 85"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ancien prix (Optionnel promo)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={oldPrice}
                    onChange={(e) => setOldPrice(e.target.value)}
                    placeholder="Ex: 95"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* French Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nom en Français <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nameFr}
                  onChange={(e) => setNameFr(e.target.value)}
                  placeholder="Ex: Burger Gourmet Black Angus"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              {/* Arabic Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nom en Arabe (العربية)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  placeholder="برجر لحم أنجوس فاخر"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-cairo text-right focus:border-blue-600 focus:outline-none"
                />
              </div>

              {/* English Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nom en Anglais (English)
                </label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="Black Angus Gourmet Burger"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              {/* French Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description (Français)
                </label>
                <textarea
                  rows={2}
                  value={descFr}
                  onChange={(e) => setDescFr(e.target.value)}
                  placeholder="Ingrédients, accompagnements..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              {/* Arabic Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description en Arabe (العربية)
                </label>
                <textarea
                  rows={2}
                  dir="rtl"
                  value={descAr}
                  onChange={(e) => setDescAr(e.target.value)}
                  placeholder="وصف المكونات بالعربية..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-cairo text-right focus:border-blue-600 focus:outline-none"
                />
              </div>

              {/* English Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description en Anglais (English)
                </label>
                <textarea
                  rows={2}
                  value={descEn}
                  onChange={(e) => setDescEn(e.target.value)}
                  placeholder="Description in English..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              {/* Toggles: Available & Visible */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    En stock / Disponible
                  </span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={(e) => setIsVisible(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    Affiché sur le menu
                  </span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer le plat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
