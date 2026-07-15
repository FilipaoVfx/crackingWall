import { Component, Suspense, lazy, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { PRESETS, analyzeSvg, exportCanvasPng, exportSceneGlb, exportHighLodGlb, readSvgFile, type PresetName, type AssetProfile, type MaterialPreset } from '@filipaovfx/svg3d';
import { Box, Download, Eye, EyeOff, Layers, Upload, X } from 'lucide-react';

const Svg3D = lazy(() => import('@filipaovfx/svg3d').then((m) => ({ default: m.Svg3D })));
const LayeredSvg3D = lazy(() => import('@filipaovfx/svg3d').then((m) => ({ default: m.LayeredSvg3D })));

const PRESET_NAMES = Object.keys(PRESETS) as PresetName[];
const MATERIALS: MaterialPreset[] = ['default', 'plastic', 'metal', 'glass', 'emissive', 'chrome', 'gold'];

type Override = { depth?: number; material?: MaterialPreset; color?: string; visible?: boolean };
type Overrides = Record<string, Override>;

class WebGLBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) {
      return <div className="flex h-full items-center justify-center p-6 text-center font-mono text-xs text-gray-400">WebGL unavailable on this device.</div>;
    }
    return this.props.children;
  }
}

// Per-layer editor — the "sculpt" panel for the selected element.
function LayerEditor({ profile, ovr, onChange }: { profile: AssetProfile; ovr: Overrides; onChange: (id: string, patch: Override) => void }) {
  const [sel, setSel] = useState<string>(profile.layers[0]?.id ?? '');
  const layer = profile.layers.find((l) => l.id === sel) ?? profile.layers[0];
  if (!layer) return null;
  const o = ovr[layer.id] ?? {};
  const depth = o.depth ?? layer.depth;
  const material = o.material ?? layer.material;
  const color = o.color ?? layer.fill ?? '#cccccc';
  const visible = o.visible !== false;

  return (
    <div className="flex w-full flex-col border-2 border-black bg-brutal-dark-bg p-3 lg:w-72">
      <div className="mb-2 flex items-center gap-2 font-brutal text-xs font-black uppercase tracking-wide text-white">
        <Layers className="h-4 w-4 text-brutal-neon-cyan" /> Layers ({profile.layerCount})
      </div>
      <div className="mb-2 font-mono text-[10px] text-gray-500">{profile.complexity} · ~{profile.estimatedVertices.toLocaleString()} verts</div>

      {/* Selectable layer list */}
      <ul className="mb-3 max-h-40 space-y-1 overflow-y-auto">
        {profile.layers.map((l) => {
          const lo = ovr[l.id] ?? {};
          const hidden = lo.visible === false;
          return (
            <li key={l.id}>
              <button
                onClick={() => setSel(l.id)}
                className={'flex w-full items-center justify-between gap-2 border px-2 py-1.5 font-mono text-[10px] transition-colors ' + (sel === l.id ? 'border-brutal-neon-cyan bg-brutal-neon-cyan/10 text-white' : 'border-white/10 text-gray-400 hover:border-white/30')}
              >
                <span className="flex items-center gap-1.5 truncate">
                  <span className="h-2.5 w-2.5 shrink-0 border border-black" style={{ background: lo.color ?? l.fill ?? '#555' }} />
                  <span className="truncate">{l.id}</span>
                </span>
                <span
                  role="button"
                  onClick={(e) => { e.stopPropagation(); onChange(l.id, { visible: hidden }); }}
                  className="shrink-0 text-gray-500 hover:text-white"
                >
                  {hidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Editor for the selected layer */}
      <div className="space-y-3 border-t border-white/10 pt-3">
        <div className="font-mono text-[10px] uppercase tracking-wide text-brutal-neon-cyan">Edit · {layer.id}</div>

        <label className="block">
          <span className="mb-1 flex justify-between font-mono text-[10px] text-gray-400"><span>Relief (depth)</span><span className="text-brutal-neon-green">{depth}</span></span>
          <input type="range" min={2} max={80} step={1} value={depth} onChange={(e) => onChange(layer.id, { depth: +e.target.value })} className="w-full accent-brutal-neon-cyan" />
        </label>

        <label className="flex items-center justify-between font-mono text-[10px] text-gray-400">
          <span>Material</span>
          <select value={material} onChange={(e) => onChange(layer.id, { material: e.target.value as MaterialPreset })} className="border border-white/15 bg-black/40 px-2 py-1 text-white">
            {MATERIALS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>

        <label className="flex items-center justify-between font-mono text-[10px] text-gray-400">
          <span>Color</span>
          <input type="color" value={/^#[0-9a-f]{6}$/i.test(color) ? color : '#cccccc'} onChange={(e) => onChange(layer.id, { color: e.target.value })} className="h-6 w-10 cursor-pointer border border-white/15 bg-transparent" />
        </label>

        <button onClick={() => onChange(layer.id, { depth: undefined, material: undefined, color: undefined })} className="w-full border border-white/15 py-1 font-mono text-[10px] uppercase text-gray-400 hover:border-brutal-neon-pink hover:text-brutal-neon-pink">
          Reset layer
        </button>
      </div>

      {profile.warnings.length > 0 && (
        <ul className="mt-2 space-y-1">{profile.warnings.map((w, i) => <li key={i} className="font-mono text-[9px] leading-tight text-brutal-neon-yellow">⚠ {w}</li>)}</ul>
      )}
    </div>
  );
}

// Curated demo SVGs (in public/) — one click to show the layered SVG→3D system
// without needing the user to have an SVG on hand. Rich emoji faces exercise the
// per-shape segmentation, gradient capture and spatial reconstruction.
const EXAMPLES: { file: string; label: string }[] = [
  { file: 'money-mouth-face-svgrepo-com.svg', label: 'Money' },
  { file: 'rolling-on-the-floor-laughing-svgrepo-com.svg', label: 'ROFL' },
  { file: 'clown-face-svgrepo-com.svg', label: 'Clown' },
  { file: 'face-screaming-in-fear-svgrepo-com.svg', label: 'Scream' },
];

export default function Svg3DLab() {
  const [text, setText] = useState('CW');
  const [preset, setPreset] = useState<PresetName>('neon');
  const [svg, setSvg] = useState<string | null>(null);
  const [svgName, setSvgName] = useState('');
  const [error, setError] = useState('');
  const [canExport, setCanExport] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [overrides, setOverrides] = useState<Overrides>({});
  const [committed, setCommitted] = useState<Overrides>({});

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<unknown>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const profile = useMemo(() => (svg ? analyzeSvg(svg) : null), [svg]);

  // Debounce overrides → fewer re-extrusions while dragging sliders.
  useEffect(() => {
    const t = setTimeout(() => setCommitted(overrides), 200);
    return () => clearTimeout(t);
  }, [overrides]);

  const patchLayer = (id: string, patch: Override) =>
    setOverrides((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setCanExport(false);
    setOverrides({});
    setCommitted({});
    try {
      setSvg(await readSvgFile(file));
      setSvgName(file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read SVG.');
    } finally {
      e.target.value = '';
    }
  };

  const loadExample = async (ex: { file: string; label: string }) => {
    setError(''); setCanExport(false); setOverrides({}); setCommitted({});
    try {
      const res = await fetch('/' + ex.file);
      if (!res.ok) throw new Error('Could not load example.');
      setSvg(await res.text());
      setSvgName(ex.label);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load example.');
    }
  };

  const clearSvg = () => { setSvg(null); setSvgName(''); setCanExport(false); setOverrides({}); setCommitted({}); };
  const onExportPng = () => canvasRef.current && exportCanvasPng(canvasRef.current, 'crackingwall-3d.png');
  const onExportGlb = async () => {
    setError('');
    // Uploaded SVG → rebuild a HIGH-LOD model off-screen (crisp curves), then
    // export. The viewport stays 'draft' for 60fps. Text mode falls back to the
    // live scene (no layered high-LOD path for text yet).
    setExporting(true);
    try {
      if (svg) await exportHighLodGlb(svg, 'crackingwall-3d.glb', { overrides: committed });
      else await exportSceneGlb(sceneRef.current, 'crackingwall-3d.glb');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'GLB export failed.');
    } finally {
      setExporting(false);
    }
  };
  const onCanvas = (c: HTMLCanvasElement) => { canvasRef.current = c; setCanExport(true); };
  const onScene = (s: unknown) => { sceneRef.current = s; };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 font-mono text-xs text-gray-400">
          <span>TEXT</span>
          <input value={text} maxLength={6} disabled={!!svg} onChange={(e) => setText(e.target.value)} className="w-28 border-2 border-white/15 bg-black/40 px-3 py-2 font-mono text-sm text-white focus:border-brutal-neon-cyan focus:outline-none disabled:opacity-40" />
        </label>

        <input ref={fileRef} type="file" accept=".svg,image/svg+xml" onChange={onUpload} className="hidden" />
        {svg ? (
          <span className="flex items-center gap-2 border-2 border-brutal-neon-green/40 bg-brutal-neon-green/10 px-3 py-1.5 font-mono text-[11px] text-brutal-neon-green">
            <span className="max-w-[140px] truncate">{svgName}</span>
            <button onClick={clearSvg} aria-label="Quitar SVG" className="hover:text-white"><X className="h-3.5 w-3.5" /></button>
          </span>
        ) : (
          <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 border-2 border-white/15 px-3 py-1.5 font-brutal text-[11px] font-black uppercase tracking-wide text-gray-300 transition-colors hover:border-brutal-neon-cyan hover:text-brutal-neon-cyan">
            <Upload className="h-3.5 w-3.5" /> Upload SVG
          </button>
        )}

        <div className="ml-auto flex gap-2">
          <button onClick={onExportPng} disabled={!canExport} className="flex items-center gap-2 border-2 border-black bg-brutal-neon-cyan px-3 py-1.5 font-brutal text-[11px] font-black uppercase tracking-wide text-black shadow-brutal-sm transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40">
            <Download className="h-3.5 w-3.5" /> PNG
          </button>
          <button onClick={onExportGlb} disabled={!canExport || exporting} title={svg ? 'Export a high-quality 3D model (.glb)' : 'Export the 3D model (.glb)'} className="flex items-center gap-2 border-2 border-black bg-brutal-neon-yellow px-3 py-1.5 font-brutal text-[11px] font-black uppercase tracking-wide text-black shadow-brutal-sm transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40">
            <Box className={'h-3.5 w-3.5' + (exporting ? ' animate-spin' : '')} /> {exporting ? 'HD…' : 'GLB'}
          </button>
        </div>
      </div>

      {!svg && (
        <div className="mb-4 flex flex-wrap gap-2">
          {PRESET_NAMES.map((name) => (
            <button key={name} onClick={() => setPreset(name)} className={'border-2 px-3 py-1.5 font-brutal text-[11px] font-black uppercase tracking-wide transition-all ' + (preset === name ? 'border-black bg-brutal-neon-cyan text-black shadow-brutal-sm' : 'border-white/15 bg-transparent text-gray-300 hover:border-brutal-neon-cyan hover:text-brutal-neon-cyan')}>
              {name}
            </button>
          ))}
        </div>
      )}

      {/* Examples: ALWAYS visible + centered. Click swaps the model directly —
          no need to clear the current one first (zero friction). */}
      <div className="mb-4">
        <p className="mb-2 text-center font-mono text-[10px] uppercase tracking-wider text-gray-500">Examples — one click to sculpt in 3D</p>
        <div className="flex flex-wrap justify-center gap-2.5">
          {EXAMPLES.map((ex) => {
            const active = svg !== null && svgName === ex.label;
            return (
              <button
                key={ex.file}
                onClick={() => loadExample(ex)}
                title={'Load ' + ex.label}
                aria-pressed={active}
                className={
                  'group flex flex-col items-center gap-1 border-2 bg-black/40 p-2 transition-all hover:-translate-y-0.5 ' +
                  (active ? 'border-brutal-neon-cyan shadow-brutal-sm' : 'border-white/15 hover:border-brutal-neon-cyan')
                }
              >
                <img src={'/' + ex.file} alt={ex.label} width={44} height={44} loading="lazy" className="h-11 w-11" />
                <span className={'font-mono text-[9px] uppercase tracking-wide group-hover:text-brutal-neon-cyan ' + (active ? 'text-brutal-neon-cyan' : 'text-gray-400')}>{ex.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {error && <p className="mb-3 font-mono text-[11px] text-brutal-neon-pink">{error}</p>}

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="h-[460px] flex-1 overflow-hidden border-2 border-black bg-brutal-dark-bg shadow-brutal">
          <WebGLBoundary>
            <Suspense fallback={<div className="flex h-full items-center justify-center font-mono text-sm text-brutal-neon-cyan">Loading 3D engine…</div>}>
              {svg ? (
                <LayeredSvg3D key={svgName} svg={svg} overrides={committed} registerCanvas={onCanvas} registerScene={onScene} />
              ) : (
                <Svg3D key={preset} text={text} preset={preset} registerCanvas={onCanvas} registerScene={onScene} />
              )}
            </Suspense>
          </WebGLBoundary>
        </div>

        {profile && <LayerEditor profile={profile} ovr={overrides} onChange={patchLayer} />}
      </div>

      <p className="mt-3 font-mono text-[11px] text-gray-500">
        {svg ? 'Sculpt mode — select a layer, then tweak relief / material / colour. Drag to orbit.' : 'Drag to orbit · click an example, upload your own SVG, or type up to 6 chars.'}
      </p>
    </div>
  );
}
