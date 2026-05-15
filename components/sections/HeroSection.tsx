import { getTranslations } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/lib/navigation';
import { SplitText } from '@/components/animations/SplitText';
import { MagneticElement } from '@/components/animations/MagneticElement';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { HeroBackground } from './HeroBackground';
import { HeroScrollIndicator } from './HeroScrollIndicator';

interface HeroSectionProps {
  locale: string;
}

export async function HeroSection({ locale }: HeroSectionProps) {
  const t = await getTranslations({ locale, namespace: 'home.hero' });

  // Split on literal \n in the JSON value to get visual line breaks
  const headlineLines = t('headline').split('\n');

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden">
      {/* Canvas particle grid background */}
      <HeroBackground />

      {/* Bottom fade into page bg */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-48"
        style={{ background: 'linear-gradient(to bottom, transparent, var(--color-bg))' }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-24 pt-36 lg:px-8">

        {/* Badge */}
        <ScrollReveal delay={0.05} margin="0px">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" aria-hidden="true" />
            <span className="text-xs font-medium text-[var(--color-text-2)]">
              {t('tagline')}
            </span>
          </div>
        </ScrollReveal>

        {/* Headline — each JSON line gets its own staggered SplitText */}
        <h1 className="font-serif text-[clamp(2.5rem,7vw,5.5rem)] font-normal leading-tight text-[var(--color-text-1)]">
          {headlineLines.map((line, i) => (
            <SplitText
              key={line}
              as="span"
              className="block"
              triggerStart="top bottom"
              delay={0.1 + i * 0.08}
            >
              {line.trim()}
            </SplitText>
          ))}
        </h1>

        {/* Subheadline */}
        <ScrollReveal delay={0.35} margin="0px">
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--color-text-2)]">
            {t('subheadline')}
          </p>
        </ScrollReveal>

        {/* CTA row — rtl:flex-row-reverse for Arabic */}
        <ScrollReveal delay={0.5} margin="0px">
          <div className="mt-10 flex flex-wrap items-center gap-4 rtl:flex-row-reverse">
            <MagneticElement>
              <Link
                href="/work"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-[var(--color-accent)] px-6 text-sm font-semibold text-white transition-all duration-200 hover:bg-[var(--color-logo-mid)] active:scale-95"
              >
                {t('cta')}
                <ArrowRight size={16} aria-hidden="true" className="rtl:rotate-180" />
              </Link>
            </MagneticElement>

            <MagneticElement>
              <Link
                href="/contact"
                className="inline-flex h-12 items-center rounded-full border border-[var(--color-border)] px-6 text-sm font-semibold text-[var(--color-text-1)] transition-colors duration-200 hover:border-[var(--color-border-hover)] hover:text-[var(--color-accent)]"
              >
                {t('ctaSecondary')}
              </Link>
            </MagneticElement>
          </div>
        </ScrollReveal>
      </div>

      {/* Scroll indicator — fades out after first scroll */}
      <HeroScrollIndicator />
    </section>
  );
}
