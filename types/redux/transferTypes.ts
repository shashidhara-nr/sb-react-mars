export interface TransferTypeStatus {
  value: string;
  label: string;
  color: string;
}

export interface TransferTypeLinks {
  text: string;
  href: string;
}

export interface TransferType {
  id?: string;
  transferTypeName: string;
  authorisationProfile: string;
  customerAgreement: string;
  numberOfAccounts: number;
  status: TransferTypeStatus;
  links: TransferTypeLinks;
  accountKeys?: number[];
  creditAccountKeys?: number[];
  versionNumber?: number;
  transferTypeKey?: number;
}

export interface TransferTypeFilters {
  transferTypeName?: string;
  authorisationProfile?: string;
  customerAgreement?: string;
  numberOfAccounts?: string | number;
  status?: string;
}

export interface TransferTypesState {
  data: TransferType[];
  filteredData: TransferType[];
  agreements: Agreement[];
  filters: TransferTypeFilters;
  searchText: string;
  selectedRows: TransferType[];
  selectedTransferType?: TransferType | null;
  isSelectedLoading?: boolean;
  selectedError?: string | null;
  loading?: boolean;
  error?: string | null;
  isLoading?: boolean;
  isError?: boolean;
  isUpdating?: boolean;
  updateError?: string | null;
  isDeleting?: boolean;
  deleteError?: string | null;
}

export interface TransferTypeListItem {
  transferTypeName: string;
  transferTypeKey: number;
  authorisationProfileName: string | null;
  serviceAgreementName: string;
  numberOfAccounts: number;
  statusCode: string;
  displayStatus: string | null;
  requiresInterimAudit: boolean;
  action: string | null;
  authoriseStatus: string;
  defaultCustomerHostToHost: boolean;
}

export interface Agreement {
  agreementKey: number;
  agreementName: string;
}

export const TRANSFER_TYPE_STATUS_CODES = {
  ACTIVE: 'ACT',
  AWAITING_APPROVAL: 'APP',
  DRAFT: 'DFT',
} as const;