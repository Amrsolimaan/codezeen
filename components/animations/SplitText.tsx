'use client';

import { useRef, useLayoutEffect, createElement } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

type Tag = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'div' | 'span';

interface SplitTextProps {
  /** Text to animate — plain string only */
  children: string;
  /** Semantic element to render (default: div) */
  as?: Tag;
  /** Additional Tailwind / CSS classes */
  className?: string;
  /** ScrollTrigger start position (default: "top 85%") */
  triggerStart?: string;
  /** Delay in seconds before animation begins */
  delay?: number;
}

export function SplitText({
  children,
  as = 'div',
  className,
  triggerStart = 'top 85%',
  delay = 0,
}: SplitTextProps) {
  const containerRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Must register inside effect — CLAUDE.md rule
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Manual word split — wraps each word to clip overflow on slide-up
    const words = children.trim().split(/\s+/);
    el.innerHTML = words
      .map(
        (word) =>
          `<span style="display:inline-block;overflow:hidden;vertical-align:bottom;">` +
          `<span style="display:inline-block;">${word}</span></span>`,
      )
      .join(' ');

    const innerSpans = Array.from(el.querySelectorAll<HTMLElement>('span > span'));

    const ctx = gsap.context(() => {
      gsap.from(innerSpans, {
        y: prefersReducedMotion ? 0 : (i: number) => 40 + (i % 3) * 20,
        opacity: 0,
        duration: prefersReducedMotion ? 0.3 : 0.8,
        ease: 'power3.out',
        stagger: { each: 0.05, from: 'center' },
        delay,
        scrollTrigger: {
          trigger: el,
          start: triggerStart,
          toggleActions: 'play none none none',
        },
      });
    }, el);

    return () => ctx.revert();
  }, [children, triggerStart, delay]);

  return createElement(as, { ref: containerRef, className });
}
