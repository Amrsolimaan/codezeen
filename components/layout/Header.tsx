'use client';

import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link, usePathname, useRouter } from '@/lib/navigation';
import { Logo } from '@/components/ui/Logo';

const NAV_LINKS = [
  { key: 'home', href: '/' },
  { key: 'work', href: '/work' },
  { key: 'services', href: '/services' },
  { key: 'about', href: '/about' },
  { key: 'blog', href: '/blog' },
  { key: 'contact', href: '/contact' },
] as const;

type NavKey = (typeof NAV_LINKS)[number]['key'];

export function Header() {
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsScrolled(latest > 80);
  });

  // Close mobile menu when navigating
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Lock body scroll while menu open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const otherLocale = locale === 'en' ? 'ar' : 'en';

  function switchLocale() {
    router.replace(pathname, { locale: otherLocale });
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/');
  }

  return (
    <>
      {/* Skip-to-content for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-[var(--color-accent)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        {tCommon('skipToContent')}
      </a>

      <header
        className={cn(
          'fixed inset-x-0 top-0 z-40 transition-all duration-300',
          isScrolled
            ? 'border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 py-3 backdrop-blur-md'
            : 'bg-gradient-to-b from-[var(--color-bg)]/85 via-[var(--color-bg)]/40 to-transparent py-5',
        )}
      >
        <nav
          className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 lg:px-8"
          aria-label={tCommon('menu')}
        >
          {/* Logo — left in LTR, right in RTL (flex-start) */}
          <Link href="/" aria-label="Codezeen — Go to homepage">
            <Logo />
          </Link>

          {/* Desktop nav — center */}
          <ul
            className="hidden items-center gap-8 lg:flex"
            role="list"
          >
            {NAV_LINKS.map(({ key, href }) => (
              <li key={key}>
                <Link
                  href={href}
                  aria-current={isActive(href) ? 'page' : undefined}
                  className={cn(
                    'relative py-1 text-sm font-medium transition-colors duration-200',
                    isActive(href)
                      ? 'text-[var(--color-text-1)]'
                      : 'text-[var(--color-text-2)] hover:text-[var(--color-text-1)]',
                  )}
                >
                  {t(key as NavKey)}
                  {isActive(href) && (
                    <span
                      className="absolute inset-x-0 -bottom-0.5 h-px bg-[var(--color-accent)]"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right cluster: locale switcher + CTA + hamburger */}
          <div className="flex items-center gap-3">
            {/* Language toggle — desktop */}
            <button
              type="button"
              onClick={switchLocale}
              aria-label={`Switch to ${otherLocale === 'ar' ? 'Arabic' : 'English'}`}
              className={cn(
                'hidden h-8 items-center rounded-full border px-3 text-xs font-semibold lg:flex',
                'border-[var(--color-border)] text-[var(--color-text-2)]',
                'transition-colors duration-200',
                'hover:border-[var(--color-border-hover)] hover:text-[var(--color-accent)]',
              )}
            >
              {otherLocale === 'ar' ? 'عربي' : 'EN'}
            </button>

            {/* CTA — desktop */}
            <Link
              href="/contact"
              className={cn(
                'hidden h-9 items-center justify-center rounded-full px-5 text-sm font-semibold lg:flex',
                'bg-[var(--color-accent)] text-white',
                'transition-all duration-200 hover:bg-[var(--color-logo-mid)] active:scale-95',
              )}
            >
              {t('cta')}
            </Link>

            {/* Hamburger — mobile */}
            <button
              type="button"
              onClick={() => setIsMenuOpen((v) => !v)}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav"
              aria-label={isMenuOpen ? tCommon('closeMenu') : tCommon('openMenu')}
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-lg lg:hidden',
                'text-[var(--color-text-1)] transition-colors hover:bg-[var(--color-surface-2)]',
              )}
            >
              {isMenuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            </button>
          </div>
        </nav>
      </header>

      {/* ─── Mobile full-screen overlay ────────────────────────────────────── */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label={tCommon('menu')}
            className={cn(
              'fixed inset-0 z-30 flex flex-col overflow-y-auto',
              'bg-[var(--color-bg)] px-6 pb-10 pt-[76px] lg:hidden',
            )}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {/* Nav items */}
            <ul className="flex flex-col" role="list">
              {NAV_LINKS.map(({ key, href }, i) => (
                <motion.li
                  key={key}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 + i * 0.045, duration: 0.2 }}
                >
                  <Link
                    href={href}
                    onClick={() => setIsMenuOpen(false)}
                    aria-current={isActive(href) ? 'page' : undefined}
                    className={cn(
                      'flex items-center border-b border-[var(--color-border)] py-5',
                      'text-[2rem] font-semibold leading-none tracking-tight',
                      'transition-colors duration-150',
                      isActive(href)
                        ? 'text-[var(--color-text-1)]'
                        : 'text-[var(--color-text-2)] hover:text-[var(--color-text-1)]',
                    )}
                  >
                    {t(key as NavKey)}
                  </Link>
                </motion.li>
              ))}
            </ul>

            {/* Bottom row: locale switcher + CTA */}
            <motion.div
              className="mt-auto flex items-center justify-between pt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.32, duration: 0.2 }}
            >
              <button
                type="button"
                onClick={() => {
                  switchLocale();
                  setIsMenuOpen(false);
                }}
                aria-label={`Switch to ${otherLocale === 'ar' ? 'Arabic' : 'English'}`}
                className="min-h-[44px] px-2 text-sm font-semibold text-[var(--color-text-2)] hover:text-[var(--color-text-1)] transition-colors"
              >
                {otherLocale === 'ar' ? 'العربية' : 'English'}
              </button>

              <Link
                href="/contact"
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  'inline-flex h-12 items-center justify-center rounded-full px-8',
                  'bg-[var(--color-accent)] text-base font-semibold text-white',
                  'transition-colors hover:bg-[var(--color-logo-mid)]',
                )}
              >
                {t('cta')}
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
