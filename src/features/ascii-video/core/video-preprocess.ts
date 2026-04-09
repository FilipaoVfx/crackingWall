const MAX_SIZE = 25 * 1024 * 1024;
const MAX_DURATION = 10;
const ALLOWED_TYPES = ['video/mp4', 'video/webm'];

export interface ValidationResult {
  valid: boolean;
  duration?: number;
  error?: string;
}

export async function validateVideo(file: File): Promise<ValidationResult> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: `Formato no válido. Permitidos: .mp4, .webm` };
  }
  if (file.size > MAX_SIZE) {
    return { valid: false, error: `Archivo demasiado grande. Máx: 25 MB` };
  }

  const duration = await getVideoDuration(file);
  if (duration > MAX_DURATION) {
    return { valid: false, error: `Video demasiado largo. Máx: ${MAX_DURATION}s (actual: ${duration.toFixed(1)}s)` };
  }

  return { valid: true, duration };
}

function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    const url = URL.createObjectURL(file);
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(video.duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No se pudo leer el video'));
    };
    video.src = url;
  });
}
