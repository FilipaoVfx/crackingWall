// Self-contained worker — no imports (avoids bundler edge-cases)

interface CalibratedRamp {
  /** Unique chars sorted from least → most ink coverage. */
  chars: string[];
  /** Coverage of each char, normalized to 0..1 (parallel to `chars`). */
  levels: number[];
}

/**
 * Measure the real ink coverage of every glyph by rendering it to an
 * OffscreenCanvas, then build a perceptual ramp sorted by coverage.
 *
 * This is what makes any charset faithful: instead of assuming characters are
 * evenly spaced in density, we map luminance to the glyph whose actual coverage
 * matches. Falls back to the raw charset order if OffscreenCanvas is missing.
 */
function calibrateCharset(charset: string): CalibratedRamp {
  // Dedupe while preserving the author's chars
  const unique = Array.from(new Set(charset.split('')));

  if (typeof OffscreenCanvas === 'undefined') {
    // Fallback: assume evenly spaced (legacy behaviour)
    const n = unique.length;
    return { chars: unique, levels: unique.map((_, i) => (n === 1 ? 0 : i / (n - 1))) };
  }

  // Cell roughly matching a monospace glyph box (~0.5 aspect)
  const CW = 12;
  const CH = 22;
  const cv = new OffscreenCanvas(CW, CH);
  const cx = cv.getContext('2d', { willReadFrequently: true })!;
  cx.font = `${Math.round(CH * 0.82)}px "Courier New", monospace`;
  cx.textAlign = 'center';
  cx.textBaseline = 'middle';

  const raw: { ch: string; cov: number }[] = [];
  for (const ch of unique) {
    cx.fillStyle = '#000';
    cx.fillRect(0, 0, CW, CH);
    cx.fillStyle = '#fff';
    cx.fillText(ch, CW / 2, CH / 2);
    const d = cx.getImageData(0, 0, CW, CH).data;
    let sum = 0;
    for (let i = 0; i < d.length; i += 4) sum += d[i]; // white-on-black → R == coverage
    raw.push({ ch, cov: sum / (CW * CH * 255) });
  }

  raw.sort((a, b) => a.cov - b.cov);

  // Normalize coverage to use the full 0..1 range
  const min = raw[0].cov;
  const max = raw[raw.length - 1].cov;
  const span = max - min || 1;

  return {
    chars: raw.map((r) => r.ch),
    levels: raw.map((r) => (r.cov - min) / span),
  };
}

/** Pick the index of the calibrated level closest to a target value (0..1). */
function nearestLevel(levels: number[], target: number): number {
  let lo = 0;
  let hi = levels.length - 1;
  // levels are sorted ascending — binary search for closest
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (levels[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  if (lo > 0 && Math.abs(levels[lo - 1] - target) <= Math.abs(levels[lo] - target)) {
    return lo - 1;
  }
  return lo;
}

interface ToneOpts {
  brightness: number;
  contrast: number;
  gamma: number;
  invert: boolean;
}

/** Apply brightness/contrast/gamma/invert to a normalized luminance (0..1). */
function tone(v: number, o: ToneOpts): number {
  v = (v - 0.5) * o.contrast + 0.5 + o.brightness;
  if (v < 0) v = 0;
  else if (v > 1) v = 1;
  if (o.gamma !== 1) v = Math.pow(v, 1 / o.gamma);
  if (o.invert) v = 1 - v;
  return v;
}

function convertFrame(
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
  ramp: CalibratedRamp,
  tn: ToneOpts,
  dither: boolean,
): string {
  const { chars, levels } = ramp;

  // Precompute toned luminance buffer (so error diffusion can write into it)
  const buf = new Float32Array(width * height);
  for (let p = 0, i = 0; p < buf.length; p++, i += 4) {
    // Rec.601 luma on sRGB-encoded pixels (standard ASCII luma)
    const g = (rgba[i] * 0.299 + rgba[i + 1] * 0.587 + rgba[i + 2] * 0.114) / 255;
    buf[p] = tone(g, tn);
  }

  const lines: string[] = [];
  for (let y = 0; y < height; y++) {
    let line = '';
    for (let x = 0; x < width; x++) {
      const p = y * width + x;
      let v = buf[p];
      if (v < 0) v = 0;
      else if (v > 1) v = 1;

      const idx = nearestLevel(levels, v);
      line += chars[idx];

      if (dither) {
        // Floyd–Steinberg error diffusion across the calibrated levels
        const err = v - levels[idx];
        if (x + 1 < width) buf[p + 1] += err * (7 / 16);
        if (y + 1 < height) {
          if (x > 0) buf[p + width - 1] += err * (3 / 16);
          buf[p + width] += err * (5 / 16);
          if (x + 1 < width) buf[p + width + 1] += err * (1 / 16);
        }
      }
    }
    lines.push(line);
  }
  return lines.join('\n');
}

self.onmessage = (e: MessageEvent) => {
  const { type, pixels, width, height, charset, brightness, contrast, gamma, dither, invert } = e.data;
  if (type !== 'convert') return;

  try {
    const ramp = calibrateCharset(charset);
    const tn: ToneOpts = {
      brightness: brightness ?? 0,
      contrast: contrast ?? 1,
      gamma: gamma ?? 1,
      invert: !!invert,
    };
    const useDither = dither !== false;

    const total = pixels.length;
    const frames: string[] = [];

    for (let i = 0; i < total; i++) {
      const rgba = new Uint8ClampedArray(pixels[i]);
      frames.push(convertFrame(rgba, width, height, ramp, tn, useDither));
      if ((i + 1) % 5 === 0 || i === total - 1) {
        self.postMessage({ type: 'progress', progress: ((i + 1) / total) * 100 });
      }
    }

    self.postMessage({ type: 'done', frames });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Worker error';
    self.postMessage({ type: 'error', error: msg });
  }
};
