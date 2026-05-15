import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { SplitText } from '@/components/animations/SplitText';
import { TeamGrid } from '@/components/sections/TeamGrid';
import { client } from '@/sanity/lib/client';
import { ALL_TEAM_MEMBERS_QUERY } from '@/sanity/lib/queries';
import { cn, makeBreadcrumbJsonLd } from '@/lib/utils';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about.meta' });
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
      canonical: `/${locale}/about`,
      languages: { en: '/en/about', ar: '/ar/about' },
    },
  };
}

interface TeamMember {
  _id: string;
  name: string;
  role: { en: string; ar?: string | null };
  bio: { en?: string | null; ar?: string | null } | null;
  photo: {
    asset: {
      _id: string;
      url?: string | null;
      metadata?: { lqip?: string | null } | null;
    };
    alt?: string | null;
  };
  linkedin?: string | null;
  github?: string | null;
  twitter?: string | null;
  order: number;
}

interface ValueItem {
  number: string;
  title: string;
  body: string;
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, tNav, tCommon] = await Promise.all([
    getTranslations({ locale, namespace: 'about' }),
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'common' }),
  ]);

  let teamMembers: TeamMember[] = [];
  try {
    teamMembers = (await client.fetch(ALL_TEAM_MEMBERS_QUERY)) ?? [];
  } catch {
    teamMembers = [];
  }

  const valuesItems = t.raw('values.items') as ValueItem[];

  const siteUrl = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://codezeen.com';
  const breadcrumbJsonLd = makeBreadcrumbJsonLd(siteUrl, locale, tCommon('home'), [
    { name: tNav('about'), path: '/about' },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
        <ScrollReveal className="mb-6">
          <p className="mb-3 font-mono text-sm text-[var(--color-accent)]">
            {t('subtitle')}
          </p>
          <SplitText
            as="h1"
            className="font-serif text-5xl text-[var(--color-text-1)] sm:text-6xl lg:text-7xl"
          >
            {t('title')}
          </SplitText>
        </ScrollReveal>

        {/* Mission */}
        <ScrollReveal delay={0.15}>
          <div className="mt-12 max-w-2xl border-s-2 border-[var(--color-accent)] ps-6">
            <p className="mb-1 font-mono text-xs uppercase text-[var(--color-accent)]">
              {t('mission.title')}
            </p>
            <p className="font-serif text-xl text-[var(--color-text-2)] leading-relaxed sm:text-2xl">
              {t('mission.body')}
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* ── Team ──────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-8 lg:pb-32">
        <ScrollReveal className="mb-12">
          <h2 className="font-serif text-3xl text-[var(--color-text-1)] sm:text-4xl">
            {t('team.title')}
          </h2>
        </ScrollReveal>

        <TeamGrid
          members={teamMembers}
          locale={locale}
          emptyMessage={t('team.empty')}
        />
      </section>

      {/* ── Values ────────────────────────────────────────────────────────── */}
      {valuesItems.length > 0 && (
        <section className="border-t border-[var(--color-border)] py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <ScrollReveal className="mb-16">
              <h2 className="font-serif text-3xl text-[var(--color-text-1)] sm:text-4xl">
                {t('values.title')}
              </h2>
            </ScrollReveal>

            <ul
              className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4"
              role="list"
            >
              {valuesItems.map((value, i) => (
                <li key={value.number}>
                <ScrollReveal delay={i * 0.1}>
                  <p
                    className={cn(
                      'mb-4 font-serif text-7xl font-light leading-none',
                      'text-[var(--color-border-hover)]',
                    )}
                    aria-hidden="true"
                  >
                    {value.number}
                  </p>
                  <h3 className="mb-2 font-medium text-[var(--color-text-1)]">
                    {value.title}
                  </h3>
                  <p className="text-sm text-[var(--color-text-2)] leading-relaxed">
                    {value.body}
                  </p>
                </ScrollReveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
