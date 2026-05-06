'use client'
import { Box, Snackbar, Alert } from "@mui/material";
import { Button, Loader } from "dist/standard-bank-react";
import { ListRightPanelActions } from "components/common";
import TableContainer from "@molecules/TableContainer/TableContainer";
import ListPageWrapper from "components/sections/ListPageWrapper";
import { useRouter } from 'next/navigation';
import { useState, useMemo, useCallback, useEffect } from "react";
import { useAppDispatch } from "@lib/hooks/useAppDispatch";
import { useAppSelector } from "@lib/hooks/useAppDispatch";
import {
  SearchIcon,
  FunnelIcon,
  AvatarAlert,
  CheckCircleIcon,
  AddIcon,
  IcnInfoCircleBlack
} from "lib/icons";
import CollectionTypeFilterDialog from '@molecules/CollectionTypeFilterDialog';
import { useTranslations } from "next-intl";
import Image from "next/image";
import DeleteConfirmationDialog from "components/common/DeleteConfirmationDialog";
import EmptyState from "components/common/EmptyState";
import {
  setFilters,
  setSelectedTab,
  clearFiltersAndSearch,
  clearDeleteError,
  setSearchType,
  setSearchValue,
} from "store/slices/collectionTypesSlice";
import { fetchAuthorisationProfiles } from '@store/slices/setup-admin/commonSlice/authorisationProfileSlice';
import { CollectionTypeFilters } from "types/redux/collectionTypes";
import { buildTestId } from "src/utils/testIds";
import { useCollectionTypes } from "@lib/hooks/useCollectionTypes";
import {
  TABLE_COLUMNS,
  getTableHeadCells,
  getStatusTabs,
  getBreadcrumbLinks,
  TEST_ID_PREFIX,
  navlinks,
  LINK_TEXT,
  getDeleteDialogContent,
} from "./collectionTypesHelper";
import { COLLECTION_TYPE_STATUS_CODES } from "types/redux/collectionTypes";
 
const CollectionType = () => {
    const testIdPrefix = TEST_ID_PREFIX;
    const translateLang = useTranslations('collectionTypesHubData');
    const router = useRouter();
    const dispatch = useAppDispatch();
   
    // Redux state for search
    const advancedSearchType = useAppSelector((state) => state.collectionTypes.searchType);
    const advancedSearchValue = useAppSelector((state) => state.collectionTypes.searchValue);
    
    // Redux state for authorisation profiles
    const authorisationProfiles = useAppSelector((state) => state.authorisationProfile.data);
   
    const [filterDialogOpen, setFilterDialogOpen] = useState(false);
    const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [dialogContent, setDialogContent] = useState<{ title: string; primary: string; secondary: string; itemLabel: string; itemLabel2: string } | null>(null);

    const handleShowDeleteError = useCallback(() => {
        const content = getDeleteDialogContent('delete_error', translateLang);
        setDialogContent(content);
        setDeleteDialogOpen(true);
    }, [translateLang]);

    const handleCloseDeleteDialog = useCallback(() => {
        setDeleteDialogOpen(false);
        dispatch(clearDeleteError());
    }, [dispatch]);
    
    // Fetch authorisation profiles on mount
    useEffect(() => {
        dispatch(fetchAuthorisationProfiles());
    }, [dispatch]);
   
    const {
        loading,
        filters,
        searchText,
        setSearchText,
        selectedRows,
        setSelectedRows,
        selectedTab,
        mappedRows,
        hasFiltersOrSearch,
        totalRows,
        currentPage,
        perPage,
        sortBy,
        handleSort,
        handlePageChange,
        handlePerPageChange,
        handleDelete
    } = useCollectionTypes({ onShowDeleteError: handleShowDeleteError });
 
    const statusTabs = useMemo(() => getStatusTabs(translateLang), [translateLang]);
 
    const TABLE_HEAD_CELLS = useMemo(() => getTableHeadCells(translateLang), [translateLang]);
 
    const handleFilterClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
        if (mappedRows.length === 0) return;
        setFilterDialogOpen(true);
        setFilterAnchorEl(event.currentTarget);
    }, [mappedRows.length]);
 
    const handleFilterApply = useCallback((filterValues: CollectionTypeFilters) => {
        const searchFields = ['collectionTypeName', 'authorisationProfile', 'numberOfCount'] as const;
        
        if (advancedSearchType && searchFields.includes(advancedSearchType as any)) {
            const filterKey = advancedSearchType as keyof CollectionTypeFilters;
            if (filterValues[filterKey] !== advancedSearchValue) {
                dispatch(setSearchType(''));
                dispatch(setSearchValue(''));
            }
        }
        
        dispatch(setFilters(filterValues));
        setFilterDialogOpen(false);
        setFilterAnchorEl(null);
    }, [dispatch, advancedSearchType, advancedSearchValue]);
 
    const handleFilterClose = useCallback(() => {
        setFilterDialogOpen(false);
        setFilterAnchorEl(null);
    }, []);
 
    const handleCheckboxClick = useCallback((rows: any | any[]) => {
        const selected = Array.isArray(rows) ? rows : rows ? [rows] : [];
        setSelectedRows(selected);
    }, [setSelectedRows]);
 
    const filterButtons = useMemo(() => {
        const isDisabled = mappedRows.length === 0;
       
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
                        <span style={{ fontSize: '14px', fontWeight: 700 }}>{translateLang('filter')}</span>
                    </>
                ),
                buttonVariant: 'tertiary',
                'data-testid': buildTestId(testIdPrefix, 'filter-button'),
                'aria-label': translateLang('filter'),
                onClick: handleFilterClick,
                disabled: isDisabled,
            },
        ];
    }, [handleFilterClick, mappedRows.length, testIdPrefix, translateLang]);
 
    const handleRemoveFilters = useCallback(() => {
        // Always clear dialog-specific filters (status)
        dispatch(clearFiltersAndSearch());
        
        // If SearchBar is NOT active, also clear search fields (they came from Filter Dialog)
        // If SearchBar IS active, user should clear via SearchBar's own clear button
        if (!advancedSearchType && (filters.collectionTypeName || filters.authorisationProfile || filters.numberOfCount)) {
            dispatch(setFilters({
                collectionTypeName: '',
                authorisationProfile: '',
                numberOfCount: '',
            } as CollectionTypeFilters));
        }
    }, [dispatch, advancedSearchType, filters]);
 
    
    const handleDeleteClick = useCallback(() => {
        const hasAwaitingApprovalRow = selectedRows.some((row: any) => row.status?.label === COLLECTION_TYPE_STATUS_CODES.AWAITING_APPROVAL);
        const content = hasAwaitingApprovalRow
            ? getDeleteDialogContent('delete_awaiting', translateLang)
            : getDeleteDialogContent('delete_active', translateLang, selectedRows.length);
        
        setDialogContent(content);
        setDeleteDialogOpen(true);
    }, [selectedRows, translateLang]);

    const rightPanelButtons = useMemo(() => {
        const canDelete = selectedRows.length > 0 && selectedTab !== 1;
        
        const hasDialogFilters = !!(filters.status);
        
        const hasSearchFilters = !!(
            filters.collectionTypeName || 
            filters.authorisationProfile || 
            filters.numberOfCount
        );
        
        const searchBarActive = !!advancedSearchType;
        
        const hasFilters = hasDialogFilters || (hasSearchFilters && !searchBarActive);
        
        return (
            <ListRightPanelActions
                selectedCount={selectedRows.length}
                hasFilters={hasFilters}
                onRemoveFilters={handleRemoveFilters}
                onDeleteClick={canDelete ? handleDeleteClick : undefined}
                testIdPrefix={buildTestId(testIdPrefix, 'right-panel-actions')}
            />
        );
    }, [selectedRows.length, filters, advancedSearchType, handleRemoveFilters, testIdPrefix, selectedTab, handleDeleteClick]);
 
    const tableData = useMemo(() => {
        const isAwaitingApprovalTab = selectedTab === 1;
        const linkLabel = isAwaitingApprovalTab ? translateLang('sendReminder') : translateLang('quickLinks');
 
        const rows = mappedRows.map((row) => {
            return {
                ...row,
                status: {
                    ...row.status,
                    value: translateLang(row.status.value),
                },
                links: {
                    ...row.links,
                    linkKey: row.links.text,
                    text: translateLang(row.links.text),
                },
            };
        });
 
        return {
            columns: TABLE_COLUMNS,
            headCells: [
                ...TABLE_HEAD_CELLS,
                { id: "links", label: linkLabel, numeric: false }
            ],
            rowButton: true,
            rows,
            pageSize: perPage,
            rowCount: rows.length,
        } as any;
    }, [mappedRows, selectedTab, perPage, TABLE_HEAD_CELLS, translateLang]);
 
    const breadcrumbLinks = useMemo(() => getBreadcrumbLinks(translateLang), [translateLang]);
 
    const handleCreateClick = useCallback(() => {
        router.push(navlinks.createCollectionType as any);
    }, [router]);
 
    const handleLinkClick = useCallback((row: any,) => {
        console.log('Link clicked for row:', row);
        const linkKey = row?.links?.linkKey;
        
        if (linkKey === LINK_TEXT.reminder) {
            setSnackbarMessage(translateLang('reminderSentMessage'));
            setSnackbarOpen(true);
            return;
        }
        if (linkKey === LINK_TEXT.complete || linkKey === LINK_TEXT.manage) {
            const key = row.collectionTypeKey ?? row.id;
            router.push(navlinks.manageCollectionType(key) as any);
        }
    }, [router, translateLang]);
 
    const handleDeleteConfirm = useCallback(async () => {
        const eligibleRows = selectedRows.filter((row: any) => row.status?.value !== COLLECTION_TYPE_STATUS_CODES.AWAITING_APPROVAL);
        const items = eligibleRows.map((item: any) => ({
            collectionTypeKey: item.collectionTypeKey ?? item.id,
            collectionTypeName: item.collectionTypeName
        }));
        
        setDeleteDialogOpen(false);
        
        try {
            await handleDelete(items);
            setSnackbarMessage(translateLang('collectionTypeDeletedSuccessfully'));
            setSnackbarOpen(true);
        } catch (error) {
        }
    }, [selectedRows, handleDelete, translateLang]);
 
    const advancedSearchOptions = useMemo(
        () => [
            { label: translateLang('searchCollectionTypeName'), value: 'collectionTypeName' },
            { label: translateLang('searchAuthorisationProfile'), value: 'authorisationProfile' },
            { label: translateLang('searchNumberOfCount'), value: 'numberOfCount' },
        ],
        [translateLang]
    );

    const advancedSearchPlaceholderMap = useMemo(
        () => ({
            collectionTypeName: translateLang('enterCollectionTypeName'),
            authorisationProfile: translateLang('enterAuthorisationProfile'),
            numberOfCount: translateLang('enterNumberOfCount'),
        }),
        [translateLang]
    );
    
    const authorisationProfileOptions = useMemo(
        () => authorisationProfiles.map((profile) => ({
            label: profile.authProfileName,
            value: profile.authProfileName,
        })),
        [authorisationProfiles]
    );
    
    const currentSearchFieldType = useMemo(() => {
        return advancedSearchType === 'authorisationProfile' ? 'dropdown' : 'input';
    }, [advancedSearchType]);
    
    const currentSearchFieldOptions = useMemo(() => {
        return advancedSearchType === 'authorisationProfile' ? authorisationProfileOptions : [];
    }, [advancedSearchType, authorisationProfileOptions]);

    const handleAdvancedSearch = useCallback(
        (searchType: string, searchValue: string) => {
            if (searchType && searchValue) {
                const filterUpdate: Partial<CollectionTypeFilters> = {
                    collectionTypeName: '',
                    authorisationProfile: '',
                    numberOfCount: '',
                };
                
                if (searchType === 'collectionTypeName') {
                    filterUpdate.collectionTypeName = searchValue;
                } else if (searchType === 'authorisationProfile') {
                    filterUpdate.authorisationProfile = searchValue;
                } else if (searchType === 'numberOfCount') {
                    filterUpdate.numberOfCount = searchValue;
                }
                
                dispatch(setFilters(filterUpdate as CollectionTypeFilters));
            }
        },
        [dispatch]
    );

    const handleClearSearchBar = useCallback(() => {
        dispatch(setSearchType(''));
        dispatch(setSearchValue(''));
        
        dispatch(setFilters({
            collectionTypeName: '',
            authorisationProfile: '',
            numberOfCount: '',
        } as CollectionTypeFilters));
    }, [dispatch]);
 
    return (
        <>
            <ListPageWrapper
                breadcrumbLinks={breadcrumbLinks}
               title={translateLang('collectionTypesTitle')}
                testIdPrefix={testIdPrefix}
                action={
                    <Box sx={{ '&:hover img': { filter: 'brightness(0) invert(1)' } }}>
                        <Button
                            buttonVariant="secondary"
                            startIcon={<Image src={AddIcon} alt="addicon" width={24} height={24} />}
                            style={{ height: 40 }}
                            onClick={handleCreateClick}
                            data-testid={buildTestId(testIdPrefix, 'create-button')}
                            aria-label={translateLang('createCollectionTypeBtn')}
                         
                        >
                           {translateLang('createCollectionTypeBtn')}
                        </Button>
                    </Box>
                }
                searchBar={{
                    searchTypeOptions: advancedSearchOptions,
                    searchTypePlaceholder: translateLang('searchByType'),
                    searchFieldType: currentSearchFieldType,
                    searchFieldOptions: currentSearchFieldOptions,
                    searchFieldPlaceholder: translateLang('selectSearchType'),
                    searchFieldPlaceholderMap: advancedSearchPlaceholderMap,
                    onSearch: handleAdvancedSearch,
                    onClear: handleClearSearchBar,
                    searchType: advancedSearchType,
                    searchValue: advancedSearchValue,
                    onSearchTypeChange: (value: string) => dispatch(setSearchType(value)),
                    onSearchValueChange: (value: string) => dispatch(setSearchValue(value)),
                }}
            >
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
                    selectedRows={selectedRows}
                    onCheckboxClick={handleCheckboxClick}
                    rightPanelContent={rightPanelButtons}
                    testIdPrefix={buildTestId(testIdPrefix, 'table')}
                    showTabs={true}
                    tabs={statusTabs.map((label, index) => ({ label, value: index }))}
                    selectedTab={selectedTab}
                    onTabChange={(value: number) => dispatch(setSelectedTab(value))}
                    tabsContainerSx={{ backgroundColor: '#F8F8FA', borderRadius: 0 }}
                    tableStyle={{}}
                    onQuickLinkClick={handleLinkClick}
                    hideTabsWhenEmpty={false}
                    serverSidePagination={true}
                    totalRecords={totalRows}
                    currentPage={currentPage}
                    perPage={perPage}
                    onPageChange={handlePageChange}
                    onPerPageChange={handlePerPageChange}
                    externalOrder={sortBy?.order === 'asc' ? 'asc' : 'desc'}
                    externalOrderBy={sortBy?.field}
                    onSort={handleSort}
                    emptyStateContent={
                        mappedRows.length === 0
                            ? hasFiltersOrSearch || selectedTab !== 0
                                ? (
                                    <EmptyState
                                        title={translateLang('noResultsFound')}
                                        description={translateLang('pleaseRefineSearch')}
                                        icon={<Image src={SearchIcon} alt="no results" width={32} height={32} />}
                                    />
                                )
                                : (
                                    <EmptyState
                                        title={translateLang('noRecordsToDisplay')}
                                        description={translateLang('noCollectionTypesCreated')}
                                        icon={<Image src={IcnInfoCircleBlack} alt="no collection types" width={32} height={32} />}
                                    />
                                )
                            : null
                    }
                />
                )}
                <CollectionTypeFilterDialog
                    open={filterDialogOpen}
                    anchorEl={filterAnchorEl}
                    onClose={handleFilterClose}
                    onApply={handleFilterApply}
                    initialFilters={filters}
                    testIdPrefix={buildTestId(testIdPrefix, 'filter-dialog')}
                    authorisationProfileOptions={authorisationProfileOptions}
                />
                <DeleteConfirmationDialog
                    open={deleteDialogOpen}
                    onClose={handleCloseDeleteDialog}
                    onPrimaryCTA={handleDeleteConfirm}
                    onSecondaryCTA={handleCloseDeleteDialog}
                    selectedCount={selectedRows.length}
                    exclamationIcon={AvatarAlert}
                    itemLabel={dialogContent?.itemLabel}
                    itemLabel2={dialogContent?.itemLabel2}
                    markedCount={selectedRows.length}
                    testIdPrefix={buildTestId(testIdPrefix, 'delete-dialog')}
                    title={dialogContent?.title}
                    primaryCTALabel={dialogContent?.primary}
                    secondaryCTALabel={dialogContent?.secondary}
                />
            </ListPageWrapper>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                sx={{ mt: 8 }}
                data-testid={buildTestId(testIdPrefix, 'snackbar')}
            >
                <Alert
                    icon={
                            <Image src={CheckCircleIcon} alt="success" width={20} height={20}  />
                    }
                    severity="success"
                    sx={{ backgroundColor: '#008545', color: '#FFFFFF', fontWeight: 400, fontSize: 16, alignItems: 'center', borderRadius: 2 }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};
export default CollectionType;