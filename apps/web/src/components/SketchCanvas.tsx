import { useEffect, useRef, useState } from 'react';
import type { DrawPoint, DrawStroke } from '@splash/shared';

interface Props {
  strokes: DrawStroke[];
  interactive?: boolean;
  color?: string;
  size?: number;
  onStroke?: (stroke: DrawStroke) => void;
}

export default function SketchCanvas({ strokes, interactive, color = '#111827', size = 6, onStroke }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const drawingRef = useRef(false);
  const [liveStroke, setLiveStroke] = useState<DrawPoint[] | null>(null);

  const draw = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const s of strokes) {
      if (s.points.length === 0) continue;
      ctx.beginPath();
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.size;
      ctx.moveTo(s.points[0].x * w, s.points[0].y * h);
      for (const p of s.points.slice(1)) ctx.lineTo(p.x * w, p.y * h);
      ctx.stroke();
    }
    if (liveStroke && liveStroke.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.moveTo(liveStroke[0].x * w, liveStroke[0].y * h);
      for (const p of liveStroke.slice(1)) ctx.lineTo(p.x * w, p.y * h);
      ctx.stroke();
    }
  };

  useEffect(draw);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(draw);
    ro.observe(container);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getPos = (e: React.PointerEvent): DrawPoint => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drawingRef.current = true;
    setLiveStroke([getPos(e)]);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!interactive || !drawingRef.current) return;
    setLiveStroke((prev) => [...(prev ?? []), getPos(e)]);
  };
  const onPointerUp = () => {
    if (!interactive || !drawingRef.current) return;
    drawingRef.current = false;
    setLiveStroke((prev) => {
      if (prev && prev.length > 1) onStroke?.({ color, size, points: prev });
      return null;
    });
  };

  return (
    <div ref={containerRef} className="canvas-wrap">
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block', cursor: interactive ? 'crosshair' : 'default' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      />
    </div>
  );
}
