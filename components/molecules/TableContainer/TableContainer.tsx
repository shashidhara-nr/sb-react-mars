'use client';

import React, { useState } from 'react';
import { Box, Grid, Tabs, Tab } from '@mui/material';
import type { ReactNode } from 'react';
import { buildTestId } from 'src/utils/testIds';
import { TableWrapper, Button } from 'dist/standard-bank-react';
import Image from 'next/image';
import { AvatarAlert, ReloadRefreshIcon } from 'lib/icons';

export interface TabConfig {
    label: string;
    value: number;
}

interface TableContainerProps {
    tableData: any;
    filterButtons?: any[];
    onCheckboxClick?: (rows: any[] | any) => void;
    selectedRows?: any[];
    leftPanelContent?: ReactNode;
    rightPanelContent?: ReactNode;
    emptyStateContent?: ReactNode;
    tabs?: TabConfig[];
    selectedTab?: number;
    onTabChange?: (tabIndex: number) => void;
    showTabs?: boolean;
    hideTabsWhenEmpty?: boolean;
    tabsContainerSx?: any;
    tabsSx?: any;
    tableSx?: any;
    tableStyle?: React.CSSProperties;
    onQuickLinkClick?: (row: any, index: number, link: any) => void;
    onPageChange?: (newPage: number) => void;
    onPerPageChange?: (newPerPage: number) => void;
    serverSidePagination?: boolean;
    totalRecords?: number;
    currentPage?: number;
    perPage?: number;
    serverSideSorting?: boolean;
    onSort?: (columnKey: string, order: 'asc' | 'desc') => void;
    externalOrder?: 'asc' | 'desc';
    externalOrderBy?: string | number;
    testIdPrefix?: string;
    hasLoadError?: boolean;
    onReload?: () => void;
}

const TableContainer = ({
    tableData,
    filterButtons,
    onCheckboxClick,
    selectedRows,
    leftPanelContent,
    rightPanelContent,
    emptyStateContent,
    tabs = [],
    selectedTab = 0,
    onTabChange,
    showTabs = false,
    hideTabsWhenEmpty = true,
    tabsContainerSx = {},
    tabsSx = {},
    tableSx = {},
    tableStyle = {},
    onQuickLinkClick,
    onPageChange,
    onPerPageChange,
    serverSidePagination = false,
    totalRecords,
    currentPage = 1,
    perPage = 10,
    serverSideSorting = false,
    onSort,
    externalOrder,
    externalOrderBy,
    testIdPrefix = 'table-container',
    hasLoadError = false,
    onReload,
}: TableContainerProps) => {
    const [internalSelectedTab, setInternalSelectedTab] = useState(0);
    const currentTab = onTabChange ? selectedTab : internalSelectedTab;
    const isEmpty = !tableData?.rows || tableData.rows.length === 0;

    const errorStateContent = hasLoadError ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                <Image src={AvatarAlert} alt="warning" width={48} height={48} />
            </Box>
            <Box sx={{ mb: 2, fontSize: '16px', fontWeight: 600, color: '#1A1A1A' }}>
                Failed to Load
            </Box>
            <Box sx={{ mb: 4, fontSize: '14px', color: '#666' }}>
                Please reload the page or try again later
            </Box>
            {onReload && (
                <Button
                    buttonVariant="secondary"
                    onClick={onReload}
                    startIcon={
                        <Box 
                            component="span" 
                            sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                '& img': {
                                    transition: 'filter 0.2s ease',
                                },
                                '.MuiButton-root:hover &': {
                                    '& img': {
                                        filter: 'brightness(0) invert(1)',
                                    },
                                },
                            }}
                        >
                            <Image src={ReloadRefreshIcon} alt="reload" width={20} height={20} />
                        </Box>
                    }
                    data-testid={buildTestId(testIdPrefix, 'reload-button')}
                >
                    Reload
                </Button>
            )}
        </Box>
    ) : null;



    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        if (onTabChange) {
            onTabChange(newValue);
        } else {
            setInternalSelectedTab(newValue);
        }
    };

    const handlePageChangeWrapper = (newPage: number) => {
        onPageChange?.(newPage);
    };

    const handlePerPageChangeWrapper = (newPerPage: number) => {
        onPerPageChange?.(newPerPage);
    };
    return (
        <Box
            sx={{ width: '100%', overflowX: 'auto', backgroundColor: 'white', borderRadius: "12px", position: 'relative', ...tabsContainerSx }}
            data-testid={buildTestId(testIdPrefix, 'container')}
        >
            {showTabs && tabs.length > 0 && (!hideTabsWhenEmpty || !isEmpty) && (
                <Tabs
                    value={currentTab}
                    onChange={handleTabChange}
                    aria-label="table tabs"
                    sx={(theme) => ({
                        '& .MuiTabs-flexContainer': {
                            borderBottom: `1px solid ${theme.palette.grey[300]}`,
                        },
                        '& .Mui-selected': {
                            backgroundColor: theme.palette.common.white,
                            color: theme.palette.primary.main,
                            borderRight: `1px solid ${theme.palette.grey[300]}`,
                        },
                        ...tabsSx,
                    })}
                    data-testid={buildTestId(testIdPrefix, 'tabs')}
                >
                    {tabs.map((tab, index) => (
                        <Tab
                            key={index}
                            label={tab.label}
                            value={tab.value}
                            sx={{ textTransform: 'none' }}
                            data-testid={buildTestId(testIdPrefix, 'tab', tab.value)}
                        />
                    ))}
                </Tabs>
            )}
            <Grid container alignItems="center" justifyContent="space-between">
                <Grid size={12}>
                    <Box
                        sx={{ minWidth: 320, width: '100%', ...tableStyle }}
                        data-testid={buildTestId(testIdPrefix, 'table-wrapper')}
                    >
                        {leftPanelContent && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    left: 60,
                                    top: 50,
                                    zIndex: 10,
                                    backgroundColor: '',
                                    paddingLeft: '20px',
                                }}
                                data-testid={buildTestId(testIdPrefix, 'left-panel')}
                            >
                                {leftPanelContent}
                            </Box>
                        )}
                        <TableWrapper
                            dataSets={[
                                {
                                    columns: isEmpty ? [] : tableData.columns,
                                    headCells: isEmpty ? [] : tableData.headCells,
                                    rows: isEmpty ? [] : tableData?.rows,
                                    rowButton: false,
                                    rowVariant: onCheckboxClick ? 'checkbox' : undefined,
                                    rowsPerPage: perPage as 5 | 15 | 30 | 50 | 100,
                                },
                            ]}
                            onQuickLinkClick={onQuickLinkClick}
                            sx={{ borderRadius: 0, border: 0, ...tableSx }}
                            filterButtons={filterButtons}
                            onCheckboxClick={onCheckboxClick}
                            selectedRows={selectedRows}
                            rightPanelContent={rightPanelContent}
                            tableIndex={0}
                            onPageChange={handlePageChangeWrapper}
                            onPerPageChange={handlePerPageChangeWrapper}
                            emptyStateContent={hasLoadError ? errorStateContent : emptyStateContent}
                            serverSidePagination={serverSidePagination}
                            totalRecords={totalRecords}
                            page={currentPage}
                            rowsPerPage={perPage}
                            serverSideSorting={serverSideSorting}
                            onSort={onSort}
                            externalOrder={externalOrder}
                            externalOrderBy={externalOrderBy}
                            emptyStateTitle={isEmpty ? 'No records to display' : ''}
                            emptyStateSubtitle={isEmpty ? 'No billers created yet' : ''}
                        />

                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default TableContainer;
