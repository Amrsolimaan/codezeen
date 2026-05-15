'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowUpRight } from 'lucide-react';
import { gsap } from 'gsap';
import { Link } from '@/lib/navigation';
import { urlFor } from '@/sanity/lib/image';
import { cn } from '@/lib/utils';
import { ProjectPortalHover } from '@/components/animations/ProjectPortalHover';
import type { WorkProject } from './WorkGrid';

const CATEGORY_FILTER_KEYS = ['web', 'mobile', 'saas', 'design'] as const;
type CategoryKey = (typeof CATEGORY_FILTER_KEYS)[number];

function isCategoryKey(s: string): s is CategoryKey {
  return CATEGORY_FILTER_KEYS.includes(s as CategoryKey);
}

interface WorkListProps {
  projects: WorkProject[];
}

export function WorkList({ projects }: WorkListProps) {
  const t = useTranslations('work');
  const locale = useLocale();
  const prefersReducedMotion = useReducedMotion();
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (!el || prefersReducedMotion) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let lastY = window.scrollY;
    let lastTime = performance.now();
    let resetTimer: ReturnType<typeof setTimeout>;

    const handleScroll = () => {
      const now = performance.now();
      const dt = now - lastTime;
      if (dt < 1) return;

      const dy = window.scrollY - lastY;
      const vel = dy / dt;
      lastY = window.scrollY;
      lastTime = now;

      const skew = Math.max(-3, Math.min(3, vel * 1.5));
      gsap.to(el, { skewY: skew, duration: 0.3, ease: 'none', overwrite: true });

      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        gsap.to(el, { skewY: 0, duration: 0.6, ease: 'power2.out' });
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(resetTimer);
      gsap.killTweensOf(el);
    };
  }, [prefersReducedMotion]);

  const categoryLabel = (category: string): string => {
    if (isCategoryKey(category)) return t(`filters.${category}`);
    return category;
  };

  if (projects.length === 0) {
    return (
      <p className="py-24 text-center text-[var(--color-text-3)]">{t('noProjects')}</p>
    );
  }

  return (
    <ul
      ref={listRef}
      role="list"
      className="border-t border-[var(--color-border)]"
    >
      <AnimatePresence>
        {projects.map((project, index) => {
          const title =
            locale === 'ar' ? (project.title.ar ?? project.title.en) : project.title.en;
          const imageUrl = urlFor(project.heroImage).width(600).height(450).url();
          const year = new Date(project._createdAt).getFullYear();

          return (
            <motion.li
              key={project._id}
              layout
              initial={{ opacity: 0, x: prefersReducedMotion ? 0 : -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.35,
                delay: prefersReducedMotion ? 0 : index * 0.04,
                ease: 'easeOut',
              }}
              className="border-b border-[var(--color-border)]"
            >
              <ProjectPortalHover src={imageUrl} alt={title}>
                <Link
                  href={`/work/${project.slug.current}` as '/work/[slug]'}
                  className={cn(
                    'group flex items-center gap-4 px-2 py-5',
                    'transition-colors duration-200 hover:bg-[var(--color-surface)]',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]',
                    'sm:gap-6',
                  )}
                >
                  {/* index */}
                  <span
                    className="w-8 shrink-0 font-mono text-xs text-[var(--color-text-3)]"
                    aria-hidden="true"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  {/* category badge */}
                  <span
                    className={cn(
                      'hidden shrink-0 border px-2 py-0.5 font-mono text-xs uppercase sm:block',
                      'border-[var(--color-border)] text-[var(--color-text-3)]',
                    )}
                  >
                    {categoryLabel(project.category)}
                  </span>

                  {/* title */}
                  <span
                    className={cn(
                      'flex-1 truncate font-medium text-[var(--color-text-1)]',
                      'transition-colors duration-200 group-hover:text-[var(--color-accent)]',
                    )}
                  >
                    {title}
                  </span>

                  {/* tech stack */}
                  {project.techStack && project.techStack.length > 0 && (
                    <span className="hidden shrink-0 text-xs text-[var(--color-text-3)] md:block">
                      {project.techStack
                        .slice(0, 3)
                        .map((tech) => tech.name)
                        .join(' · ')}
                    </span>
                  )}

                  {/* year */}
                  <span className="hidden shrink-0 font-mono text-xs text-[var(--color-text-3)] lg:block">
                    {year}
                  </span>

                  {/* arrow */}
                  <ArrowUpRight
                    size={16}
                    className={cn(
                      'shrink-0 text-[var(--color-text-3)]',
                      'transition-colors duration-200 group-hover:text-[var(--color-accent)]',
                      'rtl:rotate-180',
                    )}
                    aria-hidden="true"
                  />
                </Link>
              </ProjectPortalHover>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}
