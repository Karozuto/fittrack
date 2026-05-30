# FitTrack — Roadmap

État actuel : Auth (Supabase + Google), Dashboard, Séances, Nutrition (OpenFoodFacts),
Analyse (Recharts). Base de données nettoyée, lint à 0, build OK.

Légende effort : 🟢 faible · 🟡 moyen · 🔴 élevé

---

## 1. Profil & Objectifs 🟡 — ✅ _livré_

> Page `/profile` (accès via l'email de la navbar) : édition identité + objectifs nutritionnels,
> IMC dérivé, « Calculer auto » (Mifflin-St Jeor). Les cibles alimentent les barres de
> progression du récap Nutrition (rouge si dépassé) et le Dashboard (salutation par username +
> métriques X / cible). Colonnes ajoutées : `profiles.sex` + `target_*`.

**Problème (résolu)** : la table `profiles` (`username, age, weight, height, goal`) était remplie
à l'inscription puis **jamais lue ni éditée** par l'app. Aucun objectif nutritionnel n'existait.

**Livrables**
- **Migration DB** : ajouter à `profiles` les cibles nutritionnelles
  `target_calories`, `target_protein_g`, `target_carbs_g`, `target_fat_g` (real, nullable) ;
  normaliser `goal` en valeurs cadrées (`perte`, `maintien`, `prise`).
- **Page `/profile`** (`ProfilePage.jsx`) accessible via l'email/avatar de la navbar (haut-droite
  cliquable) :
  - Édition `username`, `age`, `poids`, `taille`, `objectif` (select), via `NumberStepper`.
  - Section « Objectifs nutritionnels » : 4 cibles éditables.
  - Bouton « Calculer automatiquement » : BMR (Mifflin-St Jeor) × activité × facteur objectif
    → pré-remplit les cibles (modifiable ensuite).
  - Affichage dérivé : IMC (poids/taille²).
  - Sauvegarde via `upsert` sur `profiles`.
- **Nutrition** : la carte récap affiche **consommé / cible** avec barres/anneaux de progression
  (vert si dans la cible, ambre/rouge si dépassé). Repli propre si aucune cible définie.
- **Dashboard** : saluer par `username` (fallback préfixe email) ; métrique calories en
  « X / cible ».

**Découpage**
1. Migration `profiles` (colonnes cibles).
2. `ProfilePage` + route `/profile` + entrée navbar (email cliquable).
3. Formulaire + `upsert` + IMC + calcul auto optionnel.
4. Barres de progression sur la carte récap Nutrition.
5. Username + objectif calorique sur le Dashboard.
6. Lint/build, doc (`CLAUDE.md`), mémoire, commit.

---

## 2. Suivi du poids corporel 🟡

`profiles.weight` est une valeur statique. Ajouter un **historique**.

- **Migration** : table `body_weights` (`id, user_id, weight_kg, measured_at, created_at`,
  RLS par `user_id`).
- Saisie rapide du poids (depuis le Profil ou le Dashboard).
- **Analyse** : courbe d'évolution du poids + ligne d'objectif ; delta sur la période.
- Mise à jour de `profiles.weight` avec la dernière mesure.

---

## 3. Responsive & PWA 🔴

L'app n'a **aucun `@media`** : grilles figées en 2–4 colonnes, cassées sur mobile.

- Rendre les grilles adaptatives (`repeat(auto-fit, minmax(...))` ou breakpoints) ;
  navbar repliable en menu sur petit écran.
- Vérifier modales / `DateSelector` / graphiques sur largeur téléphone.
- **PWA** : `manifest.webmanifest` + icônes + service worker (shell offline) → installable.

---

## 4. Profondeur des séances 🔴

- **Modèles / routines** : enregistrer une séance comme modèle, « répéter cette séance ».
- **Records personnels (PR)** : meilleur poids / 1RM estimé par exercice, badge quand battu.
- **Minuteur de repos** entre séries (déjà cohérent avec `NumberStepper`/UI existante).
- Notes par série (la colonne avait été supprimée car inutilisée — à réintroduire si besoin réel).

---

## 5. Qualité & Infra 🟢

- **Code-splitting** : `React.lazy` sur `AnalyticsPage` (Recharts) — le bundle dépasse 500 KB.
- **Tests** : aucun configuré → mettre en place Vitest + quelques tests (calculs macros, totaux,
  helpers de dates).
- Optionnel : extraire un petit hook/`profileContext` si la lecture du profil se répète sur
  plusieurs pages (à arbitrer vs. la convention « appels supabase inline »).

---

## Idées annexes (non priorisées)
- Export des données (CSV/JSON).
- Photos de progression.
- Partage/streaks de régularité.
- Thème clair (actuellement dark-only).
