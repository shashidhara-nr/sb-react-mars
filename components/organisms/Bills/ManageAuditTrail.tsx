'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'dist/standard-bank-react';
import Image from 'next/image';
import { Box, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from 'public/icons/col-icon-download.svg';
import FilterIcon from 'public/icons/col-icon-filter.svg';
import DownloadAuditTrailPopover from './DownloadAuditTrailDialog';
import AuditTrailFilter, { AuditFilterValues } from './AuditTrailFilter';
import TableContainer from 'components/molecules/TableContainer/TableContainer';
import { buildTestId } from 'src/utils/testIds';

// Define column structure for the DataTable
const columns = [
  { key: 'userName', type: 'normal' as const },
  { key: 'eventType', type: 'normal' as const },
  { key: 'description', type: 'normal' as const },
  { key: 'timeOfEvent', type: 'normal' as const },
];

// Define head cells for table headers
const headCells = [
  { id: 'userName', label: 'Username', numeric: false, disablePadding: false },
  { id: 'eventType', label: 'Event type', numeric: false, disablePadding: false },
  { id: 'description', label: 'Description', numeric: false, disablePadding: false },
  { id: 'timeOfEvent', label: 'Time of event', numeric: false, disablePadding: false },
];

// Dummy data for the table (100 records)
const dummyData = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  userName: '[Username]',
  eventType: '[Event type]',
  description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod t...',
  timeOfEvent: 'HH:MM',
}));

interface ManageAuditTrailProps {
  testIdPrefix?: string;
}

function ManageAuditTrail({ testIdPrefix = 'manage-audit-trail' }: ManageAuditTrailProps) {
  const router = useRouter();
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<HTMLElement | null>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedFilters, setAppliedFilters] = useState<AuditFilterValues | null>(null);

  const downloadOpen = Boolean(downloadAnchorEl);
  const filterOpen = Boolean(filterAnchorEl);

  const handleDownloadClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setDownloadAnchorEl(event.currentTarget);
  };

  const handleCloseDownload = () => {
    setDownloadAnchorEl(null);
  };

  const handleDownload = (format: string, sortOrder: string) => {
    console.log('Downloading audit trail with format:', format, 'and sort order:', sortOrder);
    // TODO: Implement actual download logic here
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleCloseFilter = () => {
    setFilterAnchorEl(null);
  };

  const handleApplyFilter = (filters: AuditFilterValues) => {
    setAppliedFilters(filters);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const tableData = {
    columns,
    headCells,
    rows: dummyData,
    rowButton: false,
    pageSize: 10,
    rowCount: dummyData.length,
  };

  const filterButtons = [
    {
      children: 'DOWNLOAD',
      buttonVariant: 'tertiary' as const,
      startIcon: <Image src={DownloadIcon} alt="download" width={24} height={24} />,
      onClick: handleDownloadClick,
      style: {
        height: '48px',
        minHeight: '48px',
        width: '138px',
        fontWeight: 700,
        fontSize: '14px',
        marginRight: '12px',
      },
      buttonProps: {
        'data-testid': buildTestId(testIdPrefix, 'button-download'),
        'aria-label': 'Download audit trail'
      },
    },
    {
      children: 'FILTER',
      buttonVariant: 'tertiary' as const,
      startIcon: <Image src={FilterIcon} alt="filter" width={24} height={24} />,
      onClick: handleFilterClick,
      style: {
        height: '48px',
        minHeight: '48px',
        width: '106px',
        fontWeight: 700,
        fontSize: '14px',
      },
      buttonProps: {
        'data-testid': buildTestId(testIdPrefix, 'button-filter'),
        'aria-label': 'Filter audit trail'
      },
    },
  ];

  return (
    <>
      {/* Search Field */}
      <Box sx={{ mb: 3 }} data-testid={buildTestId(testIdPrefix, 'container')}>
        <TextField
          fullWidth
          placeholder="Search audit trail"
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
          tabsContainerSx={{ backgroundColor: '#F8F8FA', borderRadius: 0 }}
          tableSx={{
            '& > .MuiBox-root > .MuiBox-root:first-of-type': {
              pl: 4,
            },
          }}
        />
      </Box>

      {/* Download Popover anchored to button */}
      <DownloadAuditTrailPopover
        open={downloadOpen}
        anchorEl={downloadAnchorEl}
        onClose={handleCloseDownload}
        onDownload={handleDownload}
      />

      {/* Filter Popover */}
      <AuditTrailFilter
        open={filterOpen}
        anchorEl={filterAnchorEl}
        onClose={handleCloseFilter}
        onApplyFilter={handleApplyFilter}
        currentFilters={appliedFilters}
      />
    </>
  );
}

export default ManageAuditTrail;
