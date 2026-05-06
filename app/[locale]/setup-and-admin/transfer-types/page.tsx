'use client'
import { useRouter } from 'next/navigation';
import { useState, useMemo, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Box, Grid, TextField, InputAdornment, Snackbar, Alert } from "@mui/material";

import { Breadcrumb, Heading, Button, Loader } from "dist/standard-bank-react";
import TableContainer from "@molecules/TableContainer/TableContainer";
import {
  SearchIcon,
  FunnelIcon,
  Exclamation,
  CheckCircleIcon,
  AddIcon,
  DeleteIcon,
  IcnInfoCircleBlack,
} from 'lib/icons';
import TransferTypeFilterDialog from '@molecules/TransferTypeFilterDialog';
import DeleteConfirmationDialog from "components/common/DeleteConfirmationDialog";
import EmptyState from "components/common/EmptyState";
import { ListRightPanelActions } from "components/common";
import { Agreement, TransferTypeFilters } from "types/redux/transferTypes";
import { useTransferTypes } from "lib/hooks/useTransferTypes";
import { buildTestId } from "src/utils/testIds";
import { getStatusCodeByTabIndex, LINK_TEXT, TRANSFER_TYPE_TABLE_COLUMNS, transferTypesRoute, getEmptyStateType, EmptyStateType, TAB_INDICES, getTransferTypeBreadcrumbs, TRANSFER_TYPE_PAGE } from './transferTypeHelper';
import styles from './transferType.module.scss';
import { selectAgreements } from '@store/slices/setup-admin/transferTypes';
import { useSelector } from 'react-redux';

// Table container styles
const TABS_CONTAINER_SX = { backgroundColor: '#F8F8FA', borderRadius: 0 };

const TransferTypesPage = () => {
  const testIdPrefix = 'transfer-types-hub';
  const t = useTranslations('transferType');
  const router = useRouter();
  const {
    data,
    filteredData,
    filters,
    searchText,
    selectedRows,
    hasFiltersOrSearch,
    isLoading,
    applyFilters,
    updateSearchText,
    selectRows,
    clearAllFilters,
    deleteSelected,
  } = useTransferTypes({ autoFetch: true });
  const agreements = useSelector(selectAgreements);
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [filterDialogOpen, setFilterDialogOpen] = useState<boolean>(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);

  useEffect(() => {
    return () => {
      clearAllFilters();
      selectRows([]);
    };
  }, [clearAllFilters, selectRows]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTab]);

  const TABLE_HEAD_CELLS = useMemo(() => [
    { id: "id", label: t('tableColumnId'), numeric: true },
    { id: "transferTypeName", label: t('tableColumnTransferTypeName'), numeric: false },
    { id: "authorisationProfile", label: t('tableColumnAuthorisationProfile'), numeric: false },
    { id: "customerAgreement", label: t('tableColumnCustomerAgreement'), numeric: false },
    { id: "numberOfAccounts", label: t('tableColumnNumberOfAccounts'), numeric: true },
    { id: "status", label: t('tableColumnStatus'), numeric: false },
  ], [t]);

  const statusTabs = useMemo(() => [
    t('allRecords'),
    t('awaitingApproval'),
    t('active'),
    t('draft')
  ], [t]);

  const mappedRows = useMemo(() => {
    const statusCode = getStatusCodeByTabIndex(selectedTab);
    const filtered = !statusCode ? filteredData : filteredData.filter((row: any) => row.status.value === statusCode);
    
    return filtered.map(row => ({
      ...(row as object),
      status: {
        ...(row as any).status,
        value: t((row as any).status.value),
      },
      links: {
        ...(row as any).links,
        linkKey: (row as any).links.text,
        text: t((row as any).links.text),
      },
    }));
  }, [filteredData, selectedTab, t]);

  const customerAgreementOptions = useMemo(() => {
    return agreements && agreements
          .map((row: Agreement) => row?.agreementName)
          .filter((v: any) => typeof v === 'string' && v.trim().length > 0)
          .sort((a, b) => a.localeCompare(b));
  }, [agreements]);

  const handleFilterClick = useCallback((event?: React.MouseEvent<HTMLElement>) => {
    setFilterDialogOpen(true);
    if (event) {
      setFilterAnchorEl(event.currentTarget);
    }
  }, []);

  const handleFilterApply = useCallback((filterValues: TransferTypeFilters) => {
    applyFilters(filterValues);
    setCurrentPage(1);
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
  }, [applyFilters]);

  const handleFilterClose = useCallback(() => {
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
  }, []);

  const handleCheckboxClick = useCallback((rows: unknown) => {
    let selected: any[] = [];
    if (Array.isArray(rows)) {
      selected = rows;
    } else if (rows) {
      selected = [rows];
    }
    selectRows(selected);
  }, [selectRows]);

  const actionButtons = useMemo(() => {
    const buttons: Array<{
      children: React.ReactNode;
      buttonVariant: 'primary' | 'secondary' | 'tertiary';
      onClick: (event?: any) => void;
      disabled?: boolean;
      buttonProps?: Record<string, any>;
    }> = [];
    
    if (data && data.length > 0) {
      buttons.push({
        children: <><Image src={FunnelIcon} alt={t('altIconFilter')} width={16} height={16} className={styles['filter-icon']} />{t('buttonFilter')}</>,
        buttonVariant: 'tertiary',
        onClick: (event) => handleFilterClick(event),
        buttonProps: {
          'data-testid': buildTestId(testIdPrefix, 'filter-button'),
          'aria-label': t('buttonFilter'),
        },
      });
    }
    return buttons;
  }, [handleFilterClick, data, testIdPrefix, t]);

  // Slice data for current page only (server-side pagination approach)
  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * perPage;
    const endIndex = startIndex + perPage;
    return mappedRows.slice(startIndex, endIndex);
  }, [mappedRows, currentPage, perPage]);

  const tableData = useMemo(() => {
    const isAwaitingApprovalTab = selectedTab === TAB_INDICES.AWAITING_APPROVAL;
    const rowsToDisplay = isAwaitingApprovalTab
      ? paginatedRows.map(row => ({
          ...(row as object),
          links: { ...(row as any).links, text: t('tableColumnSendReminder') }
        }))
      : paginatedRows;
    
    return {
      columns: TRANSFER_TYPE_TABLE_COLUMNS,
      headCells: [
        ...TABLE_HEAD_CELLS,
        { id: "links", label: t('tableColumnQuickLinks'), numeric: false }
      ],
      rowButton: true,
      rows: rowsToDisplay,
      pageSize: perPage,
      rowCount: mappedRows.length,
    };
  }, [paginatedRows, selectedTab, TABLE_HEAD_CELLS, t, perPage, mappedRows.length]);

  const breadcrumbLinks = useMemo(() => getTransferTypeBreadcrumbs(TRANSFER_TYPE_PAGE.HUB, t), [t]);

  const handleCreateClick = useCallback(() => {
    router.push(transferTypesRoute.create);
  }, [router]);

  const handleLinkClick = useCallback((row: { id?: string; links?: { text?: string; linkKey?: string } }) => {
    const linkKey = (row?.links as any)?.linkKey;
    
    if (linkKey === LINK_TEXT.reminder) {
      setSnackbarOpen(true);
      return;
    }
    if ((linkKey === LINK_TEXT.manage || linkKey === LINK_TEXT.complete) && row.id) {
      router.push(transferTypesRoute.details.replace(':id', row.id));
    }
  }, [router]);

  const handleRemoveFilters = useCallback(() => {
    clearAllFilters();
  }, [clearAllFilters]);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    selectRows([]); 
  }, [selectRows]);

  const handlePerPageChange = useCallback((newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
    selectRows([]); 
  }, [selectRows]);

  const rightPanelButtons = useMemo(() => (
    <ListRightPanelActions
      selectedCount={selectedRows.length}
      hasFilters={selectedRows.length === 0 ? hasFiltersOrSearch : false}
      onRemoveFilters={handleRemoveFilters}
      testIdPrefix={buildTestId(testIdPrefix, 'right-panel-actions')}
    />
  ), [selectedRows.length, hasFiltersOrSearch, handleRemoveFilters, testIdPrefix]);

  const leftPanelButtons = useMemo(() => {
    if (selectedRows.length === 0 || selectedTab === TAB_INDICES.AWAITING_APPROVAL) return null;
    return (
      <Button
        buttonVariant="tertiary"
        onClick={() => setDeleteDialogOpen(true)}
        startIcon={
          <span className={styles['delete-icon-wrapper']}>
            <Image src={DeleteIcon} alt="Delete" width={20} height={20} />
          </span>
        }
        data-testid={buildTestId(testIdPrefix, 'delete-selected-button')}
        className={styles['delete-button']}
        aria-label={`${t('buttonDelete')} ${selectedRows.length} items`}
      >
        <span style={{ color: '#DC2626' }}>
          {t('buttonDelete')} ({selectedRows.length})
        </span>
      </Button>
    );
  }, [selectedRows.length, selectedTab, testIdPrefix, t]);

  const handleDeleteConfirm = useCallback(() => {
    deleteSelected(selectedRows);
    setDeleteDialogOpen(false);
  }, [selectedRows, deleteSelected]);

  const shouldHideTabsWhenEmpty = useMemo(() => {
    return !data || data.length === 0;
  }, [data]);

  const emptyStateContent = useMemo(() => {
    const emptyStateType = getEmptyStateType({
      hasData: mappedRows.length > 0,
      hasFiltersOrSearch,
      isAllTab: selectedTab === TAB_INDICES.ALL,
    });

    if (!emptyStateType) return null;

    const emptyStateComponents = {
      [EmptyStateType.NO_RESULTS]: (
        <EmptyState
          title={t('emptyStateNoResultsTitle')}
          description={t('emptyStateNoResultsDescription')}
          icon={<Image src={SearchIcon} alt={t('altIconNoResults')} width={32} height={32} />}
          data-testid={buildTestId(testIdPrefix, 'empty-state-no-results')}
        />
      ),
      [EmptyStateType.NO_DATA_ALL_TAB]: (
        <EmptyState
          title={t('emptyStateNoRecordsTitle')}
          description={t('emptyStateNoRecordsDescription')}
          icon={<Image src={IcnInfoCircleBlack} alt={t('altIconNoRecords')} width={32} height={32} />}
          data-testid={buildTestId(testIdPrefix, 'empty-state-no-records')}
        />
      ),
      [EmptyStateType.NO_DATA_FILTERED_TAB]: (
        <EmptyState
          title={t('emptyStateNoTransferTypesInStateTitle')}
          description={t('emptyStateNoTransferTypesInStateDescription')}
          icon={<Image src={SearchIcon} alt={t('altIconNoResults')} width={32} height={32} />}
          data-testid={buildTestId(testIdPrefix, 'empty-state-no-transfer-types')}
        />
      ),
    };

    return emptyStateComponents[emptyStateType];
  }, [mappedRows.length, hasFiltersOrSearch, selectedTab, t]);

  return (
      <Grid container spacing={2} className={styles['page-container']} data-testid={buildTestId(testIdPrefix, 'page')}>
        <Grid size={12} className={styles['breadcrumb-container']}>
          <Breadcrumb links={breadcrumbLinks} data-testid={buildTestId(testIdPrefix, 'breadcrumbs')} />
        </Grid>
        <Grid size={12} className={styles['transfer-type-subcontainer']}>
          <Heading as="h4" fontSize="24px" data-testid={buildTestId(testIdPrefix, 'heading')}>{t('pageHeading')}</Heading>
          <Box className={styles['button-container']}>
            <Button
              buttonVariant="secondary"
              startIcon={<Image src={AddIcon} alt={t('altIconAdd')} width={24} height={24} />}
              className={styles['create-button']}
              onClick={handleCreateClick}
              data-testid={buildTestId(testIdPrefix, 'create-button')}
              aria-label={t('createLabel')}
            >
              {t('createLabel')}
            </Button>
          </Box>
        </Grid>
        <Grid size={12} className={styles['search-container']}>
          <TextField
            fullWidth
            variant="outlined"
            className={styles['search-field']}
            placeholder={mappedRows.length === 0 ? t('searchPlaceholderEmpty') : t('searchPlaceholder')}
            value={searchText}
            onChange={e => {
              updateSearchText(e.target.value);
              setCurrentPage(1);
            }}
            data-testid={buildTestId(testIdPrefix, 'search-input')}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Image src={SearchIcon} alt={t('altIconSearch')} width={32} height={32} />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Grid>
        <Grid size={12} className={styles['transfer-type-table-container']}>
          {isLoading ? (
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
              filterButtons={actionButtons}
              onCheckboxClick={handleCheckboxClick}
              selectedRows={selectedRows}
              leftPanelContent={leftPanelButtons}
              rightPanelContent={rightPanelButtons}
              testIdPrefix={buildTestId(testIdPrefix, 'table')}
              showTabs={true}
              tabs={statusTabs.map((label, index) => ({ label, value: index }))}
              selectedTab={selectedTab}
              onTabChange={setSelectedTab}
              tabsContainerSx={TABS_CONTAINER_SX}
              onQuickLinkClick={handleLinkClick}
              emptyStateContent={emptyStateContent}
              hideTabsWhenEmpty={shouldHideTabsWhenEmpty}
              onPageChange={handlePageChange}
              onPerPageChange={handlePerPageChange}
              serverSidePagination={true}
              totalRecords={mappedRows.length}
              currentPage={currentPage}
              perPage={perPage}
            />
          )}
          <DeleteConfirmationDialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            onPrimaryCTA={handleDeleteConfirm}
            onSecondaryCTA={() => setDeleteDialogOpen(false)}
            selectedCount={selectedRows.length}
            exclamationIcon={Exclamation}
            itemLabel={t('deleteDialogItemLabel')}
            markedCount={selectedRows.length}
            testIdPrefix={buildTestId(testIdPrefix, 'delete-dialog')}
          />
          <TransferTypeFilterDialog
            open={filterDialogOpen}
            anchorEl={filterAnchorEl}
            onClose={handleFilterClose}
            onApply={handleFilterApply}
            initialFilters={filters}
            customerAgreementOptions={customerAgreementOptions}
            testIdPrefix={buildTestId(testIdPrefix, 'filter-dialog')}
          />
          
        </Grid>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          className={styles['snackbar-container']}
          data-testid={buildTestId(testIdPrefix, 'snackbar')}
        >
          <Alert
            icon={
              <Image src={CheckCircleIcon} alt={t('altIconSuccess')} width={20} height={20} />
            }
            severity="success"
            className={styles['success-alert']}
            data-testid={buildTestId(testIdPrefix, 'snackbar-alert')}
          >
            {t('snackbarReminderSent')}
          </Alert>
        </Snackbar>
      </Grid>
  );
};

export default TransferTypesPage;
