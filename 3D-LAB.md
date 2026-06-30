# 3D Lab — Manifiesto de Producto

> Convierte cualquier **texto o SVG** en un objeto **3D interactivo**, directo en el navegador.
> Una herramienta de CrackingWall Creative Tools Lab.

**Ruta:** `/3d-lab` · **Estado:** en producción (`main`) · **Motor:** `@filipaovfx/svg3d`

---

## 1. Visión — "Volumen esculpido"

La mayoría de conversores SVG→3D ven **cientos de paths sueltos** y los extruyen todos igual → resultado plano, sin alma.

El 3D Lab parte de otra filosofía: **un SVG no es una lista de paths, es un activo creativo** con piezas, colores, materiales y profundidad propios. El objetivo no es "extruir" (eso ya lo resuelve Three.js), sino **interpretar** el asset y dejar que el usuario lo **esculpa en volumen** sin perder detalles.

```
SVG  →  Interpretación  →  Relieve por pieza  →  3D de alta fidelidad
```

---

## 2. Qué es

Una herramienta creativa **100% client-side** (WebGL en el navegador, sin backend) que:

- toma **texto** o un **SVG** subido,
- lo convierte en un **modelo 3D interactivo** (orbitable),
- permite **esculpir** cada elemento (relieve, material, color),
- y **exporta** el resultado como **PNG** o **GLB**.

**Para quién:** creadores, diseñadores y devs que quieren llevar logos, iconos o texto a 3D rápido, sin software pesado ni curva de aprendizaje.

---

## 3. Cómo funciona (flujo de producto)

**Modo Texto**
1. Escribe hasta 6 caracteres.
2. Elige un **preset** de marca: `neon · glitch · chrome · gold · glass`.
3. Arrastra para orbitar. Exporta PNG/GLB.

**Modo SVG (esculpido)**
1. **Sube un SVG.**
2. El sistema lo **interpreta**: detecta cada elemento, captura su color y propone material + relieve.
3. Abre el **Layer Explorer** y **esculpe**: selecciona una pieza → ajusta relieve, material, color, visibilidad — en vivo.
4. Exporta PNG/GLB.

> Filosofía de UX del laboratorio: **el usuario ve la mayor cantidad de servicios/controles en la primera pantalla**, con legibilidad y densidad cuidadas.

---

## 4. Características (features)

### 🎨 Texto → 3D
- 5 presets de marca on-brand (neon, glitch, chrome, gold, glass).
- Materiales PBR (metal, vidrio, emisivo, plástico, cromo, oro).

### 🧩 SVG Intelligence (la capa de interpretación)
- **Segmentación automática de elementos:**
  - Respeta los grupos `<g id>` cuando el autor los nombró.
  - Para iconos sin ids → **segmenta por cada forma** (captura *todos* los elementos: ojos, pupilas, nariz, dientes…).
- **Captura de color:** resuelve **gradientes** (promedia sus stops), colores con nombre (`white`, `black`…) y fills planos.
- **Inferencia de material y relieve** por elemento (rol → vidrio / metal / plástico / emisivo…).
- **Topología real:** huecos y cavidades (vents, perforaciones) vía `fillRule`/holes.
- **Ignora** regiones no visibles (`<defs>`, `<mask>`, `<clipPath>`).

### 🗿 Relieve "esculpido"
- **Painter's z-order:** el orden de dibujo = altura → la base queda atrás y los detalles **suben en relieve al frente** (cara al fondo, ojos/nariz/boca sobresalen).
- Cada capa con su **profundidad** propia → volumen diferenciado.

### ✏️ Editor de escultura por capa (Advanced Playground)
- **Layer Explorer** seleccionable, con el color real de cada pieza.
- Controles por elemento: **Relief (profundidad)**, **Material**, **Color**, **Visibilidad**.
- Cambios **en vivo** (debounced) sobre el modelo.

### 🎬 Escenas
- Presets de iluminación/entorno: `studio · cyberpunk · industrial · minimal` (recomendado automáticamente según el asset).
- Entorno **autocontenido** (sin descargar HDRIs externos).

### 💾 Exportación (client-side)
- **PNG** — captura directa del lienzo (alta fidelidad, `preserveDrawingBuffer`).
- **GLB** — modelo 3D estándar (glTF binario), con cada capa como nodo nombrado; abrible en cualquier visor 3D.

---

## 5. Lo que lo hace bueno (características de producto)

- **Sin servidor, sin coste por uso:** todo el cómputo corre en el dispositivo del usuario (mismo modelo de recursos que las mejores herramientas client-first).
- **Fidelidad:** cada elemento conserva su color y forma; el relieve respeta la composición original.
- **Rendimiento cuidado** (60 fps objetivo):
  - presupuesto de geometría (~300k vértices) con avisos automáticos,
  - `curveSegments`/bevel acotados para iconos complejos,
  - build de geometría **no bloqueante** + liberación de memoria (dispose),
  - motor 3D **lazy-loaded** (no infla la carga inicial),
  - análisis **cacheado por hash** del SVG.
- **Degradación elegante:** si el dispositivo no soporta WebGL, muestra un aviso claro en lugar de romperse.

---

## 6. Arquitectura (trazabilidad)

```
CrackingWall  /3d-lab  (island client:only, React 19 + R3F)
        │  usa
        ▼
@filipaovfx/svg3d   (paquete wrapper, repo: FilipaoVfx/Svg3Ddesign)
   ├─ analyzeSvg()        → SVG Intelligence (interpretación, puro/sin DOM)
   ├─ <LayeredSvg3D>      → renderer por capa (relieve + materiales)
   ├─ <Svg3D>             → modo texto + presets
   └─ export utils        → PNG / GLB
        │  envuelve a
        ▼
3dsvg  (motor de extrusión Three.js, MIT © Renato Costa)
```

- El paquete es un **wrapper** sobre el motor `3dsvg` (no un fork): recibe mejoras del upstream con mantenimiento mínimo.
- La capa **SVG Intelligence** es propia y es donde vive la ventaja: interpretar el asset, no solo extruirlo.

---

## 7. Trazabilidad de versiones (`@filipaovfx/svg3d`)

| Versión | Hito |
|---|---|
| v0.1.0 | Wrapper `<Svg3D>` + presets de marca (texto → 3D) |
| v0.2.0 | Export client-side: PNG + lectura/saneo de SVG |
| v0.3.x | Export **GLB** (GLTFExporter) + captura de escena (`registerScene`) |
| v0.4.0 | **SVG Intelligence** `analyzeSvg` (interpretación por capas) |
| v0.5.0 | Material por fill, presupuesto de geometría, caché por hash, presets de escena, tests |
| v0.6.x | **Layered renderer** (relieve por capa, holes, z-stacking) + entorno autocontenido |
| v0.7.0 | Build no bloqueante + liberación de geometría (perf) |
| v0.8.x | Captura de **color de gradientes** + overrides de escultura + tope de segmentos |
| **v0.9.0** | **Granularidad por-shape** (captura cada elemento) + **painter's z-order** + colores con nombre |

> Integrado en CrackingWall vía PR #10 (app-shell) y **PR #11** (3D Lab, React 19). Suite de tests del paquete en verde.

---

## 8. Limitaciones honestas (estado actual)

- **Trazos (`stroke`)**: solo se extruyen **rellenos**; elementos hechos solo con borde (p. ej. aros finos) aún no generan geometría. → *en hoja de ruta (extrusión de trazos).*
- **Iconos muy complejos** en equipos de gama baja pueden ir justos (mitigado por presupuesto + topes de calidad).
- **Filtros SVG** (sombras internas, blur) no se traducen a 3D (son efectos 2D).

---

## 9. Hoja de ruta

- **Extrusión de trazos** — capturar contornos/líneas (no perder detalles tipo aros).
- **Enriquecimiento con IA (opcional):** nombrar elementos ("ojo_izq", "pupila") y sugerir material/relieve automáticamente vía OpenRouter — *fuera del path de render, cacheado, opt-in.*
- **Editores finos:** transform por capa, vista "explosión", más presets de escena.
- **Exportación de video** (frames → MP4/WebM, on-demand).
- **Caché persistente** (IndexedDB) de análisis/geometría por hash.

---

## 10. Créditos

3D Lab está construido sobre **[`3dsvg`](https://github.com/renatoworks/3dsvg)** (MIT © Renato Costa), con la capa de inteligencia, presets, escultura y exportación de **CrackingWall**.

---

*CrackingWall · Creative Tools Lab — "Analyze visuals · Generate ideas · Build experiences."*
