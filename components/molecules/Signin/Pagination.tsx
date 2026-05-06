import { ChangeEvent } from 'react';
import {
  Typography,
  MenuItem,
  Select,
  Box,
  SelectChangeEvent,
  useTheme,
  ThemeProvider,
  IconButton,
} from '@mui/material';
import Image from 'next/image';

import ChevronLastPage from 'public/icons/chevron_last_page.svg';
import DownArrow from 'public/icons/arrow-down.svg';
import ChevronIcnFirstPage from 'public/icons/icn_chevron_first_page.svg';
import ChevronIcnLeft from 'public/icons/icn_chevron_left.svg';
import ChevronIcnRight from 'public/icons/icn_chevron_right.svg';

export interface CustomPaginationProps {
  rows: unknown[];
  page: number;
  rowsPerPage: 10 | 20 | 50;
  onPageChange: (_: ChangeEvent<unknown>, newPage:  number) => void;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
}

export default function Pagination({
  rows,
  page = 1,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}:  CustomPaginationProps) {
  const theme = useTheme();
  const totalPages = Math. ceil(rows.length / rowsPerPage);

  const currentPage = page < 1 ? 1 : page > totalPages ?  totalPages : page;

  const startRow = (currentPage - 1) * rowsPerPage + 1;
  const endRow = Math.min(currentPage * rowsPerPage, rows.length);

  const handleFirstPage = () => {
    onPageChange({} as ChangeEvent<unknown>, 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange({} as ChangeEvent<unknown>, currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange({} as ChangeEvent<unknown>, currentPage + 1);
    }
  };

  const handleLastPage = () => {
    onPageChange({} as ChangeEvent<unknown>, totalPages);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        data-testid="pagination-container"
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent:  'flex-end',
          gap: 2,
          px: 2,
          py: 1.5,
          backgroundColor: theme. palette.common.white,
        }}
      >
        {/* Rows per page selector */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Typography
            sx={{
              fontSize:  '12px',
              fontWeight: 500,
              lineHeight: '1.3',
              color: theme.palette.text. secondary,
            }}
          >
            Rows per page
          </Typography>

          <Select
            data-testid="pagination-rows-per-page-select"
            value={rowsPerPage}
            className="paginationSelect"
            onChange={(e:  SelectChangeEvent<number>) =>
              onRowsPerPageChange(Number(e.target.value))
            }
            IconComponent={() => (
              <Box sx={{ ml: -1, mr: 1, display: 'flex', alignItems: 'center' }}>
                <Image src={DownArrow} alt="" width={10} height={10} />
              </Box>
            )}
            sx={{
              fontSize: '0.75rem',
              width: '100px',
              height: '36px',
              borderRadius:'8px',
              '& .MuiSelect-select': {
                py: 0.5,
                px: 1,
                pr: 3,
              },
              '& .MuiSelect-icon': {
                top: '50%',
                transform: 'translateY(-50%)',
                right: '10px',
              },
            }}
          >
            {[10, 20, 50].map((size) => (
              <MenuItem key={size} value={size}>
                {size}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* Pagination controls */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          {/* First page button */}
          <IconButton
            data-testid="pagination-first-page-button"
            onClick={handleFirstPage}
            disabled={currentPage === 1}
            size="small"
            sx={{
              padding: '4px',
              '&:disabled': {
                opacity: 0.4,
              },
            }}
          >
            <Image src={ChevronIcnFirstPage} alt="First page" width={20} height={20} />
          </IconButton>

          {/* Previous page button */}
          <IconButton
            data-testid="pagination-previous-page-button"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            size="small"
            sx={{
              padding: '4px',
              '&:disabled': {
                opacity: 0.4,
              },
            }}
          >
            <Image src={ChevronIcnLeft} alt="Previous page" width={20} height={20} />
          </IconButton>

          {/* Current page number */}
          <Box
            data-testid="pagination-current-page"
            sx={{
              minWidth: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 0.5,
            }}
          >
            <Typography
              sx={{
                fontSize:  '0.875rem',
                fontWeight: 500,
                color: theme.palette.primary.main,
              }}
            >
              {currentPage}
            </Typography>
          </Box>

          {/* Next page button */}
          <IconButton
            data-testid="pagination-next-page-button"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            size="small"
            sx={{
              padding: '4px',
              '&: disabled': {
                opacity: 0.4,
              },
            }}
          >
            <Image src={ChevronIcnRight} alt="Next page" width={20} height={20} />
          </IconButton>

          {/* Last page button */}
          <IconButton
            data-testid="pagination-last-page-button"
            onClick={handleLastPage}
            disabled={currentPage === totalPages}
            size="small"
            sx={{
              padding: '4px',
              '&:disabled': {
                opacity: 0.4,
              },
            }}
          >
            <Image src={ChevronLastPage} alt="Last page" width={20} height={20} />
          </IconButton>
        </Box>

        {/* Row count text */}
        <Typography
          data-testid="pagination-row-count"
          sx={{
            fontSize: '0.75rem',
            fontWeight: 500,
            lineHeight: '1.3',
            color: theme.palette.text. secondary,
            whiteSpace: 'nowrap',
          }}
        >
          {startRow}–{endRow} of {rows.length} list items
        </Typography>
      </Box>
    </ThemeProvider>
  );
}