import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { CreateBeneficiaryPayload } from '../../types/beneficiary';
import { MandateDetails } from '../../types/mandate';
import { post, get, del } from '../../lib/api/httpClient';
import { API_ROUTES } from '../../lib/utils/apiRoute';
import { prepareCreatePayload } from '../../lib/transformers/debtorTransformers';

// Create debtor using actual debtors API
export const createDebtor = createAsyncThunk(
  'createDebtor/createDebtor',
  async (payload: any, { rejectWithValue }) => {
    try {
      console.log('📋 Redux state before transform:', JSON.stringify(payload, null, 2));
      const createPayload = prepareCreatePayload(payload);
      console.log('📝 CREATE debtor payload:', JSON.stringify(createPayload, null, 2));
      const response = await post(API_ROUTES.DEBTORS, createPayload);
      console.log('✅ CREATE debtor success:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Create debtor error:', error);
      console.error('❌ Error response:', error?.response?.data);
      return rejectWithValue(error?.response?.data || error.message || 'Failed to create debtor');
    }
  }
);

// Fetch debtor by ID (uses local Next.js API route returning mock JSON)
export const fetchDebtorById = createAsyncThunk(
  'createDebtor/fetchDebtorById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await get<CreateBeneficiaryPayload>(API_ROUTES.DEBTOR_BY_ID(id));
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch debtor');
    }
  }
);

// Delete debtor - uses DELETE method with request body
export const deleteManagedDebtorById = createAsyncThunk(
  'createDebtor/deleteManagedDebtorById',
  async (debtor: any, { rejectWithValue }) => {
    try {
      // Send ONLY the 5 fields backend confirmed working
      const deletePayload = {
        entityKey: debtor.entityKey,
        counterPartyName: debtor.counterPartyName || '',
        referenceIDX: debtor.referenceIDX || '',
        originatingChannel: debtor.originatingChannel || 'Online capture',
        classification: debtor.classification || ''
      };
      
      console.log('🗑️ Single DELETE payload:', JSON.stringify([deletePayload], null, 2));
      
      // Use DELETE method - backend returns the deleted debtor with action/status
      const response = await del(API_ROUTES.DEBTORS, { data: [deletePayload] });
      console.log('✅ DELETE response:', response);
      
      // Return the actual backend response (contains action and authoriseStatus)
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete debtor');
    }
  }
);

// Fetch verified accounts for debtors
export const fetchVerifiedAccounts = createAsyncThunk('createDebtor/fetchVerifiedAccounts', async (_, { rejectWithValue }) => {
  try {
    const { getBatchDetailsAVS } = await import('../../lib/api/debtorApi');    return getBatchDetailsAVS({validResponseOnly: true});  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to fetch verified accounts');
  }
});

export interface CreateDebtorState {
  debtor: CreateBeneficiaryPayload;
  managedDebtor: CreateBeneficiaryPayload;
  verifiedAccounts: any[];
}

// Use a factory to ensure a fresh, unfrozen object on resets/initialization
const createInitialDebtor = (): CreateBeneficiaryPayload => ({
  action: '',
  status: '',
  versionNumber: 0,
  entityKey: 0,
  // UI flow helper used by page.tsx
  creationMethod: '',
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
  auditTrails: [{
    dateAndTime: new Date().toISOString(),
    userName: '',
    event: '',
    description: '',
    parameters: [{}],
    msgDomain: '',
    msgCategory: 0,
    msgSubCategory: '',
  }],
  originatingChannel: '',
  authoriseStatus: '',
  canAuthorise: true,
  hasDAPPermission: true,
  declineReason: '',
  entityType: '',
  initiator: true,
  customerName: '',
  customerStatus: '',
  customerid: '',
  auditSummaryChangeTOs: [{
    updatedDate: new Date().toISOString(),
    fieldName: '',
    originalValue: '',
    updatedValue: '',
  }],
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
    alertDetailsList: [{
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
    }],
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
    additionalRefList: [{
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
    }],
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
  // Mandate Details
  mandateDetails: [],
  mandateDetailsDuringCreate: [],
  mozMandateDetails: [],
  collectionHistory: [],
  mandateListFlag: null,
  collectionHistoryListFlag: null,
  mandateID: null,
});

const initialState: CreateDebtorState = {
  debtor: createInitialDebtor(),
  managedDebtor: createInitialDebtor(),
  verifiedAccounts: [],
};

const createDebtorSlice = createSlice({
  name: 'createDebtor',
  initialState,
  reducers: {
    updateDebtor(state, action: PayloadAction<{ field: string; value: any }>) {
      if (!state.debtor) {
        state.debtor = createInitialDebtor();
      }
      (state.debtor as any)[action.payload.field] = action.payload.value;
    },
    updateDebtorObject(state, action: PayloadAction<{ path: string[]; value: any }>) {
      if (!state.debtor) {
        state.debtor = createInitialDebtor();
      }
      let obj: any = state.debtor;
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
    updateManagedDebtor(state, action: PayloadAction<{ field: string; value: any }>) {
      if (!state.managedDebtor) {
        state.managedDebtor = createInitialDebtor();
      }
      (state.managedDebtor as any)[action.payload.field] = action.payload.value;
    },
    updateManagedDebtorObject(state, action: PayloadAction<{ path: string[]; value: any }>) {
      if (!state.managedDebtor) {
        state.managedDebtor = createInitialDebtor();
      }
      let obj: any = state.managedDebtor;
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
    resetDebtor(state) {
      state.debtor = createInitialDebtor();
    },
    resetManagedDebtor(state) {
      state.managedDebtor = createInitialDebtor();
    },
    loadManagedDebtor(state, action: PayloadAction<any>) {
      // Load complete debtor data from API
      const apiData = action.payload;

      // Map backend classification to frontend debtorType
      let debtorType = apiData.debtorType;
      if (!debtorType && apiData.classification) {
        const classificationMap: Record<string, string> = {
          'pre-defined': 'Pre-defined',
          domestic: 'Domestic',
          international: 'International',
        };
        debtorType =
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

      // Transform linkedCollectionProfiles array to collectionProfiles string
      let collectionProfiles = apiData.collectionProfiles;
      if (!collectionProfiles && apiData.linkedCollectionProfiles && Array.isArray(apiData.linkedCollectionProfiles)) {
        collectionProfiles = apiData.linkedCollectionProfiles
          .map((profile: any) => profile.customerPaymentProfileName || profile.customerCollectionProfileName)
          .filter(Boolean)
          .join(', ');
      }

      state.managedDebtor = {
        ...state.managedDebtor,
        ...apiData,
        debtorType: debtorType,
        entityCategory: entityCategory,
        collectionProfiles: collectionProfiles,
      };
    },
    // Mandate Management Actions
    addMandate(state, action: PayloadAction<{ isManaged?: boolean }>) {
      const isManaged = action.payload?.isManaged || false;
      const targetDebtor = isManaged ? state.managedDebtor : state.debtor;
      
      const newMandate: MandateDetails = {
        mandateId: '',
        mandateType: 'Fixed',
        frequency: 'Monthly',
        beginDate: '',
        endDate: null,
        debitDay: 1,
        currency: targetDebtor.accountCurrency || targetDebtor.currency || 'ZAR',
        status: 'Pending',
        action: 'Created',
        fixedAmount: '',
        minAmount: null,
        maxAmount: null,
      };
      
      if (isManaged) {
        state.managedDebtor.mandateDetails = [...(state.managedDebtor.mandateDetails || []), newMandate];
      } else {
        state.debtor.mandateDetails = [...(state.debtor.mandateDetails || []), newMandate];
      }
    },
    removeMandate(state, action: PayloadAction<{ index: number; isManaged?: boolean }>) {
      const { index, isManaged } = action.payload;
      const targetDebtor = isManaged ? state.managedDebtor : state.debtor;
      
      if (isManaged) {
        state.managedDebtor.mandateDetails = (state.managedDebtor.mandateDetails || []).filter((_, i) => i !== index);
      } else {
        state.debtor.mandateDetails = (state.debtor.mandateDetails || []).filter((_, i) => i !== index);
      }
    },
    updateMandate(state, action: PayloadAction<{ index: number; mandate: Partial<MandateDetails>; isManaged?: boolean }>) {
      const { index, mandate, isManaged } = action.payload;
      
      if (isManaged) {
        if (state.managedDebtor.mandateDetails && state.managedDebtor.mandateDetails[index]) {
          state.managedDebtor.mandateDetails[index] = {
            ...state.managedDebtor.mandateDetails[index],
            ...mandate,
          };
        }
      } else {
        if (state.debtor.mandateDetails && state.debtor.mandateDetails[index]) {
          state.debtor.mandateDetails[index] = {
            ...state.debtor.mandateDetails[index],
            ...mandate,
          };
        }
      }
    },
    setMandateDetails(state, action: PayloadAction<{ mandates: MandateDetails[]; isManaged?: boolean }>) {
      const { mandates, isManaged } = action.payload;
      
      if (isManaged) {
        state.managedDebtor.mandateDetails = mandates;
      } else {
        state.debtor.mandateDetails = mandates;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createDebtor.pending, (state) => {
        // Optionally set loading state
      })
      .addCase(createDebtor.fulfilled, (state, action) => {
        // Optionally handle success
      })
      .addCase(createDebtor.rejected, (state, action) => {
        // Optionally handle error
      })
      .addCase(fetchDebtorById.pending, (state) => {
        // Optionally set loading state
      })
      .addCase(fetchDebtorById.fulfilled, (state, action: PayloadAction<CreateBeneficiaryPayload>) => {
        const debtor = action.payload || createInitialDebtor();
        
        console.log('🔍 Debtor fetched:', { 
          status: debtor.authoriseStatus, 
          hasAuditTrails: !!debtor.auditTrails,
          auditTrailsCount: debtor.auditTrails?.length 
        });
        
        // Extract decline information from audit trails if status is ACR (repair)
        if (debtor.authoriseStatus === 'ACR' && debtor.auditTrails && Array.isArray(debtor.auditTrails)) {
          // Find the Decline event (search through all audit trails)
          const declineEvent = debtor.auditTrails.find((audit: any) => 
            audit.event === 'Decline'
          );
          
          console.log('🔍 Decline event found:', declineEvent);
          
          if (declineEvent) {
            // Extract decline reason from description
            // Format: "AuditOrm:2934418 Declined authorisation for debtor: \"DBTAGRepair\" reason: \"testing\"."
            let extractedReason = '';
            if (declineEvent.description) {
              const reasonMatch = declineEvent.description.match(/reason:\s*"([^"]+)"/);
              extractedReason = reasonMatch ? reasonMatch[1] : declineEvent.description;
            }
            
            // Set decline information (don't use empty strings, use description as fallback)
            (debtor as any).declineUserName = declineEvent.userName || 'Unknown';
            (debtor as any).declineTimestamp = declineEvent.dateAndTime || Date.now();
            (debtor as any).declineReason = extractedReason || declineEvent.description || 'No reason provided';
            
            console.log('✅ Decline info extracted:', {
              userName: (debtor as any).declineUserName,
              timestamp: (debtor as any).declineTimestamp,
              reason: (debtor as any).declineReason
            });
          } else {
            console.log('⚠️ No Decline event found in audit trails');
          }
        }
        
        state.managedDebtor = debtor;
      })
      .addCase(fetchDebtorById.rejected, (state, action) => {
        // On error, keep current state or reset as needed
      })
      .addCase(deleteManagedDebtorById.fulfilled, (state, action: PayloadAction<any>) => {
        // Backend response contains action and authoriseStatus to determine delete outcome
        // State reset happens after navigation to success page
        state.managedDebtor = createInitialDebtor();
      })
      .addCase(fetchVerifiedAccounts.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.verifiedAccounts = action.payload || [];
      });
  },
});

export const { 
  updateDebtor, 
  updateDebtorObject, 
  resetDebtor, 
  updateManagedDebtor, 
  updateManagedDebtorObject, 
  resetManagedDebtor, 
  loadManagedDebtor,
  addMandate,
  removeMandate,
  updateMandate,
  setMandateDetails,
} = createDebtorSlice.actions;
export default createDebtorSlice.reducer;
