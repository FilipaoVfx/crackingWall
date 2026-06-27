import { useEffect, useRef, useState } from 'react';

interface FramesData {
  fps: number;
  cols: number;
  rows: number;
  frames: string[];
}

const VIDEO_SRC = '/demo/demo.mp4';
const FRAMES_SRC = '/demo/ascii-frames.json';

/**
 * Before / After insight: the original video next to its live ASCII render.
 *
 * Performance:
 *  - ASCII is driven off the <video> clock (no second timer; stays in sync and
 *    pauses with the video), and textContent is swapped only when the frame
 *    index actually changes.
 *  - The rAF loop and the video are paused when the section scrolls offscreen
 *    or the tab is hidden.
 *
 * Responsiveness: the <pre> font-size is derived from the container width and
 * the real monospace character ratio, so the fixed 190 columns always fit
 * exactly and stay crisp (re-rasterized, not transform-scaled).
 */
export function AsciiShowcase() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const dataRef = useRef<FramesData | null>(null);
  const charRatioRef = useRef(0.6);
  const [loaded, setLoaded] = useState(false);
  const [aspect, setAspect] = useState(16 / 9);

  // Measure the actual monospace character width ratio once
  useEffect(() => {
    const span = document.createElement('span');
    span.style.cssText = 'position:absolute;visibility:hidden;font-family:"Courier New",monospace;font-size:100px;white-space:pre';
    span.textContent = '0'.repeat(100);
    document.body.appendChild(span);
    charRatioRef.current = span.getBoundingClientRect().width / 100 / 100;
    span.remove();
  }, []);

  // Load frames
  useEffect(() => {
    let alive = true;
    fetch(FRAMES_SRC)
      .then((r) => r.json())
      .then((d: FramesData) => {
        if (!alive) return;
        dataRef.current = d;
        setAspect((d.cols * charRatioRef.current) / (d.rows * 1.1));
        if (preRef.current) preRef.current.textContent = d.frames[0];
        setLoaded(true);
        fitFont();
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fitFont = () => {
    const pre = preRef.current;
    const panel = panelRef.current;
    const data = dataRef.current;
    if (!pre || !panel || !data) return;
    const w = panel.clientWidth;
    const fs = w / (data.cols * charRatioRef.current);
    pre.style.fontSize = `${fs}px`;
    pre.style.lineHeight = `${fs * 1.1}px`;
  };

  // Responsive font sizing
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const ro = new ResizeObserver(() => fitFont());
    ro.observe(panel);
    return () => ro.disconnect();
  }, []);

  // Drive ASCII from the video clock; pause work when offscreen/hidden
  useEffect(() => {
    const video = videoRef.current;
    const pre = preRef.current;
    if (!video || !pre) return;

    let raf = 0;
    let last = -1;
    let visible = true;

    const loop = () => {
      const data = dataRef.current;
      if (data && !video.paused) {
        const idx = Math.floor(video.currentTime * data.fps) % data.frames.length;
        if (idx !== last) {
          last = idx;
          pre.textContent = data.frames[idx];
        }
      }
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (!raf) raf = requestAnimationFrame(loop);
      video.play().catch(() => {});
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      video.pause();
    };

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible && !document.hidden) start();
        else stop();
      },
      { threshold: 0.1 },
    );
    io.observe(video);

    const onVisibility = () => {
      if (document.hidden) stop();
      else if (visible) start();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      cancelAnimationFrame(raf);
    };
  }, []);

  const panelBase: React.CSSProperties = {
    position: 'relative',
    aspectRatio: String(aspect),
    border: '1px solid #1a1a2e',
    borderRadius: 4,
    overflow: 'hidden',
    background: '#05080a',
  };

  const tag: React.CSSProperties = {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 2,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 1,
    padding: '2px 8px',
    borderRadius: 3,
    textTransform: 'uppercase',
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 12,
        fontFamily: 'monospace',
      }}
    >
      {/* BEFORE — original video */}
      <div style={panelBase}>
        <span style={{ ...tag, color: '#0a0a0f', background: '#00fff9' }}>Before · Video</span>
        <video
          ref={videoRef}
          src={VIDEO_SRC}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>

      {/* AFTER — live ASCII */}
      <div ref={panelRef} style={panelBase}>
        <span style={{ ...tag, color: '#0a0a0f', background: '#39ff14' }}>After · ASCII</span>
        {!loaded && (
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: '#39ff14', fontSize: 12, opacity: 0.7 }}>
            Loading preview…
          </div>
        )}
        <pre
          ref={preRef}
          aria-hidden="true"
          style={{
            margin: 0,
            whiteSpace: 'pre',
            color: '#39ff14',
            textShadow: '0 0 3px rgba(57,255,20,0.4)',
            fontFamily: '"Courier New", monospace',
            contain: 'content',
            willChange: 'contents',
            overflow: 'hidden',
          }}
        />
        {/* CRT scanlines */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.18) 2px,rgba(0,0,0,.18) 4px)',
          }}
        />
      </div>
    </div>
  );
}
