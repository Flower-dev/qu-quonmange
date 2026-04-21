# Qué qu'on mange ? 🍽️

Randomiseur de restaurant avec roue pondérée. La roue tire un restaurant au sort selon la formule `appréciation × (6 - récurrence)` — les coups de cœur peu fréquentés sortent plus souvent.

## Stack

- **Next.js 16.2** (App Router), React 19, TypeScript 5 strict
- **Tailwind CSS v4** — thème dans `app/globals.css`
- **shadcn/ui** (style radix-luma, icônes lucide)
- Pas de backend, pas de base de données — tout l'état est côté client, initialisé depuis `data/restaurants.json`

## Lancer le projet

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

Avec Docker :

```bash
docker compose up
```

Accessible sur [http://localhost:3001](http://localhost:3001).

## Commandes

| Tâche | Commande |
|-------|----------|
| Serveur de dev | `npm run dev` |
| Build | `npm run build` |
| Lint | `npm run lint` |

## Fichiers clés

- `app/page.tsx` — toute l'UI (composant client), logique de la roue, CRUD des restaurants
- `data/restaurants.json` — données initiales, importées statiquement
- `app/globals.css` — thème Tailwind v4 + animation `animate-blob`
- `lib/weighted-random.ts` — algorithme de tirage pondéré
- `components/ui/` — composants shadcn
