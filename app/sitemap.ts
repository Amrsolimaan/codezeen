import type { MetadataRoute } from 'next';
import { client } from '@/sanity/lib/client';
import { PROJECT_SLUGS_QUERY, BLOG_POST_SLUGS_QUERY } from '@/sanity/lib/queries';

const BASE_URL = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://codezeen.com';
const LOCALES = ['en', 'ar'] as const;

function localizedEntries(path: string): MetadataRoute.Sitemap {
  return LOCALES.map((locale) => ({
    url: `${BASE_URL}/${locale}${path}`,
    lastModified: new Date(),
    alternates: {
      languages: Object.fromEntries(
        LOCALES.map((l) => [l, `${BASE_URL}/${l}${path}`]),
      ),
    },
  }));
}

const STATIC_PATHS = ['', '/work', '/services', '/about', '/blog', '/contact'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projectSlugs, blogSlugs] = await Promise.all([
    client.fetch<{ slug: string }[]>(PROJECT_SLUGS_QUERY).catch(() => []),
    client.fetch<{ slug: string }[]>(BLOG_POST_SLUGS_QUERY).catch(() => []),
  ]);

  const staticEntries = STATIC_PATHS.flatMap(localizedEntries);

  const projectEntries = projectSlugs.flatMap(({ slug }) =>
    localizedEntries(`/work/${slug}`),
  );

  const blogEntries = blogSlugs.flatMap(({ slug }) =>
    localizedEntries(`/blog/${slug}`),
  );

  return [...staticEntries, ...projectEntries, ...blogEntries];
}
