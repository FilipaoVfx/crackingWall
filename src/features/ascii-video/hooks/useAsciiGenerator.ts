import { useState, useRef, useCallback } from 'react';
import type { AsciiConfig, GeneratorState, WorkerOutMessage } from '../core/types';
import { validateVideo } from '../core/video-preprocess';
import { extractFrames } from '../core/ascii-convert';
import { CHARSETS, DEFAULT_CHARSET } from '../utils/charset';

const INITIAL_STATE: GeneratorState = {
  status: 'idle',
  progress: 0,
  frames: [],
  fps: 10,
};

export function useAsciiGenerator() {
  const [state, setState] = useState<GeneratorState>(INITIAL_STATE);
  const [config, setConfig] = useState<AsciiConfig>({
    fps: 10,
    width: 120,
    charset: CHARSETS[DEFAULT_CHARSET],
    brightness: 0,
    contrast: 1,
    gamma: 1,
    dither: true,
    invert: false,
    edges: false,
    edgeThreshold: 0.4,
  });

  const workerRef = useRef<Worker | null>(null);
  const abortRef = useRef({ aborted: false });

  const reset = useCallback(() => {
    abortRef.current.aborted = true;
    workerRef.current?.terminate();
    workerRef.current = null;
    abortRef.current = { aborted: false };
    setState(INITIAL_STATE);
  }, []);

  const generate = useCallback(async (file: File) => {
    // Clean up previous run
    workerRef.current?.terminate();
    abortRef.current = { aborted: false };

    // --- Validate ---
    setState({ ...INITIAL_STATE, status: 'validating' });
    const validation = await validateVideo(file);
    if (!validation.valid) {
      setState({ ...INITIAL_STATE, status: 'error', error: validation.error });
      return;
    }

    // --- Extract frames ---
    setState((s) => ({ ...s, status: 'extracting', progress: 0 }));
    let extracted: Awaited<ReturnType<typeof extractFrames>>;
    try {
      extracted = await extractFrames(
        file,
        config,
        (p) => setState((s) => ({ ...s, progress: p * 0.5 })), // 0-50%
        abortRef.current,
      );
    } catch (err: unknown) {
      if (abortRef.current.aborted) return;
      const msg = err instanceof Error ? err.message : 'Error extrayendo frames';
      setState((s) => ({ ...s, status: 'error', error: msg }));
      return;
    }

    if (abortRef.current.aborted) return;

    // --- Convert via Worker ---
    setState((s) => ({ ...s, status: 'converting', progress: 50 }));

    const worker = new Worker(
      new URL('../workers/ascii.worker.ts', import.meta.url),
      { type: 'module' },
    );
    workerRef.current = worker;

    worker.postMessage(
      {
        type: 'convert',
        pixels: extracted.pixels,
        width: extracted.width,
        height: extracted.height,
        charset: config.charset,
        brightness: config.brightness,
        contrast: config.contrast,
        gamma: config.gamma,
        dither: config.dither,
        invert: config.invert,
        edges: config.edges,
        edgeThreshold: config.edgeThreshold,
      },
      extracted.pixels, // transfer ownership
    );

    worker.onmessage = (e: MessageEvent<WorkerOutMessage>) => {
      const msg = e.data;
      switch (msg.type) {
        case 'progress':
          setState((s) => ({ ...s, progress: 50 + (msg.progress! * 0.5) }));
          break;
        case 'done':
          setState({
            status: 'done',
            progress: 100,
            frames: msg.frames!,
            fps: config.fps,
          });
          worker.terminate();
          break;
        case 'error':
          setState((s) => ({ ...s, status: 'error', error: msg.error }));
          worker.terminate();
          break;
      }
    };

    worker.onerror = (err) => {
      setState((s) => ({ ...s, status: 'error', error: err.message || 'Worker crash' }));
    };
  }, [config]);

  const cancel = useCallback(() => {
    abortRef.current.aborted = true;
    workerRef.current?.terminate();
    workerRef.current = null;
    setState(INITIAL_STATE);
  }, []);

  return { state, config, setConfig, generate, cancel, reset };
}
