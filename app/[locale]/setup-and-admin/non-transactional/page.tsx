'use client';
import { Box, Grid, TextField, InputAdornment, Snackbar, Alert } from '@mui/material';
import { Breadcrumb, Heading, Button } from 'dist/standard-bank-react';
import DeleteConfirmationDialog from 'components/common/DeleteConfirmationDialog';
import EmptyState from 'components/common/EmptyState';
import TableContainer from '@molecules/TableContainer/TableContainer';
import NonTransactionalFilterDialog from '@molecules/NonTransactionalFilterDialog';
import AuthorizationRuleAccordion from '@molecules/AuthorizationRuleAccordion';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useAppDispatch,useAppSelector } from '@lib/hooks/useAppDispatch';
import { AppDispatch, RootState } from 'store';
import { saveAuthorizationRule, resetAllRules } from 'store/slices/authorizationRulesSlice';
import useNonTransactionalAuthRules from 'lib/hooks/useNonTransactionalAuthRules';
import useAuthorizationRulesConfig from 'lib/hooks/useAuthorizationRulesConfig';
import { buildTestId } from 'src/utils/testIds';
import {
  Exclamation,
  AddIcon,
  SearchIcon,
  DeleteIcon,
  FunnelIcon,
  ResetIcon,
  CheckCircleIcon,
  CloseIcon,
  IconPeopleEmptyState,
  AddIconCircle,
  SaveIconGrey
} from 'lib/icons';
import {
  TABLE_COLUMNS,
  navlinks,
  getBreadcrumbLinks,
  getSearchPlaceholder,
  getTableHeadCells,
  buildDeleteConfirmationMessage,
} from './nonTransactionalHelper';
import styles from './non-transactional.module.scss';

const NonTransactionalPage = () => {
  const testIdPrefix = 'non-transactional-authorisation';
  const t = useTranslations('nonTransactionalHubData');
  const router = useRouter();
  const dispatch = useAppDispatch();
  const savedRules = useAppSelector((state) => state.authorizationRules.rules);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const { items: rulesConfig } = useAuthorizationRulesConfig();
  const {
    filteredRows,
    filters,
    searchText,
    hasFiltersOrSearch,
    updateFilters,
    updateSearchText,
    clearFiltersAndSearch,
  } = useNonTransactionalAuthRules();
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, filters]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredRows.length / perPage));
    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  }, [filteredRows.length, perPage, currentPage]);

  const handleLinkClick = useCallback(
    (row: any) => {
      if (row && row.links && row.links.text === 'MANAGE AUTHORISATION RULE') {
        router.push(`/setup-and-admin/non-transactional/manage/` as any);
      }
    },
    [router],
  );

  const handleCheckboxClick = useCallback((rows: any | any[]) => {
    const selected = Array.isArray(rows) ? rows : rows ? [rows] : [];
    setSelectedRows(selected);
  }, []);

  const handleFilterOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setFilterDialogOpen(true);
    setFilterAnchorEl(event.currentTarget);
  }, []);

  const handleFilterClose = useCallback(() => {
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
  }, []);

  const handleFilterApply = useCallback((appliedFilters: any) => {
    updateFilters(appliedFilters);
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
  }, [updateFilters]);

  const handleDeleteClose = useCallback(() => setDeleteDialogOpen(false), []);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    setSelectedRows([]);
  }, []);

  const handlePerPageChange = useCallback((newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
    setSelectedRows([]);
  }, []);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateSearchText(e.target.value);
    },
    [updateSearchText],
  );

  const handleSaveRule = useCallback(
    (
      ruleId: string,
      title: string,
      operations: Record<string, { rule: string; enforceAudit: boolean }>,
    ) => {
      dispatch(saveAuthorizationRule({ id: ruleId, title, operations }));
    },
    [dispatch],
  );

  const accordionSaveHandlers = useMemo(() => {
    const handlers = new Map<
      string,
      (_formValues: Record<string, { rule: string; enforceAudit: boolean }>) => void
    >();
    rulesConfig.forEach((rule) => {
      handlers.set(rule.id, (_formValues) => handleSaveRule(rule.id, rule.title, _formValues));
    });
    return handlers;
  }, [handleSaveRule, rulesConfig]);

  const handleResetAllRules = useCallback(() => {
    dispatch(resetAllRules());
    setResetKey((prev) => prev + 1);
    setSelectedRows([]);
  }, [dispatch]);
 const handleSaveAllRules = useCallback(() => {
    setResetKey((prev) => prev + 1);
  }, []);
  const handleDeleteConfirm = useCallback(() => {
    setDeleteDialogOpen(false);
    setSelectedRows([]);
    setSnackbarOpen(true);
  }, []);

  const handleRemoveFilters = useCallback(() => {
    clearFiltersAndSearch();
  }, [clearFiltersAndSearch]);

  const handleCreateClick = useCallback(() => {
    router.push('/setup-and-admin/non-transactional/create' as any);
  }, [router]);

  const filterButtons = useMemo(
    () => [
      {
        children: (
          <>
            <Image src={FunnelIcon} alt="filter" width={16} height={16} className={styles.funnelIcon} />
            {t('buttonFilter')}
          </>
        ),
        buttonVariant: 'tertiary' as const,
        onClick: handleFilterOpen,
        'data-testid': buildTestId(testIdPrefix, 'button-filter'),
        'aria-label': 'Open filter dialog',
      },
    ],
    [handleFilterOpen, t, testIdPrefix],
  );

  const rightPanelButtons = useMemo(() => {
    const count = selectedRows.length;
    const hasFilters = Object.keys(filters).length > 0 || searchText.trim().length > 0;

    if (count === 0 && !hasFilters) return null;

    return (
      <Box sx={{ display: 'flex', gap: 1 }}>
        {count > 0 && (
          <Button
            buttonVariant="error-tertiary"
            onClick={() => setDeleteDialogOpen(true)}
            startIcon={
              <Image
                src={DeleteIcon}
                alt="delete"
                width={24}
                height={24}
                className={styles.deleteIconFilter}
              />
            }
            className={styles.deleteButton}
            data-testid={buildTestId(testIdPrefix, 'button-delete-selected')}
            aria-label={`Delete ${count} selected items`}
          >
            {t('buttonDelete')} ({count})
          </Button>
        )}
        {hasFilters && (
          <Button
            buttonVariant="tertiary"
            endIcon={<Image src={CloseIcon} alt="close" width={20} height={20} />}
            onClick={handleRemoveFilters}
            className={styles.removeFiltersButton}
            data-testid={buildTestId(testIdPrefix, 'button-remove-filters')}
            aria-label="Remove all filters"
          >
            {t('buttonRemoveFilters')}
          </Button>
        )}
      </Box>
    );
  }, [selectedRows.length, filters, searchText, handleRemoveFilters, t]);

  const accordionList = useMemo(
    () =>
      rulesConfig.map((rule) => (
        <Grid size={12} key={`${rule.id}-${resetKey}`} sx={{ mb: '16px' }}>
          <AuthorizationRuleAccordion
            title={rule.title}
            operations={rule.operations}
            onSave={accordionSaveHandlers.get(rule.id)!}
            initialValues={savedRules[rule.id]?.operations}
            defaultExpanded={false}
            showSaveButton={false}
          />
        </Grid>
      )),
    [rulesConfig, accordionSaveHandlers, savedRules, resetKey],
  );

  const tableData = useMemo(
    () => ({
      columns: TABLE_COLUMNS,
      headCells: getTableHeadCells(t),
      rowButton: true,
      rows: filteredRows,
      pageSize: perPage,
      rowCount: filteredRows.length,
    }),
    [filteredRows, perPage, t],
  );

  return (
    <>
      <Grid container spacing={4} sx={{ pb: 4 }} className={styles.container} data-testid={buildTestId(testIdPrefix, 'container')}>
        <Grid size={12}>
          <Breadcrumb links={getBreadcrumbLinks(t)} data-testid={buildTestId(testIdPrefix, 'breadcrumb')} />
        </Grid>
        <Grid
          size={12}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '48px',
          }}
        >
          <Heading as="h4" fontSize="28px" data-testid={buildTestId(testIdPrefix, 'heading-profile')}>
            {t('pageHeadingProfile')}
          </Heading>
          <Box className={styles.iconHover}>
            <Button
              buttonVariant="secondary"
              startIcon={<Image src={AddIcon} alt="addicon" width={24} height={24} />}
              className={styles.createRuleButton}
              onClick={handleCreateClick}
              data-testid={buildTestId(testIdPrefix, 'button-create-profile')}
              aria-label="Create non-transactional authorisation profile"
            >
              {t('buttonCreateProfile')}
            </Button>
          </Box>
        </Grid>
        <Grid size={12}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder={getSearchPlaceholder(t, filteredRows.length, hasFiltersOrSearch)}
            value={searchText}
            onChange={handleSearchChange}
            data-testid={buildTestId(testIdPrefix, 'input-search')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Image src={SearchIcon} alt="search" width={32} height={32} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: '#fff',
              },
              '& .MuiInputBase-input::placeholder': {
                color: '#5C6C80',
                opacity: 1,
              },
            }}
          />
        </Grid>
        <Grid
          size={12}
          ref={tableContainerRef}
          sx={{
            padding: 0,
            backgroundColor: '#F8F8FA',
            borderRadius: '12px',
            border: '1px solid #e0e0e0',
            overflow: 'hidden',
          }}
          data-testid={buildTestId(testIdPrefix, 'table-wrapper')}
        >
          <TableContainer
            tableData={tableData}
            filterButtons={filterButtons}
            showTabs={false}
            tableStyle={{}}
            testIdPrefix={buildTestId(testIdPrefix, 'table-container')}
            currentPage={currentPage}
            perPage={perPage}
            onQuickLinkClick={handleLinkClick}
            onCheckboxClick={handleCheckboxClick}
            selectedRows={selectedRows}
            rightPanelContent={rightPanelButtons}
            onPageChange={handlePageChange}
            onPerPageChange={handlePerPageChange}
            emptyStateContent={
              filteredRows.length === 0 ? (
                hasFiltersOrSearch ? (
                  <EmptyState
                    title={t('emptyNoResultsTitle')}
                    description={t('emptyNoResultsDescription')}
                    icon={<Image src={SearchIcon} alt="no results" width={32} height={32} />}
                  />
                ) : (
                  <EmptyState
                    title={t('emptyNoRulesTitle')}
                    description={t('emptyNoRulesDescription')}
                    buttonLabel={t('buttonCreateRule')}
                    icon={
                      <Image
                        src={IconPeopleEmptyState}
                        alt="no authorisation rules"
                        width={32}
                        height={32}
                      />
                    }
                    buttonIcon={
                      <Image
                        src={AddIconCircle}
                        alt="add authorisation rule"
                        width={24}
                        height={24}
                      />
                    }
                    onButtonClick={handleCreateClick}
                    data-testid={buildTestId(testIdPrefix, 'empty-state-no-rules')}
                  />
                )
              ) : null
            }
          />
        </Grid>
        <Grid size={12}>
          <Heading as="h4" fontSize="28px" data-testid={buildTestId(testIdPrefix, 'heading-hub')}>
            {t('pageHeadingHub')}
          </Heading>
        </Grid>
        <Grid size={12}>{accordionList}</Grid>
        <Grid size={12} gap={2} sx={{ display: 'flex', justifyContent: 'flex-end', mt: '-32px' }}>
          <Button
            buttonVariant="tertiary"
            startIcon={<Image src={ResetIcon} alt="reset" width={24} height={24} />}
            className={styles.resetButton}
            onClick={handleResetAllRules}
            data-testid={buildTestId(testIdPrefix, 'button-reset-all')}
            aria-label="Reset all rules"
          >
            {t('buttonResetAll')}
          </Button>
          <Button
            buttonVariant="primary"
            startIcon={<Image src={SaveIconGrey} alt="save" width={24} height={24} />}
            onClick={handleSaveAllRules}
            style={{backgroundColor:"#E3E6EA",color:"#465463"}}
            data-testid={buildTestId(testIdPrefix, 'button-save-entity')}
            aria-label="Save entity"
          >
            {t('buttonSaveEntity')}
          </Button>
        </Grid>
      </Grid>
      <NonTransactionalFilterDialog
        open={filterDialogOpen}
        anchorEl={filterAnchorEl}
        onClose={handleFilterClose}
        onApply={handleFilterApply}
        initialValues={filters}
        testIdPrefix={buildTestId(testIdPrefix, 'filter-dialog')}
      />
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleDeleteClose}
        onPrimaryCTA={handleDeleteConfirm}
        onSecondaryCTA={handleDeleteClose}
        selectedCount={selectedRows.length}
        exclamationIcon={Exclamation}
        itemLabel={t('deleteConfirmationItemLabel')}
        markedCount={selectedRows.length}
        message={buildDeleteConfirmationMessage(t, selectedRows.length)}
        testIdPrefix={buildTestId(testIdPrefix, 'dialog-delete-confirmation')}
      />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ mt: 8 }}
        data-testid={buildTestId(testIdPrefix, 'snackbar-success')}
      >
        <Alert
          icon={<Image src={CheckCircleIcon} alt="success" width={20} height={20} />}
          severity="success"
          data-testid={buildTestId(testIdPrefix, 'alert-delete-success')}
          sx={{
            backgroundColor: '#008545',
            color: '#FFFFFF',
            fontWeight: 400,
            fontSize: 16,
            alignItems: 'center',
            borderRadius: 2,
          }}
        >
          {t('snackbarDeleteSuccess')}
        </Alert>
      </Snackbar>
    </>
  );
};

export default NonTransactionalPage;
