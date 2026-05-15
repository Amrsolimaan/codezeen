import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

/**
 * Validates HTTP Basic Auth credentials against env vars STUDIO_USERNAME / STUDIO_PASSWORD.
 * Returns false if either env var is unset (fails closed).
 */
function checkBasicAuth(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Basic ')) return false;

  const credentials = atob(authHeader.slice(6));
  const colonIndex = credentials.indexOf(':');
  if (colonIndex === -1) return false;

  const username = credentials.slice(0, colonIndex);
  const password = credentials.slice(colonIndex + 1);

  const expectedUser = process.env['STUDIO_USERNAME'];
  const expectedPass = process.env['STUDIO_PASSWORD'];

  return Boolean(expectedUser && expectedPass && username === expectedUser && password === expectedPass);
}

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === '/studio' || pathname.startsWith('/studio/')) {
    if (process.env['NODE_ENV'] === 'production' && !checkBasicAuth(req)) {
      return new NextResponse('Studio access requires authentication.', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Codezeen Studio"' },
      });
    }
    return NextResponse.next();
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: [
    // Locale routing: all paths except _next, _vercel, api, and static files (contain a dot)
    '/((?!_next|_vercel|api|.*\\..*).*)',
    // Studio paths (including sub-routes with dots in filenames)
    '/studio/:path*',
  ],
};
