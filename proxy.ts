import { NextResponse } from 'next/server';
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { SUPPORTED_LOCALES } from '@/lib/constants';

const locales = SUPPORTED_LOCALES as unknown as string[];
const defaultLocale = 'es';

function getLocale(request: Request): string {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    negotiatorHeaders[key] = value;
  });
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages();
  return match(languages, locales, defaultLocale);
}

export function proxy(request: Request) {
  const { pathname } = new URL(request.url);

  const pathnameHasLocale = locales.some(
    (locale) =>
      pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  const locale = getLocale(request);
  const newUrl = new URL(request.url);
  newUrl.pathname = `/${locale}${pathname}`;

  return NextResponse.redirect(newUrl);
}

export const config = {
  matcher: [
    '/((?!api|_next|static|favicon.ico|manifest|sw\\.js|icons|.*\\.png).*)',
  ],
};
