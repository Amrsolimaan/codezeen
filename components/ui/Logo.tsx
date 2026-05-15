import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  /** Show only the mark (no wordmark) — for small spaces */
  markOnly?: boolean;
  /** Override the logo asset — e.g. '/logo-white.svg' for dark backgrounds */
  src?: string;
  /** Image render width in px (must match aspect ratio of the SVG mark) */
  imageWidth?: number;
  /** Image render height in px */
  imageHeight?: number;
  /**
   * Colour scheme for the wordmark.
   * default  — "Code" white,  "zeen" accent  (header / light contexts)
   * footer   — "Code" accent, "zeen" white    (dark footer)
   */
  variant?: 'default' | 'footer';
}

export function Logo({
  className,
  markOnly = false,
  src = '/logo.svg',
  imageWidth = 36,
  imageHeight = 44,
  variant = 'default',
}: LogoProps) {
  const codeClass =
    variant === 'footer'
      ? 'text-[var(--color-accent)]'
      : 'text-[var(--color-text-1)]';

  const zeenClass =
    variant === 'footer'
      ? 'text-[var(--color-text-1)]'
      : 'text-[var(--color-accent)]';

  return (
    <span className={cn('inline-flex items-center gap-2.5 select-none', className)}>
      <Image
        src={src}
        alt={markOnly ? 'Codezeen' : ''}
        width={imageWidth}
        height={imageHeight}
        priority
      />

      {!markOnly && (
        <span className={cn('font-semibold text-[1.05rem] leading-none tracking-tight', codeClass)}>
          Code
          <span className={zeenClass}>zeen</span>
        </span>
      )}
    </span>
  );
}
