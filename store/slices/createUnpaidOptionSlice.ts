import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { post, get, del } from '../../lib/api/httpClient';
import { API_ROUTES } from '../../lib/utils/apiRoute';

// Unpaid Option Payload Type
export interface CreateUnpaidOptionPayload {
  action?: string;
  status?: string;
  versionNumber?: number;
  entityKey?: number;
  creationMethod?: string;
  unpaidOptionName?: string;
  postingOption?: string;
  postingAccount?: string;
  selectedNominatedAccount?: string;
  bicSwift?: string;
  bankName?: string;
  branchName?: string;
  branchCode?: string;
  accountNumber?: string;
  iban?: string;
  currency?: string;
  unpaidAmount?: string;
  accountType?: string;
  counterPartyAddress?: {
    addressLine1?: string;
    addressLine2?: string;
    addressLine3?: string;
    addressLine4?: string;
    addressLine5?: string;
    streetName?: string;
    buildingNumber?: string;
    postalCode?: string;
    townName?: string;
    countrySubDivision?: string;
    countryCode?: string;
    subUrb?: string;
    coreAddressTO?: string;
  };
  phoneNumber?: string;
  phoneUsage?: string[];
  email?: string;
  emailUsage?: string[];
  referenceNumber?: string;
  optionCode?: string;
  town?: string;
  bankCountryCode?: string;
  selectedBank?: string;
  transactionLimit?: number | string;
  transactionLimitCurrency?: string;
  [key: string]: any;
}

// Async thunk to create an unpaid option
export const createUnpaidOption = createAsyncThunk(
  'createUnpaidOption/createUnpaidOption',
  async (payload: CreateUnpaidOptionPayload, { rejectWithValue }) => {
    try {
      // Using beneficiary endpoint as temporary placeholder
      const response = await post(API_ROUTES.BENEFICIARIES, payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create an unpaid option');
    }
  }
);

// Fetch unpaid option by ID
export const fetchUnpaidOptionById = createAsyncThunk(
  'createUnpaidOption/fetchUnpaidOptionById',
  async (id: string, { rejectWithValue }) => {
    try {
      // Using debtor endpoint as temporary placeholder
      const response = await get<CreateUnpaidOptionPayload>(`/api/unpaid-options/${id}`);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch unpaid option');
    }
  }
);

// Delete unpaid option by ID
export const deleteManagedUnpaidOptionById = createAsyncThunk(
  'createUnpaidOption/deleteManagedUnpaidOptionById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await del<{ entityKey: number; status: string; message: string }>(`/api/unpaid-options/${id}`);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete unpaid option');
    }
  }
);

export interface CreateUnpaidOptionState {
  unpaidOption: CreateUnpaidOptionPayload;
  managedUnpaidOption: CreateUnpaidOptionPayload;
}

// Factory function to create initial state
const createInitialUnpaidOption = (): CreateUnpaidOptionPayload => ({
  action: '',
  status: '',
  versionNumber: 0,
  entityKey: 0,
  creationMethod: '',
  unpaidOptionName: '',
  postingOption: '',
  postingAccount: '',
  bicSwift: '',
  bankName: '',
  branchName: '',
  branchCode: '',
  accountNumber: '',
  iban: '',
  currency: '',
  unpaidAmount: '',
  accountType: '',
  counterPartyAddress: {
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    addressLine4: '',
    addressLine5: '',
    streetName: '',
    buildingNumber: '',
    postalCode: '',
    townName: '',
    countrySubDivision: '',
    countryCode: '',
    subUrb: '',
    coreAddressTO: '',
  },
  phoneNumber: '',
  phoneUsage: [],
  email: '',
  emailUsage: [],
  referenceNumber: '',
  optionCode: '',
  town: '',
  bankCountryCode: '',
  selectedBank: '',
  transactionLimit: '',
  transactionLimitCurrency: 'USD',
});

const initialState: CreateUnpaidOptionState = {
  unpaidOption: createInitialUnpaidOption(),
  managedUnpaidOption: createInitialUnpaidOption(),
};

const createUnpaidOptionSlice = createSlice({
  name: 'createUnpaidOption',
  initialState,
  reducers: {
    updateUnpaidOption: (state, action: PayloadAction<{ field: string; value: any }>) => {
      const { field, value } = action.payload;
      (state.unpaidOption as any)[field] = value;
    },
    updateUnpaidOptionObject: (
      state,
      action: PayloadAction<{ path: string[]; value: any }>
    ) => {
      const { path, value } = action.payload;
      let target: any = state.unpaidOption;
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if (!(key in target)) {
          target[key] = {};
        }
        target = target[key];
      }
      const finalKey = path[path.length - 1];
      target[finalKey] = value;
    },
    resetUnpaidOption: (state) => {
      state.unpaidOption = createInitialUnpaidOption();
    },
    updateManagedUnpaidOption: (state, action: PayloadAction<{ field: string; value: any }>) => {
      const { field, value } = action.payload;
      (state.managedUnpaidOption as any)[field] = value;
    },
    updateManagedUnpaidOptionObject: (
      state,
      action: PayloadAction<{ path: string[]; value: any }>
    ) => {
      const { path, value } = action.payload;
      let target: any = state.managedUnpaidOption;
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if (!(key in target)) {
          target[key] = {};
        }
        target = target[key];
      }
      const finalKey = path[path.length - 1];
      target[finalKey] = value;
    },
    resetManagedUnpaidOption: (state) => {
      state.managedUnpaidOption = createInitialUnpaidOption();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createUnpaidOption.fulfilled, (state, action) => {
        // Optionally update state with response
        console.log('Unpaid option created successfully:', action.payload);
      })
      .addCase(createUnpaidOption.rejected, (state, action) => {
        console.error('Failed to create an unpaid option:', action.payload);
      })
      .addCase(fetchUnpaidOptionById.fulfilled, (state, action) => {
        state.managedUnpaidOption = action.payload;
      })
      .addCase(fetchUnpaidOptionById.rejected, (state, action) => {
        console.error('Failed to fetch unpaid option:', action.payload);
      })
      .addCase(deleteManagedUnpaidOptionById.fulfilled, (state, action) => {
        console.log('Unpaid option deleted successfully:', action.payload);
      })
      .addCase(deleteManagedUnpaidOptionById.rejected, (state, action) => {
        console.error('Failed to delete unpaid option:', action.payload);
      });
  },
});

export const {
  updateUnpaidOption,
  updateUnpaidOptionObject,
  resetUnpaidOption,
  updateManagedUnpaidOption,
  updateManagedUnpaidOptionObject,
  resetManagedUnpaidOption,
} = createUnpaidOptionSlice.actions;

export default createUnpaidOptionSlice.reducer;
