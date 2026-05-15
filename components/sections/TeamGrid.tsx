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
    return <p className="py-16 text-center text-[var(--color-text-3)]">{emptyMessage}</p>;
  }

  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" role="list">
      {members.map((member) => {
        const role = locale === 'ar' ? (member.role.ar ?? member.role.en) : member.role.en;
        const bio = locale === 'ar' ? (member.bio?.ar ?? member.bio?.en) : member.bio?.en;
        const photoUrl = urlFor(member.photo).width(800).fit('max').url();
        const blurUrl = member.photo.asset?.metadata?.lqip ?? undefined;
        const hasSocials = member.linkedin || member.github || member.twitter;

        return (
          <li key={member._id}>
            <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] transition-colors duration-300 hover:border-[var(--color-accent)]">
              {/* Photo — full width with optimized height */}
              <div className="relative aspect-[4/5] overflow-hidden rounded-t-xl bg-[var(--color-bg)]">
                <Image
                  src={photoUrl}
                  alt={member.photo.alt ?? member.name}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  placeholder={blurUrl ? 'blur' : 'empty'}
                  blurDataURL={blurUrl}
                />
              </div>

              {/* Info */}
              <div className="p-4">
                <p className="font-semibold text-white">{member.name}</p>
                <p className="text-sm text-[var(--color-accent)]">{role}</p>
                {bio && (
                  <p className="mt-2 line-clamp-2 text-sm text-[var(--color-text-2)]">{bio}</p>
                )}

                {hasSocials && (
                  <div className="mt-3 flex gap-3">
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${member.name} on LinkedIn`}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text-3)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
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
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text-3)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
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
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text-3)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                      >
                        <XIcon size={14} />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
