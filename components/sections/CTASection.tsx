import { getTranslations } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/lib/navigation';
import { MagneticElement } from '@/components/animations/MagneticElement';
import { ScrollReveal } from '@/components/animations/ScrollReveal';

interface CTASectionProps {
  locale: string;
}

export async function CTASection({ locale }: CTASectionProps) {
  const t = await getTranslations({ locale, namespace: 'home.cta' });

  return (
    <section className="border-y border-[var(--color-border)] bg-[var(--color-surface-2)] py-28 lg:py-36">
      <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">

        <ScrollReveal>
          <h2 className="font-serif text-4xl font-normal text-[var(--color-text-1)] sm:text-5xl lg:text-6xl">
            {t('headline')}
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.12}>
          <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-[var(--color-text-2)]">
            {t('subheadline')}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.24}>
          <div className="mt-10 flex justify-center">
            <MagneticElement>
              <Link
                href="/contact"
                className="inline-flex h-14 items-center gap-2 rounded-full bg-[var(--color-accent)] px-8 text-base font-semibold text-white transition-all duration-200 hover:bg-[var(--color-logo-mid)] active:scale-95"
              >
                {t('button')}
                <ArrowRight size={18} aria-hidden="true" className="rtl:rotate-180" />
              </Link>
            </MagneticElement>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}
