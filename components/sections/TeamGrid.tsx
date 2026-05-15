import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import { urlFor } from '@/sanity/lib/image';
import { cn } from '@/lib/utils';

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
    <ul
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      role="list"
    >
      {members.map((member) => {
        const role = locale === 'ar' ? (member.role.ar ?? member.role.en) : member.role.en;
        const bio =
          locale === 'ar' ? (member.bio?.ar ?? member.bio?.en) : member.bio?.en;
        const photoUrl = urlFor(member.photo).width(400).height(400).url();
        const blurUrl = member.photo.asset?.metadata?.lqip ?? undefined;

        return (
          <li key={member._id}>
            {/* Scene — perspective parent */}
            <div
              className="team-card-scene relative h-80 cursor-pointer"
              role="group"
              aria-label={member.name}
              tabIndex={0}
            >
              {/* Inner — the flipping card */}
              <div className="team-card-inner absolute inset-0">
                {/* Front face */}
                <div
                  className={cn(
                    'team-card-face absolute inset-0 flex flex-col',
                    'bg-[var(--color-surface)]',
                  )}
                >
                  <div className="relative flex-1 overflow-hidden">
                    <Image
                      src={photoUrl}
                      alt={member.photo.alt ?? member.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      placeholder={blurUrl ? 'blur' : 'empty'}
                      blurDataURL={blurUrl}
                    />
                  </div>
                  <div className="p-4">
                    <p className="font-medium text-[var(--color-text-1)]">{member.name}</p>
                    <p className="text-sm text-[var(--color-text-3)]">{role}</p>
                  </div>
                </div>

                {/* Back face */}
                <div
                  className={cn(
                    'team-card-face team-card-back absolute inset-0 flex flex-col justify-between p-5',
                    'bg-[var(--color-surface-2)]',
                  )}
                >
                  <div>
                    <p className="mb-1 font-medium text-[var(--color-text-1)]">{member.name}</p>
                    <p className="mb-4 text-xs text-[var(--color-accent)]">{role}</p>
                    {bio && (
                      <p className="line-clamp-5 text-sm text-[var(--color-text-2)] leading-relaxed">
                        {bio}
                      </p>
                    )}
                  </div>

                  {/* Social links */}
                  {(member.linkedin || member.github || member.twitter) && (
                    <div className="flex gap-3 pt-4">
                      {member.linkedin && (
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[var(--color-text-3)] hover:text-[var(--color-accent)] transition-colors flex items-center gap-1"
                          aria-label={`${member.name} on LinkedIn`}
                        >
                          <ExternalLink size={12} aria-hidden="true" />
                          LinkedIn
                        </a>
                      )}
                      {member.github && (
                        <a
                          href={member.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[var(--color-text-3)] hover:text-[var(--color-accent)] transition-colors flex items-center gap-1"
                          aria-label={`${member.name} on GitHub`}
                        >
                          <ExternalLink size={12} aria-hidden="true" />
                          GitHub
                        </a>
                      )}
                      {member.twitter && (
                        <a
                          href={member.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[var(--color-text-3)] hover:text-[var(--color-accent)] transition-colors flex items-center gap-1"
                          aria-label={`${member.name} on Twitter`}
                        >
                          <ExternalLink size={12} aria-hidden="true" />
                          Twitter
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
