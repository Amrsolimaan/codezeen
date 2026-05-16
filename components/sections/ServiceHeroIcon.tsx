'use client';

import { motion, useReducedMotion } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils';

type IconComponent = React.FC<LucideProps>;

interface ServiceHeroIconProps {
  name: string;
  className?: string;
}

export function ServiceHeroIcon({ name, className }: ServiceHeroIconProps) {
  const reduce = useReducedMotion();
  const icons = LucideIcons as Record<string, unknown>;
  const Icon = icons[name] as IconComponent | undefined;

  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      {/* Outer glow blob */}
      <div
        className="absolute h-56 w-56 rounded-full bg-[var(--color-accent)] opacity-[0.07] blur-3xl"
        aria-hidden="true"
      />

      {/* Pulsing ring */}
      <motion.div
        className="absolute h-44 w-44 rounded-full border border-[var(--color-accent)]/20"
        animate={reduce ? {} : { scale: [1, 1.12, 1], opacity: [0.6, 0.2, 0.6] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden="true"
      />

      {/* Second ring */}
      <motion.div
        className="absolute h-36 w-36 rounded-full border border-[var(--color-accent)]/10"
        animate={reduce ? {} : { scale: [1.05, 1, 1.05], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        aria-hidden="true"
      />

      {/* Icon card — floating */}
      <motion.div
        className={cn(
          'relative z-10 flex h-32 w-32 items-center justify-center rounded-3xl',
          'border border-[var(--color-accent)]/25',
          'bg-gradient-to-br from-[var(--color-surface-2)] to-[var(--color-logo-dark)]/60',
          'text-[var(--color-accent)]',
          'shadow-[0_0_48px_-8px_rgba(59,125,216,0.3)]',
        )}
        animate={reduce ? {} : { y: [0, -12, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        {Icon ? (
          <Icon size={56} strokeWidth={1.5} aria-hidden="true" />
        ) : (
          <div className="h-12 w-12 rounded-xl bg-[var(--color-accent)]/20" aria-hidden="true" />
        )}
      </motion.div>
    </div>
  );
}
