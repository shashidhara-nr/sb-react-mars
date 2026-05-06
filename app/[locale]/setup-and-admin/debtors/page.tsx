'use client';
import { Box, Snackbar, Alert } from '@mui/material';
import { Button, Loader } from 'dist/standard-bank-react';
import { buildTestId } from 'src/utils/testIds';
import DeleteConfirmationDialog from 'components/common/DeleteConfirmationDialog';
import EmptyState from 'components/common/EmptyState';
import AvatarAlert from 'public/icons/avatar_alert.svg';
import AlertCircleOutline from 'public/icons/alert_circle_outline.svg';
import ReloadIcon from 'public/icons/icn_reload_refresh.svg';
import TableContainer from '@molecules/TableContainer/TableContainer';
import { useRouter } from 'next/navigation';
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useAppDispatch } from '@lib/hooks/useAppDispatch';
import { loadManagedDebtor } from '@store/slices/createDebtorSlice';
import Image from 'next/image';
import FunnelIcon from 'public/icons/icn_funnel.svg';
import SearchIcon from 'public/icons/icn_search_black.svg';
import UserIcon from 'public/icons/icn_people_1.svg';
import CloseIcon from 'public/icons/icn_close_circle.svg';
import CloseCircleIcon from 'public/icons/icn_close_circle.svg';
import DeleteIcon from 'public/icons/icn_bin.svg';
import AddIcon from 'public/icons/icn_add.svg';
import DownloadIcon from 'public/icons/col-icon-download.svg';
import CheckCircleIcon from 'public/icons/icn_check_circle_white.svg';
import WarningIcon from 'public/icons/icn_warning_outline.svg';
import FilterDebtorsDrawer, {
  FilterValues,
} from '@molecules/FilterDebtorsDrawer/FilterDebtorsDrawer';
import DownloadDebtorDialog from '@molecules/DownloadDebtorDialog/DownloadDebtorDialog';
import { ListPageWrapper } from 'components/sections';
import { ListRightPanelActions } from 'components/common';
import { useTranslations } from 'next-intl';
import {
  getDebtors,
  DebtorListItem,
  exportDebtors,
  printDebtors,
  findDebtorById,
  deleteDebtors,
  DEBTOR_SORT_COLUMN_MAP,
} from 'lib/api/debtorApi';
import { getCollectionTypesList } from 'lib/api/collectionTypesApi';

enum DebtorStatusCodes {
  ACTIVE = 'ACT',
  UNUSABLE = 'UNU',
  AWAITING_CUSTOMER_AUTHORISATION = 'ACA',
  AWAITING_APPROVAL = 'ACA',
  AWAITING_CUSTOMER_REPAIR = 'ACR',
  AWAITING_CUSTOMER_AUDIT = 'ACI',
  PARTIALLY_CUSTOMER_AUTHORISED = 'PCA',
  AWAITING_BANK_AUTHORISATION = 'ABA',
  AWAITING_BANK_AUDIT = 'ABI',
  AWAITING_BANK_REPAIR = 'ABR',
  PARTIALLY_BANK_AUTHORISED = 'PBA',
}

const getStatusCodeFromName = (statusName: string): string | undefined => {
  const statusNameToCodeMap: Record<string, string> = {
    'Active': DebtorStatusCodes.ACTIVE,
    'Unusable': DebtorStatusCodes.UNUSABLE,
    'Awaiting Approval': DebtorStatusCodes.AWAITING_CUSTOMER_AUTHORISATION,
    'Awaiting Customer Repair': DebtorStatusCodes.AWAITING_CUSTOMER_REPAIR,
    'Awaiting Customer Authorisation': DebtorStatusCodes.AWAITING_CUSTOMER_AUTHORISATION,
    'Partially Customer Authorised': DebtorStatusCodes.PARTIALLY_CUSTOMER_AUTHORISED,
    'Awaiting Bank Authorisation': DebtorStatusCodes.AWAITING_BANK_AUTHORISATION,
    'Awaiting Bank Audit': DebtorStatusCodes.AWAITING_BANK_AUDIT,
    'Awaiting Bank Repair': DebtorStatusCodes.AWAITING_BANK_REPAIR,
    'Partially Bank Authorised': DebtorStatusCodes.PARTIALLY_BANK_AUTHORISED,
  };
  return statusNameToCodeMap[statusName];
};

const STATUS_CODES = [
  undefined, 
  DebtorStatusCodes.AWAITING_CUSTOMER_REPAIR, 
  'ACA,ACI', 
  DebtorStatusCodes.AWAITING_BANK_AUTHORISATION, 
  DebtorStatusCodes.ACTIVE, 
] as const;


const TABLE_COLUMNS = [
  'id',
  { key: 'debtorName', type: 'account', accountIcon: false },
  'debtorCode', //BARR-1157
  'debtorReference',
  'bicSwift',
  'bankName',
  'transactionLimit',
  { key: 'status', type: 'chip' },
  { key: 'links', type: 'link' },
] as const;

const DebtorsPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const translateLang = useTranslations('debtorsHubData');
  const tCommon = useTranslations('common');
  const testIdPrefix = 'debtors-list';
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const TABLE_HEAD_CELLS = useMemo(() => [
    { id: 'id', label: translateLang('id'), numeric: true },
    { id: 'debtorName', label: translateLang('debtorNameLabel'), numeric: false },
    { id: 'debtorCode', label: translateLang('debtorCodeLabel'), numeric: false },
    { id: 'debtorReference', label: translateLang('debtorReferenceLabel'), numeric: false },
    { id: 'bicSwift', label: translateLang('bicSwift'), numeric: false },
    { id: 'bankName', label: translateLang('bankName'), numeric: false },
    { id: 'transactionLimit', label: translateLang('transactionLimitLabel'), numeric: false },
    { id: 'status', label: translateLang('statusLabel'), numeric: false },
    { id: 'links', label: translateLang('quickLinks'), numeric: false },
  ], [translateLang]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [filterValues, setFilterValues] = useState<Partial<FilterValues>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [totalRecords, setTotalRecords] = useState(0);
  const [debtorsData, setDebtorsData] = useState<DebtorListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteErrorDialogOpen, setDeleteErrorDialogOpen] = useState(false);
  const [isMixedStatusDelete, setIsMixedStatusDelete] = useState(false);
  const [sortBy, setSortBy] = useState<string | number>('debtorName');
  const [sortAsc, setSortAsc] = useState(true);
  const [downloadError, setDownloadError] = useState(false);
  const [lastDownloadParams, setLastDownloadParams] = useState<any>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const [collectionTypes, setCollectionTypes] = useState<string[]>([]);

  // Debounce search text
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    const fetchCollectionTypes = async () => {
      try {
        const response = await getCollectionTypesList();
        const list = response.collectionTypeList || [];
        const sortedList = [...list].sort((a: any, b: any) => {
          const nameA = (a.collectionTypeName || '').toLowerCase();
          const nameB = (b.collectionTypeName || '').toLowerCase();
          return nameA.localeCompare(nameB);
        });
        const types = sortedList
          .map((item: any) => item.collectionTypeName)
          .filter((name: string) => name);
        setCollectionTypes(types);
      } catch (error) {
        setCollectionTypes([]);
      }
    };
    fetchCollectionTypes();
  }, []);

  // Fetch debtors from API when filters, pagination, or sorting changes
  useEffect(() => {
    const fetchDebtors = async () => {
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
          if (statusCode) {
            // For comma-separated values, split and use first as status, all for filterStatus
            if (typeof statusCode === 'string' && statusCode.includes(',')) {
              const codes = statusCode.split(',');
              queryParams.status = codes[0];
              queryParams.filterStatus = statusCode;
            } else {
              queryParams.status = statusCode;
              queryParams.filterStatus = statusCode;
            }
          }
        }

        // Add drawer filters (following beneficiary pattern - skip empty values)
        if (filterValues.debtorName) {
          queryParams.counterPartyName = filterValues.debtorName;
        }
        if (filterValues.accountNumber) {
          queryParams.accountNumber = filterValues.accountNumber;
        }
        if (filterValues.debtorCode) {
          queryParams.referenceIDX = filterValues.debtorCode;
        }
        if (filterValues.collectionType) {
          queryParams.collectionType = filterValues.collectionType;
        }
        if (filterValues.bic) {
          queryParams.bicSwiftCode = filterValues.bic;
        }
        if (filterValues.bankName) {
          queryParams.bankName = filterValues.bankName;
        }
        if (filterValues.status) {
          // Status filter now uses codes directly (e.g., "ACT", "ABR", "UNU")
          // If it's already a valid code, use it; otherwise try to convert from name for backward compatibility
          const isStatusCode = ['ACT', 'UNU', 'ABR', 'ABA', 'ACA', 'ACI', 'ACR', 'PCA', 'PBA', 'ABI'].includes(filterValues.status);
          if (isStatusCode) {
            queryParams.filterStatus = filterValues.status;
            queryParams.status = filterValues.status;
          } else {
            // Fallback to name conversion for backward compatibility
            const statusCode = getStatusCodeFromName(filterValues.status);
            if (statusCode) {
              queryParams.filterStatus = statusCode;
              queryParams.status = statusCode;
            }
          }
        }

        // Smart search: use counterPartyName for search (as per spec)
        if (debouncedSearchText.trim()) {
          queryParams.counterPartyName = debouncedSearchText.trim();
        }

        // Add sorting with column mapping (following beneficiary pattern)
        if (sortBy) {
          // Map table column key to backend field name
          const backendFieldName = DEBTOR_SORT_COLUMN_MAP[sortBy] || sortBy;
          queryParams.sortBy = backendFieldName;
          queryParams.asc = sortAsc;
        }

        // Request filtered data from server
        const response = await getDebtors(queryParams);

        // Set total records for pagination
        setTotalRecords(response.rowCount || 0);

        // Handle API response - use debtorDetailTOs as primary source (contains collectionProfiles)
        let apiData: any[] = [];
        if (response.debtorDetailTOs && Array.isArray(response.debtorDetailTOs)) {
          apiData = response.debtorDetailTOs;
        } else if (response.counterPartyList && Array.isArray(response.counterPartyList)) {
          // Fallback to counterPartyList if debtorDetailTOs is not available
          apiData = response.counterPartyList;
        }

        // Map API data to the format expected by the table
        const mappedData = apiData.map((item: any) => ({
          id: String(item.entityKey || Math.random()),
          entityKey: item.entityKey,
          versionNumber: item.versionNumber || 0,
          debtorName: {
            name: item.counterPartyName || '',
            accountNumber: item.accountNumber || '',
            branch: '',
            icon: '',
          },
          debtorCode: item.referenceIDX || '',
          debtorReference: item.counterPartyReference || '',
          collectionType: item.collectionProfiles || item.collectionTypeNames || '',
          bicSwift: item.bicSwiftCode || '',
          bankName: item.bankName?.trim() || '',
          transactionLimit: item.transactionLimit ? `ZAR ${item.transactionLimit.toLocaleString()}` : '',
          status: getStatusFromCode(item.statusCode || item.authoriseStatus),
          links: { href: '/setup-and-admin/debtors/manage', text: 'MANAGE DEBTOR' },
          authoriseStatus: item.authoriseStatus,
          accountNumber: item.accountNumber || '',
          // Store original API data for delete operation (needs full payload)
          _originalData: item,
        }));
        setDebtorsData(mappedData);
      } catch (err: any) {
        console.error('Error fetching debtors:', err);
        setError(err.message || 'Failed to fetch debtors');
        setDebtorsData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDebtors();
  }, [selectedTab, filterValues, debouncedSearchText, currentPage, perPage, sortBy, sortAsc, refetchTrigger]);

  // Helper function to map status codes to display format (using debtor status codes)
  const getStatusFromCode = (code: string) => {
    const statusMap: Record<string, { value: string; color: string }> = {
      ACT: { value: translateLang('active'), color: 'success' },
      UNU: { value: translateLang('unusable'), color: 'default' },
      ACA: { value: translateLang('awaitingCustomerAuthorisation'), color: 'warning' },
      ACR: { value: translateLang('awaitingCustomerRepair'), color: 'error' },
      ACI: { value: translateLang('awaitingCustomerAudit'), color: 'info' },
      PCA: { value: translateLang('partiallyCustomerAuthorised'), color: 'warning' },
      ABA: { value: translateLang('awaitingBankAuthorisation'), color: 'warning' },
      ABI: { value: translateLang('awaitingBankAudit'), color: 'info' },
      ABR: { value: translateLang('awaitingBankRepair'), color: 'error' },
      PBA: { value: translateLang('partiallyBankAuthorised'), color: 'warning' },
    };
    return statusMap[code] || { value: code || 'Unknown', color: 'default' };
  };

   // Memoize statustabs
    const STATUS_TABS = useMemo(() => [
         translateLang('allRecords'),
  translateLang('needsAction'),
  translateLang('awaitingApproval'),
  translateLang('processing'),
  translateLang('active'),
    ], [translateLang]);

  // Memoize mapped rows - data is already filtered by server
  const mappedRows = useMemo(() => {
    return debtorsData.map((row: any) => ({
      ...row,
      debtorName: {
        ...row.debtorName,
        accountNumber: row?.debtorName?.accountNumber
          ? `${translateLang('accNumber')}: ${row.debtorName.accountNumber}`
          : '',
      },
    }));
  }, [debtorsData, translateLang]);

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
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  const handleDownloadClose = useCallback(() => {
    setDownloadDialogOpen(false);
    setDownloadAnchorEl(null);
  }, []);

  const handleDeleteClose = useCallback(() => {
    setDeleteDialogOpen(false);
    setDeleteError(null);
    setIsMixedStatusDelete(false);
  }, []);

  const handleDelete = useCallback(async () => {
    if (selectedRows.length === 0) return;

    try {
      setIsDeleting(true);
      setDeleteError(null);

      // Only delete debtors with ACT status (following thin client Mars logic)
      const actRows = selectedRows.filter((row: any) => row.authoriseStatus === 'ACT');
      if (actRows.length === 0) {
        setIsDeleting(false);
        setDeleteDialogOpen(false);
        return;
      }

      // Fetch full details for each ACT debtor before deleting (to get classification field)
      const fullDebtorDetailsPromises = actRows.map((row: any) => 
        findDebtorById(row.entityKey)
      );
      
      const fullDebtors = await Promise.all(fullDebtorDetailsPromises);

      // Prepare delete payload - ONLY 5 fields backend confirmed working
      const deletePayload = fullDebtors.map((debtor: any) => ({
        entityKey: debtor.entityKey,
        counterPartyName: debtor.counterPartyName || '',
        referenceIDX: debtor.referenceIDX || '',
        originatingChannel: debtor.originatingChannel || 'Online capture',
        classification: debtor.classification || ''
      }));

      console.log('🗑️ DELETE PAYLOAD BEING SENT:', JSON.stringify(deletePayload, null, 2));

      // Call delete API
      await deleteDebtors(deletePayload);

      // Close dialog and clear selections
      setDeleteDialogOpen(false);
      setSelectedRows([]);

      // Refresh the list to show updated data
      const position = (currentPage - 1) * perPage;
      const queryParams: any = {
        pageSize: perPage,
        position: position,
      };

      if (selectedTab !== 0) {
        const statusCode = STATUS_CODES[selectedTab];
        if (statusCode) {
          // For comma-separated values, split and use first as status, all for filterStatus
          if (typeof statusCode === 'string' && statusCode.includes(',')) {
            const codes = statusCode.split(',');
            queryParams.status = codes[0];
            queryParams.filterStatus = statusCode;
          } else {
            queryParams.status = statusCode;
            queryParams.filterStatus = statusCode;
          }
        }
      }

      Object.entries(filterValues).forEach(([key, value]) => {
        if (value) {
          if (key === 'debtorName') queryParams.counterPartyName = value;
          else if (key === 'debtorCode') queryParams.referenceIDX = value;
          else if (key === 'bic') queryParams.bicSwiftCode = value;
          else if (key === 'status') {
            queryParams.filterStatus = value;
            queryParams.status = value;
          }
          else queryParams[key] = value;
        }
      });

      if (debouncedSearchText.trim()) {
        queryParams.counterPartyName = debouncedSearchText.trim();
      }

      if (sortBy) {
        const backendFieldName = DEBTOR_SORT_COLUMN_MAP[sortBy] || sortBy;
        queryParams.sortBy = backendFieldName;
        queryParams.asc = sortAsc;
      }

      const response = await getDebtors(queryParams);
      setTotalRecords(response.rowCount || 0);

      const apiData = response.counterPartyList || response.debtorDetailTOs || [];
      const mappedData = apiData.map((item: any) => ({
        id: String(item.entityKey || Math.random()),
        entityKey: item.entityKey,
        versionNumber: item.versionNumber || 0,
        debtorName: {
          name: item.counterPartyName || '',
          accountNumber: item.accountNumber || '',
          branch: item.branchSortCode || '',
          icon: '',
        },
        debtorCode: item.referenceIDX || '',
        debtorReference: item.counterPartyReference || '',
        collectionType: item.collectionType || '',
        bicSwift: item.bicSwiftCode || '',
        bankName: item.bankName?.trim() || '',
        transactionLimit: item.transactionLimit ? `ZAR ${item.transactionLimit.toLocaleString()}` : '',
        status: getStatusFromCode(item.statusCode || item.authoriseStatus),
        links: { href: '/setup-and-admin/debtors/manage', text: 'MANAGE DEBTOR' },
        authoriseStatus: item.authoriseStatus,
        accountNumber: item.accountNumber || '',
        _originalData: item,
      }));
      setDebtorsData(mappedData);

      // Show success snackbar after delete
      setSnackbarMessage(translateLang('debtorsDeletedSuccessfully'));
      setSnackbarOpen(true);
    } catch (error: any) {
      console.error('Error deleting debtors:', error);
      setDeleteDialogOpen(false); // Close delete confirmation
      setDeleteErrorDialogOpen(true); // Show error dialog
    } finally {
      setIsDeleting(false);
    }
  }, [selectedRows, currentPage, perPage, selectedTab, filterValues, debouncedSearchText, sortBy, sortAsc, translateLang]);

  const handleDownload = useCallback(async ({ format, sortBy, formatType, selectedFields }: any) => {
    try {
      setDownloadDialogOpen(false);
      setDownloadAnchorEl(null);
      setDownloadError(false);

      setLastDownloadParams({ format, sortBy, formatType, selectedFields });

      if (format === 'pdf') {
        const debtorKeys = selectedRows.map((row: any) => row.entityKey).filter(Boolean);
        const base64Data = await printDebtors({
          debtorKeys,
          sortOrderAsc: sortBy === 'ascending'
        });
        const blob = new Blob([Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `debtors.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        setSnackbarMessage('Download successful');
        setDownloadError(false);
        setSnackbarOpen(true);
        return;
      }

      const details = selectedRows.map((row: any) => ({
        key: String(row.entityKey || ''),
        referenceIDX: row.debtorCode || '',
        bicSwiftCode: row.bicSwift || '',
        accountType: row._originalData?.accountType || '',
        collectionType: row.collectionType || '',
      }));

      // Base fields that are always included in export
      const baseFields = [
        "referenceIDX", 
        "counterPartyName", 
        "accountNumber", 
        "ibanNumber", 
        "bankName", 
        "bankAddress3",  // Always included by default
        "branchNumber", 
        "swiftAddress", 
        "address1", 
        "country", 
        "counterPartyReference", 
        "transactionLimit", 
        "transactionLimitCurrency", 
        "originatingChannel", 
        "authoriseStatus", 
        "action", 
        "instrumentClassification", 
        "bankTownName", 
        "bankBranchName", 
        "accountType",
        "collectionType"
      ];

      // Add optional fields only if user selected them (bankAddress1, bankAddress2, address2, address3)
      const optionalFields = selectedFields && selectedFields.length > 0 
        ? selectedFields.filter((field: string) => 
            ['bankAddress1', 'bankAddress2', 'address2', 'address3'].includes(field)
          )
        : [];

      // Combine base fields with user-selected optional fields
      const finalSelectedFields = [...baseFields, ...optionalFields];

      const payload = {
        details: details,
        standardFormat: formatType === 'standard',
        debtorType: '',
        fileType: format.toUpperCase() as 'CSV' | 'TXT',
        asc: sortBy === 'ascending',
        selectedFields: finalSelectedFields,
      };

      const responseText = await exportDebtors(payload);

      const contentType = format === 'csv' ? 'text/csv' : 'text/plain';
      const blob = new Blob([responseText], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `debtors.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Show success snackbar
      setSnackbarMessage('Download successful');
      setDownloadError(false);
      setSnackbarOpen(true);
    } catch (error: any) {
      console.error('Error downloading debtors:', error);
      setSnackbarMessage('Download failed');
      setDownloadError(true);
      setSnackbarOpen(true);
    }
  }, [selectedRows]);

  const handleCreateClick = useCallback(() => {
    router.push('/setup-and-admin/debtors/create' as any);
  }, [router]);

  const handleRemoveFilters = useCallback(() => {
    setFilterValues({});
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchText('');
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
          // Select all - limit to current page only
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

  // Memoize filter button
  const filterButtons = useMemo(() => {
    // Only disable when API returns 200 with empty list AND no active filters/search/tab
    const hasActiveSearchOrFilter = 
      debouncedSearchText.trim() !== '' || 
      Object.keys(filterValues).length > 0 || 
      selectedTab !== 0;
    const isDisabled = !loading && !error && totalRecords === 0 && !hasActiveSearchOrFilter;
    return [
      {
        children: (
          <>
            <Image
              src={FunnelIcon}
              alt="filter"
              width={16}
              height={16}
              style={{ 
                marginRight: 4,
                opacity: isDisabled ? 0.4 : 1,
                filter: isDisabled ? 'grayscale(100%)' : 'none'
              }}
            />
            Filter
          </>
        ),
        buttonVariant: 'tertiary',
        onClick: handleFilterClick,
        disabled: isDisabled,
        'data-testid': buildTestId(testIdPrefix, 'filter-button'),
        style: { marginTop: '16px', marginBottom: '16px' },
      },
    ];
  }, [handleFilterClick, totalRecords, loading, error, debouncedSearchText, filterValues, selectedTab]);

  // Memoize action buttons for right panel
  const rightPanelButtons = useMemo(() => {
    const count = selectedRows.length;
    const hasFilters = Object.keys(filterValues).length > 0;
    // Only show delete button if at least one ACT status is selected (following thin client Mars logic)
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
        testIdPrefix={buildTestId(testIdPrefix, 'right-panel-actions')}
        selectedCount={count}
        hasFilters={hasFilters}
        onRemoveFilters={handleRemoveFilters}
        onDownloadClick={() => {
          setDownloadDialogOpen(true);
          setDownloadAnchorEl(tableContainerRef.current);
        }}
        onDeleteClick={hasACT ? handleDeleteClick : undefined}
      />
    );
  }, [selectedRows, filterValues, handleRemoveFilters]);

  const rowsWithManageLinkTestId = useMemo(() => {
    return mappedRows.map((row) => ({
      ...row,
      links: row.links ? {
        ...row.links,
        text: (
          <span data-testid={buildTestId(testIdPrefix, 'manage-debtor-link', row.id)}>
            {row.links?.text ?? ''}
          </span>
        ),
      } : null,
    }));
  }, [mappedRows, testIdPrefix]);

  const tableData = useMemo(
    () => ({
      columns: TABLE_COLUMNS,
      headCells: TABLE_HEAD_CELLS,
      rowButton: true,
      rows: rowsWithManageLinkTestId,
    }),
    [rowsWithManageLinkTestId, TABLE_COLUMNS, TABLE_HEAD_CELLS],
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

  // Handle sorting changes
  const handleSortChange = useCallback((column: string, order: 'asc' | 'desc') => {
    setSortBy(column);
    setSortAsc(order === 'asc');
  }, []);

  // Handle link click for manage debtor
  const handleLinkClick = useCallback(async (row: any) => {
    const linkText = row?.links?.text;
    const rawText =
      typeof linkText === 'string'
        ? linkText
        : linkText && typeof (linkText as any).props?.children !== 'undefined'
        ? String((linkText as any).props.children)
        : '';

    if (String(rawText).toUpperCase().includes('MANAGE DEBTOR')) {
      try {
        // Get entityKey from row
        const entityKey = row?.id || row?.entityKey;
        
        if (!entityKey) {
          return;
        }

        // Fetch complete debtor details from API
        const debtorDetails = await findDebtorById(entityKey);

        // Load debtor data into Redux store
        dispatch(loadManagedDebtor(debtorDetails));

        // Navigate to manage page
        router.push(`/setup-and-admin/debtors/manage` as any);
      } catch (error) {
        console.error('Error loading debtor details:', error);
      }
    }
  }, [router, dispatch]);

  // Memoize breadcrumb links
  const breadcrumbLinks = useMemo(
    () => [
      { href: '/', label: translateLang('dashboard') },
      { href: '/debtors', label: translateLang('debtorsTitle') },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Handle reload for error state
  const handleReload = useCallback(() => {
    setRefetchTrigger((prev: number) => prev + 1);
  }, []);

  // Error state content with reload button
  const errorStateContent = useMemo(() => (
    <EmptyState
      title={translateLang('failedToLoad')}
      description={translateLang('failedToLoadDescription')}
      buttonLabel={translateLang('reload')}
      onButtonClick={handleReload}
      icon={
        <Image 
          src={AlertCircleOutline} 
          alt="error" 
          width={48} 
          height={48}
          style={{ filter: 'invert(27%) sepia(93%) saturate(4068%) hue-rotate(346deg) brightness(89%) contrast(87%)' }}
        />
      }
      buttonIcon={<Image src={ReloadIcon} alt="reload" width={20} height={20} />}
      testIdPrefix={buildTestId(testIdPrefix, 'error-state')}
    />
  ), [translateLang, handleReload, testIdPrefix]);

  // Empty state content - show different messages based on context
  const emptyStateContent = useMemo(() => {
    const hasActiveSearchOrFilter = 
      debouncedSearchText.trim() !== '' || 
      Object.keys(filterValues).length > 0 || 
      selectedTab !== 0;
    
    if (hasActiveSearchOrFilter) {
      return (
        <EmptyState
          title={translateLang('noResultsFound')}
          description={translateLang('noResultsFoundDescription')}
          icon={<Image src={SearchIcon} alt="search" width={48} height={48} />}
          testIdPrefix={buildTestId(testIdPrefix, 'empty-state')}
        />
      );
    }
    
    return (
      <EmptyState
        title={translateLang('noDebtorsYet')}
        description={translateLang('noDebtorsYetDescription')}
        icon={<Image src={UserIcon} alt="user" width={48} height={48} />}
        testIdPrefix={buildTestId(testIdPrefix, 'empty-state')}
      />
    );
  }, [translateLang, testIdPrefix, debouncedSearchText, filterValues, selectedTab]);

  // Show loading state
  if (loading && debtorsData.length === 0) {
    return (
      <ListPageWrapper
        breadcrumbLinks={breadcrumbLinks}
        title={translateLang('debtorsTitle')}
        testIdPrefix={testIdPrefix}
        containerSpacing={4}
        containerPaddingBottom={4}
        titleFontSize="28px"
        titleMinHeight="48px"
        searchValue=""
        onSearchChange={() => {}}
      >
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px" data-testid={buildTestId(testIdPrefix, 'loading-state')}>
          <Loader />
        </Box>
      </ListPageWrapper>
    );
  }

  return (
    <ListPageWrapper
      breadcrumbLinks={breadcrumbLinks}
      title={translateLang('debtorsTitle')}
      testIdPrefix={testIdPrefix}
      action={
        <Box sx={{ '&:hover img': { filter: 'brightness(0) invert(1)' } }}>
          <Button
            buttonVariant="secondary"
            data-testid={buildTestId(testIdPrefix, 'create-button')}
            startIcon={<Image src={AddIcon} alt="addicon" width={24} height={24} />}
            style={{ height: 48 }}
            onClick={handleCreateClick}
          >
            {translateLang('createDebtor')}
          </Button>
        </Box>
      }
      searchPlaceholder={translateLang('placeholderSearch')}
      searchValue={searchText}
      onSearchChange={setSearchText}
      searchIcon={<Image src={SearchIcon} alt="search" width={32} height={32} />}
      searchClearIcon={<Image src={CloseIcon} alt="clear" width={24} height={24} />}
      onSearchClear={handleClearSearch}
      containerSpacing={4}
      containerPaddingBottom={4}
      titleFontSize="28px"
      titleMinHeight="48px"
      contentRef={tableContainerRef}
    >
      <TableContainer
        testIdPrefix={buildTestId(testIdPrefix, 'table-container')}
        tableData={tableData}
        filterButtons={filterButtons}
        rightPanelContent={rightPanelButtons}
        onCheckboxClick={handleCheckboxClick}
        selectedRows={selectedRows}
        showTabs={true}
        hideTabsWhenEmpty={false}
        tabs={STATUS_TABS.map((label, index) => ({ label, value: index }))}
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
        onSort={handleSortChange}
        externalOrder={sortAsc ? 'asc' : 'desc'}
        externalOrderBy={sortBy}
        emptyStateContent={error ? errorStateContent : emptyStateContent}
      />
      <FilterDebtorsDrawer
        data-testid={buildTestId(testIdPrefix, 'filter-drawer')}
        open={filterDrawerOpen}
        anchorEl={filterAnchorEl}
        onClose={handleFilterClose}
        onApply={handleFilterApply}
        initialValues={filterValues}
        collectionTypes={collectionTypes}
      />
      <DownloadDebtorDialog
        data-testid={buildTestId(testIdPrefix, 'download-dialog')}
        open={downloadDialogOpen}
        anchorEl={downloadAnchorEl}
        onClose={handleDownloadClose}
        onDownload={handleDownload}
        title={translateLang('downloadDebtors')}
        selectedCount={selectedRows.length}
      />
      <DeleteConfirmationDialog
        data-testid={buildTestId(testIdPrefix, 'delete-dialog')}
        open={deleteDialogOpen}
        onClose={handleDeleteClose}
        onPrimaryCTA={handleDelete}
        onSecondaryCTA={handleDeleteClose}
        selectedCount={selectedRows.length}
        exclamationIcon={AvatarAlert}
        itemLabel={isMixedStatusDelete ? undefined : `${selectedRows.length} ${translateLang('debtorsTitle').toLowerCase()} ${tCommon('markedForDeletion')}`}
        itemLabel2={isMixedStatusDelete ? undefined : tCommon('areYouSureYouWantToDelete', { selectedCount: selectedRows.length, itemLabel: translateLang('debtorsTitle').toLowerCase() })}
        markedCount={isMixedStatusDelete ? undefined : selectedRows.length}
        title={isMixedStatusDelete ? undefined : undefined}
        message={
          isMixedStatusDelete ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 500, fontSize: '16px', marginBottom: '8px' }}>
                Some debtors can&apos;t be deleted
              </div>
              <div style={{ fontWeight: 400, fontSize: '16px', color: '#222E37' }}>
                The selected debtors include items that cannot be deleted because of their
                current status.
              </div>
            </div>
          ) : undefined
        }
        primaryCTALabel={isMixedStatusDelete ? 'Delete eligible items' : 'YES, DELETE THE SELECTED ITEMS'}
        secondaryCTALabel="DISMISS"
        showUndoWarning={false}
        primaryCTALoading={isDeleting}
        loading={isDeleting}
      />
      
      <DeleteConfirmationDialog
        data-testid={buildTestId(testIdPrefix, 'delete-error-dialog')}
        open={deleteErrorDialogOpen}
        onClose={() => setDeleteErrorDialogOpen(false)}
        onPrimaryCTA={handleDelete}
        onSecondaryCTA={() => setDeleteErrorDialogOpen(false)}
        selectedCount={0}
        exclamationIcon={AvatarAlert}
        itemLabel=""
        markedCount={undefined}
        showUndoWarning={false}
        title={translateLang('systemError')}
        message={
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>
              {translateLang('somethingWentWrong')}
            </div>
            <div style={{ fontWeight: 400, fontSize: '16px', marginBottom: '8px' }}>
              {translateLang('unableDeleteDebtor')}
            </div>
            <div style={{ fontWeight: 400, fontSize: '16px', color: '#222E37' }}>
              {translateLang('contactBankRepresentative')}
            </div>
          </div>
        }
        primaryCTALabel={translateLang('tryAgain')}
        secondaryCTALabel={translateLang('cancel')}
        secondaryCTAWidth="auto"
        tertiaryCTAWidth="auto"
        testIdPrefix={buildTestId(testIdPrefix, 'delete-error')}
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
    </ListPageWrapper>
  );
};

export default DebtorsPage;