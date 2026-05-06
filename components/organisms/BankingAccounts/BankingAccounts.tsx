'use client';
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import styles from './BankingAccounts.module.scss';
import { Grid, InputAdornment, TextField, Typography, useTheme, Box } from '@mui/material';
import { BreadcrumbList } from 'components/lib/Page/Breadcrumb';
import { Heading } from 'components/lib/Page';
import TableWithTab from '@molecules/TableWithTab';
import { ListRightPanelActions, CommonSnackbar } from 'components/common';
import { useRouter } from 'next/navigation';
import { mockBankingAccountsData } from '@lib/mock/mockBankingAccounts';
import BankingAccountsFilterDialog from './BankingAccountsFilterDialog';
import DownloadBankingAccountsDialog from 'components/molecules/DownloadBankingAccountsDialog';
import { Icon } from '@atoms/index';
import EmptyState from 'components/common/EmptyState';
import Image from 'next/image';
import { ErrorAlertIcon, ReloadRefreshIcon } from '@lib/icons';
import Loader from 'components/lib/Page/Loader';
import { buildTestId } from 'src/utils/testIds';
import { generateBankingAccountsPDF } from '@lib/utils/generateBankingAccountsPDF';
import { Button } from 'dist/standard-bank-react';

const TABLE_COLUMNS = [
  'accountName',
  'accountNumber',
  'serialNumber',
  'accountType',
  'accountOwner',
  'branchSortCode',
  'bankName',
  { key: 'links', type: 'link' }
] as const;

const testIdPrefix = 'banking-accounts';

const BankingAccounts = () => {
  const t = useTranslations('bankingAccounts');
  const locale = useLocale();
  const theme = useTheme();
  const [searchText, setSearchText] = useState('');
  const router = useRouter();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('success');
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [bankingAccountsData, setBankingAccountsData] = useState<any[]>(mockBankingAccountsData);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [isDownloadError, setIsDownloadError] = useState(false);
  const [lastDownloadParams, setLastDownloadParams] = useState<{ format: 'pdf'; sortBy: 'ascending' | 'descending' } | null>(null);

  // Memoize filtered rows
  const mappedRows = useMemo(() => {
    let filtered = bankingAccountsData;

    // Apply dialog filters
    if (filters.branchSortCode) {
      const search = filters.branchSortCode.toLowerCase();
      filtered = filtered.filter((row: any) =>
        row.branchSortCode?.toLowerCase().includes(search)
      );
    }
    if (filters.accountName) {
      const search = filters.accountName.toLowerCase();
      filtered = filtered.filter((row: any) =>
        row.accountName?.toLowerCase().includes(search),
      );
    }
    if (filters.accountNumber) {
      const search = filters.accountNumber.toLowerCase();
      filtered = filtered.filter((row: any) =>
        row.accountNumber?.toLowerCase().includes(search)
      );
    }
    if (filters.accountType) {
      filtered = filtered.filter((row: any) => row.accountType === filters.accountType);
    }
    if (filters.bankName) {
      filtered = filtered.filter((row: any) => row.bankName?.toLowerCase().includes(filters.bankName.toLowerCase()));
    }

    // Apply search text - only search if 3 or more characters
    if (searchText.trim().length >= 3) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        (row: any) =>
          row?.accountName?.toLowerCase().includes(search) ||
          row?.accountNumber?.toLowerCase().includes(search) ||
          row?.accountOwner?.toLowerCase().includes(search) ||
          row?.branchSortCode?.toLowerCase().includes(search),
      );
    }

    const withFormattedLinks = filtered.map((row: any) => ({
      ...row,
      links: {
        href: row?.links?.href || '#',
        text: t(row?.links?.text).toLocaleUpperCase()
      }
    }));

    return withFormattedLinks;
  }, [filters, searchText, t, bankingAccountsData]);

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
    setCurrentPage(1);
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

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    setSelectedRows([]); // Clear selections when changing pages
  }, []);

  const handlePerPageChange = useCallback((newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
    setSelectedRows([]); // Clear selections when changing rows per page
  }, []);

  // Handle link click for manage beneficiary
  const handleLinkClick = useCallback((row: any, index: number, link: any) => {
    const localizedPath = `/${locale}${link.href}`;
    router.push(localizedPath as any);
  }, [router, locale]);

  const handleDownloadClick = useCallback((event?: React.MouseEvent<HTMLElement>) => {
    setDownloadDialogOpen(true);
    setDownloadAnchorEl(tableContainerRef.current);
  }, []);

  const handleDownloadClose = useCallback(() => {
    setDownloadDialogOpen(false);
    setDownloadAnchorEl(null);
  }, []);

  // To test error toast with retry button:
  const handleDownloadConfirm = useCallback(
    async (payload: { format: 'pdf'; sortBy: 'ascending' | 'descending' }) => {
      try {
        setDownloadLoading(true);
        setLastDownloadParams(payload);

        // Generate PDF with selected rows and open print dialog
        generateBankingAccountsPDF(
          selectedRows,
          payload.sortBy,
          `banking-accounts-${new Date().getTime()}`
        );

        // Show success toast
        setToastMessage(t('toastSuccessMessage'));
        setToastSeverity('success');
        setIsDownloadError(false);
        setToastOpen(true);

        // Close dialog
        handleDownloadClose();
      } catch (error) {
        setToastMessage(t('toastDownloadError'));
        setToastSeverity('error');
        setIsDownloadError(true);
        setToastOpen(true);
      } finally {
        setDownloadLoading(false);
      }
    },
    [selectedRows]
  );

  const handleRetryDownload = useCallback(() => {
    if (lastDownloadParams) {
      setToastOpen(false);
      handleDownloadConfirm(lastDownloadParams);
    }
  }, [lastDownloadParams, handleDownloadConfirm]);

  const handleCloseToast = useCallback(() => {
    setToastOpen(false);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchText('');
    setCurrentPage(1);
    setSelectedRows([]);
  }, []);

  const handleReload = useCallback(() => {
    setRetryCount(prev => prev + 1);
  }, []);

  // API Integration - Fetch banking accounts data
  useEffect(() => {
    const fetchBankingAccountsData = async () => {
      setIsLoading(true);
      try {
        // Mock API call with delay to simulate network request
        // Uncomment the line below to simulate API failure for testing AC7
        // throw new Error('API request failed');

        // For now, using mock data
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        setBankingAccountsData(mockBankingAccountsData);
        setHasError(false);
      } catch (error) {
        setHasError(true);
        setBankingAccountsData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBankingAccountsData();
  }, [retryCount]);

  // Memoize filter button
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
        'data-testid': buildTestId(testIdPrefix, 'filter-button'),
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
        onDownloadClick={handleDownloadClick}
      />
    );
  }, [selectedRows.length, filters, searchText, handleRemoveFilters, handleDownloadClick]);

  // Memoize table head cells
  const tableHeadCells = useMemo(
    () => [
      { id: 'accountName', label: t('accountName'), numeric: false, disableSort: false, colWidth: '140px' },
      { id: 'accountNumber', label: t('accountNumber'), numeric: false, disableSort: true, colWidth: '140px' },
      { id: 'serialNumber', label: t('serialNumber'), numeric: false, disableSort: true, colWidth: '50px' },
      { id: 'accountType', label: t('accountType'), numeric: false, disableSort: true, colWidth: '110px' },
      { id: 'accountOwner', label: t('accountOwner'), numeric: false, disableSort: true, colWidth: '110px' },
      { id: 'branchSortCode', label: t('branchSortCode'), numeric: false, disableSort: true, colWidth: '120px' },
      { id: 'bankName', label: t('bankName'), numeric: false, disableSort: true, colWidth: '110px' },
      { id: 'links', label: t('quickLinks'), numeric: false, type: 'link', disableSort: true, colWidth: '110px' },
    ],
    [t],
  );

  // Memoize empty state content
  const emptyStateContent = useMemo(() => (
    <EmptyState
      title={t('noDataAvailable')}
      description={t('noBankingAccountsFound')}
    />
  ), [t]);

  const errorStateContent = useMemo(() => (
    <EmptyState
      title={t('failedToLoad')}
      description={t('failedToLoadDescription')}
      buttonLabel={t('reload')}
      onButtonClick={handleReload}
      icon={
        <Image
          src={ErrorAlertIcon}
          alt="Error icon"
          width={48}
          height={48}
        />
      }
      buttonIcon={
        <Image
          src={ReloadRefreshIcon}
          alt="Reload icon"
          width={20}
          height={20}
        />
      }
      testIdPrefix="banking-accounts-error-state"
    />
  ), [t, handleReload]);

  // Memoize table data
  const tableData = useMemo(
    () => ({
      columns: TABLE_COLUMNS,
      headCells: tableHeadCells,
      rowButton: false,
      rows: mappedRows,
      pageSize: 15,
      rowCount: mappedRows.length,
      rowVariant: 'checkbox',
      hasError: hasError,
      emptyStateContent: hasError ? errorStateContent : emptyStateContent,
    }),
    [tableHeadCells, mappedRows, hasError, errorStateContent, emptyStateContent],
  );

  // Memoize breadcrumb links
  const breadcrumbLinks = useMemo(
    () => [
      { href: '/', label: t('dashboard') },
      { href: '/banking-accounts', label: t('bankingAccounts') },
    ],
    [t],
  );

  // Memoize search input props to prevent focus loss on re-renders - keep it static
  const searchInputProps = useMemo(
    () => ({
      startAdornment: (
        <InputAdornment position="start"><Icon name="search" width='32' height='32' bgColor={theme.palette.navy.main} /></InputAdornment>
      ),
    }),
    [theme],
  );

  return (
    <section className={styles.container} data-testid={buildTestId(testIdPrefix, 'container')}>
      <BreadcrumbList links={breadcrumbLinks} />
      <Grid
        size={12}
        className={styles.headerRow}
        data-testid={buildTestId(testIdPrefix, 'header')}
      >
        <Heading as="h4" fontSize="28px" data-testid={buildTestId(testIdPrefix, 'title')}>
          {t('bankingAccounts')}
        </Heading>
      </Grid>
      <section className={styles.tabContent} data-testid={buildTestId(testIdPrefix, 'content')}>
        <Grid size={12} className={styles.searchRow} data-testid={buildTestId(testIdPrefix, 'search-row')}>
          <Box className={styles.searchFieldContainer}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder={t('searchAccounts')}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              data-testid={buildTestId(testIdPrefix, 'search-input')}
              InputProps={searchInputProps}
              className={styles.searchField}
            />
            {searchText && (
              <span
                onClick={handleClearSearch}
                className={styles.searchClearButton}
                data-testid={buildTestId(testIdPrefix, 'search-clear')}
              >
                <Icon
                  name="close"
                  width='20'
                  height='20'
                  bgColor={theme.palette.grey[400]}
                />
              </span>
            )}
          </Box>
        </Grid>
        <section className={styles.tableContainer} data-testid={buildTestId(testIdPrefix, 'table-container')} ref={tableContainerRef}>
          <Loader loaded={!isLoading} size={40} hideText={false} backgroundColor="transparent">
            <TableWithTab
              tableData={tableData}
              filterButtons={filterButtons}
              selectedRows={selectedRows}
              onCheckboxClick={handleCheckboxClick}
              onRowClick={(rowData: any) => console.log('rowData', rowData)}
              rightPanelButtons={rightPanelButtons}
              onPageChange={handlePageChange}
              onPerPageChange={handlePerPageChange}
              onQuickLinkClick={handleLinkClick}
              data-testid={buildTestId(testIdPrefix, 'table')}
            />
          </Loader>
          <BankingAccountsFilterDialog
            open={filterDialogOpen}
            anchorEl={filterAnchorEl}
            onClose={handleFilterClose}
            onApply={handleFilterApply}
            initialValues={filters}
            data-testid={buildTestId(testIdPrefix, 'filter-dialog')}
          />
          <DownloadBankingAccountsDialog
            open={downloadDialogOpen}
            anchorEl={downloadAnchorEl}
            onClose={handleDownloadClose}
            onDownload={handleDownloadConfirm}
            loading={downloadLoading}
            data-testid={buildTestId(testIdPrefix, 'download-dialog')}
          />
        </section>
      </section>
      {/* Success/Info snackbar */}
      {!isDownloadError && (
        <CommonSnackbar
          open={toastOpen}
          onClose={handleCloseToast}
          message={toastMessage}
          severity={toastSeverity}
          data-testid={buildTestId(testIdPrefix, 'toast')}
        />
      )}
      {/* Error snackbar */}
      {isDownloadError && (
        <CommonSnackbar
          open={toastOpen}
          onClose={handleCloseToast}
          message={toastMessage}
          severity="error"
          data-testid={buildTestId(testIdPrefix, 'error-toast')}
        />
      )}
    </section>
  );
};
export default BankingAccounts;
