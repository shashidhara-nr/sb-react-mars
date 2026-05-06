//This Helper file for Bills page configuration and utilities

//Success page message structure
 
export interface SuccessPageMessage {
  title: string;
  mainMessage: string;
  billerIdLabel: string;
  infoText: string;
  status?: string;
}

//Success page button structure

export interface SuccessPageButton {
  copy: string;
  goToBillsHub: string;
  addAnotherBiller?: string;
}

// Breadcrumb navigation links
export const BILLS_BREADCRUMB_LINKS = [
  { href: '/', label: 'Dashboard' },
  { href: '/setup-and-admin/bills', label: 'Bills' },
];

// Billers tab configuration
export const BILLER_STATUS_TABS = [
  'All records',
  'Need action',
  'Awaiting approval',
  'Processing',
  'Active',
  'Inactive',
] as const;

export const BILLER_TAB_STATUS_MAP = [
  undefined, // All records
  'Needs Action',
  'Awaiting Approval',
  'Processing',
  'Active',
  'Inactive',
] as const;

// Biller table configuration
export const BILLER_TABLE_COLUMNS = [
  'billerId',
  'billerName',
  'countryRegion',
  'transactionLimit',
  { key: 'status', type: 'chip' },
  { key: 'links', type: 'link' },
] as const;

export const BILLER_TABLE_HEAD_CELLS = [
  { id: 'billerId', label: 'Biller ID', numeric: false },
  { id: 'billerName', label: 'Biller name', numeric: false },
  { id: 'countryRegion', label: 'Country / Region', numeric: false },
  { id: 'transactionLimit', label: 'Transaction limit', numeric: false },
  { id: 'status', label: 'Status', numeric: false },
  { id: 'links', label: 'Quick links', numeric: false },
] as const;

// Upcoming bills tab configuration
export const UPCOMING_STATUS_TABS = ['All records'] as const;

export const UPCOMING_TAB_STATUS_MAP = [undefined] as const;

// Upcoming bills table configuration
export const UPCOMING_TABLE_COLUMNS = [
  'id',
  'billerName',
  'countryRegion',
  'amount',
  'dueDate',
  'reference',
  { key: 'status', type: 'chip' },
  { key: 'payLink', type: 'link' },
  { key: 'declineLink', type: 'link' },
] as const;

export const UPCOMING_TABLE_HEAD_CELLS = [
  { id: 'id', label: 'Bill ID', numeric: true },
  { id: 'billerName', label: 'Biller name', numeric: false },
  { id: 'countryRegion', label: 'Country / Region', numeric: false },
  { id: 'amount', label: 'Amount', numeric: false },
  { id: 'dueDate', label: 'Due date', numeric: false },
  { id: 'reference', label: 'Reference', numeric: false },
  { id: 'status', label: 'Status', numeric: false },
  { id: 'payLink', label: 'Quick links', numeric: false },
  { id: 'declineLink', label: '', numeric: false },
] as const;

//Get breadcrumb configuration for Bills page
export const getBillsBreadcrumb = () => BILLS_BREADCRUMB_LINKS;

// Get tabs configuration based on mode

export const getTabsConfig = (mode: 'billers' | 'upcoming') => {
  if (mode === 'billers') {
    return BILLER_STATUS_TABS.map((label, index) => ({ label, value: index }));
  }
  return UPCOMING_STATUS_TABS.map((label, index) => ({ label, value: index }));
};

// Get table configuration based on mode

export const getTableColumnsConfig = (mode: 'billers' | 'upcoming') => {
  if (mode === 'billers') {
    return {
      columns: BILLER_TABLE_COLUMNS,
      headCells: BILLER_TABLE_HEAD_CELLS,
    };
  }
  return {
    columns: UPCOMING_TABLE_COLUMNS,
    headCells: UPCOMING_TABLE_HEAD_CELLS,
  };
};

// Get status value for tab index in billers mode

export const getBillerStatusByTabIndex = (tabIndex: number): string | undefined => {
  return BILLER_TAB_STATUS_MAP[tabIndex];
};

// Get delete confirmation message based on mode and count

export const getDeleteMessage = (count: number, mode: 'billers' | 'upcoming'): string => {
  const itemType = mode === 'billers' ? 'billers' : 'bills';
  return `Are you sure you want to delete the ${count} ${itemType} selected. This action cannot be undone.`;
};

/**
 * Get pay confirmation message based on count
 */
export const getPayMessage = (count: number): string => {
  return `Are you sure you want to pay ${count === 1 ? 'this bill' : `these ${count} bills`}?`;
};

/**
 * Get decline confirmation message based on count
 */
export const getDeclineMessage = (count: number): string => {
  return `Are you sure you want to decline ${count === 1 ? 'this bill payment' : `these ${count} bill payments`}?`;
};

/**
 * Get snackbar success message based on action and mode
 */
export const getSnackbarMessage = (action: 'delete' | 'pay' | 'decline', mode?: 'billers' | 'upcoming'): string => {
  switch (action) {
    case 'delete':
      return mode === 'billers' ? 'Biller deleted successfully' : 'Bill deleted successfully';
    case 'pay':
      return 'Bill payment made successfully';
    case 'decline':
      return 'Bill declined successfully';
    default:
      return '';
  }
};

// Get breadcrumb links for success page

export const getSuccessBreadcrumbLinks = () => [
  { href: '/', label: 'Dashboard' },
  { href: '/setup-and-admin/bills', label: 'Bills' },
  { href: '/setup-and-admin/bills/create', label: 'Add a biller' },
];

/**
 * Success page messages
 */
export const SUCCESS_PAGE_MESSAGES: SuccessPageMessage = {
  title: 'Success',
  mainMessage: 'New biller created and submitted for approval.',
  billerIdLabel: 'Biller ID for',
  infoText: 'Please note, Turpis massa sed elementum tempus egestas. Interdum consectetur libero id faucibus nisl tincidunt. Nascetur ridiculus mus mauris vitae ultricies leo.',
} as const;

// Success page button labels and confirmations

export const SUCCESS_PAGE_BUTTONS: SuccessPageButton = {
  copy: 'COPY',
  goToBillsHub: 'GO TO BILLS HUB',
  addAnotherBiller: 'ADD ANOTHER BILLER',
} as const;

// Get formatted biller ID label with biller name

export const getBillerIdLabel = (billerName: string): string => {
  return `${SUCCESS_PAGE_MESSAGES.billerIdLabel} <strong>${billerName}</strong>`;
};

// Get breadcrumb links for bills main page

export const getBillsMainBreadcrumbs = () => [
  { href: '/', label: 'Dashboard' },
  { href: '/setup-and-admin/bills', label: 'Bills' },
];

/**
 * Get breadcrumb links for create/add biller page
 */
export const getCreateBillerBreadcrumbs = () => [
  { href: '/', label: 'Dashboard' },
  { href: '/setup-and-admin/bills', label: 'Bills' },
  { href: '/setup-and-admin/bills/create', label: 'Add a biller' },
];

//Get breadcrumb links for manage biller page
 
export const getManageBillerBreadcrumbs = () => [
  { href: '/', label: 'Dashboard' },
  { href: '/setup-and-admin/bills', label: 'Bills' },
  { href: '/setup-and-admin/bills/manage', label: 'Manage biller' },
];

// Get breadcrumb links for manage success page

export const getManageSuccessBreadcrumbLinks = () => [
  { href: '/', label: 'Dashboard' },
  { href: '/setup-and-admin/bills', label: 'Bills' },
  { href: '/setup-and-admin/bills/manage', label: 'Manage biller' },
];


export const MANAGE_SUCCESS_PAGE_MESSAGES: SuccessPageMessage = {
  title: 'Success',
  mainMessage: 'Biller successfully edited and submitted for approval.',
  billerIdLabel: 'Biller ID for',
  infoText: 'Please note, Turpis massa sed elementum tempus egestas. Interdum consectetur libero id faucibus nisl tincidunt. Nascetur ridiculus mus mauris vitae ultricies leo.',
} as const;


export const MANAGE_SUCCESS_PAGE_BUTTONS: SuccessPageButton = {
  copy: 'COPY',
  goToBillsHub: 'GO TO BILLS HUB',
} as const;


export const getSuccessPageMessages = (type: 'create' | 'manage' = 'create'): SuccessPageMessage => {
  const messages: Record<'create' | 'manage', SuccessPageMessage> = {
    create: SUCCESS_PAGE_MESSAGES,
    manage: MANAGE_SUCCESS_PAGE_MESSAGES,
  };
  return messages[type];
};

//Get success page buttons by type

export const getSuccessPageButtons = (type: 'create' | 'manage' = 'create'): SuccessPageButton => {
  const buttons: Record<'create' | 'manage', SuccessPageButton> = {
    create: SUCCESS_PAGE_BUTTONS,
    manage: MANAGE_SUCCESS_PAGE_BUTTONS,
  };
  return buttons[type];
};

export const customizeSuccessMessages = (
  type: 'create' | 'manage',
  overrides: Partial<SuccessPageMessage>,
): SuccessPageMessage => {
  const baseMessages = getSuccessPageMessages(type);
  return { ...baseMessages, ...overrides };
};


export const getSuccessMainMessage = (type: 'create' | 'manage'): string => {
  return getSuccessPageMessages(type).mainMessage;
};

// Manage page tabs configuration

export const MANAGE_PAGE_TABS = [
  { label: 'Details', value: 'details' },
  { label: 'History', value: 'history' },
  { label: 'Audit trail', value: 'audit' },
] as const;

//Get manage page button labels

export const MANAGE_PAGE_BUTTONS = {
  submitChanges: 'SUBMIT CHANGES FOR APPROVAL',
  deleteBiller: 'DELETE BILLER',
  edit: 'EDIT',
  cancel: 'CANCEL',
  save: 'SAVE',
  removeReferenceType: 'REMOVE REFERENCE TYPE',
} as const;


export const getBreadcrumbsWithTranslation = (
  t: any,
  type: 'main' | 'create' | 'manage'
): Array<{ href: string; label: string }> => {
  const dashboard = t('breadcrumbDashboard');
  const bills = t('breadcrumbBills');

  switch (type) {
    case 'main':
      return [
        { href: '/', label: dashboard },
        { href: '/setup-and-admin/bills', label: bills },
      ];
    case 'create':
      return [
        { href: '/', label: dashboard },
        { href: '/setup-and-admin/bills', label: bills },
        { href: '/setup-and-admin/bills/create', label: t('breadcrumbAddBiller') },
      ];
    case 'manage':
      return [
        { href: '/', label: dashboard },
        { href: '/setup-and-admin/bills', label: bills },
        { href: '/setup-and-admin/bills/manage', label: t('breadcrumbManageBiller') },
      ];
    default:
      return [];
  }
};

export const getTranslatedSuccessMessages = (t: any, type: 'create' | 'manage', status?: string): SuccessPageMessage => {
  const manageBiller = status === 'Need Action' || status === 'Needs Action';
  return {
    title: t('successPageTitle'),
    mainMessage: t(type === 'create' ? 'successPageCreateMessage' : manageBiller ? 'successPageRepairMessage' : 'successPageManageMessage'),
    billerIdLabel: t('successBillerIdLabel'),
    infoText: t('successInfoText'),
  };
};


export const getTranslatedSuccessButtons = (t: any, type: 'create' | 'manage'): SuccessPageButton => {
  return {
    copy: t('buttonCopy'),
    goToBillsHub: t('buttonGoToBillsHub'),
    ...(type === 'create' && { addAnotherBiller: t('buttonAddAnotherBiller') }),
  };
};


export const getTranslatedTabs = (t: any) => [
  { label: t('tabDetails'), value: 'details' },
  { label: t('tabHistory'), value: 'history' },
  { label: t('tabAuditTrail'), value: 'audit' },
];

export const getTranslatedDeleteMessage = (t: any, count: number, mode: 'billers' | 'upcoming'): string => {
  const itemType = t(mode === 'billers' ? 'deleteItemTypeBillers' : 'deleteItemTypeBills');
  return t('deleteConfirmationMessage', { count, itemType });
};


export const getTranslatedPayMessage = (t: any, count: number): string => {
  return t('payConfirmationMessage', { count });
};


export const getTranslatedDeclineMessage = (t: any, count: number): string => {
  return t('declineConfirmationMessage', { count });
};


export const getTranslatedSnackbarMessage = (t: any, action: 'delete' | 'pay' | 'decline', mode?: 'billers' | 'upcoming'): string => {
  switch (action) {
    case 'delete':
      return t(mode === 'billers' ? 'successDeletedBiller' : 'successDeletedBill');
    case 'pay':
      return t('successPaymentMade');
    case 'decline':
      return t('successBillDeclined');
    default:
      return '';
  }
};

/**
 * @param biller - The biller state object
 * @param payAlerts - Array of pay alert objects
 * @param country - Country code (defaults to 'TZ')
 */
export const transformBillerToSubmitPayload = (biller: any, payAlerts: any[], country: string = 'TZ'): any => {
  const alertDetailsList = payAlerts.map((alert) => ({
    alertId: alert.alertId || alert.id || '',
    alertType: alert.alertType === 'Number' ? 'S' : 'E', // Map 'Number' to 'S' (SMS), default to 'E' (Email)
    emailOrNumber: alert.addressOrNumber || alert.emailOrNumber || '',
    notify: alert.notify ? 'Y' : 'N',
    alertStatus: 'ACTIVE',
    titleAndName: alert.titleAndName || '',
  }));


  let paymentProfileListTO = null;
  if (biller.paymentTypes && Array.isArray(biller.paymentTypes) && biller.paymentTypes.length > 0) {
    paymentProfileListTO = {
      paymentProfileList: biller.paymentTypes.map((typeId: string) => ({
        paymentProfileId: typeId,
        paymentProfileName: typeId,
      })),
    };
  }

  // Determine action: 'C' for Create (new biller), 'U' for Update (existing biller)
  const isNewBiller = !biller.entityKey || biller.entityKey === 0;
  const action = isNewBiller ? 'C' : 'U';


  const payload = {
    billerName: biller.billerName || '',
    billerID: biller.billerId || '',
    country: biller.country || country,
    transactionLimit: parseFloat(biller.transactionLimit) || 0,
    transactionLimitCurrency: biller.currency || 'ZAR',
    authoriseStatus: 'ACTIVE',
    status: 'ACTIVE',
    billerAction: action,
    repairAction: action,
    declineReason: null,
    dynamicLableList: null,
    paymentProfileListTO,
    alertDetailsListTO: alertDetailsList.length > 0 ? {
      alertDetailsList,
    } : null,
  };

  return payload;
};
