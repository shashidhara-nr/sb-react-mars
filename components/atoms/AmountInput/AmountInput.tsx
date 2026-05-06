'use client';

import React from 'react';
import {
  TextField,
  Select,
  MenuItem,
  InputAdornment,
  SxProps,
  Theme,
} from '@mui/material';
import styles from './AmountInput.module.scss';

export interface CurrencyOption {
  label: string;
  value: string;
}

export interface AmountInputProps {
  value: string;
  currency: string;
  currencyOptions: CurrencyOption[];
  handleChangeValue: (newValue: string) => void;
  handleChangeCurrency: (newCurrency: string) => void;
  label?: string;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  sx?: SxProps<Theme>;
  FormHelperTextProps?: React.ComponentProps<any>;
  showCurrencyLabel?: boolean;
}

const DEFAULT_LABEL = 'Amount';
const DEFAULT_PLACEHOLDER = '[X,XXX,XXX.XX]';
const MAX_DECIMAL_PLACES = 2;

const MENU_PROPS = {
  anchorOrigin: {
    vertical: 'bottom' as const,
    horizontal: 'left' as const,
  },
  transformOrigin: {
    vertical: 'top' as const,
    horizontal: 'left' as const,
  },
};

const formatCurrencyLabel = (option: CurrencyOption): string => {
  const parts = option.label.split(' - ');
  return `${option.value} - ${parts[1] || option.label}`;
};

const formatAmount = (rawValue: string): string => {
  let cleaned = rawValue.replaceAll(/[^\d.]/g, '');
  cleaned = cleaned.replace(/(\..*)\./, '$1');
  if (cleaned.startsWith('.')) {
    cleaned = '0' + cleaned;
  }
  const [intPart, fracPart = ''] = cleaned.split('.');
  if (!intPart) {
    return '';
  }
  const withCommas = intPart.replaceAll(/\B(?=(\d{3})+(?!\d))/g, ',');
  const frac = fracPart.slice(0, MAX_DECIMAL_PLACES);

  if (cleaned.includes('.')) {
    return `${withCommas}.${frac}`;
  }
  return withCommas;
};

const AmountInput = React.forwardRef<HTMLDivElement, AmountInputProps>(
  (
    {
      value,
      currency,
      currencyOptions,
      handleChangeValue,
      handleChangeCurrency,
      label = DEFAULT_LABEL,
      placeholder = DEFAULT_PLACEHOLDER,
      error = false,
      helperText = '',
      disabled = false,
      sx = {},
      FormHelperTextProps = {},
      showCurrencyLabel = true,
    },
    ref
  ) => {
 
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formattedValue = formatAmount(e.target.value);
      handleChangeValue(formattedValue);
    };

    return (
      <TextField
        ref={ref}
        label={label}
        placeholder={placeholder}
        fullWidth
        value={value}
        onChange={handleInputChange}
        error={error}
        disabled={disabled}
        helperText={helperText}
        className={styles.textField}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start" className={styles.inputAdornment}>
                <Select
                  value={currency}
                  onChange={(e) => handleChangeCurrency(e.target.value)}
                  disabled={disabled}
                  variant="standard"
                  disableUnderline
                  renderValue={(value) => value}
                  className={styles.currencySelect}
                  MenuProps={{
                    ...MENU_PROPS,
                    PaperProps: {
                      className: styles.menuPaper,
                    },
                  }}
                >
                  {currencyOptions.map((option) => (
                    <MenuItem
                      key={option.value}
                      value={option.value}
                      className={styles.currencyMenuItem}
                    >
                      {formatCurrencyLabel(option)}
                    </MenuItem>
                  ))}
                </Select>
              </InputAdornment>
            ),
            className: styles.inputWrapper,
          },
          formHelperText: {
            sx: {
              color: error ? '#ef4444' : '#6b7280',
              fontSize: '0.75rem',
              mt: 0.5,
              ...FormHelperTextProps?.sx,
            },
            ...FormHelperTextProps,
          },
        }}
        sx={sx}
      />
    );
  }
);

AmountInput.displayName = 'AmountInput';

export default AmountInput;
