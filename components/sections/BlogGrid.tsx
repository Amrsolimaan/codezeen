'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from '@/lib/navigation';
import { urlFor } from '@/sanity/lib/image';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 6;

interface BlogPost {
  _id: string;
  title: { en: string; ar?: string | null };
  slug: { current: string };
  coverImage: {
    asset: {
      _id: string;
      url?: string | null;
      metadata?: { lqip?: string | null } | null;
    };
    alt?: string | null;
  };
  publishedAt: string;
  category: string;
  excerpt?: { en?: string | null; ar?: string | null } | null;
  readingTime: number;
  featured: boolean;
}

interface BlogGridProps {
  posts: BlogPost[];
  locale: string;
}

export function BlogGrid({ posts, locale }: BlogGridProps) {
  const t = useTranslations('blog');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const visible = posts.slice(0, visibleCount);
  const hasMore = visibleCount < posts.length;

  if (posts.length === 0) return null;

  return (
    <div>
      <ul
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        role="list"
      >
        <AnimatePresence>
          {visible.map((post, i) => {
            const title = locale === 'ar' ? (post.title.ar ?? post.title.en) : post.title.en;
            const excerpt =
              locale === 'ar' ? (post.excerpt?.ar ?? post.excerpt?.en) : post.excerpt?.en;
            const coverUrl = urlFor(post.coverImage).width(600).height(400).url();
            const blurUrl = post.coverImage.asset?.metadata?.lqip ?? undefined;
            const date = new Date(post.publishedAt).toLocaleDateString(
              locale === 'ar' ? 'ar-EG' : 'en-GB',
              { year: 'numeric', month: 'short', day: 'numeric' },
            );

            return (
              <motion.li
                key={post._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: (i % PAGE_SIZE) * 0.06, ease: 'easeOut' }}
              >
                <Link
                  href={`/blog/${post.slug.current}` as '/blog/[slug]'}
                  className={cn(
                    'group flex h-full flex-col border border-[var(--color-border)]',
                    'bg-[var(--color-surface)]',
                    'transition-colors duration-300 hover:border-[var(--color-border-hover)]',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]',
                  )}
                >
                  {/* Cover */}
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={coverUrl}
                      alt={post.coverImage.alt ?? title}
                      fill
                      loading="lazy"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      placeholder={blurUrl ? 'blur' : 'empty'}
                      blurDataURL={blurUrl}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs uppercase text-[var(--color-accent)]">
                        {post.category}
                      </span>
                      <span className="text-[var(--color-text-3)]" aria-hidden="true">·</span>
                      <span className="font-mono text-xs text-[var(--color-text-3)]">
                        {t('readingTime', { minutes: post.readingTime })}
                      </span>
                    </div>

                    <h3
                      className={cn(
                        'font-serif text-lg text-[var(--color-text-1)]',
                        'transition-colors group-hover:text-[var(--color-accent)]',
                      )}
                    >
                      {title}
                    </h3>

                    {excerpt && (
                      <p className="line-clamp-2 flex-1 text-sm text-[var(--color-text-2)]">
                        {excerpt}
                      </p>
                    )}

                    <p className="text-xs text-[var(--color-text-3)]">{date}</p>
                  </div>
                </Link>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>

      {/* Load more */}
      {hasMore && (
        <div className="mt-12 flex justify-center">
          <button
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className={cn(
              'border border-[var(--color-border)] px-8 py-3',
              'font-mono text-sm text-[var(--color-text-2)]',
              'transition-colors hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-1)]',
            )}
          >
            {t('loadMore')}
          </button>
        </div>
      )}
    </div>
  );
}
