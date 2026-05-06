// CollectionTypeLogic.ts
// Logic and validation schema for Collection Type forms

import { z } from 'zod';
import type { 
  CollectionTypeFormState, 
  FileUploadOptionsState, 
  StatementReferencingState, 
  HostToHostOptionsState,
  CollectionModelState
} from 'components/molecules';

// Define the Zod schema for CollectionTypeFormState
export const collectionTypeZodSchema = z.object({
  name: z.string().min(1, 'Collection type name is required'),
  authorisationProfile: z.string().min(1, 'Authorisation profile is required'),
  allowAdHoc: z.boolean(),
  hostToHostDefault: z.boolean(),
  currency: z.string().min(1, 'Currency is required'),
  adHocLimit: z.string().optional(), // Can be empty string or formatted string
  enforceAuditing: z.boolean().optional(),
  auditReportType: z.enum(['full', 'partial']).optional(),
}).superRefine((data, ctx) => {
  // Validate adHocLimit when allowAdHoc is true
  if (data.allowAdHoc && (!data.adHocLimit || data.adHocLimit.trim() === '' || data.adHocLimit === '0,00')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['adHocLimit'],
      message: 'Ad-hoc limit is required when ad-hoc debtors are allowed',
    });
  }
  
  // Validate auditReportType when enforceAuditing is true
  if (data.enforceAuditing && !data.auditReportType) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['auditReportType'],
      message: 'Audit report type is required when auditing is enforced',
    });
  }
});

/**
 * Helper function to build statement reference list for collection types
 * Note: Collection types only support single account selection (unlike payment types with multiple)
 */
const buildStatementReferences = (
  statementReferencing: StatementReferencingState
): any[] => {
  const referenceList: any[] = [];

  const referenceTypes = [
    { 
      key: 'creditConsolidated' as const, 
      postingOptions: 'Consolidated',
      shortName: 'COL001', 
      isDebit: false 
    },
    { 
      key: 'debitConsolidated' as const, 
      postingOptions: 'Consolidated', 
      shortName: 'COL002', 
      isDebit: true 
    },
    { 
      key: 'creditItemised' as const, 
      postingOptions: 'Itemized', 
      shortName: 'COL003',
      isDebit: false 
    },
    { 
      key: 'debitItemised' as const, 
      postingOptions: 'Itemized', 
      shortName: 'COL004',
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
          statementReferenceType: 'SHORT_NAME',
          postingOptions,
          statmentReferenceEditable: refType.editableReference ? 'Y' : 'N',
          appliedtoDebitStatementReference: isDebit ? 'Y' : 'N',
          statementReference: allReferences.join(','),
          shortName
        });
      }
    }
  });

  return referenceList;
};

/**
 * Map collection type API response data to statement referencing state
 * This is used when loading existing collection type details for edit/view
 */
export const mapStatementReferencingOptions = (
  collectionTypeDetails: any
): StatementReferencingState => {
  const statementRefs = collectionTypeDetails.statementReferenceListTO || [];
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

/**
 * Transform collection type form data for API submission
 * Handles all sections: form, file upload, statement referencing, host-to-host, and collection model
 */
interface TransformCollectionTypeParams {
  form: CollectionTypeFormState;
  fileUploadOptions: FileUploadOptionsState;
  statementReferencing: StatementReferencingState;
  hostToHostOptions: HostToHostOptionsState;
  collectionModel: CollectionModelState;
  customerAgreementId: string;
  selectedAccountId: string;
}

export const transformToCollectionTypeRequest = (params: TransformCollectionTypeParams) => {
  const { 
    form, 
    fileUploadOptions, 
    statementReferencing, 
    hostToHostOptions,
    collectionModel,
    customerAgreementId,
    selectedAccountId
  } = params;

  const statementReferencingList = buildStatementReferences(statementReferencing);

  return {
    collectionTypeName: form.name.trim(),
    authorisationProfile: form.authorisationProfile,
    allowAdHocBeneficiary: form.allowAdHoc,
    hostToHostDefault: form.hostToHostDefault,
    currency: form.currency,
    adHocLimit: form.adHocLimit ? Number(form.adHocLimit.replace(/,/g, '')) : null,
    enforceAuditing: form.enforceAuditing,
    auditReportType: form.auditReportType,
    fileUploadOptions: {
      errorRejection: fileUploadOptions.errorRejection,
      cutoffBreach: fileUploadOptions.cutoffBreach,
      posting: fileUploadOptions.posting,
      allowEditingAfterUpload: fileUploadOptions.allowEditingAfterUpload,
    },
    statementReferencingOptions: statementReferencingList,
    hostToHostOptions: {
      batchErrorRejection: hostToHostOptions.batchErrorRejection,
      cutoffBreach: hostToHostOptions.cutoffBreach,
      allowEditingAfterUpload: hostToHostOptions.allowEditingAfterUpload,
      defaultFundingOption: hostToHostOptions.defaultFundingOption,
    },
    collectionModel: {
      countryOrRegion: collectionModel.countryOrRegion,
      fixedDateValue: collectionModel.fixedDateValue,
      upfrontValue: collectionModel.upfrontValue,
      valueOfSuccess: collectionModel.valueOfSuccess,
      defaultSource: collectionModel.defaultSource,
    },
    // Single account for collection types (unlike payment types with batch)
    customerAgreementId,
    selectedAccountId,
  };
};

const CollectionTypeLogic = {
  collectionTypeZodSchema,
  buildStatementReferences,
  mapStatementReferencingOptions,
  transformToCollectionTypeRequest,
};

export default CollectionTypeLogic;
