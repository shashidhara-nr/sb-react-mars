
'use client';

import * as React from 'react';
import {
  Box,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Typography,
  FormHelperText
} from '@mui/material';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import Image from 'next/image';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import CommonAccordion from '../../common/CommonAccordion';
import { useTranslations } from 'next-intl';

export type HostToHostOptionsState = {
  batchErrorRejection: 'rejectBatch' | 'rejectInstruction' | 'rejectTransaction';
  cutoffBreach: 'rejectBatch' | 'rejectInstruction' | 'adjustInstruction';
  allowEditingAfterUpload: boolean;
  defaultFundingOption: 'Populated' | 'Available funds' | 'Credit facility';
};

export const hostToHostOptionsSchema = z.object({
  batchErrorRejection: z.enum(['rejectBatch', 'rejectInstruction', 'rejectTransaction']),
  cutoffBreach: z.enum(['rejectBatch', 'rejectInstruction', 'adjustInstruction']),
  allowEditingAfterUpload: z.boolean(),
  defaultFundingOption: z.enum(['Populated', 'Available funds', 'Credit facility']),
}).refine(
  (data) => {
    // If allowEditingAfterUpload is true, defaultFundingOption is required
    if (data.allowEditingAfterUpload) {
      return !!data.defaultFundingOption;
    }
    return true;
  },
  {
    message: 'defaultFundingOptionRequired',
    path: ['defaultFundingOption'],
  }
);

type Props = {
  value: HostToHostOptionsState;
  onChange: (next: HostToHostOptionsState) => void;
  defaultExpanded?: boolean;
  disabled?: boolean;
  reviewMode?: boolean;
  expandIcon?: React.ReactNode | boolean;
  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  fundingOptions?: Array<'Populated' | 'Available funds' | 'Credit facility'>;
  hasError?: boolean;
  hideAllowEditingAfterUpload?: boolean;
  hideDefaultFundingOption?: boolean;
  actions?: React.ReactNode;
};

const SectionLabel: React.FC<React.PropsWithChildren> = ({ children }) => (
  <FormLabel
    sx={{
      color: 'text.primary',
      fontWeight: 700,
      mb: 1.5,
      '&.Mui-focused': { color: 'text.primary' }
    }}
  >
    {children}
  </FormLabel>
);

export const HostToHostOptions: React.FC<Props> = ({
  value,
  onChange,
  defaultExpanded = true,
  disabled = false,
  reviewMode = false,
  onEdit,
  onSave,
  onCancel,
  fundingOptions = ['Populated', 'Available funds', 'Credit facility'],
  hasError = false,
  hideAllowEditingAfterUpload = false,
  hideDefaultFundingOption = false,
  expandIcon=true,
  actions
}) => {
  const [isEditing, setIsEditing] = React.useState(false);

  const effectiveReviewMode = reviewMode && !isEditing;

  React.useEffect(() => {
    if (!reviewMode) {
      setIsEditing(false);
    }
  }, [reviewMode]);

  const {
    control,
    handleSubmit,
    setValue: setFormValue,
    watch,
    formState: { errors },
  } = useForm<HostToHostOptionsState>({
    resolver: zodResolver(hostToHostOptionsSchema),
    defaultValues: value,
    mode: 'onChange',
  });

  // Sync form state with parent
  React.useEffect(() => {
    const subscription = watch((val) => {
      onChange(val as HostToHostOptionsState);
    });
    return () => subscription.unsubscribe();
  }, [watch, onChange]);
  const translateLang = useTranslations('collectionTypesHubData');

  // Helper function to translate funding options
  const translateFundingOption = (option: string) => {
    const fundingOptionMap: Record<string, string> = {
      'Populated': translateLang('populated'),
      'Available funds': translateLang('availableFunds'),
      'Credit facility': translateLang('creditFacility'),
    };
    return fundingOptionMap[option] || option;
  };
  return (
    <CommonAccordion
      defaultExpanded={defaultExpanded}
      expandIcon={expandIcon}
      icon={<SyncAltIcon fontSize="small" color="action" />}
      title={
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="subtitle1" sx={{ fontSize: '1.25rem', fontWeight: 400 }}>
            { translateLang('hostToHostOptions') }
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
      }}
      onSave={() => {
        // Validate before saving; only exit edit mode when valid
        handleSubmit(() => {
          onSave?.();
          setIsEditing(false);
        })();
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
      {effectiveReviewMode ? (
          <Box px={2} py={2}>
            <Grid container columnSpacing={{ xs: 2, md: 6 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <ReviewDescriptionList
                  items={getLeftReviewRows(value, hideDefaultFundingOption, hideAllowEditingAfterUpload, translateLang)}
                  labelWidth={{ xs: 220, md: 280 }}
                  rowGap={2}
                  stack
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <ReviewDescriptionList
                  items={getRightReviewRows(value, translateLang)}
                  labelWidth={{ xs: 220, md: 280 }}
                  rowGap={2}
                  stack
                />
              </Grid>
            </Grid>
          </Box>
        ) : (
          <form>
            {/* Helper description */}
            <Box px={2} py={1.5}>
              <Typography variant="body2" color="text.neutral">
                 { translateLang('selectBatchProcessingOptions') }
              </Typography>
            </Box>

            {/* Two-column radio groups */}
            <Box px={2} pb={2}>
              <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="batchErrorRejection"
                    control={control}
                    render={({ field }) => (
                      <FormControl component="fieldset" disabled={disabled} fullWidth >
                        <SectionLabel> { translateLang('batchErrorRejectionOptions') }</SectionLabel>
                        <RadioGroup
                          {...field}
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                        >
                          <FormControlLabel
                            value="rejectBatch"
                            control={<Radio />}
                            label= { translateLang('rejectErroneousBatch') }
                          />
                          <FormControlLabel
                            value="rejectInstruction"
                            control={<Radio />}
                            label= { translateLang('rejectErroneousInstruction') }
                          />
                          <FormControlLabel
                            value="rejectTransaction"
                            control={<Radio />}
                            label= { translateLang('rejectErroneousTransaction') }
                          />
                        </RadioGroup>
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="cutoffBreach"
                    control={control}
                    render={({ field }) => (
                      <FormControl component="fieldset" disabled={disabled} fullWidth>
                        <SectionLabel> { translateLang('cutOffTimeBreach') }</SectionLabel>
                        <RadioGroup
                          {...field}
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                        >
                          <FormControlLabel
                            value="rejectBatch"
                            control={<Radio />}
                            label= { translateLang('rejectBatch') }
                          />
                          <FormControlLabel
                            value="rejectInstruction"
                            control={<Radio />}
                            label= { translateLang('rejectInstruction') }
                          />
                          <FormControlLabel
                            value="adjustInstruction"
                            control={<Radio />}
                            label= { translateLang('adjustInstruction') }
                          />
                        </RadioGroup>
                      </FormControl>
                    )}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Checkbox row (optional) */}
            {!hideAllowEditingAfterUpload && (
              <>
                <Divider />
                <Box p={2}>
                  <Controller
                    name="allowEditingAfterUpload"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} checked={field.value} disabled={disabled} />}
                        label= { translateLang('allowEditingAfterUpload') }
                      />
                    )}
                  />
                </Box>
              </>
            )}

            {/* Default funding option select (optional) */}
            {!hideDefaultFundingOption && (
              <>
                <Divider />
                <Box px={2} py={2}>
                  <Grid container>
                    <Grid size={{ xs: 12, md: 6 }} sx={{ mt: '1.5rem' }}>
                      <Controller
                        name="defaultFundingOption"
                        control={control}
                        render={({ field }) => (
                          <FormControl sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '0.5rem',
                            },
                          }} fullWidth disabled={disabled} error={!!errors.defaultFundingOption}>
                            <InputLabel id="funding-option-label"> { translateLang('defaultFundingOption') }</InputLabel>
                            <Select
                              {...field}
                              labelId="funding-option-label"
                              label={ translateLang('defaultFundingOption') }
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value)}
                              
                            >
                              {fundingOptions.map((opt) => (
                                <MenuItem key={opt} value={opt}>
                                  {translateFundingOption(opt)}
                                </MenuItem>
                              ))}
                            </Select>
                            {!!errors.defaultFundingOption && (
                              <FormHelperText>{translateLang(errors.defaultFundingOption.message as string)}</FormHelperText>
                            )}
                          </FormControl>
                        )}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </>
            )}
          </form>
        )}
    </CommonAccordion>
  );
};

function BoldValue({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      component="span"
      sx={{ fontSize: '1.25rem', fontWeight: 500, lineHeight: '20px' }}
    >
      {children}
    </Typography>
  );
}

type Row = { label: string; value: React.ReactNode };

function ReviewDescriptionList({
  items,
  labelWidth,
  rowGap,
  stack = false,
}: {
  items: Row[];
  labelWidth: any;
  rowGap: number;
  stack?: boolean;
}) {
  return (
    <Stack component="dl" spacing={rowGap} sx={{ m: 0 }}>
      {items.map((it, idx) => (
        <Stack
          key={idx}
          direction={stack ? 'column' : 'row'}
          alignItems={stack ? 'stretch' : 'flex-start'}
          gap={stack ? 0.5 : 2}
          component="div"
          sx={{ minHeight: 24 }}
        >
          <Typography
            component="dt"
            variant="body2"
            color="text.neutral"
            sx={{
              width: stack ? undefined : labelWidth,
              fontSize: '1rem',
              fontWeight: 400,
              lineHeight: '20px',
              mt: stack ? 0 : '2px',
            }}
          >
            {it.label}
          </Typography>
          <Box
            component="dd"
            sx={{
              m: 0,
              flex: stack ? undefined : 1,
              color: (t) => t.palette.text.primary,
              fontSize: '1.25rem',
              fontWeight: 500,
              lineHeight: '20px',
              whiteSpace: 'pre-wrap',
            }}
          >
            {it.value}
          </Box>
        </Stack>
      ))}
    </Stack>
  );
}

function getLeftReviewRows(value: HostToHostOptionsState, hideDefaultFundingOption?: boolean, hideAllowEditingAfterUpload?: boolean, translateLang?: any): Row[] {
  const batchMap: Record<HostToHostOptionsState['batchErrorRejection'], string> = {
    rejectBatch: translateLang ? translateLang('rejectErroneousBatch') : 'Reject erroneous batch',
    rejectInstruction: translateLang ? translateLang('rejectErroneousInstruction') : 'Reject erroneous instruction',
    rejectTransaction: translateLang ? translateLang('rejectErroneousTransaction') : 'Reject erroneous transaction',
  };

  const translateFundingOption = (option: string) => {
    if (!translateLang) return option;
    const fundingOptionMap: Record<string, string> = {
      'Populated': translateLang('populated'),
      'Available funds': translateLang('availableFunds'),
      'Credit facility': translateLang('creditFacility'),
    };
    return fundingOptionMap[option] || option;
  };

  const rows: Row[] = [
    { label: translateLang ? translateLang('batchErrorRejectionOptions') : 'Batch error rejection options', value: <BoldValue>{batchMap[value.batchErrorRejection]}</BoldValue> },
  ];

  if (!hideAllowEditingAfterUpload) {
    rows.push({ label: translateLang ? translateLang('allowEditingAfterUpload') : 'Allow editing after upload', value: <BoldValue>{value.allowEditingAfterUpload ? (translateLang ? translateLang('yes') : 'Yes') : (translateLang ? translateLang('no') : 'No')}</BoldValue> });
  }

  if (!hideDefaultFundingOption) {
    rows.push({ label: translateLang ? translateLang('defaultFundingOption') : 'Default funding option', value: <BoldValue>{translateFundingOption(value.defaultFundingOption)}</BoldValue> });
  }

  return rows;
}

function getRightReviewRows(value: HostToHostOptionsState, translateLang?: any): Row[] {
  const cutoffMap: Record<HostToHostOptionsState['cutoffBreach'], string> = {
    rejectBatch: translateLang ? translateLang('rejectBatch') : 'Reject batch',
    rejectInstruction: translateLang ? translateLang('rejectInstruction') : 'Reject instruction',
    adjustInstruction: translateLang ? translateLang('adjustInstruction') : 'Adjust instruction',
  };

  const rows: Row[] = [
    { label: translateLang ? translateLang('cutOffTimeBreach') : 'Cut-off time breach', value: <BoldValue>{cutoffMap[value.cutoffBreach]}</BoldValue> },
  ];

  return rows;
}
