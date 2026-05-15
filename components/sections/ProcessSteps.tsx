'use client';

import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';

interface Step {
  number: string;
  title: string;
  body: string;
}

interface ProcessStepsProps {
  title: string;
  subtitle: string;
  steps: Step[];
}

export function ProcessSteps({ title, subtitle, steps }: ProcessStepsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const line = lineRef.current;
    if (!container || !line) return;

    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      if (!prefersReducedMotion) {
        gsap.fromTo(
          line,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: container,
              start: 'top 70%',
              end: 'bottom 30%',
              scrub: 1.5,
            },
          },
        );
      }

      const stepEls = container.querySelectorAll<HTMLElement>('[data-step]');
      stepEls.forEach((el, i) => {
        gsap.from(el, {
          opacity: 0,
          y: prefersReducedMotion ? 0 : 30,
          duration: prefersReducedMotion ? 0.3 : 0.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true,
          },
          delay: prefersReducedMotion ? 0 : i * 0.1,
        });
      });
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 max-w-xl">
          <h2 className="font-serif text-3xl text-[var(--color-text-1)] sm:text-4xl">{title}</h2>
          <p className="mt-4 text-[var(--color-text-2)]">{subtitle}</p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Vertical connecting line */}
          <div
            className={cn(
              'absolute left-8 top-0 hidden w-px bg-[var(--color-border)] lg:block',
              'origin-top',
            )}
            style={{ height: '100%' }}
            aria-hidden="true"
          >
            <div
              ref={lineRef}
              className="h-full w-full origin-top bg-[var(--color-accent)]"
            />
          </div>

          <ol className="space-y-12 lg:space-y-16" role="list">
            {steps.map((step) => (
              <li
                key={step.number}
                data-step=""
                className={cn(
                  'relative flex flex-col gap-4 lg:flex-row lg:gap-16',
                  'lg:ps-24',
                )}
              >
                {/* Number circle */}
                <div
                  className={cn(
                    'flex h-16 w-16 shrink-0 items-center justify-center',
                    'border border-[var(--color-border)] bg-[var(--color-bg)]',
                    'font-mono text-sm text-[var(--color-accent)]',
                    'lg:absolute lg:left-0 lg:-translate-x-1/2',
                  )}
                  aria-hidden="true"
                >
                  {step.number}
                </div>

                {/* Content */}
                <div className="flex-1 lg:pt-4">
                  <h3 className="mb-2 font-serif text-xl text-[var(--color-text-1)] sm:text-2xl">
                    {step.title}
                  </h3>
                  <p className="text-[var(--color-text-2)] leading-relaxed">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
