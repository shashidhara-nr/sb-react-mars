// @ts-nocheck
import React, { useEffect, useState, ChangeEvent, MouseEvent } from 'react';
import {
  Table,
  TableBody,
  TableContainer,
  Box,
  ThemeProvider,
  useTheme,
  TableRow,
  TableCell,
  Typography,
} from '@mui/material';
import { HeadCell } from '../TableHead';
import CustomPagination from '../TablePagination';
import DataTableRow from '../TableRow';
import TableHeader from '../TableHead';
import SearchIcon from '@mui/icons-material/Search';
import Button from '../../Forms/Button';

export type DataTableColumn =
  | string
  | {
    key: string;
    type?:
    | 'account'
    | 'normal'
    | 'link'
    | 'status'
    | 'chip'
    | 'button'
    | 'more'
    | undefined;
  };

export interface DataTableProps {
  tableTitle?: string;
  columns: DataTableColumn[];
  headCells: HeadCell[];
  rows: unknown[];
  rowsPerPage: 15 | 30 | 50 | 100;
  rowVariant?: 'default' | 'dropdown' | 'checkbox';
  rowButton?: boolean;
  statusColumn?: boolean;
  accountIcon?: React.ReactElement;
  selectedRows?: any[];
  onPageChange?: (newPage: number) => void;
  onPerPageChange?: (newPerPage: number) => void;
  onSort?: (property: string) => void;
  onRowClick?: (row: any, index: number) => void;
  onCheckboxClick?: (row: any, index: number) => void;
  onFilterClick?: (filter: any, index: number) => void;
  onQuickLinkClick?: (row: any, index: number, link: any) => void;
  onMoreButtonClick?: () => void;
  onRowDropdownClick?: (rowId: string, expanded: boolean) => void;
  expandedRowId?: string | null;
  singleRowExpansion?: boolean;
  additionalCells?: any;
  /** Called when header checkbox toggles select-all. Provides array of selected rows and checked state */
  onSelectAll?: (selectedRows: any[], checked: boolean) => void;
  isFilterApplied?: boolean;
  sx?: any;
  style?: React.CSSProperties;
  /**
   * Custom content to render when there are no records.
   * If provided, this takes precedence over the title/subtitle/action props.
   */
  emptyStateContent?: React.ReactNode;
  /** Title shown in the empty state when there are no records */
  emptyStateTitle?: string;
  /** Subtitle shown in the empty state when there are no records */
  emptyStateSubtitle?: string;
  /** Label for the empty state action button */
  emptyStateActionLabel?: string;
  /** Click handler for the empty state action button */
  onEmptyStateAction?: () => void;
  /** Optional icon to display above the empty state title */
  emptyStateIcon?: React.ReactNode;
  hidePagination?: boolean;
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

export default function DataTable({
  columns,
  rows,
  rowsPerPage,
  rowVariant = 'default',
  rowButton = false,
  headCells,
  accountIcon,
  selectedRows: externalSelectedRows,
  onPageChange,
  onPerPageChange,
  onSort,
  onRowClick,
  onCheckboxClick,
  onSelectAll,
  onQuickLinkClick,
  onMoreButtonClick,
  onRowDropdownClick,
  expandedRowId,
  singleRowExpansion = false,
  isFilterApplied = false,
  sx,
  style,
  emptyStateContent,
  emptyStateTitle,
  emptyStateSubtitle,
  emptyStateActionLabel,
  onEmptyStateAction,
  emptyStateIcon,
  additionalCells,
  hidePagination = false,
  additionalCellsProps = {
    additionalCellsStyle: {},
    expandIconAtStart: true,
    removeDefaultStyle: false,
  },
  initialOrder = 'asc',
  initialOrderBy = '',
}: DataTableProps) {
  console.log("rowButton", rowButton);
  const theme = useTheme();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState<15 | 30 | 50 | 100>(rowsPerPage);
  const [internalSelectedRows, setInternalSelectedRows] = useState<number[]>(
    [],
  );
  const [order, setOrder] = useState<'asc' | 'desc'>(initialOrder);
  const [orderBy, setOrderBy] = useState<string | number>(initialOrderBy);

  // ✅ Visible columns (excluding "id" like your header/row filtering)
  const visibleColumns = columns.filter((col: any) => {
    if (typeof col === 'string') return col !== 'id';
    return col.key !== 'id';
  });

  // ✅ Correct colSpan including selection / dropdown / action columns
  const emptyColSpan =
    visibleColumns.length +
    (rowVariant === 'checkbox' ? 1 : 0) +
    (rowVariant === 'dropdown' ? 1 : 0) +
    (rowButton ? 1 : 0);

  const selectedRowIds = externalSelectedRows
    ? externalSelectedRows.map((r: any) => r.id)
    : internalSelectedRows;

  // ✅ Don't reset page on every rows change; only when count changes significantly
  const prevRowsLengthRef = React.useRef(rows.length);
  useEffect(() => {
    if (Math.abs(prevRowsLengthRef.current - rows.length) > perPage) {
      setPage(1);
    }
    prevRowsLengthRef.current = rows.length;
  }, [rows.length, perPage]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
    onPageChange?.(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    if ([15, 30, 50, 100].includes(newRowsPerPage)) {
      setPerPage(newRowsPerPage as 15 | 30 | 50 | 100);
      setPage(1);
      onPerPageChange?.(newRowsPerPage);
    }
  };

  const handleRequestSort = (
    _: MouseEvent<unknown>,
    property: number | string,
  ) => {
    // If onSort callback is provided, call it for server-side sorting
    if (onSort) {
      onSort(property as string);
    } else {
      // Otherwise, use client-side sorting
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    }
  };

  const [sortedRows, setSortedRows] = useState(rows);

  useEffect(() => {
    const sortedData = [...rows].sort((a, b) => {
      // @ts-expect-error - err
      if (orderBy && orderBy in a) {
        const colDef = columns.find((col) => {
          if (typeof col === 'string') return col === orderBy;
          return col.key === orderBy;
        });

        const isAccount =
          typeof colDef === 'object' && colDef.type === 'account';

        // @ts-expect-error - err
        const valueA = a[orderBy];
        // @ts-expect-error - err
        const valueB = b[orderBy];

        if (
          valueA === undefined ||
          valueA === null ||
          valueB === undefined ||
          valueB === null
        ) {
          return 0;
        }

        if (isAccount) {
          const nameA =
            typeof valueA === 'object' && valueA !== null
              ? valueA.name
              : String(valueA);
          const nameB =
            typeof valueB === 'object' && valueB !== null
              ? valueB.name
              : String(valueB);

          if (typeof nameA === 'string' && typeof nameB === 'string') {
            return order === 'asc'
              ? nameA.localeCompare(nameB)
              : nameB.localeCompare(nameA);
          }
          return 0;
        }

        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return order === 'asc'
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        }

        if (typeof valueA === 'number' && typeof valueB === 'number') {
          return order === 'asc' ? valueA - valueB : valueB - valueA;
        }

        if (typeof valueA === 'boolean' && typeof valueB === 'boolean') {
          return order === 'asc'
            ? (valueA ? 1 : 0) - (valueB ? 1 : 0)
            : (valueB ? 1 : 0) - (valueA ? 1 : 0);
        }

        return order === 'asc'
          ? String(valueA).localeCompare(String(valueB))
          : String(valueB).localeCompare(String(valueA));
      }
      return 0;
    });

    setSortedRows(sortedData);
  }, [order, orderBy, rows, columns]);

  const displayedRows = sortedRows.slice((page - 1) * perPage, page * perPage);

  // Calculate how many of the current page rows are actually selected
  const currentPageSelectedCount = displayedRows.filter((row: any) => 
    selectedRowIds.includes(row.id)
  ).length;

  return (
    <ThemeProvider theme={theme}>
      <Box sx={sx} style={style}>
        <TableContainer sx={{ padding: '0px 1rem' }}>
          <Table>
            {rows.length != 0 && (
              <TableHeader
                headCells={headCells.filter((cell) => cell.id !== 'id')}
                order={order}
                orderBy={orderBy}
                onRequestSort={handleRequestSort}
                numSelected={currentPageSelectedCount}
                rowCount={displayedRows.length}
                onSelectAllClick={(event: ChangeEvent<HTMLInputElement>) => {
                  if (event.target.checked) {
                    // When selecting all, mark rows with a flag so parent knows it's a select-all operation
                    const displayedRowsArray = displayedRows.map((row: any) => ({
                      ...row,
                      __selectAllFlag: true
                    }));
                    
                    // Only update internal state if not using external selection
                    if (!externalSelectedRows) {
                      setInternalSelectedRows(
                        displayedRows.map((row: any) => row.id),
                      );
                    }
                    
                    onSelectAll?.(displayedRowsArray, true);
                    onCheckboxClick?.(displayedRowsArray, -1);
                  } else {
                    // When deselecting all, we need to pass the currently displayed rows
                    // so the parent knows which specific items to remove from selection
                    // We pass them as objects with a special flag to indicate deselection
                    const displayedRowsArray = displayedRows.map((row: any) => ({
                      ...row,
                      __deselectFlag: true
                    }));
                    
                    // Only update internal state if not using external selection
                    if (!externalSelectedRows) {
                      setInternalSelectedRows([]);
                    }
                    
                    onSelectAll?.([], false);
                    onCheckboxClick?.(displayedRowsArray, -1);
                  }
                }}
                checkbox={rowVariant === 'checkbox'}
                dropdown={rowVariant === 'dropdown'}
                rowButton={rowButton}
              />
            )}

            <TableBody sx={{ padding: '0px 1rem' }}>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={emptyColSpan}
                    sx={{
                      p: 0, // ✅ important for perfect centering
                      borderBottom: 0,
                    }}
                  >
                    {/* ✅ Center wrapper that works for BOTH default & custom emptyStateContent */}
                    <Box
                      sx={{
                        width: '100%',
                        minHeight: 320, // adjust based on your table height
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center',
                        px: 2,
                        py: 6,
                      }}
                    >
                      {/* Inner maxWidth prevents custom content from stretching weirdly */}
                      <Box sx={{ width: '100%', maxWidth: 520 }}>
                        {emptyStateContent ? (
                          emptyStateContent
                        ) : (
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: 1.5,
                            }}
                          >
                            {emptyStateIcon ?? (
                              <SearchIcon
                                sx={{
                                  fontSize: 40,
                                  color: theme.palette.grey[500],
                                }}
                              />
                            )}

                            <Typography
                              sx={{
                                color: theme.palette.grey[700],
                                fontSize: 18,
                                fontWeight: 600,
                              }}
                            >
                              {emptyStateTitle ?? 'No records yet'}
                            </Typography>

                            {(emptyStateSubtitle || isFilterApplied) && (
                              <Typography
                                sx={{
                                  color: theme.palette.grey[600],
                                  textAlign: 'center',
                                }}
                              >
                                {emptyStateSubtitle ??
                                  'Please refine your search and try again'}
                              </Typography>
                            )}

                            {emptyStateActionLabel && onEmptyStateAction && (
                              <Box sx={{ mt: 1.5 }}>
                                <Button onClick={onEmptyStateAction}>
                                  {emptyStateActionLabel}
                                </Button>
                              </Box>
                            )}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                displayedRows.map((row: any, index: number) => (
                  <DataTableRow
                    key={row.id}
                    row={row}
                    columns={visibleColumns}
                    showMoreButton={rowButton}
                    variant={rowVariant}
                    headCells={headCells}
                    additionalCells={additionalCells}
                    expandedRowId={expandedRowId}
                    singleRowExpansion={singleRowExpansion}
                    isSelected={selectedRowIds.includes(row.id)}
                    onSelect={() => {
                      const newSelectedIds = selectedRowIds.includes(row.id)
                        ? selectedRowIds.filter((i) => i !== row.id)
                        : [...selectedRowIds, row.id];

                      // Only update internal state if not using external selection
                      if (!externalSelectedRows) {
                        setInternalSelectedRows(newSelectedIds);
                      }

                      // IMPORTANT: Filter from sortedRows (not original rows) to ensure
                      // we send the actual row objects as they appear in the sorted display
                      const selectedRowObjects = sortedRows.filter(
                        (r: any) => newSelectedIds.includes(r.id),
                      );
                      onCheckboxClick?.(selectedRowObjects, index);
                    }}
                    accountIcon={accountIcon}
                    onRowClick={() => onRowClick?.(row, index)}
                    onQuickLinkClick={(link) =>
                      onQuickLinkClick?.(row, index, link)
                    }
                    onMoreButtonClick={() => onMoreButtonClick?.()}
                    onRowDropdownClick={(rowId: string, expanded: boolean) =>
                      onRowDropdownClick?.(rowId, expanded)
                    }
                    additionalCellsProps={additionalCellsProps}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {rows.length !== 0 && !hidePagination && (
          <CustomPagination
            rows={rows}
            page={page}
            rowsPerPage={perPage}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        )}
      </Box>
    </ThemeProvider>
  );
}
