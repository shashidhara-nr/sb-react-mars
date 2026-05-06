'use client';

import React from 'react';
import Image from 'next/image';
import {
  Box,
  Typography,
  FormHelperText,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  Radio,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Autocomplete,
  TextField,
  Divider,
  Stack,
  CircularProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { AccountBalance as AccountBalanceIcon } from '@mui/icons-material';
import Textfield from '@atoms/Textfield/Textfield';
import DatePicker from '@atoms/DatePicker/DatePicker';
import SelectField from '@atoms/Select/Select';
import {
  Button,
  MultipleSelectChip,
  PhoneNumber,
  Amount,
} from 'dist/standard-bank-react';
import { UsageChips } from 'components/common/usageChips';
import IcnCloseIcon from 'public/icons/close-icon.svg';
import IcnSaveIcon from 'public/icons/col-icon-left-save.svg';
import EditIcon from 'public/icons/col-icon-left-pencil.svg';
import IcnMagGlass from 'public/icons/col_mag_glass.svg';
import IcnReset from 'public/icons/reset-icon.svg';
import IcnLoading from 'public/icons/loading.svg';
import CloseStandardBlue from 'public/icons/close_standard_blue.svg';
import { RHFProvider, RHFTextfield, RHFSelectField, RHFDatePicker, InfoBlock } from 'components/common';
import { Controller, useWatch, useForm } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';
import AccountInfoDropdown, { AccountInfoOption } from 'components/common/AccountInfoDropdown';
import IconChevronDown from 'public/icons/chevron_down.svg';
import { buildTestId } from 'src/utils/testIds';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { AutocompleteField, type AutocompleteFieldOption } from '../AutocompleteField';

export type CommanFieldOption = { label: string; value: string | number };
export type RichAutocompleteOption = {
  label: string;
  value: string | number;
  subtitle?: string;
  metadata?: { label: string; value: string }[];
};
type CheckboxInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  'data-testid'?: string;
};

export type CommanField = {
  name: string;
  label: string;
  placeholder?: string;
  value?: string | number;
  type?:
    | 'text'
    | 'select'
    | 'multiChip'
    | 'phone'
    | 'amount'
    | 'radio'
    | 'accountInfo'
    | 'date'
    | 'button'
    | 'checkbox'
    | 'autocomplete'
    | 'headerLabel';
  required?: boolean;
  options?: CommanFieldOption[];
  autocompleteRichOptions?: RichAutocompleteOption[];
  fullWidth?: boolean;
  rightBlank?: boolean;
  lookupBtn?: boolean;
  chip?: boolean;
  chipOptions?: { label: string; value: string }[];
  chipSelectedValues?: string[];
  chipTargetFieldName?: string;
  multiSelectedValues?: string[];
  multiTargetFieldName?: string;
  multiJoin?: string;
  amountCurrency?: string;
  amountCurrencyOptions?: { label: string; value: string }[];
  amountCurrencyTargetName?: string;
  helperText?: string;
  alwaysShowHelperText?: boolean;
  disabled?: boolean;
  showWhen?: { field: string; value: any };
  accountInfoOptions?: AccountInfoOption[];
  hideInEdit?: boolean;
  hideInReview?: boolean;
  showWhenEditingInReview?: boolean;
  // Button-specific properties
  buttonVariant?:
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'text'
    | 'error'
    | 'primary-header-menu'
    | 'primary-on-colour'
    | 'secondary-on-colour'
    | 'tertiary-on-colour'
    | 'error-secondary'
    | 'error-tertiary';
  onClick?: () => void;
  buttonText?: string;
  startIcon?: any;
  endIcon?: any;
  buttonHeight?: string | number;
  buttonMarginTop?: string | number;
  headerIcon?: any; 
};

type CustomContentValue =
  | React.ReactNode
  | ((params: { editingActive: boolean; mode: 'edit' | 'view' | 'review' }) => React.ReactNode);

export interface CreateJournyFormProps {
  title?: string;
  titleIcon?: string;
  fields?: CommanField[];
  onChange: (name: string, value: any) => void;
  fullWidth?: boolean;
  mode?: 'edit' | 'view' | 'review';
  ShowActionBtns?: boolean;
  sections?: Array<{
    title?: string;
    titleIcon?: string;
    fields: CommanField[];
    ShowActionBtns?: boolean;
    hideIconWhenNotEditing?: boolean;
    customContent?: CustomContentValue;
    customContentPadding?: string | number;
    titleIconEelement?: React.ReactNode;
    readOnly?: boolean;
  }>;
  renderWithRHF?: boolean;
  formMethods?: UseFormReturn<any>;
  onSubmit?: (data: any) => void | boolean | Promise<void | boolean>;
  onValidationFail?: (errors: any) => void;
  rulesProvider?: (name: string, getAllValues: () => any) => any;
  onLookup?: (fieldName: string) => void;
  onReset?: (fieldName: string) => void;
  showInfoBlock?: boolean;
  infoBlockResultsFound?: boolean;
  infoBlockTitle?: string;
  infoBlockDescription?: string;
  infoBlockEntityType?: 'bank' | 'company';
  lookupLoading?: boolean;
  syncOnChange?: boolean;
  // When true, render sections as Material UI Accordions
  showAccordion?: boolean;
  validationContext?: 'debtors' | 'bopThirdParties' | 'beneficiaries' | 'transactionalAuthProfile';
  isEntity?: boolean;
  testIdPrefix?: string;
  customContent?: CustomContentValue;
  customContentPadding?: string | number;
  sectionsInSingleCard?: boolean;
  infoMessage?: string;
   titleIconEelement?: React.ReactNode;
  hideSectionBottomBorder?: boolean;
  hideSectionTopBorder?: boolean;
  onEditModeChange?: (isEditing: boolean) => void;
  noBorder?: boolean;
}

function CreateJournyForm({
  title,
  titleIcon,
  fields = [],
  onChange,
  fullWidth = false,
  mode = 'edit',
  ShowActionBtns = false,
  sections,
  renderWithRHF = false,
  formMethods,
  onSubmit,
  onValidationFail,
  rulesProvider,
  onLookup,
  onReset,
  showInfoBlock,
  infoBlockResultsFound,
  infoBlockTitle,
  infoBlockDescription,
  infoBlockEntityType = 'bank',
  lookupLoading = false,
  infoMessage,
  syncOnChange = true,
  showAccordion = false,
  validationContext = 'debtors',
  isEntity = false,
  testIdPrefix = 'create-journey-form',
  customContent,
  customContentPadding = '12px',
  sectionsInSingleCard = false,
  titleIconEelement=undefined,
  hideSectionBottomBorder = false,
  hideSectionTopBorder = false,
  onEditModeChange,
  noBorder = false,
}: CreateJournyFormProps) {
  const [editingActive, setEditingActive] = React.useState(mode === 'edit');
  
  // Create a default form instance when formMethods is not provided
  // This ensures useWatch always has a valid control object
  const defaultFormMethods = useForm();
  const activeFormMethods = formMethods || defaultFormMethods;
  
  // Wrapper to call onEditModeChange callback when edit mode changes
  const updateEditingActive = React.useCallback((isEditing: boolean) => {
    setEditingActive(isEditing);
    onEditModeChange?.(isEditing);
  }, [onEditModeChange]);
  
  const preEditValuesRef = React.useRef<any>(null);
  React.useEffect(() => {
    updateEditingActive(mode === 'edit');
  }, [mode, updateEditingActive]);

  // When using RHF rendering, mirror RHF value changes back to Redux via onChange
  React.useEffect(() => {
    if (renderWithRHF && formMethods && syncOnChange) {
      const subscription = formMethods.watch((values, { name }) => {
        if (!name) return;
        const current = (values as Record<string, any>)[name];
        onChange(name, current);
      });
      return () => subscription.unsubscribe();
    }
  }, [renderWithRHF, formMethods, onChange, syncOnChange]);
  const columns = fullWidth ? 1 : 2;
  const baseFields: CommanField[] = Array.isArray(fields) ? (fields as CommanField[]) : [];
  const getFieldTestId = React.useCallback(
    (fieldName: string, suffix: string) => buildTestId(testIdPrefix, 'field', fieldName, suffix),
    [testIdPrefix],
  );
  const getSectionTestId = React.useCallback(
    (sectionTitle?: string) => buildTestId(testIdPrefix, 'section', sectionTitle || 'default'),
    [testIdPrefix],
  );
  const resolveCustomContent = React.useCallback(
    (content?: CustomContentValue) => {
      if (typeof content === 'function') {
        return content({ editingActive, mode });
      }
      return content;
    },
    [editingActive, mode],
  );

  const buildItems = (fieldsList: CommanField[]) => {
    const items: Array<{
      key: string;
      type: 'field' | 'spacer';
      span: 1 | 2;
      field?: CommanField;
    }> = [];
    for (let i = 0; i < fieldsList.length; i++) {
      const f = fieldsList[i];
      if (columns === 1) {
        items.push({ key: f.name, type: 'field', span: 1, field: f });
        continue;
      }
      if (f.chip) {
        items.push({ key: f.name, type: 'field', span: 2, field: f });
        continue;
      }
      if (f.type === 'headerLabel') {
        items.push({ key: f.name, type: 'field', span: 2, field: f });
        continue;
      }
      if (f.fullWidth) {
        items.push({ key: f.name, type: 'field', span: 2, field: f });
        continue;
      }
      if (f.rightBlank) {
        items.push({ key: f.name, type: 'field', span: 1, field: f });
        items.push({ key: `${f.name}__spacer`, type: 'spacer', span: 1 });
        continue;
      }
      const next = fieldsList[i + 1];
      if (next && !next.fullWidth && !next.rightBlank) {
        items.push({ key: f.name, type: 'field', span: 1, field: f });
        items.push({ key: next.name, type: 'field', span: 1, field: next });
        i++;
      } else {
        items.push({ key: f.name, type: 'field', span: 1, field: f });
        items.push({ key: `${f.name}__spacer`, type: 'spacer', span: 1 });
      }
    }
    return items;
  };

  // Collect all fields with showWhen dependencies across all sections
  // Watch them at component level to avoid "fewer hooks" error when sections change
  const allFieldsWithShowWhen = React.useMemo(() => {
    const allFields: CommanField[] = [];
    if (sections && sections.length) {
      sections.forEach((section) => {
        allFields.push(...(section.fields || []));
      });
    }
    allFields.push(...baseFields);
    return allFields.filter((f) => f.showWhen);
  }, [sections, baseFields]);

  const fieldsToWatch = React.useMemo(
    () => Array.from(new Set(allFieldsWithShowWhen.map((f) => f.showWhen!.field))),
    [allFieldsWithShowWhen],
  );

  // Hook called once per render cycle, regardless of number of sections
  // Use activeFormMethods to ensure control is always defined
  const watchedFieldsArray = useWatch({
    control: activeFormMethods.control,
    name: renderWithRHF && formMethods && fieldsToWatch.length > 0 ? fieldsToWatch : [],
  });

  // Convert watched array to object for easier lookup
  const watchedFieldsGlobal = React.useMemo(() => {
    if (!renderWithRHF || !formMethods || fieldsToWatch.length === 0) {
      return {};
    }
    const result: Record<string, any> = {};
    fieldsToWatch.forEach((fieldName, index) => {
      result[fieldName] = watchedFieldsArray?.[index];
    });
    return result;
  }, [renderWithRHF, formMethods, fieldsToWatch, watchedFieldsArray]);

  const renderSection = (
    secTitle?: string,
    secIcon?: string,
    fieldsList: CommanField[] = [],
    secShowActionBtns?: boolean,
    hideIconWhenNotEditing?: boolean,
    secCustomContent?: CustomContentValue,
    secCustomContentPadding: string | number = '12px',
    asSubsection = false,
    isLastSubsection = false,
    titleIconEelement?: React.ReactNode,
    idx: number = 0
  ) => {
    const items = buildItems(fieldsList);
    const sectionKey =
      (secTitle || 'section') + '-' + items.length + '-' + (fieldsList[0]?.name || '');
    const resolvedSectionCustomContent = resolveCustomContent(secCustomContent);

    // Use globally watched fields from component level - no hooks called here
    // This prevents "fewer hooks" error when number of sections changes
    const watchedFields: Record<string, any> = watchedFieldsGlobal;

    const header = secTitle && (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px',
          borderBottom: showAccordion ? 'none' : (asSubsection && !secShowActionBtns ? 'none' : '1px solid #E0E5EB'),
          marginBottom: showAccordion ? 0 : 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {secIcon && (!hideIconWhenNotEditing || editingActive || mode === 'edit') ? (
            <Image src={secIcon} alt={secTitle} width={28} height={28} />
          ) : null}
            {titleIconEelement ? titleIconEelement : null}
          <Typography sx={{ fontWeight: 400, fontSize: '20px', color: '#333' }}>
            {secTitle}
          </Typography>
        </Box>
        {secShowActionBtns && mode !== 'edit' ? (
          editingActive ? (
            <Box sx={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Button
                buttonVariant="text"
                data-testid={buildTestId(testIdPrefix, secTitle || 'section', 'cancel-edit')}
                onClick={() => {
                  if (renderWithRHF && formMethods && preEditValuesRef.current) {
                    formMethods.reset(preEditValuesRef.current);
                  }
                  updateEditingActive(false);
                }}
                sx={{
                  color: '#0051FF',
                  fontSize: '12px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                }}
                startIcon={<Image src={IcnCloseIcon} alt="close" width={24} height={24} />}
                style={{
                  height: '36px',
                  minHeight: '36px',
                  width: '110px',
                  marginTop: '-10px',
                }}
              >
                CANCEL
              </Button>
              <Button
                buttonVariant="text"
                data-testid={buildTestId(testIdPrefix, secTitle || 'section', 'save-edit')}
                onClick={() => {
                  if (renderWithRHF && formMethods && onSubmit) {
                    formMethods.handleSubmit(
                      async (data) => {
                        const submitResult = await onSubmit(data);
                        if (submitResult === false) return;
                        updateEditingActive(false);
                      },
                      (errors) => {
                        onValidationFail && onValidationFail(errors);
                      },
                    )();
                  } else {
                    updateEditingActive(false);
                  }
                }}
                sx={{
                  color: '#0051FF',
                  fontSize: '12px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                }}
                startIcon={<Image src={IcnSaveIcon} alt="save" width={24} height={24} />}
                style={{
                  height: '36px',
                  minHeight: '36px',
                  width: '90px',
                  marginTop: '-10px',
                }}
              >
                SAVE
              </Button>
            </Box>
          ) : (
            <Button
              buttonVariant="text"
              data-testid={buildTestId(testIdPrefix, secTitle || 'section', 'enable-edit')}
              onClick={() => {
                if (renderWithRHF && formMethods) {
                  preEditValuesRef.current = formMethods.getValues();
                }
                updateEditingActive(true);
              }}
              sx={{
                color: '#0051FF',
                fontWeight: '700',
                textTransform: 'uppercase',
              }}
              style={{
                width: '85px',
                height: '36px',
                minHeight: '36px',
                marginTop: '-10px',
                fontSize: '15px',
                fontStyle: 'bold',
              }}
              startIcon={<Image src={EditIcon} alt="edit" width={24} height={24} />}
            >
              EDIT
            </Button>
          )
        ) : null}
      </Box>
    );

    const sectionFieldsBody = items.length ? (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: columns === 1 ? '1fr' : '1fr 1fr',
          gap: '16px',
          padding: '12px',
          maxWidth: '100%',
          boxSizing: 'border-box',
          '& .MuiOutlinedInput-root': { borderRadius: '8px', height: '48px' },
          '& .MuiInputLabel-root:not(.MuiInputLabel-shrink)': {
            top: '24px',
            transform: 'translateY(-50%)',
            left: '14px',
          },
          '& .MuiInputLabel-root.MuiInputLabel-shrink': {
            top: '0px',
            left: '0px',
          },
        }}
      >
        {items.map((item) => {
          if (item.type === 'spacer') {
            return <Box key={item.key} sx={{ gridColumn: `span ${item.span}` }} />;
          }

          const field = item.field!;

          // Skip fields that should be hidden in edit mode
          if (field.hideInEdit && editingActive) {
            return null;
          }

          // Skip fields that should be hidden in review mode (unless editing)
          if (field.hideInReview && mode === 'review' && !editingActive) {
            return null;
          }

          // Skip fields that should only appear when editing in review mode
          if (field.showWhenEditingInReview && mode === 'review' && !editingActive) {
            return null;
          }

          // Check showWhen condition for conditional field visibility
          if (field.showWhen) {
            const dependentFieldValue =
              renderWithRHF && formMethods
                ? watchedFields[field.showWhen.field]
                : fieldsList.find((f) => f.name === field.showWhen?.field)?.value;

            if (dependentFieldValue !== field.showWhen.value) {
              return null; // Hide field if condition not met
            }
          }

          const fieldLabel = field.label;
          const fieldPlaceholder = field.placeholder || field.label;

          if (field.type === 'multiChip') {
            const optionObjs = (field.options || []).map((o) => ({
              label: o.label,
              value: String(o.value),
            }));
            const selectedValues = Array.isArray(field.multiSelectedValues)
              ? field.multiSelectedValues
              : typeof field.value === 'string' && field.value
                ? String(field.value).split(',')
                : [];
            const selectedObjs = optionObjs.filter((o) => selectedValues.includes(o.value));
            const targetName = field.multiTargetFieldName || field.name;
            const joiner = typeof field.multiJoin === 'string' ? field.multiJoin : ', ';

            return (
              <Box key={field.name} sx={{ gridColumn: `span ${item.span}` }} data-testid={getFieldTestId(field.name, 'container')}>
                {editingActive ? (
                  renderWithRHF && formMethods ? (
                    (() => {
                      const { control, formState } = formMethods;
                      const err = (formState?.errors || {}) as any;
                      const fieldErr = err?.[targetName];
                      return (
                        <Controller
                          name={targetName}
                          control={control}
                          rules={(() => {
                            const businessRules =
                              typeof rulesProvider === 'function'
                                ? rulesProvider(targetName, () => formMethods.getValues()) || {}
                                : {};
                            // Use custom business message for paymentType; avoid generic required
                            const requiredRule =
                              field.required && targetName !== 'paymentType'
                                ? { required: 'This field is required' }
                                : {};
                            return { ...requiredRule, ...businessRules } as any;
                          })()}
                          render={({ field: rhfField }: { field: any }) => (
                            <Box sx={{ '& > div': { margin: '0 !important' } }}>
                              <MultipleSelectChip
                                label={fieldLabel}
                                options={optionObjs}
                                selected={selectedObjs}
                                OnChange={(values: string[]) => {
                                  rhfField.onChange(values);
                                  if (syncOnChange) onChange(targetName, values);
                                }}
                                placeholder={fieldLabel}
                                error={Boolean(fieldErr)}
                                helperText={(fieldErr?.message as string) || ''}
                              />
                            </Box>
                          )}
                        />
                      );
                    })()
                  ) : (
                    <Box sx={{ '& > div': { marginTop: '0 !important' } }}>
                      <MultipleSelectChip
                        label={fieldLabel}
                        options={optionObjs}
                        selected={selectedObjs}
                        OnChange={(values: string[]) => {
                          // Persist arrays to Redux; join only for display
                          onChange(targetName, values);
                        }}
                        placeholder={fieldLabel}
                        error={false}
                        helperText=""
                      />
                    </Box>
                  )
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2" sx={{ color: '#999', fontSize: '12px', mb: 0.5 }}>
                      {field.label}
                    </Typography>
                    <Typography sx={{ fontWeight: 500, fontSize: '14px' }}>
                      {selectedValues.length ? selectedValues.join(joiner) : '-'}
                    </Typography>
                  </Box>
                )}
              </Box>
            );
          }

          if (field.type === 'autocomplete') {
            const useRichFormat = !!field.autocompleteRichOptions;
            const optionObjs: AutocompleteFieldOption[] = useRichFormat
              ? (field.autocompleteRichOptions || []).map((o) => ({
                  label: o.label,
                  value: String(o.value),
                  subtitle: o.subtitle,
                  metadata: o.metadata,
                }))
              : (field.options || []).map((o) => ({
                  label: o.label,
                  value: String(o.value),
                }));

            return (
              <Box key={field.name} sx={{ gridColumn: `span ${item.span}` }} data-testid={getFieldTestId(field.name, 'container')}>
                {editingActive ? (
                  renderWithRHF && formMethods ? (
                    (() => {
                      const { control, formState } = formMethods;
                      const err = (formState?.errors || {}) as any;
                      const fieldErr = err?.[field.name];
                      return (
                        <Controller
                          name={field.name}
                          control={control}
                          rules={(() => {
                            const businessRules =
                              typeof rulesProvider === 'function'
                                ? rulesProvider(field.name, () => formMethods.getValues()) || {}
                                : {};
                            const requiredRule = field.required
                              ? { required: 'This field is required' }
                              : {};
                            return { ...requiredRule, ...businessRules } as any;
                          })()}
                          render={({ field: rhfField }: { field: any }) => (
                            <AutocompleteField
                              label={fieldLabel}
                              placeholder={fieldPlaceholder}
                              options={optionObjs}
                              value={rhfField.value}
                              onChange={(val) => {
                                rhfField.onChange(val);
                                if (syncOnChange) onChange(field.name, val);
                              }}
                              disabled={field.disabled}
                              rich={useRichFormat}
                              error={Boolean(fieldErr)}
                              helperText={(fieldErr?.message as string) || ''}
                              dataTestId={getFieldTestId(field.name, 'input')}
                            />
                          )}
                        />
                      );
                    })()
                  ) : (
                    <AutocompleteField
                      label={fieldLabel}
                      placeholder={fieldPlaceholder}
                      options={optionObjs}
                      value={String(field.value || '')}
                      onChange={(val) => onChange(field.name, val)}
                      disabled={field.disabled}
                      rich={useRichFormat}
                      dataTestId={getFieldTestId(field.name, 'input')}
                    />
                  )
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2" sx={{ color: '#999', fontSize: '12px', mb: 0.5 }}>
                      {fieldLabel}
                    </Typography>
                    <Typography sx={{ fontWeight: 500, fontSize: '14px' }}>
                      {(() => {
                        const opt = optionObjs.find((o) => o.value === String(field.value || ''));
                        return opt ? opt.label : String(field.value || '') || '-';
                      })()}
                    </Typography>
                  </Box>
                )}
              </Box>
            );
          }

          if (field.type === 'radio') {
            const optionObjs = (field.options || []).map((o) => ({
              label: o.label,
              value: String(o.value),
            }));

            return (
              <Box key={field.name} sx={{ gridColumn: `span ${item.span}` }} data-testid={getFieldTestId(field.name, 'container')}>
                {editingActive ? (
                  renderWithRHF && formMethods ? (
                    (() => {
                      const { control, formState } = formMethods;
                      const err = (formState?.errors || {}) as any;
                      const fieldErr = err?.[field.name];
                      return (
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              mb: 1.5,
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              color: 'rgba(0, 0, 0, 0.6)',
                            }}
                          >
                            {fieldLabel}
                          </Typography>
                          <Controller
                            name={field.name}
                            control={control}
                            rules={(() => {
                              const businessRules =
                                typeof rulesProvider === 'function'
                                  ? rulesProvider(field.name, () => formMethods.getValues()) || {}
                                  : {};
                              const requiredRule = field.required
                                ? { required: 'This field is required' }
                                : {};
                              return { ...requiredRule, ...businessRules } as any;
                            })()}
                            render={({ field: rhfField }: { field: any }) => (
                              <RadioGroup
                                value={rhfField.value || ''}
                                onChange={(e) => {
                                  rhfField.onChange(e.target.value);
                                  if (syncOnChange) onChange(field.name, e.target.value);
                                }}
                              >
                                {optionObjs.map((option) => (
                                  <FormControlLabel
                                    key={option.value}
                                    value={option.value}
                                    control={<Radio />}
                                    label={option.label}
                                  />
                                ))}
                              </RadioGroup>
                            )}
                          />
                          {fieldErr && (
                            <FormHelperText error sx={{ mt: 0.5 }}>
                              {fieldErr.message || 'This field is required'}
                            </FormHelperText>
                          )}
                        </Box>
                      );
                    })()
                  ) : (
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          mb: 1.5,
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: 'rgba(0, 0, 0, 0.6)',
                        }}
                      >
                        {fieldLabel}
                      </Typography>
                      <RadioGroup
                        value={field.value || ''}
                        onChange={(e) => onChange(field.name, e.target.value)}
                      >
                        {optionObjs.map((option) => (
                          <FormControlLabel
                            key={option.value}
                            value={option.value}
                            control={<Radio />}
                            label={option.label}
                          />
                        ))}
                      </RadioGroup>
                    </Box>
                  )
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2" sx={{ color: '#999', fontSize: '12px', mb: 0.5 }}>
                      {fieldLabel}
                    </Typography>
                    <Typography sx={{ fontWeight: 500, fontSize: '14px' }}>
                      {String(field.value ?? '') || '-'}
                    </Typography>
                  </Box>
                )}
              </Box>
            );
          }

          if (field.type === 'button') {
            return (
              <Box key={field.name} sx={{ gridColumn: `span ${item.span}` }} data-testid={getFieldTestId(field.name, 'container')}>
                {editingActive ? (
                  <Button
                    buttonVariant={field.buttonVariant || 'primary'}
                    onClick={field.onClick || (() => {})}
                    disabled={field.disabled}
                    startIcon={field.startIcon}
                    endIcon={field.endIcon}
                    sx={{
                      width: field.fullWidth ? '100%' : 'auto',
                      height: field.buttonHeight || '48px',
                      minHeight: field.buttonHeight || '48px',
                      mt: field.buttonMarginTop ?? 0,
                    }}
                    style={{
                      height: field.buttonHeight || '48px',
                      minHeight: field.buttonHeight || '48px',
                      marginTop: field.buttonMarginTop ?? 0,
                    }}
                  >
                    {field.buttonText || field.label}
                  </Button>
                ) : null}
              </Box>
            );
          }

          if (field.type === 'accountInfo') {
            const accountOptions = field.accountInfoOptions || [];

            return (
              <Box key={field.name} sx={{ gridColumn: `span ${item.span}` }} data-testid={getFieldTestId(field.name, 'container')}>
                {editingActive ? (
                  renderWithRHF && formMethods ? (
                    (() => {
                      const { control, formState } = formMethods;
                      const err = (formState?.errors || {}) as any;
                      const fieldErr = err?.[field.name];
                      return (
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              mb: 1.5,
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              color: 'rgba(0, 0, 0, 0.6)',
                            }}
                          >
                            {fieldLabel}
                          </Typography>
                          <Controller
                            name={field.name}
                            control={control}
                            rules={(() => {
                              const businessRules =
                                typeof rulesProvider === 'function'
                                  ? rulesProvider(field.name, () => formMethods.getValues()) || {}
                                  : {};
                              const requiredRule = field.required
                                ? { required: 'This field is required' }
                                : {};
                              return { ...requiredRule, ...businessRules } as any;
                            })()}
                            render={({ field: rhfField }: { field: any }) => {
                              const commonProps = {
                                value: String(rhfField.value || ''),
                                options: accountOptions,
                                onChange: (e: any) => {
                                  rhfField.onChange(e.target.value);
                                  if (syncOnChange) onChange(field.name, e.target.value);
                                },
                                iconChevronDown: IconChevronDown as any,
                                fullWidth: true,
                                error: !!fieldErr,
                                helperText: (fieldErr?.message as string) || undefined,
                                required: !!field.required,
                                dataTestId: getFieldTestId(field.name, 'select'),
                              };

                              return <AccountInfoDropdown {...commonProps} label={fieldLabel} />;
                            }}
                          />
                        </Box>
                      );
                    })()
                  ) : (
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          mb: 1.5,
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: 'rgba(0, 0, 0, 0.6)',
                        }}
                      >
                        {fieldLabel}
                      </Typography>
                      <AccountInfoDropdown
                        label={fieldLabel}
                        value={
                          typeof field.value === 'string' ? field.value : String(field.value || '')
                        }
                        options={accountOptions}
                        onChange={(e) => onChange(field.name, e.target.value)}
                        iconChevronDown={IconChevronDown}
                        fullWidth
                        required={!!field.required}
                        dataTestId={getFieldTestId(field.name, 'select')}
                      />
                    </Box>
                  )
                ) : // In review mode, don't show the AccountInfoDropdown at all
                // The actual account details should be shown as separate text fields
                null}
              </Box>
            );
          }

          if (field.type === 'select') {
            if (editingActive) {
              if (field.lookupBtn) {
                // Determine if we're in reset mode: user has selected a value
                const hasSelectedValue = field.value && String(field.value).trim() !== '';
                const hasOptions = Array.isArray(field.options) && field.options.length > 1;
                // Hide dropdown during loading OR if no results yet
                const showDropdown = hasOptions && !lookupLoading;
                
                // Creating array to potentially return multiple elements (field + InfoBlock)
                const elements:  JSX.Element[] = [];
                
                elements.push(
                  <Box key={field.name} sx={{ gridColumn: `span ${item.span}` }} data-testid={getFieldTestId(field.name, 'container')}>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: showDropdown ? 'auto 1fr' : 'auto',
                        gap: 2,
                        alignItems: 'center',
                      }}
                    >
                      <Box sx={{
                        '&:hover img': !lookupLoading ? { filter: 'brightness(0) invert(1)' } : {},
                        width: 'max-content',
                      }}>
                        <Button
                          buttonVariant="secondary"
                          data-testid={getFieldTestId(field.name, hasSelectedValue ? 'reset-button' : 'lookup-button')}
                          sx={{
                            fontSize: '12px',
                            color: '#0051FF',
                            border: '1px solid #0051FF',
                            whiteSpace: 'nowrap',
                            height: '40px',
                            padding: '0 16px',
                            '&:hover': !lookupLoading ? {
                              backgroundColor: '#0051FF',
                              color: '#FFFFFF',
                              '& .lookup-btn-icon': {
                                filter: 'brightness(0) invert(1) !important',
                              },
                            } : {},
                            '& .lookup-btn-icon': {
                              transition: 'filter 0.2s ease',
                            },
                          }}
                          style={{ height: '48px', minHeight: '48px', width: '124px' }}
                          onClick={() => {
                            if (hasSelectedValue) {
                              // RESET mode - only call onReset when value is selected
                              onReset && onReset(field.name);
                            } else {
                              // LOOKUP mode - call onLookup
                              onLookup && onLookup(field.name);
                            }
                          }}
                          disabled={lookupLoading}
                          startIcon={
                            lookupLoading ? (
                              <CircularProgress size={20} sx={{ color: '#0051FF' }} />
                            ) : hasSelectedValue ? (
                              <Image src={IcnReset} alt="reset" width={24} height={24} className="lookup-btn-icon" />
                            ) : (
                              <Image src={IcnMagGlass} alt="lookup" width={24} height={24} className="lookup-btn-icon" />
                            )
                          }
                        >
                          {lookupLoading ? '' : hasSelectedValue ? 'RESET' : 'LOOKUP'}
                        </Button>
                      </Box>
                      {showDropdown ? (
                        renderWithRHF && formMethods ? (
                          <RHFSelectField
                            name={field.name}
                            label={fieldLabel}
                            options={field.options || []}
                            rulesProvider={rulesProvider}
                            disabled={field.disabled}
                            validationContext={validationContext}
                            isEntity={isEntity}
                            dataTestId={getFieldTestId(field.name, 'select')}
                          />
                        ) : (
                          <SelectField
                            name={field.name}
                            label={fieldLabel}
                            value={field.value ?? ''}
                            onChange={(name, value) => onChange(name, value)}
                            options={field.options || []}
                            height={'52px'}
                            disabled={field.disabled}
                            dataTestId={getFieldTestId(field.name, 'select')}
                          />
                        )
                      ) : null}
                    </Box>
                  </Box>
                );
                
                {/* Render InfoBlock as separate full-width row below lookup button */}
                if (showInfoBlock && (field.name === 'selectedCompany' || field.name === 'selectedBank')) {
                  elements.push(
                    <Box key={`${field.name}-infoblock`} sx={{ gridColumn: '1 / -1', marginTop: '12px' }}>
                      <InfoBlock
                        backgroundColor="#FFFFFF"
                        width="100%"
                        resultsFound={Boolean(infoBlockResultsFound)}
                        title={infoBlockResultsFound ? undefined : infoBlockTitle}
                        description={infoBlockResultsFound ? undefined : infoBlockDescription}
                        entityType={infoBlockEntityType}
                      />
                    </Box>
                  );
                }
                
                return <>{elements}</>;
              }
              return (
                <Box key={field.name} sx={{ gridColumn: `span ${item.span}` }} data-testid={getFieldTestId(field.name, 'container')}>
                  {renderWithRHF && formMethods ? (
                    <RHFSelectField
                      name={field.name}
                      label={fieldLabel}
                      options={field.options || []}
                      rulesProvider={rulesProvider}
                      disabled={field.disabled}
                      validationContext={validationContext}
                      isEntity={isEntity}
                      dataTestId={getFieldTestId(field.name, 'select')}
                    />
                  ) : (
                    <SelectField
                      name={field.name}
                      label={fieldLabel}
                      value={field.value ?? ''}
                      onChange={(name, value) => onChange(name, value)}
                      options={field.options || []}
                      height={'52px'}
                      disabled={field.disabled}
                      dataTestId={getFieldTestId(field.name, 'select')}
                    />
                  )}
                </Box>
              );
            }
            const opt = (field.options || []).find((o) => String(o.value) === String(field.value));
            const displayValue = opt ? opt.label : String(field.value ?? '');
            return (
              <Box
                key={field.name}
                data-testid={getFieldTestId(field.name, 'value')}
                sx={{ gridColumn: `span ${item.span}`, display: 'flex', flexDirection: 'column' }}
              >
                <Typography variant="body2" sx={{ color: '#999', fontSize: '12px', mb: 0.5 }}>
                  {field.label}
                </Typography>
                <Typography sx={{ fontWeight: 500, fontSize: '14px' }}>
                  {displayValue || '-'}
                </Typography>
              </Box>
            );
          }

          if (field.type === 'checkbox') {
            return (
              <Box
                key={field.name}
                data-testid={getFieldTestId(field.name, 'checkbox-container')}
                sx={{ gridColumn: `span ${item.span}`, display: 'flex', alignItems: 'center' }}
              >
                {editingActive ? (
                  renderWithRHF && formMethods ? (
                    (() => {
                      const { control } = formMethods;
                      return (
                        <Controller
                          name={field.name}
                          control={control}
                          render={({ field: rhfField }: { field: any }) => (
                            <FormControlLabel
                              sx={{
                                m: 0,
                                minHeight: '48px',
                                alignItems: 'center',
                                '& .MuiCheckbox-root': {
                                  p: 0,
                                  pr: '10px',
                                },
                                '& .MuiFormControlLabel-label': {
                                  whiteSpace: 'nowrap',
                                  color: '#222E37',
                                  fontSize: '14px',
                                  lineHeight: '20px',
                                },
                              }}
                              control={
                                <Checkbox
                                  checked={Boolean(rhfField.value)}
                                  onChange={(e) => {
                                    rhfField.onChange(e.target.checked);
                                    if (syncOnChange) onChange(field.name, e.target.checked);
                                  }}
                                  inputProps={{
                                    'data-testid': getFieldTestId(field.name, 'checkbox'),
                                  } as CheckboxInputProps}
                                  sx={{
                                    color: '#0051FF',
                                    '&.Mui-checked': { color: '#0051FF' },
                                  }}
                                />
                              }
                              label={fieldLabel}
                            />
                          )}
                        />
                      );
                    })()
                  ) : (
                    <FormControlLabel
                      sx={{
                        m: 0,
                        minHeight: '48px',
                        alignItems: 'center',
                        '& .MuiCheckbox-root': {
                          p: 0,
                          pr: '10px',
                        },
                        '& .MuiFormControlLabel-label': {
                          whiteSpace: 'nowrap',
                          color: '#222E37',
                          fontSize: '14px',
                          lineHeight: '20px',
                        },
                      }}
                      control={
                        <Checkbox
                          checked={Boolean(field.value)}
                          onChange={(e) => onChange(field.name, e.target.checked)}
                          inputProps={{
                            'data-testid': getFieldTestId(field.name, 'checkbox'),
                          } as CheckboxInputProps}
                          sx={{
                            color: '#0051FF',
                            '&.Mui-checked': { color: '#0051FF' },
                          }}
                        />
                      }
                      label={fieldLabel}
                    />
                  )
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2" sx={{ color: '#999', fontSize: '12px', mb: 0.5 }}>
                      {field.label}
                    </Typography>
                    <Typography sx={{ fontWeight: 500, fontSize: '14px' }}>
                      {Boolean(field.value) ? 'Yes' : 'No'}
                    </Typography>
                  </Box>
                )}
              </Box>
            );
          }

          if (field.chip) {
            return (
              <Box key={field.name} sx={{ gridColumn: `span ${item.span}` }} data-testid={getFieldTestId(field.name, 'container')}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 2,
                    alignItems: 'center',
                  }}
                >
                  {field.type === 'phone' || field.name === 'phoneNumber' ? (
                    editingActive ? (
                      renderWithRHF && formMethods ? (
                        (() => {
                          const { control, formState } = formMethods;
                          const error = formState.errors[field.name];
                          const errorMessage = error?.message as string | undefined;
                          const rules = rulesProvider?.(field.name, () => formMethods.getValues());
                          return (
                            <Controller
                              name={field.name}
                              control={control}
                              rules={rules}
                              render={({ field: rhfField }: { field: any }) => (
                                <PhoneNumber
                                  label={fieldLabel || 'Phone number'}
                                  defaultCountry="ZA"
                                  value={rhfField.value || ''}
                                  error={!!error}
                                  helperText={errorMessage || field.helperText || ''}
                                  onChange={(value: any) => {
                                    rhfField.onChange(value);
                                    if (syncOnChange) onChange(field.name, value);
                                  }}
                                  data-testid={getFieldTestId(field.name, 'phone')}
                                />
                              )}
                            />
                          );
                        })()
                      ) : (
                        <PhoneNumber
                          label={fieldLabel || 'Phone number'}
                          defaultCountry="ZA"
                          error={false}
                          helperText=""
                          onChange={(value: any) => onChange(field.name, value)}
                        />
                      )
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography
                          variant="body2"
                          sx={{ color: '#999', fontSize: '12px', mb: 0.5 }}
                        >
                          {field.label}
                        </Typography>
                        <Typography sx={{ fontWeight: 500, fontSize: '14px' }}>
                          {String(field.value ?? '') || '-'}
                        </Typography>
                      </Box>
                    )
                  ) : editingActive ? (
                    <>
                      {renderWithRHF && formMethods ? (
                        <RHFTextfield
                          name={field.name}
                          label={fieldLabel}
                          placeholder={fieldPlaceholder}
                          type={field.type || 'text'}
                          rulesProvider={rulesProvider}
                          disabled={field.disabled}
                          validationContext={validationContext}
                          isEntity={isEntity}
                          dataTestId={getFieldTestId(field.name, 'input')}
                        />
                      ) : (
                        <Textfield
                          type={field.type || 'text'}
                          name={field.name}
                          label={fieldLabel}
                          placeholder={fieldPlaceholder}
                          value={field.value ?? ''}
                          onChange={(name, value) => onChange(name, value)}
                          disabled={field.disabled}
                          dataTestId={getFieldTestId(field.name, 'input')}
                        />
                      )}
                      {field.alwaysShowHelperText &&
                        field.helperText &&
                        renderWithRHF &&
                        formMethods && (
                          <Box
                            sx={{
                              paddingTop: '4px',
                              paddingLeft: '16px',
                              fontSize: '12px',
                              fontWeight: 400,
                              color: formMethods.formState.errors[field.name]
                                ? '#E31E46'
                                : '#222E37',
                            }}
                          >
                            {field.helperText}
                          </Box>
                        )}
                    </>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2" sx={{ color: '#999', fontSize: '12px', mb: 0.5 }}>
                        {field.label}
                      </Typography>
                      <Typography sx={{ fontWeight: 500, fontSize: '14px' }}>
                        {String(field.value ?? '') || '-'}
                      </Typography>
                    </Box>
                  )}
                  {field.chipOptions &&
                    (editingActive ? (
                      (() => {
                        const usageField = field.chipTargetFieldName || `${field.name}Usage`;
                        const getSelected = () => {
                          const rhfVal =
                            renderWithRHF && formMethods
                              ? (formMethods.getValues() as any)[usageField]
                              : undefined;
                          const base = Array.isArray(rhfVal)
                            ? rhfVal
                            : Array.isArray(field.chipSelectedValues)
                              ? field.chipSelectedValues
                              : [];
                          return base;
                        };
                        const selectedVals = getSelected();
                        return (
                          <UsageChips
                            options={field.chipOptions}
                            selectedValues={selectedVals}
                            uncheckIcon={CloseStandardBlue as any}
                            onChange={(usage: string) => {
                              const current = getSelected();
                              const updated = current.includes(usage)
                                ? current.filter((u) => u !== usage)
                                : [...current, usage];
                              if (renderWithRHF && formMethods) {
                                formMethods.setValue(usageField, updated, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                });
                              }
                              if (syncOnChange) onChange(usageField, updated);
                            }}
                          />
                        );
                      })()
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography
                          variant="body2"
                          sx={{ color: '#999', fontSize: '12px', mt: 1.5, mb: 0.5 }}
                        >
                          Communication permissions
                        </Typography>
                        <Typography sx={{ fontWeight: 500, fontSize: '14px' }}>
                          {(() => {
                            const selected = field.chipSelectedValues || [];
                            if (field.name === 'phoneNumber') {
                              return `Use for ${selected.includes('communication') ? 'communication' : 'N/A'}.`;
                            }
                            const formatted =
                              selected.length === 0
                                ? 'N/A'
                                : selected.length === 1
                                  ? selected[0]
                                  : selected.join(' and ');
                            return `Use for ${formatted}.`;
                          })()}
                        </Typography>
                      </Box>
                    ))}
                </Box>
              </Box>
            );
          }

          if (field.type === 'headerLabel') {
            return (
              <Box key={field.name} sx={{ gridColumn: `span ${item.span}`, marginLeft: '-12px', marginRight: '-12px', marginTop: '-16px' }} data-testid={getFieldTestId(field.name, 'header')}>
                {!editingActive && mode === 'review' && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px',
                      backgroundColor: '#fff',
                      borderBottom: '1px solid #E0E5EB',
                    }}
                  >
                    {field.headerIcon ? (
                      <Image src={field.headerIcon} alt={field.label} width={24} height={24} />
                    ) : null}
                    <Typography sx={{ fontWeight: 400, fontSize: '18px', color: '#333' }}>
                      {field.label} 
                    </Typography>
                  </Box>
                )}
              </Box>
            );
          }

          return (
            <Box key={field.name} sx={{ gridColumn: `span ${item.span}` }} data-testid={getFieldTestId(field.name, 'container')}>
              {field.type === 'phone' || field.name === 'phoneNumber' ? (
                editingActive ? (
                  renderWithRHF && formMethods ? (
                    (() => {
                      const { control, formState } = formMethods;
                      const error = formState.errors[field.name];
                      const errorMessage = error?.message as string | undefined;
                      const rules = rulesProvider?.(field.name, () => formMethods.getValues());
                      return (
                        <Controller
                          name={field.name}
                          control={control}
                          rules={rules}
                          render={({ field: rhfField }: { field: any }) => (
                            <PhoneNumber
                              label={fieldLabel || 'Phone number'}
                              defaultCountry="ZA"
                              value={rhfField.value || ''}
                              error={!!error}
                              helperText={errorMessage || field.helperText || ''}
                              onChange={(value: any) => {
                                rhfField.onChange(value);
                                if (syncOnChange) onChange(field.name, value);
                              }}
                              data-testid={getFieldTestId(field.name, 'phone')}
                            />
                          )}
                        />
                      );
                    })()
                  ) : (
                    <PhoneNumber
                      label={fieldLabel || 'Phone number'}
                      defaultCountry="ZA"
                      error={false}
                      helperText=""
                      onChange={(value: any) => onChange(field.name, value)}
                    />
                  )
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2" sx={{ color: '#999', fontSize: '12px', mb: 0.5 }}>
                      {field.label}
                    </Typography>
                    <Typography sx={{ fontWeight: 500, fontSize: '14px' }}>
                      {String(field.value ?? '') || '-'}
                    </Typography>
                  </Box>
                )
              ) : field.type === 'amount' || field.name === 'transactionLimit' ? (
                (() => {
                  return editingActive ? (
                    renderWithRHF && formMethods ? (
                      (() => {
                        const currencyTarget =
                          field.amountCurrencyTargetName || `${field.name}Currency`;
                        const { control, setValue, formState } = formMethods;
                        const err = (formState?.errors || {}) as any;
                        const valueErr = err?.[field.name];
                        const currencyErr = err?.[currencyTarget];
                        return (
                          <>
                            <Controller
                              name={field.name}
                              control={control}
                              rules={(() => {
                                const businessRules =
                                  typeof rulesProvider === 'function'
                                    ? rulesProvider(field.name, () => formMethods.getValues()) || {}
                                    : {};
                                const requiredRule = field.required
                                  ? { required: 'This field is required' }
                                  : {};
                                return { ...requiredRule, ...businessRules } as any;
                              })()}
                              render={({ field: rhfField }: { field: any }) => (
                                <Amount
                                  value={String(rhfField.value ?? '')}
                                  currency={field.amountCurrency || 'USD'}
                                  currencyOptions={
                                    field.amountCurrencyOptions || [
                                      { label: 'USD - US Dollar', value: 'USD' },
                                      { label: 'EUR - Euro', value: 'EUR' },
                                      { label: 'GBP - British Pounds', value: 'GBP' },
                                      { label: 'JPY - Japanese Yen', value: 'JPY' },
                                      { label: 'AUD - Australian Dollar', value: 'AUD' },
                                    ]
                                  }
                                  handleChangeCurrency={(newCurrency: string) => {
                                    setValue(currencyTarget, newCurrency, {
                                      shouldValidate: true,
                                      shouldDirty: true,
                                    });
                                    if (syncOnChange) onChange(currencyTarget, newCurrency);
                                  }}
                                  handleChangeValue={(newValue: string) => {
                                    rhfField.onChange(newValue);
                                    if (syncOnChange) onChange(field.name, newValue);
                                  }}
                                  label={fieldLabel || 'Currency and transaction limit'}
                                  sx={{ width: '100%' }}
                                  error={!!(valueErr || currencyErr)}
                                  helperText={
                                    (valueErr?.message as string) ||
                                    (currencyErr?.message as string) ||
                                    ''
                                  }
                                />
                              )}
                            />
                            <Controller
                              name={currencyTarget}
                              control={control}
                              rules={(() => {
                                const businessRules =
                                  typeof rulesProvider === 'function'
                                    ? rulesProvider(currencyTarget, () =>
                                        formMethods.getValues(),
                                      ) || {}
                                    : {};
                                const requiredRule = field.required
                                  ? { required: 'This field is required' }
                                  : {};
                                return { ...requiredRule, ...businessRules } as any;
                              })()}
                              render={() => <></>}
                            />
                          </>
                        );
                      })()
                    ) : (
                      <Amount
                        value={String(field.value ?? '')}
                        currency={field.amountCurrency || 'USD'}
                        currencyOptions={
                          field.amountCurrencyOptions || [
                            { label: 'USD - US Dollar', value: 'USD' },
                            { label: 'EUR - Euro', value: 'EUR' },
                            { label: 'GBP - British Pounds', value: 'GBP' },
                            { label: 'JPY - Japanese Yen', value: 'JPY' },
                            { label: 'AUD - Australian Dollar', value: 'AUD' },
                          ]
                        }
                        handleChangeCurrency={(newCurrency: string) =>
                          onChange(
                            field.amountCurrencyTargetName || `${field.name}Currency`,
                            newCurrency,
                          )
                        }
                        handleChangeValue={(newValue: string) => onChange(field.name, newValue)}
                        label={fieldLabel || 'Currency and transaction limit'}
                        sx={{ width: '100%' }}
                      />
                    )
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2" sx={{ color: '#999', fontSize: '12px', mb: 0.5 }}>
                        {field.label}
                      </Typography>
                      <Typography sx={{ fontWeight: 500, fontSize: '14px' }}>
                        {(field.amountCurrency || 'USD') +
                          ' ' +
                          (String(field.value ?? '') || '') || '-'}
                      </Typography>
                    </Box>
                  );
                })()
              ) : editingActive ? (
                <>
                  {field.type === 'date' ? (
                    renderWithRHF && formMethods ? (
                      <RHFDatePicker
                        name={field.name}
                        label={fieldLabel}
                        placeholder={fieldPlaceholder}
                        rulesProvider={rulesProvider}
                        disabled={field.disabled}
                        validationContext={validationContext}
                        isEntity={isEntity}
                        dataTestId={getFieldTestId(field.name, 'input')}
                      />
                    ) : (
                      <DatePicker
                        name={field.name}
                        label={fieldLabel}
                        placeholder={fieldPlaceholder}
                        value={field.value ?? ''}
                        onChange={(name, value) => onChange(name, value)}
                        disabled={field.disabled}
                        dataTestId={getFieldTestId(field.name, 'input')}
                      />
                    )
                  ) : (
                    <>
                      {renderWithRHF && formMethods ? (
                        <RHFTextfield
                          name={field.name}
                          label={fieldLabel}
                          placeholder={fieldPlaceholder}
                          type={field.type || 'text'}
                          rulesProvider={rulesProvider}
                          disabled={field.disabled}
                          validationContext={validationContext}
                          isEntity={isEntity}
                          dataTestId={getFieldTestId(field.name, 'input')}
                        />
                      ) : (
                        <Textfield
                          type={field.type || 'text'}
                          name={field.name}
                          label={fieldLabel}
                          placeholder={fieldPlaceholder}
                          value={field.value ?? ''}
                          onChange={(name, value) => onChange(name, value)}
                          disabled={field.disabled}
                          dataTestId={getFieldTestId(field.name, 'input')}
                        />
                      )}
                    </>
                  )}
                  {field.alwaysShowHelperText &&
                    field.helperText &&
                    renderWithRHF &&
                    formMethods &&
                    !formMethods.formState.errors[field.name] && (
                      (() => {
                        const isTransactionalDescription =
                          validationContext === 'transactionalAuthProfile' &&
                          field.name === 'description';
                        const currentValue = String(
                          (formMethods.getValues() as any)?.[field.name] ?? field.value ?? '',
                        );
                        const helperDisplayText = isTransactionalDescription
                          ? `${currentValue.length}/300`
                          : field.helperText;

                        return (
                          <Box
                            sx={{
                              paddingTop: '4px',
                              paddingLeft: isTransactionalDescription ? 0 : '16px',
                              paddingRight: isTransactionalDescription ? '2px' : 0,
                              width: '100%',
                              textAlign: isTransactionalDescription ? 'right' : 'left',
                              fontSize: '12px',
                              fontWeight: 400,
                              color: '#222E37',
                            }}
                          >
                            {helperDisplayText}
                          </Box>
                        );
                      })()
                    )}
                </>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="body2" sx={{ color: '#999', fontSize: '12px', mb: 0.5 }}>
                    {field.label}
                  </Typography>
                  <Typography sx={{ fontWeight: 500, fontSize: '14px' }}>
                    {String(field.value ?? '') || '-'}
                  </Typography>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    ) : null;

    const body = (
      <>
        {infoMessage && idx === 0 && (mode !== 'review' || editingActive) && (
          <Box sx={{ padding: '12px', display: 'flex', flexDirection: 'row', gap: '16px', alignItems: 'center', justifyContent: 'flex-start' }}>
            <InfoOutlinedIcon color='primary' />
            <Typography variant="body1">
              {infoMessage}
            </Typography>
          </Box>
        )}
        {sectionFieldsBody}
        {resolvedSectionCustomContent ? (
          <Box sx={{ padding: secCustomContentPadding }}>{resolvedSectionCustomContent}</Box>
        ) : null}
      </>
    );

    if (showAccordion) {
      return (
        <Accordion
          key={sectionKey}
          data-testid={getSectionTestId(secTitle)}
          defaultExpanded
          disableGutters
          square
          sx={{
            backgroundColor: '#fff',
            boxShadow: 'none',
            borderRadius: '16px',
            border: '1px solid #E0E5EB',
            '&::before': { display: 'none' },
            ...(secTitle === 'Collection type' || secTitle === 'Payment type'
              ? { marginTop: '16px' }
              : {}),
          }}
        >
          {secTitle && (
            <AccordionSummary
              expandIcon={
                <Image
                  src={IconChevronDown}
                  alt={secTitle}
                  width={24}
                  height={24}
                  style={{ margin: '10px' }}
                />
              }
              sx={{
                padding: 0,
                borderBottom: 'none',
                '&.Mui-expanded': {
                  borderBottom: '1px solid #E0E5EB',
                },
                '& .MuiAccordionSummary-content': {
                  margin: 0,
                },
              }}
            >
              {header}
            </AccordionSummary>
          )}
          <AccordionDetails sx={{ padding: 0 }}>{body}</AccordionDetails>
        </Accordion>
      );
    }

    return (
      <Box
        key={sectionKey}
        data-testid={getSectionTestId(secTitle)}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: asSubsection ? 0 : '16px',
          width: '100%',
          backgroundColor: '#fff',
          ...(asSubsection
            ? {
                borderBottom: !hideSectionBottomBorder || secShowActionBtns ? '1px solid #E0E5EB' : 'none',
                borderTop: hideSectionTopBorder ? 'none' : '1px solid #E0E5EB',
              }
            : {
                border: '1px solid #E0E5EB',
                ...(secTitle === 'Collection type' || secTitle === 'Payment type'
                  ? { marginTop: '16px' }
                  : {}),
                borderTop: hideSectionTopBorder ? 'none' : '1px solid #E0E5EB',
                borderBottom: hideSectionBottomBorder ? 'none' : '1px solid #E0E5EB'
              }),
        }}
      >
        {header}
        {body}
      </Box>
    );
  };

  if (sections && sections.length) {
    const renderedSections = sections.map((s, idx) =>
      renderSection(
        s.title,
        s.titleIcon,
        s.fields,
        s.ShowActionBtns ?? ShowActionBtns,
        s.hideIconWhenNotEditing,
        s.customContent,
        s.customContentPadding,
        sectionsInSingleCard,
        idx === sections.length - 1,
         s.titleIconEelement,
         idx
      ),
    );

    const inner = (
      sectionsInSingleCard ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            backgroundColor: '#fff',
            border: '1px solid #E0E5EB',
          }}
        >
          {renderedSections}
          {/* Don't show InfoBlock at bottom if it's shown inline with lookup field */}
        </Box>
      ) : (
        <>
          {renderedSections}
          {/* Don't show InfoBlock at bottom if it's shown inline with lookup field */}
        </>
      )
    );
    return renderWithRHF && formMethods ? (
      <RHFProvider methods={formMethods} onSubmit={onSubmit || (() => {})}>
        {inner}
      </RHFProvider>
    ) : (
      inner
    );
  }

  const baseHeader = title && (
    <Box
      data-testid={getSectionTestId(title)}
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px',
        borderBottom: showAccordion ? 'none' : '1px solid #E0E5EB',
        marginBottom: showAccordion ? 0 : 0,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {titleIcon ? <Image src={titleIcon} alt={title} width={28} height={28} /> : null}
        {titleIconEelement ? titleIconEelement : null}
        <Typography sx={{ fontWeight: 400, fontSize: '20px', color: '#333' }}>{title}</Typography>
      </Box>
      {ShowActionBtns ? (
        editingActive ? (
          <Box sx={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Button
              buttonVariant="text"
              data-testid={buildTestId(testIdPrefix, title || 'section', 'cancel-edit')}
              onClick={() => {
                if (renderWithRHF && formMethods && preEditValuesRef.current) {
                  formMethods.reset(preEditValuesRef.current);
                }
                updateEditingActive(false);
              }}
              sx={{
                color: '#0051FF',
                fontSize: '12px',
                fontWeight: '700',
                textTransform: 'uppercase',
              }}
              startIcon={<Image src={IcnCloseIcon} alt="close" width={24} height={24} />}
              style={{
                height: '36px',
                minHeight: '36px',
                width: '110px',
                marginTop: '-10px',
              }}
            >
              CANCEL
            </Button>
            <Button
              buttonVariant="text"
              data-testid={buildTestId(testIdPrefix, title || 'section', 'save-edit')}
              onClick={() => {
                if (renderWithRHF && formMethods && onSubmit) {
                  formMethods.handleSubmit(
                    async (data) => {
                      const submitResult = await onSubmit(data);
                      if (submitResult === false) return;
                      updateEditingActive(false);
                    },
                    (errors) => {
                      onValidationFail && onValidationFail(errors);
                    },
                  )();
                } else {
                  updateEditingActive(false);
                }
              }}
              sx={{
                color: '#0051FF',
                fontSize: '12px',
                fontWeight: '700',
                textTransform: 'uppercase',
              }}
              startIcon={<Image src={IcnSaveIcon} alt="save" width={24} height={24} />}
              style={{
                height: '36px',
                minHeight: '36px',
                width: '90px',
                marginTop: '-10px',
              }}
            >
              SAVE
            </Button>
          </Box>
        ) : (
          <Button
            buttonVariant="text"
            data-testid={buildTestId(testIdPrefix, title || 'section', 'enable-edit')}
            onClick={() => {
              if (renderWithRHF && formMethods) {
                preEditValuesRef.current = formMethods.getValues();
              }
              updateEditingActive(true);
            }}
            sx={{
              color: '#0051FF',
              fontWeight: '700',
              textTransform: 'uppercase',
            }}
            style={{
              width: '85px',
              height: '36px',
              minHeight: '36px',
              marginTop: '-10px',
              fontSize: '15px',
              fontStyle: 'bold',
            }}
            startIcon={<Image src={EditIcon} alt="edit" width={24} height={24} />}
          >
            EDIT
          </Button>
        )
      ) : null}
    </Box>
  );

  const resolvedBaseCustomContent = resolveCustomContent(customContent);

  const baseBody = (
    <>
      {resolvedBaseCustomContent ? (
        <Box sx={{ padding: customContentPadding }}>{resolvedBaseCustomContent}</Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: columns === 1 ? '1fr' : '1fr 1fr',
            gap: '16px',
            padding: '12px',
            maxWidth: '100%',
            boxSizing: 'border-box',
            '& .MuiOutlinedInput-root': { borderRadius: '8px', height: '48px' },
            '& .MuiInputLabel-root:not(.MuiInputLabel-shrink)': {
              top: '24px',
              transform: 'translateY(-50%)',
              left: '14px',
            },
            '& .MuiInputLabel-root.MuiInputLabel-shrink': {
              top: '0px',
              left: '0px',
            },
          }}
        >
          {buildItems(baseFields).map((item) => {
            if (item.type === 'spacer') {
              return <Box key={item.key} sx={{ gridColumn: `span ${item.span}` }} />;
            }

            const field = item.field!;
            const fieldLabel = field.label;
            const fieldPlaceholder = field.placeholder || field.label;

          if (field.type === 'multiChip') {
            const optionObjs = (field.options || []).map((o) => ({
              label: o.label,
              value: String(o.value),
            }));
            const targetName = field.multiTargetFieldName || field.name;
            const joiner = typeof field.multiJoin === 'string' ? field.multiJoin : ', ';

            return (
              <Box key={field.name} sx={{ gridColumn: `span ${item.span}` }} data-testid={getFieldTestId(field.name, 'container')}>
                {editingActive ? (
                  renderWithRHF && formMethods ? (
                    (() => {
                      const { control, formState, getValues } = formMethods;
                      const err = (formState?.errors || {}) as any;
                      const fieldErr = err?.[targetName];
                      const businessRules =
                        typeof rulesProvider === 'function'
                          ? rulesProvider(targetName, () => getValues()) || {}
                          : {};
                      // For paymentType, rely on business validate instead of generic required
                      const requiredRule =
                        field.required && targetName !== 'paymentType'
                          ? { required: 'This field is required' }
                          : {};
                      const combinedRules: any = { ...requiredRule, ...businessRules };
                      return (
                        <Controller
                          name={targetName}
                          control={control}
                          rules={combinedRules}
                          render={({ field: rhfField }: { field: any }) => {
                            const arrayVal = Array.isArray(rhfField.value)
                              ? rhfField.value
                              : typeof rhfField.value === 'string' && rhfField.value
                                ? String(rhfField.value).split(',')
                                : [];
                            const selectedObjs = optionObjs.filter((o) =>
                              arrayVal.includes(o.value),
                            );
                            return (
                              <Box sx={{ '& > div': { margin: '0 !important' } }}>
                                <MultipleSelectChip
                                  label={fieldLabel}
                                  options={optionObjs}
                                  selected={selectedObjs}
                                  OnChange={(values: string[]) => {
                                    rhfField.onChange(values);
                                    onChange(targetName, values);
                                  }}
                                  placeholder={fieldLabel}
                                  error={Boolean(fieldErr)}
                                  helperText={(fieldErr?.message as string) || ''}
                                />
                              </Box>
                            );
                          }}
                        />
                      );
                    })()
                  ) : (
                    <Box sx={{ '& > div': { marginTop: '0 !important' } }}>
                      <MultipleSelectChip
                        label={fieldLabel}
                        options={optionObjs}
                        selected={(() => {
                          const selectedValues = Array.isArray(field.multiSelectedValues)
                            ? field.multiSelectedValues
                            : typeof field.value === 'string' && field.value
                              ? String(field.value).split(',')
                              : [];
                          return optionObjs.filter((o) => selectedValues.includes(o.value));
                        })()}
                        OnChange={(values: string[]) => {
                          // Persist arrays to Redux; join only for display
                          onChange(targetName, values);
                        }}
                        placeholder={fieldLabel}
                        error={false}
                        helperText=""
                      />
                    </Box>
                  )
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2" sx={{ color: '#999', fontSize: '12px', mb: 0.5 }}>
                      {field.label}
                    </Typography>
                    <Typography sx={{ fontWeight: 500, fontSize: '14px' }}>
                      {(() => {
                        const selectedValues = Array.isArray(field.multiSelectedValues)
                          ? field.multiSelectedValues
                          : typeof field.value === 'string' && field.value
                            ? String(field.value).split(',')
                            : [];
                        return selectedValues.length ? selectedValues.join(joiner) : '-';
                      })()}
                    </Typography>
                  </Box>
                )}
              </Box>
            );
          }

          if (field.type === 'autocomplete') {
            const useRichFormat = !!field.autocompleteRichOptions;
            const optionObjs: AutocompleteFieldOption[] = useRichFormat
              ? (field.autocompleteRichOptions || []).map((o) => ({
                  label: o.label,
                  value: String(o.value),
                  subtitle: o.subtitle,
                  metadata: o.metadata,
                }))
              : (field.options || []).map((o) => ({
                  label: o.label,
                  value: String(o.value),
                }));

            return (
              <Box key={field.name} sx={{ gridColumn: `span ${item.span}` }} data-testid={getFieldTestId(field.name, 'container')}>
                {editingActive ? (
                  renderWithRHF && formMethods ? (
                    (() => {
                      const { control, formState } = formMethods;
                      const err = (formState?.errors || {}) as any;
                      const fieldErr = err?.[field.name];
                      return (
                        <Controller
                          name={field.name}
                          control={control}
                          rules={(() => {
                            const businessRules =
                              typeof rulesProvider === 'function'
                                ? rulesProvider(field.name, () => formMethods.getValues()) || {}
                                : {};
                            const requiredRule = field.required
                              ? { required: 'This field is required' }
                              : {};
                            return { ...requiredRule, ...businessRules } as any;
                          })()}
                          render={({ field: rhfField }: { field: any }) => (
                            <AutocompleteField
                              label={fieldLabel}
                              placeholder={fieldPlaceholder}
                              options={optionObjs}
                              value={rhfField.value}
                              onChange={(val) => {
                                rhfField.onChange(val);
                                if (syncOnChange) onChange(field.name, val);
                              }}
                              disabled={field.disabled}
                              rich={useRichFormat}
                              error={Boolean(fieldErr)}
                              helperText={(fieldErr?.message as string) || ''}
                              dataTestId={getFieldTestId(field.name, 'input')}
                            />
                          )}
                        />
                      );
                    })()
                  ) : (
                    <AutocompleteField
                      label={fieldLabel}
                      placeholder={fieldPlaceholder}
                      options={optionObjs}
                      value={String(field.value || '')}
                      onChange={(val) => onChange(field.name, val)}
                      disabled={field.disabled}
                      rich={useRichFormat}
                      dataTestId={getFieldTestId(field.name, 'input')}
                    />
                  )
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2" sx={{ color: '#999', fontSize: '12px', mb: 0.5 }}>
                      {fieldLabel}
                    </Typography>
                    <Typography sx={{ fontWeight: 500, fontSize: '14px' }}>
                      {(() => {
                        const opt = optionObjs.find((o) => o.value === String(field.value || ''));
                        return opt ? opt.label : String(field.value || '') || '-';
                      })()}
                    </Typography>
                  </Box>
                )}
              </Box>
            );
          }

          if (field.type === 'button') {
            return (
              <Box key={field.name} sx={{ gridColumn: `span ${item.span}` }} data-testid={getFieldTestId(field.name, 'container')}>
                {editingActive ? (
                  <Button
                    buttonVariant={field.buttonVariant || 'primary'}
                    onClick={field.onClick || (() => {})}
                    disabled={field.disabled}
                    startIcon={field.startIcon}
                    endIcon={field.endIcon}
                    sx={{
                      width: field.fullWidth ? '100%' : 'auto',
                      height: field.buttonHeight || '48px',
                      minHeight: field.buttonHeight || '48px',
                      mt: field.buttonMarginTop ?? 0,
                    }}
                    style={{
                      height: field.buttonHeight || '48px',
                      minHeight: field.buttonHeight || '48px',
                      marginTop: field.buttonMarginTop ?? 0,
                    }}
                  >
                    {field.buttonText || field.label}
                  </Button>
                ) : null}
              </Box>
            );
          }

          if (field.type === 'select') {
            if (editingActive) {
              if (field.lookupBtn) {
                // Determine if we're in reset mode: user has selected a value
                const hasSelectedValue = field.value && String(field.value).trim() !== '';
                const hasOptions = Array.isArray(field.options) && field.options.length > 1;
                // Hide dropdown during loading OR if no results yet
                const showDropdown = hasOptions && !lookupLoading;
                
                return (
                  <Box key={field.name} sx={{ gridColumn: `span ${item.span}` }} data-testid={getFieldTestId(field.name, 'container')}>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: showDropdown ? 'auto 1fr' : 'auto',
                        gap: 2,
                        alignItems: 'center',
                      }}
                    >
                      <Button
                        buttonVariant="secondary"
                        data-testid={getFieldTestId(field.name, hasSelectedValue ? 'reset-button' : 'lookup-button')}
                        sx={{
                          fontSize: '12px',
                          color: '#0051FF',
                          border: '1px solid #0051FF',
                          whiteSpace: 'nowrap',
                          height: '40px',
                          padding: '0 16px',
                          '&:hover img': {
                              filter: 'brightness(0) invert(1) !important',
                            },
                          '&:hover': !lookupLoading ? {
                            backgroundColor: '#0051FF',
                            color: '#FFFFFF',
                          } : {},
                        }}
                        style={{ height: '48px', minHeight: '48px', width: '124px' }}
                        onClick={() => {
                          if (hasSelectedValue) {
                            // RESET mode - only call onReset when value is selected
                            onReset && onReset(field.name);
                          } else {
                            // LOOKUP mode - call onLookup
                            onLookup && onLookup(field.name);
                          }
                        }}
                        disabled={lookupLoading}
                        startIcon={
                          lookupLoading ? (
                            <CircularProgress size={20} sx={{ color: '#0051FF' }} />
                          ) : hasSelectedValue ? (
                            <Image src={IcnReset} alt="reset" width={24} height={24} className="lookup-btn-icon" />
                          ) : (
                            <Image src={IcnMagGlass} alt="lookup" width={24} height={24} className="lookup-btn-icon" />
                          )
                        }
                      >
                        {lookupLoading ? '' : hasSelectedValue ? 'RESET' : 'LOOKUP'}
                      </Button>
                      {showDropdown ? (
                        <SelectField
                          name={field.name}
                          label={fieldLabel}
                          value={field.value ?? ''}
                          onChange={(name, value) => onChange(name, value)}
                          options={field.options || []}
                          height={'52px'}
                          disabled={field.disabled}
                          dataTestId={getFieldTestId(field.name, 'select')}
                        />
                      ) : null}
                    </Box>
                  </Box>
                );
              }
              return (
                <Box key={field.name} sx={{ gridColumn: `span ${item.span}` }} data-testid={getFieldTestId(field.name, 'container')}>
                  {renderWithRHF && formMethods ? (
                    <RHFSelectField
                      name={field.name}
                      label={fieldLabel}
                      options={field.options || []}
                      rulesProvider={rulesProvider}
                      disabled={field.disabled}
                      validationContext={validationContext}
                      isEntity={isEntity}
                      dataTestId={getFieldTestId(field.name, 'select')}
                    />
                  ) : (
                    <SelectField
                      name={field.name}
                      label={fieldLabel}
                      value={field.value ?? ''}
                      onChange={(name, value) => onChange(name, value)}
                      options={field.options || []}
                      height={'52px'}
                      disabled={field.disabled}
                      dataTestId={getFieldTestId(field.name, 'select')}
                    />
                  )}
                </Box>
              );
            }
            const opt = (field.options || []).find((o) => String(o.value) === String(field.value));
            const displayValue = opt ? opt.label : String(field.value ?? '');
            return (
              <Box
                key={field.name}
                data-testid={getFieldTestId(field.name, 'value')}
                sx={{ gridColumn: `span ${item.span}`, display: 'flex', flexDirection: 'column' }}
              >
                <Typography variant="body2" sx={{ color: '#999', fontSize: '12px', mb: 0.5 }}>
                  {field.label}
                </Typography>
                <Typography sx={{ fontWeight: 500, fontSize: '14px' }}>
                  {displayValue || '-'}
                </Typography>
              </Box>
            );
          }

          if (field.chip) {
            return (
              <Box key={field.name} sx={{ gridColumn: `span ${item.span}` }} data-testid={getFieldTestId(field.name, 'container')}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 2,
                    alignItems: 'center',
                  }}
                >
                  {field.type === 'phone' || field.name === 'phoneNumber' ? (
                    editingActive ? (
                      renderWithRHF && formMethods ? (
                        (() => {
                          const { control, formState } = formMethods;
                          const error = formState.errors[field.name];
                          const errorMessage = error?.message as string | undefined;
                          const rules = rulesProvider?.(field.name, () => formMethods.getValues());
                          return (
                            <Controller
                              name={field.name}
                              control={control}
                              rules={rules}
                              render={({ field: rhfField }: { field: any }) => (
                                <PhoneNumber
                                  label={fieldLabel || 'Phone number'}
                                  defaultCountry="ZA"
                                  value={rhfField.value || ''}
                                  error={!!error}
                                  helperText={errorMessage || field.helperText || ''}
                                  onChange={(value: any) => {
                                    rhfField.onChange(value);
                                    if (syncOnChange) onChange(field.name, value);
                                  }}
                                  data-testid={getFieldTestId(field.name, 'phone')}
                                />
                              )}
                            />
                          );
                        })()
                      ) : (
                        <PhoneNumber
                          label={fieldLabel || 'Phone number'}
                          defaultCountry="ZA"
                          error={false}
                          helperText=""
                          onChange={(value: any) => onChange(field.name, value)}
                        />
                      )
                    ): (
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography
                          variant="body2"
                          sx={{ color: '#999', fontSize: '12px', mb: 0.5 }}
                        >
                          {field.label}
                        </Typography>
                        <Typography sx={{ fontWeight: 500, fontSize: '14px' }}>
                          {String(field.value ?? '') || '-'}
                        </Typography>
                      </Box>
                    )
                  ) : editingActive ? (
                    <>
                      {renderWithRHF && formMethods ? (
                        <RHFTextfield
                          name={field.name}
                          label={fieldLabel}
                          placeholder={fieldPlaceholder}
                          type={field.type || 'text'}
                          rulesProvider={rulesProvider}
                          disabled={field.disabled}
                          validationContext={validationContext}
                          isEntity={isEntity}
                          dataTestId={getFieldTestId(field.name, 'input')}
                        />
                      ) : (
                        <Textfield
                          type={field.type || 'text'}
                          name={field.name}
                          label={fieldLabel}
                          placeholder={fieldPlaceholder}
                          value={field.value ?? ''}
                          onChange={(name, value) => onChange(name, value)}
                          disabled={field.disabled}
                          dataTestId={getFieldTestId(field.name, 'input')}
                        />
                      )}
                      {field.alwaysShowHelperText &&
                        field.helperText &&
                        renderWithRHF &&
                        formMethods &&
                        !formMethods.formState.errors[field.name] && (
                          <Box
                            sx={{
                              paddingTop: '4px',
                              paddingLeft: '16px',
                              fontSize: '12px',
                              fontWeight: 400,
                              color: '#222E37',
                            }}
                          >
                            {field.helperText}
                          </Box>
                        )}
                    </>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2" sx={{ color: '#999', fontSize: '12px', mb: 0.5 }}>
                        {field.label}
                      </Typography>
                      <Typography sx={{ fontWeight: 500, fontSize: '14px' }}>
                        {String(field.value ?? '') || '-'}
                      </Typography>
                    </Box>
                  )}
                  {field.chipOptions &&
                    (editingActive ? (
                      (() => {
                        const usageField = field.chipTargetFieldName || `${field.name}Usage`;
                        const getSelected = () => {
                          const rhfVal =
                            renderWithRHF && formMethods
                              ? (formMethods.getValues() as any)[usageField]
                              : undefined;
                          const base = Array.isArray(rhfVal)
                            ? rhfVal
                            : Array.isArray(field.chipSelectedValues)
                              ? field.chipSelectedValues
                              : [];
                          return base;
                        };
                        const selectedVals = getSelected();
                        return (
                          <UsageChips
                            options={field.chipOptions}
                            selectedValues={selectedVals}
                            uncheckIcon={CloseStandardBlue as any}
                            onChange={(usage: string) => {
                              const current = getSelected();
                              const updated = current.includes(usage)
                                ? current.filter((u) => u !== usage)
                                : [...current, usage];
                              if (renderWithRHF && formMethods) {
                                formMethods.setValue(usageField, updated, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                });
                              }
                              if (syncOnChange) onChange(usageField, updated);
                            }}
                          />
                        );
                      })()
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography
                          variant="body2"
                          sx={{ color: '#999', fontSize: '12px', mt: 1.5, mb: 0.5 }}
                        >
                          Communication permissions
                        </Typography>
                        <Typography sx={{ fontWeight: 500, fontSize: '14px' }}>
                          {(() => {
                            const selected = field.chipSelectedValues || [];
                            if (field.name === 'phoneNumber') {
                              return `Use for ${selected.includes('communication') ? 'communication' : 'N/A'}.`;
                            }
                            const formatted =
                              selected.length === 0
                                ? 'N/A'
                                : selected.length === 1
                                  ? selected[0]
                                  : selected.join(' and ');
                            return `Use for ${formatted}.`;
                          })()}
                        </Typography>
                      </Box>
                    ))}
                </Box>
              </Box>
            );
          }

          if (field.type === 'headerLabel') {
            return (
              <Box key={field.name} sx={{ gridColumn: `span ${item.span}`, marginLeft: '-12px', marginRight: '-12px', marginTop: '16px' }} data-testid={getFieldTestId(field.name, 'header')}>
                {!editingActive && mode === 'review' && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px',
                      paddingTop: '16px',
                      backgroundColor: '#fff',
                      borderBottom: '1px solid #E0E5EB',
                    }}
                  >
                    {field.headerIcon ? (
                      <Image src={field.headerIcon} alt={field.label} width={24} height={24} />
                    ) : null}
                    <Typography sx={{ fontWeight: 400, fontSize: '18px', color: '#333' }}>
                      {field.label}
                    </Typography>
                  </Box>
                )}
              </Box>
            );
          }

            return (
              <Box key={field.name} sx={{ gridColumn: `span ${item.span}` }} data-testid={getFieldTestId(field.name, 'container')}>
              {field.type === 'phone' || field.name === 'phoneNumber' ? (
                editingActive ? (
                  renderWithRHF && formMethods ? (
                    (() => {
                      const { control, formState } = formMethods;
                      const error = formState.errors[field.name];
                      const errorMessage = error?.message as string | undefined;
                      const rules = rulesProvider?.(field.name, () => formMethods.getValues());
                      return (
                        <Controller
                          name={field.name}
                          control={control}
                          rules={rules}
                          render={({ field: rhfField }: { field: any }) => (
                            <PhoneNumber
                              label={fieldLabel || 'Phone number'}
                              defaultCountry="ZA"
                              value={rhfField.value || ''}
                              error={!!error}
                              helperText={errorMessage || field.helperText || ''}
                              onChange={(value: any) => {
                                rhfField.onChange(value);
                                if (syncOnChange) onChange(field.name, value);
                              }}
                              data-testid={getFieldTestId(field.name, 'phone')}
                            />
                          )}
                        />
                      );
                    })()
                  ) : (
                    <PhoneNumber
                      label={fieldLabel || 'Phone number'}
                      defaultCountry="ZA"
                      error={false}
                      helperText=""
                      onChange={(value: any) => onChange(field.name, value)}
                    />
                  )
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2" sx={{ color: '#999', fontSize: '12px', mb: 0.5 }}>
                      {field.label}
                    </Typography>
                    <Typography sx={{ fontWeight: 500, fontSize: '14px' }}>
                      {String(field.value ?? '') || '-'}
                    </Typography>
                  </Box>
                )
              ) : field.type === 'amount' || field.name === 'transactionLimit' ? (
                editingActive ? (
                  renderWithRHF && formMethods ? (
                    (() => {
                      const currencyTarget =
                        field.amountCurrencyTargetName || `${field.name}Currency`;
                      const { control, setValue, formState } = formMethods;
                      const err = (formState?.errors || {}) as any;
                      const valueErr = err?.[field.name];
                      const currencyErr = err?.[currencyTarget];
                      return (
                        <>
                          <Controller
                            name={field.name}
                            control={control}
                            rules={(() => {
                              const businessRules =
                                typeof rulesProvider === 'function'
                                  ? rulesProvider(field.name, () => formMethods.getValues()) || {}
                                  : {};
                              // Don't add generic required - let business validation handle it
                              return businessRules as any;
                            })()}
                            render={({ field: rhfField }: { field: any }) => (
                              <Amount
                                value={String(rhfField.value ?? '')}
                                currency={field.amountCurrency || 'USD'}
                                currencyOptions={
                                  field.amountCurrencyOptions || [
                                    { label: 'USD - US Dollar', value: 'USD' },
                                    { label: 'EUR - Euro', value: 'EUR' },
                                    { label: 'GBP - British Pounds', value: 'GBP' },
                                    { label: 'JPY - Japanese Yen', value: 'JPY' },
                                    { label: 'AUD - Australian Dollar', value: 'AUD' },
                                  ]
                                }
                                handleChangeCurrency={(newCurrency: string) => {
                                  setValue(currencyTarget, newCurrency, {
                                    shouldValidate: true,
                                    shouldDirty: true,
                                  });
                                  if (syncOnChange) onChange(currencyTarget, newCurrency);
                                }}
                                handleChangeValue={(newValue: string) => {
                                  rhfField.onChange(newValue);
                                  if (syncOnChange) onChange(field.name, newValue);
                                }}
                                label={fieldLabel || 'Currency and transaction limit'}
                                sx={{ width: '100%' }}
                                error={!!(valueErr || currencyErr)}
                                helperText={
                                  (valueErr?.message as string) ||
                                  (currencyErr?.message as string) ||
                                  ''
                                }
                              />
                            )}
                          />
                          <Controller
                            name={currencyTarget}
                            control={control}
                            rules={(() => {
                              const businessRules =
                                typeof rulesProvider === 'function'
                                  ? rulesProvider(currencyTarget, () => formMethods.getValues()) ||
                                    {}
                                  : {};
                              // Don't add generic required - let business validation handle it
                              return businessRules as any;
                            })()}
                            render={() => <></>}
                          />
                        </>
                      );
                    })()
                  ) : (
                    <Amount
                      value={String(field.value ?? '')}
                      currency={field.amountCurrency || 'USD'}
                      currencyOptions={
                        field.amountCurrencyOptions || [
                          { label: 'USD - US Dollar', value: 'USD' },
                          { label: 'EUR - Euro', value: 'EUR' },
                          { label: 'GBP - British Pounds', value: 'GBP' },
                          { label: 'JPY - Japanese Yen', value: 'JPY' },
                          { label: 'AUD - Australian Dollar', value: 'AUD' },
                        ]
                      }
                      handleChangeCurrency={(newCurrency: string) =>
                        onChange(
                          field.amountCurrencyTargetName || `${field.name}Currency`,
                          newCurrency,
                        )
                      }
                      handleChangeValue={(newValue: string) => onChange(field.name, newValue)}
                      label={fieldLabel || 'Currency and transaction limit'}
                      sx={{ width: '100%' }}
                    />
                  )
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2" sx={{ color: '#999', fontSize: '12px', mb: 0.5 }}>
                      {field.label}
                    </Typography>
                    <Typography sx={{ fontWeight: 500, fontSize: '14px' }}>
                      {(field.amountCurrency || 'USD') + ' ' + (String(field.value ?? '') || '') ||
                        '-'}
                    </Typography>
                  </Box>
                )
              ) : editingActive ? (
                <>
                  {field.type === 'date' ? (
                    renderWithRHF && formMethods ? (
                      <RHFDatePicker
                        name={field.name}
                        label={fieldLabel}
                        placeholder={fieldPlaceholder}
                        rulesProvider={rulesProvider}
                        disabled={field.disabled}
                        validationContext={validationContext}
                        isEntity={isEntity}
                        dataTestId={getFieldTestId(field.name, 'input')}
                      />
                    ) : (
                      <DatePicker
                        name={field.name}
                        label={fieldLabel}
                        placeholder={fieldPlaceholder}
                        value={field.value ?? ''}
                        onChange={(name, value) => onChange(name, value)}
                        disabled={field.disabled}
                        dataTestId={getFieldTestId(field.name, 'input')}
                      />
                    )
                  ) : (
                    <>
                      {renderWithRHF && formMethods ? (
                        <RHFTextfield
                          name={field.name}
                          label={fieldLabel}
                          placeholder={fieldPlaceholder}
                          type={field.type || 'text'}
                          rulesProvider={rulesProvider}
                          disabled={field.disabled}
                          validationContext={validationContext}
                          isEntity={isEntity}
                          dataTestId={getFieldTestId(field.name, 'input')}
                        />
                      ) : (
                        <Textfield
                          type={field.type || 'text'}
                          name={field.name}
                          label={fieldLabel}
                          placeholder={fieldPlaceholder}
                          value={field.value ?? ''}
                          onChange={(name, value) => onChange(name, value)}
                          disabled={field.disabled}
                          dataTestId={getFieldTestId(field.name, 'input')}
                        />
                      )}
                    </>
                  )}
                  {field.alwaysShowHelperText &&
                    field.helperText &&
                    renderWithRHF &&
                    formMethods &&
                    !formMethods.formState.errors[field.name] && (
                      (() => {
                        const isTransactionalDescription =
                          validationContext === 'transactionalAuthProfile' &&
                          field.name === 'description';
                        const currentValue = String(
                          (formMethods.getValues() as any)?.[field.name] ?? field.value ?? '',
                        );
                        const helperDisplayText = isTransactionalDescription
                          ? `${currentValue.length}/300`
                          : field.helperText;

                        return (
                          <Box
                            sx={{
                              paddingTop: '4px',
                              paddingLeft: isTransactionalDescription ? 0 : '16px',
                              paddingRight: isTransactionalDescription ? '2px' : 0,
                              width: '100%',
                              textAlign: isTransactionalDescription ? 'right' : 'left',
                              fontSize: '12px',
                              fontWeight: 400,
                              color: '#222E37',
                            }}
                          >
                            {helperDisplayText}
                          </Box>
                        );
                      })()
                    )}
                </>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="body2" sx={{ color: '#999', fontSize: '12px', mb: 0.5 }}>
                    {field.label}
                  </Typography>
                  <Typography sx={{ fontWeight: 500, fontSize: '14px' }}>
                    {String(field.value ?? '') || '-'}
                  </Typography>
                </Box>
              )}
              </Box>
            );
          })}
        </Box>
      )}
      {showInfoBlock ? (
        <Box sx={{ padding: '12px' }}>
          <InfoBlock
            backgroundColor="#FFFFFF"
            width="100%"
            resultsFound={Boolean(infoBlockResultsFound)}
            title={infoBlockResultsFound ? undefined : infoBlockTitle}
            description={infoBlockResultsFound ? undefined : infoBlockDescription}
            entityType={infoBlockEntityType}
          />
        </Box>
      ) : null}
    </>
  );

  const baseInner = showAccordion ? (
    <Accordion
      data-testid={getSectionTestId(title)}
      defaultExpanded
      disableGutters
      square
      sx={{
        backgroundColor: '#fff',
        boxShadow: 'none',
        borderRadius: '16px',
        border: '1px solid #E0E5EB',
        '&::before': { display: 'none' },
        ...(title === 'Collection type' || title === 'Payment type' ? { marginTop: '16px' } : {}),
      }}
    >
      {title && (
        <AccordionSummary
          expandIcon={
            <Image
              src={IconChevronDown}
              alt={title}
              width={24}
              height={24}
              style={{ margin: '10px' }}
            />
          }
          sx={{
            padding: 0,
            borderBottom: 'none',
            '&.Mui-expanded': {
              borderBottom: '1px solid #E0E5EB',
            },
            '& .MuiAccordionSummary-content': {
              margin: 0,
            },
          }}
        >
          {baseHeader}
        </AccordionSummary>
      )}
      <AccordionDetails sx={{ padding: 0 }}>{baseBody}</AccordionDetails>
    </Accordion>
  ) : (
    <Box
      data-testid={getSectionTestId(title)}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%',
        backgroundColor: '#fff',
        ...(noBorder 
          ? { borderTop: '1px solid #E0E5EB' }
          : { border: '1px solid #E0E5EB' }
        ),
        ...(title === 'Collection type' || title === 'Payment type' ? { marginTop: '16px' } : {}),
      }}
    >
      {baseHeader}
      {infoMessage && (
        <Box sx={{ padding: '12px', display: 'flex', flexDirection: 'row', gap: '16px', alignItems: 'center', justifyContent: 'flex-start' }}>
          <InfoOutlinedIcon color='primary' />
          <Typography variant="body1">
            {infoMessage}
          </Typography>
        </Box>
      )}
      {baseBody}
    </Box>
  );

  return renderWithRHF && formMethods ? (
    <RHFProvider methods={formMethods} onSubmit={onSubmit || (() => {})}>
      {baseInner}
    </RHFProvider>
  ) : (
    baseInner
  );
}

export default CreateJournyForm;



