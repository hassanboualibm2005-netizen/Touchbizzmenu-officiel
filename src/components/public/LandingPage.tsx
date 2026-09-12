import React from 'react';
import {
  QrCode,
  Smartphone,
  Globe2,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  UtensilsCrossed,
  ChefHat,
  Layers,
  ChevronRight,
  Eye,
} from 'lucide-react';

interface LandingPageProps {
  onNavigateToDemo: (slug?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToDemo,
}) => {
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-slate-900 font-sans selection:bg-[#FF6B00] selection:text-white">
      {/* ----------------------------------------------------------------- */}
      {/* NAVBAR                                                            */}
      {/* ----------------------------------------------------------------- */}
      <nav className="sticky top-0 z-40 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-stone-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF6B00] text-white flex items-center justify-center font-black text-lg shadow-md shadow-orange-500/20">
              TB
            </div>
            <div>
              <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 block leading-tight">
                TouchBizz <span className="text-[#FF6B00]">Menu</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase">
                Carte Digitale NFC & QR
              </span>
            </div>
          </div>

          {/* Nav Links & Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={() => onNavigateToDemo('cafe-nakhil')}
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold bg-[#FF6B00] hover:bg-orange-600 text-white shadow-sm hover:shadow transition-all cursor-pointer active:scale-95"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Voir la démo client</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ----------------------------------------------------------------- */}
      {/* HERO SECTION                                                      */}
      {/* ----------------------------------------------------------------- */}
      <section className="pt-10 pb-16 sm:pt-16 sm:pb-24 px-4 sm:px-6 max-w-6xl mx-auto text-center relative">
        {/* Subtle pill badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200/80 text-[#FF6B00] text-xs font-bold mb-6 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Solution Sans Contact pour Restaurants, Cafés & Lounges</span>
        </div>

        {/* Hero title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
          La carte digitale interactive{' '}
          <span className="text-[#FF6B00]">qui sublime vos créations</span>{' '}
          et enchante vos clients.
        </h1>

        {/* Hero description */}
        <p className="mt-5 text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Fini les menus papier abîmés ou coûteux à réimprimer. Offrez à vos clients
          une consultation fluide sur smartphone via QR Code et pastilles NFC,
          sans aucune application à installer.
        </p>

        {/* Action Button */}
        <div className="mt-8 flex items-center justify-center max-w-md mx-auto">
          <button
            type="button"
            onClick={() => onNavigateToDemo('cafe-nakhil')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#FF6B00] hover:bg-orange-600 text-white font-bold text-sm sm:text-base shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
          >
            <Smartphone className="w-4 h-4" />
            <span>Tester la démo client</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Highlights list */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-semibold text-slate-600">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Zéro téléchargement d&apos;application</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Français · العربية · English</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Mise à jour en temps réel</span>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* INTERACTIVE DEMO PHONE PREVIEW MOCKUP                            */}
        {/* ----------------------------------------------------------------- */}
        <div className="mt-14 max-w-2xl mx-auto bg-white rounded-3xl p-3 sm:p-5 shadow-2xl border border-stone-200/90 relative group">
          {/* Simulated Mobile Device Frame */}
          <div className="rounded-2xl overflow-hidden border border-stone-200 bg-[#FAF7F2] text-left">
            {/* Mockup Header */}
            <div className="relative h-44 sm:h-52 bg-stone-900 flex flex-col justify-between p-4">
              <img
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80"
                alt="Café Nakhil"
                className="absolute inset-0 w-full h-full object-cover brightness-75"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/80" />

              {/* Top Capsule */}
              <div className="relative z-10 flex justify-end">
                <div className="px-3 py-1 rounded-xl bg-black/50 backdrop-blur-md text-white text-[11px] font-semibold border border-white/20 flex items-center gap-2">
                  <span>Français ▾</span>
                </div>
              </div>

              {/* Restaurant Details */}
              <div className="relative z-10 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#FF6B00] text-white flex items-center justify-center font-black text-xl mx-auto shadow-md border-2 border-white/30">
                  CN
                </div>
                <h3 className="text-white font-black text-lg mt-2 drop-shadow-sm">
                  Café Nakhil
                </h3>
                <p className="text-white/80 text-xs font-semibold">
                  CASABLANCA · Restaurant
                </p>
              </div>
            </div>

            {/* Mockup Sticky Category Pills */}
            <div className="bg-[#FAF7F2] border-b border-stone-200/80 px-4 py-2.5 flex items-center gap-2 overflow-x-hidden">
              <span className="px-4 py-1.5 rounded-full bg-[#FF6B00] text-white text-xs font-bold shrink-0 shadow-xs">
                Entrées
              </span>
              <span className="px-4 py-1.5 rounded-full bg-white text-slate-700 text-xs font-semibold border border-sky-300/80 shrink-0">
                Plats Chauds
              </span>
              <span className="px-4 py-1.5 rounded-full bg-white text-slate-700 text-xs font-semibold border border-sky-300/80 shrink-0">
                Desserts
              </span>
            </div>

            {/* Mockup Product Grid */}
            <div className="p-4 grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl overflow-hidden border border-stone-200/70 p-2 shadow-2xs">
                <div className="aspect-4/3 rounded-xl overflow-hidden bg-stone-100 mb-2">
                  <img
                    src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop&q=80"
                    alt="Salade"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-xs font-bold text-[#D35400] truncate">
                  Salade Fraîcheur
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-xs font-black text-slate-900">45,00 DH</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl overflow-hidden border border-stone-200/70 p-2 shadow-2xs">
                <div className="aspect-4/3 rounded-xl overflow-hidden bg-stone-100 mb-2">
                  <img
                    src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&auto=format&fit=crop&q=80"
                    alt="Grillade"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-xs font-bold text-[#D35400] truncate">
                  Brochettes Mixtes
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-xs font-black text-slate-900">85,00 DH</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Overlay Button */}
          <div className="mt-4 flex items-center justify-between px-2 text-xs">
            <span className="text-slate-500 font-medium">
              Aperçu en temps réel du menu client
            </span>
            <button
              type="button"
              onClick={() => onNavigateToDemo('cafe-nakhil')}
              className="font-bold text-[#FF6B00] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Tester en plein écran</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* 3 CORE FEATURES PILLARS                                          */}
      {/* ----------------------------------------------------------------- */}
      <section className="py-16 bg-white border-y border-stone-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Tout ce dont votre établissement a besoin pour réussir sa transition numérique
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Conçu spécifiquement pour le secteur de la restauration : rapide, robuste et sans friction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1 */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#FAF7F2] border border-stone-200/80 hover:border-orange-300 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#FF6B00] flex items-center justify-center mb-5 shadow-xs">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">
                NFC & QR Code Sans Contact
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Posez un QR code ou un galet NFC sur chaque table. Le client approche son smartphone et accède instantanément à votre menu en moins de 2 secondes, sans rien télécharger.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#FAF7F2] border border-stone-200/80 hover:border-orange-300 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-5 shadow-xs">
                <Globe2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">
                Multilingue Natif (FR / AR / EN)
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Accueillez les résidents et les touristes sans barrière de langue. Disposition bilingue automatique avec gestion intégrée du sens de lecture Arabe (RTL).
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#FAF7F2] border border-stone-200/80 hover:border-orange-300 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5 shadow-xs">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">
                Mises à Jour Instantanées
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Un plat en rupture ? Un nouveau tarif ou une suggestion du jour ? Modifiez vos éléments en 1 clic : vos clients voient le changement immédiatement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* HOW IT WORKS (3 STEPS)                                           */}
      {/* ----------------------------------------------------------------- */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-black tracking-wider uppercase text-[#FF6B00]">
            Simplicité absolue
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Opérationnel en 3 étapes simples
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center justify-center mb-4">
              1
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-1">
              Configurez votre établissement
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ajoutez votre logo, vos catégories et vos plats accompagnés de belles photos et de descriptions attrayantes.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-[#FF6B00] text-white font-black text-sm flex items-center justify-center mb-4">
              2
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-1">
              Générez vos supports de table
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Téléchargez et imprimez vos chevalets QR Code personnalisés ou encodez vos puces NFC en quelques secondes.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center mb-4">
              3
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-1">
              Vos clients consultent en toute liberté
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Vos convives scannent à table, naviguent par catégories avec la barre sticky ScrollSpy, et font leur choix en toute autonomie.
            </p>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* DEMO CTA CALLOUT                                                 */}
      {/* ----------------------------------------------------------------- */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto rounded-3xl bg-slate-950 text-white p-8 sm:p-12 relative overflow-hidden shadow-2xl">
          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <span className="px-3 py-1 rounded-full bg-orange-500/20 text-[#FF6B00] border border-orange-500/30 text-xs font-bold inline-block mb-4">
              Expérience Digitale Prête à l&apos;Emploi
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Découvrez la carte digitale en conditions réelles
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
              Consultez notre démonstration publique interactive pour visualiser le menu tel que vos clients le verront sur leur smartphone.
            </p>

            <div className="mt-8 flex items-center justify-center">
              <button
                type="button"
                onClick={() => onNavigateToDemo('cafe-nakhil')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#FF6B00] hover:bg-orange-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Explorer la carte Café Nakhil</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* FOOTER                                                            */}
      {/* ----------------------------------------------------------------- */}
      <footer className="border-t border-stone-200/80 py-10 px-4 sm:px-6 bg-[#FAF7F2]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">TouchBizz Menu</span>
            <span>— Solution Digitale Sans Contact pour Restaurateurs</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => onNavigateToDemo('cafe-nakhil')}
              className="hover:text-slate-900 cursor-pointer font-medium"
            >
              Démo Publique
            </button>
            <span>•</span>
            <span className="text-slate-400">Tous droits réservés</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
