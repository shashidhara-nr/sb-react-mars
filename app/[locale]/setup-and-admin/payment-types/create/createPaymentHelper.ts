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

interface TransformPaymentTypeParams {
  form: PaymentTypeFormState;
  fileUploadOptions: FileUploadOptionsState;
  statementReferencing: StatementReferencingState;
  hostToHostOptions: HostToHostOptionsState;
  unpaidProcessing: UnpaidProcessingState;
  customerAgreement: {
    agreementId: string;
    agreementName: string;
    accountId: string;
    accountsBatch: any[];
  };
}

export function transformToPaymentTypeRequest(params: TransformPaymentTypeParams) {
  const { 
    form, 
    fileUploadOptions, 
    statementReferencing, 
    hostToHostOptions, 
    unpaidProcessing,
    customerAgreement 
  } = params;
  
  // Build statement reference list using helper function
  const statementReferenceListTO = buildStatementReferences(statementReferencing);

  // Format data according to API structure
  return {
    name: form.name,
    versionNumber: 0,
    customerKey: 373731, // TODO: Get from logged in user context
    authProfileName: form?.authorisationProfileName,
    authProfileKey: form.authorisationProfile,
    canAuthorise: true,
    authoriseStatus: "ACT",
    agreementAuthoriseStatus: "ACT",
    endorseStatusCode: "N",
    agreementKey: customerAgreement.agreementId,
    agreementName: customerAgreement.agreementName,
    agreementSuspended: false,
    agreementAction: "NONE",
    action: "CREATE",
    initiator: true,
    requiresInterimAudit: false,
    auditReportType: "STANDARD",
    hasDAPPermission: true,
    defaultCustomerHostToHost: form.hostToHostDefault,
    allowEditingHostToHost: hostToHostOptions.allowEditingAfterUpload,
    allowEditingFileUpload: fileUploadOptions.allowEditingAfterUpload,
    payAlertsEnabled: form.payAlertsAllowed,
    earlyClearingValidation: false,
    hideBeneficiaryEnabled: false,
    cutOffTimeBreachOption: fileUploadOptions.cutoffBreach === 'rejectBatch' ? 'REJECT' : fileUploadOptions.cutoffBreach.toUpperCase(),
    cutOffTimeOptionHostToHost: hostToHostOptions.cutoffBreach === 'rejectBatch' ? 'SAME_DAY' : hostToHostOptions.cutoffBreach.toUpperCase(),
    allowAdhocCounterParty: form.allowAdHoc,
    adhocCounterPartyLimit: form.adHocLimit ? form.adHocLimit.replaceAll(',', '') : "999999999999",
    adHocCounterPartyLimitCurrency: form.currency,
    consolidatedBatchIndicator: statementReferencing.creditConsolidated?.selected || false,
    consolidatedInstrxnIndicator: false,
    itemizedBatchIndicator: statementReferencing.creditItemised?.selected || false,
    itemizedInstrxnIndicator: false,
    unpaidOptionKey: typeof unpaidProcessing.unpaidOptionName === 'number' 
      ? unpaidProcessing.unpaidOptionName 
      : 0,
    declineReason: null,
    fileUploadPostingOption: fileUploadOptions.posting === 'consolidated' ? 'Consolidated' : 'Itemized',
    fileUploadRejectionOption: fileUploadOptions.errorRejection === 'rejectBatch' ? 'REJECT_INSTRUCTION' : 'REJECT',
    rejectionOptionHostToHost: hostToHostOptions.batchErrorRejection === 'rejectBatch' ? 'REJECT' : 'REJECT_INSTRUCTION',
    accountKeys: customerAgreement.accountsBatch.map(acc => String(acc.accountKey)),
    accountKeyValues: customerAgreement.accountsBatch.map(acc => Number(acc.accountKey)),
    debitAccountList: {},
    statementReferenceListTO: statementReferenceListTO,
    customerPaymentTypeShortNamesTO: []
  };
}