import type {
  PaymentTypeFormState,
  FileUploadOptionsState,
  StatementReferencingState,
  HostToHostOptionsState,
  UnpaidProcessingState,
} from 'components/molecules';

// Constants for API values
export const REJECTION_OPTIONS = {
  API: {
    REJECT_BATCH: 'REJECT_BATCH',
    REJECT_INSTRUCTION: 'REJECT_INSTRUCTION',
    REJECT_TRANSACTION: 'REJECT_TRANSACTION',
  },
  FORM: {
    REJECT_BATCH: 'rejectBatch' as const,
    REJECT_INSTRUCTION: 'rejectInstruction' as const,
    REJECT_TRANSACTION: 'rejectTransaction' as const,
  },
};

export const CUTOFF_OPTIONS = {
  API: {
    REJECT_BATCH: 'REJECT_BATCH',
    REJECT_INSTRUCTION: 'REJECT_INSTRUCTION',
    RELEASE_ADJUST_INSTRUCTION: 'RELEASE_ADJUST_INSTRUCTION',
    ADJUST_INSTRUCTION: 'ADJUST_INSTRUCTION',
  },
  FORM: {
    REJECT_BATCH: 'rejectBatch' as const,
    REJECT_INSTRUCTION: 'rejectInstruction' as const,
    ADJUST_INSTRUCTION: 'adjustInstruction' as const,
  },
};

export const POSTING_OPTIONS = {
  API: {
    CONSOLIDATED: 'Consolidated',
    ITEMISED: 'Itemised',
    ITEMIZED: 'Itemized',
  },
  FORM: {
    CONSOLIDATED: 'consolidated' as const,
    ITEMISED: 'itemised' as const,
  },
};

export const FUNDING_OPTIONS = {
  API: {
    POPULATED: 'Populated',
    AVAILABLE_FUNDS: 'Available funds',
    CREDIT_FACILITY: 'Credit facility',
  },
  FORM: {
    POPULATED: 'Populated' as const,
    AVAILABLE_FUNDS: 'Available funds' as const,
    CREDIT_FACILITY: 'Credit facility' as const,
  },
};

export const STATEMENT_REFERENCE_EDITABLE = {
  TRUE: 'T',
  YES: 'Y',
  FALSE: 'F',
  NO: 'N',
};

// Mapper functions
export const mapRejectionOption = (
  apiValue: string | undefined | null
): 'rejectBatch' | 'rejectInstruction' | 'rejectTransaction' => {
  if (apiValue === REJECTION_OPTIONS.API.REJECT_INSTRUCTION) {
    return REJECTION_OPTIONS.FORM.REJECT_INSTRUCTION;
  }
  if (apiValue === REJECTION_OPTIONS.API.REJECT_TRANSACTION) {
    return REJECTION_OPTIONS.FORM.REJECT_TRANSACTION;
  }
  return REJECTION_OPTIONS.FORM.REJECT_BATCH;
};

export const mapCutoffOption = (
  apiValue: string | undefined | null
): 'rejectBatch' | 'rejectInstruction' | 'adjustInstruction' => {
  if (
    apiValue === CUTOFF_OPTIONS.API.RELEASE_ADJUST_INSTRUCTION ||
    apiValue === CUTOFF_OPTIONS.API.ADJUST_INSTRUCTION
  ) {
    return CUTOFF_OPTIONS.FORM.ADJUST_INSTRUCTION;
  }
  if (apiValue === CUTOFF_OPTIONS.API.REJECT_INSTRUCTION) {
    return CUTOFF_OPTIONS.FORM.REJECT_INSTRUCTION;
  }
  return CUTOFF_OPTIONS.FORM.REJECT_BATCH;
};

export const mapPostingOption = (
  apiValue: string | undefined | null
): 'consolidated' | 'itemised' => {
  return apiValue?.toLowerCase() === POSTING_OPTIONS.FORM.ITEMISED
    ? POSTING_OPTIONS.FORM.ITEMISED
    : POSTING_OPTIONS.FORM.CONSOLIDATED;
};

export const mapFundingOption = (
  apiValue: string | undefined | null
): 'Populated' | 'Available funds' | 'Credit facility' => {
  if (
    apiValue?.includes('Credit') ||
    apiValue?.includes('credit')
  ) {
    return FUNDING_OPTIONS.FORM.CREDIT_FACILITY;
  }
  if (
    apiValue?.includes('Available') ||
    apiValue?.includes('available')
  ) {
    return FUNDING_OPTIONS.FORM.AVAILABLE_FUNDS;
  }
  return FUNDING_OPTIONS.FORM.POPULATED;
};

// Main mapping functions
export const mapPaymentDetailsToFormState = (
  paymentDetails: any
): PaymentTypeFormState => {
  return {
    name: paymentDetails.name || '',
    authorisationProfile: String(paymentDetails.authProfileKey || ''),
    authorisationProfileName: paymentDetails.authProfileName || '',
    allowAdHoc: paymentDetails.allowAdhocCounterParty ?? false,
    currency: paymentDetails.adHocCounterPartyLimitCurrency || 'ZAR',
    adHocLimit: paymentDetails.adhocCounterPartyLimit || '',
    payAlertsAllowed: paymentDetails.payAlertsEnabled ?? false,
    hostToHostDefault: paymentDetails.defaultCustomerHostToHost ?? false,
  };
};

export const mapFileUploadOptions = (
  paymentDetails: any
): FileUploadOptionsState => {
  return {
    errorRejection: mapRejectionOption(
      paymentDetails.fileUploadRejectionOption
    ),
    cutoffBreach: mapCutoffOption(paymentDetails.cutOffTimeBreachOption),
    posting: mapPostingOption(paymentDetails.fileUploadPostingOption),
    allowEditingAfterUpload: paymentDetails.allowEditingFileUpload ?? false,
  };
};

export const mapStatementReferencingOptions = (
  paymentDetails: any
): StatementReferencingState => {
  const statementRefs = paymentDetails.statementReferenceListTO || [];
  const newStatementState: StatementReferencingState = {
    debitItemised: { selected: false, references: [], editableReference: false },
    debitConsolidated: {
      selected: false,
      references: [],
      editableReference: false,
    },
    creditItemised: {
      selected: false,
      references: [],
      editableReference: false,
    },
    creditConsolidated: {
      selected: false,
      references: [],
      editableReference: false,
    },
  };

  statementRefs.forEach((ref: any) => {
    const isEditable = ref.statmentReferenceEditable === STATEMENT_REFERENCE_EDITABLE.TRUE;
    const reference = ref.statementReference || '';
    const type = ref.statementReferenceType?.toLowerCase() || '';
    const postingOption = ref.postingOptions?.toLowerCase() || '';

    if (type.includes('debit')) {
      if (postingOption.includes('itemised')) {
        newStatementState.debitItemised = {
          selected: true,
          references: reference ? [reference] : [],
          editableReference: isEditable,
        };
      } else {
        newStatementState.debitConsolidated = {
          selected: true,
          references: reference ? [reference] : [],
          editableReference: isEditable,
        };
      }
    } else if (type.includes('credit')) {
      if (postingOption.includes('itemised')) {
        newStatementState.creditItemised = {
          selected: true,
          references: reference ? [reference] : [],
          editableReference: isEditable,
        };
      } else {
        newStatementState.creditConsolidated = {
          selected: true,
          references: reference ? [reference] : [],
          editableReference: isEditable,
        };
      }
    }
  });

  return newStatementState;
};

export const mapHostToHostOptions = (
  paymentDetails: any
): HostToHostOptionsState => {
  return {
    batchErrorRejection: mapRejectionOption(
      paymentDetails.rejectionOptionHostToHost
    ),
    cutoffBreach: mapCutoffOption(paymentDetails.cutOffTimeOptionHostToHost),
    allowEditingAfterUpload: paymentDetails.allowEditingHostToHost ?? false,
    defaultFundingOption: mapFundingOption(paymentDetails.h2hFundingOptions),
  };
};

export const mapUnpaidProcessingOptions = (
  paymentDetails: any,
  defaultState: UnpaidProcessingState
): UnpaidProcessingState => {
  // Store the unpaidOptionKey as a number (the key), not the name
  const unpaidOptionKey = paymentDetails.unpaidOptionKey;
  
  return {
    unpaidOptionName: typeof unpaidOptionKey === 'number' && unpaidOptionKey !== 0
      ? unpaidOptionKey
      : 'Populated', // Default to 'Populated' string if no valid key
    rows: defaultState.rows, // Using default rows as API doesn't provide this data
  };
};

export const buildAccountsBatchFromDetails = (
  paymentDetails: any,
  accountList: any[]
): any[] => {
  if (
    !paymentDetails?.accountKeys?.length ||
    !accountList?.length
  ) {
    return [];
  }

  return paymentDetails.accountKeys
    .map((accountKeyStr: any, index: number) => {
      const accountKeyNum =
        typeof accountKeyStr === 'string'
          ? Number.parseInt(accountKeyStr, 10)
          : accountKeyStr;

      const accountData = accountList.find(
        (acc) => acc.accountKey === accountKeyNum
      );

      if (!accountData) return null;

      return {
        id: `${accountData.accountKey}-${index}`,
        name: `${index + 1}. ${accountData.accountName}`,
        masked: accountData.accountNumber || '',
        accNumber: accountData.accountNumber || '',
        sortCode: accountData.sortCode || '-',
        bic: accountData.bic || '-',
        currency: accountData.currencyCode,
        currencyFull: accountData.currencyDisplayName || accountData.currencyCode,
        currencyCode: accountData.currencyCode,
        country: accountData.countryDisplayName || accountData.countryCode || '-',
        countryCode: accountData.countryCode,
        countryDisplayName: accountData.countryDisplayName ?? undefined,
        shortnames: [],
      };
    })
    .filter((acc: any) => acc !== null);
};
