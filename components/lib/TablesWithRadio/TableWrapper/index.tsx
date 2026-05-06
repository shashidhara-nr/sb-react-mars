// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Box } from '@mui/material';
import DataTableWithRadio, { DataTableColumn } from '../DataTable';
import { HeadCell } from '../TableHead';

export interface TableDataSet {
  columns: DataTableColumn[];
  headCells: HeadCell[];
  rows: any[];
  rowButton?: boolean;
  rowsPerPage?: 15 | 30 | 50;
  rowVariant?: 'default' | 'dropdown' | 'checkbox' | 'radio';
  additionalCells?: any;

  // optional empty state passthrough
  emptyStateContent?: React.ReactNode;
  emptyStateTitle?: string;
  emptyStateSubtitle?: string;
  emptyStateActionLabel?: string;
  onEmptyStateAction?: () => void;
  emptyStateIcon?: React.ReactNode;
  isFilterApplied?: boolean;
}

export interface TableWrapperProps {
  dataSets: TableDataSet[];
  sx?: any;
  style?: React.CSSProperties;

  filterButtons?: any[];
  rightPanelContent?: React.ReactNode;

  selectedRows?: any[];
  onCheckboxClick?: (rows: any, index: number) => void;
  onRowClick?: (rowData: any) => void;
  onQuickLinkClick?: (row: any, index: number, link: any) => void;

  onPageChange?: (newPage: number) => void;
  onPerPageChange?: (newPerPage: number) => void;

  tableIndex?: number;
  showHeader?: boolean;
  showPagination?: boolean;
}

const TableWrapperWithRadio: React.FC<TableWrapperProps> = ({
  dataSets,
  sx,
  style,
  filterButtons = [],
  rightPanelContent,
  selectedRows = [],
  onCheckboxClick,
  onRowClick,
  onQuickLinkClick,
  onPageChange,
  onPerPageChange,
  tableIndex = 0,
  showHeader,
  showPagination,
}) => {
  const active = dataSets?.[tableIndex] ?? dataSets?.[0];
  if (!active) return null;

  return (
    <Box sx={{ width: '100%', ...sx }} style={style}>
      {(filterButtons?.length > 0 || rightPanelContent) && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 1,
            py: 1,
          }}
        >
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {filterButtons?.map((btn: any, idx: number) => (
              <Box key={`filter-btn-${idx}`}>{btn}</Box>
            ))}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {rightPanelContent}
          </Box>
        </Box>
      )}

      <DataTableWithRadio
        columns={active.columns}
        headCells={active.headCells}
        rows={active.rows}
        rowsPerPage={(active.rowsPerPage ?? 15) as 15 | 30 | 50}
        rowVariant={active.rowVariant ?? 'default'}
        rowButton={!!active.rowButton}
        additionalCells={active.additionalCells}
        selectedRows={selectedRows}
        onPageChange={onPageChange}
        onPerPageChange={onPerPageChange}
        onRowClick={(row: any) => onRowClick?.(row)}
        onCheckboxClick={onCheckboxClick}
        onQuickLinkClick={(row: any, index: number, link: any) =>
          onQuickLinkClick?.(row, index, link)
        }
        emptyStateContent={active.emptyStateContent}
        emptyStateTitle={active.emptyStateTitle}
        emptyStateSubtitle={active.emptyStateSubtitle}
        emptyStateActionLabel={active.emptyStateActionLabel}
        onEmptyStateAction={active.onEmptyStateAction}
        emptyStateIcon={active.emptyStateIcon}
        isFilterApplied={active.isFilterApplied}
        showHeader={showHeader}
        showPagination={showPagination}
      />
    </Box>
  );
};

export default TableWrapperWithRadio;
