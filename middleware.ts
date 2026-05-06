import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
});

const SIGNIN_PATTERN = /\/[a-z]{2}\/signin($|\/)/;
const JSESSIONID = 'JSESSIONID';
const LTPA_TOKEN = 'LtpaToken2';

function isValidLocale(value: any): value is (typeof locales)[number] {
  return locales.includes(value);
}

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  if (SIGNIN_PATTERN.test(pathname)) {
    return intlMiddleware(request);
  }

  if (!request.cookies.has(JSESSIONID) || !request.cookies.has(LTPA_TOKEN)) {
    const localeSlice = pathname.slice(1, 3);
    const locale = isValidLocale(localeSlice) ? localeSlice : defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}/signin`, request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|bolapi|_next|_vercel|.*\\..*).*)']
};
