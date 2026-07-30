import { useState, useRef, Component, type ReactNode } from 'react';
import { Download, Box } from 'lucide-react';
import { Svg3D, PRESETS, exportCanvasPng, exportSceneGlb, type PresetName } from '@filipaovfx/svg3d';

/**
 * 3D text and logo generator — the 3D Lab's text mode as a focused tool.
 *
 * Kept separate from Svg3DLab because the intent is different: this page is
 * for turning a word or wordmark into a 3D asset, so it leads with the text
 * field and the material presets instead of SVG upload and layer sculpting.
 */

const MAX_CHARS = 12;

class WebGLBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) {
      return (
        <div className="grid place-items-center border-2 border-brutal-neon-pink/40 bg-brutal-neon-pink/5 px-6 py-16 text-center">
          <p className="font-brutal text-sm font-black uppercase text-brutal-neon-pink">3D preview unavailable</p>
          <p className="mt-2 max-w-sm font-mono text-[11px] leading-relaxed text-gray-400">
            Your browser could not start WebGL. Try enabling hardware acceleration, or open this page
            in a different browser.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Text3DGenerator() {
  const [text, setText] = useState('LOGO');
  const [preset, setPreset] = useState<PresetName>('neon');
  const [error, setError] = useState('');
  const [canExport, setCanExport] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<unknown>(null);

  const slug = text.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'text';

  const onExportPng = () => canvasRef.current && exportCanvasPng(canvasRef.current, `pixelatmos-${slug}-3d.png`);
  const onExportGlb = async () => {
    setError('');
    try {
      await exportSceneGlb(sceneRef.current, `pixelatmos-${slug}-3d.glb`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'GLB export failed.');
    }
  };

  const btn =
    'flex items-center gap-2 border-2 border-black px-3 py-1.5 font-brutal text-[11px] font-black uppercase tracking-wide text-black shadow-brutal-sm transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <div>
      {/* Controls */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 font-mono text-xs text-gray-400">
          <span className="uppercase tracking-wider">Text</span>
          <input
            value={text}
            maxLength={MAX_CHARS}
            onChange={(e) => setText(e.target.value)}
            placeholder="LOGO"
            aria-label="Text to render in 3D"
            className="w-44 border-2 border-white/15 bg-black/40 px-3 py-2 font-mono text-sm uppercase text-white focus:border-brutal-neon-yellow focus:outline-none"
          />
          <span className="font-mono text-[10px] text-gray-600">{text.length}/{MAX_CHARS}</span>
        </label>

        <div className="ml-auto flex gap-2">
          <button onClick={onExportPng} disabled={!canExport} className={`${btn} bg-brutal-neon-cyan`}>
            <Download className="h-3.5 w-3.5" /> PNG
          </button>
          <button onClick={onExportGlb} disabled={!canExport} className={`${btn} bg-brutal-neon-yellow`}>
            <Box className="h-3.5 w-3.5" /> GLB
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-4 border-2 border-brutal-neon-pink/40 bg-brutal-neon-pink/10 px-3 py-2 font-mono text-[11px] text-brutal-neon-pink">{error}</p>
      )}

      {/* Material presets */}
      <div className="mb-4 flex flex-wrap gap-2">
        {(Object.keys(PRESETS) as PresetName[]).map((p) => (
          <button
            key={p}
            onClick={() => setPreset(p)}
            aria-pressed={preset === p}
            className={`border-2 px-3 py-1.5 font-brutal text-[11px] font-black uppercase tracking-wide transition-all ${
              preset === p
                ? 'border-black bg-brutal-neon-yellow text-black shadow-brutal-sm'
                : 'border-white/15 text-gray-400 hover:border-brutal-neon-yellow hover:text-brutal-neon-yellow'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="border-2 border-black bg-[#070a0f] shadow-brutal">
        <WebGLBoundary>
          <Svg3D
            key={preset}
            text={text || 'LOGO'}
            preset={preset}
            registerCanvas={(c: HTMLCanvasElement) => {
              canvasRef.current = c;
              setCanExport(true);
            }}
            registerScene={(s: unknown) => {
              sceneRef.current = s;
            }}
          />
        </WebGLBoundary>
      </div>

      <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-wider text-gray-600">
        Drag to orbit · scroll to zoom · pick a material above
      </p>
    </div>
  );
}
