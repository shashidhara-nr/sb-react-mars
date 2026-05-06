'use client';
import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { ListPageWrapper } from 'components/sections';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import SearchIcon from 'public/icons/icn_search_black.svg';
import CloseCircleIcon from 'public/icons/icn_close_circle.svg';
import DownloadIcon from 'public/icons/col-icon-download.svg';
import { Box, Snackbar, Alert } from '@mui/material';
import { Loader } from 'dist/standard-bank-react';
import TableContainer from '@molecules/TableContainer/TableContainer';
import UnusableBeneficiariesDownloadDialog from 'components/molecules/UnusableBeneficiariesDownloadDialog/UnusableBeneficiariesDownloadDialog';
import EmptyState from 'components/common/EmptyState';
import CheckCircleIcon from 'public/icons/icn_check_circle_white.svg';
import WarningIcon from 'public/icons/icn_warning_outline.svg';
import { Button } from 'dist/standard-bank-react';
import { buildTestId } from 'src/utils/testIds';
import IconPeopleProfile from 'public/icons/icn_people.svg';
import { API_ROUTES } from 'lib/utils/apiRoute';

const TABLE_COLUMNS = [
  'debtorCode',
  'dateCreated',
  'capturerName',
  'debtorName',
] as const;

const SORT_BY_MAPPING: { [key: string]: string } = {
  debtorCode: 'referenceIDX',
  dateCreated: 'creationDate',
  capturerName: 'capturer',
  debtorName: 'counterPartyName',
};

const formatDate = (timestamp: number | string): string => {
  if (!timestamp) return '';
  
  const date = new Date(Number(timestamp));
  if (isNaN(date.getTime())) return '';
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = String(date.getFullYear()).slice(-2);
  
  return `${day}-${month}-${year}`;
};

// API call to fetch unusable debtors
const getUnusableDebtors = async (queryParams: any) => {
  try {
    const params = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const response = await fetch(`${API_ROUTES.UNUSABLE_DEBTORS}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch unusable debtors');
  }
};

const UnusableDebtors = () => {
  const testIdPrefix = 'unusable-debtors';
  const t = useTranslations('debtorshub');
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [totalRecords, setTotalRecords] = useState(0);
  const [debtorsData, setDebtorsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<string | number>('debtorCode');
  const [sortAsc, setSortAsc] = useState(true);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [downloadError, setDownloadError] = useState(false);
  const [lastDownloadParams, setLastDownloadParams] = useState<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    const fetchUnusableDebtors = async () => {
      try {
        setLoading(true);
        setError(null);

        // Calculate position for server-side pagination (0-based offset)
        const position = (currentPage - 1) * perPage;

        // Build query parameters for API
        const queryParams: any = {
          pageSize: perPage,
          position: position,
        };

        // Smart search: search across all fields
        if (debouncedSearchText.trim()) {
          const searchValue = debouncedSearchText.trim();
          queryParams.search = searchValue;
        }

        if (sortBy) {
          queryParams.sortBy = SORT_BY_MAPPING[sortBy as string] || sortBy;
          queryParams.asc = sortAsc;
        }

        // Request filtered data from server
        const response = await getUnusableDebtors(queryParams);

        // Set total records for pagination
        setTotalRecords(response.rowCount || 0);

        // Handle API response - the actual data is in unUsedDebtorList
        let apiData: any[] = [];
        if (response.unUsedDebtorList && Array.isArray(response.unUsedDebtorList)) {
          apiData = response.unUsedDebtorList;
        }

        // Map API data to the format expected by the table
        const mappedData = apiData.map((item: any) => ({
          id: String(item.entityKey || Math.random()),
          entityKey: item.entityKey,
          debtorCode: item.referenceIDX || '',
          dateCreated: formatDate(item.creationDate),
          capturerName: item.capturer || '',
          debtorName: item.counterPartyName || '',
        }));

        setDebtorsData(mappedData);
      } catch (err: any) {
        setError(err.message || 'Failed to load debtors');
        setDebtorsData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUnusableDebtors();
  }, [debouncedSearchText, currentPage, perPage, sortBy, sortAsc]);

  const mappedRows = useMemo(() => {
    return debtorsData;
  }, [debtorsData]);

  const handleSort = useCallback((columnKey: string, order: 'asc' | 'desc') => {
    setSortBy(columnKey);
    setSortAsc(order === 'asc');
  }, []);

  const handleCheckboxClick = useCallback(
    (rows: any | any[]) => {
      const selected = Array.isArray(rows) ? rows : rows ? [rows] : [];

      if (Array.isArray(rows)) {
        if (rows.length === 0) {
          setSelectedRows([]);
        } else if (rows.length > 1) {
          const startIndex = (currentPage - 1) * perPage;
          const endIndex = startIndex + perPage;
          const currentPageRows = mappedRows.slice(startIndex, endIndex);
          const currentPageIds = new Set(currentPageRows.map((r: any) => r.id));
          const pageSelections = selected.filter((row: any) => currentPageIds.has(row.id));
          setSelectedRows(pageSelections);
        } else {
          setSelectedRows(selected);
        }
      } else {
        setSelectedRows(selected);
      }
    },
    [currentPage, perPage, mappedRows],
  );

  const handleClearSearch = useCallback(() => {
    setSearchText('');
  }, []);

  const handleDownloadClose = useCallback(() => {
    setDownloadDialogOpen(false);
    setDownloadAnchorEl(null);
  }, []);

  const handleDownloadClick = useCallback(() => {
    setDownloadDialogOpen(true);
    setDownloadAnchorEl(tableContainerRef.current);
  }, []);

  const handleDownload = useCallback(
    async ({ format }: any) => {
      try {
        setDownloadDialogOpen(false);
        setDownloadAnchorEl(null);
        setDownloadError(false);

        setLastDownloadParams({ format });

        const apiUrl = `${API_ROUTES.UNUSABLE_DEBTORS}/export?fileType=${format}`;
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Download failed: ${response.statusText}`);
        }
        const blob = await response.blob();

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        const timestamp = new Date().toISOString().split('T')[0];
        const fileExtension = format === 'pdf' ? 'pdf' : format === 'csv' ? 'csv' : 'txt';
        link.download = `unusable-debtors_${timestamp}.${fileExtension}`;

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        setSnackbarMessage('Download successful');
        setDownloadError(false);
        setSnackbarOpen(true);
      } catch (error: any) {
        setSnackbarMessage('Download failed');
        setDownloadError(true);
        setSnackbarOpen(true);
      }
    },
    [],
  );

  const handleRetryDownload = useCallback(() => {
    if (lastDownloadParams) {
      setSnackbarOpen(false);
      handleDownload(lastDownloadParams);
    }
  }, [lastDownloadParams, handleDownload]);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    setSelectedRows([]);
  }, []);

  const handlePerPageChange = useCallback((newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
    setSelectedRows([]);
  }, []);

  const hasNoDataAtAll = totalRecords === 0 && !debouncedSearchText;

  const tableHeadCells = useMemo(
    () => [
      { id: 'debtorCode', label: 'Debtor code', numeric: false },
      { id: 'dateCreated', label: 'Date created', numeric: false },
      { id: 'capturerName', label: 'Capturer name', numeric: false },
      { id: 'debtorName', label: 'Debtor name', numeric: false },
    ],
    [],
  );

  const tableData = useMemo(
    () => ({
      columns: TABLE_COLUMNS,
      headCells: tableHeadCells,
      rowButton: true,
      rows: mappedRows,
      pageSize: 10,
      rowCount: mappedRows.length,
    }),
    [tableHeadCells, mappedRows],
  );

  const breadcrumbLinks = useMemo(
    () => [
      { href: '/setup-and-admin/debtor', label: 'Setup and Admin' },
      { href: '/setup-and-admin/debtor/unusable', label: 'Unusable debtors' },
    ],
    [t],
  );

  const downloadButtons = useMemo(() => {
    return [
      {
        children: (
          <>
            <Image
              src={DownloadIcon}
              alt="download"
              width={24}
              height={24}
              style={{ marginRight: 4 }}
            />
            <span style={{ fontSize: '14px', fontWeight: 700 }}>Download</span>
          </>
        ),
        buttonVariant: 'tertiary',
        'data-testid': buildTestId(testIdPrefix, 'download-button'),
        onClick: handleDownloadClick,
        disabled: totalRecords === 0,
      },
    ];
  }, [handleDownloadClick, totalRecords]);

  return (
    <>
      <ListPageWrapper
        breadcrumbLinks={breadcrumbLinks}
        title="Unusable debtors"
        searchPlaceholder={hasNoDataAtAll ? "No unusable debtors to search" : "Search by debtor code, debtor name or capturer name"}
        searchValue={searchText}
        onSearchChange={setSearchText}
        searchIcon={<Image src={SearchIcon} alt="search" width={32} height={32} />}
        searchClearIcon={<Image src={CloseCircleIcon} alt="clear" width={24} height={24} />}
        onSearchClear={handleClearSearch}
        containerSpacing={4}
        containerPaddingBottom={4}
        titleFontSize="28px"
        titleMinHeight="48px"
        testIdPrefix={testIdPrefix}
      >
        <div data-testid={buildTestId(testIdPrefix, 'table-container')}>
          {loading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px',
              }}
            >
              <Loader backgroundColor="transparent" />
            </Box>
          ) : (
            <TableContainer
              tableData={tableData}
              filterButtons={downloadButtons}
              showTabs={false}
              onPageChange={handlePageChange}
              onPerPageChange={handlePerPageChange}
              serverSidePagination={true}
              totalRecords={totalRecords}
              currentPage={currentPage}
              perPage={perPage}
              serverSideSorting={true}
              onSort={handleSort}
              externalOrder={sortAsc ? 'asc' : 'desc'}
              externalOrderBy={sortBy}
              testIdPrefix={buildTestId(testIdPrefix, 'table')}
              emptyStateContent={
                hasNoDataAtAll ? (
                  <EmptyState
                    title="No unusable debtors yet"
                    description="You haven’t added any unusable debtors yet."
                    icon={
                      <Image
                        src={IconPeopleProfile}
                        alt="no debtors"
                        width={32}
                        height={32}
                      />
                    }
                  />
                ) : (
                  <EmptyState
                    title="No results found"
                    description="Please refine your search and try again."
                    icon={<Image src={SearchIcon} alt="no results" width={32} height={32} />}
                  />
                )
              }
            />
          )}
        </div>
      </ListPageWrapper>

      <UnusableBeneficiariesDownloadDialog
        open={downloadDialogOpen}
        anchorEl={downloadAnchorEl}
        onClose={handleDownloadClose}
        onDownload={handleDownload}
        title="Download unusable debtors"
        testIdPrefix={buildTestId(testIdPrefix, 'download-dialog')}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={downloadError ? null : 4000}
        onClose={() => !downloadError && setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ mt: 8 }}
        data-testid={buildTestId(testIdPrefix, 'download-snackbar')}
      >
        <Alert
          icon={
            <Image
              src={downloadError ? WarningIcon : CheckCircleIcon}
              alt={downloadError ? 'error' : 'success'}
              width={24}
              height={24}
              style={
                downloadError ? { filter: 'brightness(0) saturate(100%) invert(100%)' } : undefined
              }
            />
          }
          severity={downloadError ? 'error' : 'success'}
          action={
            downloadError ? (
              <Button
                buttonVariant="tertiary"
                onClick={handleRetryDownload}
                data-testid={buildTestId(testIdPrefix, 'retry-download-button')}
                style={{
                  color: '#FFFFFF',
                  minWidth: 'auto',
                  padding: '4px 12px',
                  height: '36px',
                }}
              >
                Try again
              </Button>
            ) : null
          }
          sx={{
            backgroundColor: downloadError ? '#DC0A0A' : '#008545',
            color: '#FFFFFF',
            fontWeight: 400,
            fontSize: 16,
            alignItems: 'center',
            borderRadius: 2,
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default UnusableDebtors;
