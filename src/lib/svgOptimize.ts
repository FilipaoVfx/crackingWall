/**
 * Conservative SVG optimizer — pure string transforms, no DOM, no deps.
 *
 * Design rule: never change what the file LOOKS like. Every pass below either
 * removes bytes that cannot affect rendering (comments, editor metadata) or
 * shortens numbers within a precision the user picks. Passes that commonly
 * break files in other optimizers — merging paths, collapsing groups,
 * rewriting IDs, dropping "unused" defs — are deliberately absent, because a
 * gradient or filter reference that looks unused to a regex usually isn't.
 *
 * Runs in the browser; the file never leaves the device.
 */

export interface OptimizeOptions {
  /** Decimal places kept on path/coordinate numbers. */
  precision: number;
  /** Strip <title> and <desc>. Off by default — they carry accessibility text. */
  removeTitleDesc: boolean;
  /** Strip width/height so the SVG scales to its container (viewBox is kept). */
  removeDimensions: boolean;
}

export const DEFAULT_OPTIONS: OptimizeOptions = {
  precision: 2,
  removeTitleDesc: false,
  removeDimensions: false,
};

export interface OptimizeResult {
  svg: string;
  originalBytes: number;
  optimizedBytes: number;
  /** 0-100, share of the original size removed. */
  savedPercent: number;
  /** Human-readable list of what each pass removed. */
  notes: string[];
}

const byteLength = (s: string): number =>
  typeof TextEncoder !== 'undefined' ? new TextEncoder().encode(s).length : s.length;

/** Editor-specific namespaces that never affect rendering. */
const EDITOR_NS = ['inkscape', 'sodipodi', 'sketch', 'figma', 'adobe', 'graph', 'i', 'x'];

/**
 * Round every decimal number in the string to `precision` places.
 * Only touches numbers — never identifiers — because it requires a digit
 * before or after the dot and preserves any sign.
 */
function roundNumbers(svg: string, precision: number): string {
  return svg.replace(/-?\d*\.\d+(?:e-?\d+)?/gi, (m) => {
    const n = Number(m);
    if (!Number.isFinite(n)) return m;
    const rounded = Number(n.toFixed(precision));
    // Drop the leading zero: 0.5 -> .5, -0.5 -> -.5
    return String(rounded).replace(/^(-?)0\./, '$1.');
  });
}

/** Remove one XML element (with its content) by tag name. */
function stripTag(svg: string, tag: string): string {
  const paired = new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi');
  const selfClosing = new RegExp(`<${tag}\\b[^>]*\\/>`, 'gi');
  return svg.replace(paired, '').replace(selfClosing, '');
}

/**
 * Optimize an SVG string. Returns the result plus a note per pass that
 * actually changed something, so the UI can say what it did rather than just
 * showing a number.
 */
export function optimizeSvg(input: string, opts: Partial<OptimizeOptions> = {}): OptimizeResult {
  const o = { ...DEFAULT_OPTIONS, ...opts };
  const originalBytes = byteLength(input);
  const notes: string[] = [];
  let svg = input;

  const note = (before: string, after: string, label: string) => {
    if (before !== after) notes.push(label);
  };

  // XML prolog and doctype — the browser does not need either for inline or
  // <img> use, and they are pure overhead in a web asset.
  let prev = svg;
  svg = svg.replace(/<\?xml[\s\S]*?\?>/gi, '').replace(/<!DOCTYPE[\s\S]*?>/gi, '');
  note(prev, svg, 'XML prolog / doctype');

  prev = svg;
  svg = svg.replace(/<!--[\s\S]*?-->/g, '');
  note(prev, svg, 'Comments');

  prev = svg;
  svg = stripTag(svg, 'metadata');
  note(prev, svg, 'Editor metadata');

  // Scripts, event handlers and javascript: URLs. A size win, and a safety one:
  // an optimized file is usually about to be embedded somewhere, and this tool
  // renders it inline to prove the output still looks right.
  prev = svg;
  svg = stripTag(svg, 'script')
    .replace(/\son\w+\s*=\s*(["'])[\s\S]*?\1/gi, '')
    // href/xlink:href pointing at javascript: — the entity forms too, since
    // "java&#115;cript:" resolves the same way in a browser.
    .replace(/\s(?:xlink:)?href\s*=\s*(["'])\s*(?:javascript|data:text\/html)[\s\S]*?\1/gi, '')
    .replace(/\s(?:xlink:)?href\s*=\s*(["'])[^"']*&#[^"']*\1/gi, '');
  note(prev, svg, 'Scripts and inline handlers');

  // Editor namespace declarations and their attributes.
  prev = svg;
  for (const ns of EDITOR_NS) {
    svg = svg
      .replace(new RegExp(`\\sxmlns:${ns}\\s*=\\s*(["'])[\\s\\S]*?\\1`, 'gi'), '')
      .replace(new RegExp(`\\s${ns}:[\\w-]+\\s*=\\s*(["'])[\\s\\S]*?\\1`, 'gi'), '');
  }
  note(prev, svg, 'Editor-specific attributes');

  if (o.removeTitleDesc) {
    prev = svg;
    svg = stripTag(svg, 'title');
    svg = stripTag(svg, 'desc');
    note(prev, svg, 'Title and description');
  }

  if (o.removeDimensions) {
    prev = svg;
    // Only safe when a viewBox remains to define the coordinate system.
    if (/viewBox\s*=/i.test(svg)) {
      svg = svg.replace(/<svg\b([^>]*)>/i, (m, attrs: string) =>
        `<svg${attrs.replace(/\s(width|height)\s*=\s*(["'])[^"']*\2/gi, '')}>`,
      );
    }
    note(prev, svg, 'Fixed width/height');
  }

  prev = svg;
  svg = roundNumbers(svg, o.precision);
  note(prev, svg, `Numbers rounded to ${o.precision} decimals`);

  // Whitespace: collapse runs, drop it between tags, trim attribute padding.
  prev = svg;
  svg = svg
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+\/>/g, '/>')
    .trim();
  note(prev, svg, 'Whitespace');

  const optimizedBytes = byteLength(svg);
  return {
    svg,
    originalBytes,
    optimizedBytes,
    savedPercent: originalBytes > 0 ? Math.max(0, ((originalBytes - optimizedBytes) / originalBytes) * 100) : 0,
    notes,
  };
}

/** Format a byte count for display (1024-based, one decimal above 1 KB). */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
