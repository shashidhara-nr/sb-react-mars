import React, { useCallback } from 'react';
import { API_ROUTES } from '../utils/apiRoute';
import { clearSessionCookies } from '../utils/cookieUtils';

interface SessionTimeoutHookResult {
  extendSession: () => Promise<void>;
  performLogout: () => Promise<void>;
  isLoading: boolean;
}

export const useSessionTimeout = (): SessionTimeoutHookResult => {
  const [isLoading, setIsLoading] = React.useState(false);

  const extendSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(API_ROUTES.PING, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return;
      }
    } catch (error) {
      return;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const performLogout = useCallback(async () => {
    try {
      setIsLoading(true);

      await fetch(API_ROUTES.LOGOUT, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch(() => {
        // Continue with local cleanup
      });

      clearSessionCookies();

      window.location.href = '/signin';
    } catch (error) {
      // Handle error silently
      clearSessionCookies();
      window.location.href = '/signin';
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    extendSession,
    performLogout,
    isLoading,
  };
};

export default useSessionTimeout;
