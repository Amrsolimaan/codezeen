'use client';

import { useEffect, useRef } from 'react';

export function LiquidCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  // Mutable position state — lives outside React state to avoid re-renders
  const pos = useRef({ x: -100, y: -100 });
  const mouse = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const cursor = cursorRef.current;
    const dot = dotRef.current;
    if (!cursor || !dot) return;

    // Skip on touch/stylus devices and when reduced motion is preferred
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    document.body.classList.add('custom-cursor-active');

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const onMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    // Detect hoverable elements to morph cursor into pill + label
    const onMouseOver = (e: MouseEvent) => {
      const target = (e.target as Element).closest('a, button, [data-cursor]');
      if (!target) return;
      const label = (target as HTMLElement).dataset['cursor'] ?? 'View';
      cursor.classList.add('is-hovering');
      cursor.textContent = label;
    };

    const onMouseOut = (e: MouseEvent) => {
      const target = (e.target as Element).closest('a, button, [data-cursor]');
      if (!target) return;
      cursor.classList.remove('is-hovering');
      cursor.textContent = '';
    };

    // RAF loop — spring lerp gives the liquid lag feel
    const tick = () => {
      pos.current.x = lerp(pos.current.x, mouse.current.x, 0.12);
      pos.current.y = lerp(pos.current.y, mouse.current.y, 0.12);

      // Use translate(-50%,-50%) offset via CSS so origin is cursor center
      cursor.style.transform =
        `translate(calc(${pos.current.x}px - 50%), calc(${pos.current.y}px - 50%))`;
      dot.style.transform =
        `translate(calc(${mouse.current.x}px - 50%), calc(${mouse.current.y}px - 50%))`;

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseover', onMouseOver);
    document.addEventListener('mouseout', onMouseOut);

    return () => {
      cancelAnimationFrame(rafRef.current);
      document.body.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseout', onMouseOut);
    };
  }, []);

  return (
    <>
      {/* Lag-behind ring — morphs on hover */}
      <div ref={cursorRef} aria-hidden="true" className="liquid-cursor" />
      {/* Instant-follow dot */}
      <div ref={dotRef} aria-hidden="true" className="liquid-cursor-dot" />
    </>
  );
}
