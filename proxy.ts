import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['es', 'en'];
const defaultLocale = 'es';

const publicPaths = ['/login', '/register'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const locale = locales.find(
    (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`
  );

  const pathWithoutLocale = locale
    ? pathname.replace(`/${locale}`, '') || '/'
    : pathname;

  const isPublic = publicPaths.some(
    (p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(`${p}/`)
  );
  const isApi = pathname.startsWith('/api');
  const isStatic =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/manifest') ||
    pathname === '/sw.js' ||
    pathname.startsWith('/icons/') ||
    pathname.startsWith('/favicon');

  if (isStatic || isApi) return;

  if (!locale) {
    const acceptLanguage = request.headers.get('accept-language') || '';
    const detected = acceptLanguage.includes('en') ? 'en' : defaultLocale;
    const newUrl = request.nextUrl.clone();
    newUrl.pathname = `/${detected}${pathname}`;
    return NextResponse.redirect(newUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|static|favicon.ico|manifest|sw\\.js|icons|.*\\.png|.*\\.svg|api).*)',
  ],
};
