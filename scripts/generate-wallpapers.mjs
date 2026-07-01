/**
 * CrackingWall — original wallpaper generator.
 *
 * Produces the site's own, self-hosted wallpapers as generative vector art
 * (rendered to high-res WebP with sharp). No stock/third-party imagery.
 *
 * Usage:  node scripts/generate-wallpapers.mjs
 * Output: public/wallpapers/<slug>.webp  +  prints JSON entries for wallpapers.json
 */
import sharp from 'sharp';
import { mkdirSync, writeFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, '../public/wallpapers');
mkdirSync(OUT_DIR, { recursive: true });

const W = 3840;
const H = 2160;

const C = {
  black: '#0a0a0f',
  deeper: '#06060a',
  cyan: '#00fff9',
  purple: '#b026ff',
  pink: '#ff3ea5',
  green: '#39ff14',
  yellow: '#f5f500',
  blue: '#2b6bff',
};

// --- deterministic RNG (mulberry32 seeded from a string) ---
function seedFrom(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h = (h ^= h >>> 16) >>> 0;
    return h / 4294967296;
  };
}
const lerp = (a, b, t) => a + (b - a) * t;

// soft radial glow via gradient (no SVG filters → reliable rasterization)
function glow(id, cx, cy, r, color, opacity = 0.9) {
  return {
    def: `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${color}" stop-opacity="${opacity}"/>
      <stop offset="45%" stop-color="${color}" stop-opacity="${opacity * 0.35}"/>
      <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
    </radialGradient>`,
    rect: `<rect x="0" y="0" width="${W}" height="${H}" fill="url(#${id})"/>`,
    circle: `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id})"/>`,
  };
}

const vignette = `<radialGradient id="vig" cx="50%" cy="45%" r="75%">
    <stop offset="55%" stop-color="#000" stop-opacity="0"/>
    <stop offset="100%" stop-color="#000" stop-opacity="0.55"/>
  </radialGradient>`;
const vignetteRect = `<rect x="0" y="0" width="${W}" height="${H}" fill="url(#vig)"/>`;

// faint dot grid overlay for cohesion
function dotGrid(step = 80, color = '#ffffff', op = 0.04) {
  let d = '';
  for (let y = step; y < H; y += step)
    for (let x = step; x < W; x += step) d += `<circle cx="${x}" cy="${y}" r="1.5"/>`;
  return `<g fill="${color}" opacity="${op}">${d}</g>`;
}

const svgDoc = (defs, body, bg = C.black) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>${defs}</defs>
    <rect width="${W}" height="${H}" fill="${bg}"/>
    ${body}
  </svg>`;

// ---------------------------------------------------------------- generators
function cyberpunkGrid(seed) {
  const r = seedFrom(seed);
  const horizon = H * 0.52;
  const sun = glow('sun', W / 2, horizon, 620, C.pink, 1);
  const sky = glow('sky', W / 2, 0, H, C.purple, 0.5);
  // sun body with scanline cuts
  let sunBody = `<circle cx="${W / 2}" cy="${horizon}" r="420" fill="url(#sunfill)"/>`;
  for (let i = 0; i < 9; i++) {
    const y = horizon - 40 + i * 34;
    sunBody += `<rect x="${W / 2 - 460}" y="${y}" width="920" height="${8 + i * 3}" fill="${C.black}" opacity="0.9"/>`;
  }
  // perspective floor
  let floor = '';
  const vpx = W / 2;
  for (let i = -16; i <= 16; i++) {
    const x2 = vpx + i * (W / 12);
    floor += `<line x1="${vpx}" y1="${horizon}" x2="${x2}" y2="${H}" stroke="${C.cyan}" stroke-width="2" opacity="0.35"/>`;
  }
  for (let i = 1; i <= 16; i++) {
    const t = i / 16;
    const y = lerp(horizon, H, t * t);
    floor += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${C.cyan}" stroke-width="${1 + t * 3}" opacity="${0.15 + t * 0.4}"/>`;
  }
  // stars
  let stars = '';
  for (let i = 0; i < 120; i++) {
    const x = r() * W, y = r() * horizon * 0.9, s = r() * 2 + 0.5;
    stars += `<circle cx="${x}" cy="${y}" r="${s}" fill="#fff" opacity="${0.2 + r() * 0.6}"/>`;
  }
  const defs = `${sky.def}${sun.def}
    <radialGradient id="sunfill" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${C.yellow}"/>
      <stop offset="55%" stop-color="${C.pink}"/>
      <stop offset="100%" stop-color="${C.purple}"/>
    </radialGradient>${vignette}`;
  const body = `${sky.rect}${stars}${sun.circle}${sunBody}
    <rect x="0" y="${horizon}" width="${W}" height="${H - horizon}" fill="${C.deeper}"/>
    ${floor}${vignetteRect}`;
  return svgDoc(defs, body, C.black);
}

function circuit(seed) {
  const r = seedFrom(seed);
  let traces = '', pads = '';
  const step = 120;
  for (let i = 0; i < 46; i++) {
    let x = Math.round((r() * W) / step) * step;
    let y = Math.round((r() * H) / step) * step;
    let d = `M ${x} ${y}`;
    const segs = 3 + Math.floor(r() * 5);
    for (let s = 0; s < segs; s++) {
      if (r() > 0.5) x += (r() > 0.5 ? 1 : -1) * step * (1 + Math.floor(r() * 3));
      else y += (r() > 0.5 ? 1 : -1) * step * (1 + Math.floor(r() * 3));
      x = Math.max(60, Math.min(W - 60, x));
      y = Math.max(60, Math.min(H - 60, y));
      d += ` L ${x} ${y}`;
    }
    const col = r() > 0.5 ? C.green : C.cyan;
    traces += `<path d="${d}" fill="none" stroke="${col}" stroke-width="3" opacity="${0.25 + r() * 0.4}" stroke-linejoin="round" stroke-linecap="round"/>`;
    pads += `<circle cx="${x}" cy="${y}" r="7" fill="${col}" opacity="0.9"/>`;
  }
  // central chip
  const cw = 620, ch = 620, cx = W / 2 - cw / 2, cy = H / 2 - ch / 2;
  let chip = `<rect x="${cx}" y="${cy}" width="${cw}" height="${ch}" rx="24" fill="#0d0d13" stroke="${C.cyan}" stroke-width="4" opacity="0.9"/>`;
  chip += `<rect x="${cx + 70}" y="${cy + 70}" width="${cw - 140}" height="${ch - 140}" rx="12" fill="none" stroke="${C.green}" stroke-width="2" opacity="0.5"/>`;
  for (let i = 0; i < 10; i++) {
    const t = (i + 0.5) / 10;
    chip += `<rect x="${lerp(cx, cx + cw, t) - 8}" y="${cy - 34}" width="16" height="34" fill="${C.cyan}" opacity="0.7"/>`;
    chip += `<rect x="${lerp(cx, cx + cw, t) - 8}" y="${cy + ch}" width="16" height="34" fill="${C.cyan}" opacity="0.7"/>`;
    chip += `<rect x="${cx - 34}" y="${lerp(cy, cy + ch, t) - 8}" width="34" height="16" fill="${C.green}" opacity="0.7"/>`;
    chip += `<rect x="${cx + cw}" y="${lerp(cy, cy + ch, t) - 8}" width="34" height="16" fill="${C.green}" opacity="0.7"/>`;
  }
  const g = glow('cg', W / 2, H / 2, 900, C.cyan, 0.28);
  const defs = `${g.def}${vignette}`;
  const body = `${g.rect}${dotGrid(90, C.cyan, 0.05)}${traces}${pads}${chip}${vignetteRect}`;
  return svgDoc(defs, body, C.deeper);
}

function minimalArc(seed) {
  const g = glow('ma', W * 0.32, H * 0.5, 520, C.cyan, 0.5);
  const defs = `${g.def}${vignette}
    <linearGradient id="arcstroke" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${C.cyan}"/>
      <stop offset="100%" stop-color="${C.purple}"/>
    </linearGradient>`;
  const body = `${g.rect}
    <circle cx="${W * 0.32}" cy="${H * 0.5}" r="520" fill="none" stroke="url(#arcstroke)" stroke-width="6" opacity="0.9"/>
    <circle cx="${W * 0.32}" cy="${H * 0.5}" r="470" fill="none" stroke="${C.cyan}" stroke-width="1.5" opacity="0.3"/>
    <circle cx="${W * 0.72}" cy="${H * 0.34}" r="10" fill="${C.pink}"/>
    <circle cx="${W * 0.72}" cy="${H * 0.34}" r="26" fill="none" stroke="${C.pink}" stroke-width="2" opacity="0.5"/>
    ${vignetteRect}`;
  return svgDoc(defs, body, C.black);
}

function abstractShards(seed) {
  const r = seedFrom(seed);
  const cols = [C.cyan, C.purple, C.pink, C.blue];
  let shards = '';
  for (let i = 0; i < 7; i++) {
    const cx = r() * W, cy = r() * H, s = 500 + r() * 900;
    const pts = [];
    const n = 3 + Math.floor(r() * 2);
    for (let k = 0; k < n; k++) {
      const a = r() * Math.PI * 2;
      pts.push(`${(cx + Math.cos(a) * s).toFixed(0)},${(cy + Math.sin(a) * s * (0.6 + r() * 0.6)).toFixed(0)}`);
    }
    const col = cols[Math.floor(r() * cols.length)];
    shards += `<polygon points="${pts.join(' ')}" fill="${col}" opacity="${0.10 + r() * 0.12}"/>`;
    shards += `<polygon points="${pts.join(' ')}" fill="none" stroke="${col}" stroke-width="2" opacity="0.35"/>`;
  }
  const g1 = glow('as1', W * 0.3, H * 0.35, 900, C.purple, 0.5);
  const g2 = glow('as2', W * 0.72, H * 0.7, 800, C.cyan, 0.4);
  const defs = `${g1.def}${g2.def}${vignette}`;
  const body = `${g1.rect}${g2.rect}${shards}${vignetteRect}`;
  return svgDoc(defs, body, C.deeper);
}

function topographic(seed) {
  const r = seedFrom(seed);
  const cx = W * 0.5, cy = H * 0.5;
  let lines = '';
  const rings = 26;
  for (let i = rings; i >= 1; i--) {
    const rad = (i / rings) * (W * 0.62);
    const pts = [];
    const steps = 120;
    for (let s = 0; s <= steps; s++) {
      const a = (s / steps) * Math.PI * 2;
      const wob = 1 + 0.16 * Math.sin(a * 3 + i * 0.5) + 0.10 * Math.sin(a * 7 + i);
      const x = cx + Math.cos(a) * rad * wob;
      const y = cy + Math.sin(a) * rad * wob * 0.62;
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    const t = i / rings;
    const col = t > 0.5 ? C.green : C.cyan;
    lines += `<polygon points="${pts.join(' ')}" fill="none" stroke="${col}" stroke-width="${1 + (1 - t) * 2}" opacity="${0.15 + (1 - t) * 0.45}"/>`;
  }
  const g = glow('tp', cx, cy, 700, C.green, 0.32);
  const defs = `${g.def}
    <linearGradient id="tpbg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#04120c"/>
      <stop offset="100%" stop-color="${C.deeper}"/>
    </linearGradient>${vignette}`;
  const body = `<rect width="${W}" height="${H}" fill="url(#tpbg)"/>${g.rect}${lines}${vignetteRect}`;
  return svgDoc(defs, body, C.deeper);
}

function darkVoid(seed) {
  const r = seedFrom(seed);
  const g = glow('dv', W * 0.5, H * 1.02, 1200, C.purple, 0.5);
  let stars = '';
  for (let i = 0; i < 70; i++)
    stars += `<circle cx="${r() * W}" cy="${r() * H * 0.8}" r="${r() * 1.6 + 0.4}" fill="#fff" opacity="${0.1 + r() * 0.4}"/>`;
  const defs = `${g.def}${vignette}`;
  const body = `${dotGrid(70, C.cyan, 0.035)}${stars}${g.rect}
    <line x1="0" y1="${H * 0.7}" x2="${W}" y2="${H * 0.7}" stroke="${C.cyan}" stroke-width="1.5" opacity="0.25"/>
    <circle cx="${W * 0.5}" cy="${H * 0.7}" r="8" fill="${C.cyan}"/>
    <circle cx="${W * 0.5}" cy="${H * 0.7}" r="26" fill="none" stroke="${C.cyan}" stroke-width="2" opacity="0.4"/>
    ${vignetteRect}`;
  return svgDoc(defs, body, C.black);
}

function dataRain(seed) {
  const r = seedFrom(seed);
  let cols = '';
  const colW = 26;
  for (let x = 0; x < W; x += colW * 2) {
    if (r() > 0.62) continue;
    const len = 300 + r() * 1400;
    const y = r() * (H - 200);
    const col = r() > 0.3 ? C.green : C.cyan;
    const id = `rain${x}`;
    cols += `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${col}" stop-opacity="0"/>
      <stop offset="80%" stop-color="${col}" stop-opacity="${0.4 + r() * 0.4}"/>
      <stop offset="100%" stop-color="#fff" stop-opacity="0.9"/>
    </linearGradient>`;
    cols += `<rect x="${x}" y="${y}" width="${colW}" height="${len}" fill="url(#${id})" data-rect="1"/>`;
  }
  // split defs vs rects
  const defs = cols.match(/<linearGradient[\s\S]*?<\/linearGradient>/g)?.join('') || '';
  const rects = cols.match(/<rect[^>]*data-rect="1"\/>/g)?.join('') || '';
  const g = glow('dr', W * 0.5, H * 0.5, 1100, C.green, 0.14);
  const body = `${g.rect}${rects}${vignetteRect}`;
  return svgDoc(`${defs}${g.def}${vignette}`, body, C.black);
}

function isoBlocks(seed) {
  const r = seedFrom(seed);
  const iso = (x, y, z) => [x - z, (x + z) * 0.5 - y]; // simple iso projection
  const unit = 150;
  const ox = W * 0.5, oy = H * 0.32;
  let blocks = '';
  const cells = [];
  for (let gx = -6; gx <= 6; gx++)
    for (let gz = -6; gz <= 6; gz++) {
      if (r() > 0.5) continue;
      cells.push([gx, gz, 1 + Math.floor(r() * 4)]);
    }
  cells.sort((a, b) => a[0] + a[1] - (b[0] + b[1]));
  for (const [gx, gz, hgt] of cells) {
    const h = hgt * unit * 0.7;
    const bx = gx * unit, bz = gz * unit;
    const [x0, y0] = iso(bx, 0, bz);
    const [x1, y1] = iso(bx + unit, 0, bz);
    const [x2, y2] = iso(bx + unit, 0, bz + unit);
    const [x3, y3] = iso(bx, 0, bz + unit);
    const P = (px, py) => `${(ox + px).toFixed(1)},${(oy + py).toFixed(1)}`;
    const col = r() > 0.5 ? C.cyan : C.purple;
    // top face
    blocks += `<polygon points="${P(x0, y0 - h)} ${P(x1, y1 - h)} ${P(x2, y2 - h)} ${P(x3, y3 - h)}" fill="${col}" opacity="0.12" stroke="${col}" stroke-width="2"/>`;
    // left + right faces (wire)
    blocks += `<polygon points="${P(x0, y0 - h)} ${P(x3, y3 - h)} ${P(x3, y3)} ${P(x0, y0)}" fill="#000" opacity="0.25" stroke="${col}" stroke-width="1.5"/>`;
    blocks += `<polygon points="${P(x3, y3 - h)} ${P(x2, y2 - h)} ${P(x2, y2)} ${P(x3, y3)}" fill="#000" opacity="0.4" stroke="${col}" stroke-width="1.5"/>`;
  }
  const g = glow('ib', W * 0.5, H * 0.5, 1100, C.purple, 0.3);
  const defs = `${g.def}
    <linearGradient id="ibbg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0a0716"/>
      <stop offset="100%" stop-color="${C.deeper}"/>
    </linearGradient>${vignette}`;
  const body = `<rect width="${W}" height="${H}" fill="url(#ibbg)"/>${g.rect}${blocks}${vignetteRect}`;
  return svgDoc(defs, body, C.deeper);
}

const GEN = {
  'cyberpunk-grid': cyberpunkGrid,
  circuit,
  'minimal-arc': minimalArc,
  'abstract-shards': abstractShards,
  topographic,
  'dark-void': darkVoid,
  'data-rain': dataRain,
  'iso-blocks': isoBlocks,
};

// ---------------------------------------------------------------- catalog
const WALLPAPERS = [
  { slug: 'neon-grid-horizon', type: 'cyberpunk-grid', category: 'Cyberpunk',
    title: 'Neon Grid Horizon',
    description: 'An original synthwave composition — a perspective neon grid running to a scanline sun. Built in-house as vector art for crisp scaling on any display.',
    tags: ['cyberpunk', 'synthwave', 'neon', 'grid', 'retro'] },
  { slug: 'signal-rain', type: 'data-rain', category: 'Cyberpunk',
    title: 'Signal Rain',
    description: 'Abstract falling data columns in neon green and cyan — a nod to terminal culture, generated from our own code rather than sourced from stock.',
    tags: ['cyberpunk', 'matrix', 'code', 'green', 'dark'] },
  { slug: 'circuit-bloom', type: 'circuit', category: 'Tech Culture',
    title: 'Circuit Bloom',
    description: 'A stylized printed-circuit layout with a glowing central chip and routed traces. Original generative artwork celebrating hardware aesthetics.',
    tags: ['tech', 'circuit', 'pcb', 'hardware', 'cyan'] },
  { slug: 'lattice-city', type: 'iso-blocks', category: 'Tech Culture',
    title: 'Lattice City',
    description: 'An isometric wireframe skyline of neon blocks — a quiet, geometric take on the machine city. Rendered in-house to high-resolution WebP.',
    tags: ['tech', 'isometric', 'wireframe', 'city', 'geometric'] },
  { slug: 'single-signal', type: 'minimal-arc', category: 'Minimalist',
    title: 'Single Signal',
    description: 'A minimalist study: one luminous arc and a lone accent node in vast negative space. Designed for focus and low visual noise on the desktop.',
    tags: ['minimalist', 'clean', 'neon', 'dark', 'focus'] },
  { slug: 'prism-drift', type: 'abstract-shards', category: 'Abstract',
    title: 'Prism Drift',
    description: 'Overlapping translucent neon shards drifting over a deep field — an original abstract piece exploring additive color and geometry.',
    tags: ['abstract', 'geometric', 'neon', 'gradient', 'color'] },
  { slug: 'contour-field', type: 'topographic', category: 'Nature',
    title: 'Contour Field',
    description: 'Topographic contour lines rendered in neon green — the shape of terrain reduced to pure line work. Generated procedurally, self-hosted, original.',
    tags: ['nature', 'topographic', 'contour', 'green', 'lines'] },
  { slug: 'deep-void', type: 'dark-void', category: 'Dark',
    title: 'Deep Void',
    description: 'A near-black expanse with a single horizon node and a distant purple glow. Built for OLED and dark-mode setups where restraint is the point.',
    tags: ['dark', 'oled', 'minimal', 'void', 'purple'] },
];

// ---------------------------------------------------------------- run
const entries = [];
for (const w of WALLPAPERS) {
  const svg = GEN[w.type](w.slug);
  const file = resolve(OUT_DIR, `${w.slug}.webp`);
  await sharp(Buffer.from(svg)).webp({ quality: 82, effort: 6 }).toFile(file);
  const { size } = statSync(file);
  console.log(`✓ ${w.slug}.webp  ${(size / 1024).toFixed(0)} KB`);
  const now = new Date().toISOString();
  entries.push({
    id: w.slug,
    title: w.title,
    description: w.description,
    category: w.category,
    url: `/wallpapers/${w.slug}.webp`,
    alt_text: `${w.title} — original ${w.category.toLowerCase()} wallpaper by CrackingWall`,
    width: W,
    height: H,
    file_size: size,
    format: 'webp',
    created_at: now,
    updated_at: now,
    downloads: 0,
    likes: 0,
    is_featured: ['neon-grid-horizon', 'circuit-bloom', 'prism-drift'].includes(w.slug),
    tags: w.tags,
  });
}
writeFileSync(resolve(__dirname, '../src/content/wallpapers.json'), JSON.stringify(entries, null, 2) + '\n');
console.log(`\nWrote ${entries.length} entries to src/content/wallpapers.json`);
