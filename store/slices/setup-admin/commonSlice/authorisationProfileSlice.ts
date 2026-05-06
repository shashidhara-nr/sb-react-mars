import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getAuthorisationProfileList } from '@lib/api/transferTypesApi';
import { AuthorizationProfile } from 'types/api/transfer-types.res';

export interface AuthorisationProfileState {
  data: AuthorizationProfile[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthorisationProfileState = {
  data: [],
  isLoading: false,
  error: null,
};

export const fetchAuthorisationProfiles = createAsyncThunk<
  AuthorizationProfile[],
  void,
  { rejectValue: string }
>(
  'authorisationProfile/fetchAuthorisationProfiles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAuthorisationProfileList();
      return response.authProfileList;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unexpected error occurred while fetching authorisation profiles');
    }
  }
);

const authorisationProfileSlice = createSlice({
  name: 'authorisationProfile',
  initialState,
  reducers: {
    resetAuthorisationProfiles() {
      return initialState;
    },
    clearAuthorisationProfilesError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuthorisationProfiles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAuthorisationProfiles.fulfilled, (state, action: PayloadAction<AuthorizationProfile[]>) => {
        state.isLoading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchAuthorisationProfiles.rejected, (state, action) => {
        state.isLoading = false;
        state.data = [];
        state.error = action.payload ?? 'Failed to fetch authorisation profiles';
      });
  },
});

export const { resetAuthorisationProfiles, clearAuthorisationProfilesError } = authorisationProfileSlice.actions;

export default authorisationProfileSlice.reducer;
