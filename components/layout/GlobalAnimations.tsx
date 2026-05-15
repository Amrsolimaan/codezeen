'use client';

import dynamic from 'next/dynamic';
import { SmoothScroll } from '@/components/layout/SmoothScroll';

const LiquidCursor = dynamic(
  () => import('@/components/animations/LiquidCursor').then((m) => m.LiquidCursor),
  { ssr: false },
);

/** Mounts client-only animation layers that wrap the entire app. */
export function GlobalAnimations() {
  return (
    <>
      <SmoothScroll />
      <LiquidCursor />
    </>
  );
}
