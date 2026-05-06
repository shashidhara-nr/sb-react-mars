import { LimitDetail } from '@lib/api/limitsApi';

/**
 * Redux state for limit details
 * Stores the currently selected/being-edited limit
 */
export interface LimitDetailsState {
  selectedLimit: LimitDetail | null;
  loading: boolean;
  error: string | null;
}

/**
 * Payload for setting limit details in Redux
 * Can be a full LimitDetail or partial data
 */
export type LimitDetailsPayload = Partial<LimitDetail>;
