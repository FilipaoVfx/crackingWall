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
- [ ] 🟠 **Origen de las imágenes de wallpapers (autenticidad):** `src/content/wallpapers.json` apunta a **Unsplash** (stock hotlinkeado), lo que contradice el relato de "artworks originales" y parece agregador (señal MFA). Decisión del dueño: sustituir por arte propio/AI-curado y **auto-alojado**, o reencuadrar honestamente la galería. Alto impacto en EEAT.
- [ ] **Personalizar EEAT real:** nombre real/alias público + foto/avatar + links sociales verificables del creador (hoy usa el handle GitHub como base). Cuanto más real, mejor.
- [ ] **Descripciones originales por wallpaper** (no autogeneradas): contexto, técnica, inspiración → propósito editorial. *(Depende de resolver el origen de imágenes.)*
- [ ] **Revisar densidad/calidad de la galería:** quitar lo que no aporte; que cada imagen tenga propósito.
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

- [ ] Sin redes de anuncios intrusivas activas.
- [ ] Legales completas: About (EEAT), Contact, Privacy (con AdSense), Terms, License.
- [ ] Autor real e identificable.
- [ ] ≥ ~15–20 piezas de contenido con valor único (posts/guías + wallpapers con descripción propia).
- [ ] Navegación clara, sin enlaces rotos, diseño consistente.
- [ ] Dominio final decidido y estable.
- [ ] Structured data válido (probar en Rich Results Test).
- [ ] Sitemap enviado en Search Console; sin errores de indexación graves.

---

## 7. Principio rector

> **No fingir.** El notebook premia autenticidad. La jugada ganadora de CrackingWall no es esconder que usa IA, sino **demostrar el valor humano y el software original que la rodea.** Las creative tools son el argumento de EEAT — hay que hacerlas protagonistas.

---

*Rama: `feat/adsense-seo` · Doctrina: notebook AdSense (NotebookLM) · Última actualización: 2026-06-30*
