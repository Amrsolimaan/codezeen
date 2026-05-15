import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SplitText } from '@/components/animations/SplitText';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { WorkPageClient } from '@/components/sections/WorkPageClient';
import { client } from '@/sanity/lib/client';
import { ALL_PROJECTS_QUERY } from '@/sanity/lib/queries';
import type { WorkProject } from '@/components/sections/WorkPageClient';
import { makeBreadcrumbJsonLd } from '@/lib/utils';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'work.meta' });
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
      canonical: `/${locale}/work`,
      languages: { en: '/en/work', ar: '/ar/work' },
    },
  };
}

export default async function WorkPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, tNav, tCommon] = await Promise.all([
    getTranslations({ locale, namespace: 'work' }),
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'common' }),
  ]);

  let projects: WorkProject[] = [];
  try {
    projects = (await client.fetch(ALL_PROJECTS_QUERY)) ?? [];
  } catch {
    projects = [];
  }

  const siteUrl = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://codezeen.com';
  const breadcrumbJsonLd = makeBreadcrumbJsonLd(siteUrl, locale, tCommon('home'), [
    { name: tNav('work'), path: '/work' },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
      {/* Page header */}
      <ScrollReveal className="mb-16">
        <p className="mb-3 font-mono text-sm text-[var(--color-accent)]">
          {t('projectsCount', { count: projects.length })}
        </p>
        <SplitText as="h1" className="font-serif text-5xl text-[var(--color-text-1)] sm:text-6xl lg:text-7xl">
          {t('title')}
        </SplitText>
        <p className="mt-5 max-w-xl text-[var(--color-text-2)]">{t('subtitle')}</p>
      </ScrollReveal>

      {/* Client-side filter + grid/list */}
      <WorkPageClient projects={projects} />
    </section>
    </>
  );
}
