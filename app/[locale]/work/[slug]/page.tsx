import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ExternalLink, ArrowLeft, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/lib/navigation';
import { client } from '@/sanity/lib/client';
import { PROJECT_BY_SLUG_QUERY, PROJECT_SLUGS_QUERY, PROJECT_NAV_QUERY } from '@/sanity/lib/queries';
import { urlFor } from '@/sanity/lib/image';
import { ParallaxImage } from '@/components/sections/ParallaxImage';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { ProjectMetrics } from '@/components/sections/ProjectMetrics';
import { ProjectGalleryLightbox } from '@/components/sections/ProjectGalleryLightbox';
import { cn, firstParagraph, makeBreadcrumbJsonLd } from '@/lib/utils';

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

interface SanityImageAsset {
  _id: string;
  url?: string | null;
  metadata?: {
    lqip?: string | null;
    dimensions?: { width: number; height: number } | null;
  } | null;
}

interface SanityImage {
  asset?: SanityImageAsset | null;
  alt?: string | null;
}

interface SanityGalleryImage extends SanityImage {
  _key?: string | null;
  caption?: string | null;
}

interface BilingualText {
  en?: string | null;
  ar?: string | null;
}

interface BilingualBlocks {
  en?: PtBlock[] | null;
  ar?: PtBlock[] | null;
}

interface ProjectDetail {
  _id: string;
  _createdAt: string;
  title: { en: string; ar?: string | null };
  slug: { current: string };
  client?: BilingualText | null;
  shortDesc?: BilingualText | null;
  category: string;
  tags?: string[] | null;
  year?: number | null;
  status: string;
  heroImage?: SanityImage | null;
  gallery?: SanityGalleryImage[] | null;
  description?: BilingualBlocks | null;
  challenge?: BilingualBlocks | null;
  solution?: BilingualBlocks | null;
  results?: BilingualBlocks | null;
  techStack?: Array<{ name: string; icon?: string | null }> | null;
  metrics?: Array<{ label: { en?: string | null; ar?: string | null }; value: string }> | null;
  liveUrl?: string | null;
  githubUrl?: string | null;
  dribbbleUrl?: string | null;
  appStoreUrl?: string | null;
  playStoreUrl?: string | null;
  featured: boolean;
}

interface NavProject {
  _id: string;
  title: { en: string; ar?: string | null };
  slug: { current: string };
  heroImage?: SanityImage | null;
}

// ─── Static params ────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  try {
    const slugs = await client.fetch(PROJECT_SLUGS_QUERY);
    return (slugs ?? []).map((p: { slug: string }) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

// ─── Metadata ────────────────────────────────────────────────────────────────

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  try {
    const project = await client.fetch<ProjectDetail | null>(PROJECT_BY_SLUG_QUERY, { slug });
    if (!project) return {};
    const title = locale === 'ar' ? (project.title.ar ?? project.title.en) : project.title.en;
    const descBlocks =
      locale === 'ar'
        ? (project.description?.ar ?? project.description?.en)
        : project.description?.en;
    const desc = firstParagraph(descBlocks) || undefined;
    const ogImage = project.heroImage
      ? urlFor(project.heroImage).width(1200).height(630).url()
      : undefined;
    return {
      title: `${title} — Codezeen`,
      description: desc,
      openGraph: {
        title: `${title} — Codezeen`,
        description: desc,
        images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : undefined,
        type: 'article',
      },
      alternates: {
        canonical: `/${locale}/work/${slug}`,
        languages: { en: `/en/work/${slug}`, ar: `/ar/work/${slug}` },
      },
    };
  } catch {
    return {};
  }
}

// ─── PortableText renderer ────────────────────────────────────────────────────

function RichText({ blocks }: { blocks: PtBlock[] | null | undefined }) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="space-y-5">
      {blocks.map((block) => {
        // Skip any non-text block types (inline images, etc.)
        if (block._type !== 'block') return null;

        const Tag =
          block.style === 'h2' ? 'h2' :
          block.style === 'h3' ? 'h3' :
          block.style === 'h4' ? 'h4' :
          block.style === 'blockquote' ? 'blockquote' : 'p';

        const headingClass =
          Tag === 'h2' ? 'font-serif text-2xl text-[var(--color-text-1)] mt-10 mb-3' :
          Tag === 'h3' ? 'font-serif text-xl text-[var(--color-text-1)] mt-8 mb-2' :
          Tag === 'h4' ? 'font-medium text-[var(--color-text-1)] mt-6 mb-2' :
          Tag === 'blockquote'
            ? 'border-l-2 border-[var(--color-accent)] pl-5 italic text-[var(--color-text-2)]'
            : 'text-[var(--color-text-2)] leading-[1.8]';

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
          if (isCode)
            node = (
              <code
                key={i}
                className="rounded bg-[var(--color-surface)] px-1.5 py-0.5 font-mono text-sm text-[var(--color-accent)]"
              >
                {text}
              </code>
            );
          else {
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
            node = <span key={i}>{node}</span>;
          }

          return node;
        });

        return (
          <Tag key={block._key} className={headingClass}>
            {children}
          </Tag>
        );
      })}
    </div>
  );
}

// ─── Content section block ────────────────────────────────────────────────────

function ContentSection({
  number,
  title,
  blocks,
  delay = 0,
}: {
  number: string;
  title: string;
  blocks: PtBlock[] | null | undefined;
  delay?: number;
}) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <ScrollReveal delay={delay} className="py-14 first:pt-0 last:pb-0">
      <div className="mb-8 flex items-center gap-4">
        <span className="font-mono text-xs tracking-[0.2em] text-[var(--color-accent)]">
          {number}
        </span>
        <div className="h-px flex-1 bg-[var(--color-border)]" />
      </div>
      <h2 className="mb-6 font-serif text-3xl text-[var(--color-text-1)] sm:text-4xl">{title}</h2>
      <RichText blocks={blocks} />
    </ScrollReveal>
  );
}

// ─── App Store icon SVGs ──────────────────────────────────────────────────────

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden="true">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function PlayStoreIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden="true">
      <path d="M3.18 23.87c.26.15.57.19.87.1l11.45-11.47L11.24 8.3 3.18 23.87zm13.47-11.95 2.78-1.51a1 1 0 000-1.73l-2.78-1.51-3.1 3.1 3.1 3.1-.01.05zM3.54.3C3.19.53 3 .96 3 1.57v20.87c0 .6.19 1.03.54 1.26L14.6 12.5 3.54.3zm10.69 11.1L11.24 8.3l2.82 2.82-.83.28z" />
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProjectPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'work' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const tNav = await getTranslations({ locale, namespace: 'nav' });

  let project: ProjectDetail | null = null;
  let navProjects: NavProject[] = [];

  try {
    [project, navProjects] = await Promise.all([
      client.fetch<ProjectDetail | null>(PROJECT_BY_SLUG_QUERY, { slug }),
      client.fetch<NavProject[]>(PROJECT_NAV_QUERY),
    ]);
  } catch {
    notFound();
  }

  if (!project) notFound();

  const isAr = locale === 'ar';
  const title = isAr ? (project.title.ar ?? project.title.en) : project.title.en;

  // Short description: prefer shortDesc field, fall back to first paragraph
  const shortDescText = isAr
    ? (project.shortDesc?.ar ?? project.shortDesc?.en ?? null)
    : (project.shortDesc?.en ?? null);
  const fallbackDesc = firstParagraph(
    isAr ? (project.description?.ar ?? project.description?.en) : project.description?.en,
  );
  const heroSubline = shortDescText || fallbackDesc || null;

  // Hero image
  const heroImageUrl = project.heroImage?.asset
    ? urlFor(project.heroImage).width(1600).height(900).url()
    : null;
  const heroBlur = project.heroImage?.asset?.metadata?.lqip ?? undefined;

  const year = project.year ?? new Date(project._createdAt).getFullYear();

  // Client name
  const clientName = isAr
    ? (project.client?.ar ?? project.client?.en ?? null)
    : (project.client?.en ?? null);

  // Content sections
  const challengeBlocks = isAr
    ? (project.challenge?.ar ?? project.challenge?.en)
    : project.challenge?.en;
  const solutionBlocks = isAr
    ? (project.solution?.ar ?? project.solution?.en)
    : project.solution?.en;
  const resultsBlocks = isAr
    ? (project.results?.ar ?? project.results?.en)
    : project.results?.en;
  const descriptionBlocks = isAr
    ? (project.description?.ar ?? project.description?.en)
    : project.description?.en;

  const hasContentSections =
    (challengeBlocks && challengeBlocks.length > 0) ||
    (solutionBlocks && solutionBlocks.length > 0) ||
    (resultsBlocks && resultsBlocks.length > 0);

  // Nav
  const navList = navProjects ?? [];
  const currentIndex = navList.findIndex((p) => p.slug.current === slug);
  const prevProject = currentIndex > 0 ? navList[currentIndex - 1] : null;
  const nextProject =
    currentIndex !== -1 && currentIndex < navList.length - 1
      ? navList[currentIndex + 1]
      : null;

  // JSON-LD
  const siteUrl = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://codezeen.com';
  const breadcrumbJsonLd = makeBreadcrumbJsonLd(siteUrl, locale, tCommon('home'), [
    { name: tNav('work'), path: '/work' },
    { name: title, path: `/work/${slug}` },
  ]);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    ...(heroImageUrl && { image: urlFor(project.heroImage!).width(1200).height(630).url() }),
    datePublished: project._createdAt,
    author: { '@type': 'Organization', name: 'Codezeen', url: siteUrl },
    publisher: { '@type': 'Organization', name: 'Codezeen', url: siteUrl },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <article>

        {/* ── SECTION 1: HERO ──────────────────────────────────────────────── */}
        <section
          className="relative h-[70vh] min-h-[500px] max-h-[800px] overflow-hidden"
          aria-label={title}
        >
          {/* Background */}
          {heroImageUrl ? (
            <ParallaxImage
              src={heroImageUrl}
              alt={project.heroImage?.alt ?? title}
              className="absolute inset-0"
              sizes="100vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-logo-dark)] via-[var(--color-logo-mid)] to-[var(--color-accent)]" />
          )}

          {/* Gradient overlays */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050D1A] via-[#050D1A]/40 to-transparent" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#050D1A]/80 via-[#050D1A]/20 to-transparent" />

          {/* Hero content */}
          <div
            className={cn(
              'absolute bottom-0 left-0 right-0 mx-auto max-w-7xl px-6 pb-12 lg:px-8',
              isAr && 'text-right',
            )}
          >
            {/* Category badge */}
            <span className="mb-4 inline-flex items-center rounded-full border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 px-3 py-1 font-mono text-xs uppercase tracking-widest text-[var(--color-accent)]">
              {project.category}
            </span>

            {/* Title */}
            <h1 className="mb-4 max-w-3xl font-serif text-4xl leading-tight text-[var(--color-text-1)] sm:text-5xl lg:text-6xl">
              {title}
            </h1>

            {/* Short description */}
            {heroSubline && (
              <p className="max-w-xl text-base text-[var(--color-text-2)] sm:text-lg">
                {heroSubline}
              </p>
            )}
          </div>
        </section>

        {/* ── SECTION 2: META BAR ──────────────────────────────────────────── */}
        <div className="border-b border-t border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div
              className={cn(
                'flex flex-col gap-0 divide-y divide-[var(--color-border)] sm:flex-row sm:divide-x sm:divide-y-0',
              )}
            >
              {/* Client */}
              {clientName && (
                <div className="flex flex-col gap-1 px-0 py-5 sm:px-8 sm:py-6 sm:first:pl-0">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-text-3)]">
                    {t('client')}
                  </span>
                  <span className="text-sm font-medium text-[var(--color-text-1)]">
                    {clientName}
                  </span>
                </div>
              )}

              {/* Year */}
              <div className="flex flex-col gap-1 px-0 py-5 sm:px-8 sm:py-6 sm:first:pl-0">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-text-3)]">
                  {t('year')}
                </span>
                <span className="text-sm font-medium text-[var(--color-text-1)]">{year}</span>
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1 px-0 py-5 sm:px-8 sm:py-6">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-text-3)]">
                  {t('category')}
                </span>
                <span className="text-sm font-medium capitalize text-[var(--color-text-1)]">
                  {project.category}
                </span>
              </div>

              {/* Tech Stack */}
              {project.techStack && project.techStack.length > 0 && (
                <div className="flex flex-1 flex-col gap-1 overflow-hidden px-0 py-5 sm:px-8 sm:py-6">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-text-3)]">
                    {t('techStack')}
                  </span>
                  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {project.techStack.map((tech) => (
                      <span
                        key={tech.name}
                        className="inline-flex shrink-0 items-center rounded border border-[var(--color-border)] px-2 py-0.5 font-mono text-[11px] text-[var(--color-text-3)]"
                      >
                        {tech.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* External links */}
              {(project.liveUrl || project.githubUrl) && (
                <div className="flex items-center gap-3 px-0 py-5 sm:px-8 sm:py-6 sm:ml-auto sm:rtl:mr-auto sm:rtl:ml-0">
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${t('liveLink')} — ${tCommon('externalLink')}`}
                      className="flex items-center gap-2 rounded border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-text-2)] transition-all duration-200 hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-1)]"
                    >
                      <ExternalLink size={13} aria-hidden="true" />
                      {t('liveLink')}
                    </a>
                  )}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${t('githubLink')} — ${tCommon('externalLink')}`}
                      className="flex items-center gap-2 rounded border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-text-2)] transition-all duration-200 hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-1)]"
                    >
                      <ExternalLink size={13} aria-hidden="true" />
                      {t('githubLink')}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── SECTION 3: CONTENT ───────────────────────────────────────────── */}
        {(hasContentSections || (descriptionBlocks && descriptionBlocks.length > 0)) && (
          <section className="mx-auto max-w-4xl px-6 py-20 lg:px-8 lg:py-28">
            {hasContentSections ? (
              <div className="divide-y divide-[var(--color-border)]">
                <ContentSection
                  number="01"
                  title={t('challenge')}
                  blocks={challengeBlocks}
                  delay={0}
                />
                <ContentSection
                  number="02"
                  title={t('solution')}
                  blocks={solutionBlocks}
                  delay={0.05}
                />
                <ContentSection
                  number="03"
                  title={t('results')}
                  blocks={resultsBlocks}
                  delay={0.1}
                />
              </div>
            ) : (
              <ScrollReveal>
                <div className="mb-8 flex items-center gap-4">
                  <span className="font-mono text-xs tracking-[0.2em] text-[var(--color-accent)]">
                    01
                  </span>
                  <div className="h-px flex-1 bg-[var(--color-border)]" />
                </div>
                <h2 className="mb-6 font-serif text-3xl text-[var(--color-text-1)] sm:text-4xl">
                  {t('overview')}
                </h2>
                <RichText blocks={descriptionBlocks} />
              </ScrollReveal>
            )}
          </section>
        )}

        {/* ── SECTION 4: METRICS ───────────────────────────────────────────── */}
        {project.metrics && project.metrics.length > 0 && (
          <section className="bg-[var(--color-surface)]" aria-label="Project metrics">
            <ScrollReveal direction="none">
              <ProjectMetrics metrics={project.metrics} locale={locale} />
            </ScrollReveal>
          </section>
        )}

        {/* ── SECTION 5: GALLERY ───────────────────────────────────────────── */}
        {project.gallery && project.gallery.length > 0 && (
          <section
            className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28"
            aria-label={t('galleryLabel')}
          >
            <ScrollReveal direction="none" className="mb-10">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-[var(--color-border)]" />
                <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-text-3)]">
                  {t('galleryLabel')}
                </span>
                <div className="h-px flex-1 bg-[var(--color-border)]" />
              </div>
            </ScrollReveal>
            <ProjectGalleryLightbox
              images={project.gallery}
              galleryLabel={t('galleryLabel')}
              closeLabel={t('closeImage')}
            />
          </section>
        )}

        {/* ── SECTION 6: APP STORE ─────────────────────────────────────────── */}
        {(project.appStoreUrl || project.playStoreUrl) && (
          <section className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
            <ScrollReveal className="mx-auto max-w-2xl px-6 py-16 text-center lg:px-8">
              <p className="mb-8 font-mono text-xs uppercase tracking-widest text-[var(--color-text-3)]">
                Available on
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                {project.appStoreUrl && (
                  <a
                    href={project.appStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${t('downloadOn')} ${t('appStore')}`}
                    className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-6 py-4 transition-all duration-200 hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface-2)]"
                  >
                    <AppleIcon />
                    <div className={cn('text-left', isAr && 'text-right')}>
                      <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-3)]">
                        {t('downloadOn')}
                      </p>
                      <p className="text-sm font-semibold text-[var(--color-text-1)]">
                        {t('appStore')}
                      </p>
                    </div>
                  </a>
                )}
                {project.playStoreUrl && (
                  <a
                    href={project.playStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${t('getItOn')} ${t('playStore')}`}
                    className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-6 py-4 transition-all duration-200 hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface-2)]"
                  >
                    <PlayStoreIcon />
                    <div className={cn('text-left', isAr && 'text-right')}>
                      <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-3)]">
                        {t('getItOn')}
                      </p>
                      <p className="text-sm font-semibold text-[var(--color-text-1)]">
                        {t('playStore')}
                      </p>
                    </div>
                  </a>
                )}
              </div>
            </ScrollReveal>
          </section>
        )}

        {/* ── SECTION 7: NEXT / PREV NAVIGATION ───────────────────────────── */}
        {(prevProject || nextProject) && (
          <nav
            className="border-t border-[var(--color-border)]"
            aria-label="Project navigation"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2">
              {/* Previous */}
              {prevProject ? (
                <Link
                  href={`/work/${prevProject.slug.current}` as '/work/[slug]'}
                  className="group relative flex items-center gap-5 overflow-hidden border-b border-[var(--color-border)] p-8 transition-colors duration-300 hover:bg-[var(--color-surface)] sm:border-b-0 sm:border-r"
                >
                  {prevProject.heroImage?.asset?.url && (
                    <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={urlFor(prevProject.heroImage).width(200).height(130).url()}
                        alt={prevProject.heroImage.alt ?? ''}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="96px"
                      />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-[var(--color-text-3)]">
                      <ArrowLeft
                        size={10}
                        className="mr-1 inline transition-transform duration-200 group-hover:-translate-x-1 rtl:rotate-180"
                        aria-hidden="true"
                      />
                      {t('prevProject')}
                    </p>
                    <p className="truncate font-medium text-[var(--color-text-2)] transition-colors duration-200 group-hover:text-[var(--color-text-1)]">
                      {isAr
                        ? (prevProject.title.ar ?? prevProject.title.en)
                        : prevProject.title.en}
                    </p>
                  </div>
                </Link>
              ) : (
                <div />
              )}

              {/* Next */}
              {nextProject ? (
                <Link
                  href={`/work/${nextProject.slug.current}` as '/work/[slug]'}
                  className="group relative flex items-center justify-end gap-5 overflow-hidden p-8 text-right transition-colors duration-300 hover:bg-[var(--color-surface)] rtl:text-left"
                >
                  <div className="min-w-0">
                    <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-[var(--color-text-3)]">
                      {t('nextProject')}
                      <ArrowRight
                        size={10}
                        className="ml-1 inline transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180"
                        aria-hidden="true"
                      />
                    </p>
                    <p className="truncate font-medium text-[var(--color-text-2)] transition-colors duration-200 group-hover:text-[var(--color-text-1)]">
                      {isAr
                        ? (nextProject.title.ar ?? nextProject.title.en)
                        : nextProject.title.en}
                    </p>
                  </div>
                  {nextProject.heroImage?.asset?.url && (
                    <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={urlFor(nextProject.heroImage).width(200).height(130).url()}
                        alt={nextProject.heroImage.alt ?? ''}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="96px"
                      />
                    </div>
                  )}
                </Link>
              ) : (
                <div />
              )}
            </div>
          </nav>
        )}

      </article>
    </>
  );
}
