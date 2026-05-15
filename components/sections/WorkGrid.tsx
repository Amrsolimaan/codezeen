'use client';

import Image from 'next/image';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowUpRight } from 'lucide-react';
import { Link } from '@/lib/navigation';
import { urlFor } from '@/sanity/lib/image';
import { cn, firstParagraph } from '@/lib/utils';

type PtBlock = {
  _type: string;
  _key?: string;
  children?: Array<{ _type: string; text?: string }>;
};

export interface WorkProject {
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
      metadata?: {
        lqip?: string | null;
        dimensions?: { width: number; height: number } | null;
      } | null;
    };
    alt?: string | null;
    hotspot?: { x: number; y: number } | null;
  };
  description?: {
    en?: PtBlock[] | null;
    ar?: PtBlock[] | null;
  } | null;
  techStack: Array<{ name: string; icon?: string | null }> | null;
  liveUrl?: string | null;
  featured: boolean;
  order: number;
}

const CATEGORY_FILTER_KEYS = ['web', 'mobile', 'saas', 'design'] as const;
type CategoryKey = (typeof CATEGORY_FILTER_KEYS)[number];

function isCategoryKey(s: string): s is CategoryKey {
  return CATEGORY_FILTER_KEYS.includes(s as CategoryKey);
}

interface WorkGridProps {
  projects: WorkProject[];
}

export function WorkGrid({ projects }: WorkGridProps) {
  const t = useTranslations('work');
  const locale = useLocale();
  const prefersReducedMotion = useReducedMotion();

  if (projects.length === 0) {
    return (
      <p className="py-24 text-center text-[var(--color-text-3)]">{t('noProjects')}</p>
    );
  }

  const categoryLabel = (category: string): string => {
    if (isCategoryKey(category)) return t(`filters.${category}`);
    return category;
  };

  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" role="list">
      <AnimatePresence>
        {projects.map((project, index) => {
          const title =
            locale === 'ar' ? (project.title.ar ?? project.title.en) : project.title.en;
          const descBlocks =
            locale === 'ar' ? (project.description?.ar ?? project.description?.en) : project.description?.en;
          const desc = firstParagraph(descBlocks);
          const imageUrl = urlFor(project.heroImage).width(800).height(600).url();
          const blurUrl = project.heroImage.asset?.metadata?.lqip ?? undefined;

          return (
            <motion.li
              key={project._id}
              layout
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.96 }}
              transition={{
                duration: 0.4,
                delay: prefersReducedMotion ? 0 : index * 0.05,
                ease: 'easeOut',
              }}
            >
              <Link
                href={`/work/${project.slug.current}` as '/work/[slug]'}
                className={cn(
                  'group relative block overflow-hidden',
                  'bg-[var(--color-surface)]',
                  'ring-0 transition-shadow duration-300 hover:ring-1 hover:ring-[var(--color-border-hover)]',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]',
                )}
              >
                {/* image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={project.heroImage.alt ?? title}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    placeholder={blurUrl ? 'blur' : 'empty'}
                    blurDataURL={blurUrl}
                  />

                  {/* category badge */}
                  <span
                    className={cn(
                      'absolute left-3 top-3 bg-[var(--color-bg)]/80 px-2 py-0.5 backdrop-blur-sm',
                      'font-mono text-xs uppercase text-[var(--color-accent)]',
                      'rtl:left-auto rtl:right-3',
                    )}
                  >
                    {categoryLabel(project.category)}
                  </span>

                  {/* hover overlay */}
                  <div
                    className={cn(
                      'absolute inset-0 flex flex-col justify-end p-5',
                      'bg-[var(--color-bg)]/85',
                      'opacity-0 transition-opacity duration-300 group-hover:opacity-100',
                    )}
                  >
                    {desc && (
                      <p className="mb-4 line-clamp-3 text-sm text-[var(--color-text-2)]">
                        {desc}
                      </p>
                    )}
                    <span
                      className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-accent)]"
                      aria-hidden="true"
                    >
                      {t('viewProject')}
                      <ArrowUpRight size={14} />
                    </span>
                  </div>
                </div>

                {/* card footer */}
                <div className="flex items-start justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p
                      className={cn(
                        'truncate font-medium text-[var(--color-text-1)]',
                        'transition-colors duration-200 group-hover:text-[var(--color-accent)]',
                      )}
                    >
                      {title}
                    </p>
                    {project.techStack && project.techStack.length > 0 && (
                      <p className="mt-1 truncate text-xs text-[var(--color-text-3)]">
                        {project.techStack
                          .slice(0, 3)
                          .map((tech) => tech.name)
                          .join(' · ')}
                      </p>
                    )}
                  </div>

                  {/* ghost index number */}
                  <span
                    className={cn(
                      'shrink-0 select-none font-mono text-5xl font-bold leading-none',
                      'text-[var(--color-border)]',
                      'transition-colors duration-300 group-hover:text-[var(--color-border-hover)]',
                    )}
                    aria-hidden="true"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
              </Link>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}
