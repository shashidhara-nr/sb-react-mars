export const TABLE_COLUMNS = [
  'predefinedAuthRule',
  'predefinedAuthRuleDescription',
  { key: 'links', type: 'link' },
] as const;

export const navlinks = {
  dashboard: '/',
  nonTransactional: '/setup-and-admin/non-transactional',
  createAuthRule: '/setup-and-admin/non-transactional/create',
  manageAuthRule: '/setup-and-admin/non-transactional/manage',
  createSuccess: '/setup-and-admin/non-transactional/create/success',
  manageSuccess: '/setup-and-admin/non-transactional/manage/success',
};

export type Translator = (key: string, values?: Record<string, any>) => string;

export const TEXT_CONSTANTS = {
  NO_RULES_TO_SEARCH: 'No authorisation rules to search',
  SEARCH_PLACEHOLDER: 'Search predefined authorisation rules',
  HEADING_TITLE: 'Non-transactional authorisation rules',
  CREATE_BUTTON_TEXT: 'Create an authorisation rule',
  TABLE_HEADER_RULE: 'Predefined authorisation rules',
  TABLE_HEADER_DESCRIPTION: 'Predefined authorisation rule description',
  TABLE_HEADER_LINKS: 'Quick links',
  RESET_BUTTON_TEXT: 'RESET ALL ENTITY FUNCTIONS',
  DELETE_CONFIRMATION_TITLE: 'authorisation rules',
  DELETE_SUCCESS_MESSAGE: 'Authorisation rule deleted and submitted for approval',
  NO_RESULTS_TITLE: 'No results found',
  NO_RESULTS_DESCRIPTION: 'Please refine your search and try again.',
  NO_RULES_TITLE: 'No authorisation rules yet',
  NO_RULES_DESCRIPTION: "You haven't added any authorisation rules yet.",
  CREATE_SUCCESS_TITLE: 'Create an authorisation rule',
  CREATE_SUCCESS_MESSAGE: 'Authorisation rule successfully created and submitted for approval.',
  MANAGE_SUCCESS_TITLE: 'Manage authorisation rule',
  MANAGE_SUCCESS_MESSAGE: 'Authorisation rule successfully edited and submitted for approval.',
  SUCCESS_INFO_NOTE: 'Please note, Turpis massa sed elementum tempus egestas. Interdum consectetur libero id faucibus nisl tincidunt. Nascetur ridiculus mus mauris vitae ultricies leo.',
  CREATE_ANOTHER_RULE: 'CREATE ANOTHER AUTHORISATION RULE',
  GO_TO_HUB: 'GO TO NON-TRANSACTIONAL AUTHORISATION RULE HUB',
  CREATE_TITLE: 'Create an authorisation rule',
  MANAGE_TITLE: 'Manage authorisation rule',
};

export const getBreadcrumbLinks = (t: Translator, label?: string) => [
  { href: navlinks.dashboard, label: t('breadcrumbDashboard') },
  {
    href: navlinks.nonTransactional,
    label: t('pageHeadingProfile'),
  },
  ...(label ? [{ href: '#', label }] : []),
];

export const getSearchPlaceholder = (
  t: Translator,
  hasFilteredRows: number,
  hasFiltersOrSearch: boolean,
): string => {
  if (hasFilteredRows === 0 && !hasFiltersOrSearch) {
    return t('noRulesToSearch');
  }
  return t('searchPlaceholder');
};

export const getTableHeadCells = (t: Translator) => [
  { id: 'predefinedAuthRule', label: t('tableHeaderRule'), numeric: false },
  {
    id: 'predefinedAuthRuleDescription',
    label: t('tableHeaderDescription'),
    numeric: false,
  },
  { id: 'link', label: t('tableHeaderLinks'), numeric: false },
];

export const buildDeleteConfirmationMessage = (t: Translator, selectedCount: number) => {
  return t('deleteConfirmationMessage', { count: selectedCount });
};

export const getCreateSuccessBreadcrumbLinks = (t: Translator) => [
  { href: navlinks.dashboard, label: t('breadcrumbDashboard') },
  {
    href: navlinks.nonTransactional,
    label: t('breadcrumbNonTransactional'),
  },
  {
    href: navlinks.createAuthRule,
    label: t('successCreateHeading'),
  },
];

export const getManageSuccessBreadcrumbLinks = (t: Translator) => [
  { href: navlinks.dashboard, label: t('breadcrumbDashboard') },
  {
    href: navlinks.nonTransactional,
    label: t('breadcrumbNonTransactional'),
  },
  {
    href: navlinks.manageAuthRule,
    label: t('manageTitle'),
  },
];

export const getManageBreadcrumbLinks = (t: Translator) => [
  { href: navlinks.dashboard, label: t('breadcrumbDashboard') },
  {
    href: navlinks.nonTransactional,
    label: t('breadcrumbNonTransactional'),
  },
  {
    href: navlinks.manageAuthRule,
    label: t('manageTitle'),
  },
];
