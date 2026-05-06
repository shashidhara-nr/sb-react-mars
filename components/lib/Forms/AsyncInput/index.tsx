import {
  Box,
  CircularProgress,
  FormControl,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  SvgIcon,
  SxProps,
  useTheme,
} from '@mui/material';
import { useState } from 'react';
import successIcon from '../../../../assets/icons/success.svg?react';
import errorIcon from '../../../../assets/icons/errorsign.svg?react';

interface AsyncProps {
  label: string;
  required?: boolean;
  disabled?: boolean;
  value: string;
  handleChangeValue: (value: string) => void;
  showHidden?: boolean;
  handleChangeCurrency: (value: string) => void;
  currency?: string;
  currencyOptions?: Record<string, string>[];
  condition?: boolean;
  helperText?: string;
  loading?: boolean;
  error?: boolean;
  sx?: SxProps;
}

const AsyncInput = ({
  label,
  disabled = false,
  handleChangeValue,
  required = false,
  value = '',
  condition = false,
  helperText,
  loading,
  error = false,
  sx,
}: AsyncProps) => {
  const theme = useTheme();
  const [currentValue, setCurrentValue] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setCurrentValue(newValue);
    handleChangeValue(newValue);
  };

  return (
    <FormControl
      variant="outlined"
      fullWidth
      sx={{
        '& .Mui-disabled': {
          backgroundColor: `${theme.palette.grey[100]}`,
          width: '100%',
        },
        label: {
          color: error ? `${theme.palette.error.dark} !important` : 'initial',
        },
        ...sx,
      }}
    >
      <InputLabel htmlFor="outlined-adornment-account">{label}</InputLabel>
      <OutlinedInput
        id="outlined-multiline-flexible"
        multiline
        maxRows={4}
        required={required}
        error={error}
        sx={{
          backgroundColor: theme.palette.common.white,

          svg: {
            color: !loading
              ? error
                ? theme.palette.error.dark
                : theme.palette.success.main
              : theme.palette.primary.main,
          },
        }}
        endAdornment={
          <InputAdornment position="end">
            {loading ? (
              <CircularProgress size="1.5rem" />
            ) : (
              <SvgIcon
                component={!error ? successIcon : errorIcon}
                viewBox="0 0 22 22"
              />
            )}
          </InputAdornment>
        }
        label={label}
        value={currentValue}
        disabled={disabled}
        onChange={handleChange}
      />
      <Box sx={{ paddingTop: '0.4rem', paddingLeft: '1rem' }}>
        {loading && 'Loading...'}
        {condition && !loading && !error && helperText}
        {error && !loading && <span style={{ color: 'red' }}>Error</span>}
      </Box>
    </FormControl>
  );
};
export default AsyncInput;
