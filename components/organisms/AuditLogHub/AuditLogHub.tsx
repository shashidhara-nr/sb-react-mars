'use client';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import styles from './AuditLogHub.module.scss';
import {
  Grid,
  InputAdornment,
  TextField,
  Typography,
  useTheme,
  Box,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Popper,
  Paper,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import InfoIcon from '@mui/icons-material/Info';
import Image from 'next/image';
import { BreadcrumbList } from 'components/lib/Page/Breadcrumb';
import { Heading } from 'components/lib/Page';
import TableWithTab from '@molecules/TableWithTab';
import { ListRightPanelActions } from 'components/common';
import EmptyState from 'components/common/EmptyState';
import { useRouter } from 'next/navigation';
import { mockAuditLogHubData } from '@lib/mock/mockAuditLogHub';
import AuditLogHubFilterDialog from './AuditLogHubFilterDialog';
import { Icon } from '@atoms/index';
import { Button } from 'components/lib/Forms';
import { CloseCircle, SearchIcon, ErrorAlertIcon, ReloadRefreshIcon, IcnInfoCircleBlack } from 'lib/icons';
import { he } from 'zod/v4/locales';

const TABLE_COLUMNS = [
  'entityName',
  'entityType',
  'function',
  'username',
  'userId',
  'userAccount',
  'dateTime',
  { key: 'links', type: 'link' }
] as const;

const AuditLogHub = () => {
  const t = useTranslations('auditLogHub');
  const theme = useTheme();
  const [searchText, setSearchText] = useState('');
  const [startDate, setStartDate] = useState<any>(null);
  const [endDate, setEndDate] = useState<any>(null);
  const [dateRangeAnchorEl, setDateRangeAnchorEl] = useState<null | HTMLElement>(null);
  const [entityType, setEntityType] = useState('');
  const [hideSearch, setHideSearch] = useState(false);
  const [hideView, setHideView] = useState(false);
  const router = useRouter();
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [hasError, setHasError] = useState<boolean>(false);
  const [auditLogsData, setAuditLogsData] = useState<any[]>(mockAuditLogHubData);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [mounted, setMounted] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // API Integration - Fetch audit logs data
  useEffect(() => {
    const fetchLogsData = async () => {
      try {
        // Mock API call with delay to simulate network request
        await new Promise(resolve => setTimeout(resolve, 500));
        // Uncomment the line below to simulate API failure for testing
        //throw new Error('API request failed');
        setAuditLogsData(mockAuditLogHubData);
        setHasError(false);
      } catch (error) {
        console.error('Failed to load audit logs data:', error);
        setHasError(true);
        setAuditLogsData([]);
      }
    };

    fetchLogsData();
  }, [retryCount]);

  // Memoize filtered rows
  const mappedRows = useMemo(() => {
    let filtered = auditLogsData;

    // Apply function filter from dialog
    if (filters.functionParam && filters.functionParam !== '' && filters.functionParam !== 'all') {
      filtered = filtered.filter((row: any) => row.function === filters.functionParam);
    }

    // Apply search text - search across entityName, username, userId, userAccount
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        (row: any) =>
          row?.entityName?.toLowerCase().includes(search) ||
          row?.username?.toLowerCase().includes(search) ||
          row?.userId?.toLowerCase().includes(search) ||
          row?.userAccount?.toLowerCase().includes(search),
      );
    }

    const withAccountDetails = filtered.map((row: any) => ({
      ...row,
      links: {
        href: row?.links?.href || '#',
        text: t(row?.links?.text).toLocaleUpperCase()
      }
    }));

    return withAccountDetails;
  }, [filters, searchText, entityType, t, auditLogsData]);

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

  const handleDateRangeOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setDateRangeAnchorEl(event.currentTarget);
  }, []);

  const handleDateRangeClose = useCallback(() => {
    setDateRangeAnchorEl(null);
  }, []);

  const handleRemoveFilters = useCallback(() => {
    setFilters({});
    setSearchText('');
    setStartDate(null);
    setEndDate(null);
    setEntityType('');
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
    router.push(link.href);
  }, [router]);

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
      },
    ];
  }, [handleFilterOpen, t, theme]);

  // Memoize empty state content (no data yet)
  const noDataYetContent = useMemo(() => (
    <EmptyState
      title={t('noDataYet')}
      description={t('noDataYetDescription')}
      icon={
        <Image
          src={IcnInfoCircleBlack}
          alt={t('noDataYet')}
          width={48}
          height={48}
        />
      }

      testIdPrefix="audit-log-hub"
    />
  ), [t]);

  // Memoize empty state content (no results found)
  const emptyStateContent = useMemo(() => (
    <EmptyState
      title={t('noResultsFound')}
      description={t('noResultsDescription')}
      icon={
        <Image
          src={SearchIcon}
          alt={t('noResultsFound')}
          width={48}
          height={48}
        />
      }
      testIdPrefix="audit-log-hub"
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
      testIdPrefix="audit-log-hub"
    />
  ), [t, handleReload]);

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

  // Memoize table head cells
  const tableHeadCells = useMemo(
    () => [
      { id: 'entityName', label: t('entityName'), numeric: false },
      { id: 'entityType', label: t('entityType'), numeric: false, disableSort: true },
      { id: 'function', label: t('function'), numeric: false, disableSort: true },
      { id: 'username', label: t('username'), numeric: false, disableSort: true },
      { id: 'userId', label: t('userId'), numeric: false, disableSort: true },
      { id: 'userAccount', label: t('userAccount'), numeric: false, disableSort: true },
      { id: 'dateTime', label: t('dateTime'), numeric: false, disableSort: true },
      { id: 'links', label: t('quickLinks'), numeric: false, disableSort: true },
    ],
    [t],
  );

  // Memoize table data
  const tableData = useMemo(
    () => ({
      columns: TABLE_COLUMNS,
      headCells: tableHeadCells,
      rowButton: false,
      rows: mounted ? mappedRows : [],
      pageSize: 15,
      rowCount: mounted ? mappedRows.length : 0,
      rowVariant: 'checkbox',
      emptyStateContent: hasError ? errorStateContent : (!hasSearched ? noDataYetContent : emptyStateContent),
    }),
    [tableHeadCells, mappedRows, mounted, hasError, errorStateContent, noDataYetContent, emptyStateContent, hasSearched],
  );

  // Memoize breadcrumb links
  const breadcrumbLinks = useMemo(
    () => [
      { href: '/', label: t('dashboard') },
      { href: '/audit-log-hub', label: t('auditLog') },
    ],
    [t],
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <section className={styles.container}>
        <BreadcrumbList links={breadcrumbLinks} />
        <Grid
          size={12}
          className={styles.headerRow}
        >
          <Heading as="h4" fontSize="28px">
            {t('auditLogs')}
          </Heading>
        </Grid>
        <section className={styles.tabContent}>
          {!hideSearch && (
            <Box className={styles.searchContainer}>
              <Box className={styles.searchBoxRow}>
                <Box className={styles.searchField} style={{ flex: '0 0 calc(25% - 8px)' }}>
                  <TextField
                    label={t('dateRange') || 'Date range'}
                    fullWidth
                    variant="outlined"
                    placeholder="Select date"
                    value={
                      startDate && endDate
                        ? `${startDate.format('DD/MM/YYYY')} - ${endDate.format('DD/MM/YYYY')}`
                        : startDate
                          ? startDate.format('DD/MM/YYYY')
                          : ''
                    }
                    onClick={handleDateRangeOpen}
                    InputProps={{
                      readOnly: true,
                    }}
                    required
                  />
                  <Popper
                    open={Boolean(dateRangeAnchorEl)}
                    anchorEl={dateRangeAnchorEl}
                    placement="bottom-start"
                    className={styles.dateRangePopper}
                  >
                    <Paper
                      elevation={3}
                      className={styles.dateRangeContainer}
                    >
                      <Box className={styles.dateRangePickerBox}>
                        <DatePicker
                          label={t('dateRange') || 'Date range'}
                          value={startDate}
                          onChange={(newValue) => setStartDate(newValue)}
                          slotProps={{
                            textField: {
                              size: 'small',
                              variant: 'outlined',
                            },
                          }}
                        />
                        <DatePicker
                          label="End date"
                          value={endDate}
                          onChange={(newValue) => setEndDate(newValue)}
                          slotProps={{
                            textField: {
                              size: 'small',
                              variant: 'outlined',
                            },
                          }}
                          minDate={startDate}
                        />
                      </Box>
                      <Box className={styles.dateRangeActions}>
                        <Button
                          buttonVariant="tertiary"
                          onClick={handleDateRangeClose}
                        >
                          Done
                        </Button>
                      </Box>
                    </Paper>
                  </Popper>
                </Box>
                <Box className={styles.searchField} style={{ flex: '0 0 calc(25% - 8px)' }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="entity-type-label">{t('entityType') || 'Entity type'}</InputLabel>
                    <Select
                      labelId="entity-type-label"
                      label={t('entityType') || 'Entity type'}
                      value={entityType}
                      // placeholder={t('selectEntityType') || 'Select entity type'}
                      onChange={(e: SelectChangeEvent<string>) => setEntityType(e.target.value)}
                      displayEmpty={false}

                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="beneficiaries">Beneficiaries</MenuItem>
                      <MenuItem value="accounts">Accounts</MenuItem>
                      <MenuItem value="users">Users</MenuItem>
                      <MenuItem value="transfers">Transfers</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box className={styles.searchField} style={{ flex: '1 1 auto' }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder={t('searchPlaceholder')}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    InputProps={{
                      endAdornment: searchText.trim() && (
                        <InputAdornment position="end">
                          <Box
                            component="img"
                            src={CloseCircle.src}
                            onClick={() => setSearchText('')}
                            className={styles.closeIconContainer}
                            data-testid="audit-log-search-clear-button"
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
                <Button
                  buttonVariant="secondary-on-colour"
                  variant='outlined'
                  onClick={() => {
                    // Reset to first page when search is triggered
                    setCurrentPage(1);
                    setHasSearched(true);

                  }}
                  className={styles.searchButton}
                  data-testid="audit-log-search-button"
                  startIcon={<Image src={SearchIcon} alt={t('search')} width={24} height={24} />}
                >
                  {t('search') || 'SEARCH'}
                </Button>
              </Box>
              <Box className={styles.checkboxContainer}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={hideSearch}
                      onChange={(e) => setHideSearch(e.target.checked)}
                      size="small"
                    />
                  }
                  label={t('hideSearch') || 'Hide search'}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={hideView}
                      onChange={(e) => setHideView(e.target.checked)}
                      size="small"
                    />
                  }
                  label={t('hideView') || 'Hide view'}
                />
              </Box>
            </Box>
          )}
        </section>
        <section className={styles.tableContainer}>
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
          />
          <AuditLogHubFilterDialog
            open={filterDialogOpen}
            anchorEl={filterAnchorEl}
            onClose={handleFilterClose}
            onApply={handleFilterApply}
            initialValues={filters}
          />
        </section>
      </section>
    </LocalizationProvider>
  );
};
export default AuditLogHub;
