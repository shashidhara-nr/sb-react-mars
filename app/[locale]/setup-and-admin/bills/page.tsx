'use client';
import { Alert, Box, Grid, InputAdornment, Snackbar, TextField } from '@mui/material';
import { Button, ButtonToggle, Breadcrumb, Heading } from 'dist/standard-bank-react';
import { useTranslations } from 'next-intl';
import DeleteConfirmationDialog from 'components/common/DeleteConfirmationDialog';
import TableContainer from '@molecules/TableContainer/TableContainer';
import { useRouter } from 'next/navigation';
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useAppDispatch } from '@lib/hooks/useAppDispatch';
import Image from 'next/image';
import { AddIcon, Exclamation , AvatarQuestion, CheckCircleIcon, FunnelIcon, SearchIcon, CloseIcon} from 'lib/icons';
import styles from './bills.module.scss';
import FilterBillersDrawer, {
  FilterValues,
} from '@molecules/FilterBillersDrawer/FilterBillersDrawer';
import FilterUpcomingBillsDrawer, {
  FilterUpcomingBillsValues,
} from '@molecules/FilterUpcomingBillsDrawer/FilterUpcomingBillsDrawer';
import { mockUpcomingBills } from 'lib/mock/mockBills';
import { ListRightPanelActions } from 'components/common';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { resetBiller } from '@store/slices/createBillerSlice';
import { buildTestId } from 'src/utils/testIds';
import { useBillers } from '@lib/hooks/useBillers';
import {
  BILLER_TAB_STATUS_MAP,
  BILLER_TABLE_COLUMNS,
  BILLER_TABLE_HEAD_CELLS,
  UPCOMING_TABLE_COLUMNS,
  UPCOMING_TABLE_HEAD_CELLS,
  getTabsConfig,
  getBreadcrumbsWithTranslation,
  getTranslatedDeleteMessage,
  getTranslatedPayMessage,
  getTranslatedDeclineMessage,
  getTranslatedSnackbarMessage,
} from './BillsHelper';

const BillsPage = () => {
  const testIdPrefix = 'bills-hub';
  const t = useTranslations('billsHubData');
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { allBills, getAllBills } = useBillers();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'billers' | 'upcoming'>('billers');
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [filterValues, setFilterValues] = useState<Partial<FilterValues>>({});
  const [upcomingBillsFilterValues, setUpcomingBillsFilterValues] = useState<Partial<FilterUpcomingBillsValues>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);

  useEffect(() => {
    getAllBills();
  }, []);

  // Mode change handler
  const handleModeChange = useCallback(
    (_event: React.MouseEvent<HTMLElement>, value: string | null) => {
      if (value === 'billers' || value === 'upcoming') {
        setMode(value);
        setSelectedTab(0); // Reset to first tab when switching modes
        setSelectedRows([]); // Clear selections when switching modes
        setSearchText(''); // Clear search when switching modes
        setFilterValues({}); // Clear filters when switching modes
        setUpcomingBillsFilterValues({}); // Clear upcoming bills filters when switching modes
      }
    },
    [],
  );

  // Memoize callbacks
  const handleFilterClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setFilterDrawerOpen(true);
    setFilterAnchorEl(event.currentTarget);
  }, []);

  const handleFilterClose = useCallback(() => {
    setFilterDrawerOpen(false);
    setFilterAnchorEl(null);
  }, []);

  const handleFilterApply = useCallback((values: Partial<FilterValues>) => {
    setFilterValues(values);
    setFilterDrawerOpen(false);
    setFilterAnchorEl(null);
  }, []);

  const handleUpcomingBillsFilterApply = useCallback((values: Partial<FilterUpcomingBillsValues>) => {
    setUpcomingBillsFilterValues(values);
    setFilterDrawerOpen(false);
    setFilterAnchorEl(null);
  }, []);

  const handleDeleteDismiss = useCallback(() => {
    setDeleteDialogOpen(false);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    setDeleteDialogOpen(false);
    setSnackbarMessage(getTranslatedSnackbarMessage(t, 'delete', mode));
    setSnackbarOpen(true);
    setSelectedRows([]);
  }, [mode, t]);

  const handleCreateClick = useCallback(() => {
    dispatch(resetBiller());
    router.push('/setup-and-admin/bills/create' as any);
  }, [dispatch, router]);

  const handleRemoveFilters = useCallback(() => {
    setFilterValues({});
    setUpcomingBillsFilterValues({});
    setSearchText('');
  }, []);

  const handlePayClick = useCallback(() => {
    setPayDialogOpen(true);
  }, []);

  const handlePayConfirm = useCallback(() => {
    // Handle pay action for selected bills
    console.log('Pay bills:', selectedRows);
    setPayDialogOpen(false);
    setSelectedRows([]);
    setSnackbarMessage(getTranslatedSnackbarMessage(t, 'pay'));
    setSnackbarOpen(true);
  }, [selectedRows, t]);

  const handleDeclineClick = useCallback(() => {
    setDeclineDialogOpen(true);
  }, []);

  const handleDeclineConfirm = useCallback(() => {
    // Handle decline action for selected bills
    console.log('Decline bills:', selectedRows);
    setDeclineDialogOpen(false);
    setSelectedRows([]);
    setSnackbarMessage(getTranslatedSnackbarMessage(t, 'decline'));
    setSnackbarOpen(true);
  }, [selectedRows, t]);

  // Memoize filtered rows
  const filteredRows = useMemo(() => {
    const searchLower = searchText.trim().toLowerCase();

    if (mode === 'billers') {
      return allBills.filter((row) => {
        // Tab filter
        if (selectedTab !== 0 && row.status.value !== BILLER_TAB_STATUS_MAP[selectedTab])
          return false;

        // Drawer filters
        if (
          filterValues.billerName &&
          !(
            row.billerName?.name?.toLowerCase().includes(filterValues.billerName.toLowerCase())
          )
        )
          return false;
        if (
          filterValues.billerCode &&
          !(
            row.billerName?.billerCode?.toLowerCase().includes(filterValues.billerCode.toLowerCase())
          )
        )
          return false;
        if (filterValues.countryRegion && row.countryRegion !== filterValues.countryRegion)
          return false;
        if (filterValues.status && row.status.value !== filterValues.status) return false;

        // Search filter
        if (
          searchLower &&
          !(
            row.billerName?.name?.toLowerCase().includes(searchLower) ||
            row.billerId.toLowerCase().includes(searchLower)
          )
        )
          return false;

        return true;
      });
    } else {
      // Upcoming bills mode
      return mockUpcomingBills.filter((row) => {
        // No tab filter for upcoming bills (only All records)

        // Drawer filters
        if (
          upcomingBillsFilterValues.billerName &&
          !row.billerName.toLowerCase().includes(upcomingBillsFilterValues.billerName.toLowerCase())
        )
          return false;
        if (
          upcomingBillsFilterValues.billerId &&
          !row.billId.toLowerCase().includes(upcomingBillsFilterValues.billerId.toLowerCase())
        )
          return false;
        if (upcomingBillsFilterValues.countryRegion && row.countryRegion !== upcomingBillsFilterValues.countryRegion)
          return false;
        if (upcomingBillsFilterValues.dueDate) {
          // Parse the filter date and normalize to start of day
          const filterDate = new Date(upcomingBillsFilterValues.dueDate);
          filterDate.setHours(0, 0, 0, 0);
          
          // Parse row.dueDate (format: DD/MM/YYYY)
          const [day, month, year] = row.dueDate.split('/').map(Number);
          const rowDate = new Date(year, month - 1, day);
          rowDate.setHours(0, 0, 0, 0);
          
          // Compare dates
          if (rowDate.getTime() !== filterDate.getTime()) return false;
        }

        // Search filter
        if (
          searchLower &&
          !(
            row.billerName.toLowerCase().includes(searchLower) ||
            row.billId.toLowerCase().includes(searchLower) ||
            row.reference.toLowerCase().includes(searchLower)
          )
        )
          return false;

        return true;
      });
    }
  }, [selectedTab, filterValues, upcomingBillsFilterValues, searchText, mode, allBills]);

  const handleCheckboxClick = useCallback(
    (rows: unknown) => {
      let selected: any[] = [];
      if (Array.isArray(rows)) {
        selected = rows;
      } else if (rows) {
        selected = [rows as any];
      }

      // If "select all" was clicked (array with multiple or zero rows)
      if (Array.isArray(rows)) {
        if (rows.length === 0) {
          // Deselect all - clear everything
          setSelectedRows([]);
        } else if (rows.length > 1) {
          // Select all - limit to current page only
          const startIndex = (currentPage - 1) * perPage;
          const endIndex = startIndex + perPage;
          const currentPageRows = filteredRows.slice(startIndex, endIndex);
          const currentPageIds = new Set(currentPageRows.map((r) => r.id));

          // Only keep selections from current page
          const pageSelections = selected.filter((row) => currentPageIds.has(row.id));
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
    [currentPage, perPage, filteredRows],
  );

  // Memoize filter button
  const filterButtons = useMemo(() => {
    return [
      {
        children: (
          <>
            <Image
              src={FunnelIcon}
              alt="filter"
              width={16}
              height={16}
              className={styles.filterIcon}
            />
            {t('buttonFilter')}
          </>
        ),
        buttonVariant: 'tertiary',
        onClick: handleFilterClick,
        buttonProps: {
          'data-testid': buildTestId(testIdPrefix, 'button-filter'),
          'aria-label': 'Filter billers'
        },
      },
    ];
  }, [handleFilterClick, t, testIdPrefix]);

  // Memoize action buttons for right panel
  const rightPanelButtons = useMemo(() => {
    const count = selectedRows.length;
    const hasFilters = (mode === 'billers' && (Object.keys(filterValues).length > 0 || searchText.trim().length > 0)) || (mode === 'upcoming' && (Object.keys(upcomingBillsFilterValues).length > 0 || searchText.trim().length > 0));

    // In billers mode, Delete must not be available on the "Need action" tab.
    // Tabs are defined in BillsHelper.ts: BILLER_STATUS_TABS[1] = "Need action".
    const canDeleteSelectedBillers = mode === 'billers' && selectedTab !== 1;

    if (mode === 'billers') {
      return (
        <ListRightPanelActions
          selectedCount={count}
          hasFilters={hasFilters}
          onRemoveFilters={handleRemoveFilters}
          onDeleteClick={canDeleteSelectedBillers ? () => setDeleteDialogOpen(true) : undefined}
        />
      );
    }
    
    // For upcoming bills, show PAY and DECLINE options
    if (count === 0 && !hasFilters) return null;
    
    return (
      <Box className={styles.panelActions}>
        {count > 0 && (
          <>
            <Box
              component="span"
              onClick={handlePayClick}
              className={styles.actionButton}
            >
              <CheckCircleOutlineIcon className={styles.actionIcon} />
              {t('buttonPay')} ({count})
            </Box>
            <Box
              component="span"
              onClick={handleDeclineClick}
              className={styles.actionButton}
            >
              <CancelOutlinedIcon className={styles.actionIcon} />
              {t('buttonDecline')} ({count})
            </Box>
          </>
        )}
        {hasFilters && (
          <Box
            component="span"
            onClick={handleRemoveFilters}
            className={styles.removeFiltersButton}
          >
            <Image src={CloseIcon} alt="close" width={16} height={16} />
            {t('buttonRemoveFilters')}
          </Box>
        )}
      </Box>
    );
  }, [selectedRows.length, filterValues, upcomingBillsFilterValues, searchText, handleRemoveFilters, handlePayClick, handleDeclineClick, mode, selectedTab, t]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tableData = useMemo(
    () => {
      // For billers mode, flatten billerName to plain text (no secondary biller code line).
      // For upcoming bills, split links into separate columns.
      let rows = filteredRows;
      if (mode === 'billers') {
        rows = filteredRows.map((row: any) => ({
          ...row,
          billerName: row?.billerName?.name ?? '',
        }));
      } else if (mode === 'upcoming') {
        rows = filteredRows.map((row: any) => ({
          ...row,
          payLink: row.allLinks?.[0] || row.links,
          declineLink: row.allLinks?.[1] || null,
        }));
      }

      return {
        columns: mode === 'billers' ? BILLER_TABLE_COLUMNS : UPCOMING_TABLE_COLUMNS,
        headCells: mode === 'billers' ? BILLER_TABLE_HEAD_CELLS : UPCOMING_TABLE_HEAD_CELLS,
        rowButton: true,
        rows,
        pageSize: perPage,
        rowCount: rows.length,
      };
    },
    [filteredRows, mode, perPage],
  );

  // Handle pagination changes to track current page
  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    setSelectedRows([]); // Clear selections when changing pages
  }, []);

  const handlePerPageChange = useCallback((newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
    setSelectedRows([]); // Clear selections when changing rows per page
  }, []);

  // Determine if there's an active search or filter
  const hasActiveSearchOrFilter = useMemo(() => {
    const hasSearch = searchText.trim().length > 0;
    const hasFilters = mode === 'billers' 
      ? Object.keys(filterValues).length > 0 
      : Object.keys(upcomingBillsFilterValues).length > 0;
    return hasSearch || hasFilters;
  }, [searchText, filterValues, upcomingBillsFilterValues, mode]);

  // Determine if initial data exists (before filtering)
  const initialDataExists = useMemo(() => {
    return mode === 'billers' ? allBills.length > 0 : mockUpcomingBills.length > 0;
  }, [mode, allBills]);

  // Create appropriate empty state content
  const emptyStateContent = useMemo(() => {
    const isEmpty = filteredRows.length === 0;
    
    if (!isEmpty) return undefined;

    // If no initial data exists, show "no data created" message
    if (!initialDataExists) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Box sx={{ mb: 1, fontSize: '16px', fontWeight: 500 }}>
            {mode === 'billers' ? t('emptyStateNoData') : t('emptyStateNoBills')}
          </Box>
          <Box sx={{ fontSize: '14px', color: '#666' }}>
            {mode === 'billers' ? t('emptyStateNoDataDescription') : t('emptyStateNoBillsDescription')}
          </Box>
        </Box>
      );
    }

    // If there is initial data but filtered results are empty, show "no results" message
    if (hasActiveSearchOrFilter) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Box sx={{ mb: 1, fontSize: '16px', fontWeight: 500 }}>
            {t('emptyStateNoResults')}
          </Box>
          <Box sx={{ fontSize: '14px', color: '#666' }}>
            {t('emptyStateNoResultsDescription')}
          </Box>
        </Box>
      );
    }

    // Default empty state
    return undefined;
  }, [filteredRows.length, initialDataExists, hasActiveSearchOrFilter, mode, t]);

  // Handle link click for manage biller, send reminder, pay bill, or decline bill
  const handleLinkClick = useCallback(
    (row: any, index: number, link: any) => {
      if (!row || !link) return;

      const linkText = link.text || '';
      const linkHref = link.href || '';

      // Handle specific action types
      if (linkText === 'MANAGE BILLER') {
        const billerId = row?.billerId;
        router.push(`/setup-and-admin/bills/manage?billerId=${encodeURIComponent(String(billerId || ''))}` as any);
      } else if (linkText === 'SEND REMINDER') {
        // Do nothing for now
        return;
      } else if (linkText === 'PAY BILL') {
        setSelectedRows([row]);
        setPayDialogOpen(true);
        return;
      } else if (linkText === 'DECLINE BILL') {
        setSelectedRows([row]);
        setDeclineDialogOpen(true);
        return;
      } else if (linkHref) {
        // Fallback to href if available
        router.push(linkHref);
      }
    },
    [router],
  );

  return (
    <>
      <Grid container spacing={4} className={styles.container} data-testid={buildTestId(testIdPrefix, 'page')}>
        <Grid size={12}>
          <Breadcrumb 
            links={getBreadcrumbsWithTranslation(t, 'main')} 
            data-testid={buildTestId(testIdPrefix, 'breadcrumbs')}
          />
        </Grid>
        <Grid
          size={12}
          className={styles.headerSection}
        >
          <Heading 
            as="h4" 
            fontSize="28px"
            data-testid={buildTestId(testIdPrefix, 'heading')}
          >
            {t('pageHeadingBills')}
          </Heading>
          <Box className={styles.buttonWrapper}>
            <Button
              data-testid={buildTestId(testIdPrefix, 'button-add-biller')}
              aria-label="Add biller"
              buttonVariant="secondary"
              startIcon={<Image src={AddIcon} alt="addicon" width={24} height={24} />}
              className={styles.addButton}
              onClick={handleCreateClick}
            >
              {t('buttonAddBiller')}
            </Button>
          </Box>
        </Grid>
        {/* <Grid size={12}>
          <Box className={styles.toggleBox}>
            <ButtonToggle
              initialSelected={mode === 'billers' ? 0 : 1}
              fullWidth={false}
              buttons={[
                { children: t('tabBillers'), toggleValue: 'billers' },
                { children: t('tabUpcomingBills'), toggleValue: 'upcoming' },
              ]}
              onChange={handleModeChange}
            />
          </Box>
        </Grid> */}
        <Grid size={12} className={styles.searchGrid}>
          <TextField
            data-testid={buildTestId(testIdPrefix, 'input-search')}
            fullWidth
            variant="outlined"
            placeholder={t('searchPlaceholder')}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Image src={SearchIcon} alt="search" width={20} height={20} />
                  </InputAdornment>
                ),
              },
            }}
            className={styles.searchField}
          />
        </Grid>
        <Grid
          size={12}
          className={styles.tableGrid}
          ref={tableContainerRef}
        >
          <Box className={styles.tableWrapper}>
            <TableContainer
              hasLoadError={false}
              onReload={()=>{}}
              testIdPrefix={buildTestId(testIdPrefix, 'table')}
              tableData={tableData}
              filterButtons={filterButtons}
              rightPanelContent={rightPanelButtons}
              onCheckboxClick={handleCheckboxClick}
              selectedRows={selectedRows}
              showTabs={true}
              hideTabsWhenEmpty={false}
              tabs={getTabsConfig(mode)}
              selectedTab={selectedTab}
              onTabChange={setSelectedTab}
              tabsContainerSx={{ backgroundColor: '#F8F8FA', borderRadius: 0 }}
              tableStyle={{}}
              onPageChange={handlePageChange}
              onPerPageChange={handlePerPageChange}
              onQuickLinkClick={handleLinkClick}
              serverSidePagination={true}
              totalRecords={filteredRows.length}
              currentPage={currentPage}
              perPage={perPage}
              emptyStateContent={emptyStateContent}
            />
          </Box>
        </Grid>
      </Grid>
      {mode === 'billers' ? (
        <FilterBillersDrawer
          open={filterDrawerOpen}
          anchorEl={filterAnchorEl}
          onClose={handleFilterClose}
          onApply={handleFilterApply}
          initialValues={filterValues}
        />
      ) : (
        <FilterUpcomingBillsDrawer
          open={filterDrawerOpen}
          anchorEl={filterAnchorEl}
          onClose={handleFilterClose}
          onApply={handleUpcomingBillsFilterApply}
          initialValues={upcomingBillsFilterValues}
        />
      )}
      <DeleteConfirmationDialog
        testIdPrefix={buildTestId(testIdPrefix, 'delete-dialog')}
        open={deleteDialogOpen}
        onClose={handleDeleteDismiss}
        onPrimaryCTA={handleDeleteConfirm}
        onSecondaryCTA={handleDeleteDismiss}
        selectedCount={selectedRows.length}
        exclamationIcon={Exclamation}
        itemLabel={mode === 'billers' ? t('deleteItemTypeBillers') : t('deleteItemTypeBills')}
        markedCount={selectedRows.length}
        message={getTranslatedDeleteMessage(t, selectedRows.length, mode)}
      />
      <DeleteConfirmationDialog
        testIdPrefix={buildTestId(testIdPrefix, 'pay-dialog')}
        open={payDialogOpen}
        onClose={() => setPayDialogOpen(false)}
        onPrimaryCTA={handlePayConfirm}
        onSecondaryCTA={() => setPayDialogOpen(false)}
        selectedCount={selectedRows.length}
        exclamationIcon={AvatarQuestion}
        title={t('payBillDialogTitle')}
        name={t('payBillDialogTitle')}
        primaryCTALabel={t('buttonPay').toUpperCase() + ' ' + t('pageHeadingBills')}
        secondaryCTALabel="DISMISS"
        messageFontWeight={600}
        message={getTranslatedPayMessage(t, selectedRows.length)}
      />
      <DeleteConfirmationDialog
        testIdPrefix={buildTestId(testIdPrefix, 'decline-dialog')}
        open={declineDialogOpen}
        onClose={() => setDeclineDialogOpen(false)}
        onPrimaryCTA={handleDeclineConfirm}
        onSecondaryCTA={() => setDeclineDialogOpen(false)}
        selectedCount={selectedRows.length}
        exclamationIcon={AvatarQuestion}
        title={t('declinePaymentDialogTitle')}
        name={t('declinePaymentDialogTitle')}
        primaryCTALabel={t('buttonDecline').toUpperCase() + ' THE BILL'}
        secondaryCTALabel="DISMISS"
        messageFontWeight={600}
        message={getTranslatedDeclineMessage(t, selectedRows.length)}
      />
      <Snackbar
        data-testid={buildTestId(testIdPrefix, 'snackbar')}
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ mt: 8 }}
      >
        <Alert
          data-testid={buildTestId(testIdPrefix, 'snackbar-alert')}
          icon={<Image src={CheckCircleIcon} alt="success" width={20} height={20} />}
          severity="success"
          className={styles.successAlert}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default BillsPage;
