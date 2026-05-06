import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { CreateBeneficiaryPayload } from '../../types/beneficiary';
import { RootState } from '../index';
import { get, post } from '../../lib/api/httpClient';
import { API_ROUTES } from '../../lib/utils/apiRoute';
import { getBeneficiaryAccountTypes, getCountries, getPaymentTypes, getCurrencies } from '../../lib/api/beneficiaryApi';

// Types for Bank Lookup
export interface BankLookupParams {
  bankName?: string; // partial match
  bic?: string; // bic/swift code
  branchName?: string;
  city?: string;
  countryCode?: string; // ISO country code
}

export interface BankLookupItem {
  bankName?: string;
  bic?: string;
  branchName?: string;
  branchCode?: string;
  city?: string;
  countryCode?: string;
  bankKey?: number;
  [key: string]: any;
}

// Types for Company Lookup
export interface CompanyLookupParams {
  cdiName: string; // company name (mandatory for API, can be empty string)
  cdiNumber?: string; // biller ID / CDI number (optional)
  cdiCountryCode: string; // ISO country code (mandatory)
}

export interface CompanyLookupItem {
  entityKey?: number;
  cdiNumber?: string;
  billerName?: string;
  billerCountryCode?: string;
  billerCurrency?: string;
  billerBranchSortCode?: string;
  billerAccNumber?: string;
  billerAddressLine1?: string;
  billerAddressLine2?: string;
  billerPostalCode?: string;
  billerSubUrb?: string;
  billerAccountType?: string;
  billerCity?: string;
  billerStateProvince?: string;
  billerBankCountry?: string;
  billerBranchName?: string;
  billerBankName?: string;
  companyRegistrationNumber?: string;
  billerId?: number;
  [key: string]: any;
}
// Async thunk to create a beneficiary
export const createBeneficiary = createAsyncThunk(
  'createBeneficiary/createBeneficiary',
  async (payload: any, { rejectWithValue }) => {
    try {
      const response = await post(API_ROUTES.BENEFICIARIES, payload);
      return response;
    } catch (error: any) {
      // Return the full error response data (which contains the issues array)
      return rejectWithValue(error?.response?.data || { message: error?.message || 'Failed to create beneficiary' });
    }
  },
);

// Async thunk to fetch country list and store codes in beneficiary.counterPartyAddress.countryCode
export const fetchCountryOptions = createAsyncThunk(
  'createBeneficiary/fetchCountryOptions',
  async (_, { rejectWithValue, getState }) => {
    try {
      // If already loaded, return cached options and skip network
      const state = getState() as RootState;
      const existing = state.createBeneficiary.countries;
      if (Array.isArray(existing) && existing.length > 0) {
        return existing as Array<{ label: string; value: string }>;
      }
      // Use the dedicated API function
      const resp: any = await getCountries();
      // Normalize shape and return array of {label, value}
      const list: Array<{
        label?: string;
        countryName?: string;
        name?: string;
        code?: string;
        countryCode?: string;
        value?: string;
      }> = Array.isArray(resp) ? resp : Array.isArray(resp?.countries) ? resp.countries : [];
      const options = list
        .map((c: any) => ({
          label: c.name || c.countryName || c.label || c.code || c.countryCode || c.value,
          value: c.code || c.countryCode || c.value || c.name || c.countryName,
        }))
        .filter(
          (o: any) =>
            typeof o.label === 'string' &&
            o.label.length > 0 &&
            typeof o.value === 'string' &&
            o.value.length > 0,
        )
      return options as Array<{ label: string; value: string }>;
    } catch (error: any) {
      // Fallback to a minimal set of options
      return [
        { label: 'South Africa', value: 'ZA' },
        { label: 'United States', value: 'US' },
        { label: 'United Kingdom', value: 'UK' },
      ];
    }
  },
);

export const fetchAccountTypeOptions = createAsyncThunk<any, { bic: string }>(
  'createBeneficiary/fetchBeneficiaryAccountTypeOptions', 
  async (params, { rejectWithValue, getState }) => {
    try{
      const state = getState() as RootState;
      
      const resp: any = await getBeneficiaryAccountTypes({swiftBICCode: params.bic});
      const list: Array<{ accountTypeCode?: string; accountTypeDescription?: string; style?: string; capabilityGroupType?: string; bankgroupID?: string; realTimeErrorCode?: string; accountStatus?: string; currencyFromAMS?: string; accountCapabilityGroupKey?: string; onusAccount?: string; bicCode?: string; validOffusAccount?: string;  }> =
        Array.isArray(resp)
          ? resp
          : Array.isArray(resp?.accountTypes)
          ? resp.accountTypes
          : [];
      const options = list.map((a: any) => {
        return {
          label: a.accountTypeDescription || '',
          value: a.accountTypeDescription || '',
        }
      }).filter((o: any) => typeof o.label === 'string' && o.label.length > 0 && typeof o.value === 'string' && o.value.length > 0);
      return options as Array<{ label: string; value: string }>;
    } catch (error: any) {
      // Fallback to a minimal set of options
      return [
        { label: 'Current', value: 'Current' },
        { label: 'Savings', value: 'Saving' },
      ];
    }
  }
);

export const fetchVerifiedAccounts = createAsyncThunk('createBeneficiary/fetchVerifiedAccounts', async (_, { rejectWithValue, getState }) => {
  try {
    const { getBatchDetailsAVS } = await import('../../lib/api/beneficiaryApi');
    return getBatchDetailsAVS({validResponseOnly: true});
  } catch (error: any) {   return rejectWithValue(error.message || 'Failed to fetch verified accounts');
  }
});

// Async thunk to fetch payment types and store in beneficiary state
export const fetchPaymentTypeOptions = createAsyncThunk(
  'createBeneficiary/fetchPaymentTypeOptions',
  async (_, { rejectWithValue, getState }) => {
    try {
      const resp: any = await getPaymentTypes();
      return Array.isArray(resp)
        ? resp
        : Array.isArray(resp?.paymentProfiles)
          ? resp.paymentProfiles
          : [];
    } catch (error: any) {
      return [
        { label: 'Domestic', value: 'DOMESTIC' },
        { label: 'International', value: 'INTERNATIONAL' },
      ];
    }
  },
);

export const fetchPaymentProfilesForFileUpload = createAsyncThunk(
  'createBeneficiary/fetchPaymentProfilesForFileUpload',
  async (_, { rejectWithValue }) => {
    try {

      const resp: any = await getPaymentTypes();
      return Array.isArray(resp)
        ? resp
        : Array.isArray(resp?.paymentProfiles)
          ? resp.paymentProfiles
          : [];
    } catch (error: any) {
      return [];
    }
  },
);

export const fetchCurrencyOptions = createAsyncThunk(
  'createBeneficiary/fetchCurrencyOptions',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const existing = state.createBeneficiary.currencies;
      if (Array.isArray(existing) && existing.length > 0) {
        return [...existing].sort((a, b) => a.label.localeCompare(b.label));
      }
      const resp: any = await getCurrencies();

      // Normalize shape and return array of {label, value}
      const list: Array<{
        label?: string;
        name?: string;
        code?: string;
        value?: string;
        currency?: string;
        currencyCode?: string;
        description?: string;
        currencyName?: string;
      }> = Array.isArray(resp)
        ? resp
        : Array.isArray(resp?.referenceCurrencies?.currencies)
          ? resp?.referenceCurrencies?.currencies
          : [];
      const options = list
        .map((c: any) => ({
          label: c.currencyCode ||
            c.code ||
            c.currency ||
            c.value ||
            c.name ||
            c.label,
          value: c.code || c.currencyCode || c.currency || c.value || c.name,
        }))
        .filter(
          (o: any) =>
            typeof o.label === 'string' &&
            o.label.length > 0 &&
            typeof o.value === 'string' &&
            o.value.length > 0,
        )
        .sort((a, b) => a.label.localeCompare(b.label));
      return options as Array<{ label: string; value: string }>;
    } catch (error: any) {
      // Fallback to a minimal set of options
      return [
        { label: 'USD - US Dollar', value: 'USD' },
        { label: 'EUR - Euro', value: 'EUR' },
        { label: 'GBP - British Pounds', value: 'GBP' },
        { label: 'JPY - Japanese Yen', value: 'JPY' },
        { label: 'AUD - Australian Dollar', value: 'AUD' },
      ];
    }
  },
);

// Async thunk to lookup banks (used by Lookup button across the app)
export const lookupBank = createAsyncThunk<
  BankLookupItem[],
  BankLookupParams,
  { rejectValue: string }
>('createBeneficiary/lookupBank', async (params: BankLookupParams, { rejectWithValue }) => {
  try {
    const payload = Object.fromEntries(
      Object.entries(params || {}).filter(
        ([, v]) => v !== undefined && v !== null && String(v).trim().length > 0,
      ),
    );

    const resp: any = await get(API_ROUTES.BANK_LOOKUP, { params: payload });

    // Normalize lists from potential shapes
    const list: BankLookupItem[] = Array.isArray(resp.bbranchCodeRanges)
      ? resp.bbranchCodeRanges
      : Array.isArray(resp?.banks)
        ? resp.banks
        : Array.isArray(resp?.items)
          ? resp.items
          : [];

    if (!Array.isArray(list) || list.length === 0) {
      // Return empty to allow UI to show an InfoBlock
      return [];
    }

    return list;
  } catch (error: any) {
    return rejectWithValue(error?.message || 'Failed to lookup bank list');
  }
});

// Async thunk to lookup companies (used by Company Lookup button)
export const lookupCompany = createAsyncThunk<
  CompanyLookupItem[],
  CompanyLookupParams,
  { rejectValue: string }
>('createBeneficiary/lookupCompany', async (params: CompanyLookupParams, { rejectWithValue }) => {
  try {
    // cdiName is mandatory for API, always include it (even if empty)
    const payload: any = {
      cdiName: params.cdiName || '',
      cdiCountryCode: params.cdiCountryCode || '',
    };
    
    // Add cdiNumber only if provided
    if (params.cdiNumber && String(params.cdiNumber).trim().length > 0) {
      payload.cdiNumber = params.cdiNumber;
    }

    const resp: any = await get(API_ROUTES.BENEFICIARIES_BILLERS, { params: payload });

    // Normalize response - expecting billerList array
    const list: CompanyLookupItem[] = Array.isArray(resp.billerList)
      ? resp.billerList
      : [];

    if (!Array.isArray(list) || list.length === 0) {
      // Return empty to allow UI to show an InfoBlock
      return [];
    }

    return list;
  } catch (error: any) {
    return rejectWithValue(error?.message || 'Failed to lookup company list');
  }
});

export interface PaymentProfile {
  customerPaymentProfileName: string;
  entityKey: number;
  manualEntryServiceName: string;
  payAlertsEnabled: boolean;
  active: boolean;
  hidebeneficiaryenabled: boolean;
  description?: string;
  name?: string;
  label?: string;
  code?: string;
  paymentProfileID?: string | number;
  value?: string;
}

export interface CreateBeneficiaryState {
  beneficiary: CreateBeneficiaryPayload;
  countries: Array<{ label: string; value: string }>;
  accountTypes: Array<{ label: string; value: string }>;
  paymentTypes: Array<{ label: string; value: string }>;
  currencies: Array<{ label: string; value: string }>;
  verifiedAccounts: any[];
  bankLookup: {
    items: BankLookupItem[];
    error: string | null;
  };
  companyLookup: {
    items: CompanyLookupItem[];
    error: string | null;
  };
  manageAction: 'edit' | 'delete' | null;
  paymentProfiles: PaymentProfile[];
  // File upload state
  uploadedFileName: string | null;
  isUploadSuccessful: boolean;
  uploadStatus: 'idle' | 'pending' | 'success' | 'error';
  uploadedFileData: any;
}

const initialState: CreateBeneficiaryState = {
  manageAction: null,
  verifiedAccounts: [],
  paymentProfiles: [],
  beneficiary: {
    status: '',
    action: '',
    versionNumber: 0,
    entityKey: 0,
    counterPartyName: '',
    referenceIDX: '',
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
    counterPartyReference: '',
    accountNumber: '',
    allowDirectAccountFlag: '',
    billerBic: '',
    accountType: '',
    accountTypeDesc: '',
    iban: '',
    accountCurrency: '',
    creditDebitIndicator: '',
    counterPartyTransactionHistoryList: [{}],
    financialInstitutionName: '',
    internationalBankBicCode: '',
    bankBranchName: '',
    bankBranchAddress: {
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
    branchSortCode: '',
    intermediaryBankBicCode: '',
    intermediaryBankName: '',
    intermediaryBankTownName: '',
    correspondingBankBicCode: '',
    correspondingBankName: '',
    correspondingBankTownName: '',
    transactionLimit: 0,
    transactionLimitCurrency: '',
    bankGroupId: '',
    classification: '',
    customerKey: 0,
    endorseStatusCode: '',
    whenModified: 0,
    overrideIssues: true,
    inFileStatus: '',
    issueLogTO: { issues: [{}] },
    bankCountryCode: '',
    fileData: '',
    fileType: '',
    auditTrails: [
      {
        dateAndTime: new Date().toISOString(),
        userName: '',
        event: '',
        description: '',
        parameters: [{}],
        msgDomain: '',
        msgCategory: 0,
        msgSubCategory: '',
      },
    ],
    originatingChannel: '',
    authoriseStatus: '',
    canAuthorise: true,
    hasDAPPermission: true,
    declineReason: '',
    declineUserName: '',
    declineTimestamp: '',
    entityType: '',
    initiator: true,
    customerName: '',
    customerStatus: '',
    customerid: '',
    auditSummaryChangeTOs: [
      {
        updatedDate: new Date().toISOString(),
        fieldName: '',
        originalValue: '',
        updatedValue: '',
      },
    ],
    lastAuditDate: new Date().toISOString(),
    customerCountry: '',
    createdBy: '',
    createdDateTime: '',
    lastAuthorisedBy: '',
    lastAuthorisedDateTime: '',
    accountValidationWarnings: true,
    bankKey: 0,
    surname: '',
    gender: '',
    identificationType: '',
    nationality: '',
    passportCountry: '',
    identificationNumber: '',
    deleteInd: '',
    entityCategory: '',
    reasonForExemption: '',
    exemptFromChargesChk: '',
    secondReference: '',
    linkedPaymentProfiles: [{}],
    cdiNumber: '',
    cdiName: '',
    ignoreCDIBenRefWarnings: true,
    payAlert: '',
    alertDetailsListTO: {
      lastPage: true,
      pageCount: 0,
      postition: 0,
      pageSize: 0,
      rowCount: 0,
      alertDetailsList: [
        {
          alertId: '',
          alertType: '',
          notify: '',
          titleAndName: '',
          emailOrNumber: '',
          entityKey: 0,
          whenModified: new Date().toISOString(),
          alertStatus: '',
          dateAndTimeSent: '',
          instructionKey: 0,
          transactionId: 0,
        },
      ],
    },
    payAlertAllowed: true,
    payAlertFapEnabled: true,
    paymentTypeNames: '',
    entityName: '',
    supportText: '',
    msgCategory: 0,
    bic: '',
    cdiCheck: '',
    serviceLevelMobile: true,
    beneficiaryAdditionalReferenceTO: {
      entityKey: 0,
      billerId: 0,
      referenceDisplay: '',
      referenceDisplay2: '',
      hintText: '',
      hintText2: '',
      actualHintText: '',
      referenceSequence: 0,
      referenceMandatory: '',
      classification: '',
      bankGroupId: '',
      creditDebitIndicator: '',
      validationResponse: '',
    },
    beneficiaryAdditionalReferenceListTO: {
      lastPage: true,
      pageCount: 0,
      postition: 0,
      pageSize: 0,
      rowCount: 0,
      additionalRefList: [
        {
          entityKey: 0,
          billerId: 0,
          referenceDisplay: '',
          referenceDisplay2: '',
          hintText: '',
          hintText2: '',
          actualHintText: '',
          referenceSequence: 0,
          referenceMandatory: '',
          classification: '',
          bankGroupId: '',
          creditDebitIndicator: '',
          validationResponse: '',
        },
      ],
      overallValidationResponse: '',
      customerId: '',
      billerId: 0,
      txnIdRefValidation: 0,
      instructionReference: '',
      additionalReferenceMap: {
        additionalProp1: '',
        additionalProp2: '',
        additionalProp3: '',
      },
      requestId: '',
    },
    billerConcatenatedReference: '',
    validationIndicator: true,
    originalBillerId: '',
    transactionIDRefValidation: 0,
    instructionReference: '',
    firstReferenceLabelValue: '',
    secondReferenceLabelValue: '',
    adhocAllowDirectAccountFlag: '',
    billerRefValRequestId: '',
    fileMapperTemplateId: 0,
    cdiUpdateIndicator: true,
    residencyStatus: '',
    accountGroup: '',
    accountTypeCheckReq: true,
    counterPartyStreetName: '',
    counterPartyPostalCode: '',
    counterPartyTownName: '',
    counterPartyCountrySubDivision: '',
    currency: '',
    town: '',
    firstName: '',
    lastName: '',
    idPassportNumber: '',
  },
  countries: [],
  accountTypes: [],
  paymentTypes: [],
  currencies: [],
  bankLookup: {
    items: [],
    error: null,
  },
  companyLookup: {
    items: [],
    error: null,
  },
  uploadedFileName: null,
  isUploadSuccessful: false,
  uploadStatus: 'idle',
  uploadedFileData: null,
};

export const setBeneficiaryField = createSlice({
  name: 'createBeneficiary',
  initialState,
  reducers: {
    updateBeneficiary(state, action: PayloadAction<{ field: string; value: any }>) {
      (state.beneficiary as any)[action.payload.field] = action.payload.value;
    },
    updateBeneficiaryObject(state, action: PayloadAction<{ path: string[]; value: any }>) {
      let obj = state.beneficiary as any;
      for (let i = 0; i < action.payload.path.length - 1; i++) {
        obj = obj[action.payload.path[i]];
      }
      obj[action.payload.path[action.payload.path.length - 1]] = action.payload.value;
    },
    resetBeneficiary(state) {
      state.beneficiary = initialState.beneficiary;
    },
  },
}).actions;

const createBeneficiarySlice = createSlice({
  name: 'createBeneficiary',
  initialState,
  reducers: {
    updateBeneficiary(state, action: PayloadAction<{ field: string; value: any }>) {
      (state.beneficiary as any)[action.payload.field] = action.payload.value;
    },
    updateBeneficiaryObject(state, action: PayloadAction<{ path: string[]; value: any }>) {
      let obj = state.beneficiary as any;
      for (let i = 0; i < action.payload.path.length - 1; i++) {
        obj = obj[action.payload.path[i]];
      }
      obj[action.payload.path[action.payload.path.length - 1]] = action.payload.value;
    },
    loadBeneficiary(state, action: PayloadAction<any>) {
      // Load complete beneficiary data from API
      const apiData = action.payload;

      // Map backend classification to frontend beneficiaryType
      let beneficiaryType = apiData.beneficiaryType;
      if (!beneficiaryType && apiData.classification) {
        const classificationMap: Record<string, string> = {
          cdi: 'Company',
          domestic: 'Domestic Base',
          international: 'Domestic FX and/or International',
          'domestic FX and/or international': 'Domestic FX and/or International',
        };
        beneficiaryType =
          classificationMap[apiData.classification.toLowerCase()] || apiData.classification;
      }

      // Map backend entityCategory code to frontend display name
      let entityCategory = apiData.entityCategory;
      if (entityCategory && typeof entityCategory === 'string') {
        const entityCategoryMap: Record<string, string> = {
          e: 'Entity',
          i: 'Individual',
          n: 'Not applicable',
        };
        entityCategory = entityCategoryMap[entityCategory.toLowerCase()] || entityCategory;
      }

      const billerID = apiData.cdiNumber || apiData.billerID;

      state.beneficiary = {
        ...state.beneficiary,
        ...apiData,
        beneficiaryType: beneficiaryType,
        entityCategory: entityCategory,
        billerID: billerID,
      };
    },
    resetBeneficiary(state) {
      state.beneficiary = initialState.beneficiary;
    },
    setManageAction(state, action: PayloadAction<'edit' | 'delete' | null>) {
      state.manageAction = action.payload;
    },
    resetBankLookup(state) {
      if (!state.bankLookup) {
        state.bankLookup = { items: [], error: null } as any;
      } else {
        state.bankLookup.items = [];
        state.bankLookup.error = null;
      }
    },
    resetCompanyLookup(state) {
      if (!state.companyLookup) {
        state.companyLookup = { items: [], error: null } as any;
      } else {
        state.companyLookup.items = [];
        state.companyLookup.error = null;
      }
    },
    setUploadFileName(state, action: PayloadAction<string | null>) {
      state.uploadedFileName = action.payload;
    },
    setUploadStatus(state, action: PayloadAction<'idle' | 'pending' | 'success' | 'error'>) {
      state.uploadStatus = action.payload;
    },
    setUploadSuccessful(state, action: PayloadAction<boolean>) {
      state.isUploadSuccessful = action.payload;
    },
    setUploadedFileData(state, action: PayloadAction<any>) {
      state.uploadedFileData = action.payload;
    },
    resetUploadState(state) {
      state.uploadedFileName = null;
      state.isUploadSuccessful = false;
      state.uploadStatus = 'idle';
      state.uploadedFileData = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchVerifiedAccounts.fulfilled, (state, action: PayloadAction<any[]>) => {
      state.verifiedAccounts = action.payload;
    });
    builder
      .addCase(createBeneficiary.pending, (state) => {
        // Optionally set loading state
      })
      .addCase(createBeneficiary.fulfilled, (state, action) => {
        // Optionally handle success
      })
      .addCase(createBeneficiary.rejected, (state, action) => {
        // Optionally handle error
      })
      .addCase(
        fetchCountryOptions.fulfilled,
        (state, action: PayloadAction<Array<{ label: string; value: string }>>) => {
          state.countries = action.payload;
        },
      )
      .addCase(
        fetchAccountTypeOptions.fulfilled,
        (state, action: PayloadAction<Array<{ label: string; value: string }>>) => {
          state.accountTypes = action.payload;
        },
      )
      .addCase(
        fetchPaymentTypeOptions.fulfilled,
        (state, action: PayloadAction<PaymentProfile[]>) => {
          state.paymentProfiles = action.payload;
          state.paymentTypes = action.payload
            .map((p: any) => ({
              label:
                p.description ||
                p.name ||
                p.label ||
                p.code ||
                p.paymentProfileID ||
                p.value ||
                p.customerPaymentProfileName,
              value:
                p.paymentProfileID ||
                p.code ||
                p.value ||
                p.name ||
                p.description ||
                p.customerPaymentProfileName,
            }))
            .filter(
              (o: any) =>
                typeof o.label === 'string' &&
                o.label.length > 0 &&
                typeof o.value === 'string' &&
                o.value.length > 0,
            );
        },
      )
      .addCase(
        fetchPaymentProfilesForFileUpload.fulfilled,
        (state, action: PayloadAction<PaymentProfile[]>) => {
          state.paymentProfiles = action.payload;
          // Also transform into paymentTypes for UI dropdown
          state.paymentTypes = action.payload
            .map((p: any) => ({
              label:
                p.description ||
                p.name ||
                p.label ||
                p.code ||
                p.paymentProfileID ||
                p.value ||
                p.customerPaymentProfileName,
              value:
                p.paymentProfileID ||
                p.code ||
                p.value ||
                p.name ||
                p.description ||
                p.customerPaymentProfileName,
            }))
            .filter(
              (o: any) =>
                typeof o.label === 'string' &&
                o.label.length > 0 &&
                typeof o.value === 'string' &&
                o.value.length > 0,
            );
        },
      )
      .addCase(
        fetchCurrencyOptions.fulfilled,
        (state, action: PayloadAction<Array<{ label: string; value: string }>>) => {
          state.currencies = action.payload;
        },
      )
      .addCase(lookupBank.pending, (state) => {
        if (!state.bankLookup) state.bankLookup = { items: [], error: null } as any;
        state.bankLookup.error = null;
      })
      .addCase(lookupBank.fulfilled, (state, action: PayloadAction<BankLookupItem[]>) => {
        if (!state.bankLookup) state.bankLookup = { items: [], error: null } as any;
        state.bankLookup.items = action.payload;
      })
      .addCase(lookupBank.rejected, (state, action) => {
        if (!state.bankLookup) state.bankLookup = { items: [], error: null } as any;
        state.bankLookup.error = (action.payload as string) || 'Failed to lookup bank list';
        // On error, clear items so UI can show InfoBlock
        state.bankLookup.items = [];
      })
      // Company lookup reducers
      .addCase(lookupCompany.pending, (state) => {
        if (!state.companyLookup) state.companyLookup = { items: [], error: null } as any;
        state.companyLookup.error = null;
      })
      .addCase(lookupCompany.fulfilled, (state, action: PayloadAction<CompanyLookupItem[]>) => {
        if (!state.companyLookup) state.companyLookup = { items: [], error: null } as any;
        state.companyLookup.items = action.payload;
      })
      .addCase(lookupCompany.rejected, (state, action) => {
        if (!state.companyLookup) state.companyLookup = { items: [], error: null } as any;
        state.companyLookup.error = (action.payload as string) || 'Failed to lookup company list';
        // On error, clear items so UI can show InfoBlock
        state.companyLookup.items = [];
      });
  },
});

export const {
  updateBeneficiary,
  updateBeneficiaryObject,
  loadBeneficiary,
  resetBeneficiary,
  setManageAction,
  resetBankLookup,
  resetCompanyLookup,
  setUploadFileName,
  setUploadStatus,
  setUploadSuccessful,
  setUploadedFileData,
  resetUploadState,
} = createBeneficiarySlice.actions;
export default createBeneficiarySlice.reducer;
