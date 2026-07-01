# CrackingWall — AdSense Approval & SEO Plan

> Fase de producto: **profesionalizar el sitio, mejorar el SEO y adecuarlo para ser aprobado en Google AdSense.**
> Documento vivo. Fuente doctrinal: notebook personal de AdSense (NotebookLM) + auditoría del repo (rama `feat/adsense-seo`).

---

## 1. Doctrina del notebook (lo que Google realmente evalúa)

El notebook es consistente en un mensaje central:

1. **Motivo #1 de rechazo: "contenido de poco valor".** Un sitio se rechaza cuando parece hecho **para los anuncios** y no para las personas (MFA — *Made For AdSense*): nicho barato, relleno, sin ángulo propio.
2. **La IA NO está prohibida.** Google no prohíbe el contenido generado con IA. Pero la IA debe ser **la base, no el producto**: el resultado final debe estar **pulido, ser profesional y aportar valor humano original**.
3. **EEAT es crítico** (*Experience, Expertise, Authoritativeness, Trust*):
   - **Quién** crea el contenido debe ser visible (autor real, identificable).
   - **Experiencia/pericia** real en el nicho.
   - **Ángulo único** — algo que no encuentras en cualquier agregador.
   - **Autenticidad** — no fingir, no ocultar el proceso.
4. **Diseño limpio y profesional.** Navegación clara, páginas legales completas, sin trucos.
5. **Imágenes con propósito editorial**, no relleno.

### Traducción a CrackingWall
CrackingWall combina **IA (wallpapers/tools) + herramientas creativas originales**. El riesgo es parecer "otra galería de imágenes IA" (MFA). **La ventaja/foso** es que las *creative tools* (ASCII Lab, Visual Protocol, 3D Lab) son **software original propio** — eso es EEAT genuino y difícil de replicar. La estrategia: **poner las herramientas y el valor humano al frente**, y hacer los wallpapers transparentes (IA como base, curación humana como producto).

---

## 2. Auditoría (estado al iniciar la fase)

| Área | Estado | Nota |
|---|---|---|
| `ads.txt` | ✅ | `pub-1028294908787451, DIRECT` |
| `robots.txt` + sitemap | ✅ | sitemap-index + image-sitemap |
| Páginas legales | ⚠️ Parcial | About, Contact, License, Privacy ✅ · **Terms ❌** |
| Privacy Policy | ⚠️ Débil | No divulgaba **AdSense / cookies de terceros** (requisito duro) |
| EEAT / autor | ❌ | About sin persona/autor identificable |
| Structured data site-wide | ❌ | Solo en 3 páginas; sin Organization/WebSite global |
| **Redes de anuncios en conflicto** | ✅ Eliminado | HilltopAds *native banner* + *social bar* (pop-under) retirados por completo |

---

## 3. ✅ Resuelto: redes de anuncios agresivas eliminadas

El `<head>` cargaba **HilltopAds** (native banner + *social bar* / pop-under de `effectivegatecpm.com`). Para AdSense esto es de los peores anti-patrones:

- Google **rechaza** sitios con anuncios **intrusivos** (pop-under, social bar, interstitials no conformes).
- Es una **señal fuerte de MFA** — exactamente el perfil que el notebook dice que Google penaliza.
- Podía provocar **rechazo directo** aunque todo lo demás estuviera bien.

**Acción tomada (por decisión del dueño):** el proveedor se **eliminó por completo** del repo — scripts, contenedor del banner en `AppLayout.astro` y en el `Layout.astro` legacy, y los dominios `effectivegatecpm.com` del CSP en `middleware.ts`. AdSense queda como única red de anuncios.

---

## 4. Trabajo hecho en esta rama (`feat/adsense-seo`) — P0

- [x] **Terms of Service** (`/terms`) — página nueva + link en footer.
- [x] **Privacy Policy** reescrita con divulgación de **Google AdSense**, cookies de terceros, opt-out (Google Ads Settings, aboutads.info) y política de menores. *(Requisito de AdSense.)*
- [x] **About con EEAT**: creador identificable (FilipaoVfx), estándares editoriales, y **transparencia sobre IA** ("IA como base, no producto"). Reencuadra las *creative tools* como el valor original.
- [x] **Structured data site-wide**: `Organization` + `WebSite` (JSON-LD) en `AppLayout`, y `AboutPage` + `Person` en About.
- [x] **Anuncios en conflicto desactivados** (ver §3).

---

## 5. Roadmap (prioridad descendente)

### P1 — Antes de solicitar AdSense
- [x] **Contenido con valor único (tanda 1):** 3 guías originales de primera mano de las tools — [3D Lab](/blog/svg-to-3d-browser-guide/), [ASCII Lab](/blog/faithful-ascii-art-guide/), [Visual Protocol](/blog/visual-protocol-creative-direction/). Con `BlogPosting` schema, autor, fechas reales, inter-linking tools↔blog. *(Añadir más con el tiempo; el blog venía fino — 3 posts genéricos — para el estándar del notebook.)*
- [x] 🟢 **Origen de las imágenes de wallpapers (autenticidad):** Unsplash **eliminado por completo**. La galería son ahora **8 wallpapers originales autoalojados**, generados por código propio (arte generativo vectorial → WebP 4K vía `scripts/generate-wallpapers.mjs`). 0 stock en todo el sitio (incl. heroes de blog). Coherente con la identidad "estudio de creative tools" → EEAT fuerte.
- [x] **EEAT del autor (avatar):** avatar del creador autoalojado + `Person` schema con `image` (ver PR #14). *(Falta opcional: nombre real/redes verificables si el dueño lo desea.)*
- [x] **Descripciones originales por wallpaper:** cada pieza nueva trae título + descripción propia (no autogenerada) explicando técnica/origen.
- [ ] **Revisar densidad/calidad de la galería:** con el tiempo, ampliar el set original (8 es un mínimo digno; más variedad ayuda) y refinar las piezas más flojas (`lattice-city`, `deep-void`).
- [x] Verificar que **no quedan otras redes** de anuncios/pop-ups — HilltopAds eliminado por completo (ver §3).

### P2 — SEO técnico
- [ ] `BreadcrumbList` en más rutas; verificar `sitemap` incluye tools + blog + legales.
- [ ] Metadatos por página (títulos/descripciones únicos y descriptivos) — auditar duplicados.
- [ ] Imágenes: `alt` descriptivo, `width/height`, `loading="lazy"`, formatos optimizados (webp/avif).
- [ ] Core Web Vitals: peso de islas React, lazy-load del motor 3D (ya), LCP del home.
- [ ] Coherencia de dominio: `robots.txt`/`site` usan `crakingculturewallpaperr.xyz` — confirmar dominio final antes de solicitar (un cambio de dominio reinicia la evaluación).

### P3 — Profesionalización / confianza
- [ ] Página o sección de **contacto real** verificable (email visible, no solo formulario).
- [ ] Consistencia de marca: "CrackingWall" vs "CrakingWall" vs "CrakingCultureWallpaper" — unificar el nombre público.
- [ ] Banner de **consentimiento de cookies** (GDPR/consent mode) — recomendable con AdSense.
- [ ] `404` y estados de error con diseño propio.

---

## 6. Checklist de "listo para solicitar"

- [x] Sin redes de anuncios intrusivas activas.
- [x] Legales completas: About (EEAT), Contact, Privacy (con AdSense), Terms, License.
- [~] Autor identificable (handle + avatar); falta nombre real/redes si se desea.
- [~] Contenido con valor único: 6 posts (3 guías de tools de primera mano) + 8 wallpapers originales con descripción propia = 14 piezas. Objetivo ~15–20: casi.
- [ ] Navegación clara, sin enlaces rotos, diseño consistente. *(Pendiente: URLs de categoría con espacio, p. ej. `/tech culture/` → slugificar a `/tech-culture/`.)*
- [ ] Dominio final decidido y estable.
- [ ] Structured data válido (probar en Rich Results Test).
- [ ] Sitemap enviado en Search Console; sin errores de indexación graves.

---

## 7. Principio rector

> **No fingir.** El notebook premia autenticidad. La jugada ganadora de CrackingWall no es esconder que usa IA, sino **demostrar el valor humano y el software original que la rodea.** Las creative tools son el argumento de EEAT — hay que hacerlas protagonistas.

---

*Rama: `feat/adsense-seo` · Doctrina: notebook AdSense (NotebookLM) · Última actualización: 2026-06-30*
