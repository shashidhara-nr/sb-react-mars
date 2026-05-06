'use client';
import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import styles from './HolidayCalendar.module.scss';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import Image from 'next/image';
import { ListPageWrapper } from 'components/sections';
import TableContainer from '@molecules/TableContainer/TableContainer';
import { ListRightPanelActions } from 'components/common';
import EmptyState from 'components/common/EmptyState';
import CountryHolidayFilterDialog from './CountryHolidayFilterDialog';
import { Icon } from '@atoms/index';
import { CloseCircle, ErrorAlertIcon, ReloadRefreshIcon, SearchIcon } from 'lib/icons';
import { 
  getCountryHolidaysList, 
  getCountryHolidaysSummary, 
  CountryHolidayItem,
  BusinessCalendarItem,
  BusinessCalendarDetail 
} from '@lib/api/holidayCalendarApi';

const TABLE_COLUMNS = [
  'countryName',
  'date',
  'dayOfWeek',
  'holidayNameDescription'
] as const;

// Map table column IDs to API sort parameter names
const SORT_COLUMN_MAP: Record<string, string> = {
  'countryName': 'countryName',
  'date': 'fromDate',
  'dayOfWeek': 'dayOfWeek',
  'holidayNameDescription': 'holidayNameDescription',
};

// Columns that should not be sortable
const NON_SORTABLE_COLUMNS = ['date', 'dayOfWeek', 'holidayNameDescription'];

interface CountryHolidayFilters {
  countryCode?: string;
  fromDate?: number;
  holidayDescription?: string;
  dayOfWeek?: string;
}

interface SortState {
  sortBy: string | null;
  sortDirection: 'ASC' | 'DESC';
}

const CountryHoliday = () => {
  const t = useTranslations('holidayCalendar');
  const theme = useTheme();
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Calculate 5 years ago in milliseconds - ensure only recent data
  const getFiveYearsAgoMs = () => {
    const now = new Date();
    const fiveYearsAgo = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
    return fiveYearsAgo.getTime();
  };

  // State management - direct control like beneficiary page
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<CountryHolidayFilters>({ 
    countryCode: 'ZA', 
    fromDate: getFiveYearsAgoMs(),
    holidayDescription: '',
    dayOfWeek: ''
  });
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [debouncedSearchText, setDebouncedSearchText] = useState<string>('');
  const [sortState, setSortState] = useState<SortState>({ sortBy: null, sortDirection: 'ASC' });
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [holidayData, setHolidayData] = useState<CountryHolidayItem[]>([]);
  const [totalRowCount, setTotalRowCount] = useState(0);
  const [countryCodes, setCountryCodes] = useState<string[]>(['ZA']);
  const [mounted, setMounted] = useState(false);

  // Handle search debouncing - like beneficiary page
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    setMounted(true);
    // Fetch country codes on mount
    fetchCountryCodes();
  }, []);

  // Fetch country codes summary
  const fetchCountryCodes = async () => {
    try {
      const response = await getCountryHolidaysSummary();
      
      let codes: string[] = ['ZA'];
      
      // Extract country codes from the list
      if (response.list && Array.isArray(response.list)) {
        codes = response.list
          .map(item => item.countryCode)
          .filter((code): code is string => Boolean(code) && code.trim().length > 0);
      }
      
      const uniqueCodes = [...new Set(codes)].sort();
      setCountryCodes(uniqueCodes.length > 0 ? uniqueCodes : ['ZA']);
    } catch (err) {
      console.error('Failed to fetch country codes summary:', err);
      setCountryCodes(['ZA']);
    }
  };

  // Main fetch effect - coordinates all parameters like beneficiary page
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        setLoading(true);
        setHasError(false);

        // offset is 0-based for pagination
        const offset = (currentPage - 1) * perPage;
        
        // Ensure minimum 5-year date
        const minDate = getFiveYearsAgoMs();
        const fromDate = filters.fromDate && filters.fromDate >= minDate ? filters.fromDate : minDate;

        // Build query parameters based on all factors
        const queryParams: any = {
          countryCode: filters.countryCode || 'ZA',
          fromDate: fromDate,
          len: perPage,
          offset: offset,
        };

        // Add holiday description filter (search)
        if (debouncedSearchText.trim()) {
          queryParams.holidayDescription = debouncedSearchText.trim();
        }

        // Add day of week filter
        const dayOfWeekValue = filters.dayOfWeek?.trim();
        
        if (dayOfWeekValue) {
          queryParams.dayOfWeek = dayOfWeekValue;
        }

        // Add sorting parameters
        if (sortState.sortBy) {
          // Map column ID to API parameter name (e.g., 'date' -> 'fromDate')
          const apiSortBy = SORT_COLUMN_MAP[sortState.sortBy] || sortState.sortBy;
          queryParams.sortBy = apiSortBy;
          queryParams.sortOrder = sortState.sortDirection;
        }

        // Make API call
        const response = await getCountryHolidaysList(queryParams as any);

        // Extract total rows
        const total = response.totalRowCount || 0;
        setTotalRowCount(total);

        // Flatten the businessCalendarDetail array into individual rows
        const flattenedData: CountryHolidayItem[] = [];
        if (response.list && Array.isArray(response.list)) {
          response.list.forEach((calendar: BusinessCalendarItem) => {
            calendar.businessCalendarDetail.forEach((detail: BusinessCalendarDetail) => {
              flattenedData.push({
                countryName: calendar.businessCalendarName,
                date: detail.date,
                dayOfWeek: detail.dayOfTheWeek,
                holidayNameDescription: detail.description,
                entityKey: detail.entityKey
              });
            });
          });
        }

        setHolidayData(flattenedData);
      } catch (err: any) {
        setHasError(true);
        setHolidayData([]);
        setTotalRowCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchHolidays();
  }, [filters, debouncedSearchText, currentPage, perPage, sortState]);
  
  // Memoize breadcrumb links
  const breadcrumbLinks = useMemo(
    () => [
      { href: '/', label: t('dashboard') },
      { href: '/holiday-calendar/country', label: t('countryHolidayCalendar') },
    ],
    [t],
  );

  // Convert API response to table format - like beneficiary page
  const mappedRows = useMemo(() => {
    return holidayData.map((row) => ({
      ...row,
      // Convert milliseconds to readable date format
      date: new Date(row.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }),
      dayOfWeek: row.dayOfWeek?.charAt(0).toUpperCase() + row.dayOfWeek?.slice(1) || '',
    }));
  }, [holidayData]);

  // Memoize callbacks
  const handleFilterOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setFilterDialogOpen(true);
    setFilterAnchorEl(event.currentTarget);
  }, []);

  const handleFilterClose = useCallback(() => {
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
  }, []);

  const handleFilterApply = useCallback((appliedFilters: CountryHolidayFilters) => {
    setFilters(appliedFilters);
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
    setCurrentPage(1);
  }, []);

  const handleRemoveFilters = useCallback(() => {
    setFilters({ countryCode: 'ZA', fromDate: getFiveYearsAgoMs(), holidayDescription: '', dayOfWeek: '' });
    setSearchText('');
    setSortState({ sortBy: null, sortDirection: 'ASC' });
    setCurrentPage(1);
  }, []);

  const handleReload = useCallback(async () => {
    // Re-fetch current page with current filters
    setHasError(false);
    setLoading(true);
  }, []);

  const handleSort = useCallback((columnId: string) => {
    // Check if column is sortable
    if (NON_SORTABLE_COLUMNS.includes(columnId)) {
      return; // Don't sort if column is not sortable
    }
    
    if (sortState.sortBy === columnId) {
      setSortState(prev => ({
        ...prev,
        sortDirection: prev.sortDirection === 'ASC' ? 'DESC' : 'ASC',
      }));
    } else {
      setSortState({ sortBy: columnId, sortDirection: 'ASC' });
    }
    setCurrentPage(1);
  }, [sortState.sortBy]);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const handlePerPageChange = useCallback((newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  }, []);

  // Memoize filter button
  const filterButtons = useMemo(() => {
    const isDisabled = totalRowCount === 0;
    
    return [
      {
        children: (
          <>
            <Box
              sx={{ 
                display: 'flex',
                opacity: isDisabled ? 0.4 : 1,
                filter: isDisabled ? 'grayscale(100%)' : 'none',
              }}
            >
              <Icon name="filter" width='24' height='24' bgColor={theme.palette.secondary.main} />
            </Box>
            <Typography variant="button" className={styles.filterText}>{t('filter')}</Typography>
          </>
        ),
        buttonVariant: 'tertiary' as const,
        onClick: handleFilterOpen,
        disabled: isDisabled,
      },
    ];
  }, [handleFilterOpen, totalRowCount, t, theme]);

  // Memoize action buttons for right panel
  const rightPanelButtons = useMemo(() => {
    const hasActiveFilters = (filters.countryCode && filters.countryCode !== 'ZA') || 
                             (filters.holidayDescription && filters.holidayDescription.trim().length > 0) ||
                             (filters.dayOfWeek && filters.dayOfWeek.trim().length > 0);
    const hasSearchText = debouncedSearchText.trim().length > 0;
    const hasResults = holidayData.length > 0;

    if (hasSearchText && !hasResults) {
      return null;
    }

    const shouldShow = !!(hasActiveFilters || hasSearchText);

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
  }, [filters, debouncedSearchText, sortState, holidayData.length, handleRemoveFilters]);

  // Memoize table head cells
  const tableHeadCells = useMemo(
    () => [
      { id: 'countryName', label: t('countryName') || 'Country', numeric: false },
      { id: 'date', label: t('date') || 'Date', numeric: false, colWidth: '180px', sortable: false },
      { id: 'dayOfWeek', label: t('dayOfWeek') || 'Day of Week', numeric: false, colWidth: '180px', sortable: false },
      { id: 'holidayNameDescription', label: t('holidayNameDescription') || 'Holiday', numeric: false, sortable: false },
    ],
    [t],
  );

  // Memoize empty state content
  const emptyStateContent = useMemo(() => (
    <EmptyState
      title={t('noResultsFound') || 'No Results Found'}
      description={t('noResultsDescription') || 'No holiday data available'}
      icon={
        <Image 
          src={SearchIcon} 
          alt="No results icon" 
          width={48} 
          height={48}
        />
      }
      testIdPrefix="country-holiday"
    />
  ), [t]);

  // Memoize error state content
  const errorStateContent = useMemo(() => (
    <EmptyState
      title={t('failedToLoad') || 'Failed to Load'}
      description={t('failedToLoadDescription') || 'Failed to load holiday data'}
      buttonLabel={t('reload') || 'Reload'}
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
      testIdPrefix="country-holiday"
    />
  ), [t, handleReload]);

  // Memoize table data
  const tableData = useMemo(
    () => {
      return {
        columns: TABLE_COLUMNS,
        headCells: tableHeadCells,
        rowButton: false,
        rows: mounted ? mappedRows : [],
        pageSize: perPage,
        pageCount: totalRowCount > 0 ? Math.ceil(totalRowCount / perPage) : 1,
        currentPage: currentPage,
        rowCount: totalRowCount,
        rowVariant: 'default',
        emptyStateContent: hasError ? errorStateContent : emptyStateContent,
      };
    },
    [tableHeadCells, mappedRows, hasError, mounted, emptyStateContent, errorStateContent, perPage, totalRowCount, currentPage],
  );

  if (!mounted) {
    return null;
  }

  return (
    <>
      <ListPageWrapper
        breadcrumbLinks={breadcrumbLinks}
        title={t('countryHoliday')}
        searchValue={searchText}
        onSearchChange={(value) => {
          setSearchText(value);
        }}
        searchPlaceholder={t('searchByDescription')}
        containerSpacing={4}
        containerPaddingBottom={4}
        titleFontSize="28px"
        titleMinHeight="48px"
        testIdPrefix="country-holiday"
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
            <CircularProgress />
          </Box>
        ) : hasError ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
            {errorStateContent}
          </Box>
        ) : (
          <TableContainer
            tableData={tableData}
            filterButtons={filterButtons}
            rightPanelContent={rightPanelButtons}
            onSort={handleSort}
            serverSidePagination={true}
            totalRecords={totalRowCount}
            currentPage={currentPage}
            perPage={perPage}
            onPageChange={handlePageChange}
            onPerPageChange={handlePerPageChange}
            serverSideSorting={true}
            externalOrder={sortState.sortDirection.toLowerCase() as 'asc' | 'desc'}
            externalOrderBy={sortState.sortBy || undefined}
          />
        )}
      </ListPageWrapper>

      <CountryHolidayFilterDialog
        open={filterDialogOpen}
        anchorEl={filterAnchorEl}
        onClose={handleFilterClose}
        onApply={handleFilterApply}
        initialValues={filters}
      />
    </>
  );
};
export default CountryHoliday;
