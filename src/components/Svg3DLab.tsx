import { Component, Suspense, lazy, useMemo, useRef, useState, type ReactNode } from 'react';
import { PRESETS, analyzeSvg, exportCanvasPng, exportSceneGlb, readSvgFile, type PresetName, type AssetProfile } from '@filipaovfx/svg3d';
import { Box, Download, Layers, Upload, X } from 'lucide-react';

// Code-split the engine (three/fiber/drei) so the controls paint instantly.
const Svg3D = lazy(() => import('@filipaovfx/svg3d').then((m) => ({ default: m.Svg3D })));
const LayeredSvg3D = lazy(() => import('@filipaovfx/svg3d').then((m) => ({ default: m.LayeredSvg3D })));

const PRESET_NAMES = Object.keys(PRESETS) as PresetName[];

const ROLE_COLOR: Record<string, string> = {
  glass: 'text-brutal-neon-cyan',
  metal: 'text-gray-300',
  plastic: 'text-brutal-neon-purple',
  structure: 'text-brutal-neon-yellow',
  light: 'text-brutal-neon-green',
  screen: 'text-brutal-neon-green',
  detail: 'text-gray-500',
  unknown: 'text-gray-500',
};

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

function LayerExplorer({ profile }: { profile: AssetProfile }) {
  return (
    <div className="flex w-full flex-col border-2 border-black bg-brutal-dark-bg p-3 lg:w-72">
      <div className="mb-2 flex items-center gap-2 font-brutal text-xs font-black uppercase tracking-wide text-white">
        <Layers className="h-4 w-4 text-brutal-neon-cyan" /> Layers ({profile.layerCount})
      </div>
      <div className="mb-2 font-mono text-[10px] text-gray-500">
        {profile.complexity} · ~{profile.estimatedVertices.toLocaleString()} verts · scene: {profile.recommended.scene}
      </div>
      <ul className="flex-1 space-y-1 overflow-y-auto">
        {profile.layers.map((l) => (
          <li key={l.id} className="flex items-center justify-between gap-2 border border-white/10 px-2 py-1.5 font-mono text-[10px]">
            <span className={`truncate font-bold ${ROLE_COLOR[l.role] || 'text-gray-300'}`}>{l.id}</span>
            <span className="shrink-0 text-gray-500">{l.material} · d{l.depth}</span>
          </li>
        ))}
      </ul>
      {profile.warnings.length > 0 && (
        <ul className="mt-2 space-y-1">
          {profile.warnings.map((w, i) => (
            <li key={i} className="font-mono text-[9px] leading-tight text-brutal-neon-yellow">⚠ {w}</li>
          ))}
        </ul>
      )}
    </div>
  );
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

  // Interpret the uploaded SVG into a layered AssetProfile (pure, memoized).
  const profile = useMemo(() => (svg ? analyzeSvg(svg) : null), [svg]);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setCanExport(false);
    try {
      const content = await readSvgFile(file);
      setSvg(content);
      setSvgName(file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read SVG.');
    } finally {
      e.target.value = '';
    }
  };

  const clearSvg = () => {
    setSvg(null);
    setSvgName('');
    setCanExport(false);
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

  const onCanvas = (c: HTMLCanvasElement) => {
    canvasRef.current = c;
    setCanExport(true);
  };
  const onScene = (s: unknown) => {
    sceneRef.current = s;
  };

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

        <div className="ml-auto flex gap-2">
          <button onClick={onExportPng} disabled={!canExport} className="flex items-center gap-2 border-2 border-black bg-brutal-neon-cyan px-3 py-1.5 font-brutal text-[11px] font-black uppercase tracking-wide text-black shadow-brutal-sm transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0">
            <Download className="h-3.5 w-3.5" /> PNG
          </button>
          <button onClick={onExportGlb} disabled={!canExport} className="flex items-center gap-2 border-2 border-black bg-brutal-neon-yellow px-3 py-1.5 font-brutal text-[11px] font-black uppercase tracking-wide text-black shadow-brutal-sm transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0">
            <Box className="h-3.5 w-3.5" /> GLB
          </button>
        </div>
      </div>

      {/* Presets (text mode) */}
      {!svg && (
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
      )}

      {error && <p className="mb-3 font-mono text-[11px] text-brutal-neon-pink">{error}</p>}

      {/* Stage + Layer Explorer */}
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="h-[460px] flex-1 overflow-hidden border-2 border-black bg-brutal-dark-bg shadow-brutal">
          <WebGLBoundary>
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center font-mono text-sm text-brutal-neon-cyan">
                  Loading 3D engine…
                </div>
              }
            >
              {svg ? (
                <LayeredSvg3D key={svgName} svg={svg} registerCanvas={onCanvas} registerScene={onScene} />
              ) : (
                <Svg3D
                  key={preset}
                  text={text}
                  preset={preset}
                  registerCanvas={onCanvas}
                  registerScene={onScene}
                />
              )}
            </Suspense>
          </WebGLBoundary>
        </div>

        {profile && <LayerExplorer profile={profile} />}
      </div>

      <p className="mt-3 font-mono text-[11px] text-gray-500">
        {svg
          ? 'Layered 3D — each <g id> extruded at its own depth & material. Drag to orbit.'
          : 'Drag to orbit · upload an SVG (with <g id> layers) for layered 3D, or type up to 6 chars.'}
      </p>
    </div>
  );
}
