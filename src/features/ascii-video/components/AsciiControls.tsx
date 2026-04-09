import type { AsciiConfig } from '../core/types';
import { CHARSETS, type CharsetName } from '../utils/charset';

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
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 16,
        padding: 16,
        border: '1px solid #1a1a2e',
        borderRadius: 4,
        background: 'rgba(0,0,0,.3)',
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
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
    </div>
  );
}
