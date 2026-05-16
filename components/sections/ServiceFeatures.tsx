'use client';

import { motion, useReducedMotion, type Variants } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceFeaturesProps {
  features: string[];
}

export function ServiceFeatures({ features }: ServiceFeaturesProps) {
  const reduce = useReducedMotion();

  const container: Variants = {
    hidden: {},
    show: {
      transition: { staggerChildren: reduce ? 0 : 0.08, delayChildren: 0.1 },
    },
  };

  const item: Variants = {
    hidden: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <motion.ul
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      role="list"
    >
      {features.map((feature, i) => (
        <motion.li
          key={i}
          variants={item}
          className={cn(
            'flex items-start gap-3 rounded-2xl',
            'border border-[var(--color-border)] bg-[var(--color-surface)]',
            'p-5 transition-all duration-300',
            'hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface-2)]',
            'hover:-translate-y-0.5 hover:shadow-[0_6px_24px_-6px_rgba(59,125,216,0.18)]',
          )}
        >
          <CheckCircle2
            size={18}
            className="mt-0.5 shrink-0 text-[var(--color-accent)]"
            aria-hidden="true"
          />
          <span className="text-sm leading-relaxed text-[var(--color-text-2)]">{feature}</span>
        </motion.li>
      ))}
    </motion.ul>
  );
}
