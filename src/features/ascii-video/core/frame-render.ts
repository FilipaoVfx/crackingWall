export type OnFrameCallback = (frame: string, index: number) => void;

export class FramePlayer {
  private frames: string[];
  private fps: number;
  private current = 0;
  private playing = false;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private onFrame: OnFrameCallback;

  constructor(frames: string[], fps: number, onFrame: OnFrameCallback) {
    this.frames = frames;
    this.fps = fps;
    this.onFrame = onFrame;
  }

  play() {
    if (this.playing || this.frames.length === 0) return;
    this.playing = true;
    this.tick();
    this.intervalId = setInterval(() => this.tick(), 1000 / this.fps);
  }

  pause() {
    this.playing = false;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  toggle() {
    this.playing ? this.pause() : this.play();
  }

  isPlaying() {
    return this.playing;
  }

  setFps(fps: number) {
    this.fps = fps;
    if (this.playing) {
      this.pause();
      this.play();
    }
  }

  seekTo(index: number) {
    this.current = Math.max(0, Math.min(index, this.frames.length - 1));
    this.onFrame(this.frames[this.current], this.current);
  }

  getFrameCount() {
    return this.frames.length;
  }

  getCurrentIndex() {
    return this.current;
  }

  destroy() {
    this.pause();
  }

  private tick() {
    this.onFrame(this.frames[this.current], this.current);
    this.current = (this.current + 1) % this.frames.length;
  }
}
