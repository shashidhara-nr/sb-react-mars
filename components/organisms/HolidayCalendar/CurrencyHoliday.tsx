'use client';
import { useCallback, useMemo, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import styles from './HolidayCalendar.module.scss';
import { Grid, InputAdornment, TextField, Typography, useTheme, Box } from '@mui/material';
import Image from 'next/image';
import { BreadcrumbList } from 'components/lib/Page/Breadcrumb';
import { Heading } from 'components/lib/Page';
import TableWithTab from '@molecules/TableWithTab/TableWithTab';
import { ListRightPanelActions } from 'components/common';
import EmptyState from 'components/common/EmptyState';
import { mockCurrencyHoliday } from '@lib/mock/mockHolidayCalendar';
import CurrencyHolidayFilterDialog from './CurrencyHolidayFilterDialog';
import { Icon } from '@atoms/index';
import { CloseCircle, ErrorAlertIcon, ReloadRefreshIcon, SearchIcon } from 'lib/icons';

const TABLE_COLUMNS = [
  'countryName',
  'currencyCode',
  'date',
  'dayOfWeek',
  'holidayNameDescription'
] as const;

const CurrencyHoliday = () => {
  const t = useTranslations('holidayCalendar');
  const theme = useTheme();
  // State for filters and search text
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [hasError, setHasError] = useState<boolean>(false);
  const [holidayData, setHolidayData] = useState<any[]>(mockCurrencyHoliday);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Memoize breadcrumb links
  const breadcrumbLinks = useMemo(
    () => [
      { href: '/', label: t('dashboard') },
      { href: '/holiday-calendar/currency', label: t('currencyHolidayCalendar') },
    ],
    [t],
  );

  // API Integration - Fetch currency holidays data
  useEffect(() => {
    const fetchHolidayData = async () => {
      try {
        // Mock API call with delay to simulate network request
        // Uncomment the line below to simulate API failure for testing the error state
        // throw new Error('API request failed');

        // For now, using mock data
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        setHolidayData(mockCurrencyHoliday);
        setHasError(false);
      } catch (error) {
        console.error('Failed to load holiday data:', error);
        setHasError(true);
        // Clear data on error to show error state
        setHolidayData([]);
      }
    };

    fetchHolidayData();
  }, [retryCount]);

  // Memoize filtered rows
  const mappedRows = useMemo(() => {
    let filtered = holidayData;

    // Map country codes to country names
    const countryCodeToName: Record<string, string> = {
      'ZA': 'South Africa',
      'US': 'United States',
      'UK': 'United Kingdom'
    };

    // Apply dialog filters
    if (filters.currencyCode) {
      filtered = filtered.filter((row: any) => row.currencyCode === filters.currencyCode);
    }

    if (filters.country) {
      const countryName = countryCodeToName[filters.country];
      if (countryName) {
        filtered = filtered.filter((row: any) => row.countryName === countryName);
      }
    }

    if (filters.date) {
      // Extract the date part if it's a Dayjs object or formatted string
      let filterDate = filters.date;
      if (filterDate && typeof filterDate === 'object' && filterDate.format) {
        filterDate = filterDate.format('YYYY-MM-DD');
      }
      filtered = filtered.filter((row: any) => row.date === filterDate);
    }

    if (filters.dayOfWeek) {
      // Convert lowercase filter value (e.g., 'monday') to match dayOfWeek in data
      filtered = filtered.filter((row: any) =>
        row.dayOfWeek.toLowerCase() === filters.dayOfWeek.toLowerCase()
      );
    }

    // Apply search text
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        (row: any) =>
          row?.countryName?.toLowerCase().includes(search) ||
          row?.currencyCode?.toLowerCase().includes(search) ||
          row?.holidayNameDescription?.toLowerCase().includes(search),
      );
    }

    // Format date from YYYY-MM-DD to dd/mm/yyyy
    const formatDate = (dateStr: string): string => {
      if (!dateStr) return '';
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    };

    const withAccountDetails = filtered.map((row: any) => ({
      ...row,
      date: formatDate(row.date)
    }));

    return withAccountDetails;
  }, [filters, searchText, holidayData]);

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
    setHasError(false);
  }, []);

  const handleReload = useCallback(() => {
    setRetryCount(prev => prev + 1); // Trigger API retry
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    // Pagination will be implemented when backend supports it
  }, []);

  const handlePerPageChange = useCallback((newPerPage: number) => {
    // Per-page change will be implemented when backend supports it
  }, []);

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

  // Memoize action buttons for right panel
  const rightPanelButtons = useMemo(() => {
    const hasFilters = Object.keys(filters).length > 0;
    const hasSearchText = searchText.trim().length > 0;
    const hasResults = mappedRows.length > 0;

    // Hide remove filters if searching with no results
    if (hasSearchText && !hasResults) {
      return null;
    }

    // Show remove filters if there are filters OR search text with results
    const shouldShow = hasFilters || hasSearchText;

    if (!shouldShow) {
      return null;
    }

    return (
      <ListRightPanelActions
        selectedCount={0}
        hasFilters={shouldShow}
        onRemoveFilters={handleRemoveFilters}
      />
    );
  }, [filters, searchText, mappedRows.length, handleRemoveFilters]);

    // Memoize table head cells
    const tableHeadCells = useMemo(
      () => [
      { id: 'countryName', label: t('countryName'), numeric: false, disableSort: false },
      { id: 'currencyCode', label: t('currencyCode'), numeric: false, colWidth: '180px', disableSort: true },
      { id: 'date', label: t('date'), numeric: false, colWidth: '180px', disableSort: true },
      { id: 'dayOfWeek', label: t('dayOfWeek'), numeric: false, colWidth: '180px', disableSort: true },
      { id: 'holidayNameDescription', label: t('holidayNameDescription'), numeric: false, disableSort: true },
      ],
      [t],
    );

    // Memoize empty state content
    const emptyStateContent = useMemo(() => (
      <EmptyState
        title={t('noResultsFound')}
        description={t('noResultsDescription')}
        icon={
          <Image 
            src={SearchIcon} 
            alt="No results icon" 
            width={48} 
            height={48}
          />
        }
        testIdPrefix="currency-holiday"
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
        testIdPrefix="currency-holiday"
      />
    ), [t, handleReload]);

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
      }),
      [tableHeadCells, mappedRows, hasError, mounted, emptyStateContent, errorStateContent],
    );

  return (
    <section className={styles.container} data-testid="currency-holiday-container">
      <section className={styles.tabContent} data-testid="currency-holiday-content">
        <BreadcrumbList links={breadcrumbLinks} data-testid="currency-holiday-breadcrumb" />
        <Grid
          size={12}
          className={styles.headerRow}
          data-testid="currency-holiday-header"
        >
          <Heading as="h4" fontSize="28px">
            {t('currencyHolidayCalendar')}
          </Heading>
        </Grid>
        <Grid size={12} className={styles.searchRow} data-testid="currency-holiday-search-row">
          <TextField
            fullWidth
            variant="outlined"
            placeholder={t('searchPlaceholder')}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            data-testid="currency-holiday-search-field"
            InputProps={
              {
                startAdornment: (
                  <InputAdornment position="start">
                    <Icon name="search" width='32' height='32' bgColor={theme.palette.navy.main} />
                  </InputAdornment>
                ),
                ...(searchText.trim() && {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Box
                        component="img"
                        src={CloseCircle.src}
                        onClick={() => setSearchText('')}
                        className={styles.closeIconContainer}
                      />
                    </InputAdornment>
                  ),
                }),
              }
            }
            className={styles.searchField}
          />
        </Grid>
        <section className={styles.tableContainer} data-testid="currency-holiday-table-container">
          <TableWithTab
            tableData={tableData}
            filterButtons={filterButtons}
            selectedRows={[]}
            onCheckboxClick={() => {}}
            onRowClick={(rowData: any) => console.log('rowData', rowData)}
            rightPanelButtons={rightPanelButtons}
            onPageChange={handlePageChange}
            onPerPageChange={handlePerPageChange}
            data-testid="currency-holiday-table"
          />
          <CurrencyHolidayFilterDialog
            open={filterDialogOpen}
            anchorEl={filterAnchorEl}
            onClose={handleFilterClose}
            onApply={handleFilterApply}
            initialValues={filters}
            data-testid="currency-holiday-filter-dialog"
          />
        </section>
      </section>
    </section>
  );
};
export default CurrencyHoliday;
