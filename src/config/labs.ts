/**
 * Single source of truth for the Labs (interactive tools).
 *
 * Header.tsx and layout/Sidebar.astro both render this list. They draw icons
 * differently — the header uses lucide-react components, the sidebar inlines
 * stroke SVG — so this module carries only the data, and each component maps
 * `icon` to its own renderer.
 *
 * Adding a tool here puts it in the header dropdown AND the sidebar. Before
 * this existed the two lists drifted and /3d-lab/ was missing from the header
 * entirely, leaving the site's flagship tool reachable only from the sidebar.
 */
export interface Lab {
  label: string;
  href: string;
  /** One-line summary shown under the label in the header dropdown. */
  description: string;
  /** Neon accent token — see accentBg/accentText maps in Sidebar.astro. */
  accent: 'cyan' | 'green' | 'pink' | 'purple' | 'yellow';
  /** Icon key — each consumer maps this to its own icon set. */
  icon: string;
}

export const LABS: Lab[] = [
  {
    label: 'ASCII Lab',
    href: '/ascii-lab/',
    description: 'Video → ASCII art converter',
    accent: 'green',
    icon: 'terminal',
  },
  {
    label: 'Visual Protocol',
    href: '/visual-protocol/',
    description: 'AI image analysis tool',
    accent: 'pink',
    icon: 'scan',
  },
  {
    label: '3D Lab',
    href: '/3d-lab/',
    description: 'Text & SVG → interactive 3D',
    accent: 'yellow',
    icon: 'cube',
  },
  {
    label: 'SVG Optimizer',
    href: '/svg-optimizer/',
    description: 'Shrink SVG files, same output',
    accent: 'green',
    icon: 'minimize',
  },
  {
    label: '3D Text Generator',
    href: '/3d-text-generator/',
    description: 'Word → 3D wordmark',
    accent: 'yellow',
    icon: 'type',
  },
];
