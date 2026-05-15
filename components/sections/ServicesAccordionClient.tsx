'use client';

import { useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ServiceItem {
  _id: string;
  title: { en: string; ar?: string | null } | null;
  icon: string | null;
  shortDesc?: { en?: string | null; ar?: string | null } | null;
  features?: { en?: string[] | null; ar?: string[] | null } | null;
  slug: { current: string } | null;
}

interface ServicesAccordionClientProps {
  services: ServiceItem[];
  locale: string;
}

export function ServicesAccordionClient({ services, locale }: ServicesAccordionClientProps) {
  // Track which item is open and its content element
  const openIndexRef  = useRef<number | null>(null);
  const contentRefs   = useRef<(HTMLDivElement | null)[]>([]);
  const iconRefs      = useRef<(HTMLDivElement | null)[]>([]);

  const setContentRef = useCallback((el: HTMLDivElement | null, i: number) => {
    contentRefs.current[i] = el;
  }, []);

  const setIconRef = useCallback((el: HTMLDivElement | null, i: number) => {
    iconRefs.current[i] = el;
  }, []);

  const closeItem = (index: number) => {
    const content = contentRefs.current[index];
    const icon    = iconRefs.current[index];
    if (!content) return;

    gsap.to(content, {
      clipPath: 'inset(0 0 100% 0)',
      height: 0,
      duration: 0.32,
      ease: 'power3.in',
    });
    if (icon) gsap.to(icon, { rotation: 0, duration: 0.25 });
  };

  const openItem = (index: number) => {
    const content = contentRefs.current[index];
    const icon    = iconRefs.current[index];
    if (!content) return;

    // Measure full height
    gsap.set(content, { height: 'auto', clipPath: 'inset(0 0 100% 0)' });
    const height = content.scrollHeight;

    gsap.fromTo(
      content,
      { height: 0, clipPath: 'inset(0 0 100% 0)' },
      { height, clipPath: 'inset(0 0 0% 0)', duration: 0.42, ease: 'power3.out' },
    );
    if (icon) gsap.to(icon, { rotation: 180, duration: 0.3 });
  };

  const toggle = (index: number) => {
    const prev = openIndexRef.current;

    if (prev === index) {
      // Close current
      closeItem(index);
      openIndexRef.current = null;
    } else {
      // Close previous if open
      if (prev !== null) closeItem(prev);
      // Open new
      openItem(index);
      openIndexRef.current = index;
    }
  };

  return (
    <ul role="list" className="divide-y divide-[var(--color-border)]">
      {services.map((service, i) => {
        const title    = (locale === 'ar' && service.title?.ar) ? service.title.ar : (service.title?.en ?? '');
        const desc     = (locale === 'ar' && service.shortDesc?.ar) ? service.shortDesc.ar : (service.shortDesc?.en ?? '');
        const features = (locale === 'ar' && service.features?.ar?.length) ? service.features.ar : (service.features?.en ?? []);
        const num      = String(i + 1).padStart(2, '0');

        return (
          <li key={service._id}>
            <button
              type="button"
              onClick={() => toggle(i)}
              aria-expanded={openIndexRef.current === i}
              className={cn(
                'group flex w-full items-center gap-6 py-6 text-start',
                'transition-colors duration-200',
                'hover:text-[var(--color-text-1)]',
              )}
            >
              {/* Number */}
              <span className="shrink-0 font-mono text-xs text-[var(--color-text-3)]">
                {num}
              </span>

              {/* Title */}
              <span className="flex-1 font-serif text-2xl font-normal text-[var(--color-text-1)] sm:text-3xl">
                {title}
              </span>

              {/* Toggle icon */}
              <div
                ref={(el) => setIconRef(el, i)}
                className="shrink-0 text-[var(--color-text-3)] transition-colors group-hover:text-[var(--color-accent)]"
                aria-hidden="true"
              >
                <Plus size={18} />
              </div>
            </button>

            {/* Expanded content — starts clipped (height: 0, clipPath closed) */}
            <div
              ref={(el) => setContentRef(el, i)}
              style={{ height: 0, overflow: 'hidden', clipPath: 'inset(0 0 100% 0)' }}
            >
              <div className="pb-8 ps-10">
                {desc && (
                  <p className="mb-5 max-w-2xl text-base leading-relaxed text-[var(--color-text-2)]">
                    {desc}
                  </p>
                )}

                {features.length > 0 && (
                  <ul className="grid gap-2 sm:grid-cols-2" role="list">
                    {features.map((feat) => (
                      <li
                        key={feat}
                        className="flex items-start gap-2 text-sm text-[var(--color-text-2)]"
                      >
                        <span
                          className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]"
                          aria-hidden="true"
                        />
                        {feat}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
