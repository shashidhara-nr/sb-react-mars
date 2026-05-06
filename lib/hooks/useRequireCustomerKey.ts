import { useSelector } from 'react-redux';
import type { RootState } from '@store/index';

const DEFAULT_CUSTOMER_KEY = 373731;

/**
 * Custom hook to get the customer key from Redux auth state
 * Falls back to DEFAULT_CUSTOMER_KEY (373731) if not available
 * 
 * @returns Customer key from Redux or default value
 * 
 * @example
 * const customerKey = useRequireCustomerKey();
 */
export const useRequireCustomerKey = (): number | string => {
  const selectedCustomerKeyFromRedux = useSelector((state: RootState) => state.auth?.selectedCustomerKey);
  return selectedCustomerKeyFromRedux || DEFAULT_CUSTOMER_KEY;
};
