'use client';

import { useScroll, useSpring, motion, useReducedMotion } from 'motion/react';

export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const prefersReducedMotion = useReducedMotion();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  if (prefersReducedMotion) return null;

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed left-0 top-0 z-50 h-[2px] w-full origin-left bg-[var(--color-accent)]"
      aria-hidden="true"
    />
  );
}
