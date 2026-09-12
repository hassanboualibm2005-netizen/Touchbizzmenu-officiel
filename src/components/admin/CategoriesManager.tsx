import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  X,
  AlertCircle,
  FolderTree,
  Check,
} from 'lucide-react';
import { Category } from '../../types/database';
import { saveCategory, deleteCategory } from '../../lib/api';

interface CategoriesManagerProps {
  restaurantId: string;
  categories: Category[];
  onCategoriesChanged: (cats: Category[]) => void;
}

export const CategoriesManager: React.FC<CategoriesManagerProps> = ({
  restaurantId,
  categories,
  onCategoriesChanged,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form fields
  const [nameFr, setNameFr] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [descFr, setDescFr] = useState('');
  const [descAr, setDescAr] = useState('');
  const [descEn, setDescEn] = useState('');
  const [isVisible, setIsVisible] = useState(true);

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingCategory(null);
    setNameFr('');
    setNameAr('');
    setNameEn('');
    setDescFr('');
    setDescAr('');
    setDescEn('');
    setIsVisible(true);
    setErrorMessage('');
    setModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setNameFr(cat.name_fr);
    setNameAr(cat.name_ar || '');
    setNameEn(cat.name_en || '');
    setDescFr(cat.description_fr || '');
    setDescAr(cat.description_ar || '');
    setDescEn(cat.description_en || '');
    setIsVisible(cat.is_visible);
    setErrorMessage('');
    setModalOpen(true);
  };

  // Save (Create or Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameFr.trim()) {
      setErrorMessage('Le nom en français est obligatoire.');
      return;
    }

    try {
      setSaving(true);
      const saved = await saveCategory({
        id: editingCategory?.id,
        restaurant_id: restaurantId,
        name_fr: nameFr.trim(),
        name_ar: nameAr.trim() || null,
        name_en: nameEn.trim() || null,
        description_fr: descFr.trim() || null,
        description_ar: descAr.trim() || null,
        description_en: descEn.trim() || null,
        is_visible: isVisible,
        sort_order: editingCategory ? editingCategory.sort_order : categories.length + 1,
      });

      let updatedList: Category[];
      if (editingCategory) {
        updatedList = categories.map((c) => (c.id === saved.id ? saved : c));
      } else {
        updatedList = [...categories, saved];
      }

      onCategoriesChanged(updatedList);
      setModalOpen(false);
    } catch (err: any) {
      console.error('Error saving category:', err);
      setErrorMessage(err.message || "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  // Delete
  const handleDelete = async (cat: Category) => {
    if (!window.confirm(`Supprimer la catégorie "${cat.name_fr}" et ses plats associés ?`)) {
      return;
    }
    try {
      await deleteCategory(cat.id, restaurantId);
      onCategoriesChanged(categories.filter((c) => c.id !== cat.id));
    } catch (err) {
      console.error('Error deleting category:', err);
      alert('Erreur lors de la suppression.');
    }
  };

  // Toggle Visibility
  const handleToggleVisibility = async (cat: Category) => {
    try {
      const updated = await saveCategory({
        ...cat,
        is_visible: !cat.is_visible,
      });
      onCategoriesChanged(categories.map((c) => (c.id === updated.id ? updated : c)));
    } catch (err) {
      console.error('Error updating category visibility:', err);
    }
  };

  // Reorder up/down
  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const list = [...categories];
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    // Update sort order values
    const updatedList = list.map((cat, idx) => ({
      ...cat,
      sort_order: idx + 1,
    }));

    onCategoriesChanged(updatedList);

    // Save orders in background
    for (const cat of updatedList) {
      saveCategory(cat).catch(console.error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Catégories du Menu
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Organisez votre carte par sections (Entrées, Plats, Desserts, Boissons...) avec traductions en Arabe et Anglais.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm active:scale-95 transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle catégorie</span>
        </button>
      </div>

      {/* Categories List */}
      {categories.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <FolderTree className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            Aucune catégorie pour le moment
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
            Créez votre première section de menu pour commencer à ajouter vos délicieux plats.
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-sm hover:bg-blue-700"
          >
            Ajouter une catégorie
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs divide-y divide-slate-100">
          {categories.map((cat, index) => (
            <div
              key={cat.id}
              className={`p-4 sm:p-5 flex items-center justify-between gap-4 transition-colors ${
                !cat.is_visible ? 'bg-slate-50/70 opacity-60' : 'hover:bg-slate-50/50'
              }`}
            >
              {/* Category Info */}
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Reorder arrows */}
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMove(index, 'up')}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20 hover:bg-slate-100"
                    title="Monter"
                  >
                    <MoveUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === categories.length - 1}
                    onClick={() => handleMove(index, 'down')}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20 hover:bg-slate-100"
                    title="Descendre"
                  >
                    <MoveDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                      {cat.name_fr}
                    </h3>
                    {cat.name_ar && (
                      <span className="text-xs font-medium text-slate-500 font-cairo bg-slate-100 px-2 py-0.5 rounded-md">
                        {cat.name_ar}
                      </span>
                    )}
                    {cat.name_en && (
                      <span className="text-[11px] font-medium text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
                        {cat.name_en}
                      </span>
                    )}
                  </div>
                  {cat.description_fr && (
                    <p className="text-xs text-slate-500 truncate max-w-md mt-0.5">
                      {cat.description_fr}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleVisibility(cat)}
                  className={`p-2 rounded-xl text-xs font-medium transition-colors ${
                    cat.is_visible
                      ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                      : 'text-slate-400 bg-slate-100 hover:bg-slate-200'
                  }`}
                  title={cat.is_visible ? 'Visible sur le menu' : 'Masquée'}
                >
                  {cat.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEdit(cat)}
                  className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Modifier"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(cat)}
                  className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* -------------------------------------------------------- */}
      {/* MOBILE-FRIENDLY MODAL / DRAWER FOR CATEGORY EDITOR      */}
      {/* -------------------------------------------------------- */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
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
                  placeholder="Ex: Tajines & Plats chauds"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              {/* Arabic Name (RTL) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nom en Arabe (العربية)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  placeholder="طواجن وأطباق ساخنة"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-cairo text-right focus:border-blue-600 focus:outline-none"
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
                  placeholder="Tagines & Main Dishes"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              {/* French Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description courte (Français)
                </label>
                <textarea
                  rows={2}
                  value={descFr}
                  onChange={(e) => setDescFr(e.target.value)}
                  placeholder="Ex: Préparés quotidiennement avec des ingrédients frais..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              {/* Arabic Description (RTL) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description en Arabe (العربية)
                </label>
                <textarea
                  rows={2}
                  dir="rtl"
                  value={descAr}
                  onChange={(e) => setDescAr(e.target.value)}
                  placeholder="وصف مختصر للقسم بالعربية..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-cairo text-right focus:border-blue-600 focus:outline-none"
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
                  placeholder="Short description in English..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              {/* Visible Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="category-visible-checkbox"
                  checked={isVisible}
                  onChange={(e) => setIsVisible(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300"
                />
                <label htmlFor="category-visible-checkbox" className="text-xs font-medium text-slate-700">
                  Afficher cette catégorie sur le menu public
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
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
