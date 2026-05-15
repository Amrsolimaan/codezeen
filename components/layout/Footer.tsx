import { getTranslations } from 'next-intl/server';
import { Mail, ExternalLink } from 'lucide-react';
import { Link } from '@/lib/navigation';
import { Logo } from '@/components/ui/Logo';
import { LinkedinIcon, XIcon } from '@/components/ui/BrandIcons';
import { cn } from '@/lib/utils';

const FacebookIcon = ({ size = 24, className }: { size?: number | string; className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

interface FooterProps {
  locale: string;
}

export async function Footer({ locale }: FooterProps) {
  const t = await getTranslations({ locale, namespace: 'footer' });
  const year = new Date().getFullYear();

  // Build arrays after translations are ready — no runtime key casting
  const serviceLinks = [
    { label: t('services.links.webDev'), href: '/services' },
    { label: t('services.links.mobileDev'), href: '/services' },
    { label: t('services.links.saas'), href: '/services' },
    { label: t('services.links.design'), href: '/services' },
    { label: t('services.links.consulting'), href: '/services' },
  ];

  const companyLinks = [
    { label: t('navigation.links.work'), href: '/work' },
    { label: t('navigation.links.services'), href: '/services' },
    { label: t('navigation.links.about'), href: '/about' },
    { label: t('navigation.links.blog'), href: '/blog' },
    { label: t('navigation.links.contact'), href: '/contact' },
  ];

  const email = t('connect.email');

  const socialLinks = [
    {
      Icon: FacebookIcon,
      href: 'https://www.facebook.com/share/1MCrL4fVDa/',
      label: t('connect.facebook'),
    },
    {
      Icon: LinkedinIcon,
      href: 'https://www.linkedin.com/in/code-zeen-7a08b73a6?utm_source=share_via&utm_content=profile&utm_medium=member_android',
      label: t('connect.linkedin'),
    },
    {
      Icon: XIcon,
      href: 'https://twitter.com/codezeen',
      label: t('connect.twitter'),
    },
    {
      Icon: Mail,
      href: `mailto:${email}`,
      label: email,
    },
  ] as const;

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-logo-dark)]">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">

        {/* ── 4-column grid ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Col 1 — Logo + tagline + socials */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" aria-label="Codezeen — Go to homepage">
              <Logo src="/logo-white.svg" imageWidth={50} imageHeight={64} variant="footer" />
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--color-text-2)]">
              {t('tagline')}
            </p>

            <div className="mt-6 flex gap-3">
              {socialLinks.map(({ Icon, href, label }) => (
                <a
                  key={href}
                  href={href}
                  target={href.startsWith('mailto') ? undefined : '_blank'}
                  rel={href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                  aria-label={label}
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-full',
                    'border border-[var(--color-border)] text-[var(--color-text-3)]',
                    'transition-colors duration-200',
                    'hover:border-[var(--color-border-hover)] hover:text-[var(--color-accent)]',
                  )}
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2 — Services */}
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-text-1)]">
              {t('services.title')}
            </h2>
            <ul className="mt-4 space-y-3" role="list">
              {serviceLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-[var(--color-text-2)] transition-colors duration-150 hover:text-[var(--color-text-1)]"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Company */}
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-text-1)]">
              {t('navigation.title')}
            </h2>
            <ul className="mt-4 space-y-3" role="list">
              {companyLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-[var(--color-text-2)] transition-colors duration-150 hover:text-[var(--color-text-1)]"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Contact */}
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-text-1)]">
              {t('connect.title')}
            </h2>
            <ul className="mt-4 space-y-3" role="list">
              <li>
                <a
                  href={`mailto:${email}`}
                  className="text-sm text-[var(--color-text-2)] transition-colors duration-150 hover:text-[var(--color-text-1)]"
                >
                  {email}
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/code-zeen-7a08b73a6?utm_source=share_via&utm_content=profile&utm_medium=member_android"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-2)] transition-colors duration-150 hover:text-[var(--color-text-1)]"
                >
                  {t('connect.linkedin')}
                  <ExternalLink size={11} aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/share/1MCrL4fVDa/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-2)] transition-colors duration-150 hover:text-[var(--color-text-1)]"
                >
                  {t('connect.facebook')}
                  <ExternalLink size={11} aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* ── Bottom bar ─────────────────────────────────────────────────────── */}
        <div
          className={cn(
            'mt-12 border-t border-[var(--color-border)] pt-8',
            'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between',
          )}
        >
          <p className="text-xs text-[var(--color-text-3)]">
            {t('legal.copyright', { year })}
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link
              href="/privacy"
              className="text-xs text-[var(--color-text-3)] transition-colors hover:text-[var(--color-text-2)]"
            >
              {t('legal.privacy')}
            </Link>
            <Link
              href="/terms"
              className="text-xs text-[var(--color-text-3)] transition-colors hover:text-[var(--color-text-2)]"
            >
              {t('legal.terms')}
            </Link>
            <span
              className="text-xs text-[var(--color-text-3)]"
            >
              Made in Egypt
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
