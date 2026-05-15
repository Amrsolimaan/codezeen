'use client';

import dynamic from 'next/dynamic';

const ParticleGrid = dynamic(
  () => import('@/components/animations/ParticleGrid').then((m) => m.ParticleGrid),
  { ssr: false },
);

/** On desktop: animated ParticleGrid. On mobile: static radial gradient. */
export function HeroBackground() {
  return (
    <>
      {/* Static gradient — shown on mobile where particle canvas is disabled */}
      <div
        className="absolute inset-0 z-0 md:hidden bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(59,125,216,0.12)_0%,transparent_70%)]"
        aria-hidden="true"
      />
      {/* Animated particle grid — desktop only */}
      <ParticleGrid className="absolute inset-0 z-0 hidden md:block" />
    </>
  );
}
