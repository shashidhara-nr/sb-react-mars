'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { Box, Typography, Checkbox, FormControlLabel } from '@mui/material';
import Textfield from '@atoms/Textfield/Textfield';
import SelectField from '@atoms/Select/Select';
import { UsageChips } from 'components/common/usageChips';
import IcnCloseIcon from 'public/icons/close-icon.svg';
import IcnSaveIcon from 'public/icons/col-icon-left-save.svg';
import EditIcon from 'public/icons/col-icon-left-pencil.svg';
import IcnMagGlass from 'public/icons/col_mag_glass.svg';
import { RHFProvider, RHFTextfield, RHFSelectField, InfoBlock } from 'components/common';
import { Controller } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';
import { Button, PhoneNumber } from 'components/lib/Forms';
import MultipleSelectChip from 'components/lib/Forms/MultiSelect';
import Amount from 'components/lib/Forms/Amount';
import { useTheme } from '@mui/material/styles';
import CountrySelectField from 'components/common/CountrySelectField/CountrySelectField';
import RHFCountrySelectField from 'components/common/CountrySelectField/RHFCountrySelectField';
import { getCountryOption } from 'lib/countryUtils';
export type CommanFieldOption = { label: string; value: string | number };

export type CommanField = {
  name: string;
  label: string;
  placeholder?: string;
  value?: string | number | boolean;
  type?: 'text' | 'select' | 'multiChip' | 'phone' | 'amount' | 'checkbox';
  required?: boolean;
  options?: CommanFieldOption[];
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
  hiddenEdit?: boolean;
  isCountrySelect?: boolean;
};

export interface JournyFormProps {
  title?: string;
  titleIcon?: string;
  titleIconEelement?: React.ReactNode;
  fields?: CommanField[];
  onChange: (name: string, value: any) => void;
  fullWidth?: boolean;
  mode?: 'edit' | 'view' | 'review';
  ShowActionBtns?: boolean;
  sections?: Array<{
    title?: string;
    titleIcon?: string;
    titleIconEelement?: React.ReactNode;
    fields: CommanField[];
    ShowActionBtns?: boolean;
    readOnly?: boolean;
  }>;
  renderWithRHF?: boolean;
  formMethods?: UseFormReturn<any>;
  onSubmit?: (data: any) => void;
  onValidationFail?: (errors: any) => void;
  rulesProvider?: (name: string, getAllValues: () => any) => any;
  onLookup?: (fieldName: string) => void;
  onReset?: (fieldName: string) => void;
  showInfoBlock?: boolean;
  infoBlockResultsFound?: boolean;
  infoBlockTitle?: string;
  infoBlockDescription?: string;
  syncOnChange?: boolean;
  editHandler?: () => void;
  onBeforeCancel?: (sectionIndex: number) => boolean;
  showDummyValue?: boolean;
}
const getDemoValue = (field: CommanField): string => {
  const name = field.label.toLowerCase();
  const label = field.label.toLowerCase();

  // ===== COMPANY DETAILS =====
  if (label.includes('company name')) return 'Acme Corporation Pvt Ltd';
  if (label.includes('company id')) return 'COMP-2024-001';
  if (label.includes('registration')) return 'REG-IND-987654';
  if (label.includes('tax')) return 'TAX-55667788';
  if (label.includes('vat') || label.includes('gst')) return 'GSTIN-29ABCDE1234F1Z5';
  if (label.includes('system')) return 'SYS-00001234';
  if (label.includes('reference currency')) return 'INR';
  if (label.includes('operations')) return 'Standard';

  // ===== ADDRESS (PHYSICAL + POSTAL) =====
  if (label.includes('address line 1')) return '12th Floor, Prestige Tower';
  if (label.includes('address line 2')) return 'MG Road';
  if (label.includes('town') || label.includes('city')) return 'Bengaluru';
  if (label.includes('province') || label.includes('region') || label.includes('state'))
    return 'Karnataka';
  if (label.includes('zip') || label.includes('postal') || label.includes('post code'))
    return '560001';
  if (label.includes('country')) return 'India';

  // ===== PHONE =====
  if (field.type === 'phone' || label.includes('phone')) return '+91 98765 43210';

  // ===== AMOUNT =====
  if (field.type === 'amount') return `${field.amountCurrency || 'INR'} 1,00,000`;

  // ===== SELECT / MULTI SELECT =====
  if (field.type === 'select') return 'Standard';
  if (field.type === 'multiChip') return 'Option A, Option B';

  // ===== CHECKBOX =====
  if (field.type === 'checkbox') return 'true';

  // ===== COMMUNICATION INFORMATION =====
  if (label.includes('principle point of contact') || label.includes('ppt')) return 'Rahul Sharma';

  if (label.includes('job title')) return 'IT Administrator';

  if (label.includes('email')) return 'rahul.sharma@acmecorp.com';

  // ===== PASSWORD RENEWAL SCHEDULE =====
  if (label.includes('frequency')) return '30';

  if (label.includes('renewal date')) return '01 Jan 2026';

  // ===== FINAL FALLBACK =====
  return '—';
};
``;
function JournyForm({
  title,
  titleIcon,
  titleIconEelement,
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
  syncOnChange = true,
  editHandler = undefined,
  onBeforeCancel = undefined,
  showDummyValue = false,
}: JournyFormProps) {
  const theme = useTheme();
  const [editingActive, setEditingActive] = React.useState(mode === 'edit');
  const preEditValuesRef = React.useRef<any>(null);
  useEffect(() => {
    setEditingActive(mode === 'edit');
  }, [mode]);
  console.log('mode', mode);
  // When using RHF rendering, mirror RHF value changes back to Redux via onChange
  useEffect(() => {
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

  const renderSection = (
    secTitle?: string,
    secIcon?: string,
    secTitleElement?: React.ReactNode,
    fieldsList: CommanField[] = [],
    secShowActionBtns?: boolean,
    readOnly = false,
    sectionIndex: number = 0,
  ) => {
    const items = buildItems(fieldsList);
    return (
      <Box
        key={(secTitle || 'section') + '-' + items.length + '-' + (fieldsList[0]?.name || '')}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          width: '100%',
          backgroundColor: '#fff',
          ...(secTitle === 'Collection type' || secTitle === 'Payment type'
            ? { marginTop: '16px' }
            : {}),
        }}
      >
        {secTitle && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px',
              borderBottom: '1px solid #ededed',
              marginBottom: '16px',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {secIcon ? <Image src={secIcon} alt={secTitle} width={28} height={28} /> : null}
              {secTitleElement ? secTitleElement : null}
              <Typography sx={{ fontWeight: 400, fontSize: '20px', color: '#333' }}>
                {secTitle}
              </Typography>
            </Box>
            {secShowActionBtns ? (
              editingActive ? (
                <Box sx={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <Button
                    buttonVariant="text"
                    onClick={() => {
                      // Call the onBeforeCancel handler if provided
                      if (onBeforeCancel && !onBeforeCancel(sectionIndex)) {
                        return; // Don't proceed with cancel if handler returns false
                      }
                      if (renderWithRHF && formMethods && preEditValuesRef.current) {
                        formMethods.reset(preEditValuesRef.current);
                      }
                      setEditingActive(false);
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
                    onClick={() => {
                      if (renderWithRHF && formMethods && onSubmit) {
                        formMethods.handleSubmit(
                          (data) => {
                            onSubmit(data);
                            setEditingActive(false);
                          },
                          (errors) => {
                            onValidationFail && onValidationFail(errors);
                          },
                        )();
                      } else {
                        setEditingActive(false);
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
                  onClick={() => {
                    if (renderWithRHF && formMethods) {
                      preEditValuesRef.current = formMethods.getValues();
                    }
                    if (editHandler) {
                      editHandler();
                    }
                    setEditingActive(true);
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
        )}

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
            if (item?.field?.hiddenEdit && mode === 'edit') return null;

            const field = item.field!;
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
              const targetName = field.multiTargetFieldName || field.label;
              const joiner = typeof field.multiJoin === 'string' ? field.multiJoin : ', ';

              return (
                <Box key={field.label} sx={{ gridColumn: `span ${item.span}` }}>
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
                            )}
                          />
                        );
                      })()
                    ) : (
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
                    )
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2" sx={{ color: '#999', fontSize: '12px', mb: 0.5 }}>
                        {field.label}
                      </Typography>
                      <Typography sx={{ fontWeight: 500, fontSize: '14px' }}>
                        {selectedValues.length ? selectedValues.join(joiner) : '[test data]'}
                      </Typography>
                    </Box>
                  )}
                </Box>
              );
            }

            if (field.type === 'select' && field.isCountrySelect) {
              // Country select field rendering
              if (editingActive) {
                return (
                  <Box key={field.label} sx={{ gridColumn: `span ${item.span}` }}>
                    {renderWithRHF && formMethods ? (
                      <RHFCountrySelectField
                        name={field.name}
                        label={fieldLabel}
                        rulesProvider={rulesProvider}
                        disabled={field.disabled}
                        required={field.required}
                      />
                    ) : (
                      <CountrySelectField
                        name={field.name}
                        label={fieldLabel}
                        value={String(field.value ?? '')}
                        onChange={(name, value) => onChange(name, value)}
                        disabled={field.disabled}
                        required={field.required}
                      />
                    )}
                  </Box>
                );
              }
              // View mode for country select
              const countryOption = getCountryOption(String(field.value));
              return (
                <Box
                  key={field.label}
                  sx={{ gridColumn: `span ${item.span}`, display: 'flex', flexDirection: 'column' }}
                >
                  <Typography variant="body2" sx={{ color: '#999', fontSize: '12px', mb: 0.5 }}>
                    {field.label}
                  </Typography>
                  {countryOption ? (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          flexShrink: 0,
                          border: '1px solid #e0e0e0',
                          backgroundColor: '#f5f5f5',
                        }}
                      >
                        <Image
                          src={countryOption.flagIcon}
                          alt={countryOption.label}
                          width={28}
                          height={28}
                          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                        />
                      </Box>
                      <Typography sx={{ fontWeight: 500, fontSize: '14px' }}>
                        {countryOption.label}
                      </Typography>
                    </Box>
                  ) : (
                    showDummyValue && (
                      <Typography sx={{ fontWeight: 500, fontSize: '14px' }}>
                        {getDemoValue(field)}
                      </Typography>
                    )
                  )}
                </Box>
              );
            }

            if (field.type === 'select') {
              if (editingActive) {
                if (field.lookupBtn) {
                  return (
                    <Box key={field.label} sx={{ gridColumn: `span ${item.span}` }}>
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: 'auto 1fr',
                          gap: 2,
                          alignItems: 'center',
                          '&:hover img': { filter: 'brightness(0) invert(1)' },
                        }}
                      >
                        <Button
                          buttonVariant="secondary"
                          sx={{
                            fontSize: '12px',
                            color: '#0051FF',
                            border: '1px solid #0051FF',
                            whiteSpace: 'nowrap',
                            height: '40px',
                            padding: '0 16px',
                          }}
                          style={{ height: '48px', minHeight: '48px', width: '124px' }}
                          onClick={() => {
                            const hasOptions =
                              Array.isArray(field.options) && field.options.length > 1;
                            if (hasOptions) {
                              onReset && onReset(field.label);
                            }
                            onLookup && onLookup(field.label);
                          }}
                          startIcon={
                            Array.isArray(field.options) && field.options.length > 1 ? undefined : (
                              <Image src={IcnMagGlass} alt="lookup" width={24} height={24} />
                            )
                          }
                        >
                          {Array.isArray(field.options) && field.options.length > 1
                            ? 'RESET'
                            : 'LOOKUP'}
                        </Button>
                        {Array.isArray(field.options) && field.options.length > 0 ? (
                          renderWithRHF && formMethods ? (
                            <RHFSelectField
                              name={field.name}
                              label={fieldLabel}
                              options={field.options || []}
                              rulesProvider={rulesProvider}
                              disabled={field.disabled}
                            />
                          ) : (
                            <SelectField
                              name={field.name}
                              label={fieldLabel}
                              value={String(field.value ?? '')}
                              onChange={(name, value) => onChange(name, value)}
                              options={field.options || []}
                              height={'52px'}
                              disabled={field.disabled}
                            />
                          )
                        ) : null}
                      </Box>
                    </Box>
                  );
                }
                return (
                  <Box key={field.label} sx={{ gridColumn: `span ${item.span}` }}>
                    {renderWithRHF && formMethods ? (
                      <RHFSelectField
                        name={field.name}
                        label={fieldLabel}
                        options={field.options || []}
                        rulesProvider={rulesProvider}
                        disabled={field.disabled}
                      />
                    ) : (
                      <SelectField
                        name={field.name}
                        label={fieldLabel}
                        value={String(field.value ?? '')}
                        onChange={(name, value) => onChange(name, value)}
                        options={field.options || []}
                        height={'52px'}
                        disabled={field.disabled}
                      />
                    )}
                  </Box>
                );
              }
              const opt = (field.options || []).find(
                (o) => String(o.value) === String(field.value),
              );
              const displayValue = opt ? opt.label : String(field.value ?? '');
              return (
                <Box
                  key={field.label}
                  sx={{ gridColumn: `span ${item.span}`, display: 'flex', flexDirection: 'column' }}
                >
                  <Typography variant="body2" sx={{ color: '#999', fontSize: '12px', mb: 0.5 }}>
                    {field.label}
                  </Typography>
                  <Typography sx={{ fontWeight: 500, fontSize: '14px' }}>
                    {displayValue || (showDummyValue && getDemoValue(field))}
                  </Typography>
                </Box>
              );
            }

            if (field.chip) {
              return (
                <Box key={field.label} sx={{ gridColumn: `span ${item.span}` }}>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 2,
                      alignItems: 'center',
                    }}
                  >
                    {field.type === 'checkbox' ? (
                      editingActive ? (
                        renderWithRHF && formMethods ? (
                          (() => {
                            const { control } = formMethods;
                            return (
                              <Controller
                                name={field.name}
                                control={control}
                                render={({ field: rhfField }: { field: any }) => (
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={!!rhfField.value}
                                        onChange={(e) => {
                                          rhfField.onChange(e.target.checked);
                                          onChange(field.name, e.target.checked);
                                        }}
                                        disabled={field.disabled}
                                      />
                                    }
                                    label={field.label}
                                  />
                                )}
                              />
                            );
                          })()
                        ) : (
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={!!field.value}
                                onChange={(e) => onChange(field.name, e.target.checked)}
                                disabled={field.disabled}
                              />
                            }
                            label={field.label}
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
                            {field.value ? '✓ Checked' : 'Unchecked'}
                          </Typography>
                        </Box>
                      )
                    ) : field.type === 'phone' || field.label === 'phoneNumber' ? (
                      editingActive ? (
                        renderWithRHF && formMethods ? (
                          (() => {
                            const { control } = formMethods;
                            return (
                              <Controller
                                name={field.name}
                                control={control}
                                render={({ field: rhfField }: { field: any }) => (
                                  <PhoneNumber
                                    label={fieldLabel || 'Phone number'}
                                    defaultCountry="ZA"
                                    error={false}
                                    helperText=""
                                    onChange={(value: any) => {
                                      rhfField.onChange(value);
                                      if (syncOnChange) onChange(field.name, value);
                                    }}
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
                            {/* {String(field.value ?? '') || getDemoValue(field)} */}
                            {String(field.value ?? '') || (showDummyValue && getDemoValue(field))}
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
                                color: formMethods.formState.errors[field.label]
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
                        <Typography
                          variant="body2"
                          sx={{ color: '#999', fontSize: '12px', mb: 0.5 }}
                        >
                          {field.label}
                        </Typography>
                        <Typography sx={{ fontWeight: 500, fontSize: '14px' }}>
                          {String(field.value ?? '') || (showDummyValue && getDemoValue(field))}
                        </Typography>
                      </Box>
                    )}
                    {field.chipOptions &&
                      (editingActive ? (
                        (() => {
                          const usageField = field.chipTargetFieldName || `${field.label}Usage`;
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
                              if (field.label === 'phoneNumber') {
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

            return (
              <Box key={field.label} sx={{ gridColumn: `span ${item.span}` }}>
                {field.type === 'checkbox' ? (
                  editingActive ? (
                    renderWithRHF && formMethods ? (
                      (() => {
                        const { control } = formMethods;
                        return (
                          <Controller
                            name={field.name}
                            control={control}
                            render={({ field: rhfField }: { field: any }) => (
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={!!rhfField.value}
                                    onChange={(e) => {
                                      rhfField.onChange(e.target.checked);
                                      onChange(field.name, e.target.checked);
                                    }}
                                    disabled={field.disabled}
                                  />
                                }
                                label={field.label}
                              />
                            )}
                          />
                        );
                      })()
                    ) : (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={!!field.value}
                            onChange={(e) => onChange(field.name, e.target.checked)}
                            disabled={field.disabled}
                          />
                        }
                        label={field.label}
                      />
                    )
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2" sx={{ color: '#999', fontSize: '12px', mb: 0.5 }}>
                        {field.label}
                      </Typography>
                      <Typography sx={{ fontWeight: 500, fontSize: '14px' }}>
                        {field.value ? '✓ Checked' : 'Unchecked'}
                      </Typography>
                    </Box>
                  )
                ) : field.type === 'phone' || field.label === 'phoneNumber' ? (
                  editingActive ? (
                    <PhoneNumber
                      label={fieldLabel || 'Phone number'}
                      defaultCountry="ZA"
                      error={false}
                      helperText=""
                      onChange={(value: any) => onChange(field.name, value)}
                    />
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2" sx={{ color: '#999', fontSize: '12px', mb: 0.5 }}>
                        {field.label}
                      </Typography>
                      <Typography sx={{ fontWeight: 500, fontSize: '14px' }}>
                        {String(field.value ?? '') || (showDummyValue && getDemoValue(field))}
                      </Typography>
                    </Box>
                  )
                ) : field.type === 'amount' || field.label === 'transactionLimit' ? (
                  (() => {
                    return editingActive ? (
                      renderWithRHF && formMethods ? (
                        (() => {
                          const currencyTarget =
                            field.amountCurrencyTargetName || `${field.label}Currency`;
                          const { control, setValue, formState } = formMethods;
                          const err = (formState?.errors || {}) as any;
                          const valueErr = err?.[field.label];
                          const currencyErr = err?.[currencyTarget];
                          return (
                            <>
                              <Controller
                                name={field.name}
                                control={control}
                                rules={(() => {
                                  const businessRules =
                                    typeof rulesProvider === 'function'
                                      ? rulesProvider(field.label, () => formMethods.getValues()) ||
                                        {}
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
                                      if (syncOnChange) onChange(field.label, newValue);
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
                              field.amountCurrencyTargetName || `${field.label}Currency`,
                              newCurrency,
                            )
                          }
                          handleChangeValue={(newValue: string) => onChange(field.label, newValue)}
                          label={fieldLabel || 'Currency and transaction limit'}
                          sx={{ width: '100%' }}
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
                          {(field.amountCurrency || 'USD') +
                            ' ' +
                            (String(field.value ?? '') || '') ||
                            (showDummyValue && getDemoValue(field))}
                        </Typography>
                      </Box>
                    );
                  })()
                ) : editingActive && !readOnly ? (
                  <>
                    {renderWithRHF && formMethods ? (
                      <RHFTextfield
                        name={field.name}
                        label={fieldLabel}
                        placeholder={fieldPlaceholder}
                        type={field.type || 'text'}
                        rulesProvider={rulesProvider}
                        disabled={field.disabled}
                      />
                    ) : (
                      <Textfield
                        type={field.type || 'text'}
                        name={field.name}
                        label={fieldLabel}
                        placeholder={fieldPlaceholder}
                        value={String(field.value ?? '')}
                        onChange={(name, value) => onChange(name, value)}
                        disabled={field.disabled}
                      />
                    )}
                    {field.alwaysShowHelperText &&
                      field.helperText &&
                      renderWithRHF &&
                      formMethods &&
                      !formMethods.formState.errors[field.label] && (
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
                      {String(field.value ?? '') || (showDummyValue && getDemoValue(field))}
                    </Typography>
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };

  if (sections && sections.length) {
    const inner = (
      <>
        {sections.map((s, idx) =>
          renderSection(
            s.title,
            s.titleIcon,
            s.titleIconEelement,
            s.fields,
            s.ShowActionBtns ?? ShowActionBtns,
            s.readOnly ?? false,
            idx,
          ),
        )}

        {showInfoBlock ? (
          <Box sx={{ padding: '12px' }}>
            <InfoBlock
              backgroundColor={theme.palette.common.white}
              width="100%"
              resultsFound={Boolean(infoBlockResultsFound)}
              title={infoBlockResultsFound ? undefined : infoBlockTitle}
              description={infoBlockResultsFound ? undefined : infoBlockDescription}
            />
          </Box>
        ) : null}
      </>
    );

    return renderWithRHF && formMethods ? (
      <RHFProvider methods={formMethods} onSubmit={onSubmit || (() => {})}>
        {inner}
      </RHFProvider>
    ) : (
      inner
    );
  }

  const baseInner = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%',
        backgroundColor: '#fff',
        ...(title === 'Collection type' || title === 'Payment type' ? { marginTop: '16px' } : {}),
      }}
    >
      {title && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px',
            borderBottom: '1px solid #ededed',
            marginBottom: '16px',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {titleIcon ? <Image src={titleIcon} alt={title} width={28} height={28} /> : null}
            {titleIconEelement ? titleIconEelement : null}
            <Typography sx={{ fontWeight: 400, fontSize: '20px', color: '#333' }}>
              {title}
            </Typography>
          </Box>
          {ShowActionBtns ? (
            editingActive ? (
              <Box sx={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Button
                  buttonVariant="text"
                  onClick={() => {
                    if (renderWithRHF && formMethods && preEditValuesRef.current) {
                      formMethods.reset(preEditValuesRef.current);
                    }
                    setEditingActive(false);
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
                  onClick={() => {
                    if (renderWithRHF && formMethods && onSubmit) {
                      formMethods.handleSubmit(
                        (data) => {
                          onSubmit(data);
                          setEditingActive(false);
                        },
                        (errors) => {
                          onValidationFail && onValidationFail(errors);
                        },
                      )();
                    } else {
                      setEditingActive(false);
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
                onClick={() => {
                  if (renderWithRHF && formMethods) {
                    preEditValuesRef.current = formMethods.getValues();
                  }
                  setEditingActive(true);
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
      )}

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
            const targetName = field.multiTargetFieldName || field.label;
            const joiner = typeof field.multiJoin === 'string' ? field.multiJoin : ', ';

            return (
              <Box key={field.label} sx={{ gridColumn: `span ${item.span}` }}>
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
                            );
                          }}
                        />
                      );
                    })()
                  ) : (
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
                        return selectedValues.length
                          ? selectedValues.join(joiner)
                          : (showDummyValue && getDemoValue(field)) || [];
                      })()}
                    </Typography>
                  </Box>
                )}
              </Box>
            );
          }

          if (field.type === 'select') {
            if (editingActive) {
              if (field.lookupBtn) {
                return (
                  <Box key={field.label} sx={{ gridColumn: `span ${item.span}` }}>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: 'auto 1fr',
                        gap: 2,
                        alignItems: 'center',
                        '&:hover img': { filter: 'brightness(0) invert(1)' },
                      }}
                    >
                      <Button
                        buttonVariant="secondary"
                        sx={{
                          fontSize: '12px',
                          color: '#0051FF',
                          border: '1px solid #0051FF',
                          whiteSpace: 'nowrap',
                          height: '40px',
                          padding: '0 16px',
                        }}
                        style={{ height: '48px', minHeight: '48px', width: '124px' }}
                        onClick={() => {
                          const hasOptions =
                            Array.isArray(field.options) && field.options.length > 1;
                          if (hasOptions) {
                            onReset && onReset(field.label);
                          }
                          onLookup && onLookup(field.label);
                        }}
                        startIcon={
                          Array.isArray(field.options) && field.options.length > 1 ? undefined : (
                            <Image src={IcnMagGlass} alt="lookup" width={24} height={24} />
                          )
                        }
                      >
                        {Array.isArray(field.options) && field.options.length > 1
                          ? 'RESET'
                          : 'LOOKUP'}
                      </Button>
                      {Array.isArray(field.options) && field.options.length > 0 ? (
                        <SelectField
                          name={field.name}
                          label={fieldLabel}
                          value={typeof field.value === 'boolean' ? '' : String(field.value ?? '')}
                          onChange={(name, value) => onChange(name, value)}
                          options={field.options || []}
                          height={'52px'}
                          disabled={field.disabled}
                        />
                      ) : null}
                    </Box>
                  </Box>
                );
              }
              return (
                <Box key={field.label} sx={{ gridColumn: `span ${item.span}` }}>
                  {renderWithRHF && formMethods ? (
                    <RHFSelectField
                      name={field.name}
                      label={fieldLabel}
                      options={field.options || []}
                      rulesProvider={rulesProvider}
                      disabled={field.disabled}
                    />
                  ) : (
                    <SelectField
                      name={field.name}
                      label={fieldLabel}
                      value={typeof field.value === 'boolean' ? '' : String(field.value ?? '')}
                      onChange={(name, value) => onChange(name, value)}
                      options={field.options || []}
                      height={'52px'}
                      disabled={field.disabled}
                    />
                  )}
                </Box>
              );
            }
            const opt = (field.options || []).find((o) => String(o.value) === String(field.value));
            const displayValue = opt ? opt.label : String(field.value ?? '');
            return (
              <Box
                key={field.label}
                sx={{ gridColumn: `span ${item.span}`, display: 'flex', flexDirection: 'column' }}
              >
                <Typography variant="body2" sx={{ color: '#999', fontSize: '12px', mb: 0.5 }}>
                  {field.label}
                </Typography>
                <Typography sx={{ fontWeight: 500, fontSize: '14px' }}>
                  {displayValue || (showDummyValue && getDemoValue(field))}
                </Typography>
              </Box>
            );
          }

          if (field.chip) {
            return (
              <Box key={field.label} sx={{ gridColumn: `span ${item.span}` }}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 2,
                    alignItems: 'center',
                  }}
                >
                  {field.type === 'checkbox' ? (
                    editingActive ? (
                      renderWithRHF && formMethods ? (
                        (() => {
                          const { control } = formMethods;
                          return (
                            <Controller
                              name={field.name}
                              control={control}
                              render={({ field: rhfField }: { field: any }) => (
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={!!rhfField.value}
                                      onChange={(e) => {
                                        rhfField.onChange(e.target.checked);
                                        onChange(field.name, e.target.checked);
                                      }}
                                      disabled={field.disabled}
                                    />
                                  }
                                  label={field.label}
                                />
                              )}
                            />
                          );
                        })()
                      ) : (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={!!field.value}
                              onChange={(e) => onChange(field.name, e.target.checked)}
                              disabled={field.disabled}
                            />
                          }
                          label={field.label}
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
                          {field.value ? '✓ Checked' : 'Unchecked'}
                        </Typography>
                      </Box>
                    )
                  ) : field.type === 'phone' || field.label === 'phoneNumber' ? (
                    editingActive ? (
                      <PhoneNumber
                        label={fieldLabel || 'Phone number'}
                        defaultCountry="ZA"
                        error={false}
                        helperText=""
                        onChange={(value: any) => onChange(field.name, value)}
                      />
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography
                          variant="body2"
                          sx={{ color: '#999', fontSize: '12px', mb: 0.5 }}
                        >
                          {field.label}
                        </Typography>
                        <Typography sx={{ fontWeight: 500, fontSize: '14px' }}>
                          {String(field.value ?? '') || (showDummyValue && getDemoValue(field))}
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
                        />
                      ) : (
                        <Textfield
                          type={field.type || 'text'}
                          name={field.name}
                          label={fieldLabel}
                          placeholder={fieldPlaceholder}
                          value={String(field.value ?? '')}
                          onChange={(name, value) => onChange(name, value)}
                          disabled={field.disabled}
                        />
                      )}
                      {field.alwaysShowHelperText &&
                        field.helperText &&
                        renderWithRHF &&
                        formMethods &&
                        !formMethods.formState.errors[field.label] && (
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
                        {String(field.value ?? '') || (showDummyValue && getDemoValue(field))}
                      </Typography>
                    </Box>
                  )}
                  {field.chipOptions &&
                    (editingActive ? (
                      (() => {
                        const usageField = field.chipTargetFieldName || `${field.label}Usage`;
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
                            if (field.label === 'phoneNumber') {
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

          return (
            <Box key={field.label} sx={{ gridColumn: `span ${item.span}` }}>
              {field.type === 'phone' || field.label === 'phoneNumber' ? (
                editingActive ? (
                  renderWithRHF && formMethods ? (
                    (() => {
                      const { control } = formMethods;
                      return (
                        <Controller
                          name={field.name}
                          control={control}
                          render={({ field: rhfField }: { field: any }) => (
                            <PhoneNumber
                              label={fieldLabel || 'Phone number'}
                              defaultCountry="ZA"
                              error={false}
                              helperText=""
                              onChange={(value: any) => {
                                rhfField.onChange(value);
                                if (syncOnChange) onChange(field.name, value);
                              }}
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
                      {String(field.value ?? '') || (showDummyValue && getDemoValue(field))}
                    </Typography>
                  </Box>
                )
              ) : field.type === 'amount' || field.label === 'transactionLimit' ? (
                editingActive ? (
                  renderWithRHF && formMethods ? (
                    (() => {
                      const currencyTarget =
                        field.amountCurrencyTargetName || `${field.label}Currency`;
                      const { control, setValue, formState } = formMethods;
                      const err = (formState?.errors || {}) as any;
                      const valueErr = err?.[field.label];
                      const currencyErr = err?.[currencyTarget];
                      return (
                        <>
                          <Controller
                            name={field.name}
                            control={control}
                            rules={(() => {
                              const businessRules =
                                typeof rulesProvider === 'function'
                                  ? rulesProvider(field.label, () => formMethods.getValues()) || {}
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
                                  if (syncOnChange) onChange(field.label, newValue);
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
                          field.amountCurrencyTargetName || `${field.label}Currency`,
                          newCurrency,
                        )
                      }
                      handleChangeValue={(newValue: string) => onChange(field.label, newValue)}
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
                        '[test data]'}
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
                    />
                  )}
                  {field.alwaysShowHelperText &&
                    field.helperText &&
                    renderWithRHF &&
                    formMethods &&
                    !formMethods.formState.errors[field.label] && (
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
                    {String(field.value ?? '') || (showDummyValue && getDemoValue(field))}
                  </Typography>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
      {showInfoBlock ? (
        <Box sx={{ padding: '12px' }}>
          <InfoBlock
            backgroundColor={theme.palette.common.white}
            width="100%"
            resultsFound={Boolean(infoBlockResultsFound)}
            title={infoBlockResultsFound ? undefined : infoBlockTitle}
            description={infoBlockResultsFound ? undefined : infoBlockDescription}
          />
        </Box>
      ) : null}
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

export default JournyForm;
