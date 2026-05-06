import { locales, defaultLocale } from '../../i18n';

export function getLocaleFromPathname(pathname?: string | null): string {
  const path = pathname || (typeof window !== 'undefined' ? window.location.pathname : '');
  const segments = path.split('/').filter(Boolean);
  const locale = segments[0];
  
  return locale && locales.includes(locale as any) ? locale : defaultLocale;
}

export function getSigninUrl(pathname?: string | null, queryParams?: Record<string, string>): string {
  const locale = getLocaleFromPathname(pathname);
  const query = queryParams ? `?${new URLSearchParams(queryParams).toString()}` : '';
  return `/${locale}/signin${query}`;
}

export function getSigninSubpathUrl(pathname?: string | null, subpath?: string): string {
  const locale = getLocaleFromPathname(pathname);
  return subpath ? `/${locale}/signin/${subpath}` : `/${locale}/signin`;
}
