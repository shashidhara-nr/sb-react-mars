'use client';

import * as React from 'react';
import {
  Autocomplete,
  Box,
  Checkbox,
  Chip,
  FormControlLabel,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Image from 'next/image';
import IconDocumentCoins from 'public/icons/icn_document_coins.svg';
import { useForm, Controller, Path } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import CommonAccordion from '../../common/CommonAccordion';
import ReviewDescriptionList, { BoldValue } from '../../common/ReviewDescriptionList';
import { useTranslations } from 'next-intl';

export type StatementOptionState = {
  selected?: boolean;
  references?: string[];
  editableReference?: boolean;
};

export type StatementReferencingState = {
  creditItemised?: StatementOptionState;
  debitItemised?: StatementOptionState;
  debitConsolidated?: StatementOptionState;
  creditConsolidated?: StatementOptionState;
  references?: string[];                  
  editableReference?: boolean;     
  type?: string;       
};

export type StatementReferencingMode = 'payment-types' | 'collection-types' | 'custom';

export interface StatementOptionConfig {
  key: keyof StatementReferencingState;
  label: string;
  disabled?: boolean;
  defaultChecked?: boolean;
}

export const statementReferencingSchema = z.object({
  creditItemised: z.object({
    selected: z.boolean().optional(),
    references: z.array(z.string()).optional(),
    editableReference: z.boolean().optional(),
  }).optional(),
  debitItemised: z.object({
    selected: z.boolean().optional(),
    references: z.array(z.string()).optional(),
    editableReference: z.boolean().optional(),
  }).optional(),
  debitConsolidated: z.object({
    selected: z.boolean().optional(),
    references: z.array(z.string()).optional(),
    editableReference: z.boolean().optional(),
  }).optional(),
  creditConsolidated: z.object({
    selected: z.boolean().optional(),
    references: z.array(z.string()).optional(),
    editableReference: z.boolean().optional(),
  }).optional(),
  references: z.array(z.string()).optional(),
  editableReference: z.boolean().optional(),
});

type Props = {
  value: StatementReferencingState;
  onChange: (next: StatementReferencingState) => void;
  defaultExpanded?: boolean;
  disabled?: boolean;
  reviewMode?: boolean;
  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  presets?: string[] | { [key: string]: string[] };
  maxLength?: number;
  hasError?: boolean;
  expandIcon?: React.ReactNode | boolean;
  mode?: StatementReferencingMode;
  customOptions?: StatementOptionConfig[];
  actions?: React.ReactNode;
};

const getOptionsForMode = (mode: StatementReferencingMode): StatementOptionConfig[] => {
  switch (mode) {
    case 'payment-types':
      return [
        { key: 'debitItemised', label: 'Debit (itemised)', defaultChecked: true },
        { key: 'debitConsolidated', label: 'Debit (consolidated)', defaultChecked: true },
        { key: 'creditConsolidated', label: 'Credit (consolidated)', disabled: true, defaultChecked: true },
      ];
    case 'collection-types':
      return [
        { key: 'creditItemised', label: 'Credit (itemised)', defaultChecked: true },
        { key: 'creditConsolidated', label: 'Credit (consolidated)', defaultChecked: true },
        { key: 'debitItemised', label: 'Debit (itemised)', disabled: true, defaultChecked: true },
      ];
    case 'custom':
    default:
      return [];
  }
};

export const StatementReferencingOptions: React.FC<Props> = ({
  value,
  onChange,
  defaultExpanded = true,
  disabled = false,
  reviewMode = false,
  onEdit,
  onSave,
  onCancel,
  presets = [
    'REF001',
    'REF002',
    'REF003',
    'REF004'
  ],
  maxLength = 34,
  hasError = false,
  expandIcon,
  mode = 'custom',
  customOptions = [],
  actions
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [openDropdown, setOpenDropdown] = React.useState<keyof StatementReferencingState | null>(null);

  const effectiveReviewMode = reviewMode && !isEditing;

  const options = mode === 'custom' ? customOptions : getOptionsForMode(mode);

  const getPresetsForType = (typeKey: string): string[] => {
    if (Array.isArray(presets)) {
      return presets;
    }
    return (presets as Record<string, string[]>)[typeKey] || [];
  };

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
    setError,
    clearErrors,
  } = useForm<StatementReferencingState>({
    resolver: zodResolver(statementReferencingSchema),
    defaultValues: React.useMemo(() => structuredClone(value), [value]),
    mode: 'onChange',
  });
  React.useEffect(() => {
    if (mode !== 'custom') {
      options.forEach(option => {
        const currentValue = value[option.key] as StatementOptionState | undefined;
        if (option.defaultChecked !== undefined && !currentValue) {
          setFormValue(option.key as Path<StatementReferencingState>, {
            selected: option.defaultChecked,
            references: [],
            editableReference: false,
          });
        }
      });
    }
  }, [mode, options, value, setFormValue]);

  React.useEffect(() => {
    const subscription = watch((val) => {
      onChange(structuredClone(val) as StatementReferencingState);
    });
    return () => subscription.unsubscribe();
  }, [watch, onChange]);

  const translateLang = useTranslations('collectionTypesHubData');
  return (
    <CommonAccordion
      defaultExpanded={defaultExpanded}
      expandIcon={expandIcon}
      icon={<Image src={IconDocumentCoins} alt="document coins" width={24} height={24} />}
      title={
          translateLang('statementReferencingOptions')
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
            <Stack spacing={3}>
              {getReviewSections(value).map((section, index) => (
                <Box key={index}>
                  <Grid container columnSpacing={{ xs: 2, md: 6 }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <ReviewDescriptionList
                        items={section.left}
                        labelWidth={{ xs: 220, md: 280 }}
                        rowGap={2}
                        stack
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <ReviewDescriptionList
                        items={section.right}
                        labelWidth={{ xs: 240, md: 320 }}
                        rowGap={2}
                        stack
                      />
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Stack>
          </Box>
        ) : (
          <form>
            <Box px={2} py={1.5}>
              <Typography variant="body2" color="#222E37" sx={{ fontSize: '1.125rem', fontWeight: 400 }}>
               { translateLang('statementReferenceNote') }
              </Typography>
            </Box>

            <Box px={2} py={1.5}>
              <Stack spacing={1.25}>
                {options.map((optionConfig, index) => {
                  const optionData = watch(optionConfig.key) as StatementOptionState | undefined;
                  const editable = optionData?.editableReference || false;
                  
                  return (
                    <React.Fragment key={optionConfig.key}>
                      <Controller
                        name={`${optionConfig.key}.selected` as Path<StatementReferencingState>}
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Checkbox 
                                {...field} 
                                checked={Boolean(field.value)} 
                                disabled={optionConfig.disabled || disabled} 
                              />
                            }
                            label={optionConfig.label}
                          />
                        )}
                      />
                      
                      <Controller
                        name={`${optionConfig.key}.references` as Path<StatementReferencingState>}
                        control={control}
                        render={({ field }) => {
                          return (
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', ml: 4 }}>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Autocomplete
                                  multiple
                                  freeSolo={editable}
                                  disabled={disabled}
                                  disableClearable
                                  open={openDropdown === optionConfig.key}
                                  onOpen={() => setOpenDropdown(optionConfig.key)}
                                  onClose={() => setOpenDropdown(null)}
                                  options={getPresetsForType(String(optionConfig.key))}
                                  value={(field.value as string[]) || []}
                                  onChange={(_, newValue) => {
                                    setFormValue(`${optionConfig.key}.references` as Path<StatementReferencingState>, newValue, { shouldValidate: true });
                                  }}
                                  renderTags={(value, getTagProps) =>
                                    value.map((tagOption, tagIndex) => (
                                      <Chip
                                        {...getTagProps({ index: tagIndex })}
                                        key={tagOption}
                                        label={tagOption}
                                        color="primary"
                                        variant="filled"
                                        size="small"
                                      />
                                    ))
                                  }
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      label={translateLang('statementReferences')}
                                      placeholder={editable ? 'Type and press Enter to add…' : translateLang('useDropdownToAddReferences')}
                                      InputProps={{
                                        ...params.InputProps,
                                      }}
                                       sx={{
                                        '& .MuiOutlinedInput-root': {
                                          borderRadius: '0.5rem',
                                        },
                                      }}
                                      />
                                  )}
                                />
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', pt: 1, flexShrink: 0 }}>
                                <Controller
                                  name={`${optionConfig.key}.editableReference` as Path<StatementReferencingState>}
                                  control={control}
                                  render={({ field: editableField }) => (
                                    <FormControlLabel
                                      control={<Checkbox {...editableField} checked={Boolean(editableField.value)} disabled={disabled} />}
                                      label={ translateLang('editableStatementReference') }
                                      sx={{ whiteSpace: 'nowrap' }}
                                    />
                                  )}
                                />
                              </Box>
                            </Box>
                          );
                        }}
                      />
                    </React.Fragment>
                  );
                })}
              </Stack>
            </Box>
          </form>
        )}
    </CommonAccordion>
  );
};

function getReviewSections(value: StatementReferencingState) {
  const sections: Array<{
    left: Array<{ label: string; value: React.ReactNode }>;
    right: Array<{ label: string; value: React.ReactNode }>;
  }> = [];

  const statementTypes = [
    { key: 'creditItemised', label: 'Credit (itemised)' },
    { key: 'creditConsolidated', label: 'Credit (consolidated)' },
    { key: 'debitItemised', label: 'Debit (itemised)' },
    { key: 'debitConsolidated', label: 'Debit (consolidated)' },
  ] as const;

  statementTypes.forEach(type => {
    const optionData = value[type.key] as StatementOptionState | undefined;
    
    if (optionData?.selected) {
      const references = optionData.references || [];
      const refsValue = references.length > 0 ? (
        <Stack spacing={0.5}>
          {references.map((v, i) => (
            <BoldValue key={i}>{v}</BoldValue>
          ))}
        </Stack>
      ) : (
        <BoldValue>-</BoldValue>
      );

      sections.push({
        left: [
          {
            label: 'Statement reference type',
            value: <BoldValue>{type.label}</BoldValue>
          },
          {
            label: 'Statement references',
            value: refsValue
          }
        ],
        right: [
          {
            label: 'Editable statement reference',
            value: <BoldValue>{optionData.editableReference ? 'Yes' : 'No'}</BoldValue>
          }
        ]
      });
    }
  });

  return sections;
}