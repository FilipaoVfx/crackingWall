import { useState, useEffect, useRef, useCallback } from 'react';
import { FramePlayer } from '../core/frame-render';

interface Props {
  frames: string[];
  fps: number;
}

export function AsciiPreview({ frames, fps }: Props) {
  const [current, setCurrent] = useState('');
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const playerRef = useRef<FramePlayer | null>(null);

  const onFrame = useCallback((frame: string, i: number) => {
    setCurrent(frame);
    setIndex(i);
  }, []);

  useEffect(() => {
    const player = new FramePlayer(frames, fps, onFrame);
    playerRef.current = player;
    player.play();
    return () => player.destroy();
  }, [frames, fps, onFrame]);

  const toggle = () => {
    const p = playerRef.current;
    if (!p) return;
    p.toggle();
    setPlaying(p.isPlaying());
  };

  return (
    <div
      style={{
        border: '1px solid #39ff14',
        borderRadius: 4,
        background: '#050508',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 0 30px rgba(57,255,20,0.15), inset 0 0 60px rgba(0,0,0,0.5)',
      }}
    >
      {/* CRT scanline overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.18) 2px,rgba(0,0,0,.18) 4px)',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      {/* ASCII output */}
      <pre
        style={{
          margin: 0,
          padding: '16px 12px',
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: 'clamp(5px, 1.1vw, 9px)',
          lineHeight: 1.15,
          color: '#39ff14',
          textShadow: '0 0 4px rgba(57,255,20,0.6)',
          whiteSpace: 'pre',
          overflow: 'auto',
          maxHeight: '60vh',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {current}
      </pre>

      {/* Controls bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          borderTop: '1px solid #1a1a2e',
          fontFamily: 'monospace',
          fontSize: 11,
          color: '#555',
          position: 'relative',
          zIndex: 3,
        }}
      >
        <button
          onClick={toggle}
          style={{
            background: 'transparent',
            border: '1px solid #39ff14',
            color: '#39ff14',
            padding: '3px 12px',
            fontFamily: 'monospace',
            fontSize: 11,
            cursor: 'pointer',
            borderRadius: 2,
          }}
        >
          {playing ? 'PAUSE' : 'PLAY'}
        </button>

        <span>
          FRAME {index + 1}/{frames.length} &middot; {fps} FPS
        </span>

        {/* Seek slider */}
        <input
          type="range"
          min={0}
          max={frames.length - 1}
          value={index}
          onChange={(e) => playerRef.current?.seekTo(+e.target.value)}
          style={{ width: 120, accentColor: '#39ff14' }}
        />
      </div>
    </div>
  );
}
