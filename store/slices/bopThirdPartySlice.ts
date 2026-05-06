import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { BopThirdPartyPayload } from '../../types/setup-and-admin/bopThirdParty';
import { post, get, del } from '../../lib/api/httpClient';
import { API_ROUTES } from '../../lib/utils/apiRoute';
import { 
  mockIndividualBopThirdParty, 
  mockEntityBopThirdParty, 
  mockCompanyBopThirdParty 
} from '../../lib/mock/mockBopThirdParties';

// Create BOP third party
export const createBopThirdParty = createAsyncThunk(
  'bopThirdParty/create',
  async (payload: BopThirdPartyPayload, { rejectWithValue }) => {
    try {
      const response = await post(API_ROUTES.CREATE_BOP_THIRD_PARTY, payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create BOP third party');
    }
  }
);

// Fetch BOP third party by ID
export const fetchBopThirdPartyById = createAsyncThunk(
  'bopThirdParty/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const mockDataMap: Record<string, any> = {
        '1': mockIndividualBopThirdParty,
        '2': mockEntityBopThirdParty,
        '3': mockCompanyBopThirdParty,
      };
      
      const mockData = mockDataMap[id] || mockIndividualBopThirdParty;
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return mockData as BopThirdPartyPayload;
      
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch BOP third party');
    }
  }
);

// Update BOP third party by ID
export const updateBopThirdPartyById = createAsyncThunk(
  'bopThirdParty/updateById',
  async ({ id, payload }: { id: string; payload: BopThirdPartyPayload }, { rejectWithValue }) => {
    try {
      const response = await post(API_ROUTES.BOP_THIRD_PARTY_BY_ID(id), payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update BOP third party');
    }
  }
);

// Delete BOP third party by ID
export const deleteBopThirdPartyById = createAsyncThunk(
  'bopThirdParty/deleteById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await del<{ entityKey: number; status: string; message: string }>(
        API_ROUTES.BOP_THIRD_PARTY_BY_ID(id)
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete BOP third party');
    }
  }
);

export interface BopThirdPartyState {
  bopThirdParty: BopThirdPartyPayload;
  managedBopThirdParty: BopThirdPartyPayload;
  isLoading: boolean;
  error: string | null;
}

// Factory function to create a fresh BOP third party object
const createInitialBopThirdParty = (): BopThirdPartyPayload => ({
  entityKey: 0,
  action: '',
  status: '',
  versionNumber: 0,
  entityType: 'individual',
  
  // Personal/Individual fields
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: '',
  idNumber: '',
  idType: '',
  
  // Entity fields
  entityName: '',
  companyCategory: '',
  
  // Common identification
  taxpayerReference: '',
  vatReference: '',
  customsClientNo: '',
  ccn: '',
  thirdPartyCode: '',
  
  // Address
  address: {
    addressLine1: '',
    addressLine2: '',
    townName: '',
    region: '',
    countryCode: '',
  },
  
  // Postal address
  hasPostalAddress: false,
  postalAddress: {
    addressLine1: '',
    addressLine2: '',
    townName: '',
    region: '',
    countryCode: '',
  },
  
  // Contact information
  phone: {
    firstName: '',
    lastName: '',
    mobilePhoneNumber: '',
    mobilePhoneUsage: [],
    alternatePhoneNumber: '',
    alternatePhoneUsage: [],
  },
  contact: {
    email: '',
    emailUsage: [],
    contactName: '',
    jobTitle: '',
    workPhoneNumber: '',
    workPhoneUsage: [],
  },
  
  // Status and metadata
  entityCategory: '',
  countryRegion: '',
  authoriseStatus: '',
  createdBy: '',
  createdDateTime: '',
  lastAuthorisedBy: '',
  lastAuthorisedDateTime: '',
  whenModified: 0,
  
  // Permissions
  canAuthorise: true,
  hasDAPPermission: true,
  declineReason: '',
  deleteInd: '',
  originatingChannel: '',
  
  // Customer association
  customerKey: 0,
  customerId: '',
  customerName: '',
  customerStatus: '',
  customerCountry: '',
});

const initialState: BopThirdPartyState = {
  bopThirdParty: createInitialBopThirdParty(),
  managedBopThirdParty: createInitialBopThirdParty(),
  isLoading: false,
  error: null,
};

const bopThirdPartySlice = createSlice({
  name: 'bopThirdParty',
  initialState,
  reducers: {
    // Update fields in the main bopThirdParty object
    updateBopThirdParty(state, action: PayloadAction<{ field: string; value: any }>) {
      if (!state.bopThirdParty) {
        state.bopThirdParty = createInitialBopThirdParty();
      }
      (state.bopThirdParty as any)[action.payload.field] = action.payload.value;
    },
    
    // Update nested objects in bopThirdParty
    updateBopThirdPartyObject(state, action: PayloadAction<{ path: string[]; value: any }>) {
      if (!state.bopThirdParty) {
        state.bopThirdParty = createInitialBopThirdParty();
      }
      let obj: any = state.bopThirdParty;
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
    
    // Update fields in the managed bopThirdParty object
    updateManagedBopThirdParty(state, action: PayloadAction<{ field: string; value: any }>) {
      if (!state.managedBopThirdParty) {
        state.managedBopThirdParty = createInitialBopThirdParty();
      }
      (state.managedBopThirdParty as any)[action.payload.field] = action.payload.value;
    },
    
    // Update nested objects in managedBopThirdParty
    updateManagedBopThirdPartyObject(state, action: PayloadAction<{ path: string[]; value: any }>) {
      if (!state.managedBopThirdParty) {
        state.managedBopThirdParty = createInitialBopThirdParty();
      }
      let obj: any = state.managedBopThirdParty;
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
    
    // Reset bopThirdParty to initial state
    resetBopThirdParty(state) {
      state.bopThirdParty = createInitialBopThirdParty();
      state.error = null;
    },
    
    // Reset managedBopThirdParty to initial state
    resetManagedBopThirdParty(state) {
      state.managedBopThirdParty = createInitialBopThirdParty();
      state.error = null;
    },
    
    // Clear all errors
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create BOP third party
      .addCase(createBopThirdParty.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBopThirdParty.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        // Optionally update state with response data
      })
      .addCase(createBopThirdParty.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to create BOP third party';
      })
      
      // Fetch BOP third party by ID
      .addCase(fetchBopThirdPartyById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBopThirdPartyById.fulfilled, (state, action: PayloadAction<BopThirdPartyPayload>) => {
        state.isLoading = false;
        state.managedBopThirdParty = action.payload || createInitialBopThirdParty();
        state.error = null;
      })
      .addCase(fetchBopThirdPartyById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to fetch BOP third party';
      })
      
      // Update BOP third party by ID
      .addCase(updateBopThirdPartyById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBopThirdPartyById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        // Optionally update managedBopThirdParty with response
      })
      .addCase(updateBopThirdPartyById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to update BOP third party';
      })
      
      // Delete BOP third party by ID
      .addCase(deleteBopThirdPartyById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteBopThirdPartyById.fulfilled, (state, action: PayloadAction<{ entityKey: number; status: string; message: string }>) => {
        state.isLoading = false;
        state.managedBopThirdParty = createInitialBopThirdParty();
        state.error = null;
      })
      .addCase(deleteBopThirdPartyById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to delete BOP third party';
      });
  },
});

export const {
  updateBopThirdParty,
  updateBopThirdPartyObject,
  updateManagedBopThirdParty,
  updateManagedBopThirdPartyObject,
  resetBopThirdParty,
  resetManagedBopThirdParty,
  clearError,
} = bopThirdPartySlice.actions;

export default bopThirdPartySlice.reducer;
