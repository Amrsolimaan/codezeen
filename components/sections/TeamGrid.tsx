import Image from 'next/image';
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

export function TeamGrid({ members, locale, emptyMessage }: TeamGridProps) {
  if (members.length === 0) {
    return <p className="py-16 text-center text-(--color-text-3)">{emptyMessage}</p>;
  }

  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" role="list">
      {members.map((member) => {
        const role = locale === 'ar' ? (member.role.ar ?? member.role.en) : member.role.en;
        const bio = locale === 'ar' ? (member.bio?.ar ?? member.bio?.en) : member.bio?.en;
        const photoUrl = urlFor(member.photo).width(600).auto('format').quality(90).fit('max').url();
        const blurUrl = member.photo.asset?.metadata?.lqip ?? undefined;
        const hasSocials = member.linkedin || member.github || member.twitter;

        return (
          <li key={member._id} style={{ perspective: '1200px' }}>
            {/* 3D flip wrapper */}
            <div
              className="relative h-75 w-full transition-transform duration-700 ease-in-out hover:transform-[rotateY(180deg)] motion-reduce:transition-none motion-reduce:hover:transform-none"
              style={{ transformStyle: 'preserve-3d' }}
            >

              {/* ── FRONT ── */}
              <div
                className="absolute inset-0 overflow-hidden rounded-xl border border-(--color-border) bg-(--color-surface)"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="relative h-54 overflow-hidden">
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

                <p className="absolute right-4 bottom-3 select-none text-[10px] text-(--color-text-3)">
                  hover to flip ↻
                </p>
              </div>

              {/* ── BACK ── */}
              <div
                className="absolute inset-0 overflow-hidden rounded-xl border border-(--color-accent) bg-(--color-surface-2)"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--color-accent-glow)_0%,transparent_65%)]" />

                <div className="relative flex h-full flex-col items-center justify-center gap-3 p-5 text-center">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-(--color-accent)">
                    <Image
                      src={photoUrl}
                      alt={member.photo.alt ?? member.name}
                      fill
                      quality={80}
                      className="object-cover object-top"
                      sizes="64px"
                    />
                  </div>

                  <div>
                    <p className="font-semibold leading-tight text-white">{member.name}</p>
                    <p className="text-xs text-(--color-accent)">{role}</p>
                  </div>

                  {bio && (
                    <p className="line-clamp-4 text-xs leading-relaxed text-(--color-text-2)">
                      {bio}
                    </p>
                  )}

                  {hasSocials && (
                    <div className="flex gap-3">
                      {member.linkedin && (
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${member.name} on LinkedIn`}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-(--color-border) text-(--color-text-3) transition-colors hover:border-(--color-accent) hover:text-(--color-accent)"
                        >
                          <LinkedinIcon size={14} />
                        </a>
                      )}
                      {member.github && (
                        <a
                          href={member.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${member.name} on GitHub`}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-(--color-border) text-(--color-text-3) transition-colors hover:border-(--color-accent) hover:text-(--color-accent)"
                        >
                          <GithubIcon size={14} />
                        </a>
                      )}
                      {member.twitter && (
                        <a
                          href={member.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${member.name} on Twitter / X`}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-(--color-border) text-(--color-text-3) transition-colors hover:border-(--color-accent) hover:text-(--color-accent)"
                        >
                          <XIcon size={14} />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </li>
        );
      })}
    </ul>
  );
}
