'use client';

import * as React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  SelectChangeEvent,
  Stack,
  TextField,
  Tooltip,
  Typography,
  FormControl,
  InputLabel,
  CardHeader,
  Select,
  FormHelperText,
} from '@mui/material';
import { useSelector } from 'react-redux';
import type { RootState } from 'store/index';
import AccountInfoDropdown from '../../common/AccountInfoDropdown';
import { useTranslations } from 'next-intl';
import {
  Add as AddIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import Image from 'next/image';
import { ColIconLeft, IconPaperStack, IconFromFill, IconBinButton as IcnBin, IconChevronLastPageRight, IconChevronLastPage, IconChevronFirstPage, IconPeopleProfile, IconChevronLeft, DeleteIcon, IconChevronDown } from "lib/icons";
import DescriptionList from '../../common/DescriptionList';
import CustomerAgreementFilter from './CustomerAgreementFilter';
import CommonAccordion from 'components/common/CommonAccordion';

type Account = {
  id: string;
  accountKey: number; // Store the actual account key for easy access
  name: string;
  masked: string;
  accNumber: string;
  sortCode: string;
  bic: string;
  currency?: string;
  currencyFull?: string;
  currencyCode?: string;
  country?: string;
  countryCode?: string;
  countryDisplayName?: string;
  shortnames?: string[];
};

type Agreement = {
  id: string;
  label: string;
};

const EMPTY_AGREEMENTS: Agreement[] = [
  { id: '', label: 'No Agreement Found' },
];

const INITIAL_ASSOCIATED_ACCOUNTS: Account[] = [];

const rowsPerPageOptions = [5, 10, 25];

type Props = {
  reviewMode?: boolean;
  onEdit?: () => void;
  onCancel?: () => void;
  onSave?: () => void;
  mode?: 'view' | 'edit' | 'create';
  showAssociatedAccounts?: boolean;
  useBranchCountry?: boolean;
  title?: string;
  expandIcon?: React.ReactNode | boolean;
  initialAgreementId?: string;
  initialAgreementName?: string;
  initialSelectedAccountId?: string;
  onAgreementChange?: (agreementId: string, agreementName?: string) => void;
  onAccountChange?: (accountId: string) => void;
  onBatchChange?: (batch: Account[]) => void;
  batchAccount?: string[];
  agreementError?: string | null;
  accountError?: string | null;
  showAccountDetailsInReview?: boolean;
  actions?: React.ReactNode;
};

export default function CustomerAgreement(
  {
    reviewMode = false, onEdit, onCancel, onSave, mode,
    showAssociatedAccounts = true, useBranchCountry = false,
    expandIcon = false, initialAgreementId = '', initialAgreementName = '',
    initialSelectedAccountId = '',
    onAgreementChange, onAccountChange, onBatchChange,
    agreementError: parentAgreementError, accountError: parentAccountError,
    showAccountDetailsInReview = false,
    batchAccount,actions
  }: Readonly<Props>) {

  const { data: customerAgreementData, isLoading: agreementsLoading } = useSelector((state: RootState) => state.customerAgreement);
  const { accounts: accountList } = useSelector((state: RootState) => state.agreementAccount);
  const translateLang = useTranslations('customerAgreement');
  const title = translateLang('customerAgreement');

  const [isEditing, setIsEditing] = React.useState(mode === 'edit');
  const [agreementId, setAgreementId] = React.useState<string>(initialAgreementId);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [associatedAccounts, setAssociatedAccounts] = React.useState<Account[]>(INITIAL_ASSOCIATED_ACCOUNTS);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [page, setPage] = React.useState(1);
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
  const [selectedAccountId, setSelectedAccountId] = React.useState<string>(initialSelectedAccountId);
  const [selectedAccount, setSelectedAccount] = React.useState<Account | null>(null);
  const [filterAnchorEl, setFilterAnchorEl] = React.useState<HTMLElement | null>(null);
  const [filterAccountName, setFilterAccountName] = React.useState('');
  const [filterAccountNumber, setFilterAccountNumber] = React.useState('');
  const [filterBic, setFilterBic] = React.useState('');
  const [agreementOptions, setAgreementOptions] = React.useState<Agreement[]>(EMPTY_AGREEMENTS);
  const [agreementError, setAgreementError] = React.useState<string | null>(null);
  const [accountError, setAccountError] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (customerAgreementData) {
      setAgreementOptions(customerAgreementData);
    }
  }, [customerAgreementData]);

  React.useEffect(() => {
    // Sync isEditing with mode changes
    if (mode === 'edit') {
      setIsEditing(true);
    } else if (mode === 'view') {
      setIsEditing(false);
    }
  }, [mode]);

  React.useEffect(() => {
    if (parentAgreementError !== undefined) {
      setAgreementError(parentAgreementError);
    }
  }, [parentAgreementError]);

  React.useEffect(() => {
    if (parentAccountError !== undefined) {
      setAccountError(parentAccountError);
    }
  }, [parentAccountError]);

  // Populate associatedAccounts from batchAccount prop
  React.useEffect(() => {
    if (batchAccount && batchAccount.length > 0 && accountList && accountList.length > 0) {
      const batchAccounts = batchAccount
        .map((accountKeyStr, index) => {
          // Convert string to number
          const accountKeyNum = typeof accountKeyStr === 'string'
            ? Number.parseInt(accountKeyStr, 10)
            : accountKeyStr;

          // Find matching account in accountList
          const accountData = accountList.find(acc => acc.accountKey === accountKeyNum);

          if (!accountData) return null;

          // Transform to Account type
          const transformedAccount: Account = {
            id: `${accountData.accountKey}`,
            accountKey: accountData.accountKey,
            name: `${index + 1}. ${accountData.accountName}`,
            masked: accountData.accountNumber || '',
            accNumber: accountData.accountNumber || '',
            sortCode: accountData.sortCode || '-',
            bic: accountData.bic || '-',
            currency: accountData.currencyCode,
            currencyFull: accountData.currencyDisplayName || accountData.currencyCode,
            currencyCode: accountData.currencyCode,
            country: accountData.countryDisplayName || accountData.countryCode || '-',
            countryCode: accountData.countryCode,
            countryDisplayName: accountData.countryDisplayName ?? undefined,
            shortnames: [],
          };

          return transformedAccount;
        })
        .filter((acc) => acc !== null) as Account[];

      setAssociatedAccounts(batchAccounts);
    }
  }, [batchAccount, accountList]);

  const accountInfoOptions = React.useMemo(() => {
    if (!accountList || accountList.length === 0) {
      return [];
    }

    return accountList.map((account) => {
      const rightSide = useBranchCountry
        ? [
          { label: translateLang('branchSortCode'), value: account.sortCode || '-' },
          { label: translateLang('countryRegion'), value: account.countryDisplayName || account.countryCode || '-' },
        ]
        : [
          { label: translateLang('branchSortCode'), value: account.sortCode || '-' },
          { label: translateLang('bicSwift'), value: account.bic || '-' },
          { label: translateLang('currency'), value: account.currencyCode || '-' },
          { label: translateLang('countryRegion'), value: account.countryDisplayName || account.countryCode || '-' },
        ];

      return {
        value: account.accountKey.toString(),
        name: account.accountName || '[Account Name]',
        masked: account.accountNumber || '',
        accNumber: account.accountNumber || '',
        sortCode: account.sortCode || '-',
        bic: account.bic || '-',
        balances: rightSide,
        iconChevronDown: IconChevronDown,
      };
    });
  }, [accountList, useBranchCountry, translateLang]);

  const handleAgreementChange = (e: SelectChangeEvent<string>) => {
    const newAgreementId = e.target.value;
    setAgreementId(newAgreementId);
    if (agreementError) setAgreementError(null);

    // Find the agreement name/label
    const selectedAgreement = agreementOptions.find(opt => opt.id === newAgreementId);
    const agreementName = selectedAgreement?.label || '';

    // Notify parent of change with both id and name
    onAgreementChange?.(newAgreementId, agreementName);
  };

  const validateAgreementSection = () => {
    // Validate required selections (customer agreement + account)
    let hasError = false;
    if (!agreementId) {
      setAgreementError('Required');
      hasError = true;
    }
    if (!selectedAccountId) {
      setAccountError('Please select');
      hasError = true;
    }
    return !hasError;
  };

  const handleAddToBatch = () => {
    // Validate required selections before adding to batch
    const isValid = validateAgreementSection();
    if (!isValid) return;

    if (!accountList || accountList.length === 0) return;

    const currentAccount = accountList.find(acc => acc.accountKey.toString() === selectedAccountId);
    if (!currentAccount) return;

    const currentAccountForBatch: Account = {
      id: `${currentAccount.accountKey}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      accountKey: currentAccount.accountKey,
      name: `${associatedAccounts.length + 1}. ${currentAccount.accountName}`,
      masked: currentAccount.accountNumber || '',
      accNumber: currentAccount.accountNumber || '',
      sortCode: currentAccount.sortCode || '-',
      bic: currentAccount.bic || '-',
      currency: currentAccount.currencyCode,
      currencyFull: currentAccount.currencyDisplayName || currentAccount.currencyCode,
      country: currentAccount.countryDisplayName || currentAccount.countryCode || '-',
      shortnames: [],
    };
    const newBatch = [currentAccountForBatch, ...associatedAccounts];
    setAssociatedAccounts(newBatch);
    onBatchChange?.(newBatch);
  };
  const handleFilter = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };
  const handleCloseFilterPopup = () => {
    setFilterAnchorEl(null);
  };
  const handleAccountChange = (e: SelectChangeEvent<string>) => {
    const accountId = e.target.value;
    setSelectedAccountId(accountId);

    // Store the full account details from Redux data
    if (!accountList || accountList.length === 0) return;

    const accountData = accountList.find(acc => acc.accountKey.toString() === accountId);
    if (accountData) {
      setSelectedAccount({
        id: accountData.accountKey.toString(),
        accountKey: accountData.accountKey,
        name: accountData.accountName,
        masked: accountData.accountNumber || '',
        accNumber: accountData.accountNumber || '',
        sortCode: accountData.sortCode || '-',
        bic: accountData.bic || '-',
        currency: accountData.currencyCode,
        currencyFull: accountData.currencyDisplayName || accountData.currencyCode,
        currencyCode: accountData.currencyCode,
        country: accountData.countryDisplayName || accountData.countryCode || '-',
        countryCode: accountData.countryCode,
        countryDisplayName: accountData.countryDisplayName ?? undefined,
        shortnames: [],
      });
    }

    if (accountError) setAccountError(null);
    // Notify parent of change
    onAccountChange?.(accountId);
  };
  const handleToggleExpand = (id: string) =>
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const handleDeleteAccount = (id: string) => {
    const newBatch = associatedAccounts.filter(a => a.id !== id);
    setAssociatedAccounts(newBatch);
    onBatchChange?.(newBatch);
  };

  const filtered = associatedAccounts.filter(a => {
    const combined = [a.name, a.accNumber, a.bic, a.sortCode].join(' ').toLowerCase();
    const term = searchTerm.toLowerCase();

    const matchesSearch = term === '' || combined.includes(term);
    const matchesName = !filterAccountName || a.name.toLowerCase().includes(filterAccountName.toLowerCase());
    const matchesNumber = !filterAccountNumber || a.accNumber.toLowerCase().includes(filterAccountNumber.toLowerCase());
    const matchesBic = !filterBic || a.bic.toLowerCase().includes(filterBic.toLowerCase());

    return matchesSearch && matchesName && matchesNumber && matchesBic;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const start = (page - 1) * rowsPerPage;
  const currentSlice = filtered.slice(start, start + rowsPerPage);

  React.useEffect(() => {
    // reset page if filter shrinks result
    if (page > totalPages) setPage(1);
  }, [filtered.length, rowsPerPage, totalPages, page]);

  // Initialize selected account from initialSelectedAccountId
  React.useEffect(() => {
    if (initialSelectedAccountId && !selectedAccount) {
      const account = accountInfoOptions.find(opt => opt.value === initialSelectedAccountId);
      if (account && accountList) {
        const accountData = accountList.find(acc => acc.accountKey.toString() === account.value);
        if (accountData) {
          setSelectedAccount({
            id: account.value,
            accountKey: accountData.accountKey,
            name: account.name,
            masked: account.masked,
            accNumber: account.accNumber,
            sortCode: account.sortCode,
            bic: account.bic,
            currency: accountData.currencyCode,
            currencyFull: accountData.currencyDisplayName || accountData.currencyCode,
            currencyCode: accountData.currencyCode,
            country: accountData.countryDisplayName || accountData.countryCode,
            countryCode: accountData.countryCode,
            countryDisplayName: accountData.countryDisplayName ?? undefined,
            shortnames: [],
          });
        }
      }
    }
  }, [initialSelectedAccountId, accountInfoOptions, selectedAccount, accountList]);

  const effectiveReviewMode = reviewMode && !isEditing;
  const isReadOnly = effectiveReviewMode;
  // Use initialAgreementName if provided, otherwise search in agreementOptions, otherwise use placeholder
  const agreementLabel = initialAgreementName ||
    (agreementId && agreementOptions.find(a => a.id === agreementId)?.label) ||
    '[Selected customer agreement]';
  const detailsItems = [
    { label: 'Customer agreement', value: agreementLabel },
  ];


  return (
    <CommonAccordion
      title={title}
      icon={<Image src={IconFromFill} alt="form icon" width={24} height={24} />}
      reviewMode={reviewMode}
      isEditing={isEditing}
      onEdit={() => {
        setIsEditing(true);
      }}
      onCancel={() => {
        onCancel?.();
        setIsEditing(false);
      }}
      onSave={() => {
        // Validate before saving; only exit edit mode when valid
        const isValid = validateAgreementSection();
        if (!isValid) return;

        onSave?.();
        setIsEditing(false);
      }}
      border={false}
      disableGutters={false}
      detailsSx={{ p: { xs: 1.5, md: 2 } }}
      expandIcon={expandIcon}
      sx={{ 
        borderRadius: '0.75rem',
        overflow: 'hidden',
        '&.MuiAccordion-root': {
          borderRadius: '0.75rem',
        }
      }}
      actions={actions}

    >
      {/* Save/Cancel buttons in edit mode */}

      <CardContent sx={{ p: '0.75rem', position: 'relative' }}>
        {/* Customer agreement select & current account row */}
        <Stack spacing={2}>
          {isReadOnly && (
            <Box>
              <DescriptionList items={detailsItems} />
              {showAccountDetailsInReview && <Box sx={{ mt: 2 }}>
                <Stack spacing={0.75}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '1.125rem', fontWeight: 400 }}>
                    Account details
                  </Typography>
                  <Stack spacing={0.5}>
                    <Typography sx={{ fontSize: '1.25rem', fontWeight: 500 }}>
                      {selectedAccount?.name || '[Account Name]'}
                    </Typography>
                    <Typography sx={{ fontSize: '1.25rem', fontWeight: 500 }}>
                      {selectedAccount?.accNumber || '[Account number]'}
                    </Typography>
                    <Typography sx={{ fontSize: '1.25rem', fontWeight: 500 }}>
                      {selectedAccount?.sortCode || '[Branch / Sort code]'}
                    </Typography>
                    <Typography sx={{ fontSize: '1.25rem', fontWeight: 500 }}>
                      {selectedAccount?.currency || selectedAccount?.currencyCode || '-'}
                    </Typography>
                    <Typography sx={{ fontSize: '1.25rem', fontWeight: 500 }}>
                      {selectedAccount?.country || selectedAccount?.countryCode || selectedAccount?.countryDisplayName || '-'}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
              }
            </Box>
          )}

          {!isReadOnly && (

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl sx={{ width: '100%', '& .MuiOutlinedInput-root': { height: '3.5rem', borderRadius: '0.5rem' } }} error={Boolean(agreementError)} required>
                  <InputLabel
                    id="agreement-label"
                    error={Boolean(agreementError)}
                    required
                  >
                    {translateLang('customerAgreement')}
                  </InputLabel>
                  <Select
                    labelId="agreement-label"
                    value={agreementId}
                    label={translateLang('customerAgreement')}
                    onChange={handleAgreementChange}
                    error={Boolean(agreementError)}
                    disabled={agreementsLoading}
                    sx={{ '& .MuiSelect-icon': { color: '#0051FF' } }}
                  >
                    {agreementOptions.map(a => (
                      <MenuItem key={a.id} value={a.id}>
                        {a.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {agreementError && (
                    <FormHelperText>{agreementError}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }} />
              <Grid size={{ xs: 12, md: 12 }} sx={{ mt: '0.5rem' }}>
                <Box
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '0.5rem',
                      minHeight: '56px !important',
                      maxHeight: '56px !important',
                      height: '56px !important',
                    },
                    '& .MuiInputBase-root': {
                      minHeight: '56px !important',
                      maxHeight: '56px !important',
                      height: '56px !important',
                    },
                    '& .MuiFormControl-root': {
                      minHeight: '56px !important',
                      maxHeight: '56px !important',
                      height: '56px !important',
                    },
                  }}
                >
                  <AccountInfoDropdown
                    label={translateLang('selectAnAccount')}
                    value={selectedAccountId}
                    options={accountInfoOptions}
                    onChange={handleAccountChange}
                    iconChevronDown={IconChevronDown}
                    fullWidth
                    error={Boolean(accountError)}
                    helperText={accountError || undefined}
                    required
                  />
                </Box>
              </Grid>
            </Grid>
          )}
        </Stack>
        {/* Add to batch button (only when associated accounts are enabled) */}
        {showAssociatedAccounts && !isReadOnly && (
          <Box sx={{ mt: 2, mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Tooltip title={translateLang('addCurrentAccountToBatch')}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddToBatch}
                style={{ height: '2.75rem', borderRadius: '0.5rem' }}
              // disabled={batchCount > 0}
              >
                {translateLang('addToBatch')}
              </Button>
            </Tooltip>
          </Box>
        )}

        {/* Associated accounts */}
        {showAssociatedAccounts && (
          <Card variant="outlined" sx={{ mt: 3 ,borderRadius:'0.75rem',mb:0}}>
            <CardHeader
              title={
                <Grid container alignItems="center"  >
                  <Grid size={{ xs: 12, md: 7 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Image src={IconPaperStack} alt="stack icon" width={28} height={28} />
                      <Typography variant="subtitle1" fontWeight={400} sx={{ fontSize: '1.25rem' }}>{translateLang('associatedAccounts')}</Typography>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12, md: 5 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid size={{ xs: 12, md: 10 }}>
                        <TextField
                          size="small"
                          fullWidth
                          placeholder={translateLang('searchWithinBatch')}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '0.5rem',
                            },
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 2 }} sx={{ display: 'flex', justifyContent: { xs: 'flex-end', md: 'flex-end' }, mt: { xs: 1, md: 0 } }}>
                        <Button
                          size="small"
                          variant="text"
                          startIcon={<Image src={ColIconLeft} alt="filter" width={20} height={20} />}
                          onClick={handleFilter}
                          sx={{ fontWeight: 600 }}
                        >
                          {translateLang('filter')}
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              }
              sx={{ alignItems: 'flex-start' }}
            />
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ backgroundColor: '#F8F8FA', p: '0.75rem' }}>
                <Stack spacing={1.2}>
                  {currentSlice.map((acc) => {
                    const isOpen = !!expanded[acc.id];
                    return (
                      <Card key={acc.id} variant="outlined">
                        <CardContent sx={{ py: 1, pb: 0, '&:last-child': { pb: 1 } }}>
                          <Grid container alignItems="center" spacing={1}>
                            <Grid size={{ xs: 12, md: 5 }}>
                              <Stack direction="row" alignItems="center" spacing={1.2}>
                                <Image src={IconPeopleProfile} alt="profile" width={24} height={24} />
                                <Typography variant="subtitle2" fontWeight={600}>
                                  {acc.name}
                                </Typography>
                              </Stack>
                            </Grid>
                            <Grid size={{ xs: 12, md: 7 }}>
                              <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                                justifyContent="flex-end"
                                sx={{ color: 'text.secondary', overflow: 'hidden' }}
                              >
                                <Typography variant="body2">
                                  Acc. number: <Typography component="span" fontWeight={700} variant="body2">{acc.accNumber}</Typography>
                                </Typography>
                                <Divider orientation="vertical" flexItem sx={{ borderColor: 'grey.300' }} />
                                <Typography variant="body2">
                                  S/C: <Typography component="span" fontWeight={700} variant="body2">{acc.sortCode}</Typography>
                                </Typography>
                                <Divider orientation="vertical" flexItem sx={{ borderColor: 'grey.300' }} />
                                <Typography variant="body2">
                                  BIC (SWIFT): <Typography component="span" fontWeight={700} variant="body2">{acc.bic}</Typography>
                                </Typography>
                                {/* <Stack direction="row" spacing={0.5} alignItems="center"> */}
                                {!isReadOnly && (
                                  <IconButton size="small" aria-label="Delete account" onClick={() => handleDeleteAccount(acc.id)}>
                                    <Image src={DeleteIcon} alt="delete" width={20} height={20} />
                                  </IconButton>
                                )}
                                <IconButton size="small" color="primary" aria-label="Toggle details" onClick={() => handleToggleExpand(acc.id)}>
                                  <Image
                                    src={IconChevronDown}
                                    alt={isOpen ? 'collapse' : 'expand'}
                                    width={20}
                                    height={20}
                                    style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}
                                  />
                                </IconButton>
                                {/* </Stack> */}
                              </Stack>

                            </Grid>

                          </Grid>

                          {/* Expand area with account details */}
                          {isOpen && (
                            <Box sx={{ mt: 2, ml: 5, pb: 1.5 }}>
                              <Stack spacing={2}>
                                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                                  <Stack spacing={0.5}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                      Currency
                                    </Typography>
                                    <Typography variant="body2" fontWeight={600}>
                                      {acc.currencyFull || acc.currency || '-'}
                                    </Typography>
                                  </Stack>
                                  <Stack spacing={0.5}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                      Country / Region
                                    </Typography>
                                    <Typography variant="body2" fontWeight={600}>
                                      {acc.country || '-'}
                                    </Typography>
                                  </Stack>
                                </Stack>
                                {acc.shortnames && acc.shortnames.length > 0 && (
                                  <Stack spacing={0.5}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                      Shortname
                                    </Typography>
                                    <Typography variant="body2" fontWeight={600}>
                                      {acc.shortnames.join(', ')}
                                    </Typography>
                                  </Stack>
                                )}

                                {!isReadOnly && (
                                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1, borderTop: '1px solid #E5E7EB' }}>
                                    <Button
                                      variant="text"
                                      size="small"
                                      startIcon={<Image src={IcnBin} alt="Remove" width={20} height={20} />}
                                      onClick={() => handleDeleteAccount(acc.id)}
                                      sx={{
                                        fontWeight: 700,
                                        color: 'primary.main',
                                        textTransform: 'uppercase',
                                        fontSize: '14px',
                                        '&:hover': {
                                          backgroundColor: 'rgba(0, 81, 255, 0.04)',
                                        },
                                      }}
                                    >
                                      REMOVE
                                    </Button>
                                  </Box>
                                )}
                              </Stack>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </Stack>
              </Box>

              {/* Footer: pagination controls */}
              <Grid container alignItems="center" justifyContent="flex-end" sx={{ mt: 2, mr:2}}>
                <Grid size="auto">
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="caption" sx={{ fontSize: '12px' }}>{translateLang('rowsPerPage')}</Typography>
                      <Select
                        size="small"
                        value={rowsPerPage.toString()}
                        onChange={(e) => setRowsPerPage(Number.parseInt(e.target.value, 10))}
                        sx={{ width: 80, '& .MuiSelect-icon': { color: '#0051FF' } }}
                      >
                        {rowsPerPageOptions.map(n => (
                          <MenuItem key={n} value={n.toString()}>{n}</MenuItem>
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
                      <Typography variant="caption" sx={{ ml: 1, fontSize: '12px' }}>
                        {filtered.length === 0
                          ? translateLang('zeroOfZeroListItems')
                          : `${start + 1} - ${Math.min(start + rowsPerPage, filtered.length)} ${translateLang('of')} ${filtered.length} ${translateLang('listItems')}`}
                      </Typography>
                    </Stack>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Filter popup */}
        <CustomerAgreementFilter
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          accountName={filterAccountName}
          accountNumber={filterAccountNumber}
          bic={filterBic}
          onAccountNameChange={setFilterAccountName}
          onAccountNumberChange={setFilterAccountNumber}
          onBicChange={setFilterBic}
          onCancel={handleCloseFilterPopup}
          onApply={handleCloseFilterPopup}
        />
      </CardContent>
    </CommonAccordion>
  );
}
