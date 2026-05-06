'use client'
import { Box } from "@mui/material";
import { Button } from "dist/standard-bank-react";
import TableContainer from "@molecules/TableContainer/TableContainer";
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useMemo, useCallback, useEffect } from "react";
import { useAppDispatch } from "@lib/hooks/useAppDispatch";
import { useAppSelector } from "@lib/hooks/useAppDispatch";
import {
    SearchIcon,
    FunnelIcon,
    Exclamation,
    AddIcon,
    IconPeopleProfile,
} from 'lib/icons';
import PaymentTypeFilterDialog from '@molecules/PaymentTypeFilterDialog';
import AvatarAlert from 'public/icons/avatar_alert.svg';
import { usePaymentTypes, type PaymentTypeListRow } from "lib/hooks/usePaymentTypes";
import { useTranslations } from "next-intl";
import Image from "next/image";
import DeleteConfirmationDialog from "components/common/DeleteConfirmationDialog";
import CommonSnackbar from "components/common/CommonSnackbar";
import EmptyState from "components/common/EmptyState";
import { ListPageWrapper } from "components/sections";
import { ListRightPanelActions } from "components/common";
import { buildTestId } from 'src/utils/testIds';
import {
    setFilters,
    setSelectedTab,
    setSearchType,
    setSearchValue,
    clearFiltersAndSearch,
    type PaymentTypeFilters,
} from "store/slices/paymentTypesSlice";
import { fetchAuthorisationProfiles } from '@store/slices/setup-admin/commonSlice/authorisationProfileSlice';
import { getTableHeadCells, navlinks, TABLE_COLUMNS, getStatusTabLabels, getStatusByTabIndex } from "./paymentTypesHelper";
import { deletePaymentTypesMulti } from "lib/api/paymentTypesApi";
import './payment-types.scss';

type TableRow = PaymentTypeListRow;

const PaymentType = () => {
    const testIdPrefix = 'payment-types-hub';
    const t = useTranslations('paymenttypes');
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();

    // Redux state for search
    const advancedSearchType = useAppSelector((state) => state.paymentTypes.searchType);
    const advancedSearchValue = useAppSelector((state) => state.paymentTypes.searchValue);
    const filters = useAppSelector((state) => state.paymentTypes.filters);
    const selectedTab = useAppSelector((state) => state.paymentTypes.selectedTab);

    // Redux state for authorisation profiles
    const authorisationProfiles = useAppSelector((state) => state.authorisationProfile.data);

    const [filterDialogOpen, setFilterDialogOpen] = useState(false);
    const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedRows, setSelectedRows] = useState<TableRow[]>([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isMixedStatusDelete, setIsMixedStatusDelete] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
    const [perPage, setPerPage] = useState(15);

    const { rows: paymentTypeRows, fetch: refetchPaymentTypes } = usePaymentTypes({ autoFetch: true });

    const statusTabs = useMemo(() => getStatusTabLabels(t), [t]);

    // Fetch authorisation profiles on mount
    useEffect(() => {
        dispatch(fetchAuthorisationProfiles());
    }, [dispatch]);

    useEffect(() => {
        const cancelled = searchParams?.get('cancelled');
        if (cancelled === 'true') {
            setSnackbarMessage('Payment type creation cancelled successfully');
            setSnackbarOpen(true);
            router.replace('/setup-and-admin/payment-types');
        }
    }, [searchParams, router]);

    useEffect(() => {
        setSelectedRows([]);
    }, [selectedTab]);

    const mappedRows: TableRow[] = useMemo(() => {
        const statusFilter = getStatusByTabIndex(selectedTab);

        return paymentTypeRows
            .filter((row) => {
                if (statusFilter && row.status.value !== statusFilter) return false;

                if (filters.paymentTypeName && !row.paymentTypeName.toLowerCase().includes(filters.paymentTypeName.toLowerCase())) return false;
                if (filters.authorisationProfile && !row.authorisationProfile.toLowerCase().includes(filters.authorisationProfile.toLowerCase())) return false;
                if (filters.numberOfAccounts && filters.numberOfAccounts !== '' &&
                    !((filters.numberOfAccounts === '>3' && row.numberOfAccounts > 3) || row.numberOfAccounts.toString() === filters.numberOfAccounts)) return false;
                if (filters.payAlerts && row.payAlerts !== filters.payAlerts) return false;
                if (filters.status && row.status.value !== filters.status) return false;

                return true;
            })
            .map((row) => row);
    }, [filters, selectedTab, paymentTypeRows]);

    const handleFilterClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
        if (mappedRows.length === 0) return;
        setFilterDialogOpen(true);
        setFilterAnchorEl(event.currentTarget);
    }, [mappedRows.length]);

    const handleFilterApply = useCallback((filterValues: any) => {
        const searchFields = ['paymentTypeName', 'authorisationProfile', 'numberOfAccounts'] as const;
        
        if (advancedSearchType && searchFields.includes(advancedSearchType as any)) {
            const filterKey = advancedSearchType as keyof PaymentTypeFilters;
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

    const handleRemoveFilters = useCallback(() => {
        // Always clear dialog-specific filters (status, payAlerts)
        dispatch(clearFiltersAndSearch());
        
        // If SearchBar is NOT active, also clear search fields (they came from Filter Dialog)
        // If SearchBar IS active, user should clear via SearchBar's own clear button
        if (!advancedSearchType && (filters.paymentTypeName || filters.authorisationProfile || filters.numberOfAccounts)) {
            dispatch(setFilters({
                paymentTypeName: '',
                authorisationProfile: '',
                numberOfAccounts: '',
            } as PaymentTypeFilters));
        }
    }, [dispatch, advancedSearchType, filters]);

    const handlePerPageChange = useCallback((newPerPage: number) => {
        setPerPage(newPerPage);
    }, []);


    const handleCheckboxClick = useCallback((rows: TableRow | TableRow[]) => {
        const selected = Array.isArray(rows) ? rows : rows ? [rows] : [];
        setSelectedRows(selected);
    }, []);

    const actionButtons = useMemo(() => {
        const buttons = [];

        buttons.push({
            children: <><Image src={FunnelIcon} alt="filter" width={16} height={16} style={{ marginRight: 4 }} />{t('filterButton')}</>,
            buttonVariant: 'tertiary',
            onClick: handleFilterClick,
            disabled: mappedRows.length === 0,
            buttonProps: {
                'data-testid': buildTestId(testIdPrefix, 'filter-button'),
            },
        });

        return buttons;
    }, [handleFilterClick, mappedRows.length, t]);

    const rightPanelButtons = useMemo(() => {
        const canDelete = selectedRows.length > 0 && selectedTab !== 1;
        
        const hasDialogFilters = !!(filters.status || filters.payAlerts);
        
        const hasSearchFilters = !!(
            filters.paymentTypeName || 
            filters.authorisationProfile || 
            filters.numberOfAccounts
        );
        
        const searchBarActive = !!advancedSearchType;
        
        const hasFilters = hasDialogFilters || (hasSearchFilters && !searchBarActive);

        const handleDeleteClick = () => {
            const activeRows = selectedRows.filter((row) => row.status.value === 'Active');
            const hasNonActive = selectedRows.length > activeRows.length;
            setIsMixedStatusDelete(hasNonActive);
            setDeleteDialogOpen(true);
        };

        return (
            <ListRightPanelActions
                selectedCount={selectedRows.length}
                hasFilters={hasFilters}
                onRemoveFilters={handleRemoveFilters}
                onDeleteClick={canDelete ? handleDeleteClick : undefined}
                testIdPrefix={buildTestId(testIdPrefix, 'right-panel-actions')}
            />
        );
    }, [filters, advancedSearchType, handleRemoveFilters, selectedRows, testIdPrefix, selectedTab]);

    const handleDeleteConfirm = useCallback(async () => {
        if (selectedRows.length === 0) return;

        try {
            const activeRows = selectedRows.filter((row) => row.status.value === 'Active');
            if (activeRows.length === 0) {
                setDeleteDialogOpen(false);
                setIsMixedStatusDelete(false);
                return;
            }

            const payload = activeRows.map((row) => ({
                paymentTypeKey: row.paymentTypeKey,
                name: row.paymentTypeName,
            }));

            await deletePaymentTypesMulti(payload);

            setSelectedRows([]);
            setDeleteDialogOpen(false);
            setIsMixedStatusDelete(false);

            setSnackbarSeverity('success');
            setSnackbarMessage(
                activeRows.length === 1 ? 'Payment type deleted successfully' : 'Payment types deleted successfully'
            );
            setSnackbarOpen(true);

            refetchPaymentTypes();
        } catch (e: any) {
            setDeleteDialogOpen(false);
            setIsMixedStatusDelete(false);
            setSnackbarSeverity('error');
            setSnackbarMessage(e?.message || 'Unable to delete payment types. Please try again.');
            setSnackbarOpen(true);
        }
    }, [selectedRows, refetchPaymentTypes]);

    const tableData = useMemo(() => {
        const TABLE_HEAD_CELLS = getTableHeadCells(t);


        return {
            columns: TABLE_COLUMNS,
            headCells: [
                ...TABLE_HEAD_CELLS,
                { id: "links", label: t('quickLinks'), numeric: false }
            ],
            rowButton: true,
            rows: mappedRows.map((row) => {
                let linkText;
                if (row.status.value === 'Awaiting Approval') {
                    linkText = t('sendReminder');
                } else if (row.status.value === 'Draft') {
                    linkText = t('completePaymentType');
                } else {
                    linkText = t('managePaymentType');
                }
                return {
                    ...row,
                    links: { 
                        ...row.links, 
                        text: linkText
                    },
                };
            }),
            pageSize: perPage,
            rowCount: mappedRows.length,
        };
    }, [mappedRows, t, perPage]);


    const hasFiltersOrSearch = useMemo(
        () => Object.keys(filters).length > 0,
        [filters]
    );
    const hasAnyData = paymentTypeRows.length > 0;
    const breadcrumbLinks = useMemo(() => [
        { href: navlinks.dashboard, label: t('dashboard') },
        { href: navlinks.paymentTypes, label: t('paymentTypesBreadcrumb') }
    ], [t]);

    const handleCreateClick = useCallback(() => {
        router.push(navlinks.createPaymentType as any);
    }, [router]);

    const handleLinkClick = useCallback((row: TableRow) => {
        if (row && row.links && row.links.text === t('sendReminder')) {
            setSnackbarOpen(true);
            return;
        }
        if (row && row.links && (row.links.text === t('managePaymentType') || row.links.text === t('completePaymentType'))) {
            router.push(`${navlinks.managePaymentType}/${row.id}` as any);
        }
    }, [router, t]);

    const advancedSearchOptions = useMemo(
        () => [
            { label: t('searchPaymentTypeName'), value: 'paymentTypeName' },
            { label: t('searchAuthorisationProfile'), value: 'authorisationProfile' },
            { label: t('searchNumberOfAccounts'), value: 'numberOfAccounts' },
        ],
        [t]
    );

    const advancedSearchPlaceholderMap = useMemo(
        () => ({
            paymentTypeName: t('enterPaymentTypeName'),
            authorisationProfile: t('enterAuthorisationProfile'),
            numberOfAccounts: t('enterNumberOfAccounts'),
        }),
        [t]
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
                const filterUpdate: Partial<PaymentTypeFilters> = {
                    paymentTypeName: '',
                    authorisationProfile: '',
                    numberOfAccounts: '',
                };
                
                if (searchType === 'paymentTypeName') {
                    filterUpdate.paymentTypeName = searchValue;
                } else if (searchType === 'authorisationProfile') {
                    filterUpdate.authorisationProfile = searchValue;
                } else if (searchType === 'numberOfAccounts') {
                    filterUpdate.numberOfAccounts = searchValue;
                }
                
                dispatch(setFilters(filterUpdate as PaymentTypeFilters));
            }
        },
        [dispatch]
    );

    const handleClearSearchBar = useCallback(() => {
        dispatch(setSearchType(''));
        dispatch(setSearchValue(''));
        
        dispatch(setFilters({
            paymentTypeName: '',
            authorisationProfile: '',
            numberOfAccounts: '',
        } as PaymentTypeFilters));
    }, [dispatch]);

    return (
        <>
            <ListPageWrapper
                testIdPrefix={testIdPrefix}
                breadcrumbLinks={breadcrumbLinks}
                title={t('paymentTypesHub')}
                action={
                    <Box sx={{ '&:hover img': { filter: 'brightness(0) invert(1)' } }}>
                        <Button
                            data-testid={buildTestId(testIdPrefix, 'create-button')}
                            buttonVariant="secondary"
                            startIcon={<Image src={AddIcon} alt="addicon" width={24} height={24} />}
                            style={{ height: 40 }}
                            onClick={handleCreateClick}
                        >
                            {t('createAPaymentTypeButton')}
                        </Button>
                    </Box>
                }
                searchBar={{
                    searchTypeOptions: advancedSearchOptions,
                    searchTypePlaceholder: t('searchByType'),
                    searchFieldType: currentSearchFieldType,
                    searchFieldOptions: currentSearchFieldOptions,
                    searchFieldPlaceholder: t('selectSearchType'),
                    searchFieldPlaceholderMap: advancedSearchPlaceholderMap,
                    onSearch: handleAdvancedSearch,
                    onClear: handleClearSearchBar,
                    searchType: advancedSearchType,
                    searchValue: advancedSearchValue,
                    onSearchTypeChange: (value: string) => dispatch(setSearchType(value)),
                    onSearchValueChange: (value: string) => dispatch(setSearchValue(value)),
                }}
            >

                <TableContainer
                    tableData={tableData}
                    filterButtons={actionButtons}
                    onCheckboxClick={handleCheckboxClick}
                    selectedRows={selectedRows}
                    rightPanelContent={rightPanelButtons}
                    testIdPrefix={buildTestId(testIdPrefix, 'table')}
                    showTabs={true}
                    hideTabsWhenEmpty={!hasAnyData}
                    tabs={statusTabs.map((label, index) => ({ label, value: index }))}
                    selectedTab={selectedTab}
                    onTabChange={(value: number) => dispatch(setSelectedTab(value))}
                    tabsContainerSx={{ backgroundColor: '#F8F8FA', borderRadius: 0 }}
                    tableStyle={{}}
                    perPage={perPage}
                    onQuickLinkClick={handleLinkClick}
                    onPerPageChange={handlePerPageChange}
                    emptyStateContent={
                        mappedRows.length === 0
                            ? hasFiltersOrSearch
                                ? (
                                    <EmptyState
                                        title={t('noResultsFound')}
                                        description={t('refineYourSearch')}
                                        icon={<Image src={SearchIcon} alt="no results" width={32} height={32} />}
                                    />
                                )
                                : selectedTab === 0
                                    ? (
                                        <EmptyState
                                            title={t('noPaymentTypesTitle')}
                                            description={t('noPaymentTypesDescription')}
                                            buttonLabel={t('createAPaymentTypeButton')}
                                            icon={<Image src={IconPeopleProfile} alt="no payment types" width={32} height={32} />}
                                            buttonIcon={<Image src={AddIcon} alt="add payment type" width={16} height={16} />}
                                            onButtonClick={handleCreateClick}
                                        />
                                    )
                                    : (
                                        <EmptyState
                                            title={t('noPaymentTypesInState')}
                                            description={t('noPaymentTypesInStateDesc')}
                                            icon={<Image src={SearchIcon} alt="no payment types in this state" width={32} height={32} />}
                                        />
                                    )
                            : null
                    }
                />
                <PaymentTypeFilterDialog
                    open={filterDialogOpen}
                    anchorEl={filterAnchorEl}
                    onClose={handleFilterClose}
                    onApply={handleFilterApply}
                    initialFilters={filters}
                    testIdPrefix={buildTestId(testIdPrefix, 'filter-dialog')}
                />
                <DeleteConfirmationDialog
                    open={deleteDialogOpen}
                    onClose={() => setDeleteDialogOpen(false)}
                    onPrimaryCTA={handleDeleteConfirm}
                    onSecondaryCTA={() => {
                        setDeleteDialogOpen(false);
                        setIsMixedStatusDelete(false);
                    }}
                    selectedCount={selectedRows.length}
                    exclamationIcon={AvatarAlert}
                    itemLabel="payment types"
                    markedCount={isMixedStatusDelete ? undefined : selectedRows.length}
                    message={
                        isMixedStatusDelete ? (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontWeight: 500, fontSize: '16px', marginBottom: '8px' }}>
                                    Some payment types can&apos;t be deleted
                                </div>
                                <div style={{ fontWeight: 400, fontSize: '16px', color: '#222E37' }}>
                                    The selected payment types include items that cannot be deleted because of their
                                    current status.
                                </div>
                            </div>
                        ) : undefined
                    }
                    primaryCTALabel={isMixedStatusDelete ? 'DELETE ELIGIBLE ITEMS' : undefined}
                    secondaryCTALabel="CANCEL"
                    testIdPrefix={buildTestId(testIdPrefix, 'delete-dialog')}
                />
            </ListPageWrapper>
            <CommonSnackbar
                open={snackbarOpen}
                message={snackbarMessage || t('sendReminderSent')}
                severity={snackbarSeverity}
                onClose={() => setSnackbarOpen(false)}
                autoHideDuration={4000}
            />
        </>

    );
};
export default PaymentType;
 