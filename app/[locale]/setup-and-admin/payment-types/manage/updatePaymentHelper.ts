import type { 
  PaymentTypeFormState, 
  FileUploadOptionsState, 
  StatementReferencingState, 
  HostToHostOptionsState,
  UnpaidProcessingState
} from 'components/molecules';

// Helper function to build statement reference list
const buildStatementReferences = (
  statementReferencing: StatementReferencingState
): any[] => {
  const referenceList: any[] = [];

  const referenceTypes = [
    { 
      key: 'creditConsolidated' as const, 
      postingOptions: 'Consolidated',
      shortName:'PMT001', 
      isDebit: false 
    },
    { 
      key: 'debitConsolidated' as const, 
      postingOptions: 'Consolidated', 
      shortName:'PMT001', 
      isDebit: true 
    },
    { 
      key: 'creditItemised' as const, 
      postingOptions: 'Itemized', 
      shortName:'PMT001',
      isDebit: false 
    },
    { 
      key: 'debitItemised' as const, 
      postingOptions: 'Itemized', 
      shortName:'PMT001',
      isDebit: true 
    },
  ];

  // Iterate over reference TYPES (not individual references)
  referenceTypes.forEach(({ key, postingOptions, shortName, isDebit }) => {
    const refType = statementReferencing[key];
    
    // Check if this reference type is selected and has references
    if (refType && typeof refType === 'object' && 'selected' in refType && refType.selected && refType.references && refType.references.length > 0) {
      // Collect all references for this type
      const allReferences: string[] = [];
      
      refType.references.forEach((ref: any) => {
        if (typeof ref === 'string') {
          // ref is directly a string like "REF001"
          allReferences.push(ref);
        } else if (ref && typeof ref === 'object') {
          // ref is an object with reference property
          if (Array.isArray(ref.reference)) {
            allReferences.push(...ref.reference);
          } else if (typeof ref.reference === 'string') {
            allReferences.push(ref.reference);
          }
        }
      });
      
      // Create ONE object for this reference type with all references joined by comma
      if (allReferences.length > 0) {
        referenceList.push({
          statementReferenceType: "SHORT_NAME",
          postingOptions,
          statmentReferenceEditable: refType.editableReference ? "Y" : "N",
          appliedtoDebitStatementReference: isDebit ? "Y" : "N",
          statementReference: allReferences.join(','),
          shortName
        });
      }
    }
  });

  return referenceList;
};

interface TransformUpdatePaymentTypeParams {
  form: PaymentTypeFormState;
  fileUploadOptions: FileUploadOptionsState;
  statementReferencing: StatementReferencingState;
  hostToHostOptions: HostToHostOptionsState;
  unpaidProcessing: UnpaidProcessingState;
  customerAgreement: {
    agreementId: string;
    agreementName: string;
    accountsBatch: any[];
  };
  currentDetails: any; // The current payment type details from API
}

export function transformToUpdatePaymentTypeRequest(params: TransformUpdatePaymentTypeParams) {
  const { 
    form, 
    fileUploadOptions, 
    statementReferencing, 
    hostToHostOptions,
    unpaidProcessing,
    customerAgreement,
    currentDetails
  } = params;
  
  // Build statement reference list using helper function
  const statementReferenceListTO = buildStatementReferences(statementReferencing);

  // Start with all existing data from currentDetails to preserve all fields
  // Then override only the fields that are being updated
  return {
    // Spread all existing data first to preserve unchanged fields
    ...currentDetails,
    
    // Override with updated values
    name: form.name,
    action: "UPDATE",
    authProfileName: form?.authorisationProfileName || currentDetails?.authProfileName,
    authProfileKey: form.authorisationProfile || currentDetails?.authProfileKey,
    agreementKey: Number(customerAgreement.agreementId) || currentDetails?.agreementKey,
    agreementName: customerAgreement.agreementName || currentDetails?.agreementName,
    defaultCustomerHostToHost: form.hostToHostDefault,
    allowEditingHostToHost: hostToHostOptions.allowEditingAfterUpload,
    allowEditingFileUpload: fileUploadOptions.allowEditingAfterUpload,
    payAlertsEnabled: form.payAlertsAllowed,
    cutOffTimeBreachOption: mapCutoffBreachOption(fileUploadOptions.cutoffBreach),
    cutOffTimeOptionHostToHost: mapHostToHostCutoffOption(hostToHostOptions.cutoffBreach),
    allowAdhocCounterParty: form.allowAdHoc,
    adhocCounterPartyLimit: form.adHocLimit ? form.adHocLimit.replaceAll(',', '') : "999999999999",
    adHocCounterPartyLimitCurrency: form.currency,
    consolidatedBatchIndicator: statementReferencing.creditConsolidated?.selected || false,
    consolidatedInstrxnIndicator: false,
    itemizedBatchIndicator: statementReferencing.creditItemised?.selected || false,
    itemizedInstrxnIndicator: false,
    unpaidOptionKey: typeof unpaidProcessing.unpaidOptionName === 'number' 
      ? unpaidProcessing.unpaidOptionName 
      : (currentDetails?.unpaidOptionKey || 0),
    fileUploadPostingOption: fileUploadOptions.posting === 'consolidated' ? 'Consolidated' : 'Itemized',
    fileUploadRejectionOption: mapFileUploadRejectionOption(fileUploadOptions.errorRejection),
    rejectionOptionHostToHost: mapHostToHostRejectionOption(hostToHostOptions.batchErrorRejection),
    accountKeys: customerAgreement.accountsBatch.map(acc => String(acc.accountKey)),
    accountKeyValues: customerAgreement.accountsBatch.map(acc => Number(acc.accountKey)),
    statementReferenceListTO: statementReferenceListTO,
    
    // These fields need to be explicitly set for the update
    declineReason: null,
  };
}

// Helper mapping functions
function mapCutoffBreachOption(option: string): string {
  switch(option) {
    case 'rejectBatch':
      return 'REJECT';
    case 'rejectInstruction':
      return 'REJECT_INSTRUCTION';
    case 'adjustInstruction':
      return 'ADJUST_INSTRUCTION';
    default:
      return 'REJECT';
  }
}

function mapHostToHostCutoffOption(option: string): string {
  switch(option) {
    case 'rejectBatch':
      return 'SAME_DAY';
    case 'rejectInstruction':
      return 'REJECT_INSTRUCTION';
    case 'adjustInstruction':
      return 'ADJUST_INSTRUCTION';
    default:
      return 'SAME_DAY';
  }
}

function mapFileUploadRejectionOption(option: string): string {
  switch(option) {
    case 'rejectBatch':
      return 'REJECT_INSTRUCTION';
    case 'rejectInstruction':
      return 'REJECT_INSTRUCTION';
    case 'rejectTransaction':
      return 'REJECT_TRANSACTION';
    default:
      return 'REJECT_INSTRUCTION';
  }
}

function mapHostToHostRejectionOption(option: string): string {
  switch(option) {
    case 'rejectBatch':
      return 'REJECT';
    case 'rejectInstruction':
      return 'REJECT_INSTRUCTION';
    case 'rejectTransaction':
      return 'REJECT_TRANSACTION';
    default:
      return 'REJECT';
  }
}
