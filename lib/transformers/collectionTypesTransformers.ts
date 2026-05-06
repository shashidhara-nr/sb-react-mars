import { CollectionType, CollectionTypeLinks, CollectionTypeStatus, COLLECTION_TYPE_STATUS_CODES } from '../../types/redux/collectionTypes';
import { CollectionTypesListItem } from '../api/collectionTypesApi';

export interface StatementReferenceTO {
  statementReferenceType: string;
  postingOptions: string;
  statmentReferenceEditable: string;
  appliedtoDebitStatementReference: string;
  statementReference: string;
  shortName: string;
}

export interface CustomerPaymentTypeUnpaid {
  customerPaymentTypeUnpaidkey?: number;
  customerPaymentTypekey?: number;
  unpaidOptionKey?: number;
  serviceLevel?: string;
  unpaidOptionName?: string;
}

export interface CollectionModel {
  attributeDefinitionName: string;
  attributeDefinitionEntityKey: number;
  metaData: string;
  attributeValueEntityKey?: number;
  attributeValue: string;
  displaySeq: number;
  canOverride: boolean;
  selfAdminEnabled: string;
  description: string;
  category: string;
  subCategory: string;
  subCategoryDescription: string;
  h2hDefault: boolean;
  collectionModelCollectionTypeKey?: number;
}

export interface CustomerShortNameTO {
  entityKey?: number;
  customerShortNameKey?: number;
  customerPaymentTypeKey?: number;
  accountKey: number;
  shortNameKey?: number;
  shortName: string;
  agreementAccountKey?: number;
  version?: number;
  defaultShortName?: boolean;
  custShortNameList?: any;
}

export interface CustPaymentTypeShortNameDefaultTO {
  accountKey: number;
  custPaymentTypeShortNameDefaultKey?: number;
  customerPaymentTypeKey?: number;
  agreementAccountKey?: number;
  allowDefaultShortName: boolean;
}

export interface AccountReconciliationTO {
  reconciliationId?: number;
  collectionTypeKey?: number;
  accountKey: number;
  reconciliationOption: string;
}

export interface CollectionTypePayload {
  collectionTypeKey?: number;
  collectionTypeName: string;
  customerKey: number;
  agreementKey: number | string;
  agreementName: string;
  agreementEndorseStatus: string;
  agreementAction: string;
  agreementAuthoriseStatus: string;
  authProfileKey: number;
  authProfileName: string;
  accountKeys: string[];
  accountKeyValues?: string[];
  allowAdHocDebtors: boolean;
  adHocDebtorLimit?: string;
  adHocDebtorLimitCurrency?: string;
  auditReportRequired: boolean;
  auditType?: string;
  enforeceAuditing: boolean;
  statementReferenceListTO: StatementReferenceTO[];
  editAllowedAfterUpload: boolean;
  fileErrorRejectOption: string;
  cutOffTimeBreachOption: string;
  fileUploadPostingOption: string;
  allowAdjustmentToNextDayFU: boolean;
  allowEditingHostToHost: boolean;
  defaultCustomerHostToHost: boolean;
  rejectionOptionHostToHost: string;
  cutOffTimeOptionHostToHost: string;
  allowAdjustmentToNextDayH2H: boolean;
  earlyClearingValidation: boolean;
  suspended: boolean;
  endorseStatusCode: string;
  authoriseStatus: string;
  action: string;
  canAuthorise: boolean;
  hasDAPPermission: boolean;
  initiator: boolean;
  declineReason?: string | null;
  unpaidOptionKey?: number;
  custPaymentTypeUnapids?: CustomerPaymentTypeUnpaid[];
  collectionModelList?: CollectionModel[];
  customerShortNamesTO?: CustomerShortNameTO[];
  custPaymentTypeShortNameDefaultsTOs?: CustPaymentTypeShortNameDefaultTO[];
  accountReconciliationTOList?: AccountReconciliationTO[];
}

export function transformCollectionTypeResponse(items: CollectionTypesListItem[]): CollectionType[] {
  return items.map((item, index) => ({
    id: item.collectionTypeKey?.toString() ?? `${index + 1}`,
    collectionTypeName: item.collectionTypeName ?? '',
    authorisationProfile: item.authorisationProfile ?? '',
    customerAgreement: item.customerAgreementsName ?? '',
    numberOfCount: item.numberOfAccounts ?? 0,
    status: transformStatus(item.authoriseStatus ?? ''),
    links: transformLinks(item.authoriseStatus ?? ''),
    collectionTypeKey: item.collectionTypeKey,
  }));
}

function transformStatus(authoriseStatus: string): CollectionTypeStatus {
  const statusMap: Record<string, { value: string; label: string; color: string }> = {
    [COLLECTION_TYPE_STATUS_CODES.ACTIVE]: { value: COLLECTION_TYPE_STATUS_CODES.ACTIVE, label: COLLECTION_TYPE_STATUS_CODES.ACTIVE, color: 'success' },
    [COLLECTION_TYPE_STATUS_CODES.AWAITING_APPROVAL]: { value: COLLECTION_TYPE_STATUS_CODES.AWAITING_APPROVAL, label: COLLECTION_TYPE_STATUS_CODES.AWAITING_APPROVAL, color: 'warning' },
    [COLLECTION_TYPE_STATUS_CODES.DRAFT]: { value: COLLECTION_TYPE_STATUS_CODES.DRAFT, label: COLLECTION_TYPE_STATUS_CODES.DRAFT, color: 'error' },
  };

  return statusMap[authoriseStatus] || { value: authoriseStatus || 'UNKNOWN', label: authoriseStatus || 'UNKNOWN', color: 'info' };
}

function transformLinks(authoriseStatus: string): CollectionTypeLinks {
  const linkKeyMap: Record<string, string> = {
    [COLLECTION_TYPE_STATUS_CODES.ACTIVE]: 'collectionTypesManage',
    [COLLECTION_TYPE_STATUS_CODES.AWAITING_APPROVAL]: 'collectionTypesRemind',
    [COLLECTION_TYPE_STATUS_CODES.DRAFT]: 'collectionTypesComplete',
  };

  const linkKey = linkKeyMap[authoriseStatus] || 'collectionTypesManage';

  return { text: linkKey, href: '#' };
}

export interface PrepareCollectionTypePayloadParams {
  form: {
    name: string;
    authorisationProfile: string | null;
    allowAdHoc: boolean;
    hostToHostDefault: boolean;
    currency: string;
    adHocLimit: string;
    enforceAuditing?: boolean;
    auditReportType?: 'full' | 'partial';
  };
  fileUploadOptions: {
    errorRejection: 'rejectBatch' | 'rejectInstruction' | 'rejectTransaction';
    cutoffBreach: 'rejectBatch' | 'rejectInstruction' | 'adjustInstruction';
    posting: 'consolidated' | 'itemised';
    allowEditingAfterUpload: boolean;
  };
  statementReferencing: {
    creditItemised?: { selected?: boolean; references?: string[]; editableReference?: boolean };
    debitItemised?: { selected?: boolean; references?: string[]; editableReference?: boolean };
    debitConsolidated?: { selected?: boolean; references?: string[]; editableReference?: boolean };
    creditConsolidated?: { selected?: boolean; references?: string[]; editableReference?: boolean };
  };
  hostToHostOptions: {
    batchErrorRejection: 'rejectBatch' | 'rejectInstruction' | 'rejectTransaction';
    cutoffBreach: 'rejectBatch' | 'rejectInstruction' | 'adjustInstruction';
    allowEditingAfterUpload: boolean;
    defaultFundingOption: 'Populated' | 'Available funds' | 'Credit facility';
  };
  collectionModel: {
    countryOrRegion: string;
    fixedDateValue: boolean;
    upfrontValue?: boolean;
    valueOfSuccess?: boolean;
    defaultSource?: string;
  };
  customerAgreementId: string;
  selectedAccountId: string;
  agreementName?: string;
  collectionTypeKey?: number;
  action?: 'CREATE' | 'UPDATE' | 'DELETE';
}

export function prepareCollectionTypePayload(
  params: PrepareCollectionTypePayloadParams
): CollectionTypePayload {
  const {
    form,
    fileUploadOptions,
    statementReferencing,
    hostToHostOptions,
    collectionModel,
    customerAgreementId,
    selectedAccountId,
    agreementName = '',
    collectionTypeKey,
    action = 'CREATE',
  } = params;

  const errorRejectionMap: Record<string, string> = {
    rejectBatch: 'REJECT_BATCH',
    rejectInstruction: 'REJECT_INSTRUCTION',
    rejectTransaction: 'REJECT_TRANSACTION',
  };

  const cutoffBreachMap: Record<string, string> = {
    rejectBatch: 'REJECT',
    rejectInstruction: 'REJECT',
    adjustInstruction: 'ADJUST',
  };

  const statementReferenceListTO: StatementReferenceTO[] = [];
  
  if (statementReferencing.creditItemised?.selected && statementReferencing.creditItemised.references) {
    statementReferencing.creditItemised.references.forEach((ref, index) => {
      statementReferenceListTO.push({
        statementReferenceType: 'CUSTOMER_REF',
        postingOptions: 'IMMEDIATE',
        statmentReferenceEditable: statementReferencing.creditItemised?.editableReference ? 'Y' : 'N',
        appliedtoDebitStatementReference: 'N',
        statementReference: ref,
        shortName: `CR_ITM_${index + 1}`,
      });
    });
  }

  if (statementReferencing.creditConsolidated?.selected && statementReferencing.creditConsolidated.references) {
    statementReferencing.creditConsolidated.references.forEach((ref, index) => {
      statementReferenceListTO.push({
        statementReferenceType: 'CUSTOMER_REF',
        postingOptions: 'BATCH',
        statmentReferenceEditable: statementReferencing.creditConsolidated?.editableReference ? 'Y' : 'N',
        appliedtoDebitStatementReference: 'N',
        statementReference: ref,
        shortName: `CR_CON_${index + 1}`,
      });
    });
  }

  if (statementReferencing.debitItemised?.selected && statementReferencing.debitItemised.references) {
    statementReferencing.debitItemised.references.forEach((ref, index) => {
      statementReferenceListTO.push({
        statementReferenceType: 'INVOICE',
        postingOptions: 'IMMEDIATE',
        statmentReferenceEditable: statementReferencing.debitItemised?.editableReference ? 'Y' : 'N',
        appliedtoDebitStatementReference: 'Y',
        statementReference: ref,
        shortName: `DB_ITM_${index + 1}`,
      });
    });
  }

  if (statementReferencing.debitConsolidated?.selected && statementReferencing.debitConsolidated.references) {
    statementReferencing.debitConsolidated.references.forEach((ref, index) => {
      statementReferenceListTO.push({
        statementReferenceType: 'INVOICE',
        postingOptions: 'BATCH',
        statmentReferenceEditable: statementReferencing.debitConsolidated?.editableReference ? 'Y' : 'N',
        appliedtoDebitStatementReference: 'Y',
        statementReference: ref,
        shortName: `DB_CON_${index + 1}`,
      });
    });
  }

  const collectionModelList: CollectionModel[] = collectionModel.defaultSource ? [{
    attributeDefinitionName: 'Collection Model Attribute',
    attributeDefinitionEntityKey: 31592,
    metaData: 'Standard Model Metadata',
    attributeValueEntityKey: 1015299,
    attributeValue: collectionModel.defaultSource,
    displaySeq: 1,
    canOverride: true,
    selfAdminEnabled: 'Y',
    description: 'Standard collection model',
    category: 'COLLECTION',
    subCategory: 'STANDARD',
    subCategoryDescription: 'Standard Collection Type',
    h2hDefault: form.hostToHostDefault,
    collectionModelCollectionTypeKey: 69179,
  }] : [];

  const unpaidOptionKey = 293;
  const custPaymentTypeUnapids: CustomerPaymentTypeUnpaid[] = [{
    customerPaymentTypeUnpaidkey: 2625,
    customerPaymentTypekey: 225833,
    unpaidOptionKey: 293,
    serviceLevel: 'STANDARD',
    unpaidOptionName: 'Unpaid Option 1'
  }];

  const customerShortNamesTO: CustomerShortNameTO[] = selectedAccountId ? [{
    entityKey: 1,
    customerShortNameKey: 3505,
    customerPaymentTypeKey: 225833,
    accountKey: Number(selectedAccountId),
    shortNameKey: 4005,
    shortName: 'COLL001',
    agreementAccountKey: 300,
    version: 1,
    defaultShortName: true,
    custShortNameList: null,
  }] : [];

  const custPaymentTypeShortNameDefaultsTOs: CustPaymentTypeShortNameDefaultTO[] = selectedAccountId ? [{
    accountKey: Number(selectedAccountId),
    custPaymentTypeShortNameDefaultKey: 1,
    customerPaymentTypeKey: 225833,
    agreementAccountKey: 300,
    allowDefaultShortName: true,
  }] : [];

  const accountReconciliationTOList: AccountReconciliationTO[] = selectedAccountId ? [
    {
      reconciliationId: 1,
      collectionTypeKey: 123456,
      accountKey: Number(selectedAccountId),
      reconciliationOption: 'A',
    },
    {
      reconciliationId: 2,
      collectionTypeKey: 123456,
      accountKey: Number(selectedAccountId),
      reconciliationOption: 'M',
    }
  ] : [];

  const formatAdHocLimit = (limit: string): string | undefined => {
    if (!limit || limit.trim() === '') return undefined;
    const cleaned = limit.replace(/,/g, '').replace(/\s/g, '');
    const numValue = parseFloat(cleaned);
    if (isNaN(numValue)) return undefined;
    return numValue.toFixed(2);
  };

  return {
    collectionTypeKey: collectionTypeKey || 541932,
    collectionTypeName: form.name.trim(),
    customerKey: 789012,
    agreementKey: Number(customerAgreementId),
    agreementName: agreementName,
    agreementEndorseStatus: 'A',
    agreementAction: 'CREATE',
    agreementAuthoriseStatus: 'PENDING',
    authProfileKey: form.authorisationProfile ? Number(form.authorisationProfile) : 358393,
    authProfileName: 'NAM AUTH PROFILE',
    accountKeys: selectedAccountId ? [selectedAccountId] : [],
    
    allowAdHocDebtors: form.allowAdHoc,
    adHocDebtorLimit: formatAdHocLimit(form.adHocLimit),
    adHocDebtorLimitCurrency: form.currency,
    
    auditReportRequired: form.enforceAuditing ?? false,
    auditType: form.auditReportType?.toUpperCase() as 'FULL' | 'PARTIAL' | undefined,
    enforeceAuditing: form.enforceAuditing ?? false,
    
    statementReferenceListTO,
    
    editAllowedAfterUpload: fileUploadOptions.allowEditingAfterUpload,
    fileErrorRejectOption: errorRejectionMap[fileUploadOptions.errorRejection] || 'REJECT_BATCH',
    cutOffTimeBreachOption: cutoffBreachMap[fileUploadOptions.cutoffBreach] || 'REJECT',
    fileUploadPostingOption: 'IMMEDIATE',
    allowAdjustmentToNextDayFU: true,
    
    allowEditingHostToHost: hostToHostOptions.allowEditingAfterUpload,
    defaultCustomerHostToHost: form.hostToHostDefault,
    rejectionOptionHostToHost: 'REJECT_ALL',
    cutOffTimeOptionHostToHost: cutoffBreachMap[hostToHostOptions.cutoffBreach] || 'REJECT',
    allowAdjustmentToNextDayH2H: hostToHostOptions.cutoffBreach === 'adjustInstruction',
    
    earlyClearingValidation: false,
    suspended: false,
    endorseStatusCode: 'PND',
    authoriseStatus: 'PENDING',
    action: 'CREATE',
    canAuthorise: false,
    hasDAPPermission: true,
    initiator: true,
    declineReason: null,
    
    unpaidOptionKey,
    custPaymentTypeUnapids,
    collectionModelList,
    customerShortNamesTO,
    custPaymentTypeShortNameDefaultsTOs,
    accountReconciliationTOList,
  };
}

export function prepareCollectionTypeListItem(collectionType: CollectionType): CollectionTypesListItem {
  return {
    collectionTypeName: collectionType.collectionTypeName,
    collectionTypeKey: Number.parseInt(collectionType.id?.toString() || '0', 10),
    authorisationProfile: collectionType.authorisationProfile,
    customerAgreementsName: collectionType.customerAgreement,
    numberOfAccounts: collectionType.numberOfCount,
    statusCode: collectionType.status.value,
    authoriseStatus: collectionType.status.value,
    defaultCustomerHostToHost: false,
    earlyClearingValidation: false,
    allowAdhocCounterParty: false,
  };
}

export function transformCollectionTypeDetail(detail: any): CollectionType {
  const actualDetail = detail?.collectionType || detail?.data || detail;
  
  const result: CollectionType = {
    id: actualDetail.collectionTypeKey?.toString() ?? '',
    collectionTypeName: actualDetail.collectionTypeName ?? actualDetail.name ?? '',
    authorisationProfile: actualDetail.authorisationProfile ?? '',
    customerAgreement: actualDetail.customerAgreementsName ?? '',
    numberOfCount: actualDetail.numberOfAccounts ?? 0,
    status: transformStatus(actualDetail.authoriseStatus ?? ''),
    links: transformLinks(actualDetail.authoriseStatus ?? ''),
  };
  
  return result;
}

export interface ManageCollectionTypeFormData {
  form: {
    name: string;
    authorisationProfile: string | null;
    allowAdHoc: boolean;
    hostToHostDefault: boolean;
    currency: string;
    adHocLimit: string;
    enforceAuditing?: boolean;
    auditReportType?: 'full' | 'partial';
  };
  fileUploadOptions: {
    errorRejection: 'rejectBatch' | 'rejectInstruction' | 'rejectTransaction';
    cutoffBreach: 'rejectBatch' | 'rejectInstruction' | 'adjustInstruction';
    posting: 'consolidated' | 'itemised';
    allowEditingAfterUpload: boolean;
  };
  statementReferencing: {
    creditItemised?: { selected?: boolean; references?: string[]; editableReference?: boolean };
    debitItemised?: { selected?: boolean; references?: string[]; editableReference?: boolean };
    debitConsolidated?: { selected?: boolean; references?: string[]; editableReference?: boolean };
    creditConsolidated?: { selected?: boolean; references?: string[]; editableReference?: boolean };
  };
  hostToHostOptions: {
    batchErrorRejection: 'rejectBatch' | 'rejectInstruction' | 'rejectTransaction';
    cutoffBreach: 'rejectBatch' | 'rejectInstruction' | 'adjustInstruction';
    allowEditingAfterUpload: boolean;
    defaultFundingOption: 'Populated' | 'Available funds' | 'Credit facility';
  };
  collectionModel: {
    countryOrRegion: string;
    fixedDateValue: boolean;
    upfrontValue?: boolean;
    valueOfSuccess?: boolean;
    defaultSource?: string;
  };
  customerAgreement: {
    agreementId: string;
    agreementName: string;
    selectedAccountId: string;
  };
  collectionTypeKey?: number;
}

export function transformApiResponseToManageForm(apiResponse: CollectionTypePayload): ManageCollectionTypeFormData {
  const errorRejectionMap: Record<string, 'rejectBatch' | 'rejectInstruction' | 'rejectTransaction'> = {
    'REJECT_BATCH': 'rejectBatch',
    'REJECT_INSTRUCTION': 'rejectInstruction',
    'REJECT_TRANSACTION': 'rejectTransaction',
    'REJECT_ALL': 'rejectBatch',
  };

  const cutoffBreachMap: Record<string, 'rejectBatch' | 'rejectInstruction' | 'adjustInstruction'> = {
    'REJECT': 'rejectBatch',
    'REJECT_BATCH': 'rejectBatch',
    'REJECT_INSTRUCTION': 'rejectInstruction',
    'ADJUST': 'adjustInstruction',
  };

  const postingMap: Record<string, 'consolidated' | 'itemised'> = {
    'BATCH': 'consolidated',
    'IMMEDIATE': 'itemised',
  };

  const form = {
    name: apiResponse.collectionTypeName || '',
    authorisationProfile: apiResponse.authProfileKey?.toString() || null,
    allowAdHoc: apiResponse.allowAdHocDebtors || false,
    hostToHostDefault: apiResponse.defaultCustomerHostToHost || false,
    currency: apiResponse.adHocDebtorLimitCurrency || 'ZAR',
    adHocLimit: apiResponse.adHocDebtorLimit || '',
    enforceAuditing: apiResponse.enforeceAuditing || false,
    auditReportType: (apiResponse.auditType?.toLowerCase() as 'full' | 'partial') || 'full',
  };

  const fileUploadOptions = {
    errorRejection: errorRejectionMap[apiResponse.fileErrorRejectOption] || 'rejectBatch',
    cutoffBreach: cutoffBreachMap[apiResponse.cutOffTimeBreachOption] || 'rejectBatch',
    posting: postingMap[apiResponse.fileUploadPostingOption || 'IMMEDIATE'] || 'itemised',
    allowEditingAfterUpload: apiResponse.editAllowedAfterUpload || false,
  };

  const statementReferencing: ManageCollectionTypeFormData['statementReferencing'] = {};
  
  if (apiResponse.statementReferenceListTO && apiResponse.statementReferenceListTO.length > 0) {
    const creditItemisedRefs: string[] = [];
    const creditConsolidatedRefs: string[] = [];
    const debitItemisedRefs: string[] = [];
    const debitConsolidatedRefs: string[] = [];
    
    let creditItemisedEditable = false;
    let creditConsolidatedEditable = false;
    let debitItemisedEditable = false;
    let debitConsolidatedEditable = false;

    apiResponse.statementReferenceListTO.forEach(ref => {
      const isCredit = ref.statementReferenceType === 'CUSTOMER_REF';
      const isItemised = ref.postingOptions === 'IMMEDIATE';
      const isEditable = ref.statmentReferenceEditable === 'Y';

      if (isCredit && isItemised) {
        creditItemisedRefs.push(ref.statementReference);
        creditItemisedEditable = isEditable;
      } else if (isCredit && !isItemised) {
        creditConsolidatedRefs.push(ref.statementReference);
        creditConsolidatedEditable = isEditable;
      } else if (!isCredit && isItemised) {
        debitItemisedRefs.push(ref.statementReference);
        debitItemisedEditable = isEditable;
      } else if (!isCredit && !isItemised) {
        debitConsolidatedRefs.push(ref.statementReference);
        debitConsolidatedEditable = isEditable;
      }
    });

    if (creditItemisedRefs.length > 0) {
      statementReferencing.creditItemised = {
        selected: true,
        references: creditItemisedRefs,
        editableReference: creditItemisedEditable,
      };
    }

    if (creditConsolidatedRefs.length > 0) {
      statementReferencing.creditConsolidated = {
        selected: true,
        references: creditConsolidatedRefs,
        editableReference: creditConsolidatedEditable,
      };
    }

    if (debitItemisedRefs.length > 0) {
      statementReferencing.debitItemised = {
        selected: true,
        references: debitItemisedRefs,
        editableReference: debitItemisedEditable,
      };
    }

    if (debitConsolidatedRefs.length > 0) {
      statementReferencing.debitConsolidated = {
        selected: true,
        references: debitConsolidatedRefs,
        editableReference: debitConsolidatedEditable,
      };
    }
  }

  const hostToHostOptions = {
    batchErrorRejection: errorRejectionMap[apiResponse.rejectionOptionHostToHost] || 'rejectBatch',
    cutoffBreach: cutoffBreachMap[apiResponse.cutOffTimeOptionHostToHost] || 'rejectBatch',
    allowEditingAfterUpload: apiResponse.allowEditingHostToHost || false,
    defaultFundingOption: 'Populated' as 'Populated' | 'Available funds' | 'Credit facility',
  };

  // Transform collection model
  const collectionModel = {
    countryOrRegion: apiResponse.collectionModelList?.[0]?.subCategory || '',
    fixedDateValue: apiResponse.collectionModelList?.some(
      model => model.attributeDefinitionName.includes('Fixed Date Value') && model.attributeValue === 'T'
    ) || false,
    upfrontValue: apiResponse.collectionModelList?.some(
      model => model.attributeDefinitionName.includes('Upfront Value') && model.attributeValue === 'T'
    ) || false,
    valueOfSuccess: apiResponse.collectionModelList?.some(
      model => model.attributeDefinitionName.includes('Value on Success') && model.attributeValue === 'T'
    ) || false,
    defaultSource: apiResponse.collectionModelList?.[0]?.h2hDefault ? 'Host' : 'File',
  };

  const customerAgreement = {
    agreementId: apiResponse.agreementKey?.toString() || '',
    agreementName: apiResponse.agreementName || '',
    selectedAccountId: apiResponse.accountKeys?.[0] || apiResponse.accountKeyValues?.[0]?.toString() || '',
  };

  return {
    form,
    fileUploadOptions,
    statementReferencing,
    hostToHostOptions,
    collectionModel,
    customerAgreement,
    collectionTypeKey: apiResponse.collectionTypeKey,
  };
}
