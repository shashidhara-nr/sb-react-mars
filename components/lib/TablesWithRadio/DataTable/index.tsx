// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
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
    | 'radioText' // ✅ NEW
    | undefined;
  };

export interface DataTableProps {
  columns: DataTableColumn[];
  headCells: HeadCell[];
  rows: unknown[];
  rowsPerPage: 15 | 30 | 50;

  rowVariant?: 'default' | 'dropdown' | 'checkbox' | 'radio';
  rowButton?: boolean;

  accountIcon?: React.ReactElement;

  /**
   * ✅ Can be:
   * - ['1','2'] ids
   * - [{id:'1'},{id:'2'}] objects
   */
  selectedRows?: any[];

  onPageChange?: (newPage: number) => void;
  onPerPageChange?: (newPerPage: number) => void;
  onRowClick?: (row: any, index: number) => void;

  // kept for compatibility
  onCheckboxClick?: (row: any, index: number) => void;
  onSelectAll?: (selectedRows: any[], checked: boolean) => void;

  onQuickLinkClick?: (row: any, index: number, link: any) => void;
  onMoreButtonClick?: () => void;
  onRowDropdownClick?: (expanded: boolean) => void;

  additionalCells?: any;
  sx?: any;
  style?: React.CSSProperties;

  showHeader?: boolean;
  showPagination?: boolean;


  emptyStateContent?: React.ReactNode;
  emptyStateTitle?: string;
  emptyStateSubtitle?: string;
  emptyStateActionLabel?: string;
  onEmptyStateAction?: () => void;
  emptyStateIcon?: React.ReactNode;
  isFilterApplied?: boolean;
}

export default function DataTableWithRadio({
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
  onRowClick,
  onCheckboxClick,
  onSelectAll,
  onQuickLinkClick,
  onMoreButtonClick,
  onRowDropdownClick,
  additionalCells,
  sx,
  style,
  emptyStateContent,
  emptyStateTitle,
  emptyStateSubtitle,
  emptyStateActionLabel,
  onEmptyStateAction,
  emptyStateIcon,
  isFilterApplied = false,

  showHeader = true,
  showPagination = true,

}: DataTableProps) {
  const theme = useTheme();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState<15 | 30 | 50>(rowsPerPage);
  const [internalSelectedRows, setInternalSelectedRows] = useState<any[]>([]);

  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<string | number>('');

  // ✅ Visible columns (excluding "id")
  const visibleColumns = columns.filter((col: any) => {
    if (typeof col === 'string') return col !== 'id';
    return col.key !== 'id';
  });

  const hasRadioTextColumn = visibleColumns.some(
    (col: any) => typeof col === 'object' && col.type === 'radioText',
  );

  const emptyColSpan =
    visibleColumns.length +
    (rowVariant === 'checkbox' ? 1 : 0) +
    (rowVariant === 'dropdown' ? 1 : 0) +
    (rowButton ? 1 : 0);

  // ✅ normalize selected rows
  const selectedRowIds = React.useMemo(() => {
    if (externalSelectedRows && Array.isArray(externalSelectedRows)) {
      return externalSelectedRows
        .map((r: any) => {
          if (typeof r === 'string' || typeof r === 'number') return r;
          return r?.id;
        })
        .filter(Boolean);
    }
    return internalSelectedRows;
  }, [externalSelectedRows, internalSelectedRows]);

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
    if ([15, 30, 50].includes(newRowsPerPage)) {
      setPerPage(newRowsPerPage as 15 | 30 | 50);
      setPage(1);
      onPerPageChange?.(newRowsPerPage);
    }
  };

  const handleRequestSort = (_: MouseEvent<unknown>, property: number | string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const [sortedRows, setSortedRows] = useState(rows);

  useEffect(() => {
    const sortedData = [...rows].sort((a, b) => {
      // @ts-expect-error
      if (orderBy && orderBy in a) {
        const colDef = columns.find((col) => {
          if (typeof col === 'string') return col === orderBy;
          return col.key === orderBy;
        });

        const isAccount = typeof colDef === 'object' && colDef.type === 'account';

        // @ts-expect-error
        const valueA = a[orderBy];
        // @ts-expect-error
        const valueB = b[orderBy];

        if (valueA == null || valueB == null) return 0;

        if (isAccount) {
          const nameA = typeof valueA === 'object' && valueA !== null ? valueA.name : String(valueA);
          const nameB = typeof valueB === 'object' && valueB !== null ? valueB.name : String(valueB);
          return order === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
        }

        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return order === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
        }

        if (typeof valueA === 'number' && typeof valueB === 'number') {
          return order === 'asc' ? valueA - valueB : valueB - valueA;
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

  const handleSelectRow = (row: any, index: number) => {
    const isRadioMode = rowVariant === 'radio' || hasRadioTextColumn;

    if (isRadioMode) {
      setInternalSelectedRows([row.id]);
      onRowClick?.(row, index);
      onCheckboxClick?.([row], index); // optional
      return;
    }

    // checkbox multi-select (existing behavior)
    const isSelected = selectedRowIds.includes(row.id);
    const newSelectedIds = isSelected
      ? selectedRowIds.filter((i: any) => i !== row.id)
      : [...selectedRowIds, row.id];

    setInternalSelectedRows(newSelectedIds);

    const selectedRowObjects = (rows as any[]).filter((r: any) =>
      newSelectedIds.includes(r.id),
    );
    onCheckboxClick?.(selectedRowObjects, index);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={sx} style={style}>
        <TableContainer sx={{ padding: '0px 1rem' }}>
          <Table>
            {showHeader && rows.length !== 0 && (
              <TableHeader
                headCells={headCells.filter((cell) => cell.id !== 'id')}
                order={order}
                orderBy={orderBy}
                onRequestSort={handleRequestSort}
                numSelected={selectedRowIds.length}
                rowCount={displayedRows.length}
                onSelectAllClick={(event: ChangeEvent<HTMLInputElement>) => {
                  if (rowVariant !== 'checkbox') return;

                  if (event.target.checked) {
                    const displayedRowsArray = [...displayedRows];
                    setInternalSelectedRows(displayedRows.map((r: any) => r.id));
                    onSelectAll?.(displayedRowsArray, true);
                    onCheckboxClick?.(displayedRowsArray, -1);
                  } else {
                    setInternalSelectedRows([]);
                    onSelectAll?.([], false);
                    onCheckboxClick?.([], -1);
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
                  <TableCell colSpan={emptyColSpan} sx={{ p: 0, borderBottom: 0 }}>
                    <Box
                      sx={{
                        width: '100%',
                        minHeight: 320,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center',
                        px: 2,
                        py: 6,
                      }}
                    >
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
                              <SearchIcon sx={{ fontSize: 40, color: theme.palette.grey[500] }} />
                            )}

                            <Typography sx={{ color: theme.palette.grey[700], fontSize: 18, fontWeight: 600 }}>
                              {emptyStateTitle ?? 'No records yet'}
                            </Typography>

                            {(emptyStateSubtitle || isFilterApplied) && (
                              <Typography sx={{ color: theme.palette.grey[600], textAlign: 'center' }}>
                                {emptyStateSubtitle ?? 'Please refine your search and try again'}
                              </Typography>
                            )}

                            {emptyStateActionLabel && onEmptyStateAction && (
                              <Box sx={{ mt: 1.5 }}>
                                <Button onClick={onEmptyStateAction}>{emptyStateActionLabel}</Button>
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
                    isSelected={selectedRowIds.includes(row.id)}
                    onSelect={() => handleSelectRow(row, index)}
                    accountIcon={accountIcon}
                    onRowClick={() => {
                      const isRadioMode = rowVariant === 'radio' || hasRadioTextColumn;
                      if (isRadioMode) handleSelectRow(row, index);
                      else onRowClick?.(row, index);
                    }}
                    onQuickLinkClick={(link: any) => onQuickLinkClick?.(row, index, link)}
                    onMoreButtonClick={() => onMoreButtonClick?.()}
                    onRowDropdownClick={(expanded: boolean) => onRowDropdownClick?.(expanded)}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {showPagination && rows.length !== 0 && (
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