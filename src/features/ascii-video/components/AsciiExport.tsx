import { exportTxt, exportJson, exportHtml } from '../utils/export';

interface Props {
  frames: string[];
  fps: number;
}

const btn: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid #00fff9',
  color: '#00fff9',
  padding: '8px 20px',
  fontFamily: 'monospace',
  fontSize: 12,
  fontWeight: 700,
  textTransform: 'uppercase',
  cursor: 'pointer',
  borderRadius: 4,
  transition: 'all .2s',
};

export function AsciiExport({ frames, fps }: Props) {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <button
        style={btn}
        onClick={() => exportTxt(frames)}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#00fff9';
          e.currentTarget.style.color = '#0a0a0f';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = '#00fff9';
        }}
      >
        .TXT
      </button>
      <button
        style={btn}
        onClick={() => exportJson(frames, fps)}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#00fff9';
          e.currentTarget.style.color = '#0a0a0f';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = '#00fff9';
        }}
      >
        .JSON
      </button>
      <button
        style={{ ...btn, borderColor: '#b026ff', color: '#b026ff' }}
        onClick={() => exportHtml(frames, fps)}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#b026ff';
          e.currentTarget.style.color = '#0a0a0f';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = '#b026ff';
        }}
      >
        .HTML PLAYER
      </button>
    </div>
  );
}
