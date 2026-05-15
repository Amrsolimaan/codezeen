'use client';

import { useRef, useEffect } from 'react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&';

interface TextScrambleProps {
  /** Text to reveal through scramble effect */
  children: string;
  /** Additional className for the span wrapper */
  className?: string;
  /** Frames per character resolved — lower = faster (default: 3) */
  speed?: number;
  /** IntersectionObserver rootMargin before triggering (default: "-50px") */
  margin?: string;
}

export function TextScramble({
  children,
  className,
  speed = 3,
  margin = '-50px',
}: TextScrambleProps) {
  const spanRef   = useRef<HTMLSpanElement>(null);
  const rafRef    = useRef<number>(0);
  const resolvedRef = useRef(0);
  const frameRef  = useRef(0);

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) {
      el.textContent = children;
      return;
    }

    const len  = children.length;

    const scramble = () => {
      frameRef.current++;

      // Resolve one more character every `speed` frames
      if (frameRef.current % speed === 0) {
        resolvedRef.current = Math.min(resolvedRef.current + 1, len);
      }

      // Resolved prefix + scrambled suffix
      let output = children.slice(0, resolvedRef.current);
      for (let i = resolvedRef.current; i < len; i++) {
        if (children[i] === ' ') {
          output += ' ';
        } else {
          output += CHARS[Math.floor(Math.random() * CHARS.length)] ?? children[i];
        }
      }

      el.textContent = output;

      if (resolvedRef.current < len) {
        rafRef.current = requestAnimationFrame(scramble);
      }
    };

    const start = () => {
      cancelAnimationFrame(rafRef.current);
      resolvedRef.current = 0;
      frameRef.current    = 0;
      rafRef.current      = requestAnimationFrame(scramble);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            start();
            observer.disconnect();
          }
        }
      },
      { rootMargin: margin },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [children, speed, margin]);

  // aria-label preserves readable text for screen readers while visuals scramble
  return (
    <span ref={spanRef} className={className} aria-label={children}>
      {children}
    </span>
  );
}
