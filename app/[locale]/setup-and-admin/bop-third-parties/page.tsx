'use client';
import { useState, useMemo, useCallback, useRef } from 'react';
import { Box } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { buildTestId } from 'src/utils/testIds';

import { Button } from 'dist/standard-bank-react';
import DeleteConfirmationDialog from 'components/common/DeleteConfirmationDialog';
import TableContainer from '@molecules/TableContainer/TableContainer';
import { FunnelIcon,SearchIcon, AddIcon, Exclamation } from '@lib/icons';
import CommonSnackbar from 'components/common/CommonSnackbar';
import FilterBopThirdPartiesDrawer, {
  FilterValues,
} from '@molecules/FilterBopThirdPartiesDrawer/FilterBopThirdPartiesDrawer';
import DownloadBopThirdPartyDialog from '@molecules/DownloadBopThirdPartyDialog/DownloadBopThirdPartyDialog';
import { mockBopThirdParties } from 'lib/mock/mockBopThirdParties';
import { ListPageWrapper } from 'components/sections';
import { ListRightPanelActions } from 'components/common';
import { 
  STATUS_TAB_KEYS, 
  TAB_STATUS_MAP,
  TABLE_COLUMNS, 
  TABLE_HEAD_CELL_KEYS,
  bopThirdPartiesUrl, 
  MANAGE_LINKS_KEY, 
  getBreadcrumbLinks,
  textMatches,
  textEquals,
  matchesSearchText,
} from './bopThirdPartyHelper';
import styles from "./bopThirdParties.module.scss"

const BopThirdPartiesPage = () => {
  const router = useRouter();
  const t = useTranslations('bopThirdParties');
  const testIdPrefix = 'bop-third-parties-list';
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState<boolean>(false);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState<boolean>(false);
  const [filterValues, setFilterValues] = useState<Partial<FilterValues>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [downloadSnackbarOpen, setDownloadSnackbarOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(15);

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
  }, []);

  const handleDownloadClose = useCallback(() => {
    setDownloadDialogOpen(false);
    setDownloadAnchorEl(null);
  }, []);

  const handleDeleteClose = useCallback(() => setDeleteDialogOpen(false), []);

  const handleDeleteConfirm = useCallback(() => {
    setDeleteDialogOpen(false);
    setSnackbarOpen(true);
    setSelectedRows([]);
  }, []);

  const handleDownload = useCallback(() => {
    setDownloadDialogOpen(false);
    setDownloadAnchorEl(null);
    setDownloadSnackbarOpen(true);
  }, []);

  const handleCreateClick = useCallback(() => {
    router.push(bopThirdPartiesUrl.create);
  }, [router]);

  const handleRemoveFilters = useCallback(() => {
    setFilterValues({});
    setSearchText('');
  }, []);

  const matchesTabStatus = useCallback((row: any): boolean => {
    if (selectedTab === 0) return true;
    return row.status.value === TAB_STATUS_MAP[selectedTab];
  }, [selectedTab]);

  const matchesFilters = useCallback((row: any): boolean => {

    const passesEntityFilter = !filterValues.entity || textEquals(row.entityType, filterValues.entity);
    const passesNameFilter = !filterValues.name || textMatches(row.thirdPartyName, filterValues.name);
    const passesSurnameFilter = !filterValues.surname || textMatches(row.thirdPartyName, filterValues.surname);
    const passesCountryFilter = !filterValues.countryRegion || textMatches(row.countryRegion, filterValues.countryRegion);
    const passesBopIdFilter = !filterValues.bopThirdPartyId || textMatches(row.bopThirdPartyID, filterValues.bopThirdPartyId);
    const passesCustomsFilter = !filterValues.customsClientNo || textMatches(row.bopThirdPartyID, filterValues.customsClientNo);
    const passesStatusFilter = !filterValues.status || row.status.value === filterValues.status;

    return passesEntityFilter && 
           passesNameFilter && 
           passesSurnameFilter && 
           passesCountryFilter && 
           passesBopIdFilter && 
           passesCustomsFilter && 
           passesStatusFilter;
  }, [filterValues]);

  const filteredRows = useMemo(() => {
    const searchLower = searchText.trim().toLowerCase();

    return mockBopThirdParties.filter((row) => {

      const passesTabFilter = matchesTabStatus(row);
      const passesFilters = matchesFilters(row);
      const passesSearch = matchesSearchText(row, searchLower);

      return passesTabFilter && passesFilters && passesSearch;
    });
  }, [searchText, matchesTabStatus, matchesFilters]);

  const normalizeSelectedRows = useCallback((rows: any): any[] => {
    if (Array.isArray(rows)) {
      return rows;
    }
    return rows ? [rows] : [];
  }, []);

  const handleCheckboxClick = useCallback(
    (rows: any) => {
      const selected = normalizeSelectedRows(rows);
      
      if (selected.length === 0) {
        setSelectedRows([]);
        return;
      }
      
      if (selected.length === 1) {
        setSelectedRows(selected);
        return;
      }
      
      const startIndex = (currentPage - 1) * perPage;
      const endIndex = startIndex + perPage;
      const currentPageRows = filteredRows.slice(startIndex, endIndex);
      const currentPageIds = new Set(currentPageRows.map((r) => r.id));
      const pageSelections = selected.filter((row) => currentPageIds.has(row.id));
      
      setSelectedRows(pageSelections);
    },
    [currentPage, perPage, filteredRows, normalizeSelectedRows],
  );

  const filterButtons = useMemo(() => {
    return [
      {
        children: (
          <>
            <Image
              src={FunnelIcon}
              alt="filter"
              width={16}
              height={16}
              style={{ marginRight: 4 }}
            />
            {t('filterButton')}
          </>
        ),
        buttonVariant: 'tertiary',
        onClick: handleFilterClick,
        'data-testid': buildTestId(testIdPrefix, 'filter-button'),
      },
    ];
  }, [handleFilterClick, t]);

  const rightPanelButtons = useMemo(() => {
    const count = selectedRows.length;
    const hasFilters = Object.keys(filterValues).length > 0 || searchText.trim().length > 0;

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
        onDeleteClick={() => setDeleteDialogOpen(true)}
      />
    );
  }, [selectedRows.length, filterValues, searchText, handleRemoveFilters]);

  const translatedHeadCells = useMemo(
    () => TABLE_HEAD_CELL_KEYS.map(cell => ({
      id: cell.id,
      label: t(cell.labelKey),
      numeric: cell.numeric,
    })),
    [t],
  );

  const rowsWithManageLinkTestId = useMemo(() => {
    return filteredRows.map((row) => ({
      ...row,
      links: {
        ...row.links,
        originalText: row.links?.text,
        text: (
          <span data-testid={buildTestId(testIdPrefix, 'manage-bop-third-party-link', row.id)}>
            {row.links?.text ?? ''}
          </span>
        ),
      },
    }));
  }, [filteredRows]);

  const tableData = useMemo(
    () => ({
      columns: TABLE_COLUMNS,
      headCells: translatedHeadCells,
      rowButton: true,
      rows: rowsWithManageLinkTestId,
      pageSize: 15,
      rowCount: rowsWithManageLinkTestId.length,
    }),
    [rowsWithManageLinkTestId, translatedHeadCells],
  );

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    setSelectedRows([]); 
  }, []);

  const handlePerPageChange = useCallback((newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
    setSelectedRows([]); 
  }, []);

  const handleLinkClick = useCallback(
    (row: any) => {
      if (row?.links?.originalText === MANAGE_LINKS_KEY) {
        const queryParams = new URLSearchParams({
          id: row.id,
          type: row.entityType,
          postal: row.hasPostalAddress.toString(),
        }).toString();
        router.push(`${bopThirdPartiesUrl.manage}?${queryParams}` as any);
      }
    },
    [router],
  );

  const breadcrumbLinks = useMemo(
    () => getBreadcrumbLinks('home', t),
    [t],
  );

  const translatedTabs = useMemo(
    () => STATUS_TAB_KEYS.map((key, index) => ({ label: t(key), value: index })),
    [t],
  );

  return (
    <ListPageWrapper
      testIdPrefix={testIdPrefix}
      breadcrumbLinks={breadcrumbLinks}
      title={t('pageTitle')}
      action={
        <Box className={styles['bop-thirdparties-create-box']}>
          <Button
            buttonVariant="secondary"
            data-testid={buildTestId(testIdPrefix, 'create-button')}
            startIcon={<Image src={AddIcon} alt="addicon" width={24} height={24} />}
            style={{ height: 48 }}
            onClick={handleCreateClick}
          >
            {t('createButton')}
          </Button>
        </Box>
      }
      searchPlaceholder={t('searchPlaceholder')}
      searchValue={searchText}
      onSearchChange={setSearchText}
      searchIcon={<Image src={SearchIcon} alt="search" width={32} height={32} />}
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
        tabs={translatedTabs}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        tabsContainerSx={{ backgroundColor: '#F8F8FA', borderRadius: 0 }}
        tableStyle={{}}
        onPageChange={handlePageChange}
        onPerPageChange={handlePerPageChange}
        onQuickLinkClick={handleLinkClick}
        perPage={perPage}
        currentPage={currentPage}
      />
      <FilterBopThirdPartiesDrawer
        data-testid={buildTestId(testIdPrefix, 'filter-drawer')}
        open={filterDrawerOpen}
        anchorEl={filterAnchorEl}
        onClose={handleFilterClose}
        onApply={handleFilterApply}
        initialValues={filterValues}
      />
      <DownloadBopThirdPartyDialog
        data-testid={buildTestId(testIdPrefix, 'download-dialog')}
        open={downloadDialogOpen}
        anchorEl={downloadAnchorEl}
        onClose={handleDownloadClose}
        onDownload={handleDownload}
        title={t('downloadDialogTitle')}
      />
      <DeleteConfirmationDialog
        data-testid={buildTestId(testIdPrefix, 'delete-dialog')}
        open={deleteDialogOpen}
        onClose={handleDeleteClose}
        onPrimaryCTA={handleDeleteConfirm}
        onSecondaryCTA={handleDeleteClose}
        selectedCount={selectedRows.length}
        exclamationIcon={Exclamation}
        itemLabel={`${selectedRows.length} ${t('deleteMarkedCount')}`}
        itemLabel2={`${t('deleteConfirmationQuestion')} ${selectedRows.length} ${t('deleteConfirmationQuestionSuffix')}`}
        itemLabel3={t('deleteWarning')}
        markedCount={selectedRows.length}
        primaryCTALabel={t('deleteButtonLabel')}
        secondaryCTALabel={t('dismissButton')}
      />
      <CommonSnackbar
        data-testid={buildTestId(testIdPrefix, 'delete-success-snackbar')}
        open={snackbarOpen}
        message={t('deleteSuccessMessage')}
        severity="success"
        onClose={() => setSnackbarOpen(false)}
        autoHideDuration={4000}
      />
      <CommonSnackbar
        data-testid={buildTestId(testIdPrefix, 'download-success-snackbar')}
        open={downloadSnackbarOpen}
        message={t('downloadSuccessMessage')}
        severity="success"
        onClose={() => setDownloadSnackbarOpen(false)}
        autoHideDuration={4000}
      />
    </ListPageWrapper>
  );
};

export default BopThirdPartiesPage;
