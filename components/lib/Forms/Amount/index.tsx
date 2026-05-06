import {
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SxProps,
  TextField,
  useTheme,
} from '@mui/material';
import { useState } from 'react';
import HelperText from '../HelperText';

interface AmountProps {
  label: string;
  required?: boolean;
  disabled?: boolean;
  value: string;
  handleChangeValue: (value: string) => void;
  showHidden?: boolean;
  handleChangeCurrency: (value: string) => void;
  currency?: string;
  currencyOptions?: Record<string, string>[];
  sx?: SxProps;
  error?: boolean;
  helperText?: string;
}

const Amount = ({
  label,
  showHidden = false,
  disabled = false,
  handleChangeCurrency,
  handleChangeValue,
  required = false,
  value = '',
  currency = 'USD',
  sx,
  currencyOptions,
  error = false,
  helperText = '',
}: AmountProps) => {
  const theme = useTheme();
  const [currentValue, setCurrentValue] = useState(value);
  const [currentCurrency, setCurrentCurrency] = useState(currency);

  const onChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    const newValue = e.target.value as string;
    setCurrentValue(newValue);
    handleChangeValue(newValue);
  };

  const onBlur = () => {
    if (currentValue && !isNaN(Number(currentValue))) {
      const formatted = Number(currentValue).toFixed(2);
      setCurrentValue(formatted);
      handleChangeValue(formatted);
    }
  };

  const onChangeCurrency = (
    event: React.ChangeEvent<{ value: unknown }> | Event,
  ) => {
    const newValue = (event.target as HTMLInputElement).value;
    setCurrentCurrency(newValue);

    handleChangeCurrency(newValue);
  };

  return (
    <FormControl
      variant="outlined"
      fullWidth
      error={error}
      sx={{
        '.MuiInputBase-root::before': {
          border: 'none',
        },
        '& .MuiInputLabel-root': {
          color: error ? theme.palette.error.main : '',
        },
        '& .MuiInputLabel-root.Mui-focused': {
          color: error ? theme.palette.error.main : '',
        },
        '& .MuiInputLabel-root.MuiInputLabel-shrink': {
          color: error ? theme.palette.error.main : '',
        },
        '& .MuiOutlinedInput-root': {
          backgroundColor: theme.palette.common.white,
          '& fieldset': {
            borderColor: error ? theme.palette.error.main : '',
          },
          '&:hover fieldset': {
            borderColor: error ? theme.palette.error.main : '',
          },
          '&.Mui-focused fieldset': {
            borderColor: error ? theme.palette.error.main : '',
          },
        },
        '& .MuiOutlinedInput-root.Mui-disabled': {
          backgroundColor: `${theme.palette.grey[100]}`,
        },

        ...sx,
      }}
    >
      <InputLabel htmlFor="outlined-adornment-account">{label}</InputLabel>
      <OutlinedInput
        id="outlined-adornment-account"
        type={showHidden ? 'text' : 'account'}
        readOnly={true}
        required={required}
        error={error}
        value={''}
        sx={{
          textAlign: 'right',
          ...(disabled && {
            '& .MuiOutlinedInput-input': {
              opacity: 0,
              width: 0,
              padding: 0,
              minWidth: 0,
            },
          }),
        }}
        endAdornment={
          <InputAdornment
            position="end"
            sx={{ width: disabled ? '100%' : 'auto', maxWidth: 'none' }}
          >
            <TextField
              id="outlined-basic"
              variant="standard"
              value={currentValue}
              type="number"
              disabled={disabled}
              error={error}
              onChange={onChange}
              onBlur={onBlur}
              sx={{
                width: '100%',
                '.MuiInputBase-root:before': {
                  borderBottom: 'none !important',
                },
                '.MuiInputBase-root:after': {
                  borderBottom: 'none !important',
                },
                '.MuiInputBase-root:hover:not(.Mui-disabled):before': {
                  borderBottom: 'none !important',
                },
                '.MuiInputBase-root.Mui-disabled': {
                  width: '100%',
                },
                input: {
                  backgroundColor: theme.palette.common.white,
                  paddingRight: 0,
                  marginRight: 0,
                  textAlign: 'right',
                  width: '100%',
                  color: error ? theme.palette.error.dark : 'inherit',
                  MozAppearance: 'textfield',
                  '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button':
                    {
                      WebkitAppearance: 'none',
                      margin: 0,
                    },
                  '&.Mui-disabled': {
                    backgroundColor: 'transparent',
                    WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)',
                    textAlign: 'right !important',
                    width: '100%',
                  },
                },
              }}
            />
          </InputAdornment>
        }
        startAdornment={
          <InputAdornment position="end">
            <Select
              labelId="simple-select-label"
              id="simple-select"
              variant="standard"
              value={currentCurrency}
              disabled={disabled}
              renderValue={(selected) => {
                const selectedCurrency = currencyOptions?.find(
                  (currency) => currency.value === selected,
                );
                return selectedCurrency
                  ? selectedCurrency.label.substring(0, 3)
                  : '';
              }}
              onChange={onChangeCurrency}
              sx={{
                '&::before': {
                  border: 'none',
                },
                '&::after': {
                  border: 'none',
                },
                '&.Mui-disabled::before': {
                  borderBottom: 'none',
                },
                '&.Mui-disabled::after': {
                  borderBottom: 'none',
                },
                color: error
                  ? theme.palette.error.dark
                  : theme.palette.secondary.main,
                svg: {
                  color: error
                    ? theme.palette.error.dark
                    : theme.palette.secondary.main,
                },
                '&.Mui-disabled svg': {
                  display: 'none',
                },
                '&.Mui-disabled': {
                  color: theme.palette.text.disabled,
                },
              }}
            >
              {currencyOptions?.map(
                (currency: Record<string, string>, index: number) => (
                  <MenuItem
                    key={index}
                    value={currency.value}
                    sx={{ backgroundColor: theme.palette.common.white }}
                  >
                    {currency.label}
                  </MenuItem>
                ),
              )}
            </Select>
          </InputAdornment>
        }
        label={label}
        disabled={disabled}
      />
      {error && <HelperText error={error} helperText={helperText} />}
    </FormControl>
  );
};
export default Amount;
