'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useAppDispatch } from '@lib/hooks/useAppDispatch';
import { Box, Grid, CircularProgress, Snackbar, Alert, Typography, TextField } from '@mui/material';
import { Breadcrumb, Heading, ButtonToggle, Button } from 'dist/standard-bank-react';
import TableContainer from '@molecules/TableContainer/TableContainer';
import EventFilterDialog, { EventFilterValues } from '@molecules/EventFilterDialog';
import EmptyState from 'components/common/EmptyState';
import NonTransactionalDetailPanel from '@organisms/audit-and-approve/NonTransactionalDetailPanel';
import ConfirmationDialog from '@organisms/audit-and-approve/ConfirmationDialog';
import { auditBeneficiaries, authoriseBeneficiaries } from 'store/slices/nontransactionalauditandapproveslice';
import {
  AuditApproveEventRow,
  AuditApproveMode,
  NON_TRANSACTIONAL_TABLE_COLUMNS,
  NON_TRANSACTIONAL_TABLE_HEAD_CELLS,
} from '../../../../src/utils/auditandapprove';
import Image from 'next/image';
import { SearchIcon, FunnelIcon, CloseIcon, IcnDislikeBlue, IcnLikeBlue, AvatarAlert, AvatarQuestion, CloseBlue, AuditIcn, CheckCircleIcon } from 'lib/icons';
import { useNontransactionalAuditApprove } from 'lib/hooks/useNontransactionalauditapprove';
import { useTranslations } from 'next-intl';
import {
  getBreadCrumbs,
  createFilterButtons,
  transformFilterValues,
  handleQuickLinkSelection,
  getSelectedRowIndex,
  getPreviousRow,
  getNextRow,
  getSuccessMessage,
  DIALOG_CONFIG,
  getErrorMessage,
} from './nonTransactionalAuditHelper';
import { SearchInput } from 'components/common';
import { buildTestId } from 'src/utils/testIds';
import styles from './nonTransactionalAudit.module.scss';
import DeleteConfirmationDialog from 'components/common/DeleteConfirmationDialog';

const testIdPrefix = 'non-transactional-audit';

const humanizeEventTypeKey = (value: string) =>
  value
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .trim();

export default function NonTransactionalPage() {
  const t = useTranslations('nonTransactionalAuditApprove');
  const dispatch = useAppDispatch();
  const [mode, setMode] = useState<AuditApproveMode>('audit');
  const [selectedSearchRule, setSelectedSearchRule] = useState<string>('');
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState<boolean>(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [filters, setFilters] = useState<Partial<EventFilterValues>>({});
  const [selectedRow, setSelectedRow] = useState<AuditApproveEventRow | null>(null);
  const [detailRows, setDetailRows] = useState<AuditApproveEventRow[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [isErrorSnackbar, setIsErrorSnackbar] = useState<boolean>(false);
  const [isBulkApproveDialogOpen, setIsBulkApproveDialogOpen] = useState<boolean>(false);
  const [isBulkDeclineDialogOpen, setIsBulkDeclineDialogOpen] = useState<boolean>(false);
  const [bulkDeclineReason, setBulkDeclineReason] = useState('');
  const [bulkDeclineError, setBulkDeclineError] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<5 | 15 | 30 | 50 | 100>(15);
  const [errorDialogOpen, setErrorDialogOpen] = useState<boolean>(false);
  const eventListFetched = useRef(false);

  const auditActionInitiated = useRef(false);
  const retryDataRef = useRef<{ entityKey: number | string | null; entityStatus: string; entityType: string } | null>(null);

  const {
    filteredRows,
    hasFiltersOrSearch,
    selectedIds,
    selectedRows,
    updateFilters,
    updateSearchText,
    clearFiltersAndSearch,
    updateSelectedIds,
    clearSelection,
    eventList,
    eventListLoading,
    eventListError,
    loadListData,
    reloadEventList,
    listDataLoading,
    auditLoading,
    auditError,
    authoriseLoading,
    authoriseError,
    performAudit,
    performAuthorise,
  } = useNontransactionalAuditApprove(mode);

  const isAuditMode = mode === 'audit';

  useEffect(() => {
    if (!eventListFetched.current && eventList.length === 0 && !eventListLoading) {
      eventListFetched.current = true;
      reloadEventList();
    }
  }, [eventList.length, eventListLoading, reloadEventList]);

  useEffect(() => {
    const isLoading = isAuditMode ? auditLoading : authoriseLoading;
    const error = isAuditMode ? auditError : authoriseError;
    
    if (!isLoading && auditActionInitiated.current) {
      if (error) {
        const message = getErrorMessage(isAuditMode ? 'audit' : 'approve', isAuditMode, t);
        setSnackbarMessage(message);
        setIsErrorSnackbar(true);
        setErrorDialogOpen(true);
      } else {
        const message = getSuccessMessage(isAuditMode ? 'audit' : 'approve', isAuditMode, t);
        setSnackbarMessage(message);
        setIsErrorSnackbar(false);
        retryDataRef.current = null;
        setSnackbarOpen(true);
      }
      
      auditActionInitiated.current = false;
    }
  }, [auditLoading, auditError, authoriseLoading, authoriseError, isAuditMode, t]);

  const eventTypeRules = useMemo(
    () =>
      eventList.map((opt) => {
        const translatedLabel = t(opt.value as any);
        const labelToShow =
          translatedLabel && translatedLabel !== opt.value
            ? translatedLabel
            : humanizeEventTypeKey(opt.value);

        return {
          label: labelToShow,
          value: opt.value,
        };
      }),
    [eventList, t],
  );

  const handleModeChange = useCallback(
    (_event: React.MouseEvent<HTMLElement>, value: string | null) => {
      if (value === 'audit' || value === 'approve') {
        setMode(value as AuditApproveMode);
        // Close detail panel when switching modes; selection is maintained per mode in Redux
        setSelectedRow(null);
        setDetailRows([]);
        setFilters({});
        setSelectedSearchRule('');
        setHasSearched(false);
        clearFiltersAndSearch();
        // Reset pagination when switching modes
        setCurrentPage(1);
      }
    },
    [clearFiltersAndSearch],
  );

  const tableData = useMemo(
    () => ({
      columns: NON_TRANSACTIONAL_TABLE_COLUMNS,
      headCells: NON_TRANSACTIONAL_TABLE_HEAD_CELLS,
      rows: hasSearched ? filteredRows : [],
    }),
    [filteredRows, hasSearched],
  );
  const filterButtons = useMemo(
    () => {
      const config = createFilterButtons(t, (event: React.MouseEvent<HTMLElement>) => {
        setFilterDialogOpen(true);
        setFilterAnchorEl(event.currentTarget);
      });

      return [
        {
          children: (
            <>
              <Image
                src={FunnelIcon}
                alt={config.altFilter}
                width={16}
                height={16}
                style={{ marginRight: 4 }}
              />
              {config.filterLabel}
            </>
          ),
          buttonVariant: config.buttonVariant,
          onClick: config.onClick,
          disabled: !hasSearched || listDataLoading,
        },
      ];
    },
    [t, hasSearched, listDataLoading],
  );

  const handleFilterClose = useCallback(() => {
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
  }, []);

  const handleFilterApply = useCallback((appliedFilters: EventFilterValues) => {
    setFilters(appliedFilters);
    updateFilters(transformFilterValues(appliedFilters));
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
  }, [updateFilters]);

  const handleSearchButton = useCallback(() => {
    if (!selectedSearchRule) return;

    setHasSearched(true);
    const selectedEvent = eventList.find(event => event.value === selectedSearchRule);
    
    if (selectedEvent?.className) {
      const simpleEntityType = selectedEvent.className.split('.').pop() || selectedEvent.className;
      updateFilters({ eventType: simpleEntityType });
      loadListData(selectedEvent.className, mode === 'audit' ? 'AUDIT' : 'AUTHORISE');
    }
  }, [selectedSearchRule, eventList, mode, loadListData, updateFilters]);
  const handleRemoveFilters = useCallback(() => {
    setFilters({});
    setSelectedSearchRule('');
    setHasSearched(false);
    clearFiltersAndSearch();
  }, [clearFiltersAndSearch]);

  const handleCheckboxClick = useCallback((rows: any | any[]) => {
    const next = Array.isArray(rows) ? rows : rows ? [rows] : [];
    const ids = (next as AuditApproveEventRow[]).map((r) => r.id);
    updateSelectedIds(ids);
  }, [updateSelectedIds]);

  const selectedIndex = useMemo(
    () => getSelectedRowIndex(selectedRow, detailRows),
    [detailRows, selectedRow]
  );

  const handleSelectPrev = useCallback(() => {
    const prevRow = getPreviousRow(selectedRow, detailRows);
    if (prevRow) setSelectedRow(prevRow);
  }, [detailRows, selectedRow]);

  const handleSelectNext = useCallback(() => {
    const nextRow = getNextRow(selectedRow, detailRows);
    if (nextRow) setSelectedRow(nextRow);
  }, [detailRows, selectedRow]);

  const handleBulkApprove = useCallback(() => {
    if (!selectedRows.length) return;
    const message = getSuccessMessage(isAuditMode ? 'audit' : 'approve', isAuditMode, t);
    setSnackbarMessage(message);
    setSnackbarOpen(true);
    clearSelection();
  }, [selectedRows.length, clearSelection, isAuditMode, t]);

  const handleBulkDecline = useCallback(() => {
    if (!selectedRows.length) return;
    const message = getSuccessMessage('decline', isAuditMode, t);
    setSnackbarMessage(message);
    setSnackbarOpen(true);
    clearSelection();
  }, [selectedRows.length, clearSelection, isAuditMode, t]);

  const openBulkApproveDialog = useCallback(() => {
    if (!selectedRows.length) return;
    setIsBulkApproveDialogOpen(true);
  }, [selectedRows.length]);

  const openBulkDeclineDialog = useCallback(() => {
    if (!selectedRows.length) return;
    setBulkDeclineReason('');
    setBulkDeclineError(false);
    setIsBulkDeclineDialogOpen(true);
  }, [selectedRows.length]);
  
  const handleErrorDismiss = useCallback(() => {
      setErrorDialogOpen(false);
      retryDataRef.current = null;
  }, []);

 

  const rightPanelButtons = useMemo(() => {
    const showFilters = hasFiltersOrSearch;
    const count = selectedRows.length;

    if (!showFilters && count === 0) return null;

    return (
      <Box className={styles['non-trans-audit-approve__action-buttons']}>
        {count > 0 && (
          <>
            <Button
              buttonVariant="tertiary"
              startIcon={<Image src={isAuditMode ? AuditIcn : IcnLikeBlue} alt={isAuditMode ? t('altAudit') : t('altApprove')} width={20} height={20} />}
              onClick={openBulkApproveDialog}
              className={styles['non-trans-audit-approve__button']}
              data-testid={buildTestId(testIdPrefix, isAuditMode ? 'button-bulk-audit' : 'button-bulk-approve')}
              aria-label={isAuditMode ? 'Bulk audit selected items' : 'Bulk approve selected items'}
            >
              {`${isAuditMode ? t('audit') : t('approve')} (${count})`}
            </Button>
            <Button
              buttonVariant="tertiary"
              startIcon={<Image src={IcnDislikeBlue} alt={t('altDecline')} width={20} height={20} />}
              onClick={openBulkDeclineDialog}
              className={styles['non-trans-audit-approve__button']}
              data-testid={buildTestId(testIdPrefix, 'button-bulk-decline')}
              aria-label="Bulk decline selected items"
            >
              {t('decline')} ({count})
            </Button>
          </>
        )}
        {showFilters && (
          <Button
            buttonVariant="tertiary"
            endIcon={<Image src={CloseIcon} alt={t('altClose')} width={20} height={20} />}
            onClick={handleRemoveFilters}
            className={styles['non-trans-audit-approve__remove-button']}
            data-testid={buildTestId(testIdPrefix, 'button-remove-filters')}
            aria-label="Remove filters"
          >
            {t('removeFilters')}
          </Button>
        )}
      </Box>
    );
  }, [hasFiltersOrSearch, selectedRows.length, openBulkApproveDialog, openBulkDeclineDialog, handleRemoveFilters, isAuditMode, t]);

  const emptyStateContent = useMemo(() => {
    if (!hasSearched) {
      return (
        <EmptyState
          title="Select event type and search"
          description="Please select an event type from the dropdown and click the search button to view results."
          icon={<Image src={SearchIcon} alt="Search" width={32} height={32} />}
        />
      );
    }
    if (filteredRows.length === 0) {
      return hasFiltersOrSearch ? (
        <EmptyState
          title={t('noResultsTitle')}
          description={t('noResultsDescription')}
          icon={<Image src={SearchIcon} alt={t('altNoResults')} width={32} height={32} />}
        />
      ) : (
        <EmptyState
          title={t('noEventsTitle')}
          description={t('noEventsDescription')}
          icon={<Image src={SearchIcon} alt={t('altNoEvents')} width={32} height={32} />}
        />
      );
    }
    return null;
  }, [filteredRows.length, hasFiltersOrSearch, hasSearched, t]);

  const handleDetailClose = useCallback(() => {
    setSelectedRow(null);
    setDetailRows([]);
  }, []);

  const performAuditAction = useCallback((entityKey: number | string | null, entityStatus: string, entityType: string) => {
    if (entityKey === null) return;
    const requestBody = { [String(entityKey)]: entityStatus };
    
    retryDataRef.current = { entityKey, entityStatus, entityType };
    auditActionInitiated.current = true;
    if (isAuditMode) {
      performAudit(entityType, requestBody);
    } else {
      performAuthorise(entityType, requestBody);
    }
  }, [isAuditMode, performAudit, performAuthorise]);

  const handleAuditSuccess = useCallback((entityKey: number | string | null, entityStatus: string, entityType: string) => {

    if (entityKey === null || !selectedRow) return;
    performAuditAction(entityKey, entityStatus, entityType);
    setSelectedRow(null);
  }, [selectedRow, performAuditAction]);

  const handleDeclineSuccess = useCallback((entityKey: number | string | null, entityStatus: string, entityType: string) => {
    setSelectedRow(null);
    const message = getSuccessMessage('decline', isAuditMode, t);
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  }, [isAuditMode, t]);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const handlePerPageChange = useCallback((newPerPage: number) => {
    setRowsPerPage(newPerPage as 5 | 15 | 30 | 50 | 100);
    setCurrentPage(1); // Reset to first page when changing rows per page
  }, []);

 const handleErrorRetry = useCallback(() => {
    if (retryDataRef.current) {
      const { entityKey, entityStatus, entityType } = retryDataRef.current;
      setErrorDialogOpen(false);
      performAuditAction(entityKey, entityStatus, entityType);
    }
  }, [performAuditAction]);
  return (
    <>
      <Grid container spacing={4} className={styles['non-trans-audit-approve__container']} data-testid={buildTestId(testIdPrefix, 'container')}>
        <Grid size={12}>
          <Breadcrumb
            links={getBreadCrumbs(t)}
            data-testid={buildTestId(testIdPrefix, 'breadcrumb')}
          />
        </Grid>
        <Grid
          size={12}
          className={styles['non-trans-audit-approve__header-grid']}
        >
          <Heading as="h4" fontSize="28px" data-testid={buildTestId(testIdPrefix, 'heading')}>
            {t('pageTitle')}
          </Heading>
          <Box />
        </Grid>
        <Grid size={12}>
          <Box className={styles['non-trans-audit-approve__button-toggle-wrapper']}>
            <ButtonToggle
              initialSelected={mode === 'audit' ? 0 : 1}
              fullWidth={false}
              buttons={[
                { children: t('tabAudit'), toggleValue: 'audit' },
                { children: t('tabApprove'), toggleValue: 'approve' },
              ]}
              onChange={handleModeChange}
              data-testid={buildTestId(testIdPrefix, 'tab-mode-toggle')}
            />
          </Box>
        </Grid>
        <Grid size={12} className={styles['non-trans-audit-approve__search-wrapper']}>
          <Box display="flex" gap={2}>
            <SearchInput
              rules={eventTypeRules}
              sx={{ flex: 1 }}
              size='medium'
              selectedRule={selectedSearchRule}
              onRuleChange={(value) => setSelectedSearchRule(value)}
              placeholder={t('searchPlaceholder')}
              data-testid={buildTestId(testIdPrefix, 'search-input')}
              testIdPrefix={buildTestId(testIdPrefix, 'search-input')}
            />

            <Button
              buttonVariant="secondary"
              style={{ height: '3.5rem' }}
              disabled={!selectedSearchRule || eventListLoading || listDataLoading}
              startIcon={
                listDataLoading ? (
                  <CircularProgress size={20} sx={{ color: 'primary.main' }} />
                ) : (
                  <Image src={SearchIcon} alt="addicon" width={24} height={24} />
                )
              }
              onClick={handleSearchButton}
              data-testid={buildTestId(testIdPrefix, 'button-search')}
              aria-label="Search events"
            >
              Search
            </Button>
          </Box>
          {eventListError && (
            <Box sx={{ mt: 1 }}>
              <Alert severity="warning">
                {eventListError}
              </Alert>
            </Box>
          )}
        </Grid>
        <Grid
          size={12}
          className={styles['non-trans-audit-approve__table-container']}
        >
          <Box className={styles['non-trans-audit-approve__table-wrapper']}>
            <TableContainer
              key={`table-${mode}-${rowsPerPage}`}
              tableData={tableData}
              filterButtons={filterButtons}
              showTabs={false}
              rightPanelContent={rightPanelButtons}
              currentPage={currentPage}
              perPage={rowsPerPage}
              serverSidePagination={false}
              onPageChange={handlePageChange}
              onPerPageChange={handlePerPageChange}
              onCheckboxClick={handleCheckboxClick}
              selectedRows={selectedRows}
              onQuickLinkClick={(row: any) => {
                const typedRow = row as AuditApproveEventRow;
                const detailRowsToSet = handleQuickLinkSelection(typedRow, selectedRows);
                setDetailRows(detailRowsToSet);
                setSelectedRow(typedRow);
              }}
              emptyStateContent={emptyStateContent}
              data-testid={buildTestId(testIdPrefix, 'table-container')}
              testIdPrefix={buildTestId(testIdPrefix, 'table-container')}
            />
            {listDataLoading && (
              <Box
                className={styles['non-trans-audit-approve__loading-overlay']}
              >
                <CircularProgress size={32} />
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
      <EventFilterDialog
        open={filterDialogOpen}
        anchorEl={filterAnchorEl}
        onClose={handleFilterClose}
        onApply={handleFilterApply}
        initialValues={filters}
        data-testid={buildTestId(testIdPrefix, 'dialog-filter')}
      />
      <NonTransactionalDetailPanel
        open={!!selectedRow}
        row={selectedRow}
        mode={mode}
        onClose={handleDetailClose}
        currentIndex={selectedIndex}
        totalRecords={detailRows.length}
        onPrev={handleSelectPrev}
        onNext={handleSelectNext}
        onAuditSuccess={handleAuditSuccess}
        onDeclineSuccess={handleDeclineSuccess}
        data-testid={buildTestId(testIdPrefix, 'panel-detail')}
        testIdPrefix={buildTestId(testIdPrefix, 'panel-detail')}
      />
      {/* Bulk audit/approve confirmation dialog */}
      <ConfirmationDialog
        open={isBulkApproveDialogOpen}
        onClose={() => setIsBulkApproveDialogOpen(false)}
        title={isAuditMode ? t('auditConfirmTitle') : t('approveConfirmTitle')}
        avatarIcon={AvatarQuestion}
        avatarAlt={t('altQuestionIcon')}
        heading={isAuditMode ? t('auditConfirmHeading') : t('approveConfirmHeading')}
        message={isAuditMode ? t('auditConfirmMessage') : t('approveConfirmMessage')}
        dismissLabel={t('dismiss')}
        confirmLabel={isAuditMode ? t('auditConfirmButton') : t('approveConfirmButton')}
        onConfirm={() => {
          handleBulkApprove();
          setIsBulkApproveDialogOpen(false);
        }}
        dialogTestId={buildTestId(testIdPrefix, 'dialog-bulk-approve-confirm')}
        closeTestId={buildTestId(testIdPrefix, 'button-dialog-close-approve')}
        dismissTestId={buildTestId(testIdPrefix, 'button-dismiss-approve')}
        confirmTestId={buildTestId(testIdPrefix, isAuditMode ? 'button-confirm-audit' : 'button-confirm-approve')}
      />

      {/* Bulk decline dialog */}
      <ConfirmationDialog
        open={isBulkDeclineDialogOpen}
        onClose={() => setIsBulkDeclineDialogOpen(false)}
        title={t('declineTitle')}
        avatarIcon={AvatarAlert}
        avatarAlt={t('altAlertIcon')}
        heading={t('declineMessage', { count: selectedRows.length })}
        message={t('declineMessageSubtext')}
        dismissLabel={t('dismiss')}
        confirmLabel={t('declineMultipleButton', { count: selectedRows.length })}
        onConfirm={() => {
          if (!bulkDeclineReason.trim()) {
            setBulkDeclineError(true);
            return;
          }
          handleBulkDecline();
          setIsBulkDeclineDialogOpen(false);
        }}
        dialogTestId={buildTestId(testIdPrefix, 'dialog-bulk-decline')}
        closeTestId={buildTestId(testIdPrefix, 'button-dialog-close-decline')}
        dismissTestId={buildTestId(testIdPrefix, 'button-dismiss-decline')}
        confirmTestId={buildTestId(testIdPrefix, 'button-confirm-decline')}
      >
        <Box className={styles['non-trans-audit-approve__form-field-wrapper']}>
          <TextField
            fullWidth
            multiline
            minRows={3}
            placeholder={t('rejectionReasonPlaceholder')}
            value={bulkDeclineReason}
            onChange={(e) => {
              setBulkDeclineReason(e.target.value);
              if (bulkDeclineError && e.target.value.trim()) {
                setBulkDeclineError(false);
              }
            }}
            error={bulkDeclineError}
            helperText={bulkDeclineError ? t('rejectionReasonRequired') : ''}
            inputProps={{
              'data-testid': buildTestId(testIdPrefix, 'input-decline-reason')
            }}
          />
        </Box>
      </ConfirmationDialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ mt: 8 }}
        data-testid={buildTestId(testIdPrefix, 'snackbar')}
      >
        <Alert
          icon={<Image src={isErrorSnackbar ? AvatarAlert : CheckCircleIcon} alt={isErrorSnackbar ? 'error' : 'success'} width={20} height={20} />}
          severity={isErrorSnackbar ? 'error' : 'success'}
          sx={{ 
            backgroundColor: isErrorSnackbar ? '#DC2626' : '#008545', 
            color: '#FFFFFF', 
            fontWeight: 400, 
            fontSize: 16, 
            alignItems: 'center', 
            borderRadius: 2 
          }}
          data-testid={buildTestId(testIdPrefix, isErrorSnackbar ? 'alert-error' : 'alert-success')}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <DeleteConfirmationDialog
              open={errorDialogOpen}
              onClose={handleErrorDismiss}
              onPrimaryCTA={handleErrorRetry}
              onSecondaryCTA={handleErrorDismiss}
              selectedCount={0}
              exclamationIcon={AvatarAlert}
              itemLabel=""
              markedCount={undefined}
              showUndoWarning={false}
              title="System error"
              message={
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '16px' }}>
                    {t('apiErrorHeader')}
                  </div>
                  <div style={{ fontSize: '14px', color: '#222E37' }}>
                    {t('apiErrorTitle')}
                    <br />
                    {t('apiErrorMessage')}
                  </div>
                </div>
              }
              primaryCTALabel="Try again"
              secondaryCTALabel="Dismiss"
              secondaryCTAWidth="auto"
              tertiaryCTAWidth="auto"
              testIdPrefix={buildTestId(testIdPrefix, 'system-error-dialog')}
            />
    </>
  );
}
