# GEO Implementation Checklist — CrackingWall

## ✅ Done (this pass)
- [x] Install eGEOagents plugin (`.claude/commands`, `agents`, `output-styles`, GEO skills)
- [x] `HowTo` JSON-LD on the 3 tool guides (svg-to-3d, faithful-ascii, visual-protocol)
- [x] `WebApplication` JSON-LD on `/3d-lab/` (ASCII Lab & Visual Protocol already had it)
- [x] Validate build (schema renders, all pages compile)

## ✅ Done earlier (SEO/index foundation)
- [x] Canonical domain unified to `pixelatmos.com`
- [x] `sitemap-index.xml` + dynamic `image-sitemap.xml`
- [x] Organization / WebSite / Person / BlogPosting / ImageObject / Breadcrumb schema
- [x] Unique titles + canonicals + meta descriptions on all 29 pages
- [x] Custom 404 (noindex) + Cloudflare ASSETS binding fix
- [x] GSC verification hook (`PUBLIC_GOOGLE_SITE_VERIFICATION`)

## ⏳ Recommended next (high ROI, honest — no hype)
- [ ] **Social proof:** display real `downloads`/`likes` (already in Supabase) on wallpaper cards + detail pages; add `interactionStatistic` to wallpaper schema
- [ ] **FAQ:** add a short honest FAQ + `FAQPage` schema on tool pages (or `/faq`)
- [ ] **Differentiators:** one honest line per tool — "100% in your browser · no signup · files stay local · free"
- [ ] **Wallpaper copy:** 1–2 sentences of visible context per piece
- [ ] Validate all schema in Google Rich Results Test after deploy
- [ ] (Optional) `ItemList`/`Course` schema for the blog guides collection

## How to re-run
- Full pipeline on a page: `/geo https://pixelatmos.com/3d-lab/`
- Audit only: `/geo:audit https://pixelatmos.com/wallpapers/`
- Local file: `/geo:optimize src/pages/about.astro`
- Executive report: `/geo:report`
