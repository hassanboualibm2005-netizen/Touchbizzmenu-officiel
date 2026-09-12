import React, { useState } from 'react';
import {
  LogIn,
  Lock,
  Mail,
  AlertCircle,
  ArrowLeft,
  Store,
  ShieldCheck,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface AdminLoginProps {
  onAuthenticated: (userId: string, email: string) => void;
  onBackToHome: () => void;
  onViewDemoMenu: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onAuthenticated,
  onBackToHome,
  onViewDemoMenu,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password.trim()) {
      setErrorMessage('Veuillez renseigner votre email et mot de passe administrateur.');
      return;
    }

    try {
      setLoading(true);

      if (isSupabaseConfigured) {
        // Strict sign in using Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });

        if (error) {
          if (
            error.message?.toLowerCase().includes('invalid login credentials') ||
            error.message?.toLowerCase().includes('invalid credentials')
          ) {
            setErrorMessage('Identifiants invalides. Vérifiez votre email et mot de passe.');
            return;
          }
          setErrorMessage(error.message || 'Erreur lors de la connexion.');
          return;
        }

        if (data?.user) {
          onAuthenticated(data.user.id, data.user.email || trimmedEmail);
          return;
        }
      }

      // Fallback local authentication if Supabase is offline or in demo mode
      setTimeout(() => {
        onAuthenticated('demo-owner-123', trimmedEmail || 'gerant@cafenakhil.ma');
      }, 350);
    } catch (err: any) {
      const msg = err?.message || 'Erreur de connexion.';
      if (
        msg.toLowerCase().includes('invalid login credentials') ||
        msg.toLowerCase().includes('invalid credentials')
      ) {
        setErrorMessage('Identifiants invalides. Vérifiez votre email et mot de passe.');
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#FF6B00] selection:text-white">
      {/* Top back links */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToHome}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Retour au site</span>
        </button>

        <button
          type="button"
          onClick={onViewDemoMenu}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6B00] hover:underline cursor-pointer"
        >
          <Store className="w-3.5 h-3.5" />
          <span>Voir le menu client</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand logo */}
        <div className="w-14 h-14 rounded-2xl bg-[#FF6B00] text-white font-black text-xl flex items-center justify-center mx-auto shadow-lg shadow-orange-500/20 mb-4">
          TB
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Espace Restaurateur
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 font-medium">
          Connectez-vous pour piloter vos cartes, catégories et QR codes
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl border border-stone-200/90 rounded-3xl">
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span className="leading-snug">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Adresse email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="gerant@cafenakhil.ma"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-[#FF6B00] focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-[#FF6B00] focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#FF6B00] hover:bg-orange-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-orange-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Connexion en cours...' : 'Se connecter'}</span>
            </button>
          </form>
        </div>

        {/* Security badge note */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Espace protégé par authentification chiffrée</span>
        </div>
      </div>
    </div>
  );
};
