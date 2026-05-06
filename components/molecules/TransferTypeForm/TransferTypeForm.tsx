'use client';

import React, {useState,useEffect} from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transferTypeZodSchema } from 'utils/transferTypeLogic';
import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid,
  Stack,
  TextField,
  Typography,
  Autocomplete,
} from '@mui/material';
import Image from 'next/image';
import { FormFillIcon } from 'lib/icons';
import CommonAccordion from '../../common/CommonAccordion';
import DescriptionList from '../../common/DescriptionList';
import CustomerAgreementSelector, { type Agreement, type Account } from '@molecules/CustomerAgreementSelector';
import { buildTestId } from 'src/utils/testIds';
import { useAppDispatch, useAppSelector } from '@lib/hooks/useAppDispatch';
import { fetchCustomerAgreement } from '@store/slices/setup-admin/commonSlice/customerAgreementSlice';
import { fetchAuthorisationProfiles } from '@store/slices/setup-admin/commonSlice/authorisationProfileSlice';
import type { RootState, AppDispatch } from 'store/index';

export type TransferTypeFormState = {
  transferTypeName: string;
  authorisationProfile: string;
  enforceAuditing?: boolean;
  payerCustomerAgreement: string;
  payerAccount: string;
  paymentCustomerAgreement: string;
  paymentAccount: string;
};

interface Props {
  form: TransferTypeFormState;
  errors: Record<string, string>;
  submitting: boolean;
  onFormChange: (form: TransferTypeFormState) => void;
  status: { ok?: boolean; message?: string };
  onEdit?: () => void;
  mode?: 'view' | 'edit' | 'create';
  onValidSubmit?: (data: TransferTypeFormState) => void;
  onSave?: (data: TransferTypeFormState) => void;
  onCancel?: () => void;
  reviewMode?: boolean;
  initialEditingSection?: string | null;
  payerAccounts: Account[];
  paymentAccounts: Account[];
  accountsLoading: boolean;
  onSetFetchQueue: React.Dispatch<React.SetStateAction<Array<{ agreement: string; type: 'payer' | 'payment' }>>>;
  testIdPrefix?: string;
}

const SERVICE='InterAccountTransfer';
// Removed hardcoded CUSTOMER_AGREEMENTS - now fetched dynamically from Redux
// Removed hardcoded ACCOUNTS - now fetched dynamically from Redux

export default function TransferTypeForm({
  form,
  errors: _errors,
  submitting,
  onFormChange,
  status,
  onEdit,
  mode,
  onSave,
  onCancel,
  onValidSubmit,
  reviewMode = false,
  initialEditingSection = null,
  payerAccounts,
  paymentAccounts,
  accountsLoading,
  onSetFetchQueue,
  testIdPrefix = 'transfer-type-form',
}: Props) {
  const dispatch = useAppDispatch();
  const { data: customerAgreementData, isLoading: agreementsLoading } = useAppSelector((state) => state.customerAgreement);
  const { data: authorisationProfileData, isLoading: profilesLoading } = useAppSelector((state) => state.authorisationProfile);
  const [editingSection, setEditingSection] = useState<string | null>(initialEditingSection);
  const [primaryAgreementField, setPrimaryAgreementField] = useState<'payer' | 'payment' | null>(null);

  useEffect(() => {
    if (initialEditingSection !== null) {
      setEditingSection(initialEditingSection);
    }
  }, [initialEditingSection]);

  useEffect(() => {
    dispatch(fetchCustomerAgreement({ service: SERVICE }));
    dispatch(fetchAuthorisationProfiles());
  }, [dispatch]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm<TransferTypeFormState>({
    resolver: zodResolver(transferTypeZodSchema),
    defaultValues: form,
    mode: 'onBlur',
  });

  const payerCustomerAgreement = watch('payerCustomerAgreement');
  const paymentCustomerAgreement = watch('paymentCustomerAgreement');

  // Helper function to get account details for display
  const getAccountDetailsItems = React.useCallback(
    (accountId: string, accountType: 'payer' | 'payment') => {
      const accountsList = accountType === 'payer' ? payerAccounts : paymentAccounts;
      const account = accountsList.find((a) => a.id === accountId);
      
      const left = [
        { label: 'Account name', value: account?.name ?? '-' },
        { label: 'Branch / Sort code', value: account?.sortCode ?? '-' },
        { label: 'Currency', value: account?.currencyFull || account?.currency || '-' },
      ];
      const right = [
        { label: 'Account number', value: account?.accNumber ?? '-' },
        { label: 'BIC (SWIFT)', value: account?.bic ?? '-' },
        { label: 'Country / Region', value: account?.country ?? '-' },
      ];

      return { left, right };
    },
    [payerAccounts, paymentAccounts]
  );

  // Helper function to get authorization profile name from key
  const getAuthProfileName = React.useCallback((key: string) => {
    if (!key) return '-';
    const profile = authorisationProfileData?.find((p) => p.authProfileKey.toString() === key);
    return profile?.authProfileName || '-';
  }, [authorisationProfileData]);

  // Helper function to get customer agreement name from key
  const getAgreementName = React.useCallback((key: string) => {
    if (!key) return '-';
    const agreement = customerAgreementData?.find((a) => a.id === key);
    return agreement?.label || '-';
  }, [customerAgreementData]);

  // Queue fetches when agreements change (use parent's queue management)
  useEffect(() => {
    if (payerCustomerAgreement && customerAgreementData.length > 0) {
      onSetFetchQueue(prev => {
        const hasPayer = prev.some(f => f.type === 'payer' && f.agreement === payerCustomerAgreement);
        if (hasPayer) return prev;
        return [...prev.filter(f => f.type !== 'payer'), { agreement: payerCustomerAgreement, type: 'payer' as const }];
      });
    }
  }, [payerCustomerAgreement, customerAgreementData, onSetFetchQueue]);

  useEffect(() => {
    if (paymentCustomerAgreement && customerAgreementData.length > 0) {
      onSetFetchQueue(prev => {
        const hasPayment = prev.some(f => f.type === 'payment' && f.agreement === paymentCustomerAgreement);
        if (hasPayment) return prev;
        return [...prev.filter(f => f.type !== 'payment'), { agreement: paymentCustomerAgreement, type: 'payment' as const }];
      });
    }
  }, [paymentCustomerAgreement, customerAgreementData, onSetFetchQueue]);

  useEffect(() => {
    const subscription = watch((values) => {
      onFormChange(values as TransferTypeFormState);
    });
    return () => subscription.unsubscribe();
  }, [watch, onFormChange]);

  const handleChange = (field: keyof TransferTypeFormState, value: any) => {
    setValue(field, value, { shouldValidate: true });
  };

  // Synchronized agreement handlers - selecting one agreement selects the other
  const handlePayerAgreementChange = (value: string) => {
    handleChange('payerCustomerAgreement', value);
    handleChange('paymentCustomerAgreement', value);
    // Set payer as the primary field (manually selected by user), or reset if cleared
    setPrimaryAgreementField(value ? 'payer' : null);
  };

  const handlePaymentAgreementChange = (value: string) => {
    handleChange('paymentCustomerAgreement', value);
    handleChange('payerCustomerAgreement', value);
    // Set payment as the primary field (manually selected by user), or reset if cleared
    setPrimaryAgreementField(value ? 'payment' : null);
  };

  const handleFormSubmit: SubmitHandler<TransferTypeFormState> = (data) => {
    onFormChange(data);
    onSave?.(data);
    onValidSubmit?.(data);
    if (mode === 'edit') {
      onEdit?.();
    }
  };

  const handleSectionEdit = (section: string) => {
    setEditingSection(section);
  };

  const handleSectionSave = (section: string) => {
    setEditingSection(null);
    // When in section-wise editing mode, trigger save and return to view
    if (reviewMode && initialEditingSection !== null) {
      onEdit?.(); // This will trigger handleEnterView in wrapper, returning to view mode
    }
  };

  const handleSectionCancel = (section: string) => {
    setEditingSection(null);
    // When in section-wise editing mode, cancel and return to view
    if (reviewMode && initialEditingSection !== null) {
      onEdit?.(); // This will trigger handleEnterView in wrapper, returning to view mode
    }
  };

  return (
    <Box data-testid={buildTestId(testIdPrefix, 'container')}>
      {/* Transfer type details section */}
      <CommonAccordion
        title={
          <Stack direction="row" alignItems="center" spacing={1} data-testid={buildTestId(testIdPrefix, 'transfer-details-title')}>
            <Image src={FormFillIcon} alt="form icon" />
            <Typography variant="subtitle1" sx={{ fontSize: '1.25rem', fontWeight: 400 }}>
              Transfer type details
            </Typography>
          </Stack>
        }
        border={false}
        disableGutters={false}
        detailsSx={{ p: 2 }}
        expandIcon={false}
        defaultExpanded={true}
        reviewMode={reviewMode}
        isEditing={editingSection === 'transferDetails'}
        onEdit={() => handleSectionEdit('transferDetails')}
        onSave={() => handleSectionSave('transferDetails')}
        onCancel={() => handleSectionCancel('transferDetails')}
      >
        {reviewMode && editingSection !== 'transferDetails' ? (
          // Read-only view
          <Grid container spacing={2} sx={{ mt: '0.5rem' }} data-testid={buildTestId(testIdPrefix, 'transfer-details-view')}>
            <Grid size={{ xs: 12, md: 6 }} data-testid={buildTestId(testIdPrefix, 'transfer-type-name-view-container')}>
              <Typography variant="body2" color="text.secondary" sx={{fontSize: '1.125rem', fontWeight: 400}} data-testid={buildTestId(testIdPrefix, 'transfer-type-name-label')}>
                Transfer type name
              </Typography>
              <Typography variant="body1" sx={{ mt: 0.5, fontSize: '1.25rem', fontWeight: 500 }} data-testid={buildTestId(testIdPrefix, 'transfer-type-name-value')}>
                {form.transferTypeName || '-'}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }} data-testid={buildTestId(testIdPrefix, 'authorisation-profile-view-container')}>
              <Typography variant="body2" color="text.secondary" sx={{fontSize: '1.125rem', fontWeight: 400}} data-testid={buildTestId(testIdPrefix, 'authorisation-profile-label')}>
                Authorisation profile
              </Typography>
              <Typography variant="body1" sx={{ mt: 0.5, fontSize: '1.25rem', fontWeight: 500 }} data-testid={buildTestId(testIdPrefix, 'authorisation-profile-value')}>
                {getAuthProfileName(form.authorisationProfile)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }} data-testid={buildTestId(testIdPrefix, 'enforce-auditing-view-container')}>
              <Typography variant="body2" color="text.secondary" sx={{fontSize: '1.125rem', fontWeight: 400}} data-testid={buildTestId(testIdPrefix, 'enforce-auditing-label')}>
                Enforce auditing
              </Typography>
              <Typography variant="body1" sx={{ mt: 0.5, fontSize: '1.25rem', fontWeight: 500 }} data-testid={buildTestId(testIdPrefix, 'enforce-auditing-value')}>
                {form.enforceAuditing ? 'Yes' : 'No'}
              </Typography>
            </Grid>
          </Grid>
        ) : (
          // Edit mode
          <Box data-testid={buildTestId(testIdPrefix, 'transfer-details-edit')}>
        {status?.message && (
          <Box sx={{ mb: 1 }} data-testid={buildTestId(testIdPrefix, 'status-message')}>
            <Typography
              variant="body2"
              color={status.ok === false ? 'error.main' : 'success.main'}
              data-testid={buildTestId(testIdPrefix, 'status-message-text')}
            >
              {status.message}
            </Typography>
          </Box>
        )}
        <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate id="transferTypeFormCard" data-testid={buildTestId(testIdPrefix, 'form')}>
          <Grid container spacing={2} sx={{ mt: '1.5rem', mb: '0.5rem' }} data-testid={buildTestId(testIdPrefix, 'form-grid')}>
            <Grid size={{ xs: 12, md: 6 }} data-testid={buildTestId(testIdPrefix, 'transfer-type-name-container')}>
              <TextField
                label="Transfer type name*"
                placeholder="[Transfer type name]"
                fullWidth
                {...register('transferTypeName')}
                error={Boolean(errors.transferTypeName) || Boolean(_errors.transferTypeName)}
                helperText={errors.transferTypeName?.message || _errors.transferTypeName || ''}
                InputProps={{ sx: { borderRadius: '0.5rem' } }}
                disabled={reviewMode && editingSection !== 'transferDetails'}
                inputProps={{
                  'data-testid': buildTestId(testIdPrefix, 'input-transfer-type-name'),
                  'aria-label': 'Transfer type name',
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }} data-testid={buildTestId(testIdPrefix, 'authorisation-profile-container')}>
              <Autocomplete
                options={authorisationProfileData}
                getOptionLabel={(option) => option.authProfileName || ''}
                value={(() => {
                  const currentValue = watch('authorisationProfile');
                  if (!currentValue) return null;
                  if (typeof currentValue === 'object') return currentValue;
                  return authorisationProfileData.find((p) => p.authProfileKey.toString() === currentValue) || null;
                })()}
                onChange={(_, v) => {
                  const value = v ? (typeof v === 'object' ? v.authProfileKey.toString() : v) : '';
                  handleChange('authorisationProfile', value);
                }}
                isOptionEqualToValue={(option, value) => {
                  if (!value) return false;
                  const optionKey = typeof option === 'object' ? option.authProfileKey.toString() : option;
                  const valueKey = typeof value === 'object' ? value.authProfileKey.toString() : value;
                  return optionKey === valueKey;
                }}
                disabled={reviewMode && editingSection !== 'transferDetails'}
                loading={profilesLoading}
                data-testid={buildTestId(testIdPrefix, 'autocomplete-authorisation-profile')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Authorisation profile*"
                    placeholder="[Selected authorisation profile]"
                    error={Boolean(errors.authorisationProfile) || Boolean(_errors.authorisationProfile)}
                    helperText={errors.authorisationProfile?.message || _errors.authorisationProfile || ''}
                    InputProps={{ ...params.InputProps, sx: { borderRadius: '0.5rem' } }}
                    inputProps={{
                      ...params.inputProps,
                      'data-testid': buildTestId(testIdPrefix, 'input-authorisation-profile'),
                      'aria-label': 'Authorisation profile',
                    }}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }} sx={{ mt: '1.5rem', mb: '0.5rem', display: 'flex', alignItems: 'center' }} data-testid={buildTestId(testIdPrefix, 'enforce-auditing-container')}>
              <FormGroup row>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={Boolean(watch('enforceAuditing'))}
                      onChange={(e) => handleChange('enforceAuditing', e.target.checked)}
                      disabled={reviewMode && editingSection !== 'transferDetails'}
                      data-testid={buildTestId(testIdPrefix, 'checkbox-enforce-auditing')}
                    />
                  }
                  label="Enforce auditing"
                  data-testid={buildTestId(testIdPrefix, 'label-enforce-auditing')}
                />
              </FormGroup>
            </Grid>
          </Grid>
        </Box>
          </Box>
        )}
      </CommonAccordion>

      {/* Payer details section */}
      <Box sx={{ mt: 2 }} data-testid={buildTestId(testIdPrefix, 'from-account-section')}>
        <CommonAccordion
          title={
            <Stack direction="row" alignItems="center" spacing={1} data-testid={buildTestId(testIdPrefix, 'from-account-title')}>
              <Image src={FormFillIcon} alt="form icon" />
              <Typography variant="subtitle1" sx={{ fontSize: '1.25rem', fontWeight: 400 }}>
                From Account
              </Typography>
            </Stack>
          }
          border={false}
          disableGutters={false}
          detailsSx={{ p: 2 }}
          expandIcon={false}
          defaultExpanded={true}
          reviewMode={reviewMode}
          isEditing={editingSection === 'fromAccount'}
          onEdit={() => handleSectionEdit('fromAccount')}
          onSave={() => handleSectionSave('fromAccount')}
          onCancel={() => handleSectionCancel('fromAccount')}
        >
          {reviewMode && editingSection !== 'fromAccount' ? (
            // Read-only view
            <Grid container spacing={2} sx={{ mt: '0.5rem' }} data-testid={buildTestId(testIdPrefix, 'from-account-view')}>
              <Grid size={{ xs: 12 }} data-testid={buildTestId(testIdPrefix, 'payer-agreement-view-container')}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '1.125rem', fontWeight: 400 }} data-testid={buildTestId(testIdPrefix, 'payer-agreement-label')}>
                  Customer agreement
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.5, fontSize: '1.25rem', fontWeight: 500 }} data-testid={buildTestId(testIdPrefix, 'payer-agreement-value')}>
                  {getAgreementName(form.payerCustomerAgreement)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }} data-testid={buildTestId(testIdPrefix, 'payer-account-details-container')}>
                <Grid container spacing={2} data-testid={buildTestId(testIdPrefix, 'payer-account-details-grid')}>
                  <Grid size={{ xs: 12, md: 6 }} data-testid={buildTestId(testIdPrefix, 'payer-account-left-column')}>
                    <DescriptionList items={getAccountDetailsItems(form.payerAccount, 'payer').left} spacing={1} data-testid={buildTestId(testIdPrefix, 'payer-account-left-list')} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }} data-testid={buildTestId(testIdPrefix, 'payer-account-right-column')}>
                    <DescriptionList items={getAccountDetailsItems(form.payerAccount, 'payer').right} spacing={1} data-testid={buildTestId(testIdPrefix, 'payer-account-right-list')} />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          ) : (
            // Edit mode
          <Box data-testid={buildTestId(testIdPrefix, 'from-account-edit')}>
          <CustomerAgreementSelector
            agreementValue={watch('payerCustomerAgreement') || ''}
            accountValue={watch('payerAccount') || ''}
            onAgreementChange={handlePayerAgreementChange}
            onAccountChange={(value) => handleChange('payerAccount', value)}
            agreementError={(errors.payerCustomerAgreement?.message || _errors.payerCustomerAgreement) as string}
            accountError={(errors.payerAccount?.message || _errors.payerAccount) as string}
            agreements={customerAgreementData}
            accounts={payerAccounts}
            disabled={reviewMode && editingSection !== 'fromAccount'}
            agreementDisabled={primaryAgreementField === 'payment'}
            accountDisabled={!watch('payerCustomerAgreement') || accountsLoading}
          />
          </Box>
          )}
        </CommonAccordion>
      </Box>

      {/* Payment details section */}
      <Box sx={{ mt: 2 }} data-testid={buildTestId(testIdPrefix, 'to-account-section')}>
        <CommonAccordion
          title={
            <Stack direction="row" alignItems="center" spacing={1} data-testid={buildTestId(testIdPrefix, 'to-account-title')}>
              <Image src={FormFillIcon} alt="form icon" />
              <Typography variant="subtitle1" sx={{ fontSize: '1.25rem', fontWeight: 400 }}>
                To Account
              </Typography>
            </Stack>
          }
          border={false}
          disableGutters={false}
          detailsSx={{ p: 2 }}
          expandIcon={false}
          defaultExpanded={true}
          reviewMode={reviewMode}
          isEditing={editingSection === 'toAccount'}
          onEdit={() => handleSectionEdit('toAccount')}
          onSave={() => handleSectionSave('toAccount')}
          onCancel={() => handleSectionCancel('toAccount')}
        >
          {reviewMode && editingSection !== 'toAccount' ? (
            // Read-only view
            <Grid container spacing={2} sx={{ mt: '0.5rem' }} data-testid={buildTestId(testIdPrefix, 'to-account-view')}>
              <Grid size={{ xs: 12 }} data-testid={buildTestId(testIdPrefix, 'payment-agreement-view-container')}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '1.125rem', fontWeight: 400 }} data-testid={buildTestId(testIdPrefix, 'payment-agreement-label')}>
                  Customer agreement
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.5, fontSize: '1.25rem', fontWeight: 500 }} data-testid={buildTestId(testIdPrefix, 'payment-agreement-value')}>
                  {getAgreementName(form.paymentCustomerAgreement)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }} data-testid={buildTestId(testIdPrefix, 'payment-account-details-container')}>
                <Grid container spacing={2} data-testid={buildTestId(testIdPrefix, 'payment-account-details-grid')}>
                  <Grid size={{ xs: 12, md: 6 }} data-testid={buildTestId(testIdPrefix, 'payment-account-left-column')}>
                    <DescriptionList items={getAccountDetailsItems(form.paymentAccount, 'payment').left} spacing={1} data-testid={buildTestId(testIdPrefix, 'payment-account-left-list')} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }} data-testid={buildTestId(testIdPrefix, 'payment-account-right-column')}>
                    <DescriptionList items={getAccountDetailsItems(form.paymentAccount, 'payment').right} spacing={1} data-testid={buildTestId(testIdPrefix, 'payment-account-right-list')} />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          ) : (
            // Edit mode
          <Box data-testid={buildTestId(testIdPrefix, 'to-account-edit')}>
          <CustomerAgreementSelector
            agreementValue={watch('paymentCustomerAgreement') || ''}
            accountValue={watch('paymentAccount') || ''}
            onAgreementChange={handlePaymentAgreementChange}
            onAccountChange={(value) => handleChange('paymentAccount', value)}
            agreementError={(errors.paymentCustomerAgreement?.message || _errors.paymentCustomerAgreement) as string}
            accountError={(errors.paymentAccount?.message || _errors.paymentAccount) as string}
            agreements={customerAgreementData}
            accounts={paymentAccounts}
            disabled={reviewMode && editingSection !== 'toAccount'}
            agreementDisabled={primaryAgreementField === 'payer'}
            accountDisabled={!watch('paymentCustomerAgreement') || accountsLoading}
          />
          </Box>
          )}
        </CommonAccordion>
      </Box>
    </Box>
  );
}
