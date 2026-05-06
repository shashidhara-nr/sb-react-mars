'use client';
import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import styles from './BranchCodes.module.scss';
import { Grid, InputAdornment, TextField, Typography, useTheme } from '@mui/material';
import { BreadcrumbList } from 'components/lib/Page/Breadcrumb';
import { Heading } from 'components/lib/Page';
import TableWithTab from '@molecules/TableWithTab/TableWithTab';
import { CommonSnackbar, ListRightPanelActions } from 'components/common';
import BranchCodesFilterDialog from './BranchCodesFilterDialog';
import { mockBranchCodes } from '@lib/mock/mockBranchCodesCalendar';
import DownloadDebtorDialog from '@molecules/DownloadDebtorDialog/DownloadDebtorDialog';
import { DownloadIcon, ErrorAlertIcon, ReloadRefreshIcon, SearchIcon } from 'lib/icons';
import { generateCSV } from '@lib/utils/generateCSV';
import { generateTXT } from '@lib/utils/generateTXT';
import { generatePDF } from '@lib/utils/generatePDF';
import { buildFileName } from '@lib/utils/buildFileName';
import { buildTestId } from 'src/utils/testIds';
import EmptyState from 'components/common/EmptyState';
import { Icon } from '@atoms/index';
import Image from 'next/image';

const TABLE_COLUMNS = [
  'bankNameDisplay', // Display formatted bank name
  'branchName',
  'branchCode',
  'country',
  'city',
  'address'
] as const;

const BranchCodes = () => {
  const testIdPrefix = 'branch-codes';
  const theme = useTheme();
  const t = useTranslations('branchCodes');
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(15);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [errorToastOpen, setErrorToastOpen] = useState(false);
  const [errorToastMessage, setErrorToastMessage] = useState('');
  const [successToastOpen, setSuccessToastOpen] = useState(false);
  const [successToastMessage, setSuccessToastMessage] = useState('');
  const [filterQuery, setFilterQuery] = useState<string>('');
  const [retryCount, setRetryCount] = useState<number>(0);
  const [branchData, setBranchData] = useState<any[]>(mockBranchCodes);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);


  const handleReload = useCallback(() => {
    setRetryCount(prev => prev + 1);
  }, []);

  // Loading effect for search and filter changes
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [searchText, filters]);

  // Memoize breadcrumb links 
  const breadcrumbLinks = useMemo(
    () => [
      { href: '/', label: t('dashboard') },
      { href: '/branch-codes', label: t('branchCodes') },
    ],
    [t],
  );

  // API Integration - Fetch branch data
  useEffect(() => {
    const fetchBranchData = async () => {
      try {
        // Mock API call with delay to simulate network request
        // Uncomment the line below to simulate API failure for testing
        // throw new Error('API request failed');

        // For now, using mock data
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        setBranchData(mockBranchCodes);
        setHasError(false);
      } catch (error) {
        console.error('Failed to load branch data:', error);
        setHasError(true);
        setBranchData([]);
      }
    };

    fetchBranchData();
  }, [retryCount]);

  const mappedRows = useMemo(() => {
    let filtered = [...branchData];

    if (filters.bankName) {
      const search = filters.bankName.toLowerCase();
      filtered = filtered.filter(row =>
        row.bankName?.toLowerCase().includes(search)
      );
    }

    if (filters.branchCode) {
      const search = filters.branchCode.toLowerCase();
      filtered = filtered.filter(row =>
        row.branchCode?.toLowerCase().includes(search)
      );
    }

    if (filters.country) {
      filtered = filtered.filter(
        row => row.country === filters.country
      );
    }

    /* ---------------------------
       Global Search (FIXED)
       --------------------------- */
    if (searchText.trim()) {
      const search = searchText.toLowerCase();

      filtered = filtered.filter(row =>
        [
          row.bankName,
          row.branchName,
          row.branchCode,
          row.country,
          row.city,
          row.address,
        ].some(value =>
          value?.toLowerCase().includes(search)
        )
      );
    }

    return filtered;
  }, [filters, searchText, branchData]);

  // Transform rows to add display values for UI while keeping actual values for filtering
  const displayRows = useMemo(() => {
    // If bankNameDisplay already exists, use it; otherwise it was already added in mock data
    return mappedRows.map(row => ({
      ...row,
      bankNameDisplay: row.bankNameDisplay || row.bankName,
    }));
  }, [mappedRows]);

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
   
    if (appliedFilters.country !== "" || appliedFilters.bankName !== "") {
    setFilters(appliedFilters);
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
    setSelectedRows([]); // Clear selected checkboxes when filter is applied
    }
  }, []);

  const handleRemoveFilters = useCallback(() => {
    setFilters({});
    setSearchText('');
    setFilterQuery('');
    setSelectedRows([]); // Clear selected checkboxes when filters are removed
  }, []);

  const handleSearch = useCallback(() => {
    setSearchText(filterQuery);
    setCurrentPage(1);
    setSelectedRows([]); // Clear selected checkboxes when search is performed
  }, [filterQuery]);

  const handleSearchKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  const handleClearSearch = useCallback(() => {
    setSearchText('');
    setFilterQuery('');
    setCurrentPage(1);
    setSelectedRows([]); // Clear selected checkboxes when search is cleared
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const handlePerPageChange = useCallback((newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  }, []);

  const handleDownloadOpen = useCallback(() => {
    setDownloadDialogOpen(true);
    setDownloadAnchorEl(tableContainerRef.current);
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
  }, []);

  const handleDownloadClose = useCallback(() => {
    setDownloadDialogOpen(false);
    setFilterDialogOpen(false);
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
  }, []);

  // Memoize filter button
  const filterButtons = useMemo(() => {
    const buttons = [];
    
    // Only show download button when there are rows to download
    if (selectedRows.length > 0) {
      buttons.push({
        children: (
          <>
            <Image
              src={DownloadIcon}
              alt={t('download')}
              width={16}
              height={16}
              style={{ marginRight: 4 }}
            />
            {selectedRows.length > 0 ? `${t('download')} (${selectedRows.length})` : t('download')}
          </>
        ),
        buttonVariant: 'tertiary',
        'data-testid': buildTestId(testIdPrefix, 'download-button'),
        onClick: handleDownloadOpen,
      });
    }
    
    // Always show filter button
    buttons.push({
      children: (
        <>
          <Icon name="filter" width='24' height='24' bgColor={theme.palette.secondary.main} />
          <Typography variant="button" className={styles.filterText}>{t('filter')}</Typography>
        </>
      ),
      buttonVariant: 'tertiary' as const,
      onClick: handleFilterOpen,
      'data-testid': buildTestId(testIdPrefix, 'filter-button'),
    });
    
    return buttons;
  }, [handleFilterOpen, handleDownloadOpen, selectedRows.length, displayRows.length, t, theme.palette.secondary.main]);

  const handleCheckboxClick = useCallback(
    (rows: any | any[]) => {
      if (Array.isArray(rows)) {
        // Check for special flags from DataTable
        const isSelectAllOperation = rows.length > 0 && rows[0]?.__selectAllFlag;
        const isDeselectOperation = rows.length > 0 && rows[0]?.__deselectFlag;
        
        if (isSelectAllOperation) {
          // Select all on current page: add these rows to existing selections
          setSelectedRows(prev => {
            const existingMap = new Map(prev.map((row: any) => [row.id, row]));
            // Remove the flag and add rows
            rows.forEach((row: any) => {
              const { __selectAllFlag, ...cleanRow } = row;
              existingMap.set(cleanRow.id, cleanRow);
            });
            return Array.from(existingMap.values());
          });
        } else if (isDeselectOperation) {
          // Deselect all on current page: remove these rows from existing selections
          const idsToRemove = new Set(rows.map((r: any) => r.id));
          setSelectedRows(prev => prev.filter((row: any) => !idsToRemove.has(row.id)));
        } else {
          // Individual checkbox click: DataTable sends complete selection state
          // Just replace with what we received (DataTable already handles the toggle logic)
          setSelectedRows(rows);
        }
      } else {
        // Legacy support: Handle single row object (not from DataTable)
        const rowId = rows?.id;
        if (rowId) {
          setSelectedRows(prev => {
            const existingMap = new Map(prev.map((row: any) => [row.id, row]));
            
            if (existingMap.has(rowId)) {
              // Deselect: remove this row from selected state
              existingMap.delete(rowId);
            } else {
              // Select: add this row to selected state
              existingMap.set(rowId, rows);
            }
            
            return Array.from(existingMap.values());
          });
        } else {
          // Clear all selections if invalid row
          setSelectedRows([]);
        }
      }
    },
    [],
  );

  const handleDownload = useCallback(
    async ({ format }: any) => {
      try {
        setDownloadLoading(true);
        setDownloadError(null);
        setDownloadDialogOpen(false);
        setDownloadAnchorEl(null);
        setFilterDialogOpen(false);
        setFilterAnchorEl(null);

        const dataToExport =
          selectedRows?.length > 0 ? selectedRows : displayRows;

        let blob: Blob;

        switch (format) {
          case 'csv':
            blob = new Blob([generateCSV(dataToExport)], {
              type: 'text/csv',
            });
            break;

          case 'txt':
            blob = new Blob([generateTXT(dataToExport)], {
              type: 'text/plain',
            });
            break;

          case 'pdf':
            blob = generatePDF(dataToExport);
            break;

          default:
            throw new Error('Unsupported format');
        }

        const url = window?.URL?.createObjectURL(blob);
        const link = document?.createElement('a');
        link.href = url;
        link.download = buildFileName(format);

        document.body.appendChild(link);
        link.click();

        link.remove();
        window.URL.revokeObjectURL(url);
        setDownloadDialogOpen(false);
        setSuccessToastMessage(t('successfullyDownloadedBranchCodes'));
        setSuccessToastOpen(true);
      } catch (err) {
        console.error(err);
        setDownloadError(
          t('errorDownloadingBranchCodes')
        );
        setErrorToastMessage(
          t('unsuccessfullyDownloadedBranchCodes')
        );
        setErrorToastOpen(true);
      } finally {
        setDownloadLoading(false);
      }
    },
    [displayRows, selectedRows, t]
  );

  // Memoize action buttons for right panel
  const rightPanelButtons = useMemo(() => {
    const hasFilters = Object.keys(filters).length > 0 || searchText.trim().length > 0;

    return (
      <ListRightPanelActions
        selectedCount={selectedRows.length}
        hasFilters={hasFilters}
        onRemoveFilters={handleRemoveFilters}
      />
    );
  }, [filters, searchText, handleRemoveFilters, selectedRows.length]);

  // Memoize table head cells
  const tableHeadCells = useMemo(
    () => [
      { id: 'bankNameDisplay', label: t('bankName'), numeric: false, colWidth: '280px' },
      { id: 'branchName', label: t('branchName'), numeric: false, colWidth: '280px', disableSort: true },
      { id: 'branchCode', label: t('branchCode'), numeric: false, colWidth: '180px', disableSort: true },
      { id: 'country', label: t('country'), numeric: false, colWidth: '150px', disableSort: true },
      { id: 'city', label: t('city'), numeric: false, colWidth: '150px', disableSort: true },
      { id: 'address', label: t('address'), numeric: false, colWidth: '280px', disableSort: true },
    ],
    [t],
  );

  const emptyStateContent = useMemo(() => (
    <EmptyState
      title={t('noRecordsFound')}
      description={t('noBranchCodesMatch')}
      icon={
        <Image
          src={SearchIcon}
          alt="No results icon"
          width={48}
          height={48}
        />
      }
      testIdPrefix="branch-codes-empty-state"
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
      testIdPrefix="branch-codes-error-state"
    />
  ), [t, handleReload]);

  // Memoize table data
  const tableData = useMemo(
    () => ({
      columns: TABLE_COLUMNS,
      headCells: tableHeadCells,
      rowButton: false,
      rows: displayRows,
      pageSize: 15,
      rowCount: displayRows.length,
      rowVariant: 'checkbox',
      emptyStateContent: hasError ? errorStateContent : emptyStateContent,
    }),
    [tableHeadCells, displayRows, hasError, errorStateContent, emptyStateContent],
  );

  return (
    <section className={styles.container} data-testid={buildTestId(testIdPrefix, 'container')}>
      <section className={styles.tabContent} data-testid={buildTestId(testIdPrefix, 'content')}>
        <BreadcrumbList links={breadcrumbLinks} />
        <Grid
          size={12}
          className={styles.headerRow}
        >
          <Heading as="h4" fontSize="28px">
            {t('branchCodes')}
          </Heading>
        </Grid>
        <Grid size={12} className={styles.searchRow} data-testid={buildTestId(testIdPrefix, 'search-row')}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder={t('searchPlaceholder')}
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            data-testid={buildTestId(testIdPrefix, 'search-input')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <div
                    onClick={handleSearch}
                    className={styles['search-icon-container']}
                  >
                    <Icon
                      name="search"
                      width="20"
                      height="20"
                      bgColor={theme.palette.navy.main}
                    />
                  </div>
                </InputAdornment>
              ),
              sx: {
                height: 44,
                borderRadius: '8px',
                fontSize: '14px',
              },
            }}
            className={styles.searchField}
          />
        </Grid>
        <section className={styles.tableContainer} data-testid={buildTestId(testIdPrefix, 'table-container')}>
          <TableWithTab
            tableData={tableData}
            filterButtons={filterButtons}
            selectedRows={selectedRows}
            onCheckboxClick={handleCheckboxClick}
            onRowClick={(rowData: any) => console.log('rowData', rowData)}
            rightPanelButtons={rightPanelButtons}
            onPageChange={handlePageChange}
            onPerPageChange={handlePerPageChange}
            initialOrder="asc"
            initialOrderBy="bankNameDisplay"
            isLoading={isLoading}
          />
          <BranchCodesFilterDialog
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
            title={t('downloadBranchCodes')}
            hideSorting={true}
          />
        </section>
      </section>
      <CommonSnackbar
        open={errorToastOpen || successToastOpen}
        message={errorToastOpen ? errorToastMessage : successToastMessage}
        onClose={() => {
          setErrorToastOpen(false);
          setSuccessToastOpen(false);
        }}
        severity={errorToastOpen ? 'error' : 'success'}
        autoHideDuration={errorToastOpen ? undefined : 5000}
        data-testid={buildTestId(testIdPrefix, 'error-snackbar')}
      />
    </section>
  );
};
export default BranchCodes;
