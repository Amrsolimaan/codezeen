import { getTranslations } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/lib/navigation';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { ParallaxImage } from './ParallaxImage';
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import { FEATURED_PROJECTS_QUERY } from '@/sanity/lib/queries';
import { cn } from '@/lib/utils';

interface PortableChild {
  _type: string;
  text?: string;
}

interface PortableBlock {
  _type: string;
  children?: PortableChild[];
}

interface FeaturedProject {
  _id: string;
  title: { en: string; ar?: string | null } | null;
  slug: { current: string } | null;
  category: string | null;
  tags?: string[] | null;
  heroImage: {
    _type: string;
    asset: { _ref: string; _type: string };
    alt?: string | null;
  } | null;
  techStack?: Array<{ name: string; icon?: string | null }> | null;
  liveUrl?: string | null;
  description?: {
    en?: PortableBlock[] | null;
    ar?: PortableBlock[] | null;
  } | null;
}

function firstParagraph(blocks: PortableBlock[] | null | undefined): string {
  if (!blocks?.length) return '';
  for (const block of blocks) {
    if (block._type === 'block' && block.children?.length) {
      return block.children.map((c) => c.text ?? '').join('');
    }
  }
  return '';
}

function FeaturedWorkSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading projects">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex flex-col gap-8 py-16 lg:flex-row lg:items-center lg:gap-16">
          <div className="flex-1 space-y-5">
            <div className="h-3 w-20 rounded-full bg-[var(--color-surface-2)] animate-pulse" />
            <div className="h-8 w-3/4 rounded bg-[var(--color-surface-2)] animate-pulse" />
            <div className="space-y-2">
              <div className="h-3 w-full rounded bg-[var(--color-surface-2)] animate-pulse" />
              <div className="h-3 w-2/3 rounded bg-[var(--color-surface-2)] animate-pulse" />
            </div>
          </div>
          <div className="aspect-[4/3] w-full rounded-2xl bg-[var(--color-surface-2)] animate-pulse lg:w-[42%]" />
        </div>
      ))}
    </div>
  );
}

interface HeroSectionProps {
  locale: string;
}

export async function FeaturedWork({ locale }: HeroSectionProps) {
  const t = await getTranslations({ locale, namespace: 'home.featured' });

  let projects: FeaturedProject[] = [];
  try {
    projects = (await client.fetch(FEATURED_PROJECTS_QUERY)) as FeaturedProject[];
  } catch {
    // Sanity not configured yet — show skeleton
  }

  const CATEGORY_LABELS: Record<string, string> = {
    web: 'Web',
    mobile: 'Mobile',
    saas: 'SaaS',
    design: 'Design',
  };

  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* Section header */}
        <ScrollReveal>
          <div className="mb-16 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[var(--color-accent)]">
                {t('title')}
              </p>
              <h2 className="font-serif text-3xl font-normal text-[var(--color-text-1)] sm:text-4xl lg:text-5xl">
                {t('subtitle')}
              </h2>
            </div>
            <Link
              href="/work"
              className="hidden shrink-0 items-center gap-1.5 text-sm font-medium text-[var(--color-text-2)] transition-colors hover:text-[var(--color-text-1)] sm:flex"
            >
              {t('viewAll')}
              <ArrowRight size={14} aria-hidden="true" className="rtl:rotate-180" />
            </Link>
          </div>
        </ScrollReveal>

        {/* Project list or skeleton */}
        {projects.length === 0 ? (
          <FeaturedWorkSkeleton />
        ) : (
          <div>
            {projects.map((project, index) => {
              const title = (locale === 'ar' && project.title?.ar) ? project.title.ar : (project.title?.en ?? '');
              const descBlocks = locale === 'ar' ? project.description?.ar : project.description?.en;
              const description = firstParagraph(descBlocks);
              const categoryLabel = CATEGORY_LABELS[project.category ?? ''] ?? project.category ?? '';
              const imageUrl = project.heroImage
                ? urlFor(project.heroImage).width(900).height(675).fit('crop').url()
                : null;
              const imageAlt = project.heroImage?.alt ?? title;
              const slug = project.slug?.current ?? '';

              return (
                <div key={project._id}>
                  {/* Animated divider between projects */}
                  {index > 0 && (
                    <ScrollReveal>
                      <div className="border-t border-[var(--color-border)]" />
                    </ScrollReveal>
                  )}

                  <ScrollReveal margin="-80px">
                    <div className="relative flex flex-col gap-8 py-16 lg:flex-row lg:items-center lg:gap-16">

                      {/* Ghost project number */}
                      <span
                        className="pointer-events-none absolute -top-4 start-0 select-none font-serif text-[8rem] font-bold leading-none text-[var(--color-surface-2)] lg:text-[12rem]"
                        aria-hidden="true"
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      {/* Left — text content */}
                      <div className="relative z-10 flex-1 space-y-5">
                        {/* Category badge */}
                        <span className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-xs font-medium text-[var(--color-text-2)]">
                          {categoryLabel}
                        </span>

                        {/* Project title */}
                        <h3 className="font-serif text-3xl font-normal text-[var(--color-text-1)] sm:text-4xl">
                          {title}
                        </h3>

                        {/* Description — first paragraph only */}
                        {description && (
                          <p className="max-w-lg text-base leading-relaxed text-[var(--color-text-2)] line-clamp-2">
                            {description}
                          </p>
                        )}

                        {/* Tech stack pills */}
                        {project.techStack && project.techStack.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {project.techStack.slice(0, 5).map((tech) => (
                              <span
                                key={tech.name}
                                className="rounded-md bg-[var(--color-surface)] px-2.5 py-1 text-xs font-medium text-[var(--color-text-3)]"
                              >
                                {tech.name}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* CTA */}
                        {slug && (
                          <Link
                            href={`/work/${slug}` as '/work/[slug]'}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-accent)] transition-colors hover:text-[var(--color-text-1)]"
                          >
                            View Case Study
                            <ArrowRight size={14} aria-hidden="true" className="rtl:rotate-180" />
                          </Link>
                        )}
                      </div>

                      {/* Right — parallax image */}
                      {imageUrl && (
                        <div className={cn('w-full lg:w-[42%]', 'aspect-[4/3]')}>
                          <ParallaxImage
                            src={imageUrl}
                            alt={imageAlt ?? ''}
                            className="h-full w-full rounded-2xl"
                          />
                        </div>
                      )}
                    </div>
                  </ScrollReveal>
                </div>
              );
            })}
          </div>
        )}

        {/* Mobile "view all" link */}
        <div className="mt-8 flex justify-center sm:hidden">
          <Link
            href="/work"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-2)] hover:text-[var(--color-text-1)]"
          >
            {t('viewAll')}
            <ArrowRight size={14} aria-hidden="true" className="rtl:rotate-180" />
          </Link>
        </div>

      </div>
    </section>
  );
}
