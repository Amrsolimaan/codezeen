import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ExternalLink, ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from '@/lib/navigation';
import { client } from '@/sanity/lib/client';
import { PROJECT_BY_SLUG_QUERY, PROJECT_SLUGS_QUERY, PROJECT_NAV_QUERY } from '@/sanity/lib/queries';
import { urlFor } from '@/sanity/lib/image';
import { ParallaxImage } from '@/components/sections/ParallaxImage';
import { GalleryReveal } from '@/components/sections/GalleryReveal';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { cn, firstParagraph, makeBreadcrumbJsonLd } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PtSpan {
  _type: string;
  _key?: string;
  text?: string;
  marks?: string[];
}

interface PtBlock {
  _type: string;
  _key: string;
  style?: string;
  children?: PtSpan[];
  markDefs?: unknown[];
}

interface ProjectDetail {
  _id: string;
  _createdAt: string;
  title: { en: string; ar?: string | null };
  slug: { current: string };
  category: string;
  tags: string[] | null;
  year?: number | null;
  heroImage: {
    asset: {
      _id: string;
      url?: string | null;
      metadata?: { lqip?: string | null; dimensions?: { width: number; height: number } | null } | null;
    };
    alt?: string | null;
  };
  gallery: Array<{
    _key?: string | null;
    asset: {
      _id: string;
      url?: string | null;
      metadata?: { lqip?: string | null } | null;
    };
    alt?: string | null;
    caption?: string | null;
    hotspot?: { x: number; y: number } | null;
  }> | null;
  description: {
    en?: PtBlock[] | null;
    ar?: PtBlock[] | null;
  } | null;
  techStack: Array<{ name: string; icon?: string | null }> | null;
  metrics: Array<{
    label: { en?: string | null; ar?: string | null };
    value: string;
  }> | null;
  liveUrl?: string | null;
  githubUrl?: string | null;
  dribbbleUrl?: string | null;
  featured: boolean;
  status: string;
}

interface NavProject {
  _id: string;
  title: { en: string; ar?: string | null };
  slug: { current: string };
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

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  try {
    const project = await client.fetch<ProjectDetail | null>(PROJECT_BY_SLUG_QUERY, { slug });
    if (!project) return {};
    const title =
      locale === 'ar' ? (project.title.ar ?? project.title.en) : project.title.en;
    const desc =
      locale === 'ar'
        ? firstParagraph(project.description?.ar ?? project.description?.en)
        : firstParagraph(project.description?.en);
    const ogImage = urlFor(project.heroImage).width(1200).height(630).url();
    return {
      title: `${title} — Codezeen`,
      description: desc || undefined,
      openGraph: {
        title: `${title} — Codezeen`,
        description: desc || undefined,
        images: [{ url: ogImage, width: 1200, height: 630 }],
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

// ─── Inline PortableText renderer ─────────────────────────────────────────────

function RenderPortableText({ blocks }: { blocks: PtBlock[] | null | undefined }) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="space-y-5">
      {blocks.map((block) => {
        if (block._type !== 'block') return null;

        const Tag =
          block.style === 'h2'
            ? 'h2'
            : block.style === 'h3'
              ? 'h3'
              : block.style === 'h4'
                ? 'h4'
                : 'p';

        const headingClass =
          Tag === 'h2'
            ? 'font-serif text-2xl text-[var(--color-text-1)] mt-10 mb-3'
            : Tag === 'h3'
              ? 'font-serif text-xl text-[var(--color-text-1)] mt-8 mb-2'
              : Tag === 'h4'
                ? 'font-medium text-[var(--color-text-1)] mt-6 mb-2'
                : 'text-[var(--color-text-2)] leading-relaxed';

        const children = block.children?.map((span, i) => {
          if (span._type !== 'span') return null;
          const text = span.text ?? '';
          const bold = span.marks?.includes('strong');
          const italic = span.marks?.includes('em');
          const code = span.marks?.includes('code');

          if (code) {
            return (
              <code
                key={i}
                className="rounded bg-[var(--color-surface)] px-1.5 py-0.5 font-mono text-sm text-[var(--color-accent)]"
              >
                {text}
              </code>
            );
          }
          if (bold && italic) return <strong key={i}><em>{text}</em></strong>;
          if (bold) return <strong key={i} className="font-semibold text-[var(--color-text-1)]">{text}</strong>;
          if (italic) return <em key={i}>{text}</em>;
          return text;
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProjectPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'work' });

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

  const title =
    locale === 'ar' ? (project.title.ar ?? project.title.en) : project.title.en;

  const heroImageUrl = urlFor(project.heroImage).width(1600).height(900).url();
  const heroBlur = project.heroImage.asset?.metadata?.lqip ?? undefined;
  const year = project.year ?? new Date(project._createdAt).getFullYear();

  const siteUrl = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://codezeen.com';

  const tNav = await getTranslations({ locale, namespace: 'nav' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const breadcrumbJsonLd = makeBreadcrumbJsonLd(siteUrl, locale, tCommon('home'), [
    { name: tNav('work'), path: '/work' },
    { name: title, path: `/work/${slug}` },
  ]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    image: urlFor(project.heroImage).width(1200).height(630).url(),
    datePublished: project._createdAt,
    author: { '@type': 'Organization', name: 'Codezeen', url: siteUrl },
    publisher: { '@type': 'Organization', name: 'Codezeen', url: siteUrl },
  };

  // Next / prev
  const navList = navProjects ?? [];
  const currentIndex = navList.findIndex((p) => p.slug.current === slug);
  const prevProject = currentIndex > 0 ? navList[currentIndex - 1] : null;
  const nextProject =
    currentIndex !== -1 && currentIndex < navList.length - 1
      ? navList[currentIndex + 1]
      : null;

  const descBlocks =
    locale === 'ar'
      ? (project.description?.ar ?? project.description?.en)
      : project.description?.en;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    <article>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative h-[70vh] min-h-[400px] max-h-[700px]">
        <ParallaxImage
          src={heroImageUrl}
          alt={project.heroImage.alt ?? title}
          className="absolute inset-0"
          sizes="100vw"
        />
        {/* overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)]/40 to-transparent" />
        {/* title over image */}
        <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-7xl px-6 pb-12 lg:px-8">
          <span className="mb-2 block font-mono text-sm uppercase text-[var(--color-accent)]">
            {project.category}
          </span>
          <h1 className="font-serif text-4xl text-[var(--color-text-1)] sm:text-5xl lg:text-6xl">
            {title}
          </h1>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* Meta bar */}
        <ScrollReveal>
          <div
            className={cn(
              'flex flex-wrap items-center gap-x-8 gap-y-3 border-b border-[var(--color-border)] py-6',
              'text-sm text-[var(--color-text-3)]',
            )}
          >
            <span>{year}</span>

            {project.techStack && project.techStack.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <span
                    key={tech.name}
                    className="border border-[var(--color-border)] px-2 py-0.5 font-mono text-xs"
                  >
                    {tech.name}
                  </span>
                ))}
              </div>
            )}

            <div className="ml-auto flex items-center gap-4 rtl:ml-0 rtl:mr-auto">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[var(--color-text-2)] transition-colors hover:text-[var(--color-accent)]"
                  aria-label={`${t('liveLink')} — opens in new tab`}
                >
                  <ExternalLink size={14} aria-hidden="true" />
                  {t('liveLink')}
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[var(--color-text-2)] transition-colors hover:text-[var(--color-accent)]"
                  aria-label={`${t('githubLink')} — opens in new tab`}
                >
                  <ExternalLink size={14} aria-hidden="true" />
                  {t('githubLink')}
                </a>
              )}
            </div>
          </div>
        </ScrollReveal>

        {/* Overview */}
        {descBlocks && descBlocks.length > 0 && (
          <ScrollReveal className="py-16 lg:py-20">
            <div className="max-w-2xl">
              <RenderPortableText blocks={descBlocks} />
            </div>
          </ScrollReveal>
        )}

        {/* Metrics */}
        {project.metrics && project.metrics.length > 0 && (
          <ScrollReveal className="mb-16">
            <ul
              className="grid grid-cols-2 gap-px border border-[var(--color-border)] bg-[var(--color-border)] sm:grid-cols-4"
              role="list"
            >
              {project.metrics.map((metric, i) => {
                const label =
                  locale === 'ar'
                    ? (metric.label.ar ?? metric.label.en ?? '')
                    : (metric.label.en ?? '');
                return (
                  <li
                    key={i}
                    className="flex flex-col items-center gap-2 bg-[var(--color-bg)] p-6 text-center"
                  >
                    <span className="font-serif text-4xl text-[var(--color-text-1)]">
                      {metric.value}
                    </span>
                    <span className="text-xs text-[var(--color-text-3)]">{label}</span>
                  </li>
                );
              })}
            </ul>
          </ScrollReveal>
        )}

        {/* Gallery */}
        {project.gallery && project.gallery.length > 0 && (
          <section className="mb-16 lg:mb-24" aria-label={t('galleryLabel')}>
            <GalleryReveal images={project.gallery} />
          </section>
        )}

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <ScrollReveal className="mb-16">
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="border border-[var(--color-border)] px-3 py-1 font-mono text-xs text-[var(--color-text-3)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </ScrollReveal>
        )}

        {/* Next / Prev navigation */}
        {(prevProject || nextProject) && (
          <nav
            aria-label="Project navigation"
            className="border-t border-[var(--color-border)] py-12"
          >
            <div className="flex items-center justify-between gap-4">
              {prevProject ? (
                <Link
                  href={`/work/${prevProject.slug.current}` as '/work/[slug]'}
                  className={cn(
                    'group flex items-center gap-3 text-[var(--color-text-3)]',
                    'transition-colors duration-200 hover:text-[var(--color-text-1)]',
                  )}
                >
                  <ArrowLeft
                    size={16}
                    className="transition-transform duration-200 group-hover:-translate-x-1 rtl:rotate-180"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="mb-0.5 font-mono text-xs uppercase">{t('prevProject')}</p>
                    <p className="font-medium text-[var(--color-text-2)] group-hover:text-[var(--color-text-1)] transition-colors">
                      {locale === 'ar'
                        ? (prevProject.title.ar ?? prevProject.title.en)
                        : prevProject.title.en}
                    </p>
                  </div>
                </Link>
              ) : (
                <div />
              )}

              {nextProject ? (
                <Link
                  href={`/work/${nextProject.slug.current}` as '/work/[slug]'}
                  className={cn(
                    'group flex items-center gap-3 text-right text-[var(--color-text-3)]',
                    'transition-colors duration-200 hover:text-[var(--color-text-1)]',
                    'rtl:text-left',
                  )}
                >
                  <div>
                    <p className="mb-0.5 font-mono text-xs uppercase">{t('nextProject')}</p>
                    <p className="font-medium text-[var(--color-text-2)] group-hover:text-[var(--color-text-1)] transition-colors">
                      {locale === 'ar'
                        ? (nextProject.title.ar ?? nextProject.title.en)
                        : nextProject.title.en}
                    </p>
                  </div>
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180"
                    aria-hidden="true"
                  />
                </Link>
              ) : (
                <div />
              )}
            </div>
          </nav>
        )}
      </div>
    </article>
    </>
  );
}
