"use client";
import React, { useEffect, useState, useCallback } from 'react';
import GridIcon from 'public/icons/icn_account_tile_success.svg';
import { AccountInfoOption } from 'components/common/AccountDropDown';
import UserCard from '@atoms/UserCard/UserCard';
import Image from 'next/image';
import { Button } from 'dist/standard-bank-react';
import AccountInfoDropdown from 'components/common/AccountDropDown';
import IconChevronDown from 'public/icons/chevron_down.svg';
import IconSearch from 'public/icons/icn_search.svg';
import { Box } from '@mui/material';
import IcnCloseIcon from 'public/icons/close-icon.svg';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useDispatch, useSelector } from 'react-redux';
import { updateDebtor, updateDebtorObject } from '@store/slices/createDebtorSlice';
import { buildTestId } from 'src/utils/testIds';
import { useTranslations } from 'next-intl';

interface VerifiedAccountProps {
  onNext?: () => void;
  onCancel?: () => void;
  step?: number;
}

function VerifiedAccount({ onNext, onCancel, step }: VerifiedAccountProps) {
  const dispatch = useDispatch();
  const debtor = useSelector((state: any) => state.createDebtor.debtor);
  
  const handleChange = (field: string, value: any) => {
    dispatch(updateDebtor({ field, value }));
  };

  const [accountOptions, setAccountOptions] = useState<AccountInfoOption[]>([]);
  const [rawAccounts, setRawAccounts] = useState<any[]>([]);
  const verifiedAccounts = useSelector((state: any) => state.createDebtor.verifiedAccounts);

  // Clear verifiedAccount on mount to ensure nothing is pre-selected
  useEffect(() => {
    if (debtor.verifiedAccount) {
      dispatch(updateDebtor({ field: 'verifiedAccount', value: '' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buildBalances = (item: any) => {
    const balances = [];
    
    // Only show Sort Code and BIC/SWIFT in dropdown list
    if (item?.sortCode || item?.branchSortCode) {
      balances.push({ label: translateLang('sortCodeLabel'), value: item?.sortCode || item?.branchSortCode || '' });
    }
    
    if (item?.bicCode || item?.internationalBankBicCode || item?.bic) {
      balances.push({ label: translateLang('bicSwiftLabel'), value: item?.bicCode || item?.internationalBankBicCode || item?.bic || '' });
    }
    
    return balances;
  };

  const loadAccounts = useCallback(() => {
    if (accountOptions.length > 0) return;
    console.log('📥 Loading verified accounts:', verifiedAccounts.length);
    setRawAccounts(verifiedAccounts);
    const opts: AccountInfoOption[] = verifiedAccounts.map((item: any) => ({
      value: item?.accountNumber,
      name: item?.counterPartyName || item?.surname || '',
      masked: item?.accountNumber ? `XXXX${item?.accountNumber.slice(-4)}` : '',
      accNumber: item?.accountNumber,
      sortCode: item?.sortCode || item?.branchSortCode,
      bic: item?.bicCode || item?.internationalBankBicCode || item?.bic,
      balances: buildBalances(item),
      iconChevronDown: IconChevronDown,
    }));
    setAccountOptions(opts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountOptions.length, verifiedAccounts]);

  // Load accounts when verifiedAccounts are available
  useEffect(() => {
    if (verifiedAccounts && verifiedAccounts.length > 0 && accountOptions.length === 0) {
      loadAccounts();
    }
  }, [verifiedAccounts, accountOptions.length, loadAccounts]);

  // When verified account is selected, populate Redux with all fields
  useEffect(() => {
    if (debtor.verifiedAccount && rawAccounts.length > 0) {
      const selected = rawAccounts.find((a) => a?.accountNumber === debtor.verifiedAccount);
      console.log('🔍 Selected verified account:', selected);
      if (selected) {
        // Account type mapping (following beneficiary pattern)
        const accountTypeMap: Record<string, string> = {
          'current': 'CURRENT ACCOUNTS',
          'savings': 'SAVINGS ACCOUNTS',
          'current / cheque': 'CURRENT (CHEQUE) ACCOUNTS',
          'transmission': 'TRANSMISSION ACCOUNTS',
          'bond': 'BOND ACCOUNTS',
          'other': 'OTHER',
          'subscription share': 'SUBSCRIPTION SHARE ACCOUNTS',
        };
        
        const accountTypeValue = selected?.accountType 
          ? accountTypeMap[selected.accountType.trim().toLowerCase()] || selected.accountType.toUpperCase()
          : '';
        
        console.log('📋 Account Type from API:', selected?.accountType);
        console.log('📋 Account Type mapped value:', accountTypeValue);
        
        // Populate debtor details from verified account response
        dispatch(updateDebtor({ field: 'counterPartyName', value: selected?.counterPartyName || selected?.surname || '' }));
        dispatch(updateDebtor({ field: 'financialInstitutionName', value: selected?.bankName || selected?.financialInstitutionName || '' }));
        dispatch(updateDebtor({ field: 'branchSortCode', value: selected?.sortCode || selected?.branchSortCode || '' }));
        dispatch(updateDebtor({ field: 'bic', value: selected?.bicCode || selected?.internationalBankBicCode || selected?.bic || '' }));
        dispatch(updateDebtor({ field: 'accountNumber', value: selected?.accountNumber || '' }));
        dispatch(updateDebtor({ field: 'accountType', value: accountTypeValue }));
        dispatch(updateDebtor({ field: 'bankCountryCode', value: selected?.countryCode || selected?.bankCountryCode || 'ZA' }));
        dispatch(updateDebtor({ field: 'town', value: selected?.bankBranchAddress?.townName || '' }));
        dispatch(updateDebtor({ field: 'branchName', value: selected?.branchName || selected?.bankBranchName || '' }));
        
        console.log('✅ Dispatched accountType to Redux:', accountTypeValue);
        
        // Populate address details if available
        if (selected?.counterPartyAddress?.addressLine1) {
          dispatch(updateDebtorObject({ path: ['counterPartyAddress', 'addressLine1'], value: selected?.counterPartyAddress?.addressLine1 || '' }));
        }
        if (selected?.counterPartyAddress?.addressLine2) {
          dispatch(updateDebtorObject({ path: ['counterPartyAddress', 'addressLine2'], value: selected?.counterPartyAddress?.addressLine2 || '' }));
        }
        if (selected?.counterPartyAddress?.countryCode) {
          dispatch(updateDebtorObject({ path: ['counterPartyAddress', 'countryCode'], value: selected?.counterPartyAddress?.countryCode || '' }));
        }
        if (selected?.counterPartyAddress?.townName) {
          dispatch(updateDebtorObject({ path: ['counterPartyAddress', 'townName'], value: selected?.counterPartyAddress?.townName || '' }));
        }
        
        // Populate linked payment profiles if available
        if (selected?.linkedPaymentProfiles && Array.isArray(selected.linkedPaymentProfiles)) {
          const profileNames = selected.linkedPaymentProfiles
            .map((p: any) => p.customerPaymentProfileName)
            .filter(Boolean);
          if (profileNames.length > 0) {
            dispatch(updateDebtor({ field: 'collections', value: profileNames }));
          }
        }
      }
    }
  }, [debtor.verifiedAccount, rawAccounts, dispatch]);

  const translateLang = useTranslations('debtorsHubData');
  return (
    <Box data-testid={buildTestId('debtor-verified-account', 'container')}>
      <UserCard
        title={translateLang('verifiedAccount')}
        icon={<Image src={GridIcon} alt="Grid Icon" width={28} height={28} />}
        testId={buildTestId('debtor-verified-account', 'card')}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 2,
            marginTop: '36px',
            marginBottom: '20px',
            marginLeft: '5px',
          }}
        >
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
            <AccountInfoDropdown
              label={translateLang('searchAccounts')}
              value={debtor.verifiedAccount || ''}
              options={accountOptions}
              onChange={(e: any) => handleChange('verifiedAccount', e.target.value)}
              iconChevronDown={IconChevronDown}
              startIcon={IconSearch}
              fullWidth
              dataTestId={buildTestId('debtor-verified-account', 'account-select')}
              selectProps={{
                onOpen: loadAccounts,
              }}
            />
          </Box>
        </Box>
      </UserCard>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          mt: '20px',
          mb: '20px',
        }}
      >
        <Button
          buttonVariant="text"
          onClick={onCancel}
          data-testid={buildTestId('debtor-verified-account', 'cancel-button')}
          startIcon={<Image src={IcnCloseIcon} alt="close" width={20} height={20} />}
          style={{ height: '48px', minHeight: '48px', width: '112px' }}
        >
          {translateLang('cancel')}
        </Button>
        <Button
          buttonVariant="primary"
          onClick={onNext}
          data-testid={buildTestId('debtor-verified-account', 'next-button')}
          startIcon={<ArrowForwardIcon />}
          disabled={!debtor.verifiedAccount}
          style={{ height: '48px', minHeight: '48px', width: '103px' }}
        >
          {translateLang('next')}
        </Button>
      </Box>
    </Box>
  );
}

export default VerifiedAccount;
