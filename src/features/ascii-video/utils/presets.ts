import type { AsciiConfig } from '../core/types';
import { CHARSETS } from './charset';

/**
 * Content presets — one click sets charset + tone + edge options together so
 * users don't have to tune every slider. fps/width are left untouched.
 */
export type PresetPatch = Omit<AsciiConfig, 'fps' | 'width'>;

export interface AsciiPreset {
  name: string;
  description: string;
  patch: PresetPatch;
}

export const PRESETS: AsciiPreset[] = [
  {
    name: 'Retro',
    description: 'Classic terminal look — short charset, mild contrast.',
    patch: { charset: CHARSETS.retro, brightness: 0, contrast: 1.1, gamma: 1, dither: true, invert: false, edges: false, edgeThreshold: 0.4 },
  },
  {
    name: 'Photo',
    description: 'Faithful tone — rich charset, lifted midtones, dithered.',
    patch: { charset: CHARSETS.detailed, brightness: 0, contrast: 1.1, gamma: 1.2, dither: true, invert: false, edges: false, edgeThreshold: 0.4 },
  },
  {
    name: 'High Contrast',
    description: 'Punchy blacks & whites — block charset, no dither.',
    patch: { charset: CHARSETS.blocks, brightness: 0, contrast: 1.6, gamma: 0.9, dither: false, invert: false, edges: false, edgeThreshold: 0.4 },
  },
  {
    name: 'Line Art',
    description: 'Edge-aware outlines ( | / - \\ ) over a light fill.',
    patch: { charset: CHARSETS.minimal, brightness: 0, contrast: 1.2, gamma: 1, dither: false, invert: false, edges: true, edgeThreshold: 0.38 },
  },
];
