import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  authorizationRulesConfig,
  type AuthorizationRuleConfig,
} from 'lib/mock/authorizationRulesConfig';

export interface AuthorizationRulesConfigState {
  items: AuthorizationRuleConfig[];
  loading: boolean;
  error: string | null;
}

const initialState: AuthorizationRulesConfigState = {
  items: [],
  loading: false,
  error: null,
};

// TODO: Replace mock source with real API call when available.
export const fetchAuthorizationRulesConfig = createAsyncThunk(
  'authorizationRulesConfig/fetchAuthorizationRulesConfig',
  async () => {
    return authorizationRulesConfig as AuthorizationRuleConfig[];
  },
);

const authorizationRulesConfigSlice = createSlice({
  name: 'authorizationRulesConfig',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuthorizationRulesConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAuthorizationRulesConfig.fulfilled,
        (state, action: PayloadAction<AuthorizationRuleConfig[]>) => {
          state.loading = false;
          state.items = action.payload;
        },
      )
      .addCase(fetchAuthorizationRulesConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load authorisation rules config';
      });
  },
});

export default authorizationRulesConfigSlice.reducer;
