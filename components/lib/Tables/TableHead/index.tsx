// @ts-nocheck
import React, { MouseEvent, ChangeEvent } from 'react';
import {
  Checkbox,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  useTheme,
  ThemeProvider,
} from '@mui/material';

const IconSort: React.FC<{ className?: string }> = ({ className }) => {
  // Only show icon when the column is actively being sorted
  // Check for MUI's direction classes which are applied when TableSortLabel is active
  const isAscending = className?.includes('MuiTableSortLabel-iconDirectionAsc');
  const isDescending = className?.includes('MuiTableSortLabel-iconDirectionDesc');
  
  // Don't show icon if column is not actively sorted
  if (!isAscending && !isDescending) {
    return null;
  }
  
  // Render arrow icons based on sort direction
  // Ascending (A→Z, 0→9): UP arrow highlighted (blue), DOWN arrow dimmed (light blue)
  // Descending (Z→A, 9→0): DOWN arrow highlighted (blue), UP arrow dimmed (light blue)
  return (
    <svg 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'flex', alignItems: 'center' }}
    >
      {/* UP Arrow */}
      <path 
        d="M12 5C12.1418 5 12.2768 5.06016 12.3717 5.16552L16.8717 10.1655C17.0037 10.3123 17.0371 10.523 16.9568 10.7034C16.8764 10.8838 16.6975 11 16.5 11H7.50001C7.30255 11 7.12359 10.8838 7.04326 10.7034C6.96293 10.523 6.99627 10.3123 7.12836 10.1655L11.6284 5.16552C11.7232 5.06016 11.8583 5 12 5Z" 
        fill={isAscending ? "#0051FF" : "#BFDCFC"}
      />
      {/* DOWN Arrow */}
      <path 
        d="M7.04326 13.2966C7.12359 13.1162 7.30255 13 7.50001 13C7.69746 13 16.5 13 16.5 13C16.6975 13 16.8764 13.1162 16.9568 13.2966C17.0371 13.477 17.0037 13.6877 16.8717 13.8345L12.3717 18.8345C12.2768 18.9398 12.1418 19 12 19C11.8583 19 11.7232 18.9398 11.6284 18.8345C11.6284 18.8345 7.26045 13.9812 7.12836 13.8345C6.99627 13.6877 6.96293 13.477 7.04326 13.2966Z" 
        fill={isDescending ? "#0051FF" : "#BFDCFC"}
      />
    </svg>
  );
};

export type Order = 'asc' | 'desc';

export interface HeadCell {
  id: string;
  label: string;
  numeric: boolean;
  icon?: React.ReactElement;
  disableSort?: boolean;
  textAlign?: 'left' | 'right' | 'center' | 'justify' | 'inherit';
  colWidth?: string;
}

export interface TableHeaderProps<T> {
  headCells: HeadCell[];
  numSelected: number;
  onSelectAllClick: (event: ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: keyof T;
  onRequestSort: (event: MouseEvent<unknown>, property: keyof T) => void;
  rowCount: number;
  columns?: string[];
  checkbox?: boolean;
  dropdown?: boolean;
  rowButton?: boolean;
}

export default function TableHeader<T>(
  props: TableHeaderProps<T> & { isSmallScreen?: boolean },
) {
  const {
    headCells,
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort,
    checkbox,
    dropdown,
    isSmallScreen = false,
  } = props;

  const theme = useTheme();

  const createSortHandler =
    (property: keyof T) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <ThemeProvider theme={theme}>
      <TableHead>
        <TableRow sx={{ borderBottom: `1px solid ${theme.palette.grey[400]}` }}>
          {checkbox && (
            <TableCell sx={{ padding: '0px' }}>
              <Checkbox
                indeterminate={numSelected > 0 && numSelected < rowCount}
                checked={rowCount > 0 && numSelected === rowCount}
                onChange={onSelectAllClick}
              />
            </TableCell>
          )}
          {/* This cell is to offset the dropdown row variant and ensure the table headers all line up with the columns */}
          {dropdown && <TableCell></TableCell>}
            {headCells.map((headCell, index) => (
              <TableCell
                key={headCell.id}
                align={headCell?.textAlign || 'left'}
                sx={{
                  py: isSmallScreen ? 1.5 : 2.125,
                  px: isSmallScreen ? 1 : 2,
                  pl: checkbox && index === 0 ? '10px' : isSmallScreen ? 1 : 2,
                  ...(isSmallScreen
                    ? theme.typography.sRegular
                    : theme.typography.sMedium),
                    fontSize: isSmallScreen ? '0.95rem' : undefined,
                  width: headCell?.colWidth || 'auto',
                }}
                sortDirection={orderBy === headCell.id && !headCell?.disableSort ? order : false}
              >
                <TableSortLabel
                active={orderBy === headCell.id && !headCell?.disableSort}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={headCell?.disableSort ? undefined : createSortHandler(headCell.id as keyof T)}
                IconComponent={!headCell?.disableSort ? IconSort : undefined}
                disabled={headCell?.disableSort}
                >
                {headCell.icon && <span>{headCell.icon}</span>}
                {headCell.label}
                </TableSortLabel>
              </TableCell>
            ))}
            {props.rowButton && <TableCell />}
        </TableRow>
      </TableHead>
    </ThemeProvider>
  );
}
