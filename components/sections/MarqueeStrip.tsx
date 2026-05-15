import { getTranslations } from 'next-intl/server';

interface MarqueeStripProps {
  locale: string;
}

export async function MarqueeStrip({ locale }: MarqueeStripProps) {
  const t = await getTranslations({ locale, namespace: 'home.marquee' });
  const items = t.raw('items') as string[];

  // Duplicate so translateX(-50%) creates a seamless loop:
  // the element is 2× wide; moving left by 50% = exactly one set of items.
  const doubled = [...items, ...items];

  return (
    <div dir="ltr" className="marquee-strip overflow-hidden border-y border-[var(--color-border)] py-5">
      {/*
        The animation lives here — NOT on the outer container — so that
        overflow-hidden clips correctly and mask-image applies to the window,
        not the moving track.
      */}
      <ul
        className="animate-marquee flex w-max"
        role="list"
        aria-label="Tech stack"
      >
        {doubled.map((item, i) => (
          <li
            key={i}
            className="flex items-center whitespace-nowrap font-mono text-sm text-[var(--color-text-3)]"
          >
            {item}
            <span className="mx-8 text-[var(--color-border-hover)]" aria-hidden="true">
              /
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
