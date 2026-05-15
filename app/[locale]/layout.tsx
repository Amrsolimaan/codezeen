import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { instrumentSerif, inter, geistMono } from '@/lib/fonts';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { GlobalAnimations } from '@/components/layout/GlobalAnimations';
import { PageTransitionWrapper } from '@/components/layout/PageTransitionWrapper';
import '@/styles/globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: {
    default: 'Codezeen — Software Agency',
    template: '%s — Codezeen',
  },
  description:
    'We build fast, beautiful, and scalable software for forward-thinking businesses.',
  metadataBase: new URL(
    process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://codezeen.com',
  ),
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${instrumentSerif.variable} ${inter.variable} ${geistMono.variable}`}
    >
      <body suppressHydrationWarning className="flex min-h-screen flex-col antialiased">
        <NextIntlClientProvider messages={messages}>
          <GlobalAnimations />
          <Header />
          <main id="main-content" className="flex flex-1 flex-col">
            <PageTransitionWrapper>
              {children}
            </PageTransitionWrapper>
          </main>
          <Footer locale={locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
