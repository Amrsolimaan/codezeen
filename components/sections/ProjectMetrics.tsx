'use client';

import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface Metric {
  label: { en?: string | null; ar?: string | null };
  value: string;
}

interface ProjectMetricsProps {
  metrics: Metric[];
  locale: string;
}

function parseValue(raw: string): { num: number; suffix: string; prefix: string } {
  const trimmed = raw.trim();
  const match = trimmed.match(/^([^0-9]*)(\d[\d.,]*)(.*)$/);
  if (!match) return { num: 0, suffix: raw, prefix: '' };
  const prefix = match[1] ?? '';
  const numStr = (match[2] ?? '0').replace(/,/g, '');
  const suffix = match[3] ?? '';
  return { num: parseFloat(numStr), suffix, prefix };
}

export function ProjectMetrics({ metrics, locale }: ProjectMetricsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const valueRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const parsed = metrics.map((m) => parseValue(m.value));

    const ctx = gsap.context(() => {
      parsed.forEach(({ num, suffix, prefix }, i) => {
        const el = valueRefs.current[i];
        if (!el) return;

        if (prefersReducedMotion) {
          el.textContent = metrics[i]?.value ?? '';
          return;
        }

        const isFloat = !Number.isInteger(num);
        const obj = { value: 0 };

        gsap.to(obj, {
          value: num,
          duration: 2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true,
          },
          onUpdate() {
            el.textContent =
              prefix + (isFloat ? obj.value.toFixed(1) : Math.round(obj.value)) + suffix;
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [metrics]);

  return (
    <div
      ref={containerRef}
      className="grid grid-cols-2 gap-px bg-[var(--color-border)] lg:grid-cols-4"
    >
      {metrics.map((metric, i) => {
        const label =
          locale === 'ar'
            ? (metric.label.ar ?? metric.label.en ?? '')
            : (metric.label.en ?? '');
        return (
          <div
            key={i}
            className="flex flex-col items-center gap-3 bg-[var(--color-surface)] px-6 py-12 text-center"
          >
            <span
              ref={(el) => {
                valueRefs.current[i] = el;
              }}
              className="font-serif text-5xl font-normal text-[var(--color-accent)] sm:text-6xl"
              aria-label={metric.value}
            >
              {metric.value}
            </span>
            <span className="text-sm leading-snug text-[var(--color-text-3)]">{label}</span>
          </div>
        );
      })}
    </div>
  );
}
