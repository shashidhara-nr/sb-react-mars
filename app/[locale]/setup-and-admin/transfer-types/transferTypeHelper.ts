import { TRANSFER_TYPE_STATUS_CODES } from "types/redux/transferTypes";
export const INITIAL_FORM_STATE={
    transferTypeName: '',
    authorisationProfile: '',
    payerCustomerAgreement: '',
    payerAccount: '',
    paymentCustomerAgreement: '',
    paymentAccount: '',
    enforceAuditing: false,
}
export const TAB_INDICES = {
  ALL: 0,
  AWAITING_APPROVAL: 1,
  ACTIVE: 2,
  DRAFT: 3,
} as const;

export const tabsName = {
  [TAB_INDICES.AWAITING_APPROVAL]: 'Awaiting Approval',
  [TAB_INDICES.ACTIVE]: 'Active',
  [TAB_INDICES.DRAFT]: 'Draft',
} as const;

export const tabStatusCodes = {
  [TAB_INDICES.AWAITING_APPROVAL]: TRANSFER_TYPE_STATUS_CODES.AWAITING_APPROVAL,
  [TAB_INDICES.ACTIVE]: TRANSFER_TYPE_STATUS_CODES.ACTIVE,
  [TAB_INDICES.DRAFT]: TRANSFER_TYPE_STATUS_CODES.DRAFT,
} as const;

export const LINK_TEXT = {
  reminder: 'transferTypesRemind',
  manage: 'transferTypesManage',
  complete: 'transferTypesComplete',
} as const;

export const transferTypesRoute = {
  // Use relative paths so navigation preserves the current /[locale] prefix.
  dashboard: '/',
  setupAndAdmin: '/setup-and-admin',
  home: '/setup-and-admin/transfer-types',
  create: '/setup-and-admin/transfer-types/create',
  success: '/setup-and-admin/transfer-types/success',
  details: '/setup-and-admin/transfer-types/manage/:id',
} as const;

export const TRANSFER_TYPE_TABLE_COLUMNS = [
  "id",
  "transferTypeName",
  "authorisationProfile",
  "customerAgreement",
  "numberOfAccounts",
  { key: "status", type: "chip" },
  { key: "links", type: "link" },
] as const;

/**
 * Gets the status filter value based on tab index
 * @param index - The tab index (0-4)
 * @returns The status filter string or undefined for "All" tab
 */
export const getStatusFilterByTabIndex = (index: number): string | undefined => {
  return tabsName[index as keyof typeof tabsName];
}

export const getStatusCodeByTabIndex = (index: number): string | undefined => {
  return tabStatusCodes[index as keyof typeof tabStatusCodes];
}

export enum EmptyStateType {
  NO_RESULTS = 'NO_RESULTS',
  NO_DATA_ALL_TAB = 'NO_DATA_ALL_TAB',
  NO_DATA_FILTERED_TAB = 'NO_DATA_FILTERED_TAB',
}

/**
 * Configuration for determining empty state type
 */
export interface EmptyStateConfig {
  hasData: boolean;
  hasFiltersOrSearch: boolean;
  isAllTab: boolean;
}

/**
 * Determines which empty state to display based on current conditions
 * @param config - Configuration object with data state flags
 * @returns The appropriate EmptyStateType or null if no empty state needed
 */
export const getEmptyStateType = (config: EmptyStateConfig): EmptyStateType | null => {
  const { hasData, hasFiltersOrSearch, isAllTab } = config;
  if (hasData) {
    return null;
  }
  if (hasFiltersOrSearch) {
    return EmptyStateType.NO_RESULTS;
  }
  if (isAllTab) {
    return EmptyStateType.NO_DATA_ALL_TAB;
  }
  return EmptyStateType.NO_DATA_FILTERED_TAB;
}

/**
 * Breadcrumb link type
 */
export interface BreadcrumbLink {
  href: string;
  label: string;
}

/**
 * Translation function type
 */
type TranslationFunction = (key: string) => string;

/**
 * Transfer type page types
 */
export const TRANSFER_TYPE_PAGE = {
  HUB: 'hub',
  CREATE: 'create',
  SUCCESS: 'success',
  SUCCESS_MANAGE: 'success-manage',
  MANAGE: 'manage',
} as const;

export type TransferTypePageType = typeof TRANSFER_TYPE_PAGE[keyof typeof TRANSFER_TYPE_PAGE];

/**
 * Generates breadcrumb links based on page type
 * @param pageType - The type of transfer type page
 * @param t - Translation function
 * @returns Array of breadcrumb links
 */
export const getTransferTypeBreadcrumbs = (
  pageType: TransferTypePageType,
  t: TranslationFunction
): BreadcrumbLink[] => {
  const baseBreadcrumbs: BreadcrumbLink[] = [
    { href: transferTypesRoute.dashboard, label: t('dashboard') },
  ];

  switch (pageType) {
    case TRANSFER_TYPE_PAGE.HUB:
      return [
        ...baseBreadcrumbs,
        { href: transferTypesRoute.home, label: t('breadcrumbLabel') },
      ];
    
    case TRANSFER_TYPE_PAGE.CREATE:
      return [
        ...baseBreadcrumbs,
        { href: transferTypesRoute.home, label: t('breadcrumbLabel') },
        { href: transferTypesRoute.create, label: t('createTransferTypeLabel') },
      ];
    
    case TRANSFER_TYPE_PAGE.SUCCESS:
      return [
        ...baseBreadcrumbs,
        { href: transferTypesRoute.home, label: t('breadcrumbLabel') },
        { href: transferTypesRoute.create, label: t('createTransferTypeLabel') },
      ];
    
    case TRANSFER_TYPE_PAGE.SUCCESS_MANAGE:
      return [
        ...baseBreadcrumbs,
        { href: transferTypesRoute.home, label: t('breadcrumbLabel') },
        { href: '#', label: t('managePageBreadcrumb') },
      ];
    
    case TRANSFER_TYPE_PAGE.MANAGE:
      return [
        ...baseBreadcrumbs,
        { href: transferTypesRoute.dashboard, label: t('setupAndAdmin') },
        { href: transferTypesRoute.home, label: t('breadcrumbLabel') },
        { href: '#', label: t('managePageBreadcrumb') },
      ];
    
    default:
      return baseBreadcrumbs;
  }
};