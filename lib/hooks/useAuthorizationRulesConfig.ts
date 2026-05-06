import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './useAppDispatch';
import type { AppDispatch, RootState } from 'store';
import { fetchAuthorizationRulesConfig } from 'store/slices/authorizationRulesConfigSlice';
import type { AuthorizationRuleConfig } from 'lib/mock/authorizationRulesConfig';

export interface UseAuthorizationRulesConfigResult {
  items: AuthorizationRuleConfig[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export const useAuthorizationRulesConfig = (): UseAuthorizationRulesConfigResult => {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((state) => state.authorizationRulesConfig);

  useEffect(() => {
    dispatch(fetchAuthorizationRulesConfig());
  }, [dispatch]);

  const reload = () => {
    dispatch(fetchAuthorizationRulesConfig());
  };

  return { items, loading, error, reload };
};

export default useAuthorizationRulesConfig;
