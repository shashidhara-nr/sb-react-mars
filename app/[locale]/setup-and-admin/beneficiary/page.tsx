'use client';
import { Box, Snackbar, Alert } from '@mui/material';
import { Button, Loader } from 'dist/standard-bank-react';
import DeleteConfirmationDialog from 'components/common/DeleteConfirmationDialog';
import EmptyState from 'components/common/EmptyState';
import AvatarAlert from 'public/icons/avatar_alert.svg';
import TableContainer from '@molecules/TableContainer/TableContainer';
import { useRouter } from 'next/navigation';
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import BeneficiaryFilterDialog from '@molecules/BeneficiaryFilterDialog';
import DownloadDebtorDialog from 'components/molecules/DownloadDebtorDialog/DownloadDebtorDialog';
import IconPeopleProfile from 'public/icons/icn_people.svg';
import {
  getBeneficiaries,
  BeneficiaryListItem,
  exportBeneficiaries,
  printBeneficiaries,
  findBeneficiaryById,
  deleteBeneficiaries,
  BENEFICIARY_SORT_COLUMN_MAP,
} from 'lib/api/beneficiaryApi';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import FunnelIcon from 'public/icons/icn_funnel.svg';
import AddIcon from 'public/icons/icn_add.svg';
import CheckCircleIcon from 'public/icons/icn_check_circle_white.svg';
import WarningIcon from 'public/icons/icn_warning_outline.svg';
import { ListPageWrapper } from 'components/sections';
import { ListRightPanelActions } from 'components/common';
import { useAppDispatch, useAppSelector } from '@lib/hooks/useAppDispatch';
import { loadBeneficiary, resetBeneficiary } from '@store/slices/createBeneficiarySlice';
import {
  setFilters,
  setSearchType,
  setSearchValue,
  clearSearch,
  clearFilters,
} from '@store/slices/beneficiaryFiltersSlice';
import {
  prepareDeletePayload,
  extractErrorMessage,
} from '@lib/transformers/beneficiaryTransformers';
import { buildTestId } from 'src/utils/testIds';
import DownloadBeneficiaryDialog from '@molecules/DownloadBeneficiaryDialog/DownloadBeneficiaryDialog';

// Constants
enum BeneficiaryStatusCodes {
  ACTIVE = 'ACT',
  AWAITING_CUSTOMER_AUTHORISATION = 'ACA',
  AWAITING_CUSTOMER_AUDIT = 'ACI',
  AWAITING_CUSTOMER_REPAIR = 'ACR',
  PARTIALLY_CUSTOMER_AUTHORISED = 'PCA',
  AWAITING_BANK_AUTHORISATION = 'ABA',
  AWAITING_BANK_AUDIT = 'ABI',
  AWAITING_BANK_REPAIR = 'ABR',
  PARTIALLY_BANK_AUTHORISED = 'PBA',
}

const STATUS_CODES = [
  undefined, // allRecords
  BeneficiaryStatusCodes.AWAITING_CUSTOMER_REPAIR, // needAction
  BeneficiaryStatusCodes.AWAITING_CUSTOMER_AUTHORISATION, // awaitingApproval
  BeneficiaryStatusCodes.PARTIALLY_CUSTOMER_AUTHORISED, // processing
  BeneficiaryStatusCodes.ACTIVE, // active
  BeneficiaryStatusCodes.AWAITING_BANK_REPAIR, // unusable
] as const;

const TABLE_COLUMNS = [
  { key: 'accountDetails', type: 'account' },
  'beneficiaryCode',
  'bankName',
  'bicSwiftCode',
  'paymentCategory',
  { key: 'status', type: 'chip' },
  { key: 'links', type: 'link' },
] as const;

// Helper function to convert base64 string to Blob
const base64ToBlob = (base64Data: string, contentType: string): Blob => {
  const byteCharacters = atob(base64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);

    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
};

const BeneficiariesHub = () => {
  const testIdPrefix = 'beneficiary-hub';
  const t = useTranslations('beneficiarieshub');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const dispatch = useAppDispatch();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  
  // Redux state for filters and search
  const filters = useAppSelector((state) => state.beneficiaryFilters.filters);
  const advancedSearchType = useAppSelector((state) => state.beneficiaryFilters.searchType);
  const advancedSearchValue = useAppSelector((state) => state.beneficiaryFilters.searchValue);
  
  const [selectedTab, setSelectedTab] = useState(0);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [totalRecords, setTotalRecords] = useState(0);
  const [beneficiariesData, setBeneficiariesData] = useState<BeneficiaryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string | number>('accountDetails');
  const [sortAsc, setSortAsc] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [downloadError, setDownloadError] = useState(false);
  const [lastDownloadParams, setLastDownloadParams] = useState<any>(null);
  const [isMixedStatusDelete, setIsMixedStatusDelete] = useState(false);
  const [deleteErrorDialogOpen, setDeleteErrorDialogOpen] = useState(false);

  useEffect(() => {
    const fetchBeneficiaries = async () => {
      try {
        setLoading(true);
        setError(null);

        // Calculate position for server-side pagination (0-based offset)
        const position = (currentPage - 1) * perPage;

        // Build query parameters based on filters and search
        const queryParams: any = {
          pageSize: perPage,
          position: position,
        };

        // Add tab status filter
        if (selectedTab !== 0) {
          const statusCode = STATUS_CODES[selectedTab];
          queryParams.statusCode = statusCode;
        }

        // Add dialog filters
        if (filters.counterPartyName) {
          queryParams.counterPartyName = filters.counterPartyName;
        }
        if (filters.accountNumber) {
          queryParams.accountNumber = filters.accountNumber;
        }
        if (filters.referenceIDX) {
          queryParams.referenceIDX = filters.referenceIDX;
        }
        if (filters.paymentCategory) {
          queryParams.paymentCategory = getPaymentCategoryCode(filters.paymentCategory);
        }
        if (filters.statusCode) {
          queryParams.statusCode = filters.statusCode;
        }

        // Add sorting with column mapping
        if (sortBy) {
          // Map table column key to backend field name
          const backendFieldName = BENEFICIARY_SORT_COLUMN_MAP[sortBy] || sortBy;
          queryParams.sortBy = backendFieldName;
          queryParams.asc = sortAsc;
        }

        // Request filtered data from server
        const response = await getBeneficiaries(queryParams);

        // Set total records for pagination
        setTotalRecords(response.rowCount || 0);

        // Handle API response - the actual data is in beneficiaryDetailPerfList
        let apiData: any[] = [];
        if (
          response.beneficiaryDetailPerfList &&
          Array.isArray(response.beneficiaryDetailPerfList)
        ) {
          apiData = response.beneficiaryDetailPerfList;
        }

        // Map API data to the format expected by the table
        const mappedData = apiData.map((item: any) => ({
          id: String(item.entityKey || item.id || Math.random()),
          entityKey: item.entityKey,
          counterPartyName: {
            name: item.counterPartyName || '',
            accountNumber: item.accountNumber || '',
            branch: item.branchSortCode || '',
            icon: '',
          },
          bankName: item.bankName?.trim() || '',
          bicSwiftCode: item.bicSwiftCode || '',
          paymentCategory: getPaymentCategoryDisplay(
            item.paymentCategory || item.insClassification || '',
          ),
          status: getStatusFromCode(item.authoriseStatus),
          links: { href: '/setup-and-admin/beneficiary/manage', text: 'MANAGE BENEFICIARY' },
          authoriseStatus: item.authoriseStatus,
          beneficiaryCode: item.referenceIDX || '',
          accountType: item.accountType || '',
          paymentProfile: item.paymentType || item.paymentProfiles || '',
        }));

        setBeneficiariesData(mappedData);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch beneficiaries');
        setBeneficiariesData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBeneficiaries();
  }, [selectedTab, filters, currentPage, perPage, sortBy, sortAsc]); // Re-fetch when filters, pagination, or sorting changes

  // Helper function to map payment category codes to display format
  const getPaymentCategoryDisplay = (category: string) => {
    if (!category) return '';
    const lowerCategory = category.toLowerCase();
    if (lowerCategory === 'domestic') return 'Domestic';
    if (lowerCategory === 'international') return 'International';
    if (lowerCategory === 'cdi') return 'Company';
    return category; // Return as-is if no match
  };

  // Helper function to map payment category display value to backend code
  const getPaymentCategoryCode = (displayValue: string) => {
    if (!displayValue) return '';
    if (displayValue === 'Company') return 'cdi';
    if (displayValue === 'Domestic') return 'domestic';
    if (displayValue === 'International') return 'international';
    return displayValue.toLowerCase(); // Return lowercase as fallback
  };

  // Helper function to map status codes to display format
  const getStatusFromCode = (code: string) => {
    const statusMap: Record<string, { value: string; color: string }> = {
      ACT: { value: 'Active', color: 'success' },
      ACA: { value: 'Awaiting Customer Authorisation', color: 'warning' },
      ACI: { value: 'Awaiting Customer Audit', color: 'info' },
      ACR: { value: 'Awaiting Customer Repair', color: 'error' },
      PCA: { value: 'Partially Customer Authorised', color: 'warning' },
      ABA: { value: 'Awaiting Bank Authorisation', color: 'warning' },
      ABI: { value: 'Awaiting Bank Audit', color: 'info' },
      ABR: { value: 'Awaiting Bank Repair', color: 'error' },
      PBA: { value: 'Partially Bank Authorised', color: 'warning' },
      INACTIVE: { value: 'Inactive', color: 'default' },
    };
    return statusMap[code] || { value: code || 'Unknown', color: 'default' };
  };

  // Memoize status tabs
  const statusTabs = useMemo(
    () => [
      t('allRecords'),
      t('needAction'),
      t('awaitingApproval'),
      t('processing'),
      t('active'),
    ],
    [t],
  );

  // Memoize filtered rows - no client-side filtering needed, server handles it
  const mappedRows = useMemo(() => {
    // Data is already filtered by server, just add account details formatting
    const withAccountDetails = beneficiariesData.map((row: any) => ({
      ...row,
      accountDetails: {
        name: row?.counterPartyName?.name || '',
        accountNumber: row?.counterPartyName?.accountNumber
          ? `Acc number: ${row.counterPartyName.accountNumber}`
          : '',
      },
      beneficiaryCode: row?.beneficiaryCode
          ? row.beneficiaryCode
          : 'XXXX',
    }));

    return withAccountDetails;
  }, [beneficiariesData]);

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
    // Check if search filters were modified in the dialog
    const paramMap: Record<string, keyof typeof appliedFilters> = {
      name: 'counterPartyName',
      accountNumber: 'accountNumber',
      beneficiaryCode: 'referenceIDX',
    };
    
    // If SearchBar was active but the filter value changed in dialog, clear SearchBar state
    if (advancedSearchType && paramMap[advancedSearchType]) {
      const filterKey = paramMap[advancedSearchType];
      if (appliedFilters[filterKey] !== advancedSearchValue) {
        // Filter was modified in dialog, clear SearchBar
        dispatch(setSearchType(''));
        dispatch(setSearchValue(''));
      }
    }
    
    dispatch(setFilters(appliedFilters));
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
  }, [dispatch, advancedSearchType, advancedSearchValue]);

  const handleSort = useCallback((columnKey: string, order: 'asc' | 'desc') => {
    setSortBy(columnKey);
    setSortAsc(order === 'asc');
  }, []);

  const handleDeleteClose = useCallback(() => {
    setDeleteDialogOpen(false);
    setDeleteError(null);
    setIsMixedStatusDelete(false);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (selectedRows.length === 0) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      // Only send beneficiaries with ACT status to backend for deletion
      const actRows = selectedRows.filter((row: any) => row.authoriseStatus === 'ACT');
      if (actRows.length === 0) {
        setIsDeleting(false);
        setDeleteDialogOpen(false);
        return;
      }
      const deletePayloads = actRows.map((row: any) => ({
        entityKey: row.entityKey,
        entityVersionNumber: 0,
        beneficiaryName: row.counterPartyName?.name || '',
        endorseStatusCode: '',
        authoriseStatus: row.authoriseStatus || '',
        declineReason: 'hardcode reason',
        classification: row.paymentCategory || '',
      }));

      // Call delete API - backend will validate if beneficiaries can be deleted
      await deleteBeneficiaries(deletePayloads);

      // Clear selections and close dialog
      setSelectedRows([]);
      setDeleteDialogOpen(false);
      setDeleteError(null);

      // Refresh data - re-fetch current page
      const position = (currentPage - 1) * perPage;
      const queryParams: any = {
        pageSize: perPage,
        position: position,
      };

      if (selectedTab !== 0) {
        queryParams.statusCode = STATUS_CODES[selectedTab];
      }

      if (filters.counterPartyName) queryParams.counterPartyName = filters.counterPartyName;
      if (filters.accountNumber) queryParams.accountNumber = filters.accountNumber;
      if (filters.referenceIDX) queryParams.referenceIDX = filters.referenceIDX;
      if (filters.paymentCategory)
        queryParams.paymentCategory = getPaymentCategoryCode(filters.paymentCategory);
      if (filters.statusCode) queryParams.statusCode = filters.statusCode;

      if (sortBy) {
        const backendFieldName = BENEFICIARY_SORT_COLUMN_MAP[sortBy] || sortBy;
        queryParams.sortBy = backendFieldName;
        queryParams.asc = sortAsc;
      }

      const response = await getBeneficiaries(queryParams);
      setTotalRecords(response.rowCount || 0);

      const apiData = response.beneficiaryDetailPerfList || [];
      const mappedData = apiData.map((item: any) => ({
        id: String(item.entityKey || item.id || Math.random()),
        entityKey: item.entityKey,
        counterPartyName: {
          name: item.counterPartyName || '',
          accountNumber: item.accountNumber || '',
          branch: item.branchSortCode || '',
          icon: '',
        },
        bankName: item.bankName?.trim() || '',
        bicSwiftCode: item.bicSwiftCode || '',
        paymentCategory: getPaymentCategoryDisplay(
          item.paymentCategory || item.insClassification || '',
        ),
        status: getStatusFromCode(item.authoriseStatus),
        links: { href: '/setup-and-admin/beneficiary/manage', text: 'MANAGE BENEFICIARY' },
        authoriseStatus: item.authoriseStatus,
        beneficiaryCode: item.referenceIDX || '',
        accountType: item.accountType || '',
        paymentProfile: item.paymentType || item.paymentProfiles || '',
      }));

      setBeneficiariesData(mappedData);

      // Show success snackbar
      setSnackbarMessage('Beneficiaries deleted and submitted for approval');
      setSnackbarOpen(true);
    } catch (error: any) {
      const errorMsg = extractErrorMessage(error);
      setDeleteError(errorMsg || 'Failed to delete beneficiaries. Please try again.');

      // Close the confirmation dialog and show error dialog
      setDeleteDialogOpen(false);
      setDeleteErrorDialogOpen(true);
    } finally {
      setIsDeleting(false);
    }
  }, [
    selectedRows,
    currentPage,
    perPage,
    selectedTab,
    filters,
    sortBy,
    sortAsc,
  ]);

  const handleDownloadClose = useCallback(() => {
    setDownloadDialogOpen(false);
    setDownloadAnchorEl(null);
  }, []);

  const handleCheckboxClick = useCallback(
    (rows: any | any[]) => {
      const selected = Array.isArray(rows) ? rows : rows ? [rows] : [];

      // If "select all" was clicked (array with multiple or zero rows)
      if (Array.isArray(rows)) {
        if (rows.length === 0) {
          // Deselect all
          setSelectedRows([]);
        } else if (rows.length > 1) {
          // Select all - data is already limited to current page (server-side pagination)
          setSelectedRows(selected);
        } else {
          // Single row selection/deselection
          setSelectedRows(selected);
        }
      } else {
        // Single row click
        setSelectedRows(selected);
      }
    },
    [],
  );

  const handleDownload = useCallback(
    async ({ format, sortBy, formatType, selectedFields }: any) => {
      try {
        setDownloadDialogOpen(false);
        setDownloadAnchorEl(null);
        setDownloadError(false);

        // Store params for potential retry
        setLastDownloadParams({ format, sortBy, formatType, selectedFields });

        // Get entity keys from selected rows
        const entityKeys = selectedRows.map((row) => row.entityKey).filter(Boolean);

        if (entityKeys.length === 0) {
          return;
        }

        // Call appropriate API based on format
        let blob: Blob;
        if (format === 'pdf') {
          // PDF uses print endpoint with GET and query params (matching Angular)
          const printPayload = {
            beneficiaryKeys: entityKeys,
            sortOrderAsc: sortBy === 'ascending' ? 'true' : 'false',
            benType: 'all',
          };

          // Backend returns base64-encoded string
          const base64Data = await printBeneficiaries(printPayload);

          if (!base64Data || base64Data.length < 100) {
            throw new Error('Received invalid or empty PDF data from server');
          }

          // Convert base64 to blob
          blob = base64ToBlob(base64Data, 'application/pdf');
        } else {
          // CSV/TXT use export endpoint (with field customization)
          // Build details array from selected rows
          const details = selectedRows.map((row) => ({
            key: String(row.entityKey),
            referenceIDX: row.beneficiaryCode || '',
            bicSwiftCode: row.bicSwiftCode || '',
            accountType: row.accountType || '',
            paymentProfile: row.paymentProfile || '',
          }));

          const exportPayload = {
            details: details,
            standardFormat: formatType === 'standard',
            beneficiaryType: 'All',
            fileType: format.toUpperCase(),
            asc: sortBy === 'ascending',
            selectedFields: selectedFields,
          };

          // Backend returns base64-encoded string
          const base64Data = await exportBeneficiaries(exportPayload);

          if (!base64Data || base64Data.length < 100) {
            throw new Error('Received invalid or empty export data from server');
          }

          // Determine content type based on format
          const contentType = format === 'csv' ? 'text/csv' : 'text/plain';
          blob = base64ToBlob(base64Data, contentType);
        }

        // Check if blob is empty or too small
        if (!blob || blob.size < 100) {
          throw new Error('Received empty or invalid response from server');
        }

        // Check if response might be an error (JSON/HTML instead of expected format)
        // Exclude CSV and TXT which are legitimately text-based
        const isErrorResponse =
          blob.type.includes('json') ||
          blob.type.includes('html') ||
          (blob.type.includes('text') && format === 'pdf');
        if (isErrorResponse) {
          const text = await blob.text();
          throw new Error(`Server returned an error: ${text.substring(0, 200)}`);
        }

        // Trigger file download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        // Generate filename based on format
        const timestamp = new Date().toISOString().split('T')[0];
        link.download = `beneficiaries_${timestamp}.${format}`;

        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        // Show success snackbar
        setSnackbarMessage('Download successful');
        setDownloadError(false);
        setSnackbarOpen(true);
      } catch (error: any) {
        setSnackbarMessage('Download failed');
        setDownloadError(true);
        setSnackbarOpen(true);
      }
    },
    [selectedRows],
  );

  const handleRemoveFilters = useCallback(() => {
    // Always clear dialog-specific filters (paymentCategory, statusCode)
    dispatch(clearFilters());
    
    // If SearchBar is NOT active, also clear search fields (they came from Filter Dialog)
    // If SearchBar IS active, user should clear via SearchBar's own clear button
    if (!advancedSearchType && (filters.counterPartyName || filters.accountNumber || filters.referenceIDX)) {
      dispatch(setFilters({
        counterPartyName: '',
        accountNumber: '',
        referenceIDX: '',
      }));
    }
  }, [dispatch, advancedSearchType, filters]);

  const handleRetryDownload = useCallback(() => {
    if (lastDownloadParams) {
      setSnackbarOpen(false);
      handleDownload(lastDownloadParams);
    }
  }, [lastDownloadParams, handleDownload]);

  const handleDeleteErrorClose = useCallback(() => {
    setDeleteErrorDialogOpen(false);
    setDeleteError(null);
  }, []);

  const handleDeleteRetry = useCallback(() => {
    setDeleteErrorDialogOpen(false);
    handleDeleteConfirm();
  }, [handleDeleteConfirm]);

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
  const handleLinkClick = useCallback(
    async (row: any) => {
      if (row && row.links && row.links.text === 'MANAGE BENEFICIARY') {
        try {
          // Extract entityKey from the mapped row data
          const entityKey = row.entityKey;

          if (!entityKey) {
            return;
          }

          // Fetch complete beneficiary details from API
          const beneficiaryDetails = await findBeneficiaryById(entityKey);

          // Load beneficiary data into Redux store
          dispatch(loadBeneficiary(beneficiaryDetails));

          // Navigate to manage page
          router.push(`/setup-and-admin/beneficiary/manage` as any);
        } catch (error) {
        }
      }
    },
    [router, dispatch],
  );

  // Check if there's truly no data at all (not just filtered out)
  const hasNoDataAtAll =
    totalRecords === 0 &&
    Object.keys(filters).length === 0 &&
    selectedTab === 0;

  // Memoize filter button
  const filterButtons = useMemo(() => {
    const isDisabled = totalRecords === 0;
    
    return [
      {
        children: (
          <>
            <Image
              src={FunnelIcon}
              alt="filter"
              width={24}
              height={24}
              style={{ 
                marginRight: 4,
                opacity: isDisabled ? 0.4 : 1,
                filter: isDisabled ? 'grayscale(100%)' : 'none'
              }}
            />
            <span style={{ fontSize: '14px', fontWeight: 700 }}>Filter</span>
          </>
        ),
        buttonVariant: 'tertiary',
        'data-testid': buildTestId(testIdPrefix, 'filter-button'),
        onClick: handleFilterOpen,
        disabled: isDisabled,
      },
    ];
  }, [handleFilterOpen, totalRecords]);

  // Memoize action buttons for right panel
  const rightPanelButtons = useMemo(() => {
    const count = selectedRows.length;
    
    // Check for dialog-specific filters
    const hasDialogFilters = !!(filters.paymentCategory || filters.statusCode);
    
    // Check for search filters (name, account, code)
    const hasSearchFilters = !!(
      filters.counterPartyName || 
      filters.accountNumber || 
      filters.referenceIDX
    );
    
    // If SearchBar is actively being used (has a search type selected), 
    // don't show "Remove Filters" for search fields - user should clear via SearchBar
    const searchBarActive = !!advancedSearchType;
    
    // Show "Remove Filters" if:
    // 1. Dialog-specific filters are set (paymentCategory, statusCode), OR
    // 2. Search filters are set AND SearchBar is NOT actively being used (meaning from Filter Dialog)
    const hasFilters = hasDialogFilters || (hasSearchFilters && !searchBarActive);
    
    // Only show delete button if at least one ACT status is selected
    const hasACT = selectedRows.some((row: any) => row.authoriseStatus === 'ACT');

    const handleDeleteClick = () => {
      // Check if selection has mixed statuses (ACT + non-ACT)
      const actRows = selectedRows.filter((row: any) => row.authoriseStatus === 'ACT');
      const hasNonACT = selectedRows.length > actRows.length;

      setIsMixedStatusDelete(hasNonACT);
      setDeleteDialogOpen(true);
    };

    return (
      <ListRightPanelActions
        selectedCount={count}
        hasFilters={hasFilters}
        onRemoveFilters={handleRemoveFilters}
        onDownloadClick={() => {
          setDownloadDialogOpen(true);
          setDownloadAnchorEl(tableContainerRef.current);
        }}
        onDeleteClick={hasACT ? handleDeleteClick : undefined}
        testIdPrefix={buildTestId(testIdPrefix, 'right-panel-actions')}
      />
    );
  }, [selectedRows, filters, advancedSearchType, handleRemoveFilters]);

  // Memoize table head cells
  const tableHeadCells = useMemo(
    () => [
      { id: 'accountDetails', label: t('beneficiaryName'), numeric: false },
      { id: 'beneficiaryCode', label: t('beneficiaryCode'), numeric: false },
      { id: 'bankName', label: t('bankName'), numeric: false },
      { id: 'bicSwiftCode', label: t('bicSwift'), numeric: false },
      { id: 'paymentCategory', label: t('paymentCategory'), numeric: false },
      { id: 'status', label: t('status'), numeric: false, minWidth: 240 },
      { id: 'link', label: t('quickLinks'), numeric: false },
    ],
    [t],
  );

  // Memoize table data
  const tableData = useMemo(
    () => ({
      columns: TABLE_COLUMNS,
      headCells: tableHeadCells,
      rowButton: true,
      rows: mappedRows,
    }),
    [tableHeadCells, mappedRows],
  );

  // Memoize breadcrumb links
  const breadcrumbLinks = useMemo(
    () => [
      { href: '/', label: t('dashboard') },
      { href: '/beneficiaries-hub', label: t('beneficiariesHubBreadcrumb') },
    ],
    [t],
  );

  // Advanced search configuration
  const advancedSearchOptions = useMemo(
    () => [
      { label: 'Name', value: 'name' },
      { label: 'Account number', value: 'accountNumber' },
      { label: 'Beneficiary code', value: 'beneficiaryCode' },
    ],
    []
  );

  const advancedSearchPlaceholderMap = useMemo(
    () => ({
      name: 'Enter beneficiary name',
      accountNumber: 'Enter account number',
      beneficiaryCode: 'Enter beneficiary code',
    }),
    []
  );

  const handleAdvancedSearch = useCallback(
    (searchType: string, searchValue: string) => {
      // Map search types to API parameter names
      const paramMap: Record<string, string> = {
        name: 'counterPartyName',
        accountNumber: 'accountNumber',
        beneficiaryCode: 'referenceIDX',
      };

      const apiParam = paramMap[searchType];
      if (apiParam && searchValue) {
        // Clear all search-related filter fields first to avoid conflicts
        const clearedSearchFilters = {
          counterPartyName: '',
          accountNumber: '',
          referenceIDX: '',
        };
        
        // Then set the new search parameter
        dispatch(setFilters({
          ...clearedSearchFilters,
          [apiParam]: searchValue,
        }));
        
        // Reset to first page when searching
        setCurrentPage(1);
      }
    },
    [dispatch]
  );

  const handleClearSearchBar = useCallback(() => {
    // Clear SearchBar state
    dispatch(setSearchType(''));
    dispatch(setSearchValue(''));
    
    // Clear search-related filters
    dispatch(setFilters({
      counterPartyName: '',
      accountNumber: '',
      referenceIDX: '',
    }));
    
    // Reset to first page
    setCurrentPage(1);
  }, [dispatch]);

  return (
    <>
      <ListPageWrapper
        breadcrumbLinks={breadcrumbLinks}
        title={t('beneficiariesHub')}
        action={
          <Box
            sx={{
              '&:hover img': {
                filter: 'brightness(0) invert(1)',
              },
            }}
            data-testid="create-beneficiary-button"
          >
            <Button
              buttonVariant="secondary"
              data-testid={buildTestId(testIdPrefix, 'create-beneficiary-button')}
              startIcon={<Image src={AddIcon} alt="addicon" width={24} height={24} />}
              style={{ height: 48 }}
              onClick={() => { dispatch(resetBeneficiary()); router.push('/setup-and-admin/beneficiary/create' as any); }}
            >
              {t('createBeneficiary')}
            </Button>
          </Box>
        }
        containerSpacing={4}
        containerPaddingBottom={4}
        titleFontSize="28px"
        titleMinHeight="48px"
        contentRef={tableContainerRef}
        testIdPrefix={testIdPrefix}
        searchBar={{
          searchTypeOptions: advancedSearchOptions,
          searchTypePlaceholder: 'Search by type',
          searchFieldType: 'input',
          searchFieldPlaceholder: 'Select a search type first',
          searchFieldPlaceholderMap: advancedSearchPlaceholderMap,
          onSearch: handleAdvancedSearch,
          onClear: handleClearSearchBar,
          searchType: advancedSearchType,
          searchValue: advancedSearchValue,
          onSearchTypeChange: (value: string) => dispatch(setSearchType(value)),
          onSearchValueChange: (value: string) => dispatch(setSearchValue(value)),
        }}
      >
        {' '}
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
              filterButtons={filterButtons}
              rightPanelContent={rightPanelButtons}
              onCheckboxClick={handleCheckboxClick}
              selectedRows={selectedRows}
              showTabs={true}
              hideTabsWhenEmpty={false}
              tabs={statusTabs.map((label, index) => ({ label, value: index }))}
              selectedTab={selectedTab}
              onTabChange={setSelectedTab}
              tabsContainerSx={{ backgroundColor: '#F8F8FA', borderRadius: 0 }}
              tableStyle={{}}
              onPageChange={handlePageChange}
              onPerPageChange={handlePerPageChange}
              onQuickLinkClick={handleLinkClick}
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
                    title="No beneficiaries yet"
                    description="You haven't added any beneficiaries yet. Add one now to start making payments."
                    icon={
                      <Image
                        src={IconPeopleProfile}
                        alt="no beneficiaries"
                        width={32}
                        height={32}
                      />
                    }
                  />
                ) : (
                  <EmptyState
                    title="No results found"
                    description="Please refine your search and try again."
                    icon={<Image src={AvatarAlert} alt="no results" width={32} height={32} />}
                  />
                )
              }
            />
          )}
        </div>
      </ListPageWrapper>
      <BeneficiaryFilterDialog
        open={filterDialogOpen}
        anchorEl={filterAnchorEl}
        onClose={handleFilterClose}
        onApply={handleFilterApply}
        initialValues={filters}
      />
      <DownloadBeneficiaryDialog
        open={downloadDialogOpen}
        anchorEl={downloadAnchorEl}
        onClose={handleDownloadClose}
        onDownload={handleDownload}
        title="Download Beneficiaries"
        testIdPrefix={buildTestId(testIdPrefix, 'download-dialog')}
        beneficiaryCount={selectedRows.length}
      />
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleDeleteClose}
        onPrimaryCTA={handleDeleteConfirm}
        onSecondaryCTA={handleDeleteClose}
        selectedCount={selectedRows.length}
        exclamationIcon={AvatarAlert}
        itemLabel={isMixedStatusDelete ? undefined : `${selectedRows.length} ${t('beneficiariesHub').toLowerCase()} ${tCommon('markedForDeletion')}`}
        itemLabel2={isMixedStatusDelete ? undefined : tCommon('areYouSureYouWantToDelete', { selectedCount: selectedRows.length, itemLabel: t('beneficiariesHub').toLowerCase() })}
        markedCount={isMixedStatusDelete ? undefined : selectedRows.length}
        title={isMixedStatusDelete ? undefined : undefined}
        message={
          isMixedStatusDelete ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 500, fontSize: '16px', marginBottom: '8px' }}>
                Some beneficiaries can&apos;t be deleted
              </div>
              <div style={{ fontWeight: 400, fontSize: '16px', color: '#222E37' }}>
                The selected beneficiaries include items that cannot be deleted because of their
                current status.
              </div>
            </div>
          ) : undefined
        }
        primaryCTALabel={isMixedStatusDelete ? 'Delete eligible items' : 'YES, DELETE THE SELECTED ITEMS'}
        secondaryCTALabel="CANCEL"
        testIdPrefix={buildTestId(testIdPrefix, 'delete-dialog')}
      />
      <DeleteConfirmationDialog
        open={deleteErrorDialogOpen}
        onClose={handleDeleteErrorClose}
        onPrimaryCTA={handleDeleteRetry}
        onSecondaryCTA={handleDeleteErrorClose}
        selectedCount={0}
        exclamationIcon={AvatarAlert}
        itemLabel=""
        markedCount={undefined}
        showUndoWarning={false}
        title="System error"
        message={
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '16px' }}>
              Something went wrong
            </div>
            <div style={{ fontSize: '14px', color: '#222E37' }}>
              We are unable to delete these beneficiaries.
              <br />
              Please try again or contact your bank representative for assistance.
            </div>
          </div>
        }
        primaryCTALabel="Try again"
        secondaryCTALabel="Dismiss"
        secondaryCTAWidth="auto"
        tertiaryCTAWidth="auto"
        testIdPrefix={buildTestId(testIdPrefix, 'delete-error-dialog')}
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
export default BeneficiariesHub;
