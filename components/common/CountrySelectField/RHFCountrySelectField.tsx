'use client';

import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import CountrySelectField from './CountrySelectField';
import { COUNTRY_LIST, getCountryOption } from 'lib/countryUtils';

interface RHFCountrySelectFieldProps {
  name: string;
  label?: string;
  rules?: any;
  rulesProvider?: (name: string, getAllValues: () => any) => any;
  disabled?: boolean;
  required?: boolean;
}

const RHFCountrySelectField: React.FC<RHFCountrySelectFieldProps> = ({
  name,
  label = 'Country',
  rules,
  rulesProvider,
  disabled = false,
  required = false,
}) => {
  const { control, formState, getValues } = useFormContext();
  const { errors } = (formState || {}) as any;

  const businessRules = React.useMemo(() => {
    if (typeof rulesProvider === 'function') {
      return rulesProvider(name, () => getValues()) || {};
    }
    return {};
  }, [name, getValues, rulesProvider]);

  const combinedRules = React.useMemo(
    () => ({ 
      ...(required ? { required: `${label} is required` } : {}), 
      ...(rules || {}), 
      ...businessRules 
    }),
    [rules, businessRules, required, label]
  );

  const hasError = Boolean(errors?.[name]);

  return (
    <Controller
      name={name}
      control={control}
      rules={combinedRules}
      render={({ field }) => (
        <CountrySelectField
          name={name}
          label={label}
          value={field.value || ''}
          onChange={(_, val) => field.onChange(val)}
          disabled={disabled}
          error={hasError}
          helperText={hasError ? (errors?.[name]?.message as string) : ''}
        />
      )}
    />
  );
};

export default RHFCountrySelectField;
