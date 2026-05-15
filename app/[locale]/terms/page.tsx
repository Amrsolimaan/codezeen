import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ScrollReveal } from '@/components/animations/ScrollReveal';

type Props = { params: Promise<{ locale: string }> };

interface PolicySection {
  title: string;
  body: string;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'terms.meta' });
  return {
    title: t('title'),
    robots: { index: false, follow: false },
  };
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'terms' });
  const sections = t.raw('sections') as PolicySection[];

  return (
    <div className="mx-auto max-w-[720px] px-6 py-24 lg:py-32">
      <ScrollReveal>
        <h1 className="font-serif text-4xl text-[var(--color-text-1)] sm:text-5xl">
          {t('title')}
        </h1>
        <p className="mt-3 font-mono text-sm text-[var(--color-text-3)]">
          {t('lastUpdated')}
        </p>
        <p className="mt-6 text-base leading-relaxed text-[var(--color-text-2)]">
          {t('intro')}
        </p>
      </ScrollReveal>

      <div className="mt-12 space-y-10">
        {sections.map((section, i) => (
          <ScrollReveal key={section.title} delay={i * 0.08}>
            <h2 className="mb-3 font-semibold text-xl text-[var(--color-text-1)]">
              {section.title}
            </h2>
            <p className="text-base leading-relaxed text-[var(--color-text-2)]">
              {section.body}
            </p>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
