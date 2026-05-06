'use client';

import * as React from 'react';
import {
  Autocomplete,
  Grid,
  TextField,
  Box,
} from '@mui/material';
import { AutocompleteField, AutocompleteFieldOption } from '../../common/AutocompleteField';
import {Account} from "./index"
import { useTranslations } from 'next-intl';
type Agreement = {
  id: string;
  label: string;
};



export interface CustomerAgreementSelectorProps {

  agreementValue: string;

  accountValue: string;

  onAgreementChange: (value: string) => void;

  onAccountChange: (value: string) => void;

  agreementError?: string;

  accountError?: string;

  agreementLabel?: string;

  accountLabel?: string;

  agreementPlaceholder?: string;

  accountPlaceholder?: string;

  agreements?: Agreement[];

  accounts?: Account[];

  spacing?: number;

  disabled?: boolean;

  agreementDisabled?: boolean;

  accountDisabled?: boolean;
}

const DEFAULT_AGREEMENTS: Agreement[] = [
  { id: 'a1', label: 'Retail Agreement A' },
  { id: 'a2', label: 'Corporate Agreement B' },
  { id: 'a3', label: 'Vendor Agreement C' },
];

const DEFAULT_ACCOUNTS: Account[] = [
  { 
    id: 'current', 
    name: '[Account Name]', 
    masked: 'XXXXXXX', 
    accNumber: '123456789', 
    sortCode: 'XX-XX-XX', 
    bic: '12345',
    currency: 'ZAR',
    currencyFull: 'South African Rand (ZAR)',
    country: 'South Africa',
  },
  { 
    id: '1', 
    name: '1. [Account name]', 
    masked: 'XXXXXXX', 
    accNumber: '123456789', 
    sortCode: 'XX-XX-XX', 
    bic: '12345',
    currency: 'ZAR',
    currencyFull: 'South African Rand (ZAR)',
    country: 'South Africa',
  },
  { 
    id: '2', 
    name: '2. [Account name]', 
    masked: 'XXXXXXX', 
    accNumber: '123456789', 
    sortCode: 'XX-XX-XX', 
    bic: '12345',
    currency: 'ZAR',
    currencyFull: 'South African Rand (ZAR)',
    country: 'South Africa',
  },
];

export default function CustomerAgreementSelector({
  agreementValue,
  accountValue,
  onAgreementChange,
  onAccountChange,
  agreementError,
  accountError,
  agreementLabel,
  accountLabel,
  agreementPlaceholder,
  accountPlaceholder,
  agreements = DEFAULT_AGREEMENTS,
  accounts = DEFAULT_ACCOUNTS,
  spacing = 2,
  disabled = false,
  agreementDisabled = false,
  accountDisabled = false,
}: CustomerAgreementSelectorProps) {
  const translateLang = useTranslations('collectionTypesHubData');
  
  const finalAgreementLabel = agreementLabel || translateLang('customerAgreement');
  const finalAccountLabel = accountLabel || translateLang('selectAccount');
  const finalAgreementPlaceholder = agreementPlaceholder || translateLang('selectCustomerAgreement');
  const finalAccountPlaceholder = accountPlaceholder || translateLang('pleaseSelectAnAccount');

  const selectedAgreement = agreements.find(a => a.id === agreementValue) || null;
  const accountOptions: AutocompleteFieldOption[] = React.useMemo(() => {
    return accounts.map(account => {
      return {
        label: account.name,
        value: account.id,
        subtitle: account.masked,
        metadata: [
          { label: translateLang('branchSortCode'), value: account.sortCode },
          { label: translateLang('countryRegion'), value: account.country || '[Country / Region]' },
        ],
      };
    });
  }, [accounts, translateLang]);

  return (
    <Grid container spacing={spacing} style={{paddingBottom:"16px"}}>
      <Grid size={{ xs: 12, md: 6 }} sx={{ mt: '1.5rem' }}>
        <Autocomplete<Agreement>
          options={agreements}
          value={selectedAgreement}
          onChange={(_, newValue) => onAgreementChange(newValue?.id || '')}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          disabled={disabled || agreementDisabled}
          renderInput={(params) => (
            <TextField
              {...params}
              label={finalAgreementLabel}
              placeholder={finalAgreementPlaceholder}
              error={Boolean(agreementError)}
              helperText={agreementError || ''}
              InputProps={{ ...params.InputProps, sx: { borderRadius: '0.5rem' } }}
            />
          )}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }} />
      <Grid size={{ xs: 12, md: 12 }} sx={{ mt: '1.5rem' }}>
        <Box
          sx={{
            '& .MuiOutlinedInput-root': { 
              borderRadius: '8px',
              minHeight: '60px !important',
              maxHeight: '60px !important',
              height: '60px !important',
            },
            '& .MuiInputBase-root': {
              minHeight: '60px !important',
              maxHeight: '60px !important',
              height: '60px !important',
            },
            '& .MuiFormControl-root': {
              minHeight: '60px !important',
              maxHeight: '60px !important',
              height: '60px !important',
            },
          }}
        >
          <AutocompleteField
            label={finalAccountLabel}
            placeholder={finalAccountPlaceholder}
            value={accountValue}
            options={accountOptions}
            onChange={onAccountChange}
            error={Boolean(accountError)}
            helperText={accountError || ''}
            disabled={accountDisabled}
            rich={true}
          />
        </Box>
      </Grid>
    </Grid>
  );
}
