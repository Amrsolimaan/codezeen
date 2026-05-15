'use client';

import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface Particle {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Phase offset for breathing sin wave */
  phase: number;
}

interface ParticleGridProps {
  /** Additional className for the container */
  className?: string;
  /** Grid dot spacing in pixels (default: 60) */
  spacing?: number;
  /** Mouse repulsion radius in pixels (default: 120) */
  repulsionRadius?: number;
}

// Brand colors extracted from CSS variables (can't read at canvas draw time without getComputedStyle)
const ACCENT   = { r: 59,  g: 125, b: 216 }; // --color-accent
const ACCENT_2 = { r: 29,  g: 158, b: 117 }; // --color-accent-2

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function ParticleGrid({ className, spacing = 60, repulsionRadius = 120 }: ParticleGridProps) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef       = useRef<number>(0);
  const mouseRef     = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Canvas-based animation only on desktop with full motion
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || window.innerWidth <= 768) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let frame = 0;

    const buildGrid = () => {
      particles = [];
      const cols = Math.ceil(canvas.width / spacing) + 1;
      const rows = Math.ceil(canvas.height / spacing) + 1;

      for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows; row++) {
          const x = col * spacing;
          const y = row * spacing;
          particles.push({
            baseX: x,
            baseY: y,
            x,
            y,
            vx: 0,
            vy: 0,
            phase: (col + row) * 0.3,
          });
        }
      }
    };

    const resize = () => {
      canvas.width  = container.offsetWidth;
      canvas.height = container.offsetHeight;
      buildGrid();
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const time = frame * 0.02;

      for (const p of particles) {
        const dx   = p.x - mouseRef.current.x;
        const dy   = p.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Spring toward base position
        const springX = (p.baseX - p.x) * 0.08;
        const springY = (p.baseY - p.y) * 0.08;

        // Mouse repulsion force
        let repX = 0;
        let repY = 0;
        if (dist < repulsionRadius && dist > 0) {
          const force = ((repulsionRadius - dist) / repulsionRadius) * 5;
          repX = (dx / dist) * force;
          repY = (dy / dist) * force;
        }

        // Velocity with damping
        p.vx = (p.vx + springX + repX) * 0.75;
        p.vy = (p.vy + springY + repY) * 0.75;
        p.x += p.vx;
        p.y += p.vy;

        // Breathing pulse
        const pulse  = 0.8 + 0.4 * Math.sin(time + p.phase);
        const radius = 1.5 * pulse;

        // Color shift — accent → accent2 as cursor approaches
        const proximity = dist < repulsionRadius
          ? Math.max(0, 1 - dist / repulsionRadius)
          : 0;

        const r = Math.round(lerp(ACCENT.r, ACCENT_2.r, proximity));
        const g = Math.round(lerp(ACCENT.g, ACCENT_2.g, proximity));
        const b = Math.round(lerp(ACCENT.b, ACCENT_2.b, proximity));

        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.25 + proximity * 0.4})`;
        ctx.fill();
      }

      frame++;
      rafRef.current = requestAnimationFrame(draw);
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    resize();
    rafRef.current = requestAnimationFrame(draw);

    const observer = new ResizeObserver(resize);
    observer.observe(container);

    window.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);

    return () => {
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
      window.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [spacing, repulsionRadius]);

  return (
    <div ref={containerRef} className={cn('relative w-full h-full', className)} aria-hidden="true">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
