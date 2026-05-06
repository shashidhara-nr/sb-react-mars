'use client';
import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import styles from './CutoffTimes.module.scss';
import { Grid, InputAdornment, TextField, Typography, useTheme } from '@mui/material';
import { BreadcrumbList } from 'components/lib/Page/Breadcrumb';
import { Heading } from 'components/lib/Page';
import TableWithTab from '@molecules/TableWithTab';
import { ListRightPanelActions } from 'components/common';
import { useRouter } from 'next/navigation';
import { mockCutoffTimesData } from '@lib/mock/mockCutoffTimes';
import CutoffTimesFilterDialog from './CutoffTimesFilterDialog';
import { Icon } from '@atoms/index';
import EmptyState from 'components/common/EmptyState';
import Image from 'next/image';
import { ErrorAlertIcon, ReloadRefreshIcon, SearchIcon } from '@lib/icons';

const TABLE_COLUMNS = [
  'countryRegion',
  'instrumentClass',
  'instrumentName',
  'transactionType',
  'transactionCurrency',
  'internalCutoff',
  'externalCutoff',
] as const;
const testIdPrefix = 'cutoff-times';

const CutoffTimes = () => {
  const t = useTranslations('cutoffTimes');
  const theme = useTheme();
  const [searchText, setSearchText] = useState('');
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [error, setError] = useState(false);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Memoize filtered rows
  const mappedRows = useMemo(() => {
    let filtered = mockCutoffTimesData;

    // Apply dialog filters
    if (filters.countryRegion) {
      filtered = filtered.filter((row: any) =>
        row.countryRegion === filters.countryRegion
      );
    }
    if (filters.instrumentName) {
      const search = filters.instrumentName.toLowerCase();
      filtered = filtered.filter((row: any) =>
        row.instrumentName?.toLowerCase().includes(search)
      );
    }
    if (filters.instrumentClassification) {
      const search = filters.instrumentClassification.toLowerCase();
      filtered = filtered.filter((row: any) =>
        row.instrumentClass?.toLowerCase().includes(search)
      );
    }
    if (filters.transferCurrency) {
      filtered = filtered.filter((row: any) =>
        row.transactionCurrency === filters.transferCurrency
      );
    }
    if (filters.transferType) {
      const search = filters.transferType.toLowerCase();
      filtered = filtered.filter((row: any) =>
        row.transactionType?.toLowerCase().includes(search)
      );
    }

    // Apply search text (only if 3 or more characters)
    if (searchText.trim().length >= 3) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        (row: any) =>
          row?.countryRegion?.toLowerCase().includes(search) ||
          row?.instrumentName?.toLowerCase().includes(search) ||
          row?.instrumentClass?.toLowerCase().includes(search) ||
          row?.transactionType?.toLowerCase().includes(search),
      );
    }

    const withAccountDetails = filtered.map((row: any) => ({
      ...row
    }));

    return withAccountDetails;
  }, [filters, searchText]);

  // Memoize callbacks
  const handleFilterOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setSelectedRows([]);
    setFilterDialogOpen(true);
    setFilterAnchorEl(event.currentTarget);
  }, []);

  const handleFilterClose = useCallback(() => {
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
    setSelectedRows([]);
  }, []);

  const handleFilterApply = useCallback((appliedFilters: any) => {
    setSelectedRows([]);
    setFilters(appliedFilters);
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
  }, []);

  const handleCheckboxClick = useCallback(
    (rows: any | any[]) => {
      const selected = Array.isArray(rows) ? rows : rows ? [rows] : [];

      // If "select all" was clicked (array with multiple or zero rows)
      if (Array.isArray(rows)) {
        if (rows.length === 0) {
          // Deselect all - clear everything
          setSelectedRows([]);
        } else if (rows.length > 1) {
          // Select all - limit to current page only
          const startIndex = (currentPage - 1) * perPage;
          const endIndex = startIndex + perPage;
          const currentPageRows = mappedRows.slice(startIndex, endIndex);
          const currentPageIds = new Set(currentPageRows.map((r: any) => r.id));

          // Only keep selections from current page
          const pageSelections = selected.filter((row: any) => currentPageIds.has(row.id));
          setSelectedRows(pageSelections);
        } else {
          // Single row selection/deselection
          setSelectedRows(selected);
        }
      } else {
        // Single row click
        setSelectedRows(selected);
      }
    },
    [currentPage, perPage, mappedRows],
  );

  const handleRemoveFilters = useCallback(() => {
    setFilters({});
    setSearchText('');
  }, []);

  const handleReload = useCallback(() => {
    // TODO : handle reload logic
  }, []);

  const handleLinkClick = useCallback((link: any) => {
    // TODO : handle quick link click
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    setSelectedRows([]); // Clear selections when changing pages
  }, []);

  const handlePerPageChange = useCallback((newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
    setSelectedRows([]); // Clear selections when changing rows per page
  }, []);

  // Handle row dropdown expand/collapse - only one row expanded at a time
  const handleRowDropdownClick = useCallback((rowId: string, isExpanding: boolean) => {
    if (isExpanding) {
      // If expanding, set this row as expanded (and implicitly collapse others)
      setExpandedRowId(rowId);
    } else {
      // If collapsing, clear expanded row
      setExpandedRowId(null);
    }
  }, []);

  const filterButtons = useMemo(() => {
    return [
      {
        children: (
          <>
            <Icon name="filter" width='24' height='24' bgColor={theme.palette.secondary.main} />
            <Typography variant="button" className={styles.filterText}>{t('filter')}</Typography>
          </>
        ),
        buttonVariant: 'tertiary' as const,
        onClick: handleFilterOpen,
      },
    ];
  }, [handleFilterOpen, t, theme.palette.secondary.main]);

  // Memoize action buttons for right panel
  const rightPanelButtons = useMemo(() => {
    const count = selectedRows.length;
    const hasFilters = Object.keys(filters).length > 0 || searchText.trim().length > 0;

    return (
      <ListRightPanelActions
        selectedCount={count}
        hasFilters={hasFilters}
        onRemoveFilters={handleRemoveFilters}
      />
    );
  }, [selectedRows.length, filters, searchText, handleRemoveFilters]);

  // Memoize empty state content - no search match
  const noMatchStateContent = useMemo(
    () => (
      <EmptyState
        title={t('noResultsFound')}
        description={t('noResultsDescription')}
        icon={<Image src={SearchIcon} alt={t('noResultsFound')} width={48} height={48} />}
        testIdPrefix={testIdPrefix}
      />
    ),
    [t],
  );

  // Memoize empty state content - initial empty state
  const emptyStateContent = useMemo(
    () => (
      <EmptyState
        title={t('emptyStateTitle') || 'No Cut-off Times'}
        description={t('emptyStateDesc') || 'No cut-off times data available'}
        icon={<Image src={SearchIcon} alt={t('emptyStateTitle') || 'No Data'} width={48} height={48} />}
        testIdPrefix={testIdPrefix}
      />
    ),
    [t],
  );

  // Memoize error state content
  const errorStateContent = useMemo(
    () => (
      <EmptyState
        title={t('errorStateTitle') || 'Something Went Wrong'}
        description={t('errorStateDesc') || 'Failed to load cut-off times'}
        buttonLabel={t('reload') || 'Reload'}
        onButtonClick={handleReload}
        icon={<Image src={ErrorAlertIcon} alt={t('errorStateTitle') || 'Error'} width={48} height={48} />}
        buttonIcon={<Image src={ReloadRefreshIcon} alt={t('reload') || 'Reload'} width={20} height={20} />}
        testIdPrefix={testIdPrefix}
      />
    ),
    [t, handleReload],
  );

  // Memoize table head cells
  const tableHeadCells = useMemo(
    () => [
      { id: 'countryRegion', label: t('countryRegion'), numeric: false, disableSort: true },
      { id: 'instrumentClass', label: t('instrumentClass'), numeric: false, disableSort: true },
      { id: 'instrumentName', label: t('instrumentName'), numeric: false, disableSort: true },
      { id: 'transactionType', label: t('transactionType'), numeric: false, disableSort: true },
      { id: 'transactionCurrency', label: t('transactionCurrency'), numeric: false, disableSort: true },
      { id: 'internalCutoff', label: t('internalCutoff'), numeric: false, disableSort: true },
      { id: 'externalCutoff', label: t('externalCutoff'), numeric: false, disableSort: true },
    ],
    [t],
  );

  const tableAdditionalCells = useMemo(
    () => [
      { id: 'processingDays', label: t('processingDays'), numeric: false,labelVariant:'body2' },
      { id: 'onUsLeadDays', label: t('onUsLeadDays'), numeric: false ,labelVariant:'body2'},
      { id: 'offUsLeadDays', label: t('offUsLeadDays'), numeric: false ,labelVariant:'body2'},
      { id: 'timeZone', label: t('timeZone'), numeric: false ,labelVariant:'body2'}
    ],
    [t],
  );

  // Memoize table data
  const tableData = useMemo(
    () => ({
      columns: TABLE_COLUMNS,
      headCells: tableHeadCells,
      additionalCells: tableAdditionalCells,
      rowButton: false,
      rows: mappedRows,
      pageSize: 15,
      rowCount: mappedRows.length,
      rowVariant: 'dropdown',
      emptyStateContent: error
        ? errorStateContent
        : mappedRows.length === 0 && (searchText.trim().length >= 3 || Object.keys(filters).length > 0)
          ? noMatchStateContent
          : mappedRows.length === 0
            ? emptyStateContent
            : undefined,
    }),
    [tableHeadCells, tableAdditionalCells, mappedRows, error, errorStateContent, searchText, filters, noMatchStateContent, emptyStateContent],
  );

  // Memoize breadcrumb links
  const breadcrumbLinks = useMemo(
    () => [
      { href: '/', label: t('dashboard') },
      { href: '/cutoff-times', label: t('cutoffTimes') },
    ],
    [t],
  );

  return (
    <section className={styles.container}>
      <BreadcrumbList links={breadcrumbLinks} />
      <Grid
        size={12}
        className={styles.headerRow}
      >
        <Heading as="h4" fontSize="28px">
          {t('cutoffTimes')}
        </Heading>
      </Grid>
      <section className={styles.tabContent}>
        <Grid size={12} className={styles.searchRow}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder={t('searchPlaceholder')}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            InputProps={
              {
                startAdornment: (
                  <InputAdornment position="start"><Icon name="search" width='32' height='32' bgColor={theme.palette.navy.main} /></InputAdornment>
                ),
              }
            }
            className={styles.searchField}
          />
        </Grid>
        <section className={styles.tableContainer}>
          <TableWithTab
            tableData={tableData}
            filterButtons={filterButtons}
            selectedRows={selectedRows}
            onCheckboxClick={handleCheckboxClick}
            onRowClick={(rowData: any) => console.log('rowData', rowData)}
            onRowDropdownClick={handleRowDropdownClick}
            expandedRowId={expandedRowId}
            singleRowExpansion={true}
            rightPanelButtons={rightPanelButtons}
            onPageChange={handlePageChange}
            onPerPageChange={handlePerPageChange}
            onQuickLinkClick={handleLinkClick}
          />
          <CutoffTimesFilterDialog
            open={filterDialogOpen}
            anchorEl={filterAnchorEl}
            onClose={handleFilterClose}
            onApply={handleFilterApply}
            initialValues={filters}
          />
        </section>
      </section>
    </section>
  );
};
export default CutoffTimes;
