// @ts-nocheck
import { useState, useMemo } from 'react';
import {
  Box,
  useTheme,
  Typography,
  ThemeProvider,
  useMediaQuery,
  SxProps,
  CircularProgress,
} from '@mui/material';
import DataTable, { DataTableProps } from '../DataTable';
import Button, { ButtonProps } from '../../Forms/Button';

export interface TableWrapperProps {
  dataSets: DataTableProps[];
  filterButtons?: ButtonProps[];
  tableIndex?: number | string;
  onRowClick?: (row: unknown, index: number) => void;
  onCheckboxClick?: (rows: unknown[] | unknown, index: number) => void;
  onSelectAll?: (selectedRows: unknown[], checked: boolean) => void;
  onQuickLinkClick?: (row: unknown, index: number, link: unknown) => void;
  onMoreButtonClick?: () => void;
  onSort?: (property: string) => void;
  onRowDropdownClick?: (rowId: string, expanded: boolean) => void;
  expandedRowId?: string | null;
  singleRowExpansion?: boolean;
  className?: string;
  isFilterApplied?: boolean;
  setIsFilterApplied?: (applied: boolean) => void;
  selectedRows?: unknown[];
  rightPanelContent?: React.ReactNode;
  sx?: SxProps;
  style?: React.CSSProperties;
  // Empty state props to show when no records are available
  emptyStateContent?: React.ReactNode;
  emptyStateTitle?: string;
  emptyStateSubtitle?: string;
  emptyStateActionLabel?: string;
  onEmptyStateAction?: () => void;
  emptyStateIcon?: React.ReactNode;
  onPageChange?: (newPage: number) => void;
  onPerPageChange?: (newPerPage: number) => void;
  isLoading?: boolean;
  hidePagination?: boolean;
  hideTableHeader?: boolean;
  additionalCellsProps?: {
    additionalCellsStyle?: SxProps;
    expandIconAtStart?: boolean;
    removeDefaultStyle?: boolean;
  };
  /** Initial sort order (default: 'asc') */
  initialOrder?: 'asc' | 'desc';
  /** Initial column to sort by (default: '') */
  initialOrderBy?: string | number;
}

export default function TableWrapper({
  dataSets,
  filterButtons,
  tableIndex = 0,
  onRowClick,
  onCheckboxClick,
  onSelectAll,
  onQuickLinkClick,
  onMoreButtonClick,
  onSort,
  onRowDropdownClick,
  expandedRowId,
  singleRowExpansion = false,
  isFilterApplied = false,
  selectedRows,
  rightPanelContent,
  sx,
  style,
  emptyStateContent,
  emptyStateTitle,
  emptyStateSubtitle,
  emptyStateActionLabel,
  onEmptyStateAction,
  emptyStateIcon,
  onPageChange,
  onPerPageChange,
  isLoading = false,
  hidePagination = false,
  hideTableHeader = false,
  additionalCellsProps = {
    additionalCellsStyle: {},
    expandIconAtStart: true,
    removeDefaultStyle: false,
  },
  initialOrder = 'asc',
  initialOrderBy = '',
}: TableWrapperProps) {
  const theme = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);

  const isSmallScreen = useMediaQuery(theme.breakpoints.down('lg'));

  const tableIdx =
    typeof tableIndex === 'string' ? parseInt(tableIndex, 15) : tableIndex;
  const selectedData = useMemo(() => {
    const data = { ...dataSets[tableIdx], rows: [...dataSets[tableIdx].rows] };
    if (Array.isArray(data.columns)) {
      data.columns = [...data.columns];
    }
    return data;
  }, [dataSets, tableIdx]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    onPageChange?.(newPage);
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    onPerPageChange?.(newPerPage);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          borderRadius: 1.5,
          border: `1px solid ${theme.palette?.grey[300]}`,
          overflow: 'hidden',
          ...sx,
        }}
        style={style}
      >
        <Box
          sx={{
            backgroundColor: theme.palette.common.white,
          }}
        >
          {!hideTableHeader && <Box
            sx={{
              px: !isSmallScreen ? 1.5 : 2,
              py: 2,
              borderBottom: `1px solid ${theme.palette?.grey[300]}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: theme.palette?.grey[200],
              zIndex: 1,
              height: '64px',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography
                sx={{
                  color: theme.palette.grey[400],
                  font: theme.typography.sMedium,
                }}
              >
                {dataSets[tableIdx].rows.length === 0
                  ? '0 - 0 of 0'
                  : `${(currentPage - 1) * perPage + 1}-${Math.min(currentPage * perPage, dataSets[tableIdx].rows.length)} of ${dataSets[tableIdx].rows.length.toString()}`}
              </Typography>
              {rightPanelContent && (
                <Box>
                  {typeof rightPanelContent === 'string' ? (
                    <Typography>{rightPanelContent}</Typography>
                  ) : (
                    rightPanelContent
                  )}
                </Box>
              )}
            </Box>
            {filterButtons && !isSmallScreen && (
              <Box
                sx={{
                  display: {
                    md: 'flex',
                    sm: 'none',
                  },
                }}
              >
                {filterButtons?.map((button, index) => (
                  <Button
                    key={index}
                    buttonVariant={button.buttonVariant}
                    small={button.small}
                    {...button}
                    endIcon={button.endIcon}
                    startIcon={button.startIcon}
                    imageSrc={button.imageSrc}
                  >
                    {button.children}
                  </Button>
                ))}
              </Box>
            )}
          </Box>}
          {isLoading ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px',
                gap: 2,
              }}
            >
              <CircularProgress />
              <Typography
                sx={{
                  color: theme.palette.grey[600],
                  font: theme.typography.sMedium,
                }}
              >
                Loading...
              </Typography>
            </Box>
          ) : dataSets.length > 0 && dataSets[tableIdx] ? (
            <DataTable
              key={tableIdx}
              columns={selectedData.columns}
              rows={selectedData.rows}
              rowButton={selectedData.rowButton}
              rowsPerPage={selectedData.rowsPerPage}
              rowVariant={selectedData.rowVariant}
              headCells={selectedData.headCells}
              additionalCells={selectedData.additionalCells}
              selectedRows={selectedRows} // ✅ ADD THIS LINE
              onSelectAll={onSelectAll}
              style={style}
              sx={sx}
              // Empty state props (dataset takes precedence over wrapper-level defaults)
              emptyStateContent={
                selectedData.emptyStateContent ?? emptyStateContent
              }
              emptyStateTitle={selectedData.emptyStateTitle ?? emptyStateTitle}
              emptyStateSubtitle={
                selectedData.emptyStateSubtitle ?? emptyStateSubtitle
              }
              emptyStateActionLabel={
                selectedData.emptyStateActionLabel ?? emptyStateActionLabel
              }
              onEmptyStateAction={
                selectedData.onEmptyStateAction ?? onEmptyStateAction
              }
              emptyStateIcon={selectedData.emptyStateIcon ?? emptyStateIcon}
              onPageChange={handlePageChange}
              onPerPageChange={handlePerPageChange}
              onSort={onSort}
              onRowClick={onRowClick}
              onCheckboxClick={onCheckboxClick}
              onQuickLinkClick={onQuickLinkClick}
              onMoreButtonClick={onMoreButtonClick}
              onRowDropdownClick={onRowDropdownClick}
              expandedRowId={expandedRowId}
              singleRowExpansion={singleRowExpansion}
              isFilterApplied={isFilterApplied}
              additionalCellsProps={additionalCellsProps}
              hidePagination={hidePagination}
              initialOrder={initialOrder}
              initialOrderBy={initialOrderBy}
            />
          ) : null}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
