import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { post, get, del } from '../../lib/api/httpClient';
import { API_ROUTES } from '../../lib/utils/apiRoute';
import { AllBillsApiResponse, BillRow } from '../../types/bills';
import { transformAllBillsToRows } from '../../lib/transformers/billsTransformers';

// Biller payload type
export interface BillerPayload {
  entityKey?: number;
  billerId?: string;
  billerName?: string;
  currency?: string;
  transactionLimit?: number | string;
  paymentTypes?: string[] | string;
  referenceFields?: Array<{ id: string; name: string; value: string; dynamicReference?: boolean }>;
  phoneNumber?: string;
  phoneUsage?: string[];
  phoneAlertEnabled?: boolean;
  emailAddress?: string;
  emailUsage?: string[];
  emailAlertEnabled?: boolean;
  status?: string;
  createdBy?: string;
  createdDateTime?: string;
  lastModifiedBy?: string;
  lastModifiedDateTime?: string;
}

// Create biller API call
export const createBiller = createAsyncThunk(
  'createBiller/createBiller',
  async (payload: BillerPayload, { rejectWithValue }) => {
    try {
      const response = await post(API_ROUTES.CREATE_BILLER, payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create biller');
    }
  }
);

// Fetch biller by ID
export const fetchBillerById = createAsyncThunk(
  'createBiller/fetchBillerById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await get<BillerPayload>(`${API_ROUTES.BILLER_BY_ID(id)}`);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch biller');
    }
  }
);

// Delete biller by ID
export const deleteManagedBillerById = createAsyncThunk(
  'createBiller/deleteManagedBillerById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await del<{ entityKey: number; status: string; message: string }>(`${API_ROUTES.BILLER_BY_ID(id)}`);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete biller');
    }
  }
);

// Fetch all bills
export const fetchAllBills = createAsyncThunk(
  'createBiller/fetchAllBills',
  async (_, { rejectWithValue }) => {
    try {
      const response = await get<AllBillsApiResponse>(API_ROUTES.ALL_BILLS);
      
      if (response.statusCode === 0 && response.myBillsList) {
        const transformedBills = transformAllBillsToRows(response.myBillsList);
        return transformedBills;
      }
      
      return [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch bills');
    }
  }
);

export interface CreateBillerState {
  biller: BillerPayload;
  managedBiller: BillerPayload;
  allBills: BillRow[];
  loading: boolean;
  error: string | null;
}

// Factory to create initial biller object
const createInitialBiller = (): BillerPayload => ({
  entityKey: 0,
  billerId: '',
  billerName: '',
  currency: 'ZAR',
  transactionLimit: '0.00',
  paymentTypes: [],
  referenceFields: [],
  phoneNumber: '',
  phoneUsage: [],
  phoneAlertEnabled: false,
  emailAddress: '',
  emailUsage: [],
  emailAlertEnabled: false,
  status: '',
  createdBy: '',
  createdDateTime: '',
  lastModifiedBy: '',
  lastModifiedDateTime: '',
});

const initialState: CreateBillerState = {
  biller: createInitialBiller(),
  managedBiller: createInitialBiller(),
  allBills: [],
  loading: false,
  error: null,
};

const createBillerSlice = createSlice({
  name: 'createBiller',
  initialState,
  reducers: {
    updateBiller(state, action: PayloadAction<{ field: string; value: any }>) {
      if (!state.biller) {
        state.biller = createInitialBiller();
      }
      (state.biller as any)[action.payload.field] = action.payload.value;
    },
    updateBillerObject(state, action: PayloadAction<{ path: string[]; value: any }>) {
      if (!state.biller) {
        state.biller = createInitialBiller();
      }
      let obj: any = state.biller;
      const path = action.payload.path || [];
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if (obj[key] === undefined || obj[key] === null) {
          obj[key] = {};
        }
        obj = obj[key];
      }
      obj[path[path.length - 1]] = action.payload.value;
    },
    updateManagedBiller(state, action: PayloadAction<{ field: string; value: any }>) {
      if (!state.managedBiller) {
        state.managedBiller = createInitialBiller();
      }
      (state.managedBiller as any)[action.payload.field] = action.payload.value;
    },
    updateManagedBillerObject(state, action: PayloadAction<{ path: string[]; value: any }>) {
      if (!state.managedBiller) {
        state.managedBiller = createInitialBiller();
      }
      let obj: any = state.managedBiller;
      const path = action.payload.path || [];
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if (obj[key] === undefined || obj[key] === null) {
          obj[key] = {};
        }
        obj = obj[key];
      }
      obj[path[path.length - 1]] = action.payload.value;
    },
    resetBiller(state) {
      state.biller = createInitialBiller();
      state.error = null;
    },
    resetManagedBiller(state) {
      state.managedBiller = createInitialBiller();
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBiller.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBiller.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(createBiller.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchBillerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBillerById.fulfilled, (state, action: PayloadAction<BillerPayload>) => {
        state.loading = false;
        state.managedBiller = action.payload || createInitialBiller();
        state.error = null;
      })
      .addCase(fetchBillerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteManagedBillerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteManagedBillerById.fulfilled, (state, action: PayloadAction<{ entityKey: number; status: string; message: string }>) => {
        state.loading = false;
        state.managedBiller = createInitialBiller();
        state.error = null;
      })
      .addCase(deleteManagedBillerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAllBills.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllBills.fulfilled, (state, action: PayloadAction<BillRow[]>) => {
        state.loading = false;
        state.allBills = action.payload;
        state.error = null;
      })
      .addCase(fetchAllBills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  updateBiller, 
  updateBillerObject, 
  resetBiller, 
  updateManagedBiller, 
  updateManagedBillerObject, 
  resetManagedBiller 
} = createBillerSlice.actions;

export default createBillerSlice.reducer;
