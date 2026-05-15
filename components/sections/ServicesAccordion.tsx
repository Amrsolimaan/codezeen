import { getTranslations } from 'next-intl/server';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { client } from '@/sanity/lib/client';
import { FEATURED_SERVICES_QUERY } from '@/sanity/lib/queries';
import { ServicesAccordionClient, type ServiceItem } from './ServicesAccordionClient';

interface ServicesAccordionProps {
  locale: string;
}

function ServicesAccordionSkeleton() {
  return (
    <ul aria-busy="true" aria-label="Loading services" role="list" className="divide-y divide-[var(--color-border)]">
      {[0, 1, 2, 3].map((i) => (
        <li key={i} className="flex items-center gap-6 py-6">
          <div className="h-3 w-6 rounded bg-[var(--color-surface-2)] animate-pulse" />
          <div className="h-7 flex-1 rounded bg-[var(--color-surface-2)] animate-pulse" style={{ maxWidth: `${55 + i * 10}%` }} />
          <div className="h-4 w-4 rounded bg-[var(--color-surface-2)] animate-pulse" />
        </li>
      ))}
    </ul>
  );
}

export async function ServicesAccordion({ locale }: ServicesAccordionProps) {
  const t = await getTranslations({ locale, namespace: 'home.services' });

  let services: ServiceItem[] = [];
  try {
    services = (await client.fetch(FEATURED_SERVICES_QUERY)) as ServiceItem[];
  } catch {
    // Sanity not configured yet — show skeleton
  }

  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        <ScrollReveal>
          <div className="mb-16">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[var(--color-accent)]">
              {t('title')}
            </p>
            <h2 className="font-serif text-3xl font-normal text-[var(--color-text-1)] sm:text-4xl lg:text-5xl">
              {t('subtitle')}
            </h2>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          {services.length === 0 ? (
            <ServicesAccordionSkeleton />
          ) : (
            <ServicesAccordionClient services={services} locale={locale} />
          )}
        </ScrollReveal>

      </div>
    </section>
  );
}
