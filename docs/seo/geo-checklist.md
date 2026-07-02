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

## ✅ Done (social proof + FAQ pass)
- [x] **Social proof:** wallpaper cards + detail pages already show real `downloads`/`likes`, and the detail schema already carries `interactionStatistic` (DownloadAction + LikeAction). Added a real aggregate stats strip to the home (3 tools · 9 wallpapers · 3,085 downloads · 313 likes — computed from data, no inflation).
- [x] **FAQ:** honest FAQ + `FAQPage` JSON-LD on all 3 tool pages (reusable `FaqSection.astro`, 5 Q&A each). Differentiators woven into the answers (free, no signup, files-stay-local for ASCII/3D; honest server-analysis note for Visual Protocol).

## ⏳ Recommended next (high ROI, honest — no hype)
- [ ] **Differentiators:** optional one-liner near the top of each tool hero (currently in the FAQ answers)
- [ ] **Wallpaper copy:** 1–2 sentences of visible context per piece
- [ ] Validate all schema in Google Rich Results Test after deploy
- [ ] (Optional) `ItemList`/`Course` schema for the blog guides collection

## How to re-run
- Full pipeline on a page: `/geo https://pixelatmos.com/3d-lab/`
- Audit only: `/geo:audit https://pixelatmos.com/wallpapers/`
- Local file: `/geo:optimize src/pages/about.astro`
- Executive report: `/geo:report`
