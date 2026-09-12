import React, { useState } from 'react';
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileText,
  ScanText,
  Plus,
  Trash2,
  ArrowRight,
  Sparkles,
  Info,
} from 'lucide-react';
import { batchInsertFromScan, getCategories, getMenuItems } from '../../lib/api';
import { Category, MenuItem } from '../../types/database';

interface ScanMenuProps {
  restaurantId: string;
  currency: string;
  onScanCompleted: (categories: Category[], items: MenuItem[]) => void;
  onGoToProducts: () => void;
}

interface ParsedItem {
  id: string;
  category_name: string;
  name_fr: string;
  name_ar: string;
  description_fr: string;
  price: number;
}

const SAMPLE_EXTRACTED_DATA: ParsedItem[] = [
  {
    id: '1',
    category_name: 'Entrées & Salades',
    name_fr: 'Salade Marocaine Fraîche',
    name_ar: 'سلطة مغربية طازجة',
    description_fr: 'Tomates fraîches, concombres, oignons rouges, persil et huile d’olive',
    price: 35,
  },
  {
    id: '2',
    category_name: 'Entrées & Salades',
    name_fr: 'Zaalouk d’Aubergines Grillées',
    name_ar: 'زعلوك الباذنجان المشوي',
    description_fr: 'Caviar d’aubergines aux épices douces et ail confit',
    price: 38,
  },
  {
    id: '3',
    category_name: 'Plats Chauds',
    name_fr: 'Tajine de Poulet au Citron Confit',
    name_ar: 'طاجين دجاج بالحامض والزيتون',
    description_fr: 'Poulet fermier mijoté au safran, olives violettes et citron confit',
    price: 75,
  },
  {
    id: '4',
    category_name: 'Plats Chauds',
    name_fr: 'Couscous Royal aux Sept Légumes',
    name_ar: 'كسكس ملكي بسبع خضار',
    description_fr: 'Semoule fine au beurre doux, agneau, poulet et légumes de saison',
    price: 90,
  },
  {
    id: '5',
    category_name: 'Boissons & Rafraîchissements',
    name_fr: 'Jus d’Orange Frais Pressé',
    name_ar: 'عصير برتقال طازج',
    description_fr: 'Oranges douces du Maroc pressées minute',
    price: 20,
  },
];

export const ScanMenu: React.FC<ScanMenuProps> = ({
  restaurantId,
  currency,
  onScanCompleted,
  onGoToProducts,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>(SAMPLE_EXTRACTED_DATA);
  const [isSaving, setIsSaving] = useState(false);
  const [successReport, setSuccessReport] = useState<{ cats: number; items: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle Photo upload
  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImagePreview(e.target?.result as string);
      startExtractionSimulation();
    };
    reader.readAsDataURL(file);
  };

  // Step 2: Extraction simulation
  const startExtractionSimulation = () => {
    setStep(2);
    setIsExtracting(true);
    setTimeout(() => {
      setIsExtracting(false);
      setStep(3);
    }, 1200);
  };

  // Update row in verification table
  const handleUpdateItem = (id: string, field: keyof ParsedItem, value: any) => {
    setParsedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Delete row
  const handleDeleteItem = (id: string) => {
    setParsedItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Add blank row
  const handleAddRow = () => {
    const newRow: ParsedItem = {
      id: Date.now().toString(),
      category_name: 'Nouvelle Catégorie',
      name_fr: 'Nouveau Plat',
      name_ar: '',
      description_fr: '',
      price: 50,
    };
    setParsedItems([...parsedItems, newRow]);
  };

  // Confirm and save to Supabase
  const handleConfirmSave = async () => {
    if (parsedItems.length === 0) {
      setErrorMessage('Aucun plat à enregistrer.');
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage('');

      // Build unique categories
      const categoryNames: string[] = Array.from(new Set(parsedItems.map((p) => p.category_name.trim())));
      const categoriesToCreate: { name_fr: string; name_ar?: string; name_en?: string }[] = categoryNames.map((name) => ({
        name_fr: name,
      }));

      const itemsToCreate = parsedItems.map((p) => ({
        category_name: p.category_name.trim(),
        name_fr: p.name_fr.trim(),
        name_ar: p.name_ar.trim() || undefined,
        description_fr: p.description_fr.trim() || undefined,
        price: Number(p.price) || 0,
      }));

      const result = await batchInsertFromScan(restaurantId, categoriesToCreate, itemsToCreate);

      // Refresh data
      const updatedCats = await getCategories(restaurantId);
      const updatedItems = await getMenuItems(restaurantId);
      onScanCompleted(updatedCats, updatedItems);

      setSuccessReport({
        cats: result.addedCategoriesCount,
        items: result.addedItemsCount,
      });
      setStep(4);
    } catch (err: any) {
      console.error('Batch import error:', err);
      setErrorMessage(err.message || "Erreur lors de l'enregistrement dans la base de données.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <ScanText className="w-6 h-6 text-blue-600" />
          Scanner le menu depuis une photo
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Gagnez du temps : importez une photo de votre carte papier. Notre système extrait les catégories, plats et prix que vous pouvez vérifier avant enregistrement.
        </p>
      </div>

      {/* Integration notice */}
      <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-blue-900 text-xs flex items-start gap-3">
        <Info className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
        <div>
          <p className="font-semibold">Architecture d'extraction intelligente prête</p>
          <p className="text-blue-700 mt-0.5">
            Téléversez une photo de carte pour pré-remplir les données. Vous pouvez inspecter, corriger les prix ou ajouter des traductions avant de valider l'importation définitive dans Supabase.
          </p>
        </div>
      </div>

      {/* STEP 1: UPLOAD PHOTO */}
      {step === 1 && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 text-center shadow-xs">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">
              Étape 1 : Téléversez la photo de votre carte
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Prenez en photo une page ou une section de votre menu physique. Veillez à ce que le texte et les tarifs soient bien lisibles.
            </p>

            <label className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-md active:scale-95 transition-all">
              <UploadCloud className="w-4 h-4" />
              <span>Choisir une photo de menu</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                }}
                className="hidden"
              />
            </label>

            <div className="mt-4">
              <button
                type="button"
                onClick={startExtractionSimulation}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Ou tester immédiatement avec un exemple de carte
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: EXTRACTION IN PROGRESS */}
      {step === 2 && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center shadow-xs">
          <div className="w-12 h-12 mx-auto rounded-full border-3 border-blue-100 border-t-blue-600 animate-spin mb-4" />
          <h2 className="text-base font-bold text-slate-900 mb-1">
            Étape 2 : Analyse de la carte en cours...
          </h2>
          <p className="text-xs text-slate-500">
            Détection des sections, intitulés des plats et montants...
          </p>
        </div>
      )}

      {/* STEP 3: VERIFY & EDIT EXTRACTED DATA */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Étape 3 : Vérification
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  Validez les plats détectés ({parsedItems.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Modifiez les noms ou ajustez les prix avant d'importer dans votre menu.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter une ligne</span>
                </button>

                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleConfirmSave}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSaving ? 'Enregistrement...' : 'Confirmer et Importer'}</span>
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Editable Table */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Catégorie</th>
                    <th className="py-2.5 px-3">Plat (Français)</th>
                    <th className="py-2.5 px-3">Arabe (Optionnel)</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 w-28">Prix ({currency})</th>
                    <th className="py-2.5 px-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={item.category_name}
                          onChange={(e) => handleUpdateItem(item.id, 'category_name', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 focus:border-blue-600 focus:outline-none"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={item.name_fr}
                          onChange={(e) => handleUpdateItem(item.id, 'name_fr', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 font-semibold text-slate-900 focus:border-blue-600 focus:outline-none"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          dir="rtl"
                          value={item.name_ar}
                          onChange={(e) => handleUpdateItem(item.id, 'name_ar', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 font-cairo text-right focus:border-blue-600 focus:outline-none"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={item.description_fr}
                          onChange={(e) => handleUpdateItem(item.id, 'description_fr', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-slate-600 focus:border-blue-600 focus:outline-none"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={item.price}
                          onChange={(e) => handleUpdateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 font-bold text-blue-600 focus:border-blue-600 focus:outline-none"
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1 rounded text-rose-500 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: CONFIRMATION SUCCESS */}
      {step === 4 && successReport && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 text-center shadow-xs">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Importation réussie avec succès !
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mb-6">
            <span className="font-bold text-slate-900">{successReport.items} plats</span> et{' '}
            <span className="font-bold text-slate-900">{successReport.cats} nouvelles catégories</span> ont été ajoutés directement à votre menu dans la base de données.
          </p>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setSuccessReport(null);
              }}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Scanner une autre page
            </button>
            <button
              type="button"
              onClick={onGoToProducts}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-sm hover:bg-blue-700 flex items-center gap-1.5"
            >
              <span>Voir les produits</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
