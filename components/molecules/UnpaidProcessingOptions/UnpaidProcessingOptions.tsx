
'use client';

import * as React from 'react';
import {
  Box,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  Typography
} from '@mui/material';
import {
  IconPeopleProfile,
  StackIcon,
  IconChevronLeft,
  IconChevronFirstPage,
  IconChevronLastPage,
  IconChevronLastPageRight,
} from 'lib/icons';
import SearchIcon from '@mui/icons-material/Search';
import Image from 'next/image';
import CommonAccordion from '../../common/CommonAccordion';

type OnOffOption = 'Itemised' | 'Consolidated';

export type UnpaidRow = {
  id: string | number;
  name: string;
  onUs: OnOffOption;
  offUs: OnOffOption;
};

export type UnpaidOption = {
  unpaidOptionKey: number | string;
  unpaidOptionName: string;
};

export type UnpaidProcessingState = {
  unpaidOptionName: string | number; // Can be name (string) or key (number) for backward compatibility
  rows: UnpaidRow[];
};

type Props = {
  value?: UnpaidProcessingState;
  onChange?: (next: UnpaidProcessingState) => void;
  unpaidOptions?: string[] | UnpaidOption[]; // options for the top select - backward compatible
  defaultExpanded?: boolean;
  disabled?: boolean;
  reviewMode?: boolean;
  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  pageSizeOptions?: number[];
  initialPageSize?: number;
  expandIcon?: React.ReactNode | boolean;
  loading?: boolean; // optional loading state for fetching options
  actions?: React.ReactNode;
};

const defaultUnpaidOptions: string[] = ['Populated'];

const defaultRows: UnpaidRow[] = [];

export const UnpaidProcessingOptions: React.FC<Props> = ({
  value,
  onChange,
  unpaidOptions = defaultUnpaidOptions,
  defaultExpanded = true,
  disabled = false,
  reviewMode = false,
  onEdit,
  onSave,
  onCancel,
  pageSizeOptions = [5, 10, 25],
  initialPageSize = 5,
  expandIcon = true,
  loading = false,
  actions
}) => {
  // Helper function to check if options are objects
  const isObjectOptions = (opts: string[] | UnpaidOption[]): opts is UnpaidOption[] => {
    return opts.length > 0 && typeof opts[0] === 'object';
  };

  // Helper to get display name from option
  const getOptionName = (opt: string | UnpaidOption): string => {
    return typeof opt === 'string' ? opt : opt.unpaidOptionName;
  };

  // Helper to get option value (key for objects, name for strings)
  const getOptionValue = (opt: string | UnpaidOption): string | number => {
    return typeof opt === 'string' ? opt : opt.unpaidOptionKey;
  };

  // Helper to find option name by value
  const getDisplayNameByValue = (optValue: string | number): string => {
    if (isObjectOptions(unpaidOptions)) {
      const found = unpaidOptions.find(opt => opt.unpaidOptionKey === optValue);
      return found ? found.unpaidOptionName : String(optValue);
    }
    return String(optValue);
  };
    const formatOnOffOption = (value: OnOffOption): string => {
    // Ensure first letter is capitalized
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  };
  // Local-state fallback if the component is used uncontrolled
  const defaultValue = unpaidOptions.length > 0 ? getOptionValue(unpaidOptions[0]) : '';
  const [internal, setInternal] = React.useState<UnpaidProcessingState>({
    unpaidOptionName: defaultValue,
    rows: defaultRows
  });

  const state = value ?? internal;
  const setState = (next: UnpaidProcessingState) => {
    if (onChange) onChange(next);
    setInternal(next);
  };

  // Filter & pagination state
  const [query, setQuery] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(initialPageSize);

  const filtered = React.useMemo(() => {
    if (!query.trim()) return state.rows;
    const q = query.toLowerCase();
    return state.rows.filter((r) => r.name.toLowerCase().includes(q));
  }, [state.rows, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const pagedRows = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalPages = pageCount;
  const start = (page - 1) * rowsPerPage;

  React.useEffect(() => {
    // If query changes, reset to first page
    setPage(1);
  }, [query, rowsPerPage]);

  const updateRow = (id: UnpaidRow['id'], patch: Partial<UnpaidRow>) => {
    setState({
      ...state,
      rows: state.rows.map((r) => (r.id === id ? { ...r, ...patch } : r))
    });
  };

  const removeRow = (id: UnpaidRow['id']) => {
    setState({ ...state, rows: state.rows.filter((r) => r.id !== id) });
  };

  const addRow = () => {
    const nextId = (state.rows[0]?.id ? Number(state.rows[0].id) + 1 : 1) + state.rows.length;
    setState({
      ...state,
      rows: [
        ...state.rows,
        {
          id: nextId,
          name: '[Unpaid option name]',
          onUs: 'Itemised',
          offUs: 'Itemised'
        }
      ]
    });
    setPage(pageCount); // jump to last page (optional)
  };

  const handleUnpaidOptionChange = (e: SelectChangeEvent) => {
    const value = e.target.value;
    // Convert to number if the original option was a number (object option)
    const parsedValue = !Number.isNaN(Number(value)) && isObjectOptions(unpaidOptions) ? Number(value) : value;
    setState({ ...state, unpaidOptionName: parsedValue });
  };

  const [isEditing, setIsEditing] = React.useState(false);

  const effectiveReviewMode = reviewMode && !isEditing;

  React.useEffect(() => {
    if (!reviewMode) {
      setIsEditing(false);
    }
  }, [reviewMode]);

  return (
    <CommonAccordion
      defaultExpanded={defaultExpanded}
      expandIcon={expandIcon}
      icon={<Image src={StackIcon} alt="stack icon" width={28} height={28} />}
      title={
        <Typography variant="subtitle1" sx={{ fontSize: '1.25rem', fontWeight: 400 }}>
          Unpaid processing options
        </Typography>
      }
      reviewMode={reviewMode}
      isEditing={isEditing}
      onEdit={() => {
        setIsEditing(true);
        onEdit?.();
      }}
      onCancel={() => {
        onCancel?.();
        setIsEditing(false);
      }}
      onSave={() => {
        onSave?.();
        setIsEditing(false);
      }}
      sx={{ 
        borderRadius: '0.75rem',
        overflow: 'hidden',
        '&.MuiAccordion-root': {
          borderRadius: '0.75rem',
        }
      }}
      actions={actions}
    >

        {/* Top rows: Select (6 columns) + Add Account on new right-aligned row */}
        <Box px={2} py={2}>
          <Grid container spacing={2} alignItems="center" sx={{mt:1}}>
            <Grid size={{ xs: 12, md: 6 }}>
              {effectiveReviewMode ? (
                <Stack spacing={0.5}>
                  <Typography
                    variant="body2"
                    color="text.neutral"
                    sx={{ fontSize: '1rem', fontWeight: 400 }}
                  >
                    Unpaid option name
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontSize: '1.125rem', fontWeight: 500 }}
                  >
                    {getDisplayNameByValue(state.unpaidOptionName)}
                  </Typography>
                </Stack>
              ) : (
                <FormControl fullWidth disabled={disabled || loading} sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '0.5rem',
                  },
                }}>
                  <InputLabel id="unpaid-option-name">Unpaid option name</InputLabel>
                  <Select
                    labelId="unpaid-option-name"
                    label="Unpaid option name"
                    value={String(state.unpaidOptionName)}
                    onChange={handleUnpaidOptionChange}
                  >
                    {loading ? (
                      <MenuItem value={String(state.unpaidOptionName)} disabled>
                        Loading options...
                      </MenuItem>
                    ) : (
                      unpaidOptions.map((opt) => (
                        <MenuItem key={String(getOptionValue(opt))} value={String(getOptionValue(opt))}>
                          {getOptionName(opt)}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              )}
            </Grid>
          </Grid>

           
        </Box>

        {/* Search + Filter + Table inside card */}
        <Box px={2} pb={2}>
          <Paper variant="outlined" sx={{  borderRadius: 1 }}>
            {/* Header row: left (title) 6 cols, right (search+filter) 6 cols */}
            <Grid container spacing={2} alignItems="center" sx={{ p: 2 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack direction="row" alignItems="center" spacing={1.25}>
                  <Box
                    component="img"
                    src="/icons/icn_cash_alert.svg"
                    alt="Unpaid processing options"
                    sx={{ width: 20, height: 20 }}
                  />
                  <Typography variant="subtitle2" sx={{ fontSize: '1.125rem', fontWeight: 400 }}>
                    Unpaid processing options
                  </Typography>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <OutlinedInput
                    fullWidth
                    placeholder="Search by unpaid option name"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    startAdornment={
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    }
                    sx={{
                      '& fieldset': {
                      borderRadius: '12px',
                      },
                    }}
                  />
                </Stack>
              </Grid>
            </Grid>

            <Box  sx={{ backgroundColor: '#F8F8FA', p: '0.75rem', pr: 2 }}>
              <Stack spacing={1.25}>
                {loading && state.rows.length === 0 ? (
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Loading unpaid processing options...
                    </Typography>
                  </Paper>
                ) : (
                  <>
                    {pagedRows.map((row, idx) => {
                      const absoluteIndex = (page - 1) * rowsPerPage + idx;
                      const descendingNumber = filtered.length - absoluteIndex;

                      return (
                        <Paper
                          key={row.id}
                          variant="outlined"
                          sx={{ borderRadius: 1, px: 1.25, py: 1 }}
                        >
                          <Grid container alignItems="center" spacing={1}>
                            <Grid size={{ xs: 12, md: 6 }}>
                              <Stack direction="row"  alignItems="center">
                                <Image src={IconPeopleProfile} alt="profile" width={24} height={24} />

                                <Typography variant="body2" color="text.secondary" sx={{ width: 28, textAlign: 'right' }}>
                                  {descendingNumber}.
                                </Typography>
                               
                                <Typography variant="body2" sx={{ fontWeight: 400 }}>
                                  {row.name}
                                </Typography>
                              </Stack>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                              <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                                flexWrap="wrap"
                                sx={{
                                  color: 'text.secondary',
                                  justifyContent: { xs: 'flex-start', md: 'flex-end' },
                                }}
                              >
                                {[
                                  { key: 'onUs' as const, label: 'On us option:' },
                                  { key: 'offUs' as const, label: 'Off us option:' },
                                ].map((opt) => (
                                  <React.Fragment key={opt.key}>
                                    <Divider
                                      orientation="vertical"
                                      flexItem
                                      sx={{ borderColor: 'primary.main' }}
                                    />
                                     <Typography variant="body2" sx={{ fontSize: '14px' }}>
                                      {opt.label}{' '}
                                      <Typography
                                        component="span"
                                        variant="body2"
                                        fontWeight={700}
                                        color="text.primary"
                                        sx={{ fontSize: '14px' }}
                                      >
                                        {formatOnOffOption(row[opt.key])}
                                      </Typography>
                                    </Typography>
                                  </React.Fragment>
                                ))}
                              </Stack>
                            </Grid>
                          </Grid>
                        </Paper>
                      );
                    })}

                    {!pagedRows.length && (
                      <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          No items found for your search.
                        </Typography>
                      </Paper>
                    )}
                  </>
                )}
              </Stack>
            </Box>

            <Divider sx={{ my: 1.5 }} />

            <Grid container alignItems="center" justifyContent="flex-end" sx={{ mt: 2, pr: 2, mb: 2 }}>
              <Grid size="auto">
                <Stack direction="row" spacing={2} alignItems="center">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="caption" sx={{ fontSize: '12px' }}>Rows per page</Typography>
                    <Select
                      size="small"
                      value={rowsPerPage.toString()}
                      onChange={(e) => setRowsPerPage(parseInt((e.target as any).value, 10))}
                      sx={{ width: 80,fontSize: '12px','& .MuiSelect-icon': { color: '#0051FF' } }}
                    >
                      {pageSizeOptions.map(n => (
                        <MenuItem key={n} value={n.toString()} sx={{ fontSize: '12px' }}>{n}</MenuItem>
                      ))}
                    </Select>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <IconButton
                      size="small"
                      disabled={page <= 1}
                      onClick={() => setPage(1)}
                      aria-label="First page"
                    >
                      <Image src={IconChevronFirstPage} alt="first page" width={20} height={20} />
                    </IconButton>
                    <IconButton
                      size="small"
                      disabled={page <= 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      aria-label="Previous page"
                    >
                      <Image src={IconChevronLeft} alt="previous page" width={20} height={20} />
                    </IconButton>
                    
                    <Typography variant="caption" sx={{ fontSize: '12px' }}>
                      {page} 
                    </Typography>
                    <IconButton
                      size="small"
                      disabled={page >= totalPages}
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      aria-label="Next page"
                    >
                      <Image src={IconChevronLastPageRight} alt="last page" width={20} height={20} />
                    </IconButton>
                    <IconButton
                      size="small"
                      disabled={page >= totalPages}
                      onClick={() => setPage(totalPages)}
                      aria-label="Last page"
                    >
                      <Image src={IconChevronLastPage} alt="last page" width={20} height={20} />
                    </IconButton>
                    <Typography variant="caption" sx={{ fontSize: '12px' }}>
                      {filtered.length === 0
                        ? '0 of 0 list items'
                        : `${start + 1} - ${Math.min(start + rowsPerPage, filtered.length)} of ${filtered.length} list items`}
                    </Typography>
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </Box>
    </CommonAccordion>
  );
};
  