import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import * as LucideIcons from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { SplitText } from '@/components/animations/SplitText';
import { ProcessSteps } from '@/components/sections/ProcessSteps';
import { client } from '@/sanity/lib/client';
import { ALL_SERVICES_QUERY } from '@/sanity/lib/queries';
import { cn, makeBreadcrumbJsonLd } from '@/lib/utils';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'services.meta' });
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
      canonical: `/${locale}/services`,
      languages: { en: '/en/services', ar: '/ar/services' },
    },
  };
}

// ─── Dynamic Lucide icon by name ─────────────────────────────────────────────

type IconComponent = React.FC<LucideProps>;

function ServiceIcon({ name }: { name: string }) {
  const icons = LucideIcons as Record<string, unknown>;
  const Icon = icons[name] as IconComponent | undefined;
  if (!Icon || typeof Icon !== 'function') return null;
  return <Icon size={28} aria-hidden="true" />;
}

// ─── Service Card ─────────────────────────────────────────────────────────────

interface Service {
  _id: string;
  title: { en: string; ar?: string | null };
  slug: { current: string };
  icon: string;
  shortDesc: { en?: string | null; ar?: string | null } | null;
  features: { en?: string[] | null; ar?: string[] | null } | null;
  featured: boolean;
  order: number;
}

function ServiceCard({
  service,
  locale,
}: {
  service: Service;
  locale: string;
}) {
  const title = locale === 'ar' ? (service.title.ar ?? service.title.en) : service.title.en;
  const desc =
    locale === 'ar'
      ? (service.shortDesc?.ar ?? service.shortDesc?.en)
      : service.shortDesc?.en;
  const features =
    locale === 'ar'
      ? (service.features?.ar ?? service.features?.en)
      : service.features?.en;

  return (
    <div
      className={cn(
        'group flex h-full flex-col p-7 border border-[var(--color-border)]',
        'bg-[var(--color-surface)]',
        'transition-colors duration-300 hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface-2)]',
      )}
    >
      {/* Icon */}
      <div className="mb-5 text-[var(--color-accent)]">
        <ServiceIcon name={service.icon} />
      </div>

      {/* Title */}
      <h3 className="mb-3 font-serif text-xl text-[var(--color-text-1)] sm:text-2xl">
        {title}
      </h3>

      {/* Short description */}
      {desc && (
        <p className="mb-6 text-sm text-[var(--color-text-2)] leading-relaxed">{desc}</p>
      )}

      {/* Feature list */}
      {features && features.length > 0 && (
        <ul className="mt-auto space-y-2" role="list">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-text-3)]">
              <span
                className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]"
                aria-hidden="true"
              />
              {feature}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ServicesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, tNav, tCommon] = await Promise.all([
    getTranslations({ locale, namespace: 'services' }),
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'common' }),
  ]);

  let services: Service[] = [];
  try {
    services = (await client.fetch(ALL_SERVICES_QUERY)) ?? [];
  } catch {
    services = [];
  }

  const processStepsRaw = t.raw('process.steps') as Array<{
    number: string;
    title: string;
    body: string;
  }>;

  const siteUrl = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://codezeen.com';
  const breadcrumbJsonLd = makeBreadcrumbJsonLd(siteUrl, locale, tCommon('home'), [
    { name: tNav('services'), path: '/services' },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
        <ScrollReveal className="mb-16">
          <SplitText
            as="h1"
            className="font-serif text-5xl text-[var(--color-text-1)] sm:text-6xl lg:text-7xl"
          >
            {t('title')}
          </SplitText>
          <p className="mt-5 max-w-xl text-[var(--color-text-2)]">{t('subtitle')}</p>
        </ScrollReveal>

        {/* Service cards */}
        {services.length === 0 ? (
          <ScrollReveal>
            <p className="text-[var(--color-text-3)]">{t('noServices')}</p>
          </ScrollReveal>
        ) : (
          <ul
            className="grid grid-cols-1 gap-6 sm:grid-cols-2"
            role="list"
          >
            {services.map((service, i) => (
              <ScrollReveal key={service._id} delay={i * 0.08}>
                <li className="h-full">
                  <ServiceCard service={service} locale={locale} />
                </li>
              </ScrollReveal>
            ))}
          </ul>
        )}
      </section>

      {/* Process */}
      {processStepsRaw.length > 0 && (
        <ProcessSteps
          title={t('process.title')}
          subtitle={t('process.subtitle')}
          steps={processStepsRaw}
        />
      )}
    </>
  );
}
