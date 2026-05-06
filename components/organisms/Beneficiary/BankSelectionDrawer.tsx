'use client';

import * as React from 'react';
import {
  Box,
  Typography,
  InputAdornment,
  Radio,
  TextField,
  MenuItem,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { Button } from 'dist/standard-bank-react';
import SelectField from '@atoms/Select/Select';
import Image from 'next/image';
import {
  CloseBlue,
  IcnBranch,
  IcnAccountTile,
  IconChevronDown,
  IconChevronUp,
  IconChevronFirstPage,
  IconChevronLastPage,
  IconChevronLastPageRight,
  IconChevronLeft,
  SearchIcon,
} from 'lib/icons';
import { buildTestId } from 'src/utils/testIds';
import { get } from 'lib/api/httpClient';
import { API_ROUTES } from 'lib/utils/apiRoute';
import { getCountries } from 'lib/api/beneficiaryApi';

export interface BankSelectionDetails {
  bankName: string;
  countryCode: string;
  countryRegion: string;
  bic: string;
  city: string;
  branchName: string;
}

interface BankSelectionDrawerProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (selection: BankSelectionDetails) => void;
  initialSelection?: BankSelectionDetails | null;
  testIdPrefix?: string;
}

type BankRow = BankSelectionDetails & { id: number };

const ROWS_PER_PAGE = 8;

function BankSelectionDrawer({
  open,
  title,
  onClose,
  onSubmit,
  initialSelection,
  testIdPrefix = 'beneficiary-bank-selection-drawer',
}: BankSelectionDrawerProps) {
  const [expandedId, setExpandedId] = React.useState<number | null>(null);
  const [selectedId, setSelectedId] = React.useState<number | null>(null);
  const [page, setPage] = React.useState(1);
  const [bankNameInput, setBankNameInput] = React.useState('');
  const [countryInput, setCountryInput] = React.useState('');
  const [bankNameSortOrder, setBankNameSortOrder] = React.useState<'asc' | 'desc'>('asc');
  
  // API state
  const [countryOptions, setCountryOptions] = React.useState<Array<{ label: string; value: string }>>([]);
  const [bankRows, setBankRows] = React.useState<BankRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searchError, setSearchError] = React.useState<string | null>(null);
  const [hasSearched, setHasSearched] = React.useState(false);

  // Fetch countries on mount
  React.useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await getCountries();
        const options = [
          { label: 'Select country', value: '' },
          ...(response as any).countries.map((country: any) => ({
            label: country.name || country.label || country.countryName,
            value: country.code || country.value || country.countryCode,
          })),
        ];
        setCountryOptions(options);
      } catch (error) {
        console.error('Failed to fetch countries:', error);
        // Fallback to basic options
        setCountryOptions([
          { label: 'Select country', value: '' },
          { label: 'South Africa', value: 'ZA' },
          { label: 'United Kingdom', value: 'GB' },
          { label: 'United States', value: 'US' },
        ]);
      }
    };
    fetchCountries();
  }, []);

  React.useEffect(() => {
    if (!open) return;

    // Reset all state when drawer opens
    setSelectedId(null);
    setExpandedId(null);
    setPage(1);
    setBankNameInput('');
    setCountryInput('');
    setBankNameSortOrder('asc');
    setBankRows([]);
    setHasSearched(false);
    setSearchError(null);
  }, [open]);

  // Search banks API call
  const searchBanks = React.useCallback(async () => {
    // Validate country is selected
    if (!countryInput || countryInput.trim() === '') {
      setSearchError('Please select a country before searching');
      return;
    }

    setSearchError(null);
    setLoading(true);
    setHasSearched(true);

    try {
      const params: any = {
        countryCode: countryInput.trim(),
      };

      if (bankNameInput && bankNameInput.trim()) {
        params.bankName =bankNameInput.trim();
      }

      const response = await get<any>('/bolapi/payments/v1/beneficiaries/banks', { params });

      // Parse the response - API returns biCodes array
      const banks = response?.biCodes || [];
      
      const transformedBanks: BankRow[] = banks.map((bank: any, index: number) => ({
        id: index + 1,
        bankName: bank.institutionName || bank.bankName || '',
        countryCode: bank.countryCode || '',
        countryRegion: bank.countryName || '',
        bic: bank.bicCode || bank.bic || '',
        city: bank.cityName || bank.city || '',
        branchName: bank.preferredBranchName || bank.branchName || '',
      }));

      setBankRows(transformedBanks);
      setPage(1);
    } catch (error: any) {
      console.error('Bank search failed:', error);
      setSearchError(error?.response?.data?.message || 'Failed to search banks. Please try again.');
      setBankRows([]);
    } finally {
      setLoading(false);
    }
  }, [bankNameInput, countryInput]);

  React.useEffect(() => {
    if (!open || typeof document === 'undefined') return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.paddingRight = previousBodyPaddingRight;
    };
  }, [open]);

  const filteredRows = React.useMemo(() => {
    const rows = [...bankRows];

    rows.sort((a, b) => {
      const compare = a.bankName.localeCompare(b.bankName);
      return bankNameSortOrder === 'asc' ? compare : -compare;
    });

    return rows;
  }, [bankRows, bankNameSortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / ROWS_PER_PAGE));

  const paginatedRows = React.useMemo(() => {
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * ROWS_PER_PAGE;
    const end = start + ROWS_PER_PAGE;
    return filteredRows.slice(start, end);
  }, [page, totalPages, filteredRows]);

  React.useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const selectedRow = React.useMemo(
    () => bankRows.find((row) => row.id === selectedId) || null,
    [selectedId, bankRows],
  );

  if (!open) {
    return null;
  }

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          bgcolor: 'rgba(0,0,0,0.25)',
          zIndex: 1300,
        }}
        onClick={onClose}
        data-testid={buildTestId(testIdPrefix, 'overlay')}
      />
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: { xs: '100%', md: 780 },
          height: '100dvh',
          bgcolor: '#FFFFFF',
          boxShadow: '-4px 0 16px rgba(15, 35, 52, 0.24)',
          zIndex: 1400,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'hidden',
          overflowX: 'hidden',
        }}
        data-testid={buildTestId(testIdPrefix, 'panel')}
      >
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
            <Image src={IcnBranch} alt="Bank details" width={24} height={24} />
            <Typography sx={{ fontSize: '18px', fontWeight: 400, color: '#222E37' }}>
              {title}
            </Typography>
          </Box>
          <Box sx={{ cursor: 'pointer' }} onClick={onClose}>
            <Image src={CloseBlue} alt="Close" width={18} height={18} />
          </Box>
        </Box>

        <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ px: 3, pb: 3 }}>
          <Box
            sx={{
              borderRadius: 2,
              border: '1px solid #E0E5EB',
              bgcolor: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
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
                  <Image src={IcnAccountTile} alt="Select bank" width={24} height={24} />
                  <Typography sx={{ fontSize: '18px', fontWeight: 600, color: '#222E37' }}>
                    Select bank
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>

                <Box
                  sx={{
                    px: 3,
                    pt: '16px',
                    pb: '16px',
                    borderBottom: '1px solid #E0E5EB',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 2,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      name="bankNameSearch"
                      placeholder="Bank name"
                      value={bankNameInput}
                      onChange={(event) => {
                        setBankNameInput(event.target.value);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          searchBanks();
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Image src={SearchIcon} alt="Search" width={18} height={18} />
                          </InputAdornment>
                        ),
                      }}
                      variant="outlined"
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          height: '52px',
                        },
                        '& .MuiOutlinedInput-input': {
                          paddingTop: '14px',
                          paddingBottom: '14px',
                        },
                      }}
                    />
                  </Box>
                  <Box sx={{ width: 240, minWidth: 200 }}>
                    <TextField
                      select
                      name="bankCountryFilter"
                      value={countryInput || ''}
                      onChange={(event) => {
                        setCountryInput(String(event.target.value || ''));
                        setSearchError(null);
                      }}
                      variant="outlined"
                      fullWidth
                      required
                      error={searchError === 'Please select a country before searching'}
                      SelectProps={{
                        displayEmpty: true,
                        renderValue: (value: unknown) => {
                          if (!value) return 'Select country *';
                          const selected = countryOptions.find(
                            (option) => String(option.value) === String(value),
                          );
                          return selected?.label || 'Select country';
                        },
                        MenuProps: {
                          sx: {
                            zIndex: 1701,
                          },
                          PaperProps: {
                            sx: {
                              zIndex: 1701,
                            },
                          },
                        },
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          height: '52px',
                        },
                        '& .MuiSelect-select': {
                          display: 'flex',
                          alignItems: 'center',
                          minHeight: '0 !important',
                          paddingTop: '0 !important',
                          paddingBottom: '0 !important',
                          color: countryInput ? '#222E37' : '#5C6C80',
                        },
                      }}
                      data-testid={buildTestId(testIdPrefix, 'country-filter')}
                    >
                      {countryOptions.map((option) => (
                        <MenuItem key={String(option.value)} value={String(option.value)}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                  <Button
                    buttonVariant="secondary"
                    onClick={searchBanks}
                    disabled={loading}
                    style={{
                      height: '52px',
                      minHeight: '52px',
                      minWidth: '52px',
                      width: '52px',
                      padding: 0,
                    }}
                    data-testid={buildTestId(testIdPrefix, 'search')}
                  >
                    {loading ? (
                      <CircularProgress size={20} sx={{ color: '#0051FF' }} />
                    ) : (
                      <Image src={SearchIcon} alt="Search" width={20} height={20} />
                    )}
                  </Button>
                </Box>

            {/* Error message */}
            {searchError && (
              <Box sx={{ px: 3, py: 2, backgroundColor: '#FEF2F2' }}>
                <Typography sx={{ fontSize: '14px', color: '#DC2626' }}>
                  {searchError}
                </Typography>
              </Box>
            )}

            {/* No results message */}
            {hasSearched && !loading && bankRows.length === 0 && !searchError && (
              <Box sx={{ px: 3, py: 4, textAlign: 'center' }}>
                <Typography sx={{ fontSize: '14px', color: '#5C6C80' }}>
                  No banks found. Please try a different search.
                </Typography>
              </Box>
            )}

            {/* Results */}
            {bankRows.length > 0 && (
              <>
            <Box
              sx={{
                px: 3,
                py: 1.5,
                borderBottom: '1px solid #E0E5EB',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Box
                sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }}
                onClick={() =>
                  setBankNameSortOrder((previous) => (previous === 'asc' ? 'desc' : 'asc'))
                }
                data-testid={buildTestId(testIdPrefix, 'sort-bank-name')}
              >
                <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#5C6C80' }}>
                  Bank name
                </Typography>
                <Image
                  src={bankNameSortOrder === 'asc' ? IconChevronUp : IconChevronDown}
                  alt="Sort bank name"
                  width={14}
                  height={14}
                />
              </Box>
              <Box sx={{ width: 220, textAlign: 'right' }}>
                <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#5C6C80' }}>
                  Country / Region
                </Typography>
              </Box>
            </Box>

            <Box>
              {paginatedRows.map((row) => {
                const isExpanded = expandedId === row.id;
                const isSelected = selectedId === row.id;

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
                      <Box
                        sx={{
                          width: 44,
                          display: 'flex',
                          justifyContent: 'flex-start',
                          alignItems: 'center',
                        }}
                      >
                        <Radio
                          checked={isSelected}
                          onClick={(event) => event.stopPropagation()}
                          onChange={() => setSelectedId(row.id)}
                          sx={{
                            color: '#0051FF',
                            '&.Mui-checked': {
                              color: '#0051FF',
                            },
                            padding: 0,
                          }}
                          data-testid={buildTestId(testIdPrefix, 'row-select', row.id)}
                        />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontSize: '14px', color: '#222E37' }}>
                          {row.bankName}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          width: 220,
                          textAlign: 'right',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          gap: 1,
                        }}
                      >
                        <Typography sx={{ fontSize: '14px', color: '#222E37' }}>
                          {row.countryRegion}
                        </Typography>
                        <Image
                          src={isExpanded ? IconChevronUp : IconChevronDown}
                          alt={isExpanded ? 'Collapse' : 'Expand'}
                          width={16}
                          height={16}
                        />
                      </Box>
                    </Box>

                    {isExpanded ? (
                      <Box
                        sx={{
                          px: 3,
                          pb: 2.25,
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          columnGap: 6,
                          rowGap: 2,
                          color: '#222E37',
                        }}
                      >
                        <Box>
                          <Typography sx={{ color: '#5C6C80', mb: 0.5, fontSize: '13px' }}>
                            BIC (SWIFT)
                          </Typography>
                          <Typography sx={{ fontSize: '18px', lineHeight: '28px' }}>{row.bic}</Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ color: '#5C6C80', mb: 0.5, fontSize: '13px' }}>City</Typography>
                          <Typography sx={{ fontSize: '18px', lineHeight: '28px' }}>{row.city}</Typography>
                        </Box>
                        <Box sx={{ gridColumn: '1 / 2' }}>
                          <Typography sx={{ color: '#5C6C80', mb: 0.5, fontSize: '13px' }}>
                            Branch name
                          </Typography>
                          <Typography sx={{ fontSize: '18px', lineHeight: '28px' }}>
                            {row.branchName}
                          </Typography>
                        </Box>
                      </Box>
                    ) : null}
                  </Box>
                );
              })}
            </Box>

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
                    name="bankSelectionSkipToPage"
                    value={page}
                    onChange={(_, value) => {
                      const pageNum = Number(value) || 1;
                      setPage(Math.min(Math.max(pageNum, 1), totalPages));
                    }}
                    options={Array.from({ length: totalPages }).map((_, index) => ({
                      label: String(index + 1),
                      value: index + 1,
                    }))}
                    height={40}
                    dataTestId={buildTestId(testIdPrefix, 'skip-page')}
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <IconButton size="small" onClick={() => setPage(1)} disabled={page === 1}>
                  <Image src={IconChevronFirstPage} alt="First" width={20} height={20} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => setPage((previous) => Math.max(previous - 1, 1))}
                  disabled={page === 1}
                >
                  <Image src={IconChevronLeft} alt="Previous" width={20} height={20} />
                </IconButton>
                <Typography sx={{ fontSize: '12px', color: '#0051FF', fontWeight: 600 }}>
                  {page}
                </Typography>
                {totalPages >= 2 ? (
                  <Typography sx={{ fontSize: '12px', color: '#222E37' }}>
                    {page === 1 ? 2 : 1}
                  </Typography>
                ) : null}
                <IconButton
                  size="small"
                  onClick={() => setPage((previous) => Math.min(previous + 1, totalPages))}
                  disabled={page === totalPages}
                >
                  <Image src={IconChevronLastPageRight} alt="Next" width={20} height={20} />
                </IconButton>
                <IconButton size="small" onClick={() => setPage(totalPages)} disabled={page === totalPages}>
                  <Image src={IconChevronLastPage} alt="Last" width={20} height={20} />
                </IconButton>
                <Typography sx={{ fontSize: '12px', color: '#5C6C80', ml: 1 }}>
                  {(page - 1) * ROWS_PER_PAGE + 1} - {Math.min(page * ROWS_PER_PAGE, filteredRows.length)} of{' '}
                  {filteredRows.length}
                </Typography>
              </Box>
                </Box>
              </>
            )}
              </Box>
          </Box>
        </Box>

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
            startIcon={<Image src={CloseBlue} alt="Cancel" width={20} height={20} />}
            data-testid={buildTestId(testIdPrefix, 'cancel')}
          >
            CANCEL
          </Button>
          <Button
            buttonVariant="primary"
            onClick={() => {
              if (!selectedRow) return;
              onSubmit({
                bankName: selectedRow.bankName,
                countryCode: selectedRow.countryCode,
                countryRegion: selectedRow.countryRegion,
                bic: selectedRow.bic,
                city: selectedRow.city,
                branchName: selectedRow.branchName,
              });
            }}
            disabled={!selectedRow}
            data-testid={buildTestId(testIdPrefix, 'submit')}
          >
            SUBMIT
          </Button>
        </Box>
      </Box>
      </Box>
    </>
  );
}

export default BankSelectionDrawer;
