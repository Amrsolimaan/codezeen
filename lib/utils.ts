import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type PtChild = { _type: string; text?: string };
type PtBlock = { _type: string; _key?: string; children?: PtChild[] };

export function firstParagraph(blocks: PtBlock[] | null | undefined): string {
  if (!blocks) return '';
  const block = blocks.find((b) => b._type === 'block' && b.children);
  if (!block?.children) return '';
  return block.children
    .filter((c) => c._type === 'span')
    .map((c) => c.text ?? '')
    .join('');
}

export function makeBreadcrumbJsonLd(
  siteUrl: string,
  locale: string,
  homeLabel: string,
  crumbs: Array<{ name: string; path: string }>,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: homeLabel, item: `${siteUrl}/${locale}` },
      ...crumbs.map(({ name, path }, i) => ({
        '@type': 'ListItem',
        position: i + 2,
        name,
        item: `${siteUrl}/${locale}${path}`,
      })),
    ],
  };
}
