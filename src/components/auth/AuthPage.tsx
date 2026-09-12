import React, { useState } from 'react';
import { LogIn, UserPlus, AlertCircle, ArrowRight, Sparkles, Store } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface AuthPageProps {
  mode: 'login' | 'register';
  onModeSwitch: (mode: 'login' | 'register') => void;
  onAuthenticated: (userId: string, email: string) => void;
  onViewDemoMenu: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  mode,
  onModeSwitch,
  onAuthenticated,
  onViewDemoMenu,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Veuillez renseigner votre email et votre mot de passe.');
      return;
    }

    try {
      setLoading(true);

      if (isSupabaseConfigured) {
        if (mode === 'register') {
          const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              data: {
                full_name: fullName.trim() || 'Propriétaire',
              },
            },
          });
          if (error) throw error;
          if (data.user) {
            onAuthenticated(data.user.id, data.user.email || email);
          }
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });
          if (error) throw error;
          if (data.user) {
            onAuthenticated(data.user.id, data.user.email || email);
          }
        }
      } else {
        // Fallback demo authentication
        setTimeout(() => {
          onAuthenticated('demo-owner-123', email || 'demo@touchbizz.ma');
        }, 300);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setErrorMessage(err.message || "Erreur d'authentification. Veuillez vérifier vos identifiants.");
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Login
  const handleDemoLogin = () => {
    onAuthenticated('demo-owner-123', 'gerant@cafenakhil.ma');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        {/* Brand logo */}
        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-lg flex items-center justify-center mx-auto shadow-md mb-4">
          TB
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          TouchBizz Menu
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          {mode === 'login'
            ? 'Connectez-vous pour gérer votre établissement'
            : 'Créez votre compte restaurateur en quelques secondes'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-lg border border-slate-200/80 rounded-3xl">
          {errorMessage && (
            <div className="mb-5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nom complet ou Établissement
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ex: Youssef El Amrani"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Adresse email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@monrestaurant.ma"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-600 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-sm active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              <span>
                {loading
                  ? 'Connexion en cours...'
                  : mode === 'login'
                  ? 'Se connecter'
                  : 'Créer mon compte'}
              </span>
            </button>
          </form>

          {/* Quick Demo button */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 flex items-center justify-center gap-2 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Connexion instantanée (Compte Démo Café Nakhil)</span>
            </button>
          </div>

          {/* Switch Mode */}
          <div className="mt-4 text-center">
            {mode === 'login' ? (
              <p className="text-xs text-slate-500">
                Pas encore de compte ?{' '}
                <button
                  type="button"
                  onClick={() => onModeSwitch('register')}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Créer un compte restaurateur
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                Vous avez déjà un compte ?{' '}
                <button
                  type="button"
                  onClick={() => onModeSwitch('login')}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Se connecter
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Public menu quick view link */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onViewDemoMenu}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1.5 mx-auto font-medium"
          >
            <Store className="w-3.5 h-3.5 text-slate-400" />
            <span>Consulter le menu client public (/r/cafe-nakhil)</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
