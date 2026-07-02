<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project: Qué qu'on mange ?

Single-page French restaurant randomizer. Weighted spinner picks a restaurant based on `appreciation × (6 - recurrence)` (minimum weight of 1). No backend, no database — all state is client-side React state seeded from `data/restaurants.json`.

## Stack

- **Next.js 16.2** (App Router), React 19, TypeScript 5 (strict)
- **Tailwind CSS v4** via `@tailwindcss/postcss` — no `tailwind.config.*` file; theme in `app/globals.css` using `@theme inline`
- **shadcn/ui v4** (radix-luma style, lucide icons) — add components via `npx shadcn add <name>`
- Path alias: `@/*` maps to repo root
- `tw-animate-css` for built-in transition animations

## Commands

| Task | Command |
|------|---------|
| Dev server | `npm run dev` (port 3000) |
| Build (static export) | `npm run build` (outputs to `out/`) |
| Lint | `npm run lint` (ESLint flat config) |
| Docker dev | `docker compose up` (port 3001 → 3000) |

No test framework. No formatter beyond ESLint `core-web-vitals` + `typescript`.

## Architecture

### `output: "export"` — every file is static

`next.config.ts` sets `output: "export"`. This means:
- **No SSR, no API routes, no middleware, no `next/image` optimization.** Adding any of these will break the build.
- The build produces static files in `out/`, deployed to GitHub Pages.
- `basePath` is conditionally `/qu-quonmange` when `GITHUB_PAGES=true` (set in CI), empty string locally.
- The entire app is a single `'use client'` page at `app/page.tsx`. All components run client-side.

### State management — `useSyncExternalStore` with localStorage

`hooks/use-restaurants.ts` implements a custom external store:
- Module-level `cachedRestaurants` cache + `Set` of listeners → `notify()`.
- `getSnapshot()` reads from localStorage or seeds from `data/restaurants.json`.
- `setStore(updater)` writes to localStorage then notifies listeners.
- The store is shared across all hook instances — no context/provider needed.

**Storage has a versioned schema.** `lib/storage.ts` uses `CURRENT_VERSION = 2` with a `migrate()` function. If you add or rename fields on `Restaurant`, you must:
1. Bump `CURRENT_VERSION` in `storage.ts`.
2. Add a migration block in `migrate()` for backwards-compat.

### Geolocation & geocoding

- `hooks/use-geolocation.ts` wraps `navigator.geolocation.watchPosition` (one-shot via `getCurrentPosition`).
- `components/restaurant-form.tsx` calls Nominatim OpenStreetMap (`nominatim.openstreetmap.org/search`) directly from the client for address search. **This API is rate-limited (HTTP 429).** The form handles 429 gracefully with a user-facing error — don't add retry logic without respecting the rate limit.
- Distance calculation uses Haversine formula (`lib/distance.ts`).

### Weighted random algorithm

`lib/weighted-random.ts`: `weight = appreciation × (6 - recurrence)`, clamped to minimum 1. The spinner in `spinner-view.tsx` runs 18 ticks with increasing delays (50ms → progressive deceleration), then a final pick.

## Key files

| File | Role |
|------|------|
| `app/page.tsx` | Entrée unique : tabs, CRUD orchestration, geolocation trigger |
| `app/layout.tsx` | Root layout, fonts (Playfair Display + Source Sans 3), metadata |
| `app/globals.css` | Tailwind v4 theme, custom `@keyframes`, `@utility` animations, shadcn CSS vars |
| `hooks/use-restaurants.ts` | External store for restaurant CRUD + localStorage persistence |
| `hooks/use-filters.ts` | Category / budget / distance / recurrence filtering |
| `hooks/use-geolocation.ts` | Browser geolocation API wrapper |
| `lib/types.ts` | `Restaurant`, `Filters`, `DEFAULT_FILTERS` |
| `lib/storage.ts` | `localStorage` read/write + schema migrations |
| `lib/weighted-random.ts` | Weighted random pick |
| `lib/distance.ts` | Haversine + `formatDistance` |
| `lib/utils.ts` | `cn()` — clsx + tailwind-merge |
| `components/spinner-view.tsx` | The plate/spinner UI, spinning logic, result card |
| `components/restaurant-list.tsx` | Card grid with edit/delete, filter bar |
| `components/restaurant-form.tsx` | Create/edit form with geocoding |
| `components/filter-bar.tsx` | Category/budget/distance/recurrence filter pills |
| `components/ui/` | shadcn components (Button, AlertDialog) |

## Conventions

- **Toute l'UI est en français.** Labels, descriptions, placeholders, aria-labels — tout.
- **Animations custom → `@utility`** dans `globals.css`. Ne pas utiliser la syntaxe `theme.extend` de Tailwind v3.
- **Pas d'API routes, pas de server actions, pas de `"use server"`.** Tout est `'use client'`.
- **Couleurs du thème** : `cream`, `ink`, `terracotta`, `sage`, `burgundy`, `warm-gray`, `parchment`. Les définir dans `@theme inline` (globals.css), jamais en dur.
- **Budget** est typé `1 | 2 | 3` (€ / €€ / €€€). Ne pas utiliser d'autres valeurs.
- **Les IDs restaurant** sont générés via `String(Date.now())`. Ils ne sont pas destinés à être stables ou cryptographiquement uniques.

## Gotchas

- **`timeoutRef` dans `spinner-view.tsx` n'est jamais nettoyé.** Si tu ajoutes un `useEffect` cleanup, il faut `clearTimeout(timeoutRef.current)` au démontage pour éviter un setState sur composant démonté.
- **Clés React non uniques dans les emojis orbitaux** (ligne 184 de `spinner-view.tsx`). Deux restaurants avec le même emoji partagent la même clé. Utiliser `r.id` si tu touches à cette partie.
- **Pas d'Error Boundary.** Une erreur React crash tout l'écran. Si tu ajoutes `app/error.tsx`, il doit être `'use client'`.
- **`Date.now()` dans `seedRestaurants` côté serveur** — les IDs générés au build diffèrent de ceux du client. Actuellement sans conséquence mais fragile.
- **Nominatim n'a pas d'`AbortController`** dans la recherche d'adresse. Des requêtes concurrentes peuvent aboutir dans le désordre lors de frappes rapides.
- **Les composants shadcn ont une API v4** (`data-slot`, `data-size`, `data-variant`, pas de `cn()` dans les variantes de Button comme en v3).
