import type { EventFilterValues } from '@molecules/EventFilterDialog';

export const DIALOG_CONFIG = {
  MAX_WIDTH: 'sm' as const,
  BORDER_RADIUS: 1,
  OVERFLOW: 'hidden' as const,
} as const;

export interface BreadcrumbLink {
  href: string;
  label: string;
}

export const nonTransactionalAuditRoutes = {
  dashboard: '/',
  auditAndApprove: '/audit-and-approve',
  nonTransactional: '/audit-and-approve/non-transactional',
} as const;

type TranslationFunction = (key: string) => string;

export const getBreadCrumbs = (t: TranslationFunction): BreadcrumbLink[] => {
  return [
    { href: nonTransactionalAuditRoutes.dashboard, label: t('dashboard') },
    { href: nonTransactionalAuditRoutes.auditAndApprove, label: t('auditAndApprove') },
    {
      href: nonTransactionalAuditRoutes.nonTransactional,
      label: t('pageTitle'),
    },
  ];
};

export const createFilterButtons = (
  t: TranslationFunction,
  onFilterClick: (event: React.MouseEvent<HTMLElement>) => void
) => ({
  buttonVariant: 'tertiary' as const,
  onClick: onFilterClick,
  filterLabel: t('filter'),
  altFilter: t('altFilter'),
});

export const transformFilterValues = (appliedFilters: EventFilterValues) => ({
  userAccountName: appliedFilters.userAccountName,
  eventFunction: appliedFilters.eventFunction,
  entityName: appliedFilters.entityName,
  initiatorUserId: appliedFilters.initiatorUserId,
  valueDate: appliedFilters.valueDate?.toISOString(),
});

export const handleQuickLinkSelection = <T extends { id: string | number }>(
  clickedRow: T,
  selectedRows: T[]
): T[] => {
  return selectedRows.length > 1 && selectedRows.some((r) => r.id === clickedRow.id)
    ? selectedRows
    : [];
};

export const getSelectedRowIndex = <T extends { id: string | number }>(
  selectedRow: T | null,
  detailRows: T[]
): number => {
  if (!selectedRow) return -1;
  if (!detailRows.length) return 0;

  const index = detailRows.findIndex((row) => row.id === selectedRow.id);
  return index >= 0 ? index : 0;
};

export const getPreviousRow = <T extends { id: string | number }>(
  currentRow: T | null,
  detailRows: T[]
): T | null => {
  if (!currentRow || detailRows.length < 2) return null;

  const index = detailRows.findIndex((row) => row.id === currentRow.id);
  return index > 0 ? detailRows[index - 1] : null;
};

export const getNextRow = <T extends { id: string | number }>(
  currentRow: T | null,
  detailRows: T[]
): T | null => {
  if (!currentRow || detailRows.length < 2) return null;

  const index = detailRows.findIndex((row) => row.id === currentRow.id);
  return index >= 0 && index < detailRows.length - 1 ? detailRows[index + 1] : null;
};

export const getSuccessMessage = (
  actionType: 'audit' | 'approve' | 'decline',
  isAuditMode: boolean,
  t: TranslationFunction
): string => {
  if (actionType === 'decline') {
    return t('declineSuccess');
  }
  return isAuditMode ? t('auditSuccess') : t('approveSuccess');
};

export const getErrorMessage = (
  actionType: 'audit' | 'approve' | 'decline',
  isAuditMode: boolean,
  t: TranslationFunction
): string => {
  if (actionType === 'decline') {
    return t('declineError');
  }
  return isAuditMode ? t('auditError') : t('approveError');
};
