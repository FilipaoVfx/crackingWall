import { useAsciiGenerator } from '../hooks/useAsciiGenerator';
import { AsciiUploader } from './AsciiUploader';
import { AsciiControls } from './AsciiControls';
import { AsciiPreview } from './AsciiPreview';
import { AsciiExport } from './AsciiExport';

const statusLabels: Record<string, string> = {
  validating: 'VALIDANDO...',
  extracting: 'EXTRAYENDO FRAMES...',
  converting: 'CONVIRTIENDO A ASCII...',
};

export function AsciiLab() {
  const { state, config, setConfig, generate, cancel, reset } = useAsciiGenerator();
  const isProcessing = ['validating', 'extracting', 'converting'].includes(state.status);

  return (
    <div
      style={{
        maxWidth: 1000,
        margin: '0 auto',
        padding: '16px 16px 40px',
        fontFamily: 'monospace',
      }}
    >
      {/* Controls — always visible so user can tweak before uploading */}
      <div style={{ marginBottom: 12 }}>
        <AsciiControls config={config} onChange={setConfig} disabled={isProcessing} />
      </div>

      {/* Upload zone — hidden once we have results */}
      {state.status !== 'done' && (
        <div style={{ marginBottom: 12 }}>
          <AsciiUploader onFile={generate} disabled={isProcessing} />
        </div>
      )}

      {/* Processing indicator */}
      {isProcessing && (
        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8,
              fontSize: 12,
              color: '#00fff9',
              fontWeight: 700,
            }}
          >
            <span>{statusLabels[state.status] ?? 'PROCESANDO...'}</span>
            <span>{Math.round(state.progress)}%</span>
          </div>

          {/* Progress bar */}
          <div
            style={{
              height: 4,
              background: '#1a1a2e',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${state.progress}%`,
                background: 'linear-gradient(90deg, #00fff9, #39ff14)',
                transition: 'width .15s',
                boxShadow: '0 0 8px #00fff9',
              }}
            />
          </div>

          <button
            onClick={cancel}
            style={{
              marginTop: 12,
              background: 'transparent',
              border: '1px solid #ff0040',
              color: '#ff0040',
              padding: '4px 16px',
              fontFamily: 'monospace',
              fontSize: 11,
              cursor: 'pointer',
              borderRadius: 2,
            }}
          >
            CANCELAR
          </button>
        </div>
      )}

      {/* Error */}
      {state.status === 'error' && (
        <div
          style={{
            padding: '12px 16px',
            border: '1px solid #ff0040',
            borderRadius: 4,
            color: '#ff0040',
            fontSize: 13,
            marginBottom: 20,
            background: 'rgba(255,0,64,0.05)',
          }}
        >
          <strong>ERROR:</strong> {state.error}
        </div>
      )}

      {/* Preview */}
      {state.status === 'done' && state.frames.length > 0 && (
        <>
          <div style={{ marginBottom: 16 }}>
            <AsciiPreview frames={state.frames} fps={state.fps} />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <AsciiExport frames={state.frames} fps={state.fps} />
            <button
              onClick={reset}
              style={{
                background: 'transparent',
                border: '1px solid #555',
                color: '#555',
                padding: '8px 20px',
                fontFamily: 'monospace',
                fontSize: 12,
                cursor: 'pointer',
                borderRadius: 4,
              }}
            >
              NUEVO VIDEO
            </button>
          </div>
        </>
      )}
    </div>
  );
}
