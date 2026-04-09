export interface AsciiConfig {
  fps: number;
  width: number;
  charset: string;
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
