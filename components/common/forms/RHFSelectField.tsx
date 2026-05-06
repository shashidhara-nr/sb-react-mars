import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import SelectField, { SelectOption } from '@atoms/Select/Select';
import DebtorsCreateLogic, { getRulesForField as getDebtorRulesForField } from '../../../src/utils/DebtorsCreateLogic';
import BopThirdPartiesCreateLogic, { getRulesForField as getBopRulesForField } from '../../../src/utils/BopThirdPartiesCreateLogic';
import TransactionalAuthProfileCreateLogic, { getRulesForField as getTransactionalAuthRulesForField } from '../../../src/utils/TransactionalAuthProfileCreateLogic';

interface RHFSelectFieldProps {
  name: string;
  label?: string;
  options: SelectOption[];
  rules?: any;
  rulesProvider?: (name: string, getAllValues: () => any) => any;
  disabled?: boolean;
  validationContext?: 'debtors' | 'bopThirdParties' | 'beneficiaries' | 'transactionalAuthProfile';
  isEntity?: boolean;
  dataTestId?: string;
}

const RHFSelectField: React.FC<RHFSelectFieldProps> = ({ 
  name, 
  label, 
  options, 
  rules, 
  rulesProvider, 
  disabled,
  validationContext = 'debtors',
  isEntity = false,
  dataTestId,
}) => {
  const { control, formState, getValues } = useFormContext();
  const { errors, touchedFields, dirtyFields, isSubmitted } = (formState || {}) as any;

  // Business rules from centralized logic; user-supplied rules can still be passed
  const businessRules = React.useMemo(() => {
    if (typeof rulesProvider === 'function') {
      return rulesProvider(name, () => getValues() as any) || {};
    }
    // Select the appropriate validation logic based on context
    if (validationContext === 'bopThirdParties') {
      return getBopRulesForField(name as any, () => getValues() as any, isEntity);
    }
    if (validationContext === 'transactionalAuthProfile') {
      return getTransactionalAuthRulesForField(name as any, () => getValues() as any);
    }
    // Default to debtors validation
    return getDebtorRulesForField(name as any, () => getValues() as any);
  }, [name, getValues, rulesProvider, validationContext, isEntity]);
  
  const combinedRules = React.useMemo(() => ({ ...(rules || {}), ...businessRules }), [rules, businessRules]);
  
  // Show error if validation has failed for this field
  const hasError = Boolean(errors?.[name]);
  
  return (
    <Controller
      name={name}
      control={control}
      rules={combinedRules}
      render={({ field }) => (
        <SelectField
          name={name}
          label={label}
          value={field.value || ''}
          options={options}
          onChange={(_, val) => {
            field.onChange(val);
          }}
          onBlur={() => {
            field.onBlur();
          }}
          error={hasError}
          helperText={hasError ? (errors?.[name]?.message as string) : undefined}
          disabled={disabled}
          dataTestId={dataTestId}
        />
      )}
    />
  );
};

export default RHFSelectField;
