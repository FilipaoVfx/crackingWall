import type { AsciiConfig } from '../core/types';
import { CHARSETS, type CharsetName } from '../utils/charset';
import { PRESETS } from '../utils/presets';

interface Props {
  config: AsciiConfig;
  onChange: (config: AsciiConfig) => void;
  disabled?: boolean;
}

const label: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  fontFamily: 'monospace',
  fontSize: 12,
  color: '#00fff9',
  fontWeight: 700,
  textTransform: 'uppercase',
};

const slider: React.CSSProperties = {
  width: '100%',
  accentColor: '#00fff9',
  cursor: 'pointer',
};

export function AsciiControls({ config, onChange, disabled }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        padding: 16,
        border: '1px solid #1a1a2e',
        borderRadius: 4,
        background: 'rgba(0,0,0,.3)',
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
      }}
    >
      {/* Presets */}
      <div>
        <div style={{ ...label, marginBottom: 8 }}>
          <span>PRESETS</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {PRESETS.map((p) => {
            const active = p.patch.charset === config.charset && p.patch.edges === config.edges;
            return (
              <button
                key={p.name}
                title={p.description}
                onClick={() => onChange({ ...config, ...p.patch })}
                style={{
                  background: active ? '#00fff9' : 'transparent',
                  color: active ? '#0a0a0f' : '#00fff9',
                  border: '1px solid #00fff9',
                  padding: '4px 12px',
                  fontFamily: 'monospace',
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  borderRadius: 2,
                }}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
        }}
      >
      {/* FPS */}
      <div>
        <div style={label}>
          <span>FPS</span>
          <span style={{ color: '#39ff14' }}>{config.fps}</span>
        </div>
        <input
          type="range"
          min={2}
          max={12}
          step={1}
          value={config.fps}
          onChange={(e) => onChange({ ...config, fps: +e.target.value })}
          style={slider}
        />
      </div>

      {/* Width */}
      <div>
        <div style={label}>
          <span>COLS</span>
          <span style={{ color: '#39ff14' }}>{config.width}</span>
        </div>
        <input
          type="range"
          min={40}
          max={200}
          step={10}
          value={config.width}
          onChange={(e) => onChange({ ...config, width: +e.target.value })}
          style={slider}
        />
      </div>

      {/* Charset */}
      <div>
        <div style={label}>
          <span>CHARSET</span>
        </div>
        <select
          value={
            (Object.entries(CHARSETS).find(([, v]) => v === config.charset)?.[0] ?? 'standard') as string
          }
          onChange={(e) =>
            onChange({ ...config, charset: CHARSETS[e.target.value as CharsetName] })
          }
          style={{
            width: '100%',
            background: '#0a0a0f',
            color: '#39ff14',
            border: '1px solid #1a1a2e',
            padding: '6px 8px',
            fontFamily: 'monospace',
            fontSize: 12,
            borderRadius: 4,
            cursor: 'pointer',
            marginTop: 6,
          }}
        >
          {Object.keys(CHARSETS).map((name) => (
            <option key={name} value={name}>
              {name.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Brightness */}
      <div>
        <div style={label}>
          <span>BRIGHTNESS</span>
          <span style={{ color: '#39ff14' }}>{config.brightness.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min={-0.5}
          max={0.5}
          step={0.05}
          value={config.brightness}
          onChange={(e) => onChange({ ...config, brightness: +e.target.value })}
          style={slider}
        />
      </div>

      {/* Contrast */}
      <div>
        <div style={label}>
          <span>CONTRAST</span>
          <span style={{ color: '#39ff14' }}>{config.contrast.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min={0.5}
          max={2}
          step={0.05}
          value={config.contrast}
          onChange={(e) => onChange({ ...config, contrast: +e.target.value })}
          style={slider}
        />
      </div>

      {/* Gamma */}
      <div>
        <div style={label}>
          <span>GAMMA</span>
          <span style={{ color: '#39ff14' }}>{config.gamma.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min={0.5}
          max={2.5}
          step={0.05}
          value={config.gamma}
          onChange={(e) => onChange({ ...config, gamma: +e.target.value })}
          style={slider}
        />
      </div>

      {/* Toggles */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
        <label style={{ ...label, cursor: 'pointer', justifyContent: 'flex-start' }}>
          <input
            type="checkbox"
            checked={config.dither}
            onChange={(e) => onChange({ ...config, dither: e.target.checked })}
            style={{ accentColor: '#00fff9', cursor: 'pointer' }}
          />
          <span>DITHER</span>
        </label>
        <label style={{ ...label, cursor: 'pointer', justifyContent: 'flex-start' }}>
          <input
            type="checkbox"
            checked={config.invert}
            onChange={(e) => onChange({ ...config, invert: e.target.checked })}
            style={{ accentColor: '#00fff9', cursor: 'pointer' }}
          />
          <span>INVERT</span>
        </label>
        <label style={{ ...label, cursor: 'pointer', justifyContent: 'flex-start' }}>
          <input
            type="checkbox"
            checked={config.edges}
            onChange={(e) => onChange({ ...config, edges: e.target.checked })}
            style={{ accentColor: '#00fff9', cursor: 'pointer' }}
          />
          <span>EDGES</span>
        </label>
      </div>

      {/* Edge threshold (only relevant when EDGES is on) */}
      <div style={{ opacity: config.edges ? 1 : 0.4 }}>
        <div style={label}>
          <span>EDGE THRESHOLD</span>
          <span style={{ color: '#39ff14' }}>{config.edgeThreshold.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min={0.1}
          max={0.9}
          step={0.02}
          value={config.edgeThreshold}
          disabled={!config.edges}
          onChange={(e) => onChange({ ...config, edgeThreshold: +e.target.value })}
          style={slider}
        />
      </div>
      </div>
    </div>
  );
}
