'use client';

import * as React from 'react';
import {
  Box,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
  Checkbox,
  FormControlLabel,
  FormHelperText
} from '@mui/material';
import { SettingIcon } from 'lib/icons';
import { z } from 'zod';
import CommonAccordion from '../../common/CommonAccordion';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

export type CollectionModelState = {
  countryOrRegion: string;
  fixedDateValue: boolean;
  upfrontValue?: boolean;
  valueOfSuccess?: boolean;
  defaultSource?: string;
  batchUploadDefault?: 'batch' | 'single';
};

type SelectedAccount = {
  accountKey?: string | number;
  accountName?: string | null;
  accountNumber?: string | null;
  sortCode?: string | null;
  bic?: string | null;
  currencyCode?: string | null;
  currencyDisplayName?: string | null;
  countryCode?: string | null;
  countryDisplayName?: string | null;
  country?: string | null;
};

// Zod schema for validation (exported for reuse)
export const collectionModelSchema = z.object({
  countryOrRegion: z.string().optional(),
  fixedDateValue: z.boolean(),
  upfrontValue: z.boolean(),
  valueOfSuccess: z.boolean(),
  defaultSource: z.string().min(1, 'Required'),
});

type Props = {
  value?: CollectionModelState;
  onChange?: (next: CollectionModelState) => void;
  disabled?: boolean;
  reviewMode?: boolean;
  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  defaultExpanded?: boolean;
  selectedAccount?: SelectedAccount | null;
  hasError?: boolean;
  actions?: React.ReactNode;
};

const defaultState: CollectionModelState = {
  countryOrRegion: '',
  fixedDateValue: false,
  upfrontValue: false,
  valueOfSuccess: false,
  defaultSource: ''
};

type CheckboxFieldProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  reviewMode: boolean;
  translateLang?: any;
};

const CheckboxField: React.FC<CheckboxFieldProps> = ({ label, checked, onChange, reviewMode, translateLang }) => {
  if (reviewMode) {
    return (
      <Stack spacing={0.5}>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '1.125rem', fontWeight: 400 }}>{label}</Typography>
        <Typography sx={{ fontSize: '1.25rem', fontWeight: 500 }}>{checked ? (translateLang ? translateLang('yes') : 'Yes') : (translateLang ? translateLang('no') : 'No')}</Typography>
      </Stack>
    );
  }
  return (
    <FormControlLabel
      control={<Checkbox checked={checked} onChange={(e) => onChange(e.target.checked)} />}
      label={label}
    />
  );
};

type SelectFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
  reviewMode: boolean;
  labelId: string;
  error?: boolean;
  helperText?: string;
};

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  options,
  disabled,
  reviewMode,
  labelId,
  error,
  helperText,
}) => {
  if (reviewMode) {
    return (
      <Stack spacing={0.5}>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '1.125rem', fontWeight: 400 }}>{label}</Typography>
        <Typography sx={{ fontSize: '1.25rem', fontWeight: 500 }}>{value || '-'}</Typography>
      </Stack>
    );
  }
  return (
    <FormControl fullWidth disabled={disabled} error={error}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select labelId={labelId} label={label} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
        ))}
      </Select>
      {error && helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export const CollectionModelOptions: React.FC<Props> = ({
  value,
  onChange,
  disabled = false,
  reviewMode = false,
  onEdit,
  onSave,
  onCancel,
  defaultExpanded = true,
  selectedAccount,
  hasError = false,
  actions
}) => {
  const translateLang = useTranslations('collectionTypesHubData');
  const [internal, setInternal] = React.useState<CollectionModelState>(value || defaultState);
  const [isEditing, setIsEditing] = React.useState(false);
  
  const state = value ?? internal;
  const effectiveReviewMode = reviewMode && !isEditing;

  const setState = React.useCallback((next: CollectionModelState) => {
    onChange?.(next);
    setInternal(next);
  }, [onChange]);

  const handleEdit = React.useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleSave = React.useCallback(() => {
    onSave?.();
    setIsEditing(false);
  }, [onSave]);

  const handleCancel = React.useCallback(() => {
    onCancel?.();
    setIsEditing(false);
  }, [onCancel]);

  const getDefaultSourceOptions = React.useCallback(() => {
    const options: Array<{ value: string; label: string }> = [
      { value: '', label: translateLang('none') }
    ];
    
    if (state.fixedDateValue) {
      options.push({ value: 'Fixed Date Value', label: translateLang('fixedDateValue') });
    }
    if (state.upfrontValue) {
      options.push({ value: 'Upfront Value', label: translateLang('upfrontValue') });
    }
    if (state.valueOfSuccess) {
      options.push({ value: 'Value on Success', label: translateLang('valueOnSuccess') });
    }
    
    return options;
  }, [state.fixedDateValue, state.upfrontValue, state.valueOfSuccess, translateLang]);

  /** Sync internal state when value prop changes (prepopulated values) */
  React.useEffect(() => {
    if (value) {
      setInternal(value);
    }
  }, [value]);

  React.useEffect(() => {
    if (!reviewMode) setIsEditing(false);
  }, [reviewMode]);

  const countryValue = React.useMemo(() => {
    if (!selectedAccount) return '';
    return selectedAccount.country || selectedAccount.countryCode || selectedAccount.countryDisplayName || '-';
  }, [selectedAccount]);

  const countryOptions = React.useMemo(() => {
    if (!countryValue || countryValue === '-') {
      return [{ value: '', label: '' }];
    }
    return [{ value: countryValue, label: countryValue }];
  }, [countryValue]);

  React.useEffect(() => {
    const options: Array<{ value: string; label: string }> = [{ value: '', label: '' }];
    
    if (state.fixedDateValue) {
      options.push({ value: 'Fixed Date Value', label: translateLang('fixedDateValue') });
    }
    if (state.upfrontValue) {
      options.push({ value: 'Upfront Value', label: translateLang('upfrontValue') });
    }
    if (state.valueOfSuccess) {
      options.push({ value: 'Value on Success', label: translateLang('valueOnSuccess') });
    }
    
    const currentValue = state.defaultSource || '';
    const isCurrentValueAvailable = options.some(opt => opt.value === currentValue);
    
    if (!isCurrentValueAvailable && currentValue !== '') {
      setState({ ...state, defaultSource: '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.fixedDateValue, state.upfrontValue, state.valueOfSuccess, state.defaultSource]);

  return (
    <CommonAccordion
      title={
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="subtitle1" sx={{ fontSize: '1.25rem', fontWeight: 400 }}>
            {translateLang('collectionModel')}
          </Typography>
        </Stack>
      }
      reviewMode={reviewMode}
      isEditing={isEditing}
      onEdit={handleEdit}
      onSave={handleSave}
      onCancel={handleCancel}
      defaultExpanded={defaultExpanded}
      expandIcon={false}
      actions={actions}
       icon={<Image src={SettingIcon} alt="Collection model icon" width={24} height={24} />}
    >
      <Divider />
      <Box px={2} py={2}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }} sx={{ pt: '1.5rem', pb: '0.5rem' }}>
            <SelectField
              label={ translateLang('countryRegion') }
              value={countryValue}
              onChange={(val) => setState({ ...state, countryOrRegion: val })}
              options={countryOptions}
              disabled={true}
              reviewMode={effectiveReviewMode}
              labelId="cm-country"
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Stack spacing={1}>
              <CheckboxField
                label={ translateLang('fixedDateValue') }
                checked={state.fixedDateValue}
                onChange={(checked) => setState({ ...state, fixedDateValue: checked })}
                reviewMode={effectiveReviewMode}
                translateLang={translateLang}
              />
              <CheckboxField
                label={ translateLang('upfrontValue') }
                checked={state.upfrontValue || false}
                onChange={(checked) => setState({ ...state, upfrontValue: checked })}
                reviewMode={effectiveReviewMode}
                translateLang={translateLang}
              />
              <CheckboxField
                label={ translateLang('valueOnSuccess') }
                checked={state.valueOfSuccess || false}
                onChange={(checked) => setState({ ...state, valueOfSuccess: checked })}
                reviewMode={effectiveReviewMode}
                translateLang={translateLang}
              />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }} sx={{ pt: '1.5rem', pb: '0.5rem' }}>
            <SelectField
              label={ translateLang('hostFileUploadDefault') }
              value={state.defaultSource || ''}
              onChange={(val) => setState({ ...state, defaultSource: val })}
              options={getDefaultSourceOptions()}
              disabled={disabled}
              reviewMode={effectiveReviewMode}
              labelId="cm-default-source"
              error={hasError && (!state.defaultSource || state.defaultSource === '')}
              helperText={hasError && (!state.defaultSource || state.defaultSource === '') ? translateLang('required') : ''}
            />
          </Grid>
        </Grid>
      </Box>
    </CommonAccordion>
  );
};

export default CollectionModelOptions;
