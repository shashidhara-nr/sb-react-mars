'use client';

import { useState } from 'react';
import { Button } from 'dist/standard-bank-react';
import { Box, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from 'public/icons/icn_close_circle.svg';
import Image from 'next/image';
import FilterIcon from 'public/icons/col-icon-filter.svg';
import HistoryTableFilter, { FilterValues } from './HistoryTableFilter';
import TableContainer from 'components/molecules/TableContainer/TableContainer';
import { buildTestId } from 'src/utils/testIds';

// Define column structure for the DataTable
const columns = [
  { key: 'paymentID', type: 'normal' as const },
  { key: 'currency', type: 'normal' as const },
  { key: 'amount', type: 'normal' as const },
  { key: 'date', type: 'normal' as const },
  { key: 'status', type: 'chip' as const },
];

// Define head cells for table headers
const headCells = [
  { id: 'paymentID', label: 'Payment ID', disablePadding: false, numeric: false },
  { id: 'currency', label: 'Currency', disablePadding: false, numeric: false },
  { id: 'amount', label: 'Amount', disablePadding: false, numeric: false },
  { id: 'date', label: 'Date', disablePadding: false, numeric: false },
  { id: 'status', label: 'Status', disablePadding: false, numeric: false },
];

// Map status strings to chip format {value, color}
const getStatusChip = (status: string) => {
  switch (status.toLowerCase()) {
    case 'processed':
      return {
        value: 'Processed',
        color: 'success',
      };
    case 'processing':
      return {
        value: 'Processing',
        color: 'warning',
      };
    case 'pending':
      return {
        value: 'Pending',
        color: 'warning',
      };
    case 'failed':
      return {
        value: 'Failed',
        color: 'error',
      };
    default:
      return {
        value: status,
        color: 'default',
      };
  }
};

// Dummy data for the table
const dummyData = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  paymentID: `[Payment ID]`,
  currency: 'South African Rand (ZAR)',
  amount: 'R X,XXX,XXX.XX',
  date: 'DD/MM/YYYY',
  status: i % 3 === 0 ? 'Processed' : 'Processing',
}));

interface ManageHistoryTableProps {
  testIdPrefix?: string;
}

function ManageHistoryTable({ testIdPrefix = 'manage-history-table' }: ManageHistoryTableProps) {
  const [appliedFilters, setAppliedFilters] = useState<FilterValues | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // ✅ Filter state
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);
  const filterOpen = Boolean(filterAnchorEl);

  // ✅ Filter handlers
  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleCloseFilter = () => {
    setFilterAnchorEl(null);
  };

  const handleApplyFilter = (filters: FilterValues) => {
    setAppliedFilters(filters);
  };

  const handleClearFilters = () => {
    setAppliedFilters(null);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Check if any filters are active
  const hasActiveFilters =
    appliedFilters && Object.values(appliedFilters).some((value) => value !== '');

  // Apply filters to data
  const filteredData = dummyData.filter((row) => {
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      const matchesSearch =
        row.paymentID.toLowerCase().includes(query) ||
        row.currency.toLowerCase().includes(query) ||
        row.amount.toLowerCase().includes(query) ||
        row.date.toLowerCase().includes(query) ||
        row.status.toLowerCase().includes(query);
      if (!matchesSearch) {
        return false;
      }
    }

    if (!appliedFilters) return true;

    // Filter by Payment ID
    if (
      appliedFilters.paymentId &&
      !row.paymentID.toLowerCase().includes(appliedFilters.paymentId.toLowerCase())
    ) {
      return false;
    }

    // Filter by Date
    if (appliedFilters.date) {
      // Parse the row date (format: "DD/MM/YYYY")
      // For now, skip date filtering since we're using placeholder data
      // In production, implement proper date comparison
    }

    // Filter by Currency
    if (
      appliedFilters.currency &&
      !row.currency.toLowerCase().includes(appliedFilters.currency.toLowerCase())
    ) {
      return false;
    }

    // Filter by Status
    if (appliedFilters.status && row.status.toLowerCase() !== appliedFilters.status.toLowerCase()) {
      return false;
    }

    return true;
  });

  // Transform data to use chip format for status
  const transformedData = filteredData.map((row) => {
    return {
      ...row,
      status: getStatusChip(row.status),
    };
  });

  const tableData = {
    columns,
    headCells,
    rows: transformedData,
    rowButton: false,
    pageSize: 10,
    rowCount: transformedData.length,
  };

  const filterButtons = [
    {
      children: 'FILTER',
      buttonVariant: 'tertiary' as const,
      startIcon: <Image src={FilterIcon} alt="filter" width={24} height={24} />,
      onClick: handleFilterClick,
      style: {
        height: '48px',
        minHeight: '48px',
        width: '112px',
        fontWeight: 700,
        fontSize: '14px',
      },
      buttonProps: {
        'data-testid': buildTestId(testIdPrefix, 'button-filter'),
        'aria-label': 'Filter payment history'
      },
    },
  ];

  const rightPanelContent = hasActiveFilters ? (
    <Button
      buttonVariant="tertiary"
      endIcon={<Image src={CloseIcon} alt="close" width={20} height={20} />}
      onClick={handleClearFilters}
      style={{
        width: '170px',
        height: '32px',
        minWidth: '170px',
        minHeight: '32px',
        textTransform: 'none',
      }}
      data-testid={buildTestId(testIdPrefix, 'button-clear-filters')}
      aria-label="Remove filters"
    >
      Remove filters
    </Button>
  ) : null;

  return (
    <>
      <Box sx={{ mb: 3 }} data-testid={buildTestId(testIdPrefix, 'container')}>
        <TextField
          fullWidth
          placeholder="Search payment history"
          value={searchQuery}
          onChange={handleSearchChange}
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#666' }} />
              </InputAdornment>
            ),
          }}
          inputProps={{
            'data-testid': buildTestId(testIdPrefix, 'input-search'),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              height: '48px',
              backgroundColor: '#FFFFFF',
            },
          }}
        />
      </Box>

      <Box
        sx={{
          p: 0,
          backgroundColor: '#F8F8FA',
          borderRadius: '12px',
          border: '1px solid #E0E0E0',
          overflow: 'hidden',
        }}
        data-testid={buildTestId(testIdPrefix, 'table-wrapper')}
      >
        <TableContainer
          testIdPrefix={buildTestId(testIdPrefix, 'table')}
          tableData={tableData}
          filterButtons={filterButtons}
          rightPanelContent={rightPanelContent}
          tabsContainerSx={{ backgroundColor: '#F8F8FA', borderRadius: 0 }}
          tableSx={{
            '& > .MuiBox-root > .MuiBox-root:first-of-type': {
              pl: 4,
            },
          }}
        />
      </Box>

      {/* ✅ Filter Popover anchored to FILTER button */}
      <HistoryTableFilter
        open={filterOpen}
        anchorEl={filterAnchorEl}
        onClose={handleCloseFilter}
        onApplyFilter={handleApplyFilter}
      />
    </>
  );
}

export default ManageHistoryTable;
