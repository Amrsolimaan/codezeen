import '@/styles/globals.css';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-bg)] px-6 text-center antialiased">
        <p className="mb-2 font-mono text-sm uppercase text-[var(--color-accent)]">
          Error 404
        </p>

        <h1
          className="mb-6 font-serif text-[clamp(6rem,20vw,14rem)] leading-none text-[var(--color-border-hover)]"
          aria-label="Page not found"
        >
          404
        </h1>

        <p className="mb-10 max-w-md text-[var(--color-text-2)]">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <Link
          href="/en"
          className="flex items-center gap-2 border border-[var(--color-border)] px-6 py-3 font-mono text-sm text-[var(--color-text-2)] transition-colors hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-1)]"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Back to Home
        </Link>
      </body>
    </html>
  );
}
