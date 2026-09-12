# Déploiement TouchBizz Menu sur Vercel

Ce projet est conçu pour être déployé en 1 clic sur Vercel en tant que Single Page Application (SPA) React + Vite, connectée directement à votre instance Supabase.

## Prérequis
1. Un compte Supabase (https://supabase.com) avec un projet créé.
2. Un compte Vercel (https://vercel.com).

---

## Étape 1 : Initialiser la base de données Supabase
1. Rendez-vous dans votre projet Supabase -> **SQL Editor**.
2. Ouvrez le fichier `supabase-schema.sql` situé à la racine du projet.
3. Copiez l'intégralité du script SQL et collez-le dans l'éditeur Supabase.
4. Cliquez sur **Run** pour créer :
   - Les tables (`profiles`, `restaurants`, `categories`, `menu_items`)
   - Les index de performance
   - Les règles de sécurité Row Level Security (RLS)
   - Le bucket de stockage `restaurant-assets`

---

## Étape 2 : Variables d'environnement sur Vercel
Lors de l'importation de votre dépôt Git sur Vercel, ajoutez les variables suivantes dans **Project Settings > Environment Variables** :

| Variable | Description | Exemple |
|---|---|---|
| `VITE_SUPABASE_URL` | L'URL de votre API Supabase (Project Settings > API) | `https://xxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | La clé publique "anon" (Project Settings > API) | `eyJhbGciOi...` |
| `VITE_APP_URL` | Le domaine public de votre plateforme (optionnel) | `https://menu.touchbizz.ma` |

> ⚠️ **Sécurité** : N'utilisez JAMAIS la clé `service_role` dans les variables préfixées par `VITE_`.

---

## Étape 3 : Configuration du Build sur Vercel
Vercel détecte automatiquement la configuration Vite :
- **Framework Preset** : Vite
- **Build Command** : `npm run build`
- **Output Directory** : `dist`
- **Install Command** : `npm install`

---

## Étape 4 : Réécriture d'URL (SPA Routing)
Le fichier `vercel.json` à la racine redirige toutes les requêtes (comme `/r/cafe-nakhil` et `/dashboard`) vers `index.html`.

---

## Étape 5 : Domaine personnalisé (Multi-tenant)
Vous pouvez configurer votre domaine de marque dans Vercel :
- `menu.touchbizz.ma`
Tous les restaurants accèdent à leur menu via le chemin stable :
- `https://menu.touchbizz.ma/r/:slug`
