'use client';

import { useRef, useLayoutEffect } from 'react';
import { useTranslations } from 'next-intl';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface StatData {
  raw: string;
  num: number;
  suffix: string;
  label: string;
}

function parseStatValue(raw: string): { num: number; suffix: string } {
  const match = raw.match(/^(\d+)(.*)$/);
  if (!match) return { num: 0, suffix: raw };
  return { num: parseInt(match[1] ?? '0', 10), suffix: match[2] ?? '' };
}

export function StatsCounter() {
  const t = useTranslations('home.stats');

  const statsList: StatData[] = [
    { raw: t('projects'), label: t('projectsLabel'), ...parseStatValue(t('projects')) },
    { raw: t('clients'),  label: t('clientsLabel'),  ...parseStatValue(t('clients')) },
    { raw: t('years'),    label: t('yearsLabel'),     ...parseStatValue(t('years')) },
    { raw: t('satisfaction'), label: t('satisfactionLabel'), ...parseStatValue(t('satisfaction')) },
  ];

  const containerRef = useRef<HTMLElement>(null);
  const valueRefs    = useRef<(HTMLSpanElement | null)[]>([]);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      statsList.forEach((stat, i) => {
        const el = valueRefs.current[i];
        if (!el) return;

        if (prefersReducedMotion) {
          el.textContent = stat.raw;
          return;
        }

        const obj = { value: 0 };

        gsap.to(obj, {
          value: stat.num,
          duration: 2.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true,
          },
          onUpdate() {
            el.textContent = Math.round(obj.value) + stat.suffix;
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section ref={containerRef} className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <ul
          className="grid grid-cols-2 gap-px border border-[var(--color-border)] bg-[var(--color-border)] lg:grid-cols-4"
          role="list"
        >
          {statsList.map((stat, i) => (
            <li
              key={stat.label}
              className="flex flex-col items-center justify-center gap-2 bg-[var(--color-bg)] p-8 text-center"
            >
              <span
                ref={(el) => { valueRefs.current[i] = el; }}
                className="font-serif text-5xl font-normal text-[var(--color-text-1)] sm:text-6xl"
                aria-label={stat.raw}
              >
                {stat.raw}
              </span>
              <span className="text-sm text-[var(--color-text-3)]">
                {stat.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
