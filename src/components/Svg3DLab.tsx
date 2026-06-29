import { Component, Suspense, lazy, useRef, useState, type ReactNode } from 'react';
import { PRESETS, exportCanvasPng, exportSceneGlb, readSvgFile, type PresetName } from '@filipaovfx/svg3d';
import { Box, Download, Upload, X } from 'lucide-react';

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
  const [svg, setSvg] = useState<string | null>(null);
  const [svgName, setSvgName] = useState('');
  const [error, setError] = useState('');
  const [canExport, setCanExport] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<unknown>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    try {
      const content = await readSvgFile(file);
      setSvg(content);
      setSvgName(file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read SVG.');
    } finally {
      e.target.value = ''; // allow re-uploading the same file
    }
  };

  const clearSvg = () => {
    setSvg(null);
    setSvgName('');
  };

  const onExportPng = () => {
    if (canvasRef.current) exportCanvasPng(canvasRef.current, 'crackingwall-3d.png');
  };

  const onExportGlb = async () => {
    setError('');
    try {
      await exportSceneGlb(sceneRef.current, 'crackingwall-3d.glb');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'GLB export failed.');
    }
  };

  // Remount the engine only when the source mode (text vs svg) or preset changes
  const sourceKey = `${preset}-${svg ? 'svg' : 'text'}`;
  const sourceProps = svg ? { svg } : { text };

  return (
    <div>
      {/* Controls */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 font-mono text-xs text-gray-400">
          <span>TEXT</span>
          <input
            value={text}
            maxLength={6}
            disabled={!!svg}
            onChange={(e) => setText(e.target.value)}
            className="w-28 border-2 border-white/15 bg-black/40 px-3 py-2 font-mono text-sm text-white focus:border-brutal-neon-cyan focus:outline-none disabled:opacity-40"
          />
        </label>

        {/* Upload SVG */}
        <input ref={fileRef} type="file" accept=".svg,image/svg+xml" onChange={onUpload} className="hidden" />
        {svg ? (
          <span className="flex items-center gap-2 border-2 border-brutal-neon-green/40 bg-brutal-neon-green/10 px-3 py-1.5 font-mono text-[11px] text-brutal-neon-green">
            <span className="max-w-[140px] truncate">{svgName}</span>
            <button onClick={clearSvg} aria-label="Quitar SVG" className="hover:text-white">
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 border-2 border-white/15 px-3 py-1.5 font-brutal text-[11px] font-black uppercase tracking-wide text-gray-300 transition-colors hover:border-brutal-neon-cyan hover:text-brutal-neon-cyan"
          >
            <Upload className="h-3.5 w-3.5" /> Upload SVG
          </button>
        )}

        {/* Exports */}
        <div className="ml-auto flex gap-2">
          <button
            onClick={onExportPng}
            disabled={!canExport}
            className="flex items-center gap-2 border-2 border-black bg-brutal-neon-cyan px-3 py-1.5 font-brutal text-[11px] font-black uppercase tracking-wide text-black shadow-brutal-sm transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
          >
            <Download className="h-3.5 w-3.5" /> PNG
          </button>
          <button
            onClick={onExportGlb}
            disabled={!canExport}
            className="flex items-center gap-2 border-2 border-black bg-brutal-neon-yellow px-3 py-1.5 font-brutal text-[11px] font-black uppercase tracking-wide text-black shadow-brutal-sm transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
          >
            <Box className="h-3.5 w-3.5" /> GLB
          </button>
        </div>
      </div>

      {/* Presets */}
      <div className="mb-4 flex flex-wrap gap-2">
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

      {error && <p className="mb-3 font-mono text-[11px] text-brutal-neon-pink">{error}</p>}

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
            <Svg3D
              key={sourceKey}
              {...sourceProps}
              preset={preset}
              registerCanvas={(c: HTMLCanvasElement) => {
                canvasRef.current = c;
                setCanExport(true);
              }}
              registerScene={(s: unknown) => {
                sceneRef.current = s;
              }}
            />
          </Suspense>
        </WebGLBoundary>
      </div>

      <p className="mt-3 font-mono text-[11px] text-gray-500">
        Drag to orbit · active preset: <span className="text-brutal-neon-green">{preset}</span> · upload an SVG or type up to 6 chars
      </p>
    </div>
  );
}
