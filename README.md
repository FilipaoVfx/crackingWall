# CrackingWall

**Creative tools + tech-culture wallpapers.** Live at **[pixelatmos.com](https://pixelatmos.com)**.

CrackingWall is an independent studio site: a small suite of original, browser-based
creative tools (ASCII Lab, Visual Protocol, 3D Lab) plus a curated gallery of
tech-culture wallpapers.

## Tech stack
- **[Astro 5](https://astro.build)** (`output: 'server'`) deployed on **Cloudflare Workers** (`@astrojs/cloudflare`)
- **React 19** islands for the interactive tools
- **Tailwind CSS** (neobrutalism design tokens)
- **Supabase** — Postgres (wallpapers), Storage (images), Auth
- **OpenRouter** — vision LLM for Visual Protocol
- Analytics/ads: Google AdSense + Microsoft Clarity (both consent-gated)

## Quick start
```bash
npm install
cp .env.example .env      # fill in values
npm run dev               # http://localhost:4321
```
See **[CONTRIBUTING.md](CONTRIBUTING.md)** for full setup, scripts, and workflow.

## Project structure
```
src/            # app source (pages, layouts, components, features, services, lib, utils)
docs/           # documentation
  ├─ architecture/   # editable Excalidraw diagrams (runtime, deploy, tools)
  ├─ product/        # product docs (3D Lab, aesthetic manifesto)
  └─ seo/            # AdSense/SEO plan + GEO reports
db/             # database schema
public/         # static assets (ads.txt, robots.txt, favicon, avatar)
```

## Creative tools
| Tool | What it does | Runs |
|------|--------------|------|
| **3D Lab** (`/3d-lab`) | Text/SVG → interactive 3D (sculpt, export PNG/GLB) | 100% in-browser |
| **ASCII Lab** (`/ascii-lab`) | Image/video → ASCII art (GIF/MP4/HTML) | 100% in-browser |
| **Visual Protocol** (`/visual-protocol`) | Image → structured creative brief | server-assisted (LLM) |

3D Lab is powered by our open-source package **[`@filipaovfx/svg3d`](https://github.com/FilipaoVfx/Svg3Ddesign)**.

## Deployment
Pushing to `main` triggers a Cloudflare build (`npm ci && npm run build`) that
deploys the Worker to pixelatmos.com. See [docs/deploy.md](docs/deploy.md).

## Documentation
- Architecture diagrams → [docs/architecture/](docs/architecture/)
- AdSense / SEO plan → [docs/seo/adsense-seo-plan.md](docs/seo/adsense-seo-plan.md)
- Product / 3D Lab → [docs/product/3d-lab.md](docs/product/3d-lab.md)
