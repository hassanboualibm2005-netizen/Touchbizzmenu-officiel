import React, { useState } from 'react';
import {
  LogIn,
  UserPlus,
  Lock,
  Mail,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  Store,
  ShieldCheck,
  CheckCircle2,
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
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [canQuickRegister, setCanQuickRegister] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setCanQuickRegister(false);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password.trim()) {
      setErrorMessage('Veuillez renseigner votre email et mot de passe administrateur.');
      return;
    }

    try {
      setLoading(true);

      if (isSupabaseConfigured) {
        if (mode === 'register') {
          // SIGN UP FLOW
          const { data, error } = await supabase.auth.signUp({
            email: trimmedEmail,
            password,
            options: {
              data: {
                role: 'owner',
              },
            },
          });

          if (error) {
            setErrorMessage(error.message);
            return;
          }

          if (data?.session?.user || data?.user) {
            const userObj = data.session?.user || data.user;
            // If session is active (no email confirmation needed)
            if (data.session) {
              onAuthenticated(userObj.id, userObj.email || trimmedEmail);
              return;
            } else {
              setSuccessMessage(
                'Compte créé avec succès ! Si la confirmation par email est activée sur votre projet Supabase, vérifiez votre boîte de réception. Vous pouvez aussi vous connecter ci-dessous.'
              );
              setMode('login');
              return;
            }
          }
        } else {
          // SIGN IN FLOW
          const { data, error } = await supabase.auth.signInWithPassword({
            email: trimmedEmail,
            password,
          });

          if (error) {
            // Check for invalid credentials
            if (
              error.message?.toLowerCase().includes('invalid login credentials') ||
              error.message?.toLowerCase().includes('invalid credentials')
            ) {
              setErrorMessage(
                "Identifiants non reconnus. Si vous n'avez pas encore créé de compte sur cette base de données, vous pouvez le créer dès maintenant."
              );
              setCanQuickRegister(true);
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
      }

      // Fallback local authentication if Supabase is offline or demo
      setTimeout(() => {
        onAuthenticated('demo-owner-123', trimmedEmail || 'gerant@cafenakhil.ma');
      }, 350);
    } catch (err: any) {
      // Soft handling without crashing console logger
      const msg = err?.message || 'Erreur de connexion.';
      if (msg.toLowerCase().includes('invalid login credentials')) {
        setErrorMessage(
          "Identifiants invalides. Ce compte n'existe peut-être pas encore sur votre projet Supabase."
        );
        setCanQuickRegister(true);
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-click account creation with the typed credentials
  const handleRegisterFromPrompt = () => {
    setMode('register');
    setErrorMessage('');
    setCanQuickRegister(false);
  };

  // Quick 1-click demo login
  const handleQuickDemo = () => {
    setEmail('gerant@cafenakhil.ma');
    setPassword('demo123456');
    onAuthenticated('demo-owner-123', 'gerant@cafenakhil.ma');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#FF6B00] selection:text-white">
      {/* Top back link */}
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
          {mode === 'login'
            ? 'Connectez-vous pour piloter vos cartes, catégories et QR codes'
            : 'Créez votre compte administrateur sur votre base Supabase'}
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl border border-stone-200/90 rounded-3xl">
          {/* Mode Switcher Tabs (Connexion / Inscription) */}
          <div className="flex bg-stone-100 p-1 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
                setCanQuickRegister(false);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Se connecter
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage('');
                setCanQuickRegister(false);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Créer un compte
            </button>
          </div>

          {successMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span className="leading-snug">{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
              {canQuickRegister && (
                <div className="mt-3 pl-6.5">
                  <button
                    type="button"
                    onClick={handleRegisterFromPrompt}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Créer ce compte maintenant</span>
                  </button>
                </div>
              )}
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
              {mode === 'register' && (
                <p className="mt-1 text-[11px] text-slate-400">
                  Minimum 6 caractères pour sécuriser votre accès.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#FF6B00] hover:bg-orange-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-orange-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {mode === 'register' ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>{loading ? 'Création en cours...' : 'Créer mon compte'}</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>{loading ? 'Connexion en cours...' : 'Se connecter'}</span>
                </>
              )}
            </button>
          </form>

          {/* 1-Click Quick Demo Login Button */}
          <div className="mt-6 pt-5 border-t border-stone-100 text-center">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="w-full py-2.5 px-3 rounded-xl bg-orange-50 hover:bg-orange-100/70 border border-orange-200/80 text-[#FF6B00] text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Connexion Démo Rapide (Gérant Café Nakhil)</span>
            </button>
            <p className="mt-2 text-[11px] text-slate-400">
              Accès immédiat sans mot de passe pour tester le tableau de bord
            </p>
          </div>
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
