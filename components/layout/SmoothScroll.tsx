'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function SmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(pointer: coarse)').matches;

    // Lenis adds no value on touch (native momentum scroll is better)
    // and must not run when the user has requested reduced motion
    if (prefersReducedMotion || isTouch) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    lenisRef.current = lenis;

    // Keep GSAP ScrollTrigger in sync with Lenis' virtual scroll position
    lenis.on('scroll', () => ScrollTrigger.update());

    // Drive Lenis from GSAP's RAF instead of its own — single animation loop
    const tick = (time: number) => {
      lenis.raf(time * 1000); // GSAP time is in seconds; Lenis expects ms
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0); // Prevents GSAP catching up after tab is hidden

    return () => {
      lenis.destroy();
      gsap.ticker.remove(tick);
      lenisRef.current = null;
    };
  }, []);

  // Scroll to top on every route change (Lenis suppresses the native event,
  // so we must do this manually)
  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return null;
}
