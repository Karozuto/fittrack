# FitTrack — Suivi d'avancement

## ✅ Ce qui est fait

### Environnement
- Node.js v24, npm 11, Git 2.54 installés
- Windows Terminal + Git Bash configurés
- VS Code configuré

### Projet React
- Vite + React créé dans `Documents/Projets/fittrack`
- Tailwind CSS installé et configuré
- Structure des dossiers : `components/`, `pages/`, `hooks/`, `lib/`, `assets/`, `contexts/`
- Fichiers inutiles supprimés (`App.css`, `react.svg`)
- `react-router-dom` installé

### Supabase
- Projet `fittrack` créé (région West EU Ireland)
- RLS activé, Data API activé
- `@supabase/supabase-js` installé
- Fichier `src/lib/supabase.js` créé
- `.env` configuré avec les clés API
- `.gitignore` mis à jour
- Connexion React ↔ Supabase testée et fonctionnelle ✅

### Base de données — tables créées
- ✅ `profiles` — profil utilisateur, FK vers `auth.users` (cascade)
- ✅ `exercises` — bibliothèque commune d'exercices
- ✅ `workouts` — séances d'entraînement, FK vers `profiles`
- ✅ `workout_sets` — séries par séance, FK vers `workouts` + `exercises`
- ✅ `meals` — repas journaliers, FK vers `profiles`
- ✅ `food_items` — aliments par repas, FK vers `meals`
- ✅ RLS + policies configurées sur toutes les tables
- ✅ Index de performance ajoutés

### Authentification (`src/`)
- ✅ `contexts/AuthContext.jsx` — état global auth (signIn, signUp, signOut, Google OAuth)
- ✅ `pages/AuthPage.jsx` — page login / inscription (tabs, gestion erreurs, design dark)
- ✅ `components/ProtectedRoute.jsx` — redirection vers `/auth` si non connecté
- ✅ `App.jsx` — routeur principal avec `BrowserRouter` + routes protégées

### Dashboard (`src/`)
- ✅ `pages/Dashboard.jsx` — page d'accueil avec données Supabase en temps réel
  - 4 métriques : séances/semaine, séries totales, calories du jour, protéines du jour
  - Liste des 5 dernières séances avec comptage de séries
  - Liste des repas du jour avec calories calculées
  - Boutons "Ajouter une séance" / "Ajouter un repas"
  - États vides gérés
- ✅ `components/Navbar.jsx` — barre de navigation avec logo + email + déconnexion

### Workouts (`src/`)
- ✅ `pages/WorkoutsPage.jsx` — page de suivi des séances d'entraînement
  - Liste des séances avec filtrage par date
  - Création de nouvelles séances avec exercices
  - Suppression de séances
  - Affichage des séries et poids pour chaque exercice

### Nutrition (`src/`)
- ✅ `pages/NutritionPage.jsx` — page de suivi nutritionnel complet
  - Sélecteur de date avec calendrier et indicateurs visuels
  - Résumé quotidien des macros (calories, protéines, glucides, lipides)
- ✅ `components/DateSelector.jsx` — sélecteur de date avec calendrier interactif
- ✅ `components/MealSection.jsx` — affichage des repas groupés par type
- ✅ `components/CreateMealModal.jsx` — modal avec 3 méthodes d'ajout:
  - Recherche: Recherche dans OpenFoodFacts avec bouton
  - Code-barre: Entrée manuelle du code-barre
  - Manuel: Saisie directe des macros avec sélecteur d'unité (g/ml)
- ✅ Intégration OpenFoodFacts France (https://fr.openfoodfacts.org)
- ✅ Calcul automatique des macros selon la quantité
- ✅ Suppression de repas avec auto-nettoyage

---

## ✅ Projet complet

Toutes les fonctionnalités principales ont été implémentées:
- ✅ Authentification (Supabase Auth + Google OAuth)
- ✅ Dashboard avec métriques et données temps réel
- ✅ Page Workouts (CRUD complet)
- ✅ Page Nutrition (suivi complet avec recherche OpenFoodFacts)
- ✅ Base de données bien structurée avec RLS
- ✅ UI/UX cohérente avec design system

---

## Architecture des fichiers

```
src/
  assets/
  components/
    Navbar.jsx
    ProtectedRoute.jsx
  contexts/
    AuthContext.jsx
  hooks/
  lib/
    supabase.js
  pages/
    AuthPage.jsx
    Dashboard.jsx
  App.jsx
  main.jsx
  index.css
.env
.gitignore
```

## Schéma base de données

```
auth.users
    └── profiles (1-1)
            ├── workouts (1-N)
            │       └── workout_sets (1-N) ──→ exercises
            └── meals (1-N)
                    └── food_items (1-N)
```

## Routes

| Route | Accès | Composant |
|---|---|---|
| `/auth` | Public | `AuthPage` |
| `/` | Protégé | `Dashboard` |
| `/workouts` | Protégé | *(à créer)* |
| `/nutrition` | Protégé | *(à créer)* |