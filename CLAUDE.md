# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start dev server (Vite)
npm run build     # production build
npm run preview   # preview production build locally
npm run lint      # ESLint (JS/JSX)
```

There is no test suite configured.

## Environment variables

Create a `.env.local` file at the root:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

## Architecture

**Stack**: React 19, Vite 8, React Router DOM 7, Tailwind CSS 4 (imported but barely used — see Styling), Supabase (auth + Postgres).

### Auth flow

`AuthContext` (`src/contexts/AuthContext.jsx`) wraps the entire app and exposes `{ user, loading, signIn, signUp, signInWithGoogle, signOut }`. It syncs with Supabase's `onAuthStateChange` listener on mount.

`ProtectedRoute` (`src/components/ProtectedRoute.jsx`) consumes `useAuth()` and redirects to `/auth` when `user` is null. It renders a loading screen while `loading` is true.

### Routing

Routes are declared in `src/App.jsx`. `/`, `/workouts`, and `/nutrition` are wrapped in `<ProtectedRoute>` with `<Navbar>` inlined before the page component.

### Data access

All Supabase queries run directly inside page/component files via the singleton client exported from `src/lib/supabase.js`. There is no service layer or custom hook abstraction — components call `supabase.from(...)` inline.

### Database schema (inferred)

| Table | Key columns |
|---|---|
| `workouts` | `id`, `user_id`, `name`, `notes`, `performed_at`, `duration_min` |
| `workout_sets` | `id`, `workout_id`, `exercise_id`, `set_number`, `reps`, `weight_kg` |
| `exercises` | `id`, `name`, `exercise_type`, `muscle_groups` (text array) |
| `meals` | `id`, `user_id`, `name`, `eaten_at` |
| `food_items` | `calories`, `protein_g` (joined via `meals` → `food_items(*)`) |

Row-level security is expected on `workouts` and `meals` (queries always filter by `user_id`).

### Styling

Components use **inline JS style objects** defined as a `const s = { ... }` block at the bottom of each file. Tailwind utility classes are not used in practice.

Design tokens: background `#0D0F0E`, card surfaces `#111310` / `#161917`, accent `#A8FF3E`, primary text `#F0F0EE`, muted `#6B7068`.

Typography: **Barlow Condensed** (headings, badges, buttons) and **DM Sans** (body, inputs) — loaded via a `<link>` tag injected inside page components directly.

Muscle groups in `WorkoutCard` have a colour map (`MUSCLE_COLOR_MAP`) used to tint badges and dot indicators per muscle group.

## Nutrition Feature

Fully implemented daily meal tracking with OpenFoodFacts integration, multiple input methods, and ergonomic UI.

### Components

- **NutritionPage** (`src/pages/NutritionPage.jsx`): Main page with date selector, daily summary card (calories/macros), and meal sections grouped by type
- **DateSelector** (`src/components/DateSelector.jsx`): Calendar with year dropdown, 12-month grid, day scroller; days with meals highlighted (green border, darker bg)
- **MealSection** (`src/components/MealSection.jsx`): Lists meals grouped by type (Petit-déjeuner, Déjeuner, Encas, Dîner) with per-item and section totals; delete functionality
- **CreateMealModal** (`src/components/CreateMealModal.jsx`): Three-tab modal for adding meals: Recherche (search), Code-barre (barcode), Manuel (manual entry)

### Input Methods

**Recherche (Search)**
- Text input + button "Rechercher"
- OpenFoodFacts France API search: `https://fr.openfoodfacts.org/cgi/search.pl?search_terms={query}&json=1`
- Results show image, name, brands
- Click to select

**Code-barre (Barcode)**
- Manual barcode entry + search button
- OpenFoodFacts API: `https://fr.openfoodfacts.org/api/v0/product/{barcode}.json`
- Auto-selects product

**Manuel (Manual Entry)**
- Name field + compact 2x2 macro grid (Calories, Protéines, Glucides, Lipides)
- Quantity field with unit selector (g or ml)
- Macros entered are "per 100g" format

### Key Features

- **Date Selection**: Year/month/day selectors with visual indicators for days with meals
- **Quantity Selector**: Both g and ml units (g/ml) for flexibility with solids/liquids
- **Real-time Macros**: Display updated as quantity changes
- **Meal Management**: Delete food items or entire meals
- **Auto-delete**: Empty meals auto-delete when last item removed
- **Smooth Loading**: `displayedMeals` state keeps old content visible while new date loads
- **Compact UI**: Product selection card shows image (130x130), name, button, 2x2 macro preview

### Critical Implementation Notes

- **Calories field**: `nutriments['energy-kcal_100g']` (hyphen, not underscore!) — must use bracket notation
- **Macro Calculation**: `(nutrient_per_100g) × (quantity_g / 100)` — works for both g and ml (1ml ≈ 1g)
- **Tab Focus**: Removed `borderBottom: 'none'` default (was allowing browser focus styling); now only add border on active state
- **Delete Logic**: Remove food_item → check if meal has items → delete meal if empty
- **State Management**: Separate `displayedMeals` from loading state to prevent jitter on date change

### Database Schema

```
meals: id, user_id, type, name, eaten_at
food_items: id, meal_id, name, product_name, barcode, calories, protein_g, carbohydrates_g, fat_g
```

Row-level security filters by `user_id`.
