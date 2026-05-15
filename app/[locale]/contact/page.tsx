import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Mail } from 'lucide-react';
import { makeBreadcrumbJsonLd } from '@/lib/utils';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { SplitText } from '@/components/animations/SplitText';
import { ContactForm } from '@/components/sections/ContactForm';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contact.meta' });
  const title = t('title');
  const description = t('description');
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: '/og-default.png', width: 1200, height: 630 }],
      type: 'website',
    },
    alternates: {
      canonical: `/${locale}/contact`,
      languages: { en: '/en/contact', ar: '/ar/contact' },
    },
  };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, footer, tNav, tCommon] = await Promise.all([
    getTranslations({ locale, namespace: 'contact' }),
    getTranslations({ locale, namespace: 'footer' }),
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'common' }),
  ]);

  const siteUrl = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://codezeen.com';
  const breadcrumbJsonLd = makeBreadcrumbJsonLd(siteUrl, locale, tCommon('home'), [
    { name: tNav('contact'), path: '/contact' },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-5">
        {/* Left — info (2 cols) */}
        <div className="lg:col-span-2">
          <ScrollReveal>
            <p className="mb-3 font-mono text-sm text-[var(--color-accent)]">{t('subtitle')}</p>
            <SplitText
              as="h1"
              className="font-serif text-4xl text-[var(--color-text-1)] sm:text-5xl"
            >
              {t('title')}
            </SplitText>
          </ScrollReveal>

          <ScrollReveal delay={0.12} className="mt-10 space-y-6">
            <p className="text-[var(--color-text-2)]">
              {t('replyNote')}
            </p>

            <a
              href={`mailto:${footer('connect.email')}`}
              className="flex items-center gap-2 text-[var(--color-text-2)] transition-colors hover:text-[var(--color-accent)]"
              aria-label={`Email ${footer('connect.email')}`}
            >
              <Mail size={16} aria-hidden="true" />
              {footer('connect.email')}
            </a>
          </ScrollReveal>
        </div>

        {/* Right — form (3 cols) */}
        <ScrollReveal delay={0.1} className="lg:col-span-3">
          <ContactForm />
        </ScrollReveal>
      </div>
    </section>
    </>
  );
}
