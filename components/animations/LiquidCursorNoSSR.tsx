"use client";

import dynamic from 'next/dynamic';

const LiquidCursor = dynamic(
  () => import('@/components/animations/LiquidCursor').then((m) => m.LiquidCursor),
  { ssr: false }
);

export default LiquidCursor;