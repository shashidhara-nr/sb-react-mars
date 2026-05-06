/**
 * Hook to restore auth state from localStorage on app startup
 * Should be used in a top-level component wrapped with useEffect
 */
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { authStorage } from '../utils/authStorage';
import { RootState, AppDispatch } from '../../store';

export function useAuthRestore() {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Only restore if not already logged in
    if (!auth.loggedIn) {
      const storedAuth = authStorage.get();
      if (storedAuth?.loggedIn && storedAuth?.digitalKey) {
        // Directly update Redux state with stored auth
        // In a production app, you might want to verify the session is still valid
        dispatch({
          type: 'auth/restoreFromStorage',
          payload: storedAuth,
        });
      }
    }
  }, [dispatch, auth.loggedIn]);
}
