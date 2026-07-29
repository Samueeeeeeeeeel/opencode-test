import { NextResponse } from 'next/server';
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { SUPPORTED_LOCALES } from '@/lib/constants';
import { auth } from '@/features/auth/auth';

const locales = SUPPORTED_LOCALES as unknown as string[];
const defaultLocale = 'es';

const publicPaths = ['/login', '/register'];

function getLocale(request: Request): string {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    negotiatorHeaders[key] = value;
  });
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages();
  return match(languages, locales, defaultLocale);
}

export async function proxy(request: Request) {
  const { pathname } = new URL(request.url);

  const locale = locales.find(
    (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`
  );

  const pathWithoutLocale = locale
    ? pathname.replace(`/${locale}`, '') || '/'
    : pathname;

  const isPublic = publicPaths.some(
    (p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(`${p}/`)
  );
  const isOnboarding = pathWithoutLocale === '/onboarding';
  const isApi = pathname.startsWith('/api');
  const isStatic =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/manifest') ||
    pathname === '/sw.js' ||
    pathname.startsWith('/icons/') ||
    pathname.startsWith('/favicon');

  if (isStatic || isApi) return;

  // Redirect to locale-prefixed path
  if (!locale) {
    const detectedLocale = getLocale(request);
    const newUrl = new URL(request.url);
    newUrl.pathname = `/${detectedLocale}${pathname}`;
    return NextResponse.redirect(newUrl);
  }

  // Auth protection
  if (!isPublic) {
    const session = await auth();
    if (!session?.user) {
      const loginUrl = new URL(request.url);
      loginUrl.pathname = `/${locale}/login`;
      return NextResponse.redirect(loginUrl);
    }
  }

  return;
}

export const config = {
  matcher: [
    '/((?!_next|static|favicon.ico|manifest|sw\\.js|icons|.*\\.png|.*\\.svg).*)',
  ],
};
