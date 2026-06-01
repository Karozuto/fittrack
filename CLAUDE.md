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

**Stack**: React 19, Vite 8, React Router DOM 7, Tailwind CSS 4 (imported but barely used — see Styling), Recharts 3 (charts on the Analytics page), Supabase (auth + Postgres).

### Auth flow

`AuthContext` (`src/contexts/AuthContext.jsx`) wraps the entire app and exposes `{ user, loading, signIn, signUp, signInWithGoogle, signOut }`. It syncs with Supabase's `onAuthStateChange` listener on mount.

`ProtectedRoute` (`src/components/ProtectedRoute.jsx`) consumes `useAuth()` and redirects to `/auth` when `user` is null. It renders a loading screen while `loading` is true.

### Routing

Routes are declared in `src/App.jsx`. `/`, `/workouts`, `/nutrition`, `/analytics`, and `/profile` are wrapped in `<ProtectedRoute>` with `<Navbar>` inlined before the page component. The navbar links live in `src/components/Navbar.jsx` (the Analytics link is labelled "Analyse").

The navbar is **sticky** (`position:sticky; top:0; zIndex:100`). It detects the active tab with `useLocation()` and renders it as a green pill (`#A8FF3E` text on `rgba(168,255,62,0.1)`); thin vertical separators sit between tabs; the `FITTRACK` logo is clickable and navigates to `/`.

On the right is a **single hamburger↔X toggle button** (`position:fixed; right:2rem; zIndex:202`, above the drawer) that opens/closes a **right-side drawer** (`Navbar.jsx`). The drawer (a full-viewport `drawerLayer` with `overflow:hidden` clips the off-screen panel so no horizontal scrollbar appears — don't use `overflow-x:hidden` on `body`, it breaks the sticky navbar). The drawer shows the account email, **Éditer le profil** (→ `/profile`), **Sécurité** (placeholder "Bientôt"), and **Se déconnecter**. `/profile` is reached via this drawer (it's not a main tab).

### Data access

All Supabase queries run directly inside page/component files via the singleton client exported from `src/lib/supabase.js`. There is no service layer or custom hook abstraction — components call `supabase.from(...)` inline.

### Database schema

| Table | Key columns |
|---|---|
| `profiles` | `id` (→ `auth.users`), `username`, `sex`, `age`, `weight`, `height`, `goal`, `target_calories`, `target_protein_g`, `target_carbs_g`, `target_fat_g`, `created_at` |
| `workouts` | `id`, `user_id`, `name`, `notes`, `performed_at`, `duration_min`, `created_at` |
| `workout_sets` | `id`, `workout_id`, `exercise_id`, `set_number`, `reps`, `weight_kg`, `created_at` |
| `exercises` | `id`, `name`, `description`, `exercise_type`, `muscle_groups` (text array), `created_at` |
| `meals` | `id`, `user_id`, `name`, `type` (NOT NULL, default `'Déjeuner'`), `eaten_at`, `created_at` |
| `food_items` | `id`, `meal_id`, `name`, `product_name`, `barcode`, `quantity_g`, `quantity_unit`, `calories`, `protein_g`, `carbohydrates_g`, `fat_g`, `created_at` |
| `saved_foods` | `id`, `user_id`, `name`, `barcode`, `image_url`, `calories`, `protein_g`, `carbohydrates_g`, `fat_g` (**per-base: per 100 g/ml, or per unit**), `quantity_unit`, `last_used_at`, `created_at` |

All macro columns (`calories`, `protein_g`, `carbohydrates_g`, `fat_g`) are `real`. RLS is enabled on every `public` table; user-scoped tables (`workouts`, `meals`, `profiles`, `saved_foods`) filter by `user_id`/`id`.

> The schema was cleaned up: dropped dead/unused columns `food_items.carbs_g` (duplicate of `carbohydrates_g`), `workout_sets.duration_s`, `workout_sets.notes`, `meals.notes`, `exercises.primary_muscles`, `exercises.secondary_muscles`. The app only ever used `muscle_groups`. SECURITY DEFINER functions (`handle_new_user`, `rls_auto_enable`, `replace_in_array`) were hardened: fixed `search_path` and revoked `EXECUTE` from `anon`/`authenticated`/`public` (triggers still run). The only remaining security advisor is *Leaked Password Protection*, which is a **Pro-plan-only** Auth feature (HaveIBeenPwned). The project is on the Free plan, so it can't be enabled — treat this advisor as an expected false positive, not an action item.

### Styling

Components use **inline JS style objects** defined as a `const s = { ... }` block at the bottom of each file. Tailwind utility classes are not used in practice.

Design tokens: background `#0D0F0E`, card surfaces `#111310` / `#161917`, accent `#A8FF3E`, primary text `#F0F0EE`, muted `#6B7068`.

Typography: **Barlow Condensed** (headings, badges, buttons) and **DM Sans** (body, inputs) — loaded via a `<link>` tag injected inside page components directly.

Muscle groups in `WorkoutCard` have a colour map (`MUSCLE_COLOR_MAP`) used to tint badges and dot indicators per muscle group.

All numeric inputs use the reusable **`NumberStepper`** (`src/components/NumberStepper.jsx`): an input with discreet +/− buttons stacked on the right (+ top, − bottom). Native spinner arrows are hidden by a scoped `.no-spin` class in `src/index.css` (scoped so other inputs keep their arrows). Quantity fields default to empty (no prefilled `100`).

## Nutrition Feature

Fully implemented daily meal tracking with OpenFoodFacts integration, multiple input methods, and ergonomic UI.

### Components

- **NutritionPage** (`src/pages/NutritionPage.jsx`): Main page with date selector, daily summary card (calories/macros), and meal sections grouped by type
- **DateSelector** (`src/components/DateSelector.jsx`): Calendar with year dropdown, 12-month grid, day scroller; days with meals highlighted (green border, darker bg)
- **MealSection** (`src/components/MealSection.jsx`): Lists meals grouped by type (Petit-déjeuner, Déjeuner, Encas, Dîner) with per-item and section totals; delete functionality. **Collapsible** (collapsed by default) like `WorkoutCard` — the food list collapses while the per-type macro recap stays always visible below it.
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

### Saved foods (reusable food library)

`saved_foods` stores reusable foods per user (**macros per base**: per 100 g/ml, or **per unit** when `quantity_unit = 'unité'`). Every add (search/barcode **and** manual) best-effort upserts into it via `saveToLibrary()` (dedup by `barcode` if present, else case-insensitive `name`; refreshes `last_used_at`). A 4th **"📚 Mes aliments"** tab in `CreateMealModal` lists them (filter input, compact rows: thumbnail, name, a "Pour 100 g / Par unité" chip, colored macro chips, trash button). Clicking one builds a synthetic OpenFoodFacts-shaped product (`nutriments['energy-kcal_100g']` etc.) and reuses the existing selected-product → quantity → add flow, so no code is duplicated.

**Unit semantics**: `quantity_unit` can be `g`, `ml`, or `unité`. For `unité`, macros are **per unit** and scaling is `qty × per-unit` (factor `qty/1`); for `g`/`ml` it's `qty/100`. This applies in both `calculateMacros()` (selected product) and `saveManual()`.

### Units formatting convention

Macros always render with a **space** between number and unit (`12.3 g`). **Calories** always show their unit too (`120 kcal`), including in every recap (Dashboard "Objectifs", NutritionPage summary, per-type `MealSection` totals).

## Profile & Goals Feature

Profile/settings page at `/profile` (`src/pages/ProfilePage.jsx`). Reached **only** via the navbar hamburger drawer → "Éditer le profil" — no main tab.

- **Identity card**: `username` (text), `sex` (Homme/Femme segmented), `age`/`weight`/`height` (`NumberStepper`), `goal` (Perte/Maintien/Prise segmented). Segmented buttons use **longhand borders** (`borderWidth`/`borderStyle`/`borderColor`) + `outline:none` to avoid the shorthand↔longhand stray-border bug.
- **BMI card**: derived BMI (weight / (height/100)²) shown large with a colored category badge, a gradient gauge (`#3EE0FF`/`#A8FF3E`/`#FFD93E`/`#FF5757` zones at 14%/40%/60%) with a position marker, the four category labels (`BMI_ZONES`) absolutely positioned at their **zone centers** (7/27/50/80 %) each in its zone color + bold, and the **healthy weight range** for the height.
- **Hydration card**: `~35 ml/kg/day` → litres/day (shown when weight is set).
- **Nutrition targets card**: 4 editable targets (`target_calories`, `target_protein_g`, `target_carbs_g`, `target_fat_g`). A **"Calculer auto"** button (⚡, with a `calcPop` key-remount pop animation) derives them from BMR (Mifflin-St Jeor) × activity factor × goal factor (`perte` 0.85 / `maintien` 1 / `prise` 1.1); protein = 2 g/kg (2.2 for `perte`), fat = 25% of kcal, carbs = remainder. The activity level selector is **transient** (not persisted — only feeds the calc).
- Save via `supabase.from('profiles').upsert(payload)` (the row already exists from the `handle_new_user` trigger; RLS allows id = auth.uid()).

The targets feed two places:
- **NutritionPage** summary card: each macro shows `consumed / target` with a thin progress bar (macro color, turns red `#FF5757` when over target). Falls back to plain totals when no target is set. Targets fetched inline in a `useEffect` keyed on `user`.
- **Dashboard**: greets by `username` (fallback to email prefix) and has a prominent **"Objectifs du jour"** card (consumed-today vs target progress bars for calories + 3 macros; CTA to `/profile` when no target set). "Dernières séances" is capped at 3 with a `›` button that deep-links to `/workouts` (via `navigate(..., { state: { focusId } })`; the page scrolls to, highlights, and **auto-expands** that card — `WorkoutCard` takes a `defaultExpanded` prop driven by `workout.id === focusId`). "Derniers repas" shows the 3 most recent meals (any date, `eaten_at` desc).

## Workouts — Duplicate to another date

`WorkoutCard` has a copy button (`onDuplicate` prop) that opens **`DuplicateWorkoutModal`** (a date picker). On confirm it re-creates the workout at the chosen date: re-queries the source `workouts` row (the list query doesn't load `duration_min`/`set_number`) for `name`/`notes`/`duration_min`, inserts a new `workouts` row, then copies every `workout_sets` row (`exercise_id`, `set_number`, `reps`, `weight_kg`) to the new `workout_id`. Uses the same insert paths as creation (covered by existing RLS).

## Analytics Feature

Progression/analytics page at `/analytics` (`src/pages/AnalyticsPage.jsx`) built with **Recharts**. Two tabs:

- **Workouts**: *Évolution par exercice* (dual-axis LineChart, weight + reps per session, exercise chosen via custom dropdown), *Séances par semaine* (LineChart by ISO week), *Distribution par groupe musculaire* (PieChart of set counts, percentage shown on hover only).
- **Nutrition**: *Tendances nutritionnelles* (AreaChart, calories + protein, 28 days), *Répartition des macros* (PieChart, 28 days), *Calories par type de repas* (BarChart, one colored bar per meal type).

Data is fetched inline via `supabase` (filtered by `user.id`) in `fetchAll()`, run from a `useEffect` keyed on `user`.

### Custom dropdowns

Native `<select>` can't be styled, so `ExerciseDropdown` (Analytics) and `YearDropdown` (`DateSelector`) are custom button+floating-panel widgets with click-outside handling. They cap visible items (~5) with `maxHeight` + `overflowY: auto`, and hide the scrollbar (`scrollbarWidth: 'none'` + injected `::-webkit-scrollbar{display:none}`).

### Gotcha — React style shorthand vs longhand

Do **not** mix the CSS shorthand `border: '1px solid transparent'` in one style object with the longhand `borderColor` in another (e.g. an active-state object). When React removes the longhand key it resets `border-color` to `currentColor` (the text color) without re-emitting the unchanged shorthand, so a stray border appears — and only *after* the element has had the longhand set once. This caused a grey border on the Analytics tabs that looked like a focus ring but wasn't. Fix: use consistent longhands (`borderWidth`/`borderStyle`/`borderColor`) across all state objects.

### Lint conventions

`npm run lint` is kept at **0 errors / 0 warnings**. For fetch-on-mount effects, declare the `useEffect` *after* the fetch functions (avoids `react-hooks/immutability` "accessed before declared") and suppress the expected `react-hooks/set-state-in-effect` and `react-hooks/exhaustive-deps` with line-targeted disables. Prefer deriving values during render over syncing them with an effect.
