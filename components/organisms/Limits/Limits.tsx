'use client';
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useDispatch, useSelector } from 'react-redux';
import { ListRightPanelActions } from 'components/common';
import ErrorState from 'components/common/ErrorState';
import EmptyState from 'components/common/EmptyState';
import styles from './Limits.module.scss';
import TableWithTab from '@molecules/TableWithTab';
import { Grid, InputAdornment, TextField, Typography, useTheme, Box } from '@mui/material';
import { BreadcrumbList } from 'components/lib/Page/Breadcrumb';
import { Heading } from 'components/lib/Page';
import { Icon } from '@atoms/Icon/Icon';
import Button from 'components/lib/Forms/Button';
import { useRouter } from 'next/navigation';
import { useRequireCustomerKey } from '@lib/hooks/useRequireCustomerKey';
import LimitsFilterDialog from './LimitsFilterDialog';
import DeleteConfirmationDialog from 'components/common/DeleteConfirmationDialog';
import ValidationErrorDialog from 'components/common/ValidationErrorDialog';
import Image from 'next/image';
import { SearchIcon, ErrorAlertIcon, ReloadRefreshIcon, PeopleIcon } from '@lib/icons';
import { ALL_RECORDS_TABLE_COLUMNS, ALL_RECORDS_TABLE_HEAD_CELLS, TAB_LIST, LIMIT_VALIDATION_CONSTANTS } from './constant';
import { 
  validateDeleteLimit, 
  validateBulkDeleteLimits,
  getValidationErrorDetails,
  type ValidationResult,
  type LimitTO
} from '@lib/utils/limitValidation';
import { setLimitDetails } from '@store/slices/limitDetails';
import { getLimits, getActiveLimits, getNeedsActionLimits, LimitDetail, LimitsListResponse } from '@lib/api/limitsApi';
import type { RootState } from '@store/index';

const Limits = () => {
  const t = useTranslations('limits');
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useDispatch();

  // Get customer key from custom hook
  const selectedCustomerKey = useRequireCustomerKey();

  // API state
  const [limitsData, setLimitsData] = useState<LimitDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // UI state
  const [searchText, setSearchText] = useState('');
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [currentTab, setCurrentTab] = useState("allRecords");
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [partialDeleteDialogOpen, setPartialDeleteDialogOpen] = useState(false);
  const [error, setError] = useState(false);
  const [deleteError, setDeleteError] = useState({
    invalidLimit: false,
    error: false,
  });
  const [partialDeleteData, setPartialDeleteData] = useState<{
    validLimits: any[];
    invalidLimits: any[];
  }>({
    validLimits: [],
    invalidLimits: [],
  });
  const [validationErrorDialog, setValidationErrorDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    isMandatoryError: boolean;
    invalidCount: number;
    totalCount: number;
    secondaryMessage?: string;
  }>({
    open: false,
    title: '',
    message: '',
    isMandatoryError: false,
    invalidCount: 0,
    totalCount: 0,
    secondaryMessage: '',
  });

  // Transform API response to include debtStatus
  const transformLimitData = useCallback((limit: LimitDetail, index: number) => {
    // Map status codes to complete names with color (primary reference)
    const statusDisplayMap: { [key: string]: { value: string; color: string } } = {
      // Abbreviated status codes
      'A': { value: 'Active', color: 'success' },
      'I': { value: 'Inactive', color: 'secondary' },
      'P': { value: 'Pending', color: 'warning' },
      'R': { value: 'Repair', color: 'error' },
      'C': { value: 'Cancelled', color: 'secondary' },
      // Authorise status codes
      'N': { value: 'Active', color: 'success' },
      'ACA': { value: 'Pending', color: 'warning' },
      'ACT': { value: 'Active', color: 'success' },
      'ACR': { value: 'Needs Action', color: 'warning' },
      'U': { value: 'Inactive', color: 'secondary' },
    };

    // Map product type codes to complete names
    const productTypeMap: { [key: string]: string } = {
      'P': 'Payment',
      'C': 'Collection',
      'T': 'Transfer',
      'OT': 'Own transfers',
    };

    let limitTypeName = limit.limitTypeName;
    if ((!limitTypeName || limitTypeName.trim() === '') && 
        limit.limitType && 
        limit.limitType.toLowerCase().includes('overall')) {
      limitTypeName = 'Overall';
    }

    let productType = limit.productType || '';
    if (productType && productTypeMap[productType]) {
      productType = productTypeMap[productType];
    }

    let debtStatus = limit.debtStatus;
    if (!debtStatus && limit.authoriseStatus && statusDisplayMap[limit.authoriseStatus]) {
      debtStatus = statusDisplayMap[limit.authoriseStatus];
    }

    return {
      ...limit,
      limitTypeName,
      productType,
      id: limit.entityKey || index + 1,
      limitPeriodDays: limit.limitPeriodDays || limit.limitPeriod || 0,
      debtStatus: debtStatus || { value: 'Unknown', color: 'secondary' },
      links: limit.links || { href: `/limits/manage-limit?limitId=${limit.entityKey || index + 1}`, text: 'manageLimit' },
    };
  }, []);

  // Fetch limits from API
  const fetchLimitsData = useCallback(async () => {
    try {
      setLoading(true);
      setApiError(null);
      
      const position = (currentPage - 1);
      let response: LimitsListResponse;

      if (currentTab === 'active') {
        response = await getActiveLimits(selectedCustomerKey, perPage, position, undefined, sortBy || undefined, sortBy ? sortAsc : undefined);
      } else if (currentTab === 'needsAction') {
        response = await getNeedsActionLimits(selectedCustomerKey, perPage, position, undefined, sortBy || undefined, sortBy ? sortAsc : undefined);
      } else {
        response = await getLimits({
          customerKey: selectedCustomerKey,
          pageSize: perPage,
          position,
          ...(sortBy && { sortBy }),
          ...(sortBy && { asc: sortAsc }),
          ...filters,
        });
      }

      setLimitsData((response.limits || []).map((limit, index) => transformLimitData(limit, index)));
      setTotalRecords(response.totalRecords || 0);
      setTotalPages(response.totalPages || 0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch limits';
      setApiError(errorMessage);
      console.error('Error fetching limits:', err);
      setLimitsData([]);
      setTotalRecords(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [selectedCustomerKey, currentPage, perPage, currentTab, filters, sortBy, sortAsc, transformLimitData]);

  // Fetch data when page loads or dependencies change
  useEffect(() => {
    fetchLimitsData();
  }, [fetchLimitsData]);

  // Memoize filtered rows
  const mappedRows = useMemo(() => {
    let filtered = limitsData;

    // Apply search text
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        (row: any) =>
          row?.limitTypeName?.toLowerCase().includes(search) ||
          row?.limitType?.toLowerCase().includes(search) ||
          row?.limitCurrency?.toLowerCase().includes(search),
      );
    }

    return filtered.map((row: any) => ({
      ...row,
      links: {
        href: row?.links?.href || '#',
        text: t(row?.links?.text).toLocaleUpperCase()
      }
    }));
  }, [limitsData, searchText, t]);

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

  // Validation error dialog handler
  const handleValidationErrorClose = useCallback(() => {
    setValidationErrorDialog({
      open: false,
      title: '',
      message: '',
      isMandatoryError: false,
      invalidCount: 0,
      totalCount: 0,
      secondaryMessage: '',
    });
  }, []);

  // Partial delete dialog handlers
  const handlePartialDeleteClose = useCallback(() => {
    setPartialDeleteDialogOpen(false);
    setPartialDeleteData({ validLimits: [], invalidLimits: [] });
  }, []);

  const handlePartialDeleteConfirm = useCallback(() => {
    // Delete only the valid limits
    // TODO: Implement actual delete API call for validLimits
    console.log('Deleting valid limits:', partialDeleteData.validLimits);
    setPartialDeleteDialogOpen(false);
    setSelectedRows([]);
    setPartialDeleteData({ validLimits: [], invalidLimits: [] });
  }, [partialDeleteData]);

  // Pre-delete validation: Check selected limits for deletion eligibility
  const validateSelectedLimitsForDelete = useCallback(
    (limitsToDelete: any[]): { valid: boolean; invalidLimits: any[]; validLimits: any[] } => {
      if (limitsToDelete.length === 0) {
        return { valid: false, invalidLimits: [], validLimits: [] };
      }

      // Validate each limit individually to separate valid from invalid
      const validLimits: any[] = [];
      const invalidLimits: any[] = [];

      limitsToDelete.forEach((limit: any) => {
        const validationResult = validateDeleteLimit(limit);
        if (validationResult.valid) {
          validLimits.push(limit);
        } else {
          invalidLimits.push(limit);
        }
      });

      // Case 1: All limits are valid
      if (invalidLimits.length === 0) {
        return { valid: true, invalidLimits: [], validLimits };
      }

      // Case 2: All limits are invalid - show validation error dialog
      if (validLimits.length === 0) {
        const firstInvalidLimit = invalidLimits[0];
        const errorDetails = getValidationErrorDetails(
          validateDeleteLimit(firstInvalidLimit)
        );

        // Extract limit type info to format message properly
        const limitTypeCode = firstInvalidLimit.limitType || '';
        const limitTypeName = firstInvalidLimit.limitTypeName || 'Limit';
        
        // Extract the type name from the limitType code
        let typeDisplayName = limitTypeName.toLowerCase();
        if (limitTypeCode.includes('OVERALL_')) {
          const typeAfterOverall = limitTypeCode.replace('OVERALL_', '').toLowerCase();
          typeDisplayName = `${typeAfterOverall} limit`;
        } else if (limitTypeCode.includes('PAYMENT')) {
          typeDisplayName = 'payment limit';
        } else if (limitTypeCode.includes('TRANSFER')) {
          typeDisplayName = 'transfer limit';
        } else if (limitTypeCode.includes('COLLECTION')) {
          typeDisplayName = 'collection limit';
        }

        // Build detailed message for all invalid scenario
        let primaryMessage = '';
        let secondaryMessage = '';

        if (invalidLimits.length === 1) {
          // Single invalid limit - match screenshot format exactly
          primaryMessage = `Overall ${typeDisplayName} cannot be deleted`;
          
          // Determine secondary message based on type and error
          if (errorDetails.isMandatoryError) {
            secondaryMessage = `Overall ${typeDisplayName} is mandatory and cannot be deleted`;
          } else if (errorDetails.message.toLowerCase().includes('active')) {
            secondaryMessage = `Limits with Active status cannot be deleted. Please deactivate first.`;
          } else {
            secondaryMessage = errorDetails.message;
          }
        } else {
          // Multiple invalid limits
          const invalidLimitNames = invalidLimits
            .slice(0, 3)
            .map((limit: any) => limit.limitTypeName)
            .join(', ');
          
          const moreText = invalidLimits.length > 3 
            ? ` and ${invalidLimits.length - 3} more` 
            : '';

          primaryMessage = `${invalidLimits.length} limits cannot be deleted:\n${invalidLimitNames}${moreText}.`;
          secondaryMessage = errorDetails.isMandatoryError 
            ? `Some limits are mandatory and cannot be deleted.`
            : `Please deselect the records that cannot be deleted and try again.`;
        }

        setValidationErrorDialog({
          open: true,
          title: 'Limit cannot be deleted',
          message: primaryMessage,
          isMandatoryError: errorDetails.isMandatoryError,
          invalidCount: invalidLimits.length,
          totalCount: limitsToDelete.length,
          secondaryMessage: secondaryMessage,
        });

        return { valid: false, invalidLimits, validLimits: [] };
      }

      // Case 3: Some limits are valid and some are invalid - show partial delete dialog
      setPartialDeleteData({
        validLimits,
        invalidLimits,
      });
      setPartialDeleteDialogOpen(true);
      
      return { valid: false, invalidLimits, validLimits };
    },
    []
  );

  const handleDeleteOpen = useCallback(() => {
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
    setDeleteError({ invalidLimit: false, error: false });

    // Pre-validate selected limits before opening delete confirmation
    const validation = validateSelectedLimitsForDelete(selectedRows);
    if (validation.valid) {
      setDeleteDialogOpen(true);
    }
  }, [selectedRows, validateSelectedLimitsForDelete]);

  const handleDeleteClose = useCallback(() => {
    setDeleteDialogOpen(false);
    setDeleteError({ invalidLimit: false, error: false });
  }, []);

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

  const handleRemoveFilters = useCallback(() => {
    setFilters({});
    setSearchText('');
    setSortBy(null);
    setSortAsc(true);
  }, []);

  // Handle column sorting - called when user clicks sortable column header
  const handleSort = useCallback((field: string) => {
    if (sortBy === field) {
      // Toggle sort direction if clicking same field
      setSortAsc(!sortAsc);
    } else {
      // New field - set to ascending
      setSortBy(field);
      setSortAsc(true);
    }
    setCurrentPage(1); // Reset to page 1
  }, [sortBy, sortAsc]);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    setSelectedRows([]); // Clear selections when changing pages
  }, []);

  const handlePerPageChange = useCallback((newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
    setSelectedRows([]); // Clear selections when changing rows per page
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
  }, [handleFilterOpen, t, theme.palette.secondary.main]);

  // Memoize action buttons for right panel
  const rightPanelButtons = useMemo(() => {
    const count = selectedRows.length;
    const hasFilters = Object.keys(filters).length > 0 || searchText.trim().length > 0;

    return (
      <ListRightPanelActions
        selectedCount={count}
        hasFilters={hasFilters}
        onRemoveFilters={handleRemoveFilters}
        onDeleteClick={handleDeleteOpen}
      />
    );
  }, [selectedRows.length, filters, searchText, handleRemoveFilters, handleDeleteOpen]);

  const handleReload = useCallback(() => {
    // TODO : handle reload logic
    setError(false);
  }, []);

  // Memoize table head cells with sort indicators and click handlers
  const allRecordsTableHeadCells = useMemo(
    () => {
      return ALL_RECORDS_TABLE_HEAD_CELLS.map(cell => {
        const isSortable = ['limitTypeName', 'limitAmount', 'limitCurrency', 'productType'].includes(cell.id);
        return {
          ...cell,
          label: t(cell.labelKey),
          sortable: isSortable,
          sortDirection: sortBy === cell.id ? (sortAsc ? 'asc' : 'desc') : undefined,
          onClick: isSortable ? () => handleSort(cell.id) : undefined,
        };
      });
    },
    [t, sortBy, sortAsc, handleSort],
  );

  // Memoize empty state content - shows error state if API error, otherwise shows empty state
  const emptyStateContent = useMemo(() => {
    if (apiError) {
      return (
        <ErrorState
          title={t('errorTitle')}
          description={apiError}
          buttonLabel={t('retry')}
          onButtonClick={fetchLimitsData}
          icon={<Icon name="warning" width="64" height="64" />}
        />
      );
    }
    return (
      <EmptyState
        title={t('emptyStateTitle')}
        description={t('emptyStateDesc')}
        icon={<Icon name="user" width="64" height="64" />}
      />
    );
  }, [apiError, t, fetchLimitsData]);

  // Build table data from API response
  const currentTableData = useMemo(() => {
    return {
      columns: ALL_RECORDS_TABLE_COLUMNS,
      headCells: allRecordsTableHeadCells,
      rowButton: false,
      rows: mappedRows,
      pageSize: perPage,
      rowCount: totalRecords,
      currentPage,
      totalPages,
      rowVariant: 'checkbox',
      emptyStateContent: emptyStateContent,
    };
  }, [mappedRows, allRecordsTableHeadCells, perPage, totalRecords, currentPage, totalPages, emptyStateContent]);

  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
    setSelectedRows([]); 
    setCurrentPage(1);
    setFilterDialogOpen(false);
    setSortBy(null);
    setSortAsc(true);
    handleRemoveFilters();
  }, [handleRemoveFilters]);
  
  const statusTabs = useMemo(() => {
    return TAB_LIST.map(key => ({ label: t(key), value: key }));
  }, [t]);

  const deleteItemLabel = useMemo(() => {
    if (deleteError.error) {
      return {
        itemLabel1: t('somethingWentWrong')?.toLocaleLowerCase(),
        itemLabel2: t('somethingWentWrongDesc')?.toLocaleString(),
        primaryCTALabel: t('tryAgain').toLocaleString(),
      };
    }
    if (deleteError.invalidLimit) {
      return {
        itemLabel1: t('deleteFailureTitle')?.toLocaleLowerCase(),
        itemLabel2: t('deleteFailureDesc')?.toLocaleLowerCase(),
        primaryCTALabel: t('deleteEligibleItem').toLocaleString(),
      };
    }
    if (selectedRows.length > 1) {
      return {
        itemLabel1: t('totalDeleteCountTitle', { value: selectedRows.length })?.toLocaleLowerCase(),
        itemLabel2: t('totalDeleteCountDesc', { value: selectedRows.length })?.toLocaleLowerCase(),
        primaryCTALabel: '',
      };
    }
    return {
      itemLabel1: `${selectedRows.length} ${selectedRows.length === 1 ? t('limit')?.toLocaleLowerCase() : t('limits')?.toLocaleLowerCase()} marked for delete`,
      itemLabel2: `Are you sure you want to delete the ${selectedRows.length} ${selectedRows.length === 1 ? t('limit')?.toLocaleLowerCase() : t('limits')?.toLocaleLowerCase()} selected?`,
      primaryCTALabel: t('deleteConfirm'),
    };
  }, [selectedRows, t, deleteError]);

  const breadcrumbLinks = useMemo(
    () => [
      { href: '/', label: t('dashboard') },
      { href: '/limits', label: t('limits') },
    ],
    [t],
  );

  const handleLinkClick = useCallback((row: any) => {
    // Dispatch limit data to Redux before navigating
    dispatch(setLimitDetails(row));
    router.push(row.links.href);
  }, [router, dispatch]);

  return (
    <section className={styles.container}>
      <BreadcrumbList links={breadcrumbLinks} />
      <Grid
        size={12}
        className={styles.headerRow}
      >
          <Heading as="h4" fontSize="28px">
            {t('limits')}
          </Heading>
          <Button
            buttonVariant="secondary"
            startIcon={<Icon name="add" width="24" height="24" bgColor='#0051FF' />}
            onClick={() => router.push('/limits/manage-limit?mode=create' as any)}
          >
            {t('createALimit')}
          </Button>
      </Grid>
      <section className={styles.tabContent}>
        <Grid size={12} className={styles.searchRow}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder={t('searchPlaceholder')}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            InputProps={
              {
                startAdornment: (
                  <InputAdornment position="start"><Icon name="search" width='32' height='32' bgColor={theme.palette.navy.main} /></InputAdornment>
                ),
              }
            }
            className={styles.searchField}
          />
        </Grid>
        <section className={styles.tableContainer}>
          <TableWithTab
            statusTabs={statusTabs}
            currentTab={currentTab}
            tableData={currentTableData}
            onTabChange={handleTabChange}
            filterButtons={filterButtons}
            selectedRows={selectedRows}
            onCheckboxClick={handleCheckboxClick}
            onRowClick={(rowData: any) => console.log('rowData', rowData)}
            rightPanelButtons={rightPanelButtons}
            onPageChange={handlePageChange}
            onPerPageChange={handlePerPageChange}
            onQuickLinkClick={handleLinkClick}
            isLoading={loading}
          />
          <LimitsFilterDialog
            open={filterDialogOpen}
            anchorEl={filterAnchorEl}
            onClose={handleFilterClose}
            onApply={handleFilterApply}
            initialValues={filters}
          />
          <ValidationErrorDialog
            open={validationErrorDialog.open}
            onClose={handleValidationErrorClose}
            title={validationErrorDialog.title}
            message={validationErrorDialog.message}
            isMandatoryError={validationErrorDialog.isMandatoryError}
            secondaryMessage={validationErrorDialog.secondaryMessage || t('deleteIneligibleError')}
          />
          <DeleteConfirmationDialog
            open={partialDeleteDialogOpen}
            onClose={handlePartialDeleteClose}
            onPrimaryCTA={handlePartialDeleteConfirm}
            onSecondaryCTA={handlePartialDeleteClose}
            selectedCount={partialDeleteData.validLimits.length}
            title={t('partialDeleteTitle')}
            name={t('partialDeleteTitle')}
            itemLabel2={t('partialDeleteMessage')}
            primaryCTALabel={t('partialDeleteConfirm')}
            secondaryCTALabel={t('partialDeleteCancel')}
          />
          <DeleteConfirmationDialog
            open={deleteDialogOpen}
            onClose={handleDeleteClose}
            onPrimaryCTA={handleDeleteClose}
            onSecondaryCTA={handleDeleteClose}
            selectedCount={selectedRows.length}
            title={t('deleteDialogTitle')}
            name={t('deleteDialogName')}
            itemLabel={deleteItemLabel?.itemLabel1}
            itemLabel2={deleteItemLabel?.itemLabel2}
            markedCount={selectedRows.length}
            primaryCTALabel={deleteItemLabel?.primaryCTALabel}
            secondaryCTALabel={t('deleteCancel')}
          />
        </section>
      </section>
  </section>
  );
};
export default Limits;
