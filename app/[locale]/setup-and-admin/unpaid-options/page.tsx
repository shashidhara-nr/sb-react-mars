'use client';
import { Grid, TextField, InputAdornment, Box } from '@mui/material';
import { Breadcrumb, Heading, Button } from 'dist/standard-bank-react';
import TableContainer from '@molecules/TableContainer/TableContainer';
import { useRouter } from 'next/navigation';
import { useState, useMemo, useCallback, useRef } from 'react';
import Image from 'next/image';
import FunnelIcon from 'public/icons/icn_funnel.svg';
import SearchIcon from 'public/icons/icn_search_black.svg';
import CloseIcon from 'public/icons/icn_close_circle.svg';
import AddIcon from 'public/icons/icn_add.svg';
import UnpaidOptionsFilterDialog, {
  UnpaidOptionsFilterValues,
} from '@molecules/UnpaidOptionsFilterDialog/UnpaidOptionsFilterDialog';
import { mockUnpaidOptions } from 'lib/mock/mockUnpaidOptions';

// Constants
const TAB_STATUS_MAP = [
  undefined, // All Records
  'Needs Action',
  'Awaiting Approval',
  'Active',
  'Inactive',
] as const;

const TABLE_COLUMNS = [
  'unpaidOption',
  'postingOption',
  'postingAccount',
  { key: 'status', type: 'chip' },
  { key: 'links', type: 'link' },
] as const;

const STATUS_TABS = [
  'All records',
  'Needs action',
  'Awaiting approval',
  'Active',
  'Inactive',
] as const;

const TABLE_HEAD_CELLS = [
  { id: 'unpaidOption', label: 'Unpaid option', numeric: false },
  { id: 'postingOption', label: 'Posting option', numeric: false },
  { id: 'postingAccount', label: 'Posting account', numeric: false },
  { id: 'status', label: 'Status', numeric: false },
  { id: 'links', label: 'Quick links', numeric: false },
] as const;

const UnpaidOptionsHub = () => {
  const router = useRouter();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filterValues, setFilterValues] = useState<Partial<UnpaidOptionsFilterValues>>({});
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);

  // Memoize callbacks
  const handleFilterClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setFilterDialogOpen(true);
    setFilterAnchorEl(event.currentTarget);
  }, []);

  const handleFilterClose = useCallback(() => {
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
  }, []);

  const handleFilterApply = useCallback((values: Partial<UnpaidOptionsFilterValues>) => {
    setFilterValues(values);
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
  }, []);

  const handleCreateClick = useCallback(() => {
    router.push('/setup-and-admin/unpaid-options/create' as any);
  }, [router]);

  const handleRemoveFilters = useCallback(() => {
    setFilterValues({});
    setSearchText('');
  }, []);

  // Memoize filtered rows
  const filteredRows = useMemo(() => {
    const searchLower = searchText.trim().toLowerCase();

    return mockUnpaidOptions.filter((row) => {
      // Tab filter
      if (selectedTab !== 0 && row.status.value !== TAB_STATUS_MAP[selectedTab]) return false;

      // Dialog filters
      if (
        filterValues.name &&
        !(
          row.unpaidOption &&
          row.unpaidOption.toLowerCase().includes(filterValues.name.toLowerCase())
        )
      )
        return false;
      if (
        filterValues.postingOption &&
        filterValues.postingOption !== 'All' &&
        row.postingOption !== filterValues.postingOption
      )
        return false;

      // Search filter
      if (
        searchLower &&
        !(row.unpaidOption && row.unpaidOption.toLowerCase().includes(searchLower))
      )
        return false;

      return true;
    });
  }, [selectedTab, filterValues, searchText]);

  // Memoize filter button
  const filterButtons = useMemo(() => {
    return [
      {
        children: (
          <>
            <Image
              src={FunnelIcon}
              alt="filter"
              width={16}
              height={16}
              style={{ marginRight: 4 }}
            />
            Filter
          </>
        ),
        buttonVariant: 'tertiary',
        onClick: handleFilterClick,
      },
    ];
  }, [handleFilterClick]);

  // Memoize action buttons for right panel
  const rightPanelButtons = useMemo(() => {
    const hasFilters = Object.keys(filterValues).length > 0 || searchText.trim().length > 0;

    if (!hasFilters) return null;

    return (
      <Box sx={{ display: 'flex' }}>
        <Button
          buttonVariant="tertiary"
          endIcon={<Image src={CloseIcon} alt="close" width={20} height={20} />}
          onClick={handleRemoveFilters}
          style={{
            width: '170px',
            height: '32px',
            minWidth: '170px',
            minHeight: '32px',
            textTransform: 'none',
          }}
        >
          Remove filters
        </Button>
      </Box>
    );
  }, [filterValues, searchText, handleRemoveFilters]);

  // Memoize table data
  const tableData = useMemo(
    () => ({
      columns: TABLE_COLUMNS,
      headCells: TABLE_HEAD_CELLS,
      rows: filteredRows.map((row) => ({
        ...row,
        links: {
          ...row.links,
          href: `/setup-and-admin/unpaid-options/manage?id=${row.id}`,
        },
      })),
      pageSize: 10,
      rowCount: filteredRows.length,
    }),
    [filteredRows],
  );

  // Add quick link click handler
  const handleQuickLinkClick = (row: any, index: number, link: any) => {
    if (link && link.href) {
      router.push(link.href);
    }
  };

  return (
    <>
      <Grid container spacing={4} sx={{ pb: 4 }}>
        <Grid size={12}>
          <Breadcrumb
            links={[
              { href: '/', label: 'Dashboard' },
              { href: '/setup-and-admin/unpaid-options', label: 'Unpaid options' },
            ]}
          />
        </Grid>

        <Grid
          size={12}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '48px',
          }}
        >
          <Heading as="h4" fontSize="28px">
            Unpaid options
          </Heading>
          <Box sx={{ '&:hover img': { filter: 'brightness(0) invert(1)' } }}>
            <Button
              buttonVariant="secondary"
              startIcon={<Image src={AddIcon} alt="addicon" width={24} height={24} />}
              style={{ height: 48 }}
              onClick={handleCreateClick}
            >
              CREATE AN UNPAID OPTION
            </Button>
          </Box>
        </Grid>

        <Grid size={12}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search unpaid option name"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Image src={SearchIcon} alt="search" width={20} height={20} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: '#fff',
              },
              '& .MuiInputBase-input::placeholder': {
                color: '#5C6C80',
                opacity: 1,
              },
            }}
          />
        </Grid>

        <Grid
          size={12}
          ref={tableContainerRef}
          sx={{
            padding: 0,
            backgroundColor: '#F8F8FA',
            borderRadius: '12px',
            border: '1px solid #e0e0e0',
            overflow: 'hidden',
          }}
        >
          <TableContainer
            tableData={tableData}
            filterButtons={filterButtons}
            rightPanelContent={rightPanelButtons}
            showTabs={true}
            tabs={STATUS_TABS.map((label, index) => ({ label, value: index }))}
            selectedTab={selectedTab}
            onTabChange={setSelectedTab}
            tabsContainerSx={{ backgroundColor: '#F8F8FA', borderRadius: 0 }}
            tableStyle={{}}
            onQuickLinkClick={handleQuickLinkClick}
          />
        </Grid>
      </Grid>

      <UnpaidOptionsFilterDialog
        open={filterDialogOpen}
        anchorEl={filterAnchorEl}
        onClose={handleFilterClose}
        onApply={handleFilterApply}
        initialValues={filterValues}
      />
    </>
  );
};

export default UnpaidOptionsHub;
