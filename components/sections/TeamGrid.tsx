'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { urlFor } from '@/sanity/lib/image';
import { GithubIcon, LinkedinIcon, XIcon } from '@/components/ui/BrandIcons';

interface TeamMember {
  _id: string;
  name: string;
  role: { en: string; ar?: string | null };
  bio: { en?: string | null; ar?: string | null } | null;
  photo: {
    asset: {
      _id: string;
      url?: string | null;
      metadata?: { lqip?: string | null } | null;
    };
    alt?: string | null;
  };
  linkedin?: string | null;
  github?: string | null;
  twitter?: string | null;
  order: number;
}

interface TeamGridProps {
  members: TeamMember[];
  locale: string;
  emptyMessage: string;
}

const CARD_HEIGHT = 360;
const PHOTO_HEIGHT = 256;

function chunkText(text: string, maxLength: number): string[] {
  if (!text) return [];
  const words = text.split(' ');
  const chunks: string[] = [];
  let currentChunk = '';

  for (const word of words) {
    if ((currentChunk + word).length > maxLength) {
      if (currentChunk.trim()) chunks.push(currentChunk.trim());
      currentChunk = word + ' ';
    } else {
      currentChunk += word + ' ';
    }
  }
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  return chunks;
}

function TeamMemberCard({
  member,
  locale,
  isFlipped,
  toggle,
}: {
  member: TeamMember;
  locale: string;
  isFlipped: boolean;
  toggle: () => void;
}) {
  const [page, setPage] = useState(0);

  useEffect(() => {
    const timer = !isFlipped ? setTimeout(() => setPage(0), 400) : undefined;

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isFlipped]);

  const role = locale === 'ar' ? (member.role.ar ?? member.role.en) : member.role.en;
  const bio = locale === 'ar' ? (member.bio?.ar ?? member.bio?.en) : member.bio?.en;
  const photoUrl = urlFor(member.photo).width(600).auto('format').quality(90).fit('max').url();
  const blurUrl = member.photo.asset?.metadata?.lqip ?? undefined;
  const hasSocials = !!(member.linkedin || member.github || member.twitter);

  const bioChunks = useMemo(() => chunkText(bio || '', 320), [bio]);
  const totalPages = bioChunks.length;

  return (
    <li className="w-full">
      <div className="w-full" style={{ perspective: '1200px', height: `${CARD_HEIGHT}px` }}>
        <div
          tabIndex={0}
          aria-label={`${member.name} — ${isFlipped ? 'click to close' : 'click to see details'}`}
          onClick={toggle}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggle();
            }
            if (e.key === 'Escape' && isFlipped) toggle();
          }}
          className="relative w-full cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-accent)"
          style={{
            height: `${CARD_HEIGHT}px`,
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'none',
            transition: 'transform 0.65s cubic-bezier(0.4, 0.2, 0.2, 1)',
          }}
        >
          {/* ── FRONT ── */}
          <div
            className="absolute inset-0 overflow-hidden rounded-xl border border-(--color-border) bg-(--color-surface)"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', pointerEvents: isFlipped ? 'none' : 'auto' }}
          >
            <div className="relative overflow-hidden" style={{ height: `${PHOTO_HEIGHT}px` }}>
              <Image
                src={photoUrl}
                alt={member.photo.alt ?? member.name}
                fill
                quality={90}
                className="object-cover object-top"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                placeholder={blurUrl ? 'blur' : 'empty'}
                blurDataURL={blurUrl}
              />
              <div className="absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-(--color-surface) to-transparent" />
            </div>

            <div className="px-4 pt-2 pb-3">
              <p className="font-semibold leading-tight text-white">{member.name}</p>
              <p className="text-sm text-(--color-accent)">{role}</p>
            </div>

            <div className={`absolute inset-x-4 bottom-3 z-10 flex items-center ${hasSocials ? 'justify-between' : 'justify-end'}`}>
              {hasSocials && (
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {member.linkedin && (
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} on LinkedIn`} className="flex h-8 w-8 items-center justify-center rounded-full border border-(--color-border) text-(--color-text-3) transition-colors hover:border-(--color-accent) hover:text-(--color-accent)">
                      <LinkedinIcon size={14} />
                    </a>
                  )}
                  {member.github && (
                    <a href={member.github} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} on GitHub`} className="flex h-8 w-8 items-center justify-center rounded-full border border-(--color-border) text-(--color-text-3) transition-colors hover:border-(--color-accent) hover:text-(--color-accent)">
                      <GithubIcon size={14} />
                    </a>
                  )}
                  {member.twitter && (
                    <a href={member.twitter} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} on Twitter / X`} className="flex h-8 w-8 items-center justify-center rounded-full border border-(--color-border) text-(--color-text-3) transition-colors hover:border-(--color-accent) hover:text-(--color-accent)">
                      <XIcon size={14} />
                    </a>
                  )}
                </div>
              )}
              <p className="select-none text-[10px] text-(--color-text-3)">
                <span className="sm:hidden">tap</span>
                <span className="hidden sm:inline">click</span>{' '}to flip ↻
              </p>
            </div>
          </div>

          {/* ── BACK ── */}
          <div
            className="absolute inset-0 overflow-hidden rounded-xl border border-(--color-accent) bg-(--color-surface-2)"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', pointerEvents: isFlipped ? 'auto' : 'none' }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--color-accent-glow)_0%,transparent_65%)]" />

            <div className="relative flex h-full flex-col p-5">
              {/* Dots */}
              {totalPages > 1 && (
                <div className="mb-2 flex shrink-0 justify-center gap-1.5">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setPage(i); }}
                      aria-label={`Page ${i + 1}`}
                      className={`h-1.5 rounded-full transition-all duration-300 ${i === page ? 'w-4 bg-(--color-accent)' : 'w-1.5 bg-(--color-border) hover:bg-(--color-text-3)'}`}
                    />
                  ))}
                </div>
              )}

              {/* Sliding text — inner rail slides up on page change */}
              <div className="relative min-h-0 flex-1 overflow-hidden">
                {totalPages > 0 && (
                  <div
                    className="absolute inset-x-0 top-0"
                    style={{
                      height: `${totalPages * 100}%`,
                      transform: `translateY(-${(page / totalPages) * 100}%)`,
                      transition: 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    {bioChunks.map((chunk, i) => (
                      <div
                        key={i}
                        className="overflow-hidden"
                        style={{ height: `${(1 / totalPages) * 100}%` }}
                      >
                        <p className="text-start text-sm leading-[1.8] text-(--color-text-2)">
                          {chunk}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Navigation Arrows */}
              {totalPages > 1 && (
                <div className="mt-2 flex shrink-0 items-center justify-between">
                  {page > 0 ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); setPage((p) => p - 1); }}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-(--color-border) text-(--color-text-3) transition-colors hover:border-(--color-accent) hover:text-(--color-accent)"
                      aria-label="Previous page"
                    >
                      <ChevronUp size={16} />
                    </button>
                  ) : (
                    <div className="w-8" />
                  )}
                  {page < totalPages - 1 ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); setPage((p) => p + 1); }}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-(--color-border) text-(--color-text-3) transition-colors hover:border-(--color-accent) hover:text-(--color-accent)"
                      aria-label="Next page"
                    >
                      <ChevronDown size={16} />
                    </button>
                  ) : (
                    <div className="w-8" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}
export function TeamGrid({ members, locale, emptyMessage }: TeamGridProps) {
  const [flippedId, setFlippedId] = useState<string | null>(null);

  if (members.length === 0) {
    return <p className="py-16 text-center text-(--color-text-3)">{emptyMessage}</p>;
  }

  return (
    <ul className="grid w-full grid-cols-[minmax(280px,1fr)] gap-6 sm:grid-cols-[repeat(2,minmax(280px,1fr))] lg:grid-cols-[repeat(3,minmax(280px,1fr))]" role="list">
      {members.map((member) => (
        <TeamMemberCard
          key={member._id}
          member={member}
          locale={locale}
          isFlipped={flippedId === member._id}
          toggle={() => setFlippedId(flippedId === member._id ? null : member._id)}
        />
      ))}
    </ul>
  );
}
