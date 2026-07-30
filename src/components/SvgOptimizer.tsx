import { useState, useRef, useMemo } from 'react';
import { Upload, Download, X, Copy, Check } from 'lucide-react';
import { readSvgFile } from '@filipaovfx/svg3d';
import { optimizeSvg, formatBytes, DEFAULT_OPTIONS, type OptimizeOptions } from '../lib/svgOptimize';

/**
 * Client-side SVG optimizer. Everything runs in the browser — the file is read
 * with FileReader and never uploaded, matching the promise the 3D Lab makes.
 *
 * The side-by-side preview is the point: an optimizer you can't verify is one
 * you can't trust, so both versions render live from the same markup.
 */
export default function SvgOptimizer() {
  const [svg, setSvg] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [opts, setOpts] = useState<OptimizeOptions>(DEFAULT_OPTIONS);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const result = useMemo(() => (svg ? optimizeSvg(svg, opts) : null), [svg, opts]);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    try {
      setSvg(await readSvgFile(file));
      setName(file.name.replace(/\.svg$/i, ''));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read that SVG.');
    } finally {
      e.target.value = '';
    }
  };

  const clear = () => {
    setSvg(null);
    setName('');
    setError('');
  };

  const download = () => {
    if (!result) return;
    const blob = new Blob([result.svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name || 'optimized'}.min.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const copy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.svg);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setError('Clipboard blocked by the browser — use Download instead.');
    }
  };

  const btn =
    'flex items-center gap-2 border-2 border-black px-3 py-1.5 font-brutal text-[11px] font-black uppercase tracking-wide text-black shadow-brutal-sm transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input ref={fileRef} type="file" accept=".svg,image/svg+xml" onChange={onUpload} className="hidden" />
        {svg ? (
          <span className="flex items-center gap-2 border-2 border-brutal-neon-green/40 bg-brutal-neon-green/10 px-3 py-1.5 font-mono text-[11px] text-brutal-neon-green">
            <span className="max-w-[160px] truncate">{name}.svg</span>
            <button onClick={clear} aria-label="Remove SVG" className="hover:text-white">
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 border-2 border-white/15 px-3 py-1.5 font-brutal text-[11px] font-black uppercase tracking-wide text-gray-300 transition-colors hover:border-brutal-neon-green hover:text-brutal-neon-green"
          >
            <Upload className="h-3.5 w-3.5" /> Upload SVG
          </button>
        )}

        <div className="ml-auto flex gap-2">
          <button onClick={copy} disabled={!result} className={`${btn} bg-brutal-neon-cyan`}>
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button onClick={download} disabled={!result} className={`${btn} bg-brutal-neon-green`}>
            <Download className="h-3.5 w-3.5" /> Download
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-4 border-2 border-brutal-neon-pink/40 bg-brutal-neon-pink/10 px-3 py-2 font-mono text-[11px] text-brutal-neon-pink">{error}</p>
      )}

      {/* Options */}
      <div className="mb-4 flex flex-wrap items-center gap-5 border-2 border-white/10 bg-black/30 px-4 py-3">
        <label className="flex items-center gap-2 font-mono text-[11px] text-gray-400">
          <span className="uppercase tracking-wider">Precision</span>
          <input
            type="range"
            min={0}
            max={5}
            value={opts.precision}
            onChange={(e) => setOpts((o) => ({ ...o, precision: Number(e.target.value) }))}
            className="w-28 accent-brutal-neon-green"
          />
          <span className="w-4 font-bold text-brutal-neon-green">{opts.precision}</span>
        </label>

        <label className="flex cursor-pointer items-center gap-2 font-mono text-[11px] text-gray-400">
          <input
            type="checkbox"
            checked={opts.removeDimensions}
            onChange={(e) => setOpts((o) => ({ ...o, removeDimensions: e.target.checked }))}
            className="accent-brutal-neon-green"
          />
          <span className="uppercase tracking-wider">Drop width/height</span>
        </label>

        <label className="flex cursor-pointer items-center gap-2 font-mono text-[11px] text-gray-400">
          <input
            type="checkbox"
            checked={opts.removeTitleDesc}
            onChange={(e) => setOpts((o) => ({ ...o, removeTitleDesc: e.target.checked }))}
            className="accent-brutal-neon-green"
          />
          <span className="uppercase tracking-wider">Drop title/desc</span>
        </label>
      </div>

      {!svg && (
        <div
          onClick={() => fileRef.current?.click()}
          className="grid cursor-pointer place-items-center border-2 border-dashed border-white/15 bg-black/20 px-6 py-16 text-center transition-colors hover:border-brutal-neon-green"
        >
          <Upload className="mb-3 h-8 w-8 text-gray-600" />
          <p className="font-brutal text-sm font-black uppercase tracking-wide text-gray-400">Drop an SVG to optimize</p>
          <p className="mt-1.5 font-mono text-[11px] text-gray-600">Processed in your browser · never uploaded</p>
        </div>
      )}

      {result && (
        <>
          {/* Stats */}
          <div className="mb-4 grid grid-cols-3 gap-3">
            <div className="border-2 border-black bg-brutal-dark-bg px-4 py-3 text-center shadow-brutal-sm">
              <div className="font-brutal text-lg font-black text-gray-400">{formatBytes(result.originalBytes)}</div>
              <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-gray-600">Before</div>
            </div>
            <div className="border-2 border-black bg-brutal-dark-bg px-4 py-3 text-center shadow-brutal-sm">
              <div className="font-brutal text-lg font-black text-brutal-neon-green">{formatBytes(result.optimizedBytes)}</div>
              <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-gray-600">After</div>
            </div>
            <div className="border-2 border-black bg-brutal-dark-bg px-4 py-3 text-center shadow-brutal-sm">
              <div className="font-brutal text-lg font-black text-brutal-neon-cyan">{result.savedPercent.toFixed(1)}%</div>
              <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-gray-600">Saved</div>
            </div>
          </div>

          {/* Side-by-side proof that nothing broke */}
          <div className="mb-4 grid gap-4 md:grid-cols-2">
            {[
              { label: 'Original', markup: svg, accent: 'text-gray-400' },
              { label: 'Optimized', markup: result.svg, accent: 'text-brutal-neon-green' },
            ].map((pane) => (
              <div key={pane.label} className="border-2 border-black bg-brutal-dark-bg shadow-brutal-sm">
                <p className={`border-b-2 border-black/60 px-3 py-2 font-mono text-[10px] uppercase tracking-wider ${pane.accent}`}>{pane.label}</p>
                <div
                  className="grid h-52 place-items-center bg-[#070a0f] p-4 [&>svg]:max-h-full [&>svg]:max-w-full"
                  dangerouslySetInnerHTML={{ __html: pane.markup }}
                />
              </div>
            ))}
          </div>

          {result.notes.length > 0 && (
            <div className="border-2 border-white/10 bg-black/30 px-4 py-3">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-gray-500">What was removed</p>
              <ul className="flex flex-wrap gap-2">
                {result.notes.map((n) => (
                  <li key={n} className="border border-brutal-neon-green/25 bg-brutal-neon-green/5 px-2 py-1 font-mono text-[10px] text-brutal-neon-green">
                    {n}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
