import type { ReactNode } from 'react';

// Root layout is a minimal pass-through. The html/body shell lives in
// app/[locale]/layout.tsx so the [locale] segment can set lang/dir server-side,
// and in app/studio/layout.tsx for the Sanity Studio route.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
