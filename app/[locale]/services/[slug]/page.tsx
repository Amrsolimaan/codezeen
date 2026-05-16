import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { Link } from '@/lib/navigation';
import { client } from '@/sanity/lib/client';
import { SERVICE_BY_SLUG_QUERY, SERVICE_SLUGS_QUERY } from '@/sanity/lib/queries';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { MagneticElement } from '@/components/animations/MagneticElement';
import { ServiceHeroIcon } from '@/components/sections/ServiceHeroIcon';
import { ServiceFeatures } from '@/components/sections/ServiceFeatures';
import { cn, makeBreadcrumbJsonLd } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PtSpan {
  _type: string;
  _key?: string;
  text?: string;
  marks?: string[];
}

interface PtMarkDef {
  _key: string;
  _type: string;
  href?: string;
}

interface PtBlock {
  _type: string;
  _key: string;
  style?: string;
  children?: PtSpan[];
  markDefs?: PtMarkDef[];
}

interface ServiceDetail {
  _id: string;
  title: { en: string; ar?: string | null };
  slug: { current: string };
  icon: string;
  shortDesc?: { en?: string | null; ar?: string | null } | null;
  longDesc?: { en?: PtBlock[] | null; ar?: PtBlock[] | null } | null;
  features?: { en?: string[] | null; ar?: string[] | null } | null;
  techStack?: string[] | null;
  startingPrice?: string | null;
  featured: boolean;
}

// ─── Static params ────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  try {
    const slugs = await client.fetch(SERVICE_SLUGS_QUERY);
    return (slugs ?? []).map((s: { slug: string }) => ({ slug: s.slug }));
  } catch {
    return [];
  }
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  try {
    const service = await client.fetch<ServiceDetail | null>(SERVICE_BY_SLUG_QUERY, { slug });
    if (!service) return {};
    const title = locale === 'ar' ? (service.title.ar ?? service.title.en) : service.title.en;
    const desc =
      locale === 'ar'
        ? (service.shortDesc?.ar ?? service.shortDesc?.en ?? '')
        : (service.shortDesc?.en ?? '');
    return {
      title: `${title} — Codezeen`,
      description: desc || undefined,
      openGraph: {
        title: `${title} — Codezeen`,
        description: desc || undefined,
        images: [{ url: '/og-default.png', width: 1200, height: 630 }],
        type: 'website',
      },
      alternates: {
        canonical: `/${locale}/services/${slug}`,
        languages: {
          en: `/en/services/${slug}`,
          ar: `/ar/services/${slug}`,
        },
      },
    };
  } catch {
    return {};
  }
}

// ─── PortableText renderer ─────────────────────────────────────────────────────

function RichText({ blocks }: { blocks: PtBlock[] | null | undefined }) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="space-y-5">
      {blocks.map((block) => {
        if (block._type !== 'block') return null;

        const Tag =
          block.style === 'h2' ? 'h2' :
          block.style === 'h3' ? 'h3' :
          block.style === 'h4' ? 'h4' :
          block.style === 'blockquote' ? 'blockquote' : 'p';

        const cls =
          Tag === 'h2'
            ? 'font-serif text-2xl text-[var(--color-text-1)] mt-10 mb-3'
            : Tag === 'h3'
            ? 'font-serif text-xl text-[var(--color-text-1)] mt-8 mb-2'
            : Tag === 'h4'
            ? 'font-medium text-[var(--color-text-1)] mt-6 mb-2'
            : Tag === 'blockquote'
            ? 'border-s-2 border-[var(--color-accent)] ps-5 italic text-[var(--color-text-2)]'
            : 'text-[var(--color-text-2)] leading-[1.85]';

        const markDefsMap = Object.fromEntries(
          (block.markDefs ?? []).map((m) => [m._key, m]),
        );

        const children = block.children?.map((span, i) => {
          if (span._type !== 'span') return null;
          const text = span.text ?? '';
          if (!text) return null;

          const marks = span.marks ?? [];
          const isCode = marks.includes('code');
          const isBold = marks.includes('strong');
          const isItalic = marks.includes('em');
          const isUnderline = marks.includes('underline');
          const linkKey = marks.find((m) => markDefsMap[m]?._type === 'link');
          const href = linkKey ? markDefsMap[linkKey]?.href : undefined;

          let node: React.ReactNode = text;

          if (isCode) {
            return (
              <code
                key={i}
                className="rounded bg-[var(--color-surface-2)] px-1.5 py-0.5 font-mono text-sm text-[var(--color-accent)]"
              >
                {text}
              </code>
            );
          }

          if (isBold) node = <strong className="font-semibold text-[var(--color-text-1)]">{node}</strong>;
          if (isItalic) node = <em>{node}</em>;
          if (isUnderline) node = <span className="underline underline-offset-2">{node}</span>;
          if (href)
            node = (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-accent)] underline underline-offset-2 transition-opacity hover:opacity-70"
              >
                {node}
              </a>
            );

          return <span key={i}>{node}</span>;
        });

        return (
          <Tag key={block._key} className={cls}>
            {children}
          </Tag>
        );
      })}
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ label, title }: { label: string; title: string }) {
  return (
    <div className="mb-12 flex items-baseline gap-5 border-b border-[var(--color-border)] pb-6">
      <span className="shrink-0 font-mono text-xs font-semibold tabular-nums text-[var(--color-accent)] opacity-60">
        {label}
      </span>
      <h2 className="font-serif text-3xl text-[var(--color-text-1)] sm:text-4xl">{title}</h2>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ServicePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [t, tNav, tCommon, tHome] = await Promise.all([
    getTranslations({ locale, namespace: 'services' }),
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'common' }),
    getTranslations({ locale, namespace: 'home.cta' }),
  ]);

  let service: ServiceDetail | null = null;
  try {
    service = await client.fetch<ServiceDetail | null>(SERVICE_BY_SLUG_QUERY, { slug });
  } catch {
    notFound();
  }
  if (!service) notFound();

  const isAr = locale === 'ar';

  const title = isAr ? (service.title.ar ?? service.title.en) : service.title.en;
  const shortDesc = isAr
    ? (service.shortDesc?.ar ?? service.shortDesc?.en ?? null)
    : (service.shortDesc?.en ?? null);
  const longDescBlocks = isAr
    ? (service.longDesc?.ar ?? service.longDesc?.en)
    : service.longDesc?.en;
  const features = isAr
    ? (service.features?.ar ?? service.features?.en)
    : service.features?.en;

  const siteUrl = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://codezeen.com';
  const breadcrumbJsonLd = makeBreadcrumbJsonLd(siteUrl, locale, tCommon('home'), [
    { name: tNav('services'), path: '/services' },
    { name: title, path: `/services/${slug}` },
  ]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: title,
    description: shortDesc ?? undefined,
    provider: { '@type': 'Organization', name: 'Codezeen', url: siteUrl },
    ...(service.startingPrice && { offers: { '@type': 'Offer', description: service.startingPrice } }),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <main id="main-content">

        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-[var(--color-surface)]">
          {/* Background decoration */}
          <div
            className="pointer-events-none absolute end-0 top-0 h-full w-1/2 opacity-[0.03]"
            aria-hidden="true"
          >
            <div className="absolute inset-0 bg-gradient-to-l from-[var(--color-accent)] to-transparent" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-32 lg:px-8 lg:pb-32 lg:pt-40">

            {/* Breadcrumb */}
            <ScrollReveal direction="none">
              <nav aria-label="Breadcrumb" className="mb-12">
                <ol className="flex items-center gap-2 font-mono text-xs text-[var(--color-text-3)]">
                  <li>
                    <Link
                      href="/services"
                      className="transition-colors hover:text-[var(--color-text-2)]"
                    >
                      {t('detail.backToServices')}
                    </Link>
                  </li>
                  <li aria-hidden="true">
                    <ChevronRight size={12} className="rtl:rotate-180" />
                  </li>
                  <li className="text-[var(--color-text-2)]" aria-current="page">
                    {title}
                  </li>
                </ol>
              </nav>
            </ScrollReveal>

            {/* Hero grid */}
            <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">

              {/* Left — content */}
              <div>
                {/* Price badge */}
                {service.startingPrice && (
                  <ScrollReveal direction="none">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 px-4 py-2">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-text-3)]">
                        {t('detail.investment')}
                      </span>
                      <span className="font-semibold text-[var(--color-accent)]">
                        {service.startingPrice}
                      </span>
                    </div>
                  </ScrollReveal>
                )}

                {/* Title */}
                <ScrollReveal delay={0.05}>
                  <h1 className="mb-6 font-serif text-4xl leading-tight text-[var(--color-text-1)] sm:text-5xl lg:text-6xl">
                    {title}
                  </h1>
                </ScrollReveal>

                {/* Short description */}
                {shortDesc && (
                  <ScrollReveal delay={0.1}>
                    <p className="mb-10 max-w-lg text-lg leading-relaxed text-[var(--color-text-2)]">
                      {shortDesc}
                    </p>
                  </ScrollReveal>
                )}

                {/* CTA */}
                <ScrollReveal delay={0.15}>
                  <MagneticElement>
                    <Link
                      href="/contact"
                      className={cn(
                        'inline-flex items-center gap-2 rounded-full',
                        'bg-[var(--color-accent)] px-7 py-3.5',
                        'text-sm font-semibold text-white',
                        'transition-all duration-200 hover:bg-[var(--color-logo-mid)] active:scale-95',
                      )}
                    >
                      {t('detail.startProject')}
                      <ArrowRight size={16} aria-hidden="true" className="rtl:rotate-180" />
                    </Link>
                  </MagneticElement>
                </ScrollReveal>
              </div>

              {/* Right — floating icon */}
              <ScrollReveal direction="none" className="flex justify-center lg:justify-end">
                <ServiceHeroIcon name={service.icon} className="h-64 w-64" />
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ── LONG DESCRIPTION ──────────────────────────────────────────────── */}
        {longDescBlocks && longDescBlocks.length > 0 && (
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <ScrollReveal>
                <SectionHeader label="01" title={t('detail.overview')} />
              </ScrollReveal>
              <ScrollReveal delay={0.08}>
                <div className="max-w-3xl">
                  <RichText blocks={longDescBlocks} />
                </div>
              </ScrollReveal>
            </div>
          </section>
        )}

        {/* ── FEATURES GRID ─────────────────────────────────────────────────── */}
        {features && features.length > 0 && (
          <section className="bg-[var(--color-surface)] py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <ScrollReveal>
                <SectionHeader
                  label="02"
                  title={t('detail.whatsIncluded')}
                />
              </ScrollReveal>
              <ServiceFeatures features={features} />
            </div>
          </section>
        )}

        {/* ── TECH STACK ────────────────────────────────────────────────────── */}
        {service.techStack && service.techStack.length > 0 && (
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <ScrollReveal>
                <SectionHeader
                  label="03"
                  title={t('detail.technologies')}
                />
              </ScrollReveal>
              <ScrollReveal delay={0.08}>
                <div className="flex flex-wrap gap-3" role="list" aria-label={t('detail.technologies')}>
                  {service.techStack.map((tech) => (
                    <span
                      key={tech}
                      role="listitem"
                      className={cn(
                        'rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]',
                        'px-4 py-2 font-mono text-sm text-[var(--color-text-2)]',
                        'transition-colors duration-200',
                        'hover:border-[var(--color-border-hover)] hover:text-[var(--color-accent)]',
                      )}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </section>
        )}

        {/* ── CTA ───────────────────────────────────────────────────────────── */}
        <section className="border-t border-[var(--color-border)] bg-[var(--color-surface-2)]">
          <div className="mx-auto max-w-4xl px-6 py-24 text-center lg:px-8 lg:py-32">
            <ScrollReveal>
              <h2 className="font-serif text-4xl font-normal text-[var(--color-text-1)] sm:text-5xl">
                {t('detail.startProject')}
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <p className="mx-auto mt-5 max-w-md text-lg leading-relaxed text-[var(--color-text-2)]">
                {t('detail.startProjectSub')}
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <MagneticElement>
                  <Link
                    href="/contact"
                    className={cn(
                      'inline-flex h-14 items-center gap-2 rounded-full',
                      'bg-[var(--color-accent)] px-8',
                      'text-base font-semibold text-white',
                      'transition-all duration-200 hover:bg-[var(--color-logo-mid)] active:scale-95',
                    )}
                  >
                    {t('detail.startProjectCta')}
                    <ArrowRight size={18} aria-hidden="true" className="rtl:rotate-180" />
                  </Link>
                </MagneticElement>
                <Link
                  href="/services"
                  className="inline-flex h-14 items-center gap-2 rounded-full border border-[var(--color-border)] px-8 text-base font-medium text-[var(--color-text-2)] transition-all duration-200 hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-1)]"
                >
                  {t('detail.backToServices')}
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

      </main>
    </>
  );
}
