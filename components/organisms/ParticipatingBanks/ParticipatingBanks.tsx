'use client';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import styles from './ParticipatingBanks.module.scss';
import { Grid, InputAdornment, TextField, Typography, useTheme, Box } from '@mui/material';
import Image from 'next/image';
import { BreadcrumbList } from 'components/lib/Page/Breadcrumb';
import { Heading } from 'components/lib/Page';
import TableWithTab from '@molecules/TableWithTab';
import { ListRightPanelActions } from 'components/common';
import EmptyState from 'components/common/EmptyState';
import { useRouter } from 'next/navigation';
import { mockParticipatingBanksData } from '@lib/mock/mockParticipatingBanks';
import ParticipatingBanksFilterDialog from './ParticipatingBanksFilterDialog';
import { Icon } from '@atoms/index';
import { CloseCircle, ErrorAlertIcon, ReloadRefreshIcon, SearchIcon } from 'lib/icons';

const TABLE_COLUMNS = [
  'participatingBankName',
  'branchSortCode',
  'bicSwift',
  'serviceType',
  { key: 'status', type: 'chip' },
] as const;

const ParticipatingBanks = () => {
  const t = useTranslations('participatingBanks');
  const theme = useTheme();
  const [searchText, setSearchText] = useState('');
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [hasError, setHasError] = useState<boolean>(false);
  const [participatingBanksData, setParticipatingBanksData] = useState<any[]>(mockParticipatingBanksData);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // API Integration - Fetch participating banks data
  useEffect(() => {
    const fetchBanksData = async () => {
      try {
        // Mock API call with delay to simulate network request
        // Uncomment the line below to simulate API failure for testing
        // throw new Error('API request failed');

        // For now, using mock data
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        setParticipatingBanksData(mockParticipatingBanksData);
        setHasError(false);
      } catch (error) {
        console.error('Failed to load participating banks data:', error);
        setHasError(true);
        // Clear data on error to show error state
        setParticipatingBanksData([]);
      }
    };

    fetchBanksData();
  }, [retryCount]);

  // Memoize filtered rows
  const mappedRows = useMemo(() => {
    let filtered = participatingBanksData;

    // Apply dialog filters
    if (filters.serviceType) {
      const search = filters.serviceType.toLowerCase();
      filtered = filtered.filter((row: any) =>
        row.serviceType?.toLowerCase().includes(search)
      );
    }
    if (filters.status) {
      filtered = filtered.filter((row: any) =>
        row.status?.value?.toLowerCase() === filters.status?.toLowerCase()
      );
    }

    // Apply search text (minimum 3 characters)
    if (searchText.trim().length >= 3) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        (row: any) =>
          row?.participatingBankName?.toLowerCase().includes(search) ||
          row?.branchSortCode?.toLowerCase().includes(search) ||
          row?.bicSwift?.toLowerCase().includes(search) ||
          row?.serviceType?.toLowerCase().includes(search) ||
          row?.status?.value?.toLowerCase().includes(search),
      );
    }

    const withAccountDetails = filtered.map((row: any) => ({
      ...row
    }));

    return withAccountDetails;
  }, [filters, searchText, participatingBanksData]);

  // Memoize callbacks
  const handleFilterOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setFilterDialogOpen(true);
    setFilterAnchorEl(event.currentTarget);
  }, []);

  const handleFilterClose = useCallback(() => {
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
  }, []);

  const handleFilterApply = useCallback((appliedFilters: any) => {
    setFilters(appliedFilters);
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
  }, []);

  const handleRemoveFilters = useCallback(() => {
    setFilters({});
    setSearchText('');
  }, []);

  const handleReload = useCallback(() => {
    setRetryCount(prev => prev + 1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const handlePerPageChange = useCallback((newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  }, []);

  // Handle link click for manage beneficiary
  const handleLinkClick = useCallback((row: any, index: number, link: any) => {
    console.log('Link clicked:', { row, index, link });
    router.push(row?.links?.href || '#');
  }, [router]);

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
        'data-testid': 'participating-banks-filter-button',
      },
    ];
  }, [handleFilterOpen, t, theme]);

  // Memoize action buttons for right panel
  const rightPanelButtons = useMemo(() => {
    const hasFilters = Object.keys(filters).length > 0;

    return (
      <ListRightPanelActions
        selectedCount={0}
        hasFilters={hasFilters}
        onRemoveFilters={handleRemoveFilters}
      />
    );
  }, [filters, handleRemoveFilters]);

  // Memoize table head cells
  const tableHeadCells = useMemo(
    () => [
      { id: 'participatingBankName', label: t('participatingBankName'), numeric: false },
      { id: 'branchSortCode', label: t('branchSortCode'), numeric: false, disableSort: true },
      { id: 'bicSwift', label: t('bicSwift'), numeric: false, disableSort: true },
      { id: 'serviceType', label: t('serviceType'), numeric: false, disableSort: true },
      { id: 'status', label: t('status'), numeric: false, type: 'chip', disableSort: true },
    ],
    [t],
  );

  // Memoize empty state content
  const emptyStateContent = useMemo(() => (
    <EmptyState
      title={t('noResultsFound')}
      description={t('noResultsDescription')}
      icon={
        <Image src={SearchIcon} alt="No results icon" width={48} height={48} />
      }
      testIdPrefix="participating-banks"
    />
  ), [t]);

  // Memoize error state content
  const errorStateContent = useMemo(() => (
    <EmptyState
      title={t('failedToLoad')}
      description={t('failedToLoadDescription')}
      buttonLabel={t('reload')}
      onButtonClick={handleReload}
      icon={
        <Image src={ErrorAlertIcon} alt="Error icon" width={48} height={48} />
      }
      buttonIcon={
        <Image src={ReloadRefreshIcon} alt="Reload icon" width={20} height={20} />
      }
      testIdPrefix="participating-banks"
    />
  ), [t, handleReload]);

  // Memoize table data
  const tableData = useMemo(
    () => ({
      columns: TABLE_COLUMNS,
      headCells: tableHeadCells,
      rowButton: false,
      rows: mounted ? mappedRows : [],
      pageSize: 15,
      rowCount: mounted ? mappedRows.length : 0,
      rowVariant: 'default',
      emptyStateContent: hasError ? errorStateContent : emptyStateContent,
      'data-testid': 'participating-banks-table-data',
    }),
    [tableHeadCells, mappedRows, mounted, hasError, errorStateContent, emptyStateContent],
  );

  // Memoize breadcrumb links
  const breadcrumbLinks = useMemo(
    () => [
      { href: '/', label: t('dashboard') },
      { href: '/participating-banks', label: t('participatingBanks') },
    ],
    [t],
  );

  return (
    <section className={styles.container} data-testid="participating-banks-container">
      <BreadcrumbList links={breadcrumbLinks} data-testid="participating-banks-breadcrumb" />
      <Grid
        size={12}
        className={styles.headerRow}
        data-testid="participating-banks-header-row"
      >
        <Heading as="h4" fontSize="28px" data-testid="participating-banks-title">
          {t('participatingBanks')}
        </Heading>
      </Grid>
      <section className={styles.tabContent} data-testid="participating-banks-tab-content">
        <Grid size={12} className={styles.searchRow} data-testid="participating-banks-search-row">
          <TextField
            fullWidth
            variant="outlined"
            placeholder={t('searchPlaceholder')}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            inputProps={{ 'data-testid': 'participating-banks-search-input' }}
            InputProps={
              {
                startAdornment: (
                  <InputAdornment position="start"><Icon name="search" width='32' height='32' bgColor={theme.palette.navy.main} /></InputAdornment>
                ),
                ...(searchText.trim() && {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Box
                        component="img"
                        src={CloseCircle.src}
                        onClick={() => setSearchText('')}
                        className={styles.closeIconContainer}
                        data-testid="participating-banks-search-clear-button"
                      />
                    </InputAdornment>
                  ),
                }),
              }
            }
            className={styles.searchField}
          />
        </Grid>
        <section className={styles.tableContainer} data-testid="participating-banks-table-container">
          <TableWithTab
            tableData={tableData}
            filterButtons={filterButtons}
            selectedRows={[]}
            onCheckboxClick={() => { }}
            onRowClick={(rowData: any) => console.log('rowData', rowData)}
            rightPanelButtons={rightPanelButtons}
            onPageChange={handlePageChange}
            onPerPageChange={handlePerPageChange}
            onQuickLinkClick={handleLinkClick}
            data-testid="participating-banks-table"
          />
          <ParticipatingBanksFilterDialog
            open={filterDialogOpen}
            anchorEl={filterAnchorEl}
            onClose={handleFilterClose}
            onApply={handleFilterApply}
            initialValues={filters}
            data-testid="participating-banks-filter-dialog"
          />
        </section>
      </section>
    </section>
  );
};
export default ParticipatingBanks;
