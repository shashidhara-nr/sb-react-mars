import React from 'react';
import { TextField as SBRTextField } from 'dist/standard-bank-react';

export interface TextfieldProps {
  type?: string;
  name: string;
  label?: any;
  placeholder?: string;
  value: any;
  onChange: (name: string, value: string) => void;
  error?: boolean;
  helperText?: string;
  onBlur?: () => void;
  disabled?: boolean;
  sx?: any;
  dataTestId?: string;
}

const Textfield: React.FC<TextfieldProps> = ({
  type = 'text',
  name,
  label,
  placeholder,
  value,
  onChange,
  error,
  helperText,
  onBlur,
  disabled,
  sx,
  dataTestId,
}) => {
  return (
    <SBRTextField
      type={type}
      name={name}
      label={label}
      placeholder={placeholder}
      value={value ?? ''}
      onChange={(e: any) => {
        const val = e?.target ? e.target.value : (typeof e === 'string' ? e : '');
        onChange(name, val as string);
      }}
      error={Boolean(error)}
      helperText={helperText || ''}
      disabled={disabled}
      sx={{
        '& .MuiOutlinedInput-root.Mui-disabled': {
          backgroundColor: '#F5F5F5',
        },
        ...(sx || {}),
      }}
      data-testid={dataTestId || `${name}-input`}
    />
  );
};

export default Textfield;
