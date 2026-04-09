import { useState, useRef, useCallback } from 'react';

interface Props {
  onFile: (file: File) => void;
  disabled?: boolean;
}

export function AsciiUploader({ onFile, disabled }: Props) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (file) onFile(file);
    },
    [onFile],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      handleFile(e.dataTransfer.files[0]);
    },
    [handleFile],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      style={{
        border: `2px dashed ${dragging ? '#39ff14' : '#00fff9'}`,
        borderRadius: 4,
        padding: '48px 24px',
        textAlign: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: dragging ? 'rgba(57,255,20,0.05)' : 'rgba(0,255,249,0.03)',
        transition: 'all .2s',
        opacity: disabled ? 0.4 : 1,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Scanline overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.12) 2px,rgba(0,0,0,.12) 4px)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', fontFamily: 'monospace' }}>
        <div style={{ fontSize: 36, marginBottom: 12, filter: 'drop-shadow(0 0 8px #00fff9)' }}>
          {'>'}_
        </div>
        <div style={{ color: '#00fff9', fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
          {dragging ? '[ DROP FILE ]' : '[ DRAG VIDEO HERE ]'}
        </div>
        <div style={{ color: '#555', fontSize: 12 }}>
          .mp4 / .webm &middot; max 25 MB &middot; max 10s
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
