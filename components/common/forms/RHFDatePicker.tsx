import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import DatePicker from '@atoms/DatePicker/DatePicker';
import DebtorsCreateLogic, { getRulesForField as getDebtorRulesForField } from '../../../src/utils/DebtorsCreateLogic';
import BopThirdPartiesCreateLogic, { getRulesForField as getBopRulesForField } from '../../../src/utils/BopThirdPartiesCreateLogic';
import TransactionalAuthProfileCreateLogic, { getRulesForField as getTransactionalAuthRulesForField } from '../../../src/utils/TransactionalAuthProfileCreateLogic';

interface RHFDatePickerProps {
  name: string;
  label?: string;
  placeholder?: string;
  rules?: any;
  rulesProvider?: (name: string, getAllValues: () => any) => any;
  disabled?: boolean;
  validationContext?: 'debtors' | 'bopThirdParties' | 'beneficiaries' | 'transactionalAuthProfile';
  isEntity?: boolean;
  dataTestId?: string;
}

const RHFDatePicker: React.FC<RHFDatePickerProps> = ({
  name,
  label,
  placeholder,
  rules,
  rulesProvider,
  disabled,
  validationContext = 'debtors',
  isEntity = false,
  dataTestId,
}) => {
  const { control, formState, getValues } = useFormContext();
  const { errors, touchedFields, dirtyFields, isSubmitted } = (formState || {}) as any;

  const businessRules = React.useMemo(() => {
    if (typeof rulesProvider === 'function') {
      return rulesProvider(name, () => getValues() as any) || {};
    }
    if (validationContext === 'bopThirdParties') {
      return getBopRulesForField(name as any, () => getValues() as any, isEntity);
    }
    if (validationContext === 'transactionalAuthProfile') {
      return getTransactionalAuthRulesForField(name as any, () => getValues() as any);
    }
    return getDebtorRulesForField(name as any, () => getValues() as any);
  }, [name, getValues, rulesProvider, validationContext, isEntity]);
  
  const combinedRules = React.useMemo(() => ({ ...(rules || {}), ...businessRules }), [rules, businessRules]);
  
  const hasError = Boolean(errors?.[name]);
  
  return (
    <Controller
      name={name}
      control={control}
      rules={combinedRules}
      render={({ field }) => (
        <DatePicker
          name={name}
          label={label}
          placeholder={placeholder}
          value={field.value}
          onChange={(_, val) => field.onChange(val)}
          onBlur={field.onBlur}
          error={hasError}
          helperText={hasError ? (errors?.[name]?.message as string) : undefined}
          disabled={disabled}
          dataTestId={dataTestId}
        />
      )}
    />
  );
};

export default RHFDatePicker;
