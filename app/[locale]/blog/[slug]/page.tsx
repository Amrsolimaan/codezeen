import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { highlight } from 'sugar-high';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/lib/navigation';
import { client } from '@/sanity/lib/client';
import {
  BLOG_POST_BY_SLUG_QUERY,
  BLOG_POST_SLUGS_QUERY,
  RELATED_BLOG_POSTS_QUERY,
} from '@/sanity/lib/queries';
import { urlFor } from '@/sanity/lib/image';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { ReadingProgress } from '@/components/sections/ReadingProgress';
import { cn, makeBreadcrumbJsonLd } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PtMark {
  _key: string;
  _type: string;
  href?: string;
  blank?: boolean;
}

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
  markDefs?: PtMark[];
  level?: number;
  listItem?: string;
}

interface PtImage {
  _type: 'image';
  _key: string;
  asset: { _id: string; url?: string | null; metadata?: { lqip?: string | null } | null };
  alt?: string | null;
  caption?: string | null;
}

interface PtCodeBlock {
  _type: 'codeBlock';
  _key: string;
  code?: string | null;
  language?: string | null;
  filename?: string | null;
}

type BodyBlock = PtBlock | PtImage | PtCodeBlock;

interface BlogPost {
  _id: string;
  title: { en: string; ar?: string | null };
  slug: { current: string };
  coverImage: {
    asset: {
      _id: string;
      url?: string | null;
      metadata?: { lqip?: string | null; dimensions?: { width: number; height: number } | null } | null;
    };
    alt?: string | null;
  };
  publishedAt: string;
  category: string;
  tags: string[] | null;
  excerpt?: { en?: string | null; ar?: string | null } | null;
  body: { en?: BodyBlock[] | null; ar?: BodyBlock[] | null } | null;
  readingTime: number;
  featured: boolean;
}

interface RelatedPost {
  _id: string;
  title: { en: string; ar?: string | null };
  slug: { current: string };
  coverImage: {
    asset: { _id: string; url?: string | null; metadata?: { lqip?: string | null } | null };
    alt?: string | null;
  };
  publishedAt: string;
  category: string;
  excerpt?: { en?: string | null; ar?: string | null } | null;
  readingTime: number;
}

// ─── Static params ────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  try {
    const slugs = await client.fetch(BLOG_POST_SLUGS_QUERY);
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
    const post = await client.fetch<BlogPost | null>(BLOG_POST_BY_SLUG_QUERY, { slug });
    if (!post) return {};
    const title = locale === 'ar' ? (post.title.ar ?? post.title.en) : post.title.en;
    const excerpt =
      locale === 'ar' ? (post.excerpt?.ar ?? post.excerpt?.en) : post.excerpt?.en;
    const ogImage = urlFor(post.coverImage).width(1200).height(630).url();
    return {
      title: `${title} — Codezeen Blog`,
      description: excerpt ?? undefined,
      openGraph: {
        title: `${title} — Codezeen Blog`,
        description: excerpt ?? undefined,
        images: [{ url: ogImage, width: 1200, height: 630 }],
        type: 'article',
        publishedTime: post.publishedAt,
      },
      alternates: {
        canonical: `/${locale}/blog/${slug}`,
        languages: { en: `/en/blog/${slug}`, ar: `/ar/blog/${slug}` },
      },
    };
  } catch {
    return {};
  }
}

// ─── PortableText renderer ────────────────────────────────────────────────────

function renderSpan(span: PtSpan, markDefs: PtMark[], i: number): React.ReactNode {
  const text = span.text ?? '';
  const marks = span.marks ?? [];

  const linkMark = marks
    .map((m) => markDefs.find((d) => d._key === m))
    .find((d): d is PtMark => d?._type === 'link');

  let node: React.ReactNode = text;
  if (marks.includes('code'))
    node = (
      <code
        key={i}
        className="rounded bg-[var(--color-surface)] px-1.5 py-0.5 font-mono text-[0.875em] text-[var(--color-accent)]"
      >
        {text}
      </code>
    );
  else if (marks.includes('strong') && marks.includes('em'))
    node = <strong key={i}><em>{text}</em></strong>;
  else if (marks.includes('strong'))
    node = <strong key={i} className="font-semibold text-[var(--color-text-1)]">{text}</strong>;
  else if (marks.includes('em'))
    node = <em key={i}>{text}</em>;
  else if (marks.includes('underline'))
    node = <span key={i} className="underline">{text}</span>;
  else node = text;

  if (linkMark?.href) {
    return (
      <a
        key={i}
        href={linkMark.href}
        target={linkMark.blank ? '_blank' : undefined}
        rel={linkMark.blank ? 'noopener noreferrer' : undefined}
        className="underline decoration-[var(--color-accent)] underline-offset-2 transition-colors hover:text-[var(--color-accent)]"
      >
        {node}
      </a>
    );
  }

  return <span key={i}>{node}</span>;
}

function RenderBody({ blocks }: { blocks: BodyBlock[] | null | undefined }) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="space-y-6">
      {blocks.map((block) => {
        // Code block (custom type)
        if (block._type === 'codeBlock') {
          const cb = block as PtCodeBlock;
          const highlighted = highlight(cb.code ?? '');
          return (
            <div key={cb._key} className="overflow-hidden border border-[var(--color-border)]">
              {(cb.filename ?? cb.language) && (
                <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2">
                  {cb.filename && (
                    <span className="font-mono text-xs text-[var(--color-text-3)]">
                      {cb.filename}
                    </span>
                  )}
                  {cb.language && (
                    <span className="font-mono text-xs uppercase text-[var(--color-text-3)]">
                      {cb.language}
                    </span>
                  )}
                </div>
              )}
              <pre className="overflow-x-auto bg-[var(--color-bg)] p-5 text-sm leading-relaxed">
                <code
                  className="sh"
                  // Code comes from our own Sanity CMS — controlled content
                  dangerouslySetInnerHTML={{ __html: highlighted }}
                />
              </pre>
            </div>
          );
        }

        // Embedded image
        if (block._type === 'image') {
          const img = block as PtImage;
          const src = urlFor(img).width(800).url();
          const blur = img.asset?.metadata?.lqip ?? undefined;
          return (
            <figure key={img._key} className="my-8">
              <Image
                src={src}
                alt={img.alt ?? ''}
                width={800}
                height={450}
                className="w-full object-cover"
                placeholder={blur ? 'blur' : 'empty'}
                blurDataURL={blur}
              />
              {img.caption && (
                <figcaption className="mt-2 text-center text-xs text-[var(--color-text-3)]">
                  {img.caption}
                </figcaption>
              )}
            </figure>
          );
        }

        // Regular block
        if (block._type === 'block') {
          const b = block as PtBlock;
          const defs = b.markDefs ?? [];
          const children = b.children?.map((span, i) => renderSpan(span, defs, i));

          if (b.style === 'blockquote') {
            return (
              <blockquote
                key={b._key}
                className="border-s-2 border-[var(--color-accent)] py-1 ps-5 font-serif text-lg italic text-[var(--color-text-2)]"
              >
                {children}
              </blockquote>
            );
          }

          if (b.listItem === 'bullet') {
            return (
              <li key={b._key} className="flex gap-2 text-[var(--color-text-2)] leading-relaxed">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]" aria-hidden="true" />
                <span>{children}</span>
              </li>
            );
          }

          const Tag =
            b.style === 'h2' ? 'h2'
            : b.style === 'h3' ? 'h3'
            : b.style === 'h4' ? 'h4'
            : 'p';

          const cls =
            Tag === 'h2' ? 'mt-10 mb-3 font-serif text-2xl text-[var(--color-text-1)] sm:text-3xl'
            : Tag === 'h3' ? 'mt-8 mb-2 font-serif text-xl text-[var(--color-text-1)]'
            : Tag === 'h4' ? 'mt-6 mb-1 font-medium text-[var(--color-text-1)]'
            : 'text-[var(--color-text-2)] leading-relaxed';

          return <Tag key={b._key} className={cls}>{children}</Tag>;
        }

        return null;
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'blog' });

  let post: BlogPost | null = null;
  let related: RelatedPost[] = [];

  try {
    post = await client.fetch<BlogPost | null>(BLOG_POST_BY_SLUG_QUERY, { slug });
  } catch {
    notFound();
  }

  if (!post) notFound();

  try {
    related = (await client.fetch<RelatedPost[]>(RELATED_BLOG_POSTS_QUERY, {
      category: post.category,
      slug,
    })) ?? [];
  } catch {
    related = [];
  }

  const title = locale === 'ar' ? (post.title.ar ?? post.title.en) : post.title.en;
  const body = locale === 'ar' ? (post.body?.ar ?? post.body?.en) : post.body?.en;
  const coverUrl = urlFor(post.coverImage).width(1200).height(630).url();
  const coverBlur = post.coverImage.asset?.metadata?.lqip ?? undefined;
  const date = new Date(post.publishedAt).toLocaleDateString(
    locale === 'ar' ? 'ar-EG' : 'en-GB',
    { year: 'numeric', month: 'long', day: 'numeric' },
  );

  const siteUrl = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://codezeen.com';

  const tNav = await getTranslations({ locale, namespace: 'nav' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const breadcrumbJsonLd = makeBreadcrumbJsonLd(siteUrl, locale, tCommon('home'), [
    { name: tNav('blog'), path: '/blog' },
    { name: title, path: `/blog/${slug}` },
  ]);

  const excerpt = locale === 'ar' ? (post.excerpt?.ar ?? post.excerpt?.en) : post.excerpt?.en;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    image: coverUrl,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    description: excerpt ?? undefined,
    author: { '@type': 'Organization', name: 'Codezeen', url: siteUrl },
    publisher: { '@type': 'Organization', name: 'Codezeen', url: siteUrl },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    <article>
      <ReadingProgress />

      {/* ── Back button ──────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 pt-32 lg:px-8 lg:pt-40">
        <Link
          href="/blog"
          aria-label={t('backToBlog')}
          className={cn(
            'inline-flex items-center gap-2 rounded-full px-5 py-2.5',
            'border border-white/[0.12] bg-white/[0.04] backdrop-blur-md',
            'font-mono text-xs text-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
            'transition-all duration-200 hover:border-[var(--color-accent)]/45 hover:bg-[var(--color-accent)]/[0.08] hover:text-white',
          )}
        >
          <ArrowLeft size={13} aria-hidden="true" className="rtl:rotate-180" />
          {t('backToBlog')}
        </Link>
      </div>

      {/* ── Hero: image + article info side-by-side ──────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 pb-4 pt-8 lg:px-8 lg:pt-12 lg:pb-6">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14 lg:items-center">

          {/* Left — cover image with rounded corners */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl sm:aspect-[16/10]
                          ring-1 ring-inset ring-white/[0.07] shadow-[0_24px_64px_rgba(0,0,0,0.55)]">
            <Image
              src={coverUrl}
              alt={post.coverImage.alt ?? title}
              fill
              priority
              className="object-cover transition-transform duration-700 hover:scale-[1.02]"
              sizes="(max-width: 1024px) 100vw, 58vw"
              placeholder={coverBlur ? 'blur' : 'empty'}
              blurDataURL={coverBlur}
            />
          </div>

          {/* Right — article metadata + title */}
          <div className="flex flex-col">
            {/* "Blog Post" decorative label */}
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/25 select-none">
              {t('postLabel')}
            </span>

            {/* Category + reading time + date */}
            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span
                className={cn(
                  'rounded-full px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-widest',
                  'bg-[var(--color-accent)]/[0.12] text-[var(--color-accent)]',
                )}
              >
                {post.category}
              </span>
              <span className="font-mono text-xs text-white/35">
                {t('readingTime', { minutes: post.readingTime })}
              </span>
              <span className="text-white/20" aria-hidden="true">·</span>
              <time dateTime={post.publishedAt} className="font-mono text-xs text-white/35">
                {date}
              </time>
            </div>

            {/* Title */}
            <h1 className="mt-6 font-serif text-[1.75rem] leading-[1.2] text-[var(--color-text-1)] sm:text-4xl xl:text-[2.75rem]">
              {title}
            </h1>

            {/* Excerpt */}
            {excerpt && (
              <p className="mt-5 text-[0.9375rem] leading-relaxed text-[var(--color-text-2)]">
                {excerpt}
              </p>
            )}

            {/* Accent divider */}
            <div className="mt-8 h-[2px] w-14 rounded-full bg-gradient-to-r from-[var(--color-accent)] to-transparent" />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className={cn(
                      'border border-[var(--color-border)] px-2.5 py-1',
                      'font-mono text-[10px] text-[var(--color-text-3)]',
                      'transition-colors hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-2)]',
                    )}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Article content ───────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[720px] px-6 py-14 lg:py-20">

        {/* Body */}
        <ScrollReveal>
          <RenderBody blocks={body} />
        </ScrollReveal>
      </div>

      {/* ── Related posts ─────────────────────────────────────────────────── */}
      {related.length > 0 && (
        <section
          className="border-t border-[var(--color-border)] py-16"
          aria-label={t('relatedPosts')}
        >
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <ScrollReveal className="mb-10">
              <h2 className="font-serif text-2xl text-[var(--color-text-1)]">
                {t('relatedPosts')}
              </h2>
            </ScrollReveal>

            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-3" role="list">
              {related.map((rp, i) => {
                const rpTitle = locale === 'ar' ? (rp.title.ar ?? rp.title.en) : rp.title.en;
                const rpCover = urlFor(rp.coverImage).width(600).height(400).url();
                const rpBlur = rp.coverImage.asset?.metadata?.lqip ?? undefined;

                return (
                  <li key={rp._id}>
                  <ScrollReveal delay={i * 0.08}>
                    <Link
                      href={`/blog/${rp.slug.current}` as '/blog/[slug]'}
                      className={cn(
                        'group flex flex-col border border-[var(--color-border)]',
                        'transition-colors hover:border-[var(--color-border-hover)]',
                      )}
                    >
                      <div className="relative aspect-video overflow-hidden">
                        <Image
                          src={rpCover}
                          alt={rp.coverImage.alt ?? rpTitle}
                          fill
                          loading="lazy"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, 33vw"
                          placeholder={rpBlur ? 'blur' : 'empty'}
                          blurDataURL={rpBlur}
                        />
                      </div>
                      <div className="p-4">
                        <p className="mb-1 font-mono text-xs uppercase text-[var(--color-accent)]">
                          {rp.category}
                        </p>
                        <h3 className="font-medium text-[var(--color-text-1)] group-hover:text-[var(--color-accent)] transition-colors">
                          {rpTitle}
                        </h3>
                      </div>
                    </Link>
                  </ScrollReveal>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}
    </article>
    </>
  );
}
