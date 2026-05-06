import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { post, get, del } from '../../lib/api/httpClient';
import { API_ROUTES } from '../../lib/utils/apiRoute';

// Transactional Authorisation Profile Payload Type
export interface CreateTransactionalAuthorisationProfilePayload {
  action?: string;
  status?: string;
  versionNumber?: number;
  entityKey?: number;
  profileName?: string;
  profileReference?: string;
  profileCode?: string;
  transactionType?: string;
  approvalLimit?: number | string;
  approvalLimitCurrency?: string;
  approvers?: string;
  description?: string;
  requiredSignatures?: number;
  approvalLevels?: number;
  autoApprove?: boolean;
  notificationSettings?: {
    emailNotification?: boolean;
    smsNotification?: boolean;
  };
  [key: string]: any;
}

// Async thunk to create a transactional authorisation profile
export const createTransactionalAuthorisationProfile = createAsyncThunk(
  'createTransactionalAuthorisationProfile/createTransactionalAuthorisationProfile',
  async (
    payload: CreateTransactionalAuthorisationProfilePayload,
    { rejectWithValue },
  ): Promise<CreateTransactionalAuthorisationProfilePayload | ReturnType<typeof rejectWithValue>> => {
    try {
      // Using beneficiary endpoint as temporary placeholder
      const response = await post<CreateTransactionalAuthorisationProfilePayload>(
        API_ROUTES.BENEFICIARIES,
        payload,
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Failed to create transactional authorisation profile',
      );
    }
  },
);

// Fetch transactional authorisation profile by ID
export const fetchTransactionalAuthorisationProfileById = createAsyncThunk(
  'createTransactionalAuthorisationProfile/fetchTransactionalAuthorisationProfileById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await get<CreateTransactionalAuthorisationProfilePayload>(
        `/api/transactional-authorisation-profiles/${id}`,
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Failed to fetch transactional authorisation profile',
      );
    }
  },
);

// Delete transactional authorisation profile by ID
export const deleteManagedTransactionalAuthorisationProfileById = createAsyncThunk(
  'createTransactionalAuthorisationProfile/deleteManagedTransactionalAuthorisationProfileById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await del<{ entityKey: number; status: string; message: string }>(
        `/api/transactional-authorisation-profiles/${id}`,
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Failed to delete transactional authorisation profile',
      );
    }
  },
);

export interface CreateTransactionalAuthorisationProfileState {
  profile: CreateTransactionalAuthorisationProfilePayload;
  managedProfile: CreateTransactionalAuthorisationProfilePayload;
  loading: boolean;
  error: string | null;
  success: boolean;
}

// Factory function to create initial state
const createInitialState = (): CreateTransactionalAuthorisationProfileState => ({
  profile: {},
  managedProfile: {},
  loading: false,
  error: null,
  success: false,
});

const createTransactionalAuthorisationProfileSlice = createSlice({
  name: 'createTransactionalAuthorisationProfile',
  initialState: createInitialState(),
  reducers: {
    updateProfile: (state, action: PayloadAction<{ field: string; value: any }>) => {
      const { field, value } = action.payload;
      state.profile[field] = value;
    },
    updateProfileObject: (state, action: PayloadAction<{ path: string[]; value: any }>) => {
      const { path, value } = action.payload;
      let target: any = state.profile;
      for (let i = 0; i < path.length - 1; i++) {
        if (!target[path[i]]) {
          target[path[i]] = {};
        }
        target = target[path[i]];
      }
      target[path[path.length - 1]] = value;
    },
    resetProfile: (state) => {
      state.profile = {};
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    updateManagedProfile: (state, action: PayloadAction<{ field: string; value: any }>) => {
      const { field, value } = action.payload;
      state.managedProfile[field] = value;
    },
    updateManagedProfileObject: (state, action: PayloadAction<{ path: string[]; value: any }>) => {
      const { path, value } = action.payload;
      let target: any = state.managedProfile;
      for (let i = 0; i < path.length - 1; i++) {
        if (!target[path[i]]) {
          target[path[i]] = {};
        }
        target = target[path[i]];
      }
      target[path[path.length - 1]] = value;
    },
    resetManagedProfile: (state) => {
      state.managedProfile = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Create profile
      .addCase(createTransactionalAuthorisationProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createTransactionalAuthorisationProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.profile = action.payload;
      })
      .addCase(createTransactionalAuthorisationProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      })
      // Fetch profile by ID
      .addCase(fetchTransactionalAuthorisationProfileById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactionalAuthorisationProfileById.fulfilled, (state, action) => {
        state.loading = false;
        state.managedProfile = action.payload;
      })
      .addCase(fetchTransactionalAuthorisationProfileById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete profile by ID
      .addCase(deleteManagedTransactionalAuthorisationProfileById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteManagedTransactionalAuthorisationProfileById.fulfilled, (state) => {
        state.loading = false;
        state.managedProfile = {};
      })
      .addCase(deleteManagedTransactionalAuthorisationProfileById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  updateProfile,
  updateProfileObject,
  resetProfile,
  updateManagedProfile,
  updateManagedProfileObject,
  resetManagedProfile,
} = createTransactionalAuthorisationProfileSlice.actions;

export default createTransactionalAuthorisationProfileSlice.reducer;
