# Pixelatmos — Architecture Diagrams

Editable **Excalidraw** diagrams of the site (pixelatmos.com). Open any `.excalidraw`
file at [excalidraw.com](https://excalidraw.com) (File → Open) or with the
**Excalidraw** VS Code extension for inline editing.

| File | What it shows |
|------|---------------|
| [`runtime.excalidraw`](runtime.excalidraw) | Request flow: Visitor → Cloudflare Edge/Worker → Astro → App shell → Pages → React islands, plus external services (Supabase, OpenRouter, AdSense, Clarity, Search Console) with data / build / consent-gated connections. |
| [`deploy.excalidraw`](deploy.excalidraw) | CI / deploy pipeline: GitHub `main` → Cloudflare Build (`npm ci && npm run build`) → Worker (ASSETS + Workers Logs) → live site. Notes the queued-build lag. |
| [`tools.excalidraw`](tools.excalidraw) | Internal flow of each creative tool: **3D Lab** (SVG Intelligence → svg3d → WebGL → export), **ASCII Lab** (luminance → char ramp → export), **Visual Protocol** (`/api/decode` → OpenRouter → structured brief). Colors mark the privacy boundary: teal/green = 100% in-browser, pink = server-assisted. |

## Legend (shared)
- **Solid arrow** — request / render flow
- **Cyan dashed** — data / build fetch (e.g. `getAllWallpapers`, `/api/decode`, sitemap)
- **Amber dashed** — consent-gated / deploy (AdSense & Clarity load only on Accept)

## Regenerating
The diagrams are produced from source element arrays by [`gen.mjs`](gen.mjs)
(expands labels to bound text + fills the Excalidraw schema):

```bash
node docs/architecture/gen.mjs
```

Edit the arrays in `gen.mjs` and re-run to update the `.excalidraw` files.
