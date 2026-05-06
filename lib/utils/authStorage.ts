/**
 * Centralized auth storage management
 * Single source of truth for auth persistence
 */

export interface StoredAuthState {
  loggedIn: boolean;
  digitalKey: string | null;
  userList: any[];
}

const AUTH_STORAGE_KEY = 'auth_state';

export const authStorage = {
  /**
   * Save auth state to localStorage
   */
  save: (state: StoredAuthState): void => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
      }
    } catch (error) {
      console.error('Failed to save auth state:', error);
    }
  },

  /**
   * Retrieve auth state from localStorage
   */
  get: (): StoredAuthState | null => {
    try {
      if (typeof localStorage === 'undefined') return null;
      
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to retrieve auth state:', error);
      return null;
    }
  },

  /**
   * Clear auth state from localStorage
   */
  clear: (): void => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Failed to clear auth state:', error);
    }
  },
};
