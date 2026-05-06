'use client'
import { Box } from "@mui/material";
import Button from "components/lib/Forms/Button";
import TableContainer from "@molecules/TableContainer/TableContainer";
import { useState, useMemo, useCallback, useEffect } from "react";
import {
    FunnelIcon,
    SearchIcon,
    DownloadIcon
} from 'lib/icons';
import ErrorCodeFilterDialog from 'components/molecules/ErrorCodeFilterDialog';
import { mockErrorCodes, type MockErrorCode } from "lib/mock/mockErrorCodes";
import { useTranslations } from "next-intl";
import Image from "next/image";
import DeleteConfirmationDialog from "components/common/DeleteConfirmationDialog";
import DownloadDialog from "components/common/DownloadDialog";
import EmptyState from "components/common/EmptyState";
import { ListPageWrapper } from "components/sections";
import { ListRightPanelActions, CommonSnackbar } from "components/common";
import { buildTestId } from 'src/utils/testIds';
import { getTableHeadCells, navlinks, TABLE_COLUMNS, getStatusTabLabels, getStatusByTabIndex } from "./errorCodesHelper";

type Filters = {
    errorCode?: string;
    errorDescription?: string;
    status?: MockErrorCode['status']['value'] | '';
};

type TableRow = MockErrorCode & { id: string };

const ErrorCodes = () => {
    const testIdPrefix = 'error-codes-hub';
    const t = useTranslations('errorCodes');
    const [selectedTab, setSelectedTab] = useState(0);
    const [filterDialogOpen, setFilterDialogOpen] = useState(false);
    const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
    const [filters, setFilters] = useState<Filters>({});
    const [selectedRows, setSelectedRows] = useState<TableRow[]>([]);
    const [searchText, setSearchText] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
    const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [perPage, setPerPage] = useState(15);

    const statusTabs = useMemo(() => getStatusTabLabels(t), [t]);
    
    useEffect(() => {
        setSelectedRows([]);
    }, [selectedTab]);

    const mappedRows: TableRow[] = useMemo(() => {
        const searchLower = searchText.trim().toLowerCase();
        const statusFilter = getStatusByTabIndex(selectedTab);
        
        return mockErrorCodes
            .filter((row) => {
                if (statusFilter && row.status.value !== statusFilter) return false;
                
                if (filters.errorCode && !row.errorCode.toLowerCase().includes(filters.errorCode.toLowerCase())) return false;
                if (filters.errorDescription && !row.errorDescription.toLowerCase().includes(filters.errorDescription.toLowerCase())) return false;
                if (filters.status && row.status.value !== filters.status) return false;
                
                if (searchLower && !(
                    row.errorCode.toLowerCase().includes(searchLower) ||
                    row.errorDescription.toLowerCase().includes(searchLower)
                )) return false;
                
                return true;
            })
            .map((row, index) => ({
                ...row,
                id: `${index + 1}`,
            }));
    }, [filters, searchText, selectedTab]);

    const handleFilterOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
        if (mappedRows.length === 0) return;
        setFilterDialogOpen(true);
        setFilterAnchorEl(event.currentTarget);
    }, [mappedRows.length]);

    const handleFilterApply = useCallback((filterValues: any) => {
        setFilters(filterValues);
        setFilterDialogOpen(false);
        setFilterAnchorEl(null);
    }, []);

    const handleFilterClose = useCallback(() => {
        setFilterDialogOpen(false);
        setFilterAnchorEl(null);
    }, []);

    const handleDownloadClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        setDownloadAnchorEl(event.currentTarget);
        setDownloadDialogOpen(true);
    }, []);

    const handleDownloadClose = useCallback(() => {
        setDownloadDialogOpen(false);
        setDownloadAnchorEl(null);
    }, []);

    const handleDownload = useCallback((format: string, sortOrder: string) => {
        // TODO: Implement download logic based on format and sortOrder
        // For now, show success message
        handleDownloadClose();
        setSnackbarMessage(`Download Successful`);
        setSnackbarOpen(true);
    }, [handleDownloadClose]);

    const handleRemoveFilters = useCallback(() => {
        setFilters({});
        setSearchText('');
    }, []);

    const handlePerPageChange = useCallback((newPerPage: number) => {
        setPerPage(newPerPage);
    }, []);

    const handleCheckboxClick = useCallback((rows: TableRow | TableRow[]) => {
        const selected = Array.isArray(rows) ? rows : rows ? [rows] : [];
        setSelectedRows(selected);
    }, []);

    const handleDeleteConfirm = useCallback(() => {
        setSnackbarOpen(true);
        setDeleteDialogOpen(false);
        setSelectedRows([]);
    }, []);

    const actionButtons = useMemo(() => {
        const buttons = [];
        
        buttons.push({
            children: <><Image src={DownloadIcon} alt="download" width={16} height={16} style={{ marginRight: 4 }} />{t('downloadButton')}</>,
            buttonVariant: 'tertiary',
            onClick: handleDownloadClick,
            disabled: mappedRows.length === 0,
            buttonProps: {
                'data-testid': buildTestId(testIdPrefix, 'download-button'),
            },
        },
    {
            children: <><Image src={FunnelIcon} alt="filter" width={16} height={16} style={{ marginRight: 4 }} />{t('filterButton')}</>,
            buttonVariant: 'tertiary',
            onClick: handleFilterOpen,
            disabled: mappedRows.length === 0,
            buttonProps: {
                'data-testid': buildTestId(testIdPrefix, 'filter-button'),
            },
        });

        
        return buttons;
    }, [handleFilterOpen, handleDownloadClick, mappedRows.length, t]);

    const rightPanelButtons = useMemo(() => {
        const hasFilters = Object.keys(filters).length > 0 || searchText.trim().length > 0;

        return (
            <ListRightPanelActions
                selectedCount={selectedRows.length}
                hasFilters={hasFilters}
                onRemoveFilters={handleRemoveFilters}
                onDeleteClick={selectedRows.length > 0 ? () => setDeleteDialogOpen(true) : undefined}
                testIdPrefix={buildTestId(testIdPrefix, 'right-panel-actions')}
            />
        );
    }, [filters, searchText, handleRemoveFilters, selectedRows.length, testIdPrefix]);

    const tableData = useMemo(() => {
        const TABLE_HEAD_CELLS = getTableHeadCells(t);
        
        return {
            columns: TABLE_COLUMNS,
            headCells: TABLE_HEAD_CELLS,
            rowButton: false,
            rows: mappedRows,
            pageSize: perPage,
            rowCount: mappedRows.length,
        };
    }, [mappedRows, t, perPage]);

    const hasFiltersOrSearch = useMemo(
        () => Object.keys(filters).length > 0 || searchText.trim().length > 0,
        [filters, searchText]
    );

    const hasAnyData = mockErrorCodes.length > 0;

    const emptyStateConfig = hasFiltersOrSearch 
        ? {
            title: t('noResultsFound'),
            description: t('refineYourSearch'),
            icon: SearchIcon,
        }
        : selectedTab !== 0
        ? {
            title: t('noErrorCodesInState'),
            description: t('noErrorCodesInStateDesc'),
            icon: SearchIcon,
        }
        : {
            title: t('noErrorCodesTitle'),
            description: t('noErrorCodesDescription'),
            icon: SearchIcon,
        };

    return (
        <ListPageWrapper
            title={t('errorCodesHub')}
            breadcrumbLinks={[
                { href: '/', label: t('dashboard') },
                { href: navlinks.errorCodes, label: t('setupAndAdmin') },
                { href: navlinks.errorCodes, label: t('errorCodesBreadcrumb') },
            ]}
            searchPlaceholder={t('searchPlaceholder')}
            searchValue={searchText}
            onSearchChange={setSearchText}
            testIdPrefix={testIdPrefix}
        >
            <TableContainer
                tableData={tableData}
                filterButtons={actionButtons}
                onCheckboxClick={undefined}
                rightPanelContent={rightPanelButtons}
                testIdPrefix={buildTestId(testIdPrefix, 'table')}
                showTabs={true}
                hideTabsWhenEmpty={!hasAnyData}
                tabs={statusTabs.map((label, index) => ({ label, value: index }))}
                selectedTab={selectedTab}
                onTabChange={setSelectedTab}
                tabsContainerSx={{ backgroundColor: '#F8F8FA', borderRadius: 0 }}
                perPage={perPage}
                onPerPageChange={handlePerPageChange}
                emptyStateContent={
                    mappedRows.length === 0 ? (
                        <EmptyState
                            title={emptyStateConfig.title}
                            description={emptyStateConfig.description}
                            icon={<Image src={emptyStateConfig.icon} alt="empty state" width={32} height={32} />}
                        />
                    ) : null
                }
            />

            <ErrorCodeFilterDialog
                open={filterDialogOpen}
                anchorEl={filterAnchorEl}
                onApply={handleFilterApply}
                onClose={handleFilterClose}
                currentFilters={filters}
            />

            <DeleteConfirmationDialog
                open={deleteDialogOpen}
                title={t('deleteErrorCodeLabel')}
                itemLabel={t('deleteItemLabel')}
                selectedCount={selectedRows.length}
                markedCount={selectedRows.length}
                exclamationIcon={SearchIcon}
                onClose={() => setDeleteDialogOpen(false)}
                onPrimaryCTA={handleDeleteConfirm}
                onSecondaryCTA={() => setDeleteDialogOpen(false)}
                testIdPrefix={testIdPrefix}
            />

            <DownloadDialog
                open={downloadDialogOpen}
                anchorEl={downloadAnchorEl}
                onClose={handleDownloadClose}
                onDownload={handleDownload}
                title={t('downloadErrorCodeLabel')}
                formatLabel={t('selectExportFormat')}
                sortByLabel={t('sortBy')}
                cancelLabel={t('cancelLabel')}
                downloadLabel={t('downloadLabel')}
                showSortBy={true}
            />

            <CommonSnackbar
                open={snackbarOpen}
                message={snackbarMessage}
                severity="success"
                onClose={() => setSnackbarOpen(false)}
                autoHideDuration={6000}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            />
        </ListPageWrapper>
    );
};

export default ErrorCodes;
