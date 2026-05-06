import React from 'react';
import { Box, Grid, SxProps, Tab, Tabs } from '@mui/material';
import { TableWrapper } from 'components/lib/Tables';

interface TabConfig {
  label: string;
  value: string;
}

interface TableData {
  columns: readonly (string | { key: string; type: string })[];
  headCells: any[];
  rows: any[];
  rowButton?: any;
  rowVariant?: any;
  additionalCells?: any;
  emptyStateIcon?: React.ReactElement;
  emptyStateTitle?: string;
  emptyStateSubtitle?: string;
  emptyStateContent?: React.ReactNode;
  pageSize?: number;
  rowCount?: number;
  emptyStateMessage?: string;
}

interface TableWithTabProps {
  statusTabs?: TabConfig[];
  currentTab?: string;
  tableData: TableData;
  onTabChange?: (event: React.SyntheticEvent, newValue: string) => void;
  filterButtons: any[];
  selectedRows: any[];
  onCheckboxClick: (rows: any) => void;
  onRowClick: (rowData: any) => void;
  onRowDropdownClick?: (rowId: string, expanded: boolean) => void;
  expandedRowId?: string | null;
  singleRowExpansion?: boolean;
  onQuickLinkClick?: (row: any, index: number, link: any) => void;
  rightPanelButtons: React.ReactNode;
  onPageChange: (newPage: number) => void;
  onPerPageChange: (newPerPage: number) => void;
  hidePagination?: boolean;
  hideTableHeader?: boolean;
  additionalCellsProps?: {
    additionalCellsStyle?: SxProps;
    expandIconAtStart?: boolean;
    removeDefaultStyle?: boolean;
  };
  initialOrder?: 'asc' | 'desc';
  initialOrderBy?: string | number;
  isLoading?: boolean;
}

const TableWithTab: React.FC<TableWithTabProps> = ({
  statusTabs,
  currentTab,
  tableData,
  onTabChange,
  filterButtons,
  selectedRows,
  onCheckboxClick,
  onRowClick,
  onRowDropdownClick,
  expandedRowId,
  singleRowExpansion = false,
  onQuickLinkClick,
  rightPanelButtons,
  onPageChange,
  onPerPageChange,
  additionalCellsProps = {
    additionalCellsStyle: {},
    expandIconAtStart: true,
    removeDefaultStyle: false,
  },
  hidePagination = false,
  hideTableHeader = false,
  initialOrder = 'asc',
  initialOrderBy = '',
  isLoading = false,
}) => {
  // Map emptyStateMessage to title and subtitle
  const emptyStateConfig = {
    noResultFound: {
      title: 'No results found',
      subtitle: 'Please refine your search and try again',
    },
    noUserAccountYet: {
      title: "No user account yet",
      subtitle: "You haven't added any user account yet.",
    },
  };

  const currentConfig = emptyStateConfig[tableData.emptyStateMessage as keyof typeof emptyStateConfig];
  const emptyStateTitle = currentConfig?.title;
  const emptyStateSubtitle = currentConfig?.subtitle;

  return (
    <Box sx={{ width: '100%', overflowX: 'auto', position: 'relative', backgroundColor: '#F8F8FA', borderRadius: 0 }}>
      {statusTabs && statusTabs.length > 0 && (
        <Tabs
          value={currentTab}
          onChange={onTabChange}
          aria-label="tabs"
          sx={(theme) => ({
            '& .MuiTabs-flexContainer': {
              borderBottom: `1px solid ${theme.palette.grey[300]}`,
            },
            '& .Mui-selected': {
              backgroundColor: theme.palette.common.white,
              color: theme.palette.primary.main,
              borderRight: `1px solid ${theme.palette.grey[300]}`,
            }
          })}
        >
          {statusTabs.map((tab, index) => {
            const tableTabKey = `consolidated-${index}`;
            return (
              <Tab
                key={tableTabKey}
                label={tab.label}
                value={tab.value}
                sx={{ textTransform: 'none' }}
              />
            );
          })}
        </Tabs>
      )}
      <Grid container alignItems="center" justifyContent="space-between">
        <Grid size={12}>
          <Box sx={{ minWidth: 320, width: '100%' }}>
            <TableWrapper
              dataSets={[
                {
                  columns: tableData.columns as any,
                  headCells: tableData.headCells,
                  rows: tableData.rows,
                  rowButton: tableData.rowButton,
                  rowsPerPage: 15,
                  rowVariant: tableData.rowVariant,
                  additionalCells: tableData.additionalCells,
                  emptyStateTitle: emptyStateTitle,
                  emptyStateSubtitle: emptyStateSubtitle,
                },
              ]}
              sx={{ borderRadius: 0, border: 0 }}
              filterButtons={filterButtons}
              onCheckboxClick={onCheckboxClick}
              selectedRows={selectedRows}
              onRowClick={onRowClick}
              onRowDropdownClick={onRowDropdownClick}
              expandedRowId={expandedRowId}
              singleRowExpansion={singleRowExpansion}
              onQuickLinkClick={onQuickLinkClick}
              rightPanelContent={rightPanelButtons}
              emptyStateContent={tableData.emptyStateContent}
              tableIndex={0}
              onPageChange={onPageChange}
              onPerPageChange={onPerPageChange}
              hidePagination={hidePagination}
              hideTableHeader={hideTableHeader}
              additionalCellsProps={additionalCellsProps}
              initialOrder={initialOrder}
              initialOrderBy={initialOrderBy}
              isLoading={isLoading}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TableWithTab;
