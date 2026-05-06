import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LimitDetail } from '@lib/api/limitsApi';
import type { LimitDetailsState } from 'types/limitDetails';

const initialState: LimitDetailsState = {
  selectedLimit: null,
  loading: false,
  error: null,
};

/**
 * Redux slice for managing limit details
 * Handles storing and updating the currently selected limit
 */
const limitDetailsSlice = createSlice({
  name: 'limitDetails',
  initialState,
  reducers: {
    /**
     * Set the currently selected limit
     * @param state - Redux state
     * @param action - Action with limit payload
     */
    setLimitDetails: (state, action: PayloadAction<Partial<LimitDetail> | null>) => {
      state.selectedLimit = (action.payload as any) || null;
      state.error = null;
    },

    /**
     * Update specific fields of the selected limit
     * @param state - Redux state
     * @param action - Action with partial limit data
     */
    updateLimitDetails: (state, action: PayloadAction<Partial<LimitDetail>>) => {
      if (state.selectedLimit) {
        state.selectedLimit = {
          ...state.selectedLimit,
          ...action.payload,
        };
      }
    },

    /**
     * Set loading state
     * @param state - Redux state
     * @param action - Action with boolean loading value
     */
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    /**
     * Set error message
     * @param state - Redux state
     * @param action - Action with error message
     */
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    /**
     * Clear all limit details
     * @param state - Redux state
     */
    clearLimitDetails: (state) => {
      state.selectedLimit = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setLimitDetails,
  updateLimitDetails,
  setLoading,
  setError,
  clearLimitDetails,
} = limitDetailsSlice.actions;

export default limitDetailsSlice.reducer;

