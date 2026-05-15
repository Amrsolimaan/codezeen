'use client';

import { useRef, useEffect, type ReactNode } from 'react';
import { gsap } from 'gsap';

interface MagneticElementProps {
  /** Content to apply magnetic effect to */
  children: ReactNode;
  /** Activation radius in pixels — cursor must be within this distance (default: 80) */
  radius?: number;
  /** Pull strength — 0 (none) to 1 (full follow) (default: 0.35) */
  strength?: number;
  /** Additional className for the wrapper */
  className?: string;
}

export function MagneticElement({
  children,
  radius = 80,
  strength = 0.35,
  className,
}: MagneticElementProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      const distance = Math.sqrt(distX ** 2 + distY ** 2);

      if (distance < radius) {
        gsap.to(el, {
          x: distX * strength,
          y: distY * strength,
          duration: 0.4,
          ease: 'power2.out',
        });
      }
    };

    const handleMouseLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.3)' });
    };

    window.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
      gsap.killTweensOf(el);
    };
  }, [radius, strength]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
