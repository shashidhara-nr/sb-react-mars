import * as React from 'react';
import { Box, Typography, InputAdornment, IconButton, TextField } from '@mui/material';
import { Button } from 'dist/standard-bank-react';
import SelectField from '@atoms/Select/Select';
import EventAuthorisersFilterDialog, {
  EventAuthorisersFilterValues,
} from '@molecules/EventAuthorisersFilterDialog';
import Image from 'next/image';
import {
  SearchIcon,
  FunnelIcon,
  UserAccountNon,
  CloseBlue,
  IconChevronDown,
  IconChevronLeft,
  IconChevronFirstPage,
  IconChevronLastPage,
  IconChevronLastPageRight,
} from 'lib/icons';
import type { AuditApproveMode } from 'src/utils/auditandapprove';
 
export interface AuditorsPanelProps {
  userAccountName: string;
  onBack: () => void;
  onClose: () => void;
  mode?: AuditApproveMode;
  data?: any[];
}
 
interface AuditEvent {
  auditEventID?: string;
  userName?: string;
  userId?: string;
  userRole?: string;
  customerName?: string;
  emailAddress?: string;
  entityType?: string;
  entityName?: string;
  function?: string;
  date?: number;
  text?: string;
  tokens?: (string | null)[];
  messageCategory?: string;
  messageDomain?: string;
  messageSubCategory?: string | null;
  acknowledgementRequried?: string | null;
  msgAlertAuthStatus?: string | null;
  entitySurrogateKey?: string | null;
  userType?: string | null;
  dateValue?: string | null;
  details?: string | null;
  reportDetails?: string | null;
  bic?: string | null;
}

interface AuditorRow {
  id: number;
  personName: string;
  userId: string;
  customerName: string;
  telephoneNumber: string;
  emailAddress: string;
  userAccount: string;
  mobileNumber: string;
}
 
const MOCK_AUDITORS: AuditorRow[] = Array.from({ length: 12 }).map((_, idx) => ({
  id: idx + 1,
  personName: '[Firstname Lastname]',
  userId: '[User ID]',
  customerName: '[Customer Name]',
  telephoneNumber: '+XX XXXXX XXXXXX',
  emailAddress: '[firstname.lastname@domain.za]',
  userAccount: `[User account ${(idx % 5) + 1}]`,
  mobileNumber: '+XX XXXXX XXXXXX',
}));
const MOCK_AUTHORISERS: AuditorRow[] = Array.from({ length: 8 }).map((_, idx) => ({
  id: idx + 1,
  personName: '[Authoriser Firstname Lastname]',
  userId: '[Authoriser ID]',
  customerName: '[Customer Name]',
  telephoneNumber: '+XX XXXXX XXXXXX',
  emailAddress: '[authoriser.firstname.lastname@domain.za]',
  userAccount: `[Authoriser account ${(idx % 3) + 1}]`,
  mobileNumber: '+XX XXXXX XXXXXX',
}));
const mapAuditEventsToAuthorisers=(
  data: AuditEvent[]
): AuditorRow[] => {
  return data.map((item, idx) => {
    const personName = item.customerName ?? 'NA';
    const userId = item.userId ?? 'NA';
    const customerName = item.customerName ?? 'NA';

    return {
      id: idx + 1,
      personName,
      userId,
      customerName,
      telephoneNumber: 'NA',
      emailAddress:item?.emailAddress ?? 'NA',
      userAccount: 'NA',
      mobileNumber: 'NA',
    };
  });
}

const AuditorsPanel: React.FC<AuditorsPanelProps> = ({ userAccountName, onBack, onClose, mode = 'audit',data }) => {
  const [expandedId, setExpandedId] = React.useState<number | null>(1);
  const [searchValue, setSearchValue] = React.useState<string>('');
  const [page, setPage] = React.useState<number>(1);
  const [filterAnchorEl, setFilterAnchorEl] = React.useState<HTMLElement | null>(null);
  const [filters, setFilters] = React.useState<EventAuthorisersFilterValues | null>(null);
  const rowsPerPage = 10;
 
  const allRows = React.useMemo<AuditorRow[]>(
    () => {
      if (data && mode !== 'approve') {
        return mapAuditEventsToAuthorisers(data);
      }
      return mode === 'approve' ? MOCK_AUTHORISERS : MOCK_AUDITORS;
    },
    [mode, data],
  );
 
  const userAccountOptions = React.useMemo(
    () =>
      Array.from(new Set(allRows.map((row) => row.userAccount))).map((value) => ({
        label: value,
        value,
      })),
    [allRows],
  );
 
  const filteredRows = React.useMemo(() => {
    let rows = [...allRows];
 
    if (searchValue.trim()) {
      const query = searchValue.trim().toLowerCase();
      rows = rows.filter(
        (row) =>
          row.personName.toLowerCase().includes(query) ||
          row.userId.toLowerCase().includes(query),
      );
    }
 
    if (filters) {
      rows = rows.filter((row) => {
        if (
          filters.customerName &&
          !row.customerName.toLowerCase().includes(filters.customerName.toLowerCase())
        ) {
          return false;
        }
 
        if (filters.userAccount && row.userAccount !== filters.userAccount) {
          return false;
        }
 
        if (
          filters.telephoneNumber &&
          !row.telephoneNumber.toLowerCase().includes(filters.telephoneNumber.toLowerCase())
        ) {
          return false;
        }
 
        if (
          filters.mobileNumber &&
          !row.mobileNumber.toLowerCase().includes(filters.mobileNumber.toLowerCase())
        ) {
          return false;
        }
 
        if (
          filters.emailAddress &&
          !row.emailAddress.toLowerCase().includes(filters.emailAddress.toLowerCase())
        ) {
          return false;
        }
 
        return true;
      });
    }
 
    return rows;
  }, [searchValue, filters, allRows]);
 
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
 
  const paginatedRows = React.useMemo(() => {
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredRows.slice(start, end);
  }, [page, totalPages, filteredRows]);
 
  React.useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);
 
  const handleFilterApply = (values: EventAuthorisersFilterValues) => {
    setFilters(values);
  };
 
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Title bar */}
      <Box
        sx={{
          px: 3,
          pt: 3,
          pb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
          <Image src={UserAccountNon} alt="User account" width={20} height={20} />
          <Typography sx={{ fontSize: '18px', fontWeight: 400, color: '#222E37' }}>
            [{userAccountName || 'User account'}]
          </Typography>
        </Box>
        <Box sx={{ cursor: 'pointer' }} onClick={onClose}>
          <Image src={CloseBlue} alt="Close" width={18} height={18} />
        </Box>
      </Box>
 
      {/* Content card */}
      <Box sx={{ flex: 1, px: 3, pb: 3 }}>
        <Box
          sx={{
            borderRadius: 2,
            border: '1px solid #E0E5EB',
            bgcolor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          {/* Card header */}
          <Box
            sx={{
              px: 3,
              py: 2,
              borderBottom: '1px solid #E0E5EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
              <Image src={UserAccountNon} alt={mode === 'approve' ? 'Authorisers' : 'Auditors'} width={20} height={20} />
              <Typography sx={{ fontSize: '18px', fontWeight: 600, color: '#222E37' }}>
                {mode === 'approve' ? 'Authorisers' : 'Auditors'}
              </Typography>
            </Box>
            <Image src={IconChevronDown} alt="Collapse" width={20} height={20} />
          </Box>
 
          {/* Search + filter */}
          <Box
            sx={{
              px: 3,
              py: 2,
              borderBottom: '1px solid #E0E5EB',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <TextField
                name="search"
                placeholder="Search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Image src={SearchIcon} alt="Search" width={18} height={18} />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                fullWidth
              />
            </Box>
            <Button
              buttonVariant="secondary"
              startIcon={<Image src={FunnelIcon} alt="Filter" width={18} height={18} />}
              onClick={(event: any) => setFilterAnchorEl(event.currentTarget)}
            >
              FILTER
            </Button>
          </Box>
 
          <EventAuthorisersFilterDialog
            open={Boolean(filterAnchorEl)}
            anchorEl={filterAnchorEl}
            onClose={() => setFilterAnchorEl(null)}
            onApply={handleFilterApply}
            initialValues={filters ?? undefined}
            userAccountOptions={userAccountOptions}
          />
 
          {/* Table header */}
          <Box
            sx={{
              px: 3,
              py: 1.5,
              borderBottom: '1px solid #E0E5EB',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#5C6C80' }}>
                Person name
              </Typography>
              <Image src={IconChevronDown} alt="Sort" width={14} height={14} />
            </Box>
            <Box sx={{ width: 160, textAlign: 'right' }}>
              <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#5C6C80' }}>
                User ID
              </Typography>
            </Box>
          </Box>
 
          {/* Rows */}
          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            {paginatedRows.map((row) => {
              const isExpanded = expandedId === row.id;
              return (
                <Box key={row.id} sx={{ borderBottom: '1px solid #E0E5EB' }}>
                  <Box
                    sx={{
                      px: 3,
                      py: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                    }}
                    onClick={() => setExpandedId(isExpanded ? null : row.id)}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: '14px', color: '#222E37' }}>
                        {row.personName}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 160,
                        textAlign: 'right',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: 1,
                      }}
                    >
                      <Typography sx={{ fontSize: '14px', color: '#222E37' }}>
                        {row.userId}
                      </Typography>
                      <Image src={IconChevronDown} alt="Expand" width={16} height={16} />
                    </Box>
                  </Box>
 
                  {isExpanded && (
                    <Box
                      sx={{
                        px: 3,
                        pb: 2,
                        display: 'flex',
                        flexDirection: 'row',
                        gap: 4,
                        color: '#222E37',
                        fontSize: '12px',
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ color: '#5C6C80', mb: 0.5 }}>Customer name</Typography>
                        <Typography sx={{ mb: 1 }}>{row.customerName}</Typography>
 
                        <Typography sx={{ color: '#5C6C80', mb: 0.5 }}>
                          Telephone number
                        </Typography>
                        <Typography sx={{ mb: 1 }}>{row.telephoneNumber}</Typography>
 
                        <Typography sx={{ color: '#5C6C80', mb: 0.5 }}>Email address</Typography>
                        <Typography>{row.emailAddress}</Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ color: '#5C6C80', mb: 0.5 }}>User account</Typography>
                        <Typography sx={{ mb: 1 }}>{row.userAccount}</Typography>
 
                        <Typography sx={{ color: '#5C6C80', mb: 0.5 }}>Mobile number</Typography>
                        <Typography sx={{ mb: 1 }}>{row.mobileNumber}</Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
 
          {/* Pagination */}
          <Box
            sx={{
              px: 3,
              py: 1.75,
              borderTop: '1px solid #E0E5EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography sx={{ fontSize: '12px', color: '#5C6C80' }}>Skip to page</Typography>
              <Box sx={{ width: 72 }}>
                <SelectField
                  name="skipToPage"
                  value={page}
                  onChange={(_, val) => {
                    const pageNum = Number(val) || 1;
                    setPage(Math.min(Math.max(pageNum, 1), totalPages));
                  }}
                  options={Array.from({ length: totalPages }).map((_, idx) => ({
                    label: String(idx + 1),
                    value: idx + 1,
                  }))}
                  height={40}
                />
              </Box>
            </Box>
 
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <IconButton
                size="small"
                onClick={() => setPage(1)}
                disabled={page === 1}
              >
                <Image src={IconChevronFirstPage} alt="First" width={20} height={20} />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
              >
                <Image src={IconChevronLeft} alt="Previous" width={20} height={20} />
              </IconButton>
              <Typography sx={{ fontSize: '12px', color: '#0051FF', fontWeight: 600 }}>
                {page}
              </Typography>
              {totalPages >= 2 && (
                <Typography sx={{ fontSize: '12px', color: '#222E37' }}>
                  {page === 1 ? 2 : 1}
                </Typography>
              )}
              <IconButton
                size="small"
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
              >
                <Image src={IconChevronLastPageRight} alt="Next" width={20} height={20} />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
              >
                <Image src={IconChevronLastPage} alt="Last" width={20} height={20} />
              </IconButton>
              <Typography sx={{ fontSize: '12px', color: '#5C6C80', ml: 1 }}>
                {(page - 1) * rowsPerPage + 1} -
                {' '}
                {Math.min(page * rowsPerPage, allRows.length)} of {allRows.length}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
 
      {/* Footer buttons */}
      <Box
        sx={{
          px: 3,
          py: 1.5,
          borderTop: '1px solid #E0E5EB',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Button
          buttonVariant="tertiary"
          onClick={onClose}
          startIcon={<Image src={CloseBlue} alt="Close" width={20} height={20} />}
        >
          CLOSE
        </Button>
        <Button
          buttonVariant="primary"
          onClick={onBack}
          startIcon={<Image src={IconChevronLeft} alt="Back" width={20} height={20} />}
        >
          BACK
        </Button>
      </Box>
    </Box>
  );
};
 
export default AuditorsPanel;