/**
 * collectionTypeMappers.ts
 * 
 * Maps API response data to component state for collection types.
 * Handles transformation of collection type details from backend format to frontend state.
 * 
 * Key differences from payment types:
 * - Collection types: single account selection
 * - Payment types: multiple accounts (batch) selection
 */

import type { 
  CollectionTypeFormState,
  FileUploadOptionsState,
  StatementReferencingState,
  HostToHostOptionsState,
  CollectionModelState
} from 'components/molecules';

/**
 * Map collection type API response to form state
 */
export const mapCollectionTypeForm = (collectionTypeDetails: any): CollectionTypeFormState => {
  return {
    name: collectionTypeDetails.collectionTypeName || '',
    authorisationProfile: collectionTypeDetails.authorisationProfile || null,
    allowAdHoc: collectionTypeDetails.allowAdHocBeneficiary ?? false,
    hostToHostDefault: collectionTypeDetails.hostToHostDefault ?? false,
    currency: collectionTypeDetails.currency || 'ZAR',
    adHocLimit: collectionTypeDetails.adHocLimit?.toString() || '',
    enforceAuditing: collectionTypeDetails.enforceAuditing ?? false,
    auditReportType: collectionTypeDetails.auditReportType || undefined,
  };
};

/**
 * Map API file upload options to state
 */
export const mapFileUploadOptions = (collectionTypeDetails: any): FileUploadOptionsState => {
  const fileUploadOptions = collectionTypeDetails.fileUploadOptions || {};
  
  return {
    errorRejection: fileUploadOptions.errorRejection || 'rejectBatch',
    cutoffBreach: fileUploadOptions.cutoffBreach || 'rejectBatch',
    posting: fileUploadOptions.posting || 'consolidated',
    allowEditingAfterUpload: fileUploadOptions.allowEditingAfterUpload ?? false,
  };
};

/**
 * Map API statement referencing options to state
 * Handles both itemized and consolidated options for credit and debit
 */
export const mapStatementReferencingOptions = (collectionTypeDetails: any): StatementReferencingState => {
  const statementRefs = collectionTypeDetails.statementReferenceListTO || [];
  
  const newStatementState: StatementReferencingState = {
    debitItemised: { selected: false, references: [], editableReference: false },
    debitConsolidated: { selected: false, references: [], editableReference: false },
    creditItemised: { selected: false, references: [], editableReference: false },
    creditConsolidated: { selected: false, references: [], editableReference: false },
  };

  const STATEMENT_REFERENCE_EDITABLE = { TRUE: 'Y', FALSE: 'N' };

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
      } else if (postingOption.includes('consolidated')) {
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
      } else if (postingOption.includes('consolidated')) {
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

/**
 * Map API host-to-host options to state
 */
export const mapHostToHostOptions = (collectionTypeDetails: any): HostToHostOptionsState => {
  const hostToHostOptions = collectionTypeDetails.hostToHostOptions || {};
  
  return {
    batchErrorRejection: hostToHostOptions.batchErrorRejection || 'rejectBatch',
    cutoffBreach: hostToHostOptions.cutoffBreach || 'rejectBatch',
    allowEditingAfterUpload: hostToHostOptions.allowEditingAfterUpload ?? false,
    defaultFundingOption: hostToHostOptions.defaultFundingOption || 'Populated',
  };
};

/**
 * Map API collection model options to state
 */
export const mapCollectionModelOptions = (collectionTypeDetails: any): CollectionModelState => {
  const collectionModel = collectionTypeDetails.collectionModel || {};
  
  return {
    countryOrRegion: collectionModel.countryOrRegion || '',
    fixedDateValue: collectionModel.fixedDateValue ?? false,
    upfrontValue: collectionModel.upfrontValue ?? false,
    valueOfSuccess: collectionModel.valueOfSuccess ?? false,
    defaultSource: collectionModel.defaultSource || '',
  };
};

/**
 * Extract customer agreement and account information from collection type details
 * Note: Collection types have single account (unlike payment types with batch)
 */
export const mapCustomerAgreementAndAccount = (collectionTypeDetails: any) => {
  return {
    customerAgreementId: collectionTypeDetails.customerAgreementId || '',
    selectedAccountId: collectionTypeDetails.selectedAccountId || '',
  };
};

/**
 * Complete mapper to transform entire collection type details response
 */
export const mapCollectionTypeDetails = (collectionTypeDetails: any) => {
  return {
    form: mapCollectionTypeForm(collectionTypeDetails),
    fileUploadOptions: mapFileUploadOptions(collectionTypeDetails),
    statementReferencing: mapStatementReferencingOptions(collectionTypeDetails),
    hostToHostOptions: mapHostToHostOptions(collectionTypeDetails),
    collectionModel: mapCollectionModelOptions(collectionTypeDetails),
    customerAgreement: mapCustomerAgreementAndAccount(collectionTypeDetails),
  };
};

export default {
  mapCollectionTypeForm,
  mapFileUploadOptions,
  mapStatementReferencingOptions,
  mapHostToHostOptions,
  mapCollectionModelOptions,
  mapCustomerAgreementAndAccount,
  mapCollectionTypeDetails,
};
