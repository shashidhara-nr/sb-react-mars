import { ChangeEvent } from 'react';
import {
  Pagination,
  Typography,
  MenuItem,
  Select,
  Box,
  SelectChangeEvent,
  useTheme,
  ThemeProvider,
  PaginationItem,
} from '@mui/material';
import {
  KeyboardArrowDown,
  FirstPage,
  LastPage,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';

export interface CustomPaginationProps {
  rows: unknown[];
  page: number;
  rowsPerPage: 15 | 30 | 50;
  onPageChange: (_: ChangeEvent<unknown>, newPage: number) => void;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
}

export default function CustomPagination({
  rows,
  page = 1,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: CustomPaginationProps) {
  const theme = useTheme();
  const totalPages = Math.ceil(rows.length / rowsPerPage);

  const currentPage = page < 1 ? 1 : page > totalPages ? totalPages : page;

  const startRow = (currentPage - 1) * rowsPerPage + 1;
  const endRow = Math.min(currentPage * rowsPerPage, rows.length);

  return (
    <ThemeProvider theme={theme}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        p={2}
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 0,
          px: 1,
          py: 1,

          backgroundColor: theme.palette.common.white,
        }}
      >
        <Box
          alignItems="center"
          sx={{
            display: {
              md: 'flex',
              sm: 'none',
              padding: 0,
            },
            justifyContent: 'flex-end',
            gap: 1.5,
            fontSize: '0.875rem',
            fontWeight: 500,
            lineHeight: '1.3',
          }}
        >
          <Typography
            sx={{
              fontSize: '0.75rem',
              fontWeight: 500,
              lineHeight: '1.3',
            }}
          >
            Rows per page
          </Typography>

          {/*Placeholder until we getthe dropdown component*/}
          <Select
            value={rowsPerPage}
            className="paginationSelect"
            onChange={(e: SelectChangeEvent<number>) =>
              onRowsPerPageChange(Number(e.target.value))
            }
            IconComponent={KeyboardArrowDown}
            sx={{
              '& .MuiSelect-icon': {
                top: '50%',
                transform: 'translateY(-50%)',
              },
            }}
          >
            {[15, 30, 50].map((size) => (
              <MenuItem key={size} value={size} sx={{ padding: 0 }}>
                {size}
              </MenuItem>
            ))}
          </Select>
        </Box>

        <Box display={'flex'} alignItems={'center'}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={onPageChange}
            variant="outlined"
            showFirstButton
            showLastButton
            sx={{
              fontWeight: 500,
              lineHeight: '1.3',
            }}
            renderItem={(item) => (
              <PaginationItem
                {...item}
                slots={{
                  first: FirstPage,
                  previous: ChevronLeft,
                  next: ChevronRight,
                  last: LastPage,
                }}
                sx={{ border: 'none' }}
              />
            )}
          />

          <Typography
            sx={{
              fontSize: '0.75rem',
              fontWeight: 500,
              lineHeight: '1.3',
            }}
          >
            {startRow}–{endRow} of {rows.length}
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
