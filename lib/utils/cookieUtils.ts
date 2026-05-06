import Cookies from 'js-cookie';

export const clearSessionCookies = (): void => {
  Cookies.remove('JSESSIONID');
  Cookies.remove('LtpaToken2');
  const allCookies = Cookies.get();
  Object.keys(allCookies || {}).forEach(cookieName => {
    if (cookieName.startsWith('dtCookie') || cookieName.includes('_srv_')) {
      Cookies.remove(cookieName);
    }
  });
};
