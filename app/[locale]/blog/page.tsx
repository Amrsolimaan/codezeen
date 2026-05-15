import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/lib/navigation';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { SplitText } from '@/components/animations/SplitText';
import { BlogGrid } from '@/components/sections/BlogGrid';
import { client } from '@/sanity/lib/client';
import { ALL_BLOG_POSTS_QUERY } from '@/sanity/lib/queries';
import { urlFor } from '@/sanity/lib/image';
import { cn, makeBreadcrumbJsonLd } from '@/lib/utils';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blog.meta' });
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
      canonical: `/${locale}/blog`,
      languages: { en: '/en/blog', ar: '/ar/blog' },
    },
  };
}

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

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, tNav, tCommon] = await Promise.all([
    getTranslations({ locale, namespace: 'blog' }),
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'common' }),
  ]);

  let posts: BlogPost[] = [];
  try {
    posts = (await client.fetch(ALL_BLOG_POSTS_QUERY)) ?? [];
  } catch {
    posts = [];
  }

  const featured = posts.find((p) => p.featured) ?? posts[0] ?? null;
  const rest = posts.filter((p) => p._id !== featured?._id);

  const siteUrl = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://codezeen.com';
  const breadcrumbJsonLd = makeBreadcrumbJsonLd(siteUrl, locale, tCommon('home'), [
    { name: tNav('blog'), path: '/blog' },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
      {/* Header */}
      <ScrollReveal className="mb-16">
        <SplitText
          as="h1"
          className="font-serif text-5xl text-[var(--color-text-1)] sm:text-6xl lg:text-7xl"
        >
          {t('title')}
        </SplitText>
        <p className="mt-5 max-w-xl text-[var(--color-text-2)]">{t('subtitle')}</p>
      </ScrollReveal>

      {posts.length === 0 ? (
        <ScrollReveal>
          <p className="text-[var(--color-text-3)]">{t('noPosts')}</p>
        </ScrollReveal>
      ) : (
        <>
          {/* Featured post */}
          {featured && (
            <ScrollReveal className="mb-16">
              <FeaturedPost post={featured} locale={locale} t={t} />
            </ScrollReveal>
          )}

          {/* Rest — client grid with load more */}
          {rest.length > 0 && (
            <BlogGrid posts={rest} locale={locale} />
          )}
        </>
      )}
    </section>
    </>
  );
}

// ─── Featured post ────────────────────────────────────────────────────────────

function FeaturedPost({
  post,
  locale,
  t,
}: {
  post: BlogPost;
  locale: string;
  t: Awaited<ReturnType<typeof getTranslations>>;
}) {
  const title = locale === 'ar' ? (post.title.ar ?? post.title.en) : post.title.en;
  const excerpt =
    locale === 'ar' ? (post.excerpt?.ar ?? post.excerpt?.en) : post.excerpt?.en;
  const coverUrl = urlFor(post.coverImage).width(1200).height(600).url();
  const blurUrl = post.coverImage.asset?.metadata?.lqip ?? undefined;
  const date = new Date(post.publishedAt).toLocaleDateString(
    locale === 'ar' ? 'ar-EG' : 'en-GB',
    { year: 'numeric', month: 'long', day: 'numeric' },
  );

  return (
    <Link
      href={`/blog/${post.slug.current}` as '/blog/[slug]'}
      className={cn(
        'group grid grid-cols-1 gap-0 lg:grid-cols-2',
        'border border-[var(--color-border)] transition-colors hover:border-[var(--color-border-hover)]',
      )}
    >
      {/* Image */}
      <div className="relative aspect-video overflow-hidden lg:aspect-auto">
        <Image
          src={coverUrl}
          alt={post.coverImage.alt ?? title}
          fill
          priority
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 1024px) 100vw, 50vw"
          placeholder={blurUrl ? 'blur' : 'empty'}
          blurDataURL={blurUrl}
        />
      </div>

      {/* Content */}
      <div className="flex flex-col justify-center gap-4 p-8 lg:p-12">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs uppercase text-[var(--color-accent)]">
            {post.category}
          </span>
          <span className="text-[var(--color-border-hover)]" aria-hidden="true">·</span>
          <span className="font-mono text-xs text-[var(--color-text-3)]">
            {t('readingTime', { minutes: post.readingTime })}
          </span>
        </div>

        <h2 className="font-serif text-2xl text-[var(--color-text-1)] group-hover:text-[var(--color-accent)] transition-colors sm:text-3xl">
          {title}
        </h2>

        {excerpt && (
          <p className="line-clamp-3 text-[var(--color-text-2)]">{excerpt}</p>
        )}

        <p className="text-xs text-[var(--color-text-3)]">{date}</p>
      </div>
    </Link>
  );
}
