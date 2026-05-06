import { useTranslations } from 'next-intl';

export const STATUS_TAB_VALUES = {
  ALL: undefined,
  NEW: 'New',
  UPDATED: 'Updated',
  ACTIVE: 'Active',
} as const;

export const getStatusByTabIndex = (tabIndex: number): string | undefined => {
  switch (tabIndex) {
    case 1:
      return STATUS_TAB_VALUES.NEW;
    case 2:
      return STATUS_TAB_VALUES.UPDATED;
    case 3:
      return STATUS_TAB_VALUES.ACTIVE;
    default:
      return STATUS_TAB_VALUES.ALL;
  }
};

export const getStatusTabLabels = (t: ReturnType<typeof useTranslations>): string[] => [
  t('allRecords'),
  t('new'),
  t('updated'),
  t('active'),
];

export const TABLE_COLUMNS = [
  "id",
  "errorCode",
  "errorDescription",
  "lastModifiedDate",
  { key: "status", type: "chip" },
] as const;

export const getTableHeadCells = (t: ReturnType<typeof useTranslations>) => [
  { id: "id", label: t('tableHeaderId'), numeric: true  },
  { id: "errorCode", label: t('tableHeaderErrorCode'), numeric: false, disableSort: true },
  { id: "errorDescription", label: t('tableHeaderErrorDescription'), numeric: false, disableSort: true },
  { id: "lastModifiedDate", label: t('tableHeaderLastModifiedDate'), numeric: false, disableSort: true },
  { id: "status", label: t('tableHeaderStatus'), numeric: false, disableSort: true },
] as const;

export const navlinks = {
  dashboard: '/',
  errorCodes: '/setup-and-admin/error-codes',
} as const;
