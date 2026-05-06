'use client';

import * as React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import{ Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid,
  Stack,
  TextField,
  Typography,
  Autocomplete,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  InputAdornment,
} from '@mui/material';
import Image from 'next/image';
import { FormFillIcon } from 'lib/icons';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { Amount } from 'dist/standard-bank-react';
import CommonAccordion from '../../common/CommonAccordion';
import { useTranslations } from "next-intl";
import { useAppDispatch,useAppSelector } from '@lib/hooks/useAppDispatch';
import { fetchAuthorisationProfiles } from '@store/slices/setup-admin/commonSlice/authorisationProfileSlice';
import type { RootState, AppDispatch } from 'store/index';

export type CollectionTypeFormState = {
  name: string;
  authorisationProfile: string | null;
  allowAdHoc: boolean;
  hostToHostDefault: boolean;
  currency: string;
  adHocLimit: string; // formatted string X,XXX,XXX.XX
  enforceAuditing?: boolean;
  auditReportType?: 'full' | 'partial'; // Add audit report type
};

/**
 * Create dynamic validation schema based on variant type (collection or transfer)
 */
export const createCollectionTypeSchema = (isTransfer: boolean = false) => {
  const typeLabel = isTransfer ? 'Transfer type' : 'Collection type';
  return z.object({
    name: z.string().min(1, `${typeLabel} name is required`),
    authorisationProfile: z.string().min(1, 'Authorisation profile is required').nullable(),
    allowAdHoc: z.boolean(),
    hostToHostDefault: z.boolean(),
    currency: z.string(),
    adHocLimit: z.string(),
    enforceAuditing: z.boolean().optional(),
    auditReportType: z.enum(['full', 'partial']).optional(),
  }).superRefine((data, ctx) => {
    if (data.allowAdHoc && (!data.adHocLimit || data.adHocLimit.trim() === '' || data.adHocLimit === '0,00')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['adHocLimit'],
        message: 'Ad-hoc limit is required when ad-hoc debtors are allowed',
      });
    }
    if (data.enforceAuditing && !data.auditReportType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['auditReportType'],
        message: 'Audit report type is required when auditing is enforced',
      });
    }
  });
};

// Default schema for backward compatibility
export const collectionTypeSchema = createCollectionTypeSchema(false);

interface Props {
  form: CollectionTypeFormState;
  errors: Record<string, string>;
  submitting: boolean;
  onFormChange: (form: CollectionTypeFormState) => void;
  status: { ok?: boolean; message?: string };
  onEdit?: () => void;
  mode?: 'view' | 'edit' | 'create';
  onValidSubmit?: (data: CollectionTypeFormState) => void;
  setMode?: (mode: 'view' | 'edit' | 'create') => void;
  onSave?: (data: CollectionTypeFormState) => void;
  onCancel?: () => void;
}

const CURRENCIES = [
  { label: 'ZAR - South African Rand', value: 'ZAR' },
  { label: 'USD - US Dollar', value: 'USD' },
  { label: 'EUR - Euro', value: 'EUR' },
  { label: 'GBP - British Pounds', value: 'GBP' },
];

export default function CollectionTypeForm({
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
  variant = 'collection',
}: Props & { variant?: 'collection' | 'transfer' }) {
  const dispatch = useAppDispatch();
  const { data: authorisationProfileData, isLoading: profilesLoading } = useAppSelector((state) => state.authorisationProfile);
  const isTransfer = variant === 'transfer';
  
  // Derive reviewMode from mode prop - true for both view and edit to show accordion buttons
  const reviewMode = mode === 'view' || mode === 'edit';
  // Start in editing mode if mode is 'edit', otherwise start in view mode
  const [isEditing, setIsEditing] = React.useState(mode === 'edit');
  const effectiveReviewMode = reviewMode && !isEditing;
  const translateLang = useTranslations('collectionTypesHubData');
  // Memoize schema so it updates when isTransfer changes
  const schema = React.useMemo(() => createCollectionTypeSchema(isTransfer), [isTransfer]);
  
  React.useEffect(() => {
    dispatch(fetchAuthorisationProfiles());
  }, [dispatch]);
  
  React.useEffect(() => {
    // Sync isEditing with mode changes
    if (mode === 'edit') {
      setIsEditing(true);
    } else if (mode === 'view') {
      setIsEditing(false);
    }
  }, [mode]);
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm<CollectionTypeFormState>({
    resolver: zodResolver(schema),
    defaultValues: form,
    mode: 'onBlur',
  });

  React.useEffect(() => {
    const subscription = watch((values) => {
      onFormChange(values as CollectionTypeFormState);
    });
    return () => subscription.unsubscribe();
  }, [watch, onFormChange]);

  const handleChange = (field: keyof CollectionTypeFormState, value: any) => {
    setValue(field, value, { shouldValidate: true });
  };

  const handleFormSubmit: SubmitHandler<CollectionTypeFormState> = (data) => {
    onFormChange(data);
    onSave?.(data);
    onValidSubmit?.(data);
    if (mode === 'edit') {
      onEdit?.();
    }
  };

  return (
    <CommonAccordion
      title={
        <Stack direction="row" alignItems="center" spacing={1}>
          <Image src={FormFillIcon} alt="form icon" />
          <Typography variant="subtitle1" sx={{ fontSize: '1.25rem', fontWeight: 400 }}>
            {isTransfer ? 'Transfer type details' : translateLang('collectionTypeDetails')}
          </Typography>
        </Stack>
      }
      reviewMode={reviewMode}
      isEditing={isEditing}
      onEdit={() => {
        setIsEditing(true);
      }}
      onCancel={() => {
        onCancel?.();
        setIsEditing(false);
        if (reviewMode) {
          onEdit?.(); // Switch back to view mode to show details
        }
      }}
      onSave={() => {
        // Validate before saving; only exit edit mode when valid
        handleSubmit((data) => {
          onSave?.(data);
          setIsEditing(false);
          if (reviewMode) {
            onEdit?.(); // Switch back to view mode to show details
          }
        })();
      }}
      border={false}
      disableGutters={false}
      detailsSx={{ p: 2 }}
      expandIcon={false}
    >
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
      <Box component="form" noValidate id="collectionTypeFormCard">
        <Grid container spacing={2} sx={{ mt: '1.5rem', mb: '0.5rem' }}>
          {/* First Row: Collection type name & Authorization profile */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label={isTransfer ? 'Transfer type name*' : translateLang('collectionTypeName')}
              placeholder={isTransfer ? '[Transfer type name]' : '[Collection type name]'}
              fullWidth
              {...register('name')}
              error={Boolean(errors.name) || Boolean(_errors.name)}
              helperText={errors.name ? errors.name.message : _errors.name || ''}
              InputProps={{ sx: { borderRadius: '0.5rem' } }}
              disabled={effectiveReviewMode}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
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
              disabled={effectiveReviewMode}
              loading={profilesLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={translateLang('authorizationProfile')}
                  placeholder="[Selected authorisation profile]"
                  error={Boolean(errors.authorisationProfile) || Boolean(_errors.authorisationProfile)}
                  helperText={errors.authorisationProfile?.message || _errors.authorisationProfile || ''}
                  InputProps={{ ...params.InputProps, sx: { borderRadius: '0.5rem' } }}
                />
              )}
            />
          </Grid>

          {/* Second Row: Ad hoc limit field (left side only) */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label={translateLang('adHocLimit')}
              placeholder="[X,XXX,XXX.XX]"
              fullWidth
              value={watch('adHocLimit') || ''}
              onChange={(e) => {
                let value = e.target.value.replace(/[^\d]/g, '');
                if (value) {
                  const num = parseInt(value);
                  value = (num / 100).toLocaleString('en-ZA', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  });
                }
                handleChange('adHocLimit', value);
              }}
              error={Boolean(errors.adHocLimit) || Boolean(_errors.adHocLimit)}
              helperText={
                errors.adHocLimit?.message || 
                _errors.adHocLimit || 
                translateLang('adHocLimitHelperText')
              }
              disabled={effectiveReviewMode || !watch('allowAdHoc')}
              InputProps={{
                startAdornment: <InputAdornment position="start">ZAR</InputAdornment>,
                sx: { borderRadius: '0.5rem' },
              }}
              FormHelperTextProps={{
                sx: {
                  color: (errors.adHocLimit || _errors.adHocLimit) ? 'error.main' : 'text.secondary',
                  fontSize: '0.75rem',
                  mt: 0.5
                }
              }}
            />
          </Grid>

          {/* Empty grid item for spacing */}
          <Grid size={{ xs: 12, md: 6 }}></Grid>

          {/* Third Row: Checkboxes - 6-6 Grid Layout */}

          {/* Left Column (md: 6): Allow Ad-hoc debtors & Host to Host default */}
          <Grid size={{ xs: 12, md: 6 }} sx={{ mb: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
                    disabled={effectiveReviewMode}
                  />
                }
                label={translateLang('allowAdHocDebtors')}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={watch('hostToHostDefault')}
                    onChange={(e) => handleChange('hostToHostDefault', e.target.checked)}
                    disabled={effectiveReviewMode}
                  />
                }
                label={translateLang('hostToHostDefault')}
              />
            </Box>
          </Grid>

          {/* Right Column (md: 6): Enforce auditing + Full audit report + Partial audit report */}
          <Grid size={{ xs: 12, md: 6, lg: 6 }} sx={{ mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={Boolean(watch('enforceAuditing'))}
                    onChange={(e) => {
                      handleChange('enforceAuditing', e.target.checked);
                      if (!e.target.checked) {
                        handleChange('auditReportType', undefined);
                      }
                    }}
                    disabled={effectiveReviewMode}
                  />
                }
                label={translateLang('enforceAuditing')}
              />
                
                <Box sx={{ display: 'flex',   flexDirection: 'column' ,
                   }}>
              <FormControlLabel
                control={<Radio checked={watch('auditReportType') === 'full'} onChange={() => handleChange('auditReportType', 'full')} disabled={effectiveReviewMode || !watch('enforceAuditing')} />}
                label={translateLang('fullAuditReport')}
              />
              <FormControlLabel
                control={<Radio checked={watch('auditReportType') === 'partial'} onChange={() => handleChange('auditReportType', 'partial')} disabled={effectiveReviewMode || !watch('enforceAuditing')} />}
                label={translateLang('partialAuditReport')}
              />
           </Box>
           </Box>
          </Grid>

         

          
 
          </Grid>
 
         
      </Box>
    </CommonAccordion>
  );
  
}