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
import { useAppDispatch, useAppSelector } from '@lib/hooks/useAppDispatch';
import { updateBeneficiary, updateBeneficiaryObject } from '@store/slices/createBeneficiarySlice';
import { buildTestId } from 'src/utils/testIds';
import { useTranslations } from 'next-intl';

interface VerifiedAccountProps {
  onNext?: () => void;
  onCancel?: () => void;
  step?: number;
}

function VerifiedAccount({ onNext, onCancel, step }: VerifiedAccountProps) {
  const dispatch = useAppDispatch();
  const beneficiary = useAppSelector((state) => state.createBeneficiary.beneficiary);
 

  const handleChange = (field: string, value: any) => {
    dispatch(updateBeneficiary({ field, value }));
  };


  const [accountOptions, setAccountOptions] = useState<AccountInfoOption[]>([]);
  const [rawAccounts, setRawAccounts] = useState<any[]>([]);
  const verifiedAccounts = useAppSelector((state) => state.createBeneficiary.verifiedAccounts);

  const buildBalances = (item: any) => [
    { label: 'Account Type', value: item?.accountType || '' },
    { label: 'Country', value: item?.country || '' },
    { label: 'Sort Code', value: item?.sortCode || '' },
    { label: 'BIC / SWIFT', value: item?.bicCode || '' },
  ];

  const loadAccounts = useCallback(() => {
    if (accountOptions.length > 0) return;
    setRawAccounts(verifiedAccounts);
    const opts: AccountInfoOption[] = verifiedAccounts.map((item: any) => ({
      value: item?.accountNumber,
      name: item?.accountType,
      masked: item?.accountNumber ? `XXXX${item?.accountNumber.slice(-4)}` : '',
      accNumber: item?.accountNumber,
      sortCode: item?.sortCode,
      bic: item?.bicCode,
      balances: buildBalances(item),
      iconChevronDown: IconChevronDown,
    }));
    setAccountOptions(opts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountOptions.length]);

  // When verified account is selected, populate Redux with all fields
  useEffect(() => {
    if (beneficiary.verifiedAccount) {
      const accountTypeMap: Record<string, string> = {
        'current': 'CURRENT ACCOUNTS',
        'savings': 'SAVINGS ACCOUNTS',
        'current / cheque': 'CURRENT (CHEQUE) ACCOUNTS',
        'transmission': 'TRANSMISSION ACCOUNTS',
        'bond': 'BOND ACCOUNTS',
        'other': 'OTHER',
        'subscription share': 'SUBSCRIPTION SHARE ACCOUNTS',
      }
      const selected = rawAccounts.find((a) => a?.accountNumber === beneficiary.verifiedAccount);
      if (selected) {
        dispatch(updateBeneficiary({ field: 'counterPartyName', value: selected?.surname || '' }));
        dispatch(updateBeneficiary({ field: 'financialInstitutionName', value: selected?.bankName || '' }));
        dispatch(updateBeneficiary({ field: 'branchSortCode', value: selected?.sortCode || '' }));
        dispatch(updateBeneficiary({ field: 'bic', value: selected?.bicCode || '' }));
        dispatch(updateBeneficiary({ field: 'accountNumber', value: selected?.accountNumber || '' }));
        dispatch(updateBeneficiary({ field: 'accountType', value: accountTypeMap[selected?.accountType?.trim().toLowerCase()] || '' }));
        dispatch(updateBeneficiary({ field: 'bankCountryCode', value: selected?.country || 'ZA' }));
        dispatch(updateBeneficiaryObject({ path: ['counterPartyAddress', 'addressLine1'], value: selected?.addressLine1 || '' }));
      }
    }
  }, [beneficiary.verifiedAccount, rawAccounts, dispatch]);

 const translateLang = useTranslations('debtorsHubData');
  return (
    <Box data-testid={buildTestId('beneficiary-verified-account', 'container')}>
      <UserCard
        title={translateLang('verifiedAccount')}
        icon={<Image src={GridIcon} alt="Grid Icon" width={28} height={28} />}
        testId={buildTestId('beneficiary-verified-account', 'card')}
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
              value={beneficiary.verifiedAccount || ''}
              options={accountOptions}
              onChange={(e: any) => handleChange('verifiedAccount', e.target.value)}
              iconChevronDown={IconChevronDown}
              startIcon={IconSearch}
              fullWidth
              dataTestId={buildTestId('beneficiary-verified-account', 'account-select')}
              selectProps={{
                onOpen: loadAccounts, //onCLick
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
          data-testid={buildTestId('beneficiary-verified-account', 'cancel-button')}
          startIcon={<Image src={IcnCloseIcon} alt="close" width={20} height={20} />}
          style={{ height: '48px', minHeight: '48px', width: '112px' }}
        >
          {translateLang('cancel')}
        </Button>
        <Button
          buttonVariant="primary"
          onClick={onNext}
          data-testid={buildTestId('beneficiary-verified-account', 'next-button')}
          startIcon={<ArrowForwardIcon />}
          disabled={!beneficiary.verifiedAccount}
          style={{ height: '48px', minHeight: '48px', width: '103px' }}
        >
          {translateLang('next')}
        </Button>
      </Box>
    </Box>
  );
}

export default VerifiedAccount;
