# FitTrack

Application web de suivi sportif et nutritionnel, construite avec React et Supabase.

## Fonctionnalités

- **Authentification** — inscription et connexion via Supabase Auth
- **Dashboard** — vue d'ensemble hebdomadaire (séances, séries, calories, protéines)
- **Workouts** — création, consultation et suppression de séances d'entraînement avec exercices et séries
- **Nutrition** — suivi complet des repas avec recherche OpenFoodFacts, code-barre, et saisie manuelle des macros

## Stack technique

| Couche     | Technologie                        |
| ---------- | ---------------------------------- |
| Frontend   | React 19, React Router 7           |
| Build      | Vite 8, Tailwind CSS 4             |
| Backend    | Supabase (PostgreSQL + Auth)       |
| Linting    | ESLint 10                          |

## Démarrage rapide

```bash
# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Build de production
npm run build
```

### Variables d'environnement

Créez un fichier `.env` à la racine avec vos clés Supabase :

```env
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

## Structure du projet

```
src/
├── components/       # Composants réutilisables (Navbar, WorkoutCard, …)
├── contexts/         # Contextes React (AuthContext)
├── lib/              # Client Supabase
└── pages/            # Pages de l'application (Dashboard, WorkoutsPage, AuthPage)
```
