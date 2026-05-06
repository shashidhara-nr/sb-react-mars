'use client';
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { CommonSnackbar, ListRightPanelActions } from 'components/common';
import styles from './CreditLimits.module.scss';
import TableWithTab from '@molecules/TableWithTab';
import {
  Box,
  Grid,
  InputAdornment,
  TextField,
  Typography,
  useTheme,
  CircularProgress,
} from '@mui/material';
import { BreadcrumbList } from 'components/lib/Page/Breadcrumb';
import { Heading } from 'components/lib/Page';
import { useRouter } from 'next/navigation';
import { mockCreditLimitsAllRecordsTableData } from '@lib/mock/mockLimits';
import CreditLimitsFilterDialog from './CreditLimitsFilterDialog';
import DeleteConfirmationDialog from 'components/common/DeleteConfirmationDialog';
import DownloadDebtorDialog from '@molecules/DownloadDebtorDialog/DownloadDebtorDialog';
import { Icon } from '@atoms/index';
import { ALL_RECORDS_TABLE_COLUMNS, ALL_RECORDS_TABLE_HEAD_CELLS, DEFAULT_SNACKBAR, TAB_LIST } from './constant';
import { buildTestId } from 'src/utils/testIds';
import { CloseCircle, DownloadIcon, PeopleIcon, SearchIcon } from '@lib/icons';
import EmptyState from 'components/common/EmptyState';
import Image from 'next/image';
import {
  type CreditLimits,
  type CreditLimitFilter,
  type CreditLimitHeaderCell,
  type CreditLimitsAllData,
  type FilterValues,
  type CreditLimitToast,
  type CreditLimitState,
} from 'types/creditLimits';
import dayjs from 'dayjs';

const testIdPrefix = 'credit-limits';

const CreditLimits = () => {
  const t = useTranslations('limits');
  const theme = useTheme();
  const router = useRouter();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);
  const [searchText, setSearchText] = useState('');
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  // const [currentTab, setCurrentTab] = useState('allRecords');
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<CreditLimitFilter>({});
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState<Boolean>(false);
  const [creditLimitsData, setCreditLimitsData] = useState<CreditLimitsAllData>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<CreditLimitToast>(DEFAULT_SNACKBAR);

  // Memoize table head cells
  const allRecordsTableHeadCells = useMemo(() => {
    return ALL_RECORDS_TABLE_HEAD_CELLS.map((cell) => ({
      ...cell,
      label: t(cell.labelKey),
    }));
  }, [t]);

  const [currentTableData, setCurrentTableData] = useState<CreditLimitState>({
    columns: ALL_RECORDS_TABLE_COLUMNS,
    headCells: allRecordsTableHeadCells,
    rowButton: false,
    rows: [],
    pageSize: perPage,
    rowCount: 0,
  });

  // Memoize filtered rows

  const mappedRows = useCallback(
    (data: CreditLimitsAllData, filters: CreditLimitFilter, searchText: string) => {
      let filtered: CreditLimitsAllData = data || [];

      // Apply dialog filters
      if (filters?.creditLimitType) {
        const search = filters.creditLimitType.toLowerCase();
        filtered = filtered.filter(
          (row: CreditLimits) => row?.creditLimitType?.toLowerCase() === search,
        );
      }

      if (filters?.status) {
        const search = filters.status.toLowerCase();
        filtered = filtered.filter(
          (row: CreditLimits) => row?.status?.value?.toLowerCase() === search,
        );
      }

      if (filters?.fromDate) {
        const search = filters.fromDate.toLowerCase();
        filtered = filtered.filter((row: CreditLimits) =>
          row?.fromDate?.toLowerCase().includes(search),
        );
      }

      // Apply search text
      if (searchText.trim().length > 3 || searchText.trim().length === 0) {
        const search = searchText.toLowerCase();
        filtered = filtered.filter((row: CreditLimits) =>
          row?.creditLimitName?.toLowerCase().includes(search),
        );
      }

      return filtered.map((row: CreditLimits) => ({
        ...row,
        fromDate: dayjs(row.fromDate).format('DD/MM/YYYY'),
        toDate: dayjs(row.toDate).format('DD/MM/YYYY'),
        links: {
          href: row?.links?.href || '#',
          text: t(row?.links?.text).toLocaleUpperCase(),
        },
      }));
    },
    [t],
  );

  // Memoize callbacks
  const handleFilterOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setFilterDialogOpen(true);
    setFilterAnchorEl(event.currentTarget);
  }, []);

  const handleFilterClose = useCallback(() => {
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
  }, []);

  const handleFilterApply = useCallback((appliedFilters: FilterValues) => {
    const { limitType = '', status = '', date = '' } = appliedFilters;
    setFilters({
      creditLimitType: limitType,
      status,
      fromDate: date,
    });
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
  }, []);

  const handleDeleteOpen = useCallback(() => {
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteClose = useCallback(() => setDeleteDialogOpen(false), []);

  const handleDownloadOpen = useCallback(() => {
    setDownloadDialogOpen(true);
    setDownloadAnchorEl(tableContainerRef.current);
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
  }, []);

  const handleDownloadClose = useCallback(() => {
    setDownloadDialogOpen(false);
    setFilterDialogOpen(false);
    setDownloadAnchorEl(null);
  }, []);

  const handleDownload = useCallback(({ format, sortBy }: any) => {
    setDownloadDialogOpen(false);
    setDownloadAnchorEl(null);
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
  }, []);

  // const handleCheckboxClick = useCallback(
  //   (rows: any | any[]) => {
  //     const selected = Array.isArray(rows) ? rows : rows ? [rows] : [];

  //     // If "select all" was clicked (array with multiple or zero rows)
  //     if (Array.isArray(rows)) {
  //       if (rows.length === 0) {
  //         // Deselect all - clear everything
  //         setSelectedRows([]);
  //       } else if (rows.length > 1) {
  //         // Select all - limit to current page only
  //         const startIndex = (currentPage - 1) * perPage;
  //         const endIndex = startIndex + perPage;
  //         const currentPageRows = mappedRows.slice(startIndex, endIndex);
  //         const currentPageIds = new Set(currentPageRows.map((r: any) => r.id));

  //         // Only keep selections from current page
  //         const pageSelections = selected.filter((row: any) => currentPageIds.has(row.id));
  //         setSelectedRows(pageSelections);
  //       } else {
  //         // Single row selection/deselection
  //         setSelectedRows(selected);
  //       }
  //     } else {
  //       // Single row click
  //       setSelectedRows(selected);
  //     }
  //   },
  //   [currentPage, perPage, mappedRows],
  // );

  const handleRemoveFilters = useCallback(() => {
    setFilters({});
    setSearchText('');
    setCurrentTableData((pre) => ({ ...pre, rows: creditLimitsData }));
  }, [creditLimitsData]);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    // setSelectedRows([]); // Clear selections when changing pages
  }, []);

  const handlePerPageChange = useCallback((newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
    // setSelectedRows([]); // Clear selections when changing rows per page
  }, []);

  // Memoize filter button
  const filterButtons = useMemo(() => {
    const disabled = creditLimitsData.length === 0 || error;
    return [
      {
        children: (
          <>
            <Image
              src={DownloadIcon}
              alt={t('download')}
              width={24}
              height={24}
              style={{ marginRight: 4 }}
            />
            {t('download')}
          </>
        ),
        buttonVariant: 'tertiary',
        'data-testid': buildTestId(testIdPrefix, 'download-button'),
        onClick: handleDownloadOpen,
        disabled: disabled && currentTableData.rows.length === 0,
      },
      {
        children: (
          <>
            <Icon name="filter" width="24" height="24" bgColor={theme.palette.secondary.main} />
            <Typography variant="button" className={styles.filterText}>
              {t('filter')}
            </Typography>
          </>
        ),
        buttonVariant: 'tertiary' as const,
        onClick: handleFilterOpen,
        disabled,
      },
    ];
  }, [
    handleFilterOpen,
    handleDownloadOpen,
    t,
    theme,
    creditLimitsData,
    error,
    currentTableData.rows,
  ]);

  // Memoize action buttons for right panel
  const rightPanelButtons = useMemo(() => {
    // const count = selectedRows.length;
    const hasFilters = Object.keys(filters).length > 0 || searchText.trim().length > 3;

    return (
      <>
        <ListRightPanelActions
          selectedCount={0}
          hasFilters={hasFilters}
          onRemoveFilters={handleRemoveFilters}
          // onDownloadClick={handleDownloadOpen}
          // onDeleteClick={handleDeleteOpen}
        />
        {/* <Button
          buttonVariant="tertiary"
          data-testid={buildTestId(testIdPrefix, 'download-selected')}
          startIcon={<Image src={DownloadIcon} alt="download" width={24} height={24} />}
          onClick={handleDownloadOpen}
          style={{
            width: '190px',
            height: '36px',
            minWidth: '131px',
            minHeight: '36px',
          }}
        >
          {`Download`}
        </Button> */}
      </>
    );
  }, [
    // selectedRows.length,
    filters,
    searchText,
    handleRemoveFilters,
    // handleDeleteOpen,
    // handleDownloadOpen,
  ]);

  // Memoize table data
  // Helper to generate table data with correct headCells and filtered rows
  // const getTableData = useCallback(
  //   (rows: any[], headCells: any) => ({
  //     columns: ALL_RECORDS_TABLE_COLUMNS,
  //     headCells,
  //     rowButton: false,
  //     rows,
  //     pageSize: perPage,
  //     rowCount: rows.length,
  //     // rowVariant: 'checkbox',
  //   }),
  //   [perPage],
  // );

  // Memoized filtered rows for each tab
  // const allRecordsRows = useMemo(() => mappedRows, [mappedRows]);

  // const needsActionRows = useMemo(
  //   () => mappedRows.filter((row: any) => row?.status?.value === 'Pending'),
  //   [mappedRows],
  // );

  // const activeRows = useMemo(
  //   () => mappedRows.filter((row: any) => row?.status?.value === 'Active'),
  //   [mappedRows],
  // );
  // const inactiveRows = useMemo(
  //   () => mappedRows.filter((row: any) => row?.status?.value === 'Inactive'),
  //   [mappedRows],
  // );

  // Memoized table data for each tab
  // const allRecordsTableData = useMemo(
  //   () => getTableData(allRecordsRows, allRecordsTableHeadCells),
  //   [allRecordsRows, allRecordsTableHeadCells, getTableData],
  // );

  // const needsActionTableData = useMemo(
  //   () => getTableData(needsActionRows, allRecordsTableHeadCells),
  //   [needsActionRows, allRecordsTableHeadCells, getTableData],
  // );

  // const activeTableData = useMemo(
  //   () => getTableData(activeRows, allRecordsTableHeadCells),
  //   [activeRows, allRecordsTableHeadCells, getTableData],
  // );

  // const inactiveTableData = useMemo(
  //   () => getTableData(inactiveRows, allRecordsTableHeadCells),
  //   [inactiveRows, allRecordsTableHeadCells, getTableData],
  // );

  // const [currentTableData, setCurrentTableData] = useState<any>([]);

  const handleTabChange = useCallback(
    (_event: React.SyntheticEvent, newValue: string) => {
      // setCurrentTab(newValue);
      // setSelectedRows([]);
      setCurrentPage(1);
      setFilterDialogOpen(false);
      handleRemoveFilters();
      if (newValue === 'allRecords') {
        setCurrentTableData(currentTableData);
      } else if (newValue === 'needsAction') {
        // setCurrentTableData(needsActionTableData);
      } else if (newValue === 'active') {
        // setCurrentTableData(activeTableData);
      } else if (newValue === 'inactive') {
        // setCurrentTableData(inactiveTableData);
      }
    },
    [
      currentTableData,
      // needsActionTableData,
      // activeTableData,
      // inactiveTableData,
      handleRemoveFilters,
    ],
  );

  const statusTabs = useMemo(() => {
    return TAB_LIST.map((key) => ({ label: t(key), value: key }));
  }, [t]);

  const breadcrumbLinks = useMemo(
    () => [
      { href: '/', label: t('dashboard') },
      { href: '/credit-limits', label: t('creditLimits') },
    ],
    [t],
  );

  const handleLinkClick = useCallback(
    (row: CreditLimits) => {
      router.push(row.links.href);
    },
    [router],
  );

  const handleCloseToast = () => {
    setToast(DEFAULT_SNACKBAR);
  };

  const emptyStateContent = useMemo(() => {
    const hasFilters = Object.keys(filters).length > 0 || searchText.trim().length > 3;

    if (loading) {
      return (
        <Box
        // className={styles['non-trans-audit-approve__loading-overlay']}
        >
          <CircularProgress size={32} />
        </Box>
      );
    }
    if (error) {
      return (
        <EmptyState
          title={t('errorStateTitle')}
          description={t('errorStateDescription')}
          buttonLabel={t('buttonReload')}
          onButtonClick={() => {}}
          icon={
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: '#FEF0F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: '#F04438',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '20px',
                  fontWeight: 'bold',
                }}
              >
                !
              </Box>
            </Box>
          }
          testIdPrefix={testIdPrefix}
        />
      );
    }

    if (creditLimitsData.length === 0) {
      return (
        <EmptyState
          title={t('noCreditLimits')}
          description={''}
          icon={<Image src={PeopleIcon} alt={t('noCreditLimits')} width={32} height={32} />}
        />
      );
    }

    if (currentTableData.rows.length === 0 && hasFilters) {
      return (
        <EmptyState
          title={t('noResultFound')}
          description={t('noResultFoundDesc')}
          icon={<Image src={SearchIcon} alt={t('noResultFound')} width={32} height={32} />}
        />
      );
    }
  }, [currentTableData.rows, error, t, filters, searchText, creditLimitsData, loading]);

  // API Integration - Fetch Credit Limits data
  useEffect(() => {
    const fetchCreditLimits = async () => {
      try {
        // Mock API call with delay to simulate network request
        // Uncomment the line below to simulate API failure for testing
        // throw new Error('API request failed');

        // For now, using mock data
        // setError(false);
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay

        // const data = getTableData(allRecordsRows, allRecordsTableHeadCells);
        // console.log(data);

        setCreditLimitsData(mockCreditLimitsAllRecordsTableData);
        setCurrentTableData((prev: CreditLimitState) => ({
          ...prev,
          rows: mockCreditLimitsAllRecordsTableData,
        }));
      } catch (error) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCreditLimits();
  }, []);

  useEffect(() => {
    const data = mappedRows(creditLimitsData, filters, searchText);
    setCurrentTableData((prevData: any) => ({ ...prevData, rows: data }));
  }, [filters, searchText, creditLimitsData, mappedRows]);

  useEffect(() => {
    setCurrentTableData((prevData: any) => ({ ...prevData, pageSize: perPage }));
  }, [perPage]);

  if (currentTableData.rows)
    return (
      <section className={styles.container}>
        <BreadcrumbList links={breadcrumbLinks} />
        <Grid size={12} className={styles.headerRow}>
          <Heading as="h4" fontSize="28px">
            {t('creditLimits')}
          </Heading>
        </Grid>
        <section className={styles.tabContent}>
          <Grid size={12} className={styles.searchRow}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder={t('searchByCreditLimitName')}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              data-testid={buildTestId(testIdPrefix, 'search-input')}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment
                      position="start"
                      data-testid={buildTestId(testIdPrefix, 'search-input-start-icon')}
                    >
                      <Icon
                        name="search"
                        width="32"
                        height="32"
                        bgColor={theme.palette.navy.main}
                      />
                    </InputAdornment>
                  ),

                  endAdornment: searchText.trim() && (
                    <InputAdornment position="end">
                      <Box
                        data-testid={buildTestId(testIdPrefix, 'search-input-clear-icon')}
                        component="img"
                        src={CloseCircle.src}
                        onClick={() => setSearchText('')}
                        className={styles.closeIconContainer}
                        sx={{ cursor: 'pointer' }}
                      />
                    </InputAdornment>
                  ),

                  // endAdornment: searchText.length > 3 && (
                  //   <InputAdornment
                  //     position="end"
                  //     onClick={() => setSearchText('')}
                  //     data-testid={buildTestId(testIdPrefix, 'search-input-clear-icon')}
                  //   >
                  //     <Icon name="cancel" width="32" height="32" bgColor={theme.palette.navy.main} />
                  //   </InputAdornment>
                  // ),
                },
              }}
              className={styles.searchField}
            />
          </Grid>
          <section className={styles.tableContainer}>
            {/* {loading ? (
              <Box className={styles['non-trans-audit-approve__loading-overlay']}>
                <CircularProgress size={32} />
              </Box>
            ) : ( */}
            <TableWithTab
              tableData={{ ...currentTableData, emptyStateContent }}
              onTabChange={handleTabChange}
              filterButtons={filterButtons}
              selectedRows={[]}
              onCheckboxClick={() => {}}
              onRowClick={(rowData: any) => console.log('rowData', rowData)}
              rightPanelButtons={rightPanelButtons}
              onPageChange={handlePageChange}
              onPerPageChange={handlePerPageChange}
              onQuickLinkClick={handleLinkClick}
              // statusTabs={statusTabs}
              // currentTab={currentTab}
              // selectedRows={[]||selectedRows}
              // onCheckboxClick={handleCheckboxClick}
            />
            {/* )} */}

            <CreditLimitsFilterDialog
              open={filterDialogOpen}
              anchorEl={filterAnchorEl}
              onClose={handleFilterClose}
              onApply={handleFilterApply}
              initialValues={filters}
            />
            <DownloadDebtorDialog
              open={downloadDialogOpen}
              anchorEl={downloadAnchorEl}
              onClose={handleDownloadClose}
              onDownload={handleDownload}
              title={`${t('download')} ${selectedRows.length > 1 ? t('creditLimits') : t('creditLimit')}`}
            />
            <DeleteConfirmationDialog
              open={deleteDialogOpen}
              onClose={handleDeleteClose}
              onPrimaryCTA={handleDeleteClose}
              onSecondaryCTA={handleDeleteClose}
              selectedCount={selectedRows.length}
              itemLabel={
                selectedRows.length === 1
                  ? t('creditLimit')?.toLocaleLowerCase()
                  : t('creditLimits')?.toLocaleLowerCase()
              }
              markedCount={selectedRows.length}
            />
            <CommonSnackbar
              open={toast.open}
              onClose={handleCloseToast}
              message={toast.message}
              severity={toast.severity}
              data-testid={buildTestId(testIdPrefix, 'toast')}
            />
          </section>
        </section>
      </section>
    );
};
export default CreditLimits;
