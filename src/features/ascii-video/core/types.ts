export interface AsciiConfig {
  fps: number;
  width: number;
  charset: string;
  /** Brightness offset applied to normalized luminance, -0.5..0.5 (default 0). */
  brightness: number;
  /** Contrast multiplier around mid-gray, 0.5..2 (default 1). */
  contrast: number;
  /** Gamma applied to luminance; >1 lifts midtones (default 1). */
  gamma: number;
  /** Floyd–Steinberg error diffusion for faithful tonal gradients (default true). */
  dither: boolean;
  /** Invert mapping (for light backgrounds / negative look). */
  invert: boolean;
  /** Overlay directional edge glyphs ( | / - \ ) detected via blur+Sobel. */
  edges: boolean;
  /** Normalized gradient magnitude above which a cell becomes an edge, 0..1. */
  edgeThreshold: number;
}

export type GeneratorStatus = 'idle' | 'validating' | 'extracting' | 'converting' | 'done' | 'error';

export interface GeneratorState {
  status: GeneratorStatus;
  progress: number;
  frames: string[];
  fps: number;
  error?: string;
}

// Main thread → Worker
export interface WorkerConvertMessage {
  type: 'convert';
  pixels: ArrayBuffer[];
  width: number;
  height: number;
  charset: string;
  brightness: number;
  contrast: number;
  gamma: number;
  dither: boolean;
  invert: boolean;
  edges: boolean;
  edgeThreshold: number;
}

// Worker → Main thread
export interface WorkerProgressMessage {
  type: 'progress';
  progress: number;
}

export interface WorkerDoneMessage {
  type: 'done';
  frames: string[];
}

export interface WorkerErrorMessage {
  type: 'error';
  error: string;
}

export type WorkerOutMessage = WorkerProgressMessage | WorkerDoneMessage | WorkerErrorMessage;
