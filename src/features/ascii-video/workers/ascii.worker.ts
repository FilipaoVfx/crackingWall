// Self-contained worker — no imports (avoids bundler edge-cases)

function convertFrame(
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
  charset: string,
): string {
  const lines: string[] = [];
  for (let y = 0; y < height; y++) {
    let line = '';
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const gray = rgba[i] * 0.299 + rgba[i + 1] * 0.587 + rgba[i + 2] * 0.114;
      const ci = Math.floor((gray / 255) * (charset.length - 1));
      line += charset[ci];
    }
    lines.push(line);
  }
  return lines.join('\n');
}

self.onmessage = (e: MessageEvent) => {
  const { type, pixels, width, height, charset } = e.data;
  if (type !== 'convert') return;

  try {
    const total = pixels.length;
    const frames: string[] = [];

    for (let i = 0; i < total; i++) {
      const rgba = new Uint8ClampedArray(pixels[i]);
      frames.push(convertFrame(rgba, width, height, charset));
      // Report progress every 5 frames or on the last frame
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
