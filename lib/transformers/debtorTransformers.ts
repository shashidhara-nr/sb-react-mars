import { CreateBeneficiaryPayload } from '../../types/beneficiary';

export interface UpdateDebtorPayload {
  action: string;
  versionNumber: number;
  entityKey: number;
  [key: string]: any;
}

export interface DeleteDebtorPayload {
  entityKey: number;
  counterPartyName: string;
  referenceIDX: string;
  originatingChannel: string;
  classification: string;
}

export interface CreateDebtorPayload {
  counterPartyName: string;
  referenceIDX: string;
  counterPartyReference?: string;
  accountNumber: string;
  accountType: string;
  accountCurrency: string;
  transactionLimit?: number;
  transactionLimitCurrency?: string;
  financialInstitutionName: string;
  internationalBankBicCode?: string;
  branchSortCode?: string;
  classification: string;
  customerKey?: number;
  counterPartyAddress: {
    addressLine1?: string;
    addressLine2?: string;
    addressLine3?: string;
    townName?: string;
    countryCode?: string;
    postalCode?: string;
  };
  bankBranchAddress?: {
    addressLine1?: string;
    townName?: string;
    countryCode?: string;
  };
  collectionType?: string;
  linkedCollectionProfiles?: any[];
  mandateDetails?: any[];
  nib?: string;
  nuit?: string;
  originatingChannel: string;
  authoriseStatus: string;
}

// Helper to determine account type code based on description and debtor classification
// Returns numeric codes for domestic, alpha codes for international (following beneficiary pattern)
function getAccountTypeCode(accountType: string | undefined, classification?: string): string {
  if (!accountType) {
    // Default based on classification
    return classification === 'international' || classification === 'INTERNATIONAL'
      ? 'CURR' 
      : '1';
  }
  
  const accountTypeLower = accountType.toLowerCase();
  const isInternational = classification === 'international' || classification === 'INTERNATIONAL';
  
  // International debtors use ISO alpha codes (CURR, SAV, etc.)
  if (isInternational) {
    if (accountTypeLower.includes('current') || accountTypeLower.includes('cheque')) {
      return 'CURR';
    }
    if (accountTypeLower.includes('saving')) {
      return 'SAV';
    }
    if (accountTypeLower.includes('transmission')) {
      return 'TRAN';
    }
    if (accountTypeLower.includes('bond')) {
      return 'BOND';
    }
    if (accountTypeLower.includes('subscription') || accountTypeLower.includes('share')) {
      return 'SUBS';
    }
    if (accountTypeLower === 'other') {
      return 'OTHR';
    }
    
    // If it's already an alpha code (CURR, SAV, etc.), return as-is
    if (accountType.length <= 4 && accountType === accountType.toUpperCase()) {
      return accountType;
    }
    
    return 'CURR'; // Default for international
  }
  
  // Domestic debtors use numeric codes (1, 2, 3, etc.)
  switch (accountTypeLower) {
    case 'current accounts':
    case 'current (cheque) accounts':
    case 'current':
    case 'cheque':
      return '1';
    case 'savings accounts':
    case 'savings':
    case 'saving':
      return '2';
    case 'transmission accounts':
    case 'transmission':
      return '3';
    case 'bond accounts':
    case 'bond':
      return '4';
    case 'subscription share accounts':
    case 'subscription':
      return '6';
    case 'other':
      return '000';
    default:
      // If already a number, return as-is
      if (!isNaN(Number(accountType))) {
        return accountType;
      }
      return '1'; // Default for domestic
  }
}

export function prepareUpdatePayload(debtor: CreateBeneficiaryPayload): UpdateDebtorPayload {
  // Build minimal payload with ONLY fields that backend expects for update
  // Based on backend team's confirmed working payload structure
  
  // Helper to clean address object - convert empty strings to null
  const cleanAddress = (address: any) => {
    if (!address || typeof address !== 'object') return null;
    
    return {
      addressLine1: address.addressLine1 || null,
      addressLine2: address.addressLine2 || null,
      addressLine3: address.addressLine3 || null,
      addressLine4: address.addressLine4 || null,
      addressLine5: address.addressLine5 || null,
      streetName: address.streetName || null,
      buildingNumber: address.buildingNumber || null,
      postalCode: address.postalCode || null,
      townName: address.townName || null,
      countrySubDivision: address.countrySubDivision || null,
      countryCode: address.countryCode || null,
      subUrb: address.subUrb || null,
    };
  };

  // Construct minimal update payload with EXACT field order matching backend expectation
  const payload: any = {
    // Required metadata
    action: debtor.authoriseStatus === 'ACR' ? 'R' : 'U',
    versionNumber: debtor.versionNumber ?? 0, // Use version from details API
    entityKey: debtor.entityKey,
    
    // Core debtor fields
    counterPartyName: debtor.counterPartyName || '',
    referenceIDX: debtor.referenceIDX || '',
    counterPartyReference: debtor.counterPartyReference || null,
    
    // Account details
    accountNumber: debtor.accountNumber || '',
    financialInstitutionName: debtor.financialInstitutionName || '',
    internationalBankBicCode: debtor.bic || debtor.internationalBankBicCode || null,
    bankBranchName: debtor.bankBranchName || debtor.branchName || '',
    
    // ⚠️ CRITICAL: bankBranchAddress MUST come before branchSortCode
    bankBranchAddress: cleanAddress(debtor.bankBranchAddress),
    branchSortCode: debtor.branchSortCode || '',
    
    // Counter party address
    counterPartyAddress: cleanAddress(debtor.counterPartyAddress),
    
    // Transaction limits
    transactionLimit: debtor.transactionLimit ? Number(debtor.transactionLimit) : 0,
    transactionLimitCurrency: debtor.transactionLimitCurrency || 'ZAR',
    
    // ⚠️ CRITICAL: overrideIssues MUST come before classification
    overrideIssues: debtor.overrideIssues ?? false,
    
    // Classification and channel
    classification: debtor.classification || 'Pre-defined',
    originatingChannel: 'Online Capture', // Always use capital C to match backend
  };

  // Add collection profiles if they have been updated
  const collectionTypesList = debtor.collectionTypesList || [];
  let selectedCollections: string[] = [];
  
  // Check if collections field exists (user has edited it)
  if (Array.isArray(debtor.collections) && debtor.collections.length > 0) {
    selectedCollections = debtor.collections;
  } else if (typeof debtor.collections === 'string' && debtor.collections) {
    selectedCollections = debtor.collections.split(',').map((s: string) => s.trim()).filter(Boolean);
  } else if (debtor.collectionProfiles) {
    // Fall back to collectionProfiles if collections not set
    if (Array.isArray(debtor.collectionProfiles)) {
      selectedCollections = debtor.collectionProfiles;
    } else if (typeof debtor.collectionProfiles === 'string') {
      selectedCollections = debtor.collectionProfiles.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
  }

  // If we have selected collections, add linkedCollectionProfiles to payload
  if (selectedCollections.length > 0) {
    const linkedCollectionProfiles = selectedCollections.map((name: string) => {
      const found = collectionTypesList.find((item: any) => 
        item.collectionTypeName === name || item.name === name || item.code === name
      );
      return {
        customerPaymentProfileName: name,
        entityKey: found?.collectionTypeKey || found?.entityKey || 0,
      };
    });
    
    payload.linkedCollectionProfiles = linkedCollectionProfiles;
  }

  // Add mandate details if present (ROA/regular mandates)
  if (debtor.mandateDetails && Array.isArray(debtor.mandateDetails) && debtor.mandateDetails.length > 0) {
    payload.mandateDetails = debtor.mandateDetails.map((mandate: any) => ({
      ...mandate,
      // Convert dates to ISO strings if they are Date objects
      beginDate: mandate.beginDate instanceof Date ? mandate.beginDate.toISOString() : mandate.beginDate,
      endDate: mandate.endDate instanceof Date ? mandate.endDate.toISOString() : mandate.endDate,
    }));
  }

  // Add MOZ mandate details if present (Mozambique mandates)
  if (debtor.mozMandateDetails && Array.isArray(debtor.mozMandateDetails) && debtor.mozMandateDetails.length > 0) {
    payload.mozMandateDetails = debtor.mozMandateDetails.map((mandate: any) => ({
      ...mandate,
      // Convert dates to ISO strings if they are Date objects
      invoiceBeginDate: mandate.invoiceBeginDate instanceof Date ? mandate.invoiceBeginDate.toISOString() : mandate.invoiceBeginDate,
      invoiceEndDate: mandate.invoiceEndDate instanceof Date ? mandate.invoiceEndDate.toISOString() : mandate.invoiceEndDate,
    }));
  }
  
  return payload as UpdateDebtorPayload;
}

export function extractErrorMessage(error: any): string {
  if (error?.issueLog?.issues && error.issueLog.issues.length > 0) {
    const issues = error.issueLog.issues.map((issue: any) => 
      issue.message || issue.messageCode || 'Unknown issue'
    ).join(', ');
    return `Validation errors: ${issues}`;
  } else if (error?.response?.data) {
    const responseData = error.response.data;
    if (responseData.errorMessage) {
      return responseData.errorMessage;
    } else if (responseData.message) {
      return responseData.message;
    } else if (responseData.issues && Array.isArray(responseData.issues)) {
      const issues = responseData.issues.map((issue: any) => 
        issue.message || issue.messageCode || JSON.stringify(issue)
      ).join(', ');
      return `Backend validation errors: ${issues}`;
    } else {
      return `Server error: ${JSON.stringify(responseData).substring(0, 200)}`;
    }
  } else if (error?.message) {
    return `Error: ${error.message}`;
  }
  
  return 'Failed to update debtor. Please try again.';
}

export function prepareDeletePayload(debtor: any): any {
  // Send ONLY the 5 fields backend confirmed working
  return {
    entityKey: debtor.entityKey,
    counterPartyName: debtor.counterPartyName || '',
    referenceIDX: debtor.referenceIDX || '',
    originatingChannel: debtor.originatingChannel || 'Online capture',
    classification: debtor.classification || ''
  };
}

export function prepareCreatePayload(debtor: any): CreateDebtorPayload {
  const collectionTypesList = debtor.collectionTypesList || [];
  
  let selectedCollections: string[] = [];
  if (Array.isArray(debtor.collections) && debtor.collections.length > 0) {
    selectedCollections = debtor.collections;
  } else if (typeof debtor.collections === 'string') {
    selectedCollections = debtor.collections.split(',').map((s: string) => s.trim()).filter(Boolean);
  } else if (debtor.collectionType) {
    selectedCollections = String(debtor.collectionType).split(',').map((s: string) => s.trim()).filter(Boolean);
  }

  const linkedCollectionProfiles = selectedCollections.map((name: string) => {
    const found = collectionTypesList.find((item: any) => 
      item.collectionTypeName === name || item.name === name || item.code === name
    );
    return {
      customerPaymentProfileName: name,
      entityKey: found?.collectionTypeKey || found?.entityKey || 0,
    };
  }).filter((item: any) => item.entityKey > 0);

  const bankBranchAddress = {
    addressLine1: debtor.bankBranchAddress?.addressLine1 || '',
    townName: debtor.bankBranchAddress?.townName || debtor.town || '',
    countryCode: debtor.bankBranchAddress?.countryCode || debtor.bankCountryCode || '',
  };

  // Get validated account type code (following beneficiary pattern)
  const classification = debtor.classification || 'domestic';
  const accountTypeCode = getAccountTypeCode(debtor.accountType, classification);

  const payload: any = {
    counterPartyName: debtor.counterPartyName || '',
    referenceIDX: debtor.referenceIDX || '',
    counterPartyReference: debtor.counterPartyReference || '',
    financialInstitutionName: debtor.financialInstitutionName || '',
    internationalBankBicCode: debtor.bic || debtor.internationalBankBicCode || '',
    bankBranchName: debtor.bankBranchName || debtor.branchName || '',
    branchSortCode: debtor.branchSortCode || '',
    bankCountryCode: debtor.bankCountryCode || '',
    classification: classification.toUpperCase(),
    accountCurrency: debtor.accountCurrency || debtor.currency,
    transactionLimit: debtor.transactionLimit ? parseFloat(String(debtor.transactionLimit)) : undefined,
    transactionLimitCurrency: debtor.transactionLimitCurrency || debtor.accountCurrency || debtor.currency,
    counterPartyAddress: {
      addressLine1: debtor.counterPartyAddress?.addressLine1 || '',
      addressLine2: debtor.counterPartyAddress?.addressLine2 || '',
      addressLine3: debtor.counterPartyAddress?.addressLine3 || '',
      townName: debtor.counterPartyAddress?.townName || '',
      countryCode: debtor.counterPartyAddress?.countryCode || '',
      postalCode: debtor.counterPartyAddress?.postalCode || '',
    },
    bankBranchAddress,
    collectionType: selectedCollections.join(','),
    linkedCollectionProfiles,
    mandateDetails: (debtor.mandateDetails || []).map((mandate: any) => ({
      ...mandate,
      beginDate: mandate.beginDate instanceof Date ? mandate.beginDate.toISOString() : mandate.beginDate,
      endDate: mandate.endDate instanceof Date ? mandate.endDate.toISOString() : mandate.endDate,
    })),
    mozMandateDetails: (debtor.mozMandateDetails || []).map((mandate: any) => ({
      ...mandate,
      invoiceBeginDate: mandate.invoiceBeginDate instanceof Date ? mandate.invoiceBeginDate.toISOString() : mandate.invoiceBeginDate,
      invoiceEndDate: mandate.invoiceEndDate instanceof Date ? mandate.invoiceEndDate.toISOString() : mandate.invoiceEndDate,
    })),
    nib: debtor.nib || '',
    nuit: debtor.nuit || '',
    originatingChannel: 'Online capture',
    authoriseStatus: 'INA',
  };
  
  if (debtor.accountNumber && debtor.accountNumber.trim()) {
    payload.accountNumber = debtor.accountNumber.trim();
  }
  if (debtor.iban && debtor.iban.trim()) {
    payload.iban = debtor.iban.trim();
  }
  if (accountTypeCode && accountTypeCode !== '' && accountTypeCode !== '0') {
    payload.accountType = accountTypeCode;
  }
  if (debtor.customerKey && debtor.customerKey > 0) {
    payload.customerKey = debtor.customerKey;
  }

  return payload;
}
