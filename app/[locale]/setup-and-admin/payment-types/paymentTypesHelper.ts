import { useTranslations } from 'next-intl';
import type { PaymentTypeFormState } from 'components/molecules/PaymentTypeForm/PaymentTypeForm';
import type { FileUploadOptionsState } from 'components/molecules/FileUploadOption';
import type { StatementReferencingState } from 'components/molecules/StatementReferencingOptions/StatementReferencingOptions';
import type { HostToHostOptionsState } from 'components/molecules/HostToHostOptions/HostToHostOptions';
import type { UnpaidProcessingState } from 'components/molecules/UnpaidProcessingOptions/UnpaidProcessingOptions';

// Default State Values for Payment Type Forms
export const DEFAULT_FORM_STATE: PaymentTypeFormState = {
  name: 'Wire Transfer',
  authorisationProfile: 'Standard',
  allowAdHoc: true,
  currency: 'ZAR',
  adHocLimit: '10000',
  payAlertsAllowed: true,
  hostToHostDefault: false,
};

export const DEFAULT_FILE_UPLOAD_STATE: FileUploadOptionsState = {
  errorRejection: 'rejectBatch',
  cutoffBreach: 'rejectBatch',
  posting: 'consolidated',
  allowEditingAfterUpload: false,
};

export const DEFAULT_STATEMENT_REFERENCING_STATE: StatementReferencingState = {
  debitItemised: { selected: false, references: [], editableReference: false },
  debitConsolidated: { selected: false, references: [], editableReference: false },
  creditConsolidated: { selected: false, references: [], editableReference: false },
  creditItemised: { selected: false, references: [], editableReference: false },
};

export const DEFAULT_HOST_TO_HOST_STATE: HostToHostOptionsState = {
  batchErrorRejection: 'rejectBatch',
  cutoffBreach: 'rejectBatch',
  allowEditingAfterUpload: false,
  defaultFundingOption: 'Populated',
};

export const DEFAULT_UNPAID_PROCESSING_STATE: UnpaidProcessingState = {
  unpaidOptionName: 'Populated',
  rows: [
    { id: 1, name: '[Unpaid option name]', onUs: 'Itemised', offUs: 'Itemised' },
    { id: 2, name: '[Unpaid option name]', onUs: 'Itemised', offUs: 'Itemised' },
  ],
};

export const STATUS_TAB_VALUES = {
  ALL: undefined,
  AWAITING_APPROVAL: 'Awaiting Approval',
  ACTIVE: 'Active',
  DRAFT: 'Draft',
} as const;

export const getStatusByTabIndex = (tabIndex: number): string | undefined => {
  switch (tabIndex) {
    case 1:
      return STATUS_TAB_VALUES.AWAITING_APPROVAL;
    case 2:
      return STATUS_TAB_VALUES.ACTIVE;
    case 3:
      return STATUS_TAB_VALUES.DRAFT;
    default:
      return STATUS_TAB_VALUES.ALL;
  }
};

export const getStatusTabLabels = (t: ReturnType<typeof useTranslations>): string[] => [
  t('allRecords'),
  t('awaitingApproval'),
  t('active'),
  t('draft'),
];

export const TABLE_COLUMNS = [
    "id",
    "paymentTypeName",
    "authorisationProfile",
    "customerAgreement",
    "numberOfAccounts",
    "payAlerts",
    { key: "status", type: "chip" },
    { key: "links", type: "link" }
] as const;

export const getTableHeadCells = (t: ReturnType<typeof useTranslations>) => [
    { id: "id", label: t('tableHeaderId'), numeric: true },
    { id: "paymentTypeName", label: t('tableHeaderPaymentTypeName'), numeric: false },
    { id: "authorisationProfile", label: t('tableHeaderAuthorisationProfile'), numeric: false },
    { id: "customerAgreement", label: t('tableHeaderCustomerAgreement'), numeric: false },
    { id: "numberOfAccounts", label: t('tableHeaderNumberOfAccounts'), numeric: true },
    { id: "payAlerts", label: t('tableHeaderPayAlerts'), numeric: false },
    { id: "status", label: t('tableHeaderStatus'), numeric: false },
] as const;


export const navlinks = {
    dashboard: '/',
    paymentTypes: '/setup-and-admin/payment-types',
    createPaymentType: '/setup-and-admin/payment-types/create',
    managePaymentType: '/setup-and-admin/payment-types/manage',
    success: '/setup-and-admin/payment-types/success',
}