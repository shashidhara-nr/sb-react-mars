import React from 'react';
import { Box, Grid, Tab, Tabs } from '@mui/material';
import { TableWrapper } from 'components/lib/TablesWithRadio';
import TableWrapperWithRadio from 'components/lib/TablesWithRadio/TableWrapper';

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
  pageSize?: number;
  rowCount?: number;
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
  onQuickLinkClick?: (row: any, index: number, link: any) => void;
  rightPanelButtons: React.ReactNode;
  onPageChange: (newPage: number) => void;
  onPerPageChange: (newPerPage: number) => void;
  showHeader?: boolean;
  showPagination?: boolean;
}

const TableWithTabWithRadio: React.FC<TableWithTabProps> = ({
  statusTabs,
  currentTab,
  tableData,
  onTabChange,
  filterButtons,
  selectedRows,
  onCheckboxClick,
  onRowClick,
  onQuickLinkClick,
  rightPanelButtons,
  onPageChange,
  onPerPageChange,
  showHeader,
  showPagination,
}) => {
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
            <TableWrapperWithRadio
              dataSets={[
                {
                  columns: tableData.columns as any,
                  headCells: tableData.headCells,
                  rows: tableData.rows,
                  rowButton: tableData.rowButton,
                  rowsPerPage: 15,
                  rowVariant: tableData.rowVariant,
                  additionalCells: tableData.additionalCells,
                },
              ]}
              sx={{ borderRadius: 0, border: 0 }}
              filterButtons={filterButtons}
              onCheckboxClick={onCheckboxClick}
              selectedRows={selectedRows}
              onRowClick={onRowClick}
              onQuickLinkClick={onQuickLinkClick}
              rightPanelContent={rightPanelButtons}
              tableIndex={0}
              onPageChange={onPageChange}
              onPerPageChange={onPerPageChange}
              showHeader={showHeader}
              showPagination={showPagination}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TableWithTabWithRadio;
