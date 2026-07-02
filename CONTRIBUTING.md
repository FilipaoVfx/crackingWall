# Contributing to CrackingWall

Thanks for working on CrackingWall (pixelatmos.com). This guide gets you productive fast.

## Prerequisites
- Node.js 20+ (project builds on Node 22)
- npm

## Setup
```bash
git clone https://github.com/FilipaoVfx/crackingWall.git
cd crackingWall
npm install
cp .env.example .env      # fill in the values (see .env.example)
npm run dev               # http://localhost:4321
```

> Without Supabase credentials the app falls back to local content
> (`src/content/wallpapers.json`), so you can develop the UI offline.

## Scripts
| Command | What it does |
|---------|--------------|
| `npm run dev` | Astro dev server (hot reload) |
| `npm run build` | Production build (`dist/`) |
| `npm run preview` | Preview the built site |
| `npm run test` | Run the Vitest suite |
| `npm run lint` | ESLint |

## Tech stack
- **Astro 5** (`output: 'server'`) on **Cloudflare Workers** (`@astrojs/cloudflare`)
- **React 19** islands (`client:*`) for the interactive tools
- **Tailwind** (neobrutalism tokens) · **Supabase** (Postgres · Storage · Auth)
- See [`docs/architecture/`](docs/architecture/) for diagrams.

## Project structure
```
src/
├── pages/        # routes (.astro) + /api endpoints
├── layouts/      # AppLayout (shell, consent, SEO)
├── components/   # React + Astro components
├── features/     # feature modules (e.g. ascii-video)
├── services/     # data access (wallpaperService, ...)
├── lib/          # third-party clients (supabase)
├── utils/        # shared helpers (wallpaper slugs, ...)
├── content/      # local fallback content (wallpapers.json)
└── middleware.ts # security headers / CSP
docs/             # product, SEO, architecture docs
db/               # database schema
```

## Workflow
1. Branch from `main`: `git checkout -b feat/short-name` (or `fix/`, `chore/`, `docs/`).
2. Commit in the imperative mood; keep changes focused.
3. Open a PR into `main` (use the template). Ensure `npm run build` and `npm run test` pass.
4. `main` auto-deploys to Cloudflare (pixelatmos.com) — builds are queued, so expect a few minutes of lag.

## Conventions
- Don't commit secrets. Server secrets go in Cloudflare Secrets; only `PUBLIC_*` vars are safe client-side.
- Keep components small and match the surrounding style (Tailwind neobrutalism tokens).
- Generated/local dirs (`dist/`, `.astro/`, `.claude/`, `geo-output/`) are gitignored — don't commit them.
