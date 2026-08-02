'use client';

import { useEffect, useRef, type MutableRefObject } from 'react';

export default function useExplorerPointerLook({
  enabled,
  canvas,
  yaw,
  pitch,
}: {
  enabled: boolean;
  canvas: HTMLCanvasElement;
  yaw: MutableRefObject<number>;
  pitch: MutableRefObject<number>;
}) {
  const dragging = useRef(false);
  const previous = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) return;
    const start = (event: PointerEvent) => {
      dragging.current = true;
      previous.current = { x: event.clientX, y: event.clientY };
      canvas.setPointerCapture?.(event.pointerId);
    };
    const move = (event: PointerEvent) => {
      if (!dragging.current) return;
      const dx = event.clientX - previous.current.x;
      const dy = event.clientY - previous.current.y;
      previous.current = { x: event.clientX, y: event.clientY };
      yaw.current -= dx * 0.0038;
      pitch.current = Math.max(-1.18, Math.min(1.18, pitch.current - dy * 0.0032));
    };
    const end = (event: PointerEvent) => {
      dragging.current = false;
      canvas.releasePointerCapture?.(event.pointerId);
    };
    canvas.addEventListener('pointerdown', start);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    return () => {
      canvas.removeEventListener('pointerdown', start);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', end);
      canvas.removeEventListener('pointercancel', end);
    };
  }, [canvas, enabled, pitch, yaw]);
}
