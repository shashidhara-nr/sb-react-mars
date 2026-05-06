
'use client';

import React,{useMemo} from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Grid,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';

import Image from 'next/image';
import IconFromFill from "public/icons/icn_form_fill.svg";
import IconCancel from 'public/icons/icn_cancel.svg';
import IconFloppy from 'public/icons/icn_floppy.svg';
import { AmountInput } from 'components/atoms';



export type PaymentTypeFormState = {
  name: string;
  authorisationProfile: string | null;
  authorisationProfileName?: string; // Store the display name for the selected profile
  allowAdHoc: boolean;
  currency: string;
  adHocLimit: string; // formatted string X,XXX,XXX.XX
  payAlertsAllowed: boolean;
  hostToHostDefault: boolean;
  hideBeneficiaryDetails?: boolean;
  enforceAuditing?: boolean;
  auditReportType?: string | null;
};

export const paymentTypeSchema = z.object({
  name: z.string().min(1, 'Payment type name is required'),
  // Store as string | null in state, but validate as required via superRefine below
  authorisationProfile: z.string().nullable(),
  authorisationProfileName: z.string().optional(),
  adHocLimit: z.string(),
  allowAdHoc: z.boolean(),
  currency: z.string(),
  payAlertsAllowed: z.boolean(),
  hostToHostDefault: z.boolean(),
  hideBeneficiaryDetails: z.boolean().optional(),
  enforceAuditing: z.boolean().optional(),
  auditReportType: z.string().nullable().optional(),
}).superRefine((data, ctx) => {
  // Authorisation profile is always required
  if (!data.authorisationProfile || data.authorisationProfile.trim() === '') {
    ctx.addIssue({
      code: 'custom',
      path: ['authorisationProfile'],
      message: 'Authorisation profile is required',
    });
  }

  if (data.allowAdHoc && (!data.adHocLimit || data.adHocLimit.trim() === '')) {
    ctx.addIssue({
      code: 'custom',
      path: ['adHocLimit'],
      message: 'Ad-hoc limit is required when ad-hoc beneficiary is allowed',
    });
  }

  if (data.enforceAuditing && (!data.auditReportType || data.auditReportType.trim() === '')) {
    ctx.addIssue({
      code: 'custom',
      path: ['auditReportType'],
      message: 'Audit report type is required when enforce auditing is enabled',
    });
  }
});
interface AuthorizationsProfileListI{
  label: string;
  value: string;
}
interface PaymentTypeFormProps {
  form: PaymentTypeFormState;
  errors: Record<string, string>;
  submitting: boolean;
  onFormChange: (form: PaymentTypeFormState) => void;
  status: { ok?: boolean; message?: string };
  authorizationsProfileList?: AuthorizationsProfileListI[];
  onEdit?: () => void;
  mode?: 'view' | 'edit' | 'create';
  onValidSubmit?: (data: PaymentTypeFormState) => void;
}



const CURRENCIES = ['ZAR', 'USD', 'EUR', 'GBP', 'INR'];

function formatAmountInput(raw: string): string {
  // allow digits + single dot, then add thousands separators and keep max 2 decimals
  const cleaned = raw.replaceAll(/[^\d.]/g, '').replaceAll(/(\..*)\./, '$1');
  const [intPart, fracPart = ''] = cleaned.split('.');
  const withCommas = intPart.replaceAll(/\B(?=(\d{3})+(?!\d))/g, ',');
  const frac = fracPart.slice(0, 2);
  return frac.length ? `${withCommas}.${frac}` : withCommas;
}


export default function PaymentTypeForm({
  form,
  errors: _errors,
  submitting,
  onFormChange,
  status,
  onEdit,
  mode,
  setMode,
  onSave,
  onCancel,
  onValidSubmit,
  authorizationsProfileList=[],
}: PaymentTypeFormProps & {
  setMode?: (mode: 'view' | 'edit' | 'create') => void;
  onSave?: (data: PaymentTypeFormState) => void;
  onCancel?: () => void;
}) {
  const t = useTranslations('paymenttypes');

  // Track which fields have been modified to clear external errors
  const [modifiedFields, setModifiedFields] = React.useState<Set<string>>(new Set());

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm<PaymentTypeFormState>({
    resolver: zodResolver(paymentTypeSchema),
    defaultValues: form,
    mode: 'onChange',
  });

  // Reset modified fields when external errors change (e.g., after submit)
  React.useEffect(() => {
    if (Object.keys(_errors).length > 0) {
      setModifiedFields(new Set());
    }
  }, [_errors]);

  // Only call onFormChange when form values actually change
  React.useEffect(() => {
    const subscription = watch((values) => {
      onFormChange(values as PaymentTypeFormState);
    });
    return () => subscription.unsubscribe();
  }, [watch, onFormChange]);

  // Local change handler for currency and adHocLimit
  const handleChange = (field: keyof PaymentTypeFormState, value: any) => {
    setValue(field, value, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    // Mark field as modified to clear external error
    setModifiedFields(prev => new Set(prev).add(field));
  };

  // Helper to check if we should show external error for a field
  const shouldShowExternalError = (fieldName: string): boolean => {
    return Boolean(_errors[fieldName] && !modifiedFields.has(fieldName));
  };

  // Helper to get error message for a field
  const getErrorMessage = (fieldName: keyof PaymentTypeFormState) => {
    if (errors[fieldName]?.message) return errors[fieldName].message;
    if (shouldShowExternalError(fieldName)) return _errors[fieldName];
    return '';
  };

  const handleFormSubmit: SubmitHandler<PaymentTypeFormState> = (data) => {
    onFormChange(data);
    onSave?.(data);
    onValidSubmit?.(data);
    if (mode === 'edit') {
      onEdit?.();
    }
  };

  const currentAuthProfileValue = watch('authorisationProfile');

  const selectedAuthProfile = useMemo(() => {
    return authorizationsProfileList.find(option => option.value === currentAuthProfileValue) || null;
  }, [authorizationsProfileList, currentAuthProfileValue]);

  return (
    <Card variant="outlined" sx={{ borderRadius: '0.75rem', borderColor: '#e5e7eb', backgroundColor: '#FFFFFF' }}>
      <CardHeader
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Image src={IconFromFill} alt="form icon" />
            <Typography variant="subtitle1" sx={{ fontSize: '1.25rem', fontWeight: 400 }}>
              {t('paymentTypeDetails')}
            </Typography>
          </Stack>
        }
        action={
          mode === 'edit' && (
            <Stack direction="row" spacing={1}>
              <Button
                variant="text"
                size="small"
                startIcon={<Image src={IconCancel} alt="cancel" width={20} height={20} />}
                sx={{ fontWeight: 700, color: 'primary.main', textTransform: 'uppercase' }}
                onClick={() => {
                  onCancel?.();
                  onEdit?.();
                }}
              >
                {t('cancelButtonInForm')}
              </Button>
              <Button
                variant="text"
                size="small"
                startIcon={<Image src={IconFloppy} alt="save" width={20} height={20} />}
                sx={{ fontWeight: 700, color: 'primary.main', textTransform: 'uppercase' }}
                type="submit"
                form="paymentTypeFormCard"
              >
                {t('saveButtonLabel')}
              </Button>
            </Stack>
          )
        }
        sx={{ borderBottom: '1px solid #eef2f7', py: '0.94rem' }}
      />
      <CardContent sx={{ p: '0.75rem' }}>
        {status?.message && (
          <Box sx={{ mb: 1 }}>
            <Typography
              variant="body2"
              color={status.ok === false ? 'error.main' : 'success.main'}
            >
              {status.message}
            </Typography>
          </Box>
        )}
        <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate id="paymentTypeFormCard">
          {/* Row: Name & Authorisation profile */}
          <Grid container spacing={2} sx={{ mt: '1.5rem', mb: '0.5rem' }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label={t('paymentTypeName')}
                placeholder={t('paymentTypeNamePlaceholder')}
                fullWidth
                {...register('name', {
                  onChange: () => setModifiedFields(prev => new Set(prev).add('name'))
                })}
                error={Boolean(errors.name) || shouldShowExternalError('name')}
                helperText={getErrorMessage('name')}
                slotProps={{ input: { sx: { borderRadius: '0.5rem' } } }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Autocomplete
                options={authorizationsProfileList}
                value={selectedAuthProfile}
                onChange={(_, v) => {
                  // Store both key and name in the form state
                  setValue('authorisationProfile', v?.value || null, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                  setValue('authorisationProfileName', v?.label || undefined, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                  setModifiedFields(prev => new Set(prev).add('authorisationProfile'));
                }}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.value === value?.value}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('authorisationProfile')}
                    placeholder={t('selectedAuthorisationProfilePlaceholder')}
                    error={Boolean(errors.authorisationProfile) || shouldShowExternalError('authorisationProfile')}
                    helperText={getErrorMessage('authorisationProfile')}
                    slotProps={{ input: { ...params.InputProps, sx: { borderRadius: '0.5rem' } } }}
                  />
                )}
              />
            </Grid>

            {/* Allow ad-hoc beneficiary */}
            <Grid size={{ xs: 12 }} >
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={watch('allowAdHoc')}
                      onChange={(e) => {
                        handleChange('allowAdHoc', e.target.checked);
                        if (!e.target.checked) {
                          handleChange('adHocLimit', '');
                        }
                      }}
                      icon={<CheckBoxOutlineBlankIcon />}
                    />
                  }
                  label={t('allowAdHocBeneficiary')}
                />
              </FormGroup>
            </Grid>

            {/* Row: Currency + Ad-hoc limit (BankDetailsForm style) */}
            <Grid size={{ xs: 12, md: 6 }} sx={{ mt: '1.5rem', mb: '0.5rem' }}>
              <AmountInput
                value={watch('adHocLimit') || ''}
                currency={watch('currency') || 'USD'}
                currencyOptions={[
                  { label: 'ZAR - South Africa', value: 'ZAR' },
                  { label: 'USD - US Dollar', value: 'USD' },
                  { label: 'EUR - Euro', value: 'EUR' },
                  { label: 'GBP - British Pounds', value: 'GBP' },
                  { label: 'JPY - Japanese Yen', value: 'JPY' },
                  { label: 'AUD - Australian Dollar', value: 'AUD' },
                ]}
                handleChangeCurrency={(newCurrency: string) => handleChange('currency', newCurrency)}
                handleChangeValue={(newValue: string) => handleChange('adHocLimit', newValue)}
                label={t('adHocLimit')}
                disabled={!watch('allowAdHoc')}
                sx={{
                  width: '100%',
                  '& .MuiOutlinedInput-root': { height: '3.5rem' },
                }}
                error={Boolean(errors.adHocLimit) || shouldShowExternalError('adHocLimit')}
                helperText={getErrorMessage('adHocLimit')}
              />
            </Grid>
          </Grid>

          {/* Additional checkboxes */}
          <Grid container spacing={2} sx={{ mt: '0.5rem' }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormGroup sx={{ gap: '1rem' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={watch('payAlertsAllowed')}
                      onChange={(e) => handleChange('payAlertsAllowed', e.target.checked)}
                    />
                  }
                  label={t('payAlertsAllowed')}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={watch('hideBeneficiaryDetails') || false}
                      onChange={(e) => handleChange('hideBeneficiaryDetails', e.target.checked)}
                    />
                  }
                  label={t('hideBeneficiaryDetails')}
                />
              </FormGroup>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }} sx={{ mt: '0.5rem' }}>
              <FormGroup sx={{ gap: '1rem' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={watch('hostToHostDefault')}
                      onChange={(e) => handleChange('hostToHostDefault', e.target.checked)}
                    />
                  }
                  label={t('hostToHostDefault')}
                />
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={watch('enforceAuditing') || false}
                        onChange={(e) => {
                          handleChange('enforceAuditing', e.target.checked);
                          if (!e.target.checked) {
                            handleChange('auditReportType', null);
                          }
                        }}
                      />
                    }
                    label={t('enforceAuditing')}
                  />
                  <Box>
                    <RadioGroup
                      value={watch('auditReportType') || ''}
                      onChange={(e) => handleChange('auditReportType', e.target.value)}
                    >
                      <FormControlLabel
                        value="full"
                        control={<Radio />}
                        label={t('fullAuditReport')}
                      />
                      <FormControlLabel
                        value="partial"
                        control={<Radio />}
                        label={t('partialAuditReport')}
                      />
                    </RadioGroup>
                    {errors.auditReportType && (
                      <FormHelperText error sx={{ mt: 0 }}>
                        {errors.auditReportType.message}
                      </FormHelperText>
                    )}
                  </Box>
                </Box>
              </FormGroup>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
}
            