import React from 'react';
import { Select as SBRSelect } from 'dist/standard-bank-react';

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface SelectProps {
  name: string;
  label?: string;
  placeholder?: string;
  value: string | number;
  onChange: (name: string, value: string | number) => void;
  options: SelectOption[];
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  height?: string | number;
  width?: string | number;
  dataTestId?: string;
  onBlur?: () => void;
}

const SelectField: React.FC<SelectProps> = ({
  name,
  label,
  value,
  onChange,
  options,
  disabled,
  error,
  helperText,
  height = '48px',
  width,
  dataTestId,
  onBlur,
}) => {
  return (
    <SBRSelect
      formOptions={{ 
        sx: { 
          minWidth: '100%',
          '& .MuiOutlinedInput-root.Mui-disabled': {
            backgroundColor: '#F5F5F5',
          },
        } 
      }}
      options={options.map((o) => ({ label: o.label, value: String(o.value) }))}
      selectProps={{
        label,
        labelId: `${name}-label`,
        onBlur: onBlur,
        onChange: (e: any) => onChange(name, e?.target?.value ?? ''),
        disabled: disabled,
        MenuProps: {
          PaperProps: {
            sx: {
              '& .MuiMenuItem-root': {
                width: '100%',
              },
            },
          },
        },
      }}
      name={name}
      value={String(value ?? '')}
      error={Boolean(error)}
      helperText={helperText || ''}
      height={height}
      width={width}
      data-testid={dataTestId || `${name}-select`}
    />
  );
};

export default SelectField;
