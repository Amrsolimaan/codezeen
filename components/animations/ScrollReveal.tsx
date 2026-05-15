'use client';

import { type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

interface ScrollRevealProps {
  /** Content to reveal on scroll */
  children: ReactNode;
  /** Direction the element slides in from (default: up) */
  direction?: Direction;
  /** Slide distance in pixels (default: 40) */
  distance?: number;
  /** Animation duration in seconds (default: 0.6) */
  duration?: number;
  /** Delay in seconds (default: 0) */
  delay?: number;
  /** Additional className for the wrapper */
  className?: string;
  /** Viewport margin before triggering (default: "-100px") */
  margin?: string;
}

function directionOffset(direction: Direction, distance: number): { x?: number; y?: number } {
  switch (direction) {
    case 'up':    return { y: distance };
    case 'down':  return { y: -distance };
    case 'left':  return { x: distance };
    case 'right': return { x: -distance };
    case 'none':  return {};
  }
}

export function ScrollReveal({
  children,
  direction = 'up',
  distance = 40,
  duration = 0.6,
  delay = 0,
  className,
  margin = '-100px',
}: ScrollRevealProps) {
  const prefersReducedMotion = useReducedMotion();

  const offset = prefersReducedMotion ? {} : directionOffset(direction, distance);

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin }}
      transition={{
        duration: prefersReducedMotion ? 0.3 : duration,
        delay: prefersReducedMotion ? 0 : delay,
        ease: 'easeOut',
      }}
    >
      {children}
    </motion.div>
  );
}
