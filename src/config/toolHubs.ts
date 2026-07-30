/**
 * Sub-hub definitions for the tool pillars (/svg-tools, /3d-tools).
 *
 * Kept as data so the two hub pages share one template instead of duplicating
 * layout, and so adding a tool to a pillar is a one-line change.
 */
export interface HubTool {
  label: string;
  href: string;
  blurb: string;
  /** Short "reach for it when…" line used in the comparison table. */
  useWhen: string;
}

export interface ToolHub {
  slug: string;
  /** H1 and breadcrumb label. */
  name: string;
  title: string;
  description: string;
  /** The front-loaded, citable definition paragraph. */
  intro: string;
  accent: 'green' | 'yellow';
  tools: HubTool[];
  faqs: { q: string; a: string }[];
  guides: { href: string; t: string; d: string }[];
}

export const SVG_TOOLS: ToolHub = {
  slug: 'svg-tools',
  name: 'SVG Tools',
  title: 'SVG Tools — Free Online SVG Optimizer & Converter | Pixelatmos',
  description:
    'Free browser-based SVG tools: optimize and minify SVG files, or convert an SVG into interactive 3D geometry. No upload, no signup.',
  intro:
    'SVG tools are utilities for working with vector graphics — the format behind icons, logos and illustrations on the web. Pixelatmos offers two: an optimizer that strips editor metadata and excess precision to shrink the file without changing how it looks, and the 3D Lab, which reads an SVG and extrudes each shape into real 3D geometry you can export as a model. Both run entirely in your browser, so files stay on your machine.',
  accent: 'green',
  tools: [
    {
      label: 'SVG Optimizer',
      href: '/svg-optimizer/',
      blurb: 'Strips editor metadata, comments and excess decimals. Side-by-side preview so you can confirm nothing shifted.',
      useWhen: 'A file from Figma or Illustrator is heavier than it should be.',
    },
    {
      label: '3D Lab',
      href: '/3d-lab/',
      blurb: 'Turns each shape in an SVG into its own 3D layer with depth, material and colour. Exports PNG or GLB.',
      useWhen: 'You want a flat logo or icon as a real 3D asset.',
    },
  ],
  faqs: [
    { q: 'What is an SVG file?', a: 'SVG (Scalable Vector Graphics) is an XML format that describes an image as shapes and paths rather than pixels. Because it is math, it stays sharp at any size, and because it is text, it compresses well and can be edited in a code editor.' },
    { q: 'Why are my SVG files so large?', a: 'Design tools export a lot the browser never needs: editor metadata, XML prolog, comments, and coordinates carried to ten or more decimal places. Stripping that typically removes 20–60% of the bytes with no visible change.' },
    { q: 'Should I use SVG or PNG?', a: 'SVG for anything geometric — logos, icons, illustrations, charts — because it scales without blurring and usually weighs less. PNG or WebP for photographs and complex textures, where vector paths would be enormous.' },
    { q: 'Are these tools free?', a: 'Yes, all of them, with no account and no watermark.' },
  ],
  guides: [
    { href: '/blog/svg-to-3d-browser-guide/', t: 'SVG to 3D', d: 'Turn any SVG into a 3D model, step by step.' },
  ],
};

export const THREE_D_TOOLS: ToolHub = {
  slug: '3d-tools',
  name: '3D Tools',
  title: '3D Tools — Free Online SVG to 3D & 3D Text Generator | Pixelatmos',
  description:
    'Free browser-based 3D tools: convert SVG to 3D geometry, or turn a word into a 3D wordmark. Export GLB or PNG. No install, no signup.',
  intro:
    '3D tools here mean browser-based generators that turn flat input into real geometry — no modelling software, no install. Pixelatmos offers two: the 3D Lab, which reads an SVG and extrudes every shape into its own sculptable layer, and the 3D Text Generator, which turns a word into an extruded wordmark with a material preset. Both render live with WebGL and export a standard GLB model that opens in Blender, a game engine or an AR viewer.',
  accent: 'yellow',
  tools: [
    {
      label: '3D Lab',
      href: '/3d-lab/',
      blurb: 'Reads an SVG, segments it, and gives every shape its own depth, material and colour. Exports high-quality GLB.',
      useWhen: 'You are starting from a logo or icon file.',
    },
    {
      label: '3D Text Generator',
      href: '/3d-text-generator/',
      blurb: 'Type a word, pick a material, orbit it, export. Built for wordmarks and short titles.',
      useWhen: 'You are starting from a word, not a file.',
    },
  ],
  faqs: [
    { q: 'What is a GLB file?', a: 'GLB is the binary form of glTF, the standard transmission format for 3D scenes. One self-contained file carries geometry, materials and textures, and it opens in Blender, Three.js, Babylon, Windows 3D Viewer and most AR viewers without conversion.' },
    { q: 'Do I need to install anything?', a: 'No. Both tools run in the browser using WebGL, which every current browser supports. Nothing is uploaded and nothing is installed.' },
    { q: 'Can I use these models commercially?', a: 'Yes. What you generate is yours, including for client and commercial work.' },
    { q: 'Why does my model look faceted up close?', a: 'The viewport renders at a lower level of detail so editing stays smooth. The GLB export rebuilds the geometry at high quality, so the downloaded model is crisper than the preview.' },
  ],
  guides: [
    { href: '/blog/svg-to-3d-browser-guide/', t: 'SVG to 3D', d: 'The full walkthrough, step by step.' },
  ],
};
