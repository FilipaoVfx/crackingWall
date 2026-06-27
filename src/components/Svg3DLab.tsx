import { Component, Suspense, lazy, useState, type ReactNode } from 'react';
import { PRESETS, type PresetName } from '@filipaovfx/svg3d';

// Code-split the engine (three/fiber/drei) so the controls paint instantly
// and the heavy 3D bundle only loads for this tool.
const Svg3D = lazy(() => import('@filipaovfx/svg3d').then((m) => ({ default: m.Svg3D })));

const PRESET_NAMES = Object.keys(PRESETS) as PresetName[];

// Graceful fallback when WebGL is unavailable (old/low-end devices, headless).
class WebGLBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) {
      return (
        <div className="flex h-full items-center justify-center p-6 text-center font-mono text-xs text-gray-400">
          Your browser/device can't run WebGL, so the 3D preview is unavailable.
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Svg3DLab() {
  const [text, setText] = useState('CW');
  const [preset, setPreset] = useState<PresetName>('neon');

  return (
    <div>
      {/* Controls */}
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 font-mono text-xs text-gray-400">
          <span>TEXT</span>
          <input
            value={text}
            maxLength={6}
            onChange={(e) => setText(e.target.value)}
            className="w-28 border-2 border-white/15 bg-black/40 px-3 py-2 font-mono text-sm text-white focus:border-brutal-neon-cyan focus:outline-none"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          {PRESET_NAMES.map((name) => (
            <button
              key={name}
              onClick={() => setPreset(name)}
              className={
                'border-2 px-3 py-1.5 font-brutal text-[11px] font-black uppercase tracking-wide transition-all ' +
                (preset === name
                  ? 'border-black bg-brutal-neon-cyan text-black shadow-brutal-sm'
                  : 'border-white/15 bg-transparent text-gray-300 hover:border-brutal-neon-cyan hover:text-brutal-neon-cyan')
              }
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Stage */}
      <div className="h-[460px] overflow-hidden border-2 border-black bg-brutal-dark-bg shadow-brutal">
        <WebGLBoundary>
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center font-mono text-sm text-brutal-neon-cyan">
                Loading 3D engine…
              </div>
            }
          >
            <Svg3D key={preset} text={text} preset={preset} />
          </Suspense>
        </WebGLBoundary>
      </div>

      <p className="mt-3 font-mono text-[11px] text-gray-500">
        Drag to orbit · active preset: <span className="text-brutal-neon-green">{preset}</span>
      </p>
    </div>
  );
}
