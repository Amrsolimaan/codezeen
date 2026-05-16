import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { client } from '@/sanity/lib/client';
import { FEATURED_TESTIMONIALS_QUERY } from '@/sanity/lib/queries';
import { urlFor } from '@/sanity/lib/image';
import { Link } from '@/lib/navigation';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Testimonial {
  _id: string;
  author: string;
  role?: { en?: string | null; ar?: string | null } | null;
  company?: { en?: string | null; ar?: string | null } | null;
  quote: { en: string; ar?: string | null };
  avatar?: {
    asset?: {
      _id: string;
      url?: string | null;
      metadata?: { lqip?: string | null } | null;
    } | null;
    alt?: string | null;
  } | null;
  rating?: number | null;
  project?: {
    title: { en: string; ar?: string | null };
    slug: { current: string };
  } | null;
}

// ─── Star rating ──────────────────────────────────────────────────────────────

function StarRating({ rating, label }: { rating: number; label: string }) {
  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={label}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={13}
          aria-hidden="true"
          className={cn(
            i < rating
              ? 'fill-amber-400 text-amber-400'
              : 'fill-none text-[var(--color-border-hover)]',
          )}
        />
      ))}
    </div>
  );
}

// ─── Author avatar ────────────────────────────────────────────────────────────

function AuthorAvatar({
  name,
  avatar,
}: {
  name: string;
  avatar: Testimonial['avatar'];
}) {
  const initials = name
    .split(' ')
    .map((n) => n[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (avatar?.asset?.url) {
    const src = urlFor(avatar).width(80).height(80).url();
    const blur = avatar.asset.metadata?.lqip ?? undefined;
    return (
      <Image
        src={src}
        alt={avatar.alt ?? name}
        width={40}
        height={40}
        className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-[var(--color-border)]"
        placeholder={blur ? 'blur' : 'empty'}
        blurDataURL={blur}
      />
    );
  }

  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-logo-mid)] font-mono text-xs font-semibold text-white"
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

interface Props {
  locale: string;
}

export async function TestimonialsSection({ locale }: Props) {
  const t = await getTranslations({ locale, namespace: 'home.testimonials' });
  const isAr = locale === 'ar';

  let testimonials: Testimonial[] = [];
  try {
    testimonials = (await client.fetch(FEATURED_TESTIMONIALS_QUERY)) as Testimonial[];
  } catch {
    // Sanity unreachable — silently hide section
  }

  if (testimonials.length === 0) return null;

  return (
    <section
      className="bg-[var(--color-surface)] py-24 lg:py-32"
      aria-labelledby="testimonials-heading"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <ScrollReveal className="mb-16 text-center">
          <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-[var(--color-accent)]">
            {t('eyebrow')}
          </p>
          <h2
            id="testimonials-heading"
            className="font-serif text-3xl font-normal text-[var(--color-text-1)] sm:text-4xl lg:text-5xl"
          >
            {t('title')}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[var(--color-text-2)]">
            {t('subtitle')}
          </p>
        </ScrollReveal>

        {/* ── Cards grid ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item, i) => {
            const quote = isAr
              ? (item.quote.ar ?? item.quote.en)
              : item.quote.en;

            const role = isAr
              ? (item.role?.ar ?? item.role?.en ?? null)
              : (item.role?.en ?? null);

            const company = isAr
              ? (item.company?.ar ?? item.company?.en ?? null)
              : (item.company?.en ?? null);

            const byline = [role, company].filter(Boolean).join(' · ');

            const projectTitle = item.project
              ? (isAr
                  ? (item.project.title.ar ?? item.project.title.en)
                  : item.project.title.en)
              : null;

            const rating = Math.min(5, Math.max(1, item.rating ?? 5));

            return (
              <ScrollReveal
                key={item._id}
                delay={Math.min(i * 0.08, 0.24)}
              >
                <article
                  className={cn(
                    'flex h-full flex-col rounded-2xl',
                    'border border-[var(--color-border)] bg-[var(--color-bg)]',
                    'p-6 lg:p-8',
                    'transition-colors duration-300',
                    'hover:border-[var(--color-border-hover)]',
                  )}
                >
                  {/* Top row: rating + project chip */}
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <StarRating
                      rating={rating}
                      label={t('ratingLabel', { rating })}
                    />

                    {item.project && projectTitle && (
                      <Link
                        href={`/work/${item.project.slug.current}` as '/work/[slug]'}
                        className={cn(
                          'shrink-0 rounded-full border border-[var(--color-border)]',
                          'px-2.5 py-1 font-mono text-[10px] text-[var(--color-text-3)]',
                          'transition-colors hover:border-[var(--color-border-hover)] hover:text-[var(--color-accent)]',
                        )}
                      >
                        {projectTitle}
                      </Link>
                    )}
                  </div>

                  {/* Opening quote mark */}
                  <span
                    className="mb-3 block font-serif text-5xl leading-none text-[var(--color-accent)] opacity-30 select-none"
                    aria-hidden="true"
                  >
                    &ldquo;
                  </span>

                  {/* Quote */}
                  <blockquote className="flex-1">
                    <p className="text-[0.9375rem] leading-[1.75] text-[var(--color-text-2)]">
                      {quote}
                    </p>
                  </blockquote>

                  {/* Divider */}
                  <div className="my-6 h-px bg-[var(--color-border)]" aria-hidden="true" />

                  {/* Author */}
                  <footer>
                    <div className="flex items-center gap-3">
                      <AuthorAvatar name={item.author} avatar={item.avatar} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[var(--color-text-1)]">
                          {item.author}
                        </p>
                        {byline && (
                          <p className="truncate text-xs leading-snug text-[var(--color-text-3)]">
                            {byline}
                          </p>
                        )}
                      </div>
                    </div>
                  </footer>
                </article>
              </ScrollReveal>
            );
          })}
        </div>

      </div>
    </section>
  );
}
