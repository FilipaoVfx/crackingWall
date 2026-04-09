import type { AsciiConfig } from './types';

const CHAR_ASPECT = 0.55; // monospace chars are ~twice as tall as wide

/**
 * Extract raw frames from a video file using Canvas API.
 * Returns an array of RGBA pixel ArrayBuffers at the target ASCII resolution.
 */
export async function extractFrames(
  file: File,
  config: AsciiConfig,
  onProgress?: (progress: number) => void,
  abortSignal?: { aborted: boolean },
): Promise<{ pixels: ArrayBuffer[]; width: number; height: number }> {
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  const url = URL.createObjectURL(file);

  try {
    video.src = url;
    await new Promise<void>((resolve, reject) => {
      video.onloadeddata = () => resolve();
      video.onerror = () => reject(new Error('Error cargando video'));
    });

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const asciiWidth = config.width;
    const asciiHeight = Math.max(1, Math.round((asciiWidth / (vw / vh)) * CHAR_ASPECT));

    const canvas = document.createElement('canvas');
    canvas.width = asciiWidth;
    canvas.height = asciiHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

    const duration = video.duration;
    const interval = 1 / config.fps;
    const totalFrames = Math.floor(duration * config.fps);
    const pixels: ArrayBuffer[] = [];

    for (let i = 0; i < totalFrames; i++) {
      if (abortSignal?.aborted) throw new Error('Cancelado');

      video.currentTime = i * interval;
      await new Promise<void>((resolve) => {
        video.onseeked = () => resolve();
      });

      ctx.drawImage(video, 0, 0, asciiWidth, asciiHeight);
      const imageData = ctx.getImageData(0, 0, asciiWidth, asciiHeight);
      pixels.push(imageData.data.buffer.slice(0));

      onProgress?.(((i + 1) / totalFrames) * 100);
    }

    return { pixels, width: asciiWidth, height: asciiHeight };
  } finally {
    URL.revokeObjectURL(url);
  }
}
