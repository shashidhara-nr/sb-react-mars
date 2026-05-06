import { HighlightOff } from '@mui/icons-material';
import {
  FormControl,
  IconButton,
  InputAdornment,
  SxProps,
  TextField,
  useTheme,
} from '@mui/material';
import { useState } from 'react';
import HelperText from '../HelperText';

interface AccountProps {
  label: string;
  required: boolean;
  disabled: boolean;
  handleChange: (value: string) => void;
  error: boolean;
  helperText: string;
  sx?: SxProps;
}

const Account = ({
  label,
  required,
  disabled,
  error,
  helperText,
  handleChange,
  sx,
}: AccountProps) => {
  const theme = useTheme();
  const [currentValue, setCurrentValue] = useState('');

  const resetCurrentValue = () => {
    setCurrentValue('');
    handleChange('');
  };

  return (
    <FormControl
      variant="filled"
      sx={{
        ...sx,
        width: '100%',

        '& .Mui-disabled': {
          backgroundColor: `${theme.palette.grey[100]}`,
          width: '100%',
        },
        svg: {
          color: error ? theme.palette.error.dark : 'initial',
        },
        input: {
          backgroundColor: theme.palette.common.white,
        },
      }}
    >
      <TextField
        id="outlined-adornment-account"
        fullWidth
        error={error}
        required={required}
        value={currentValue}
        sx={{ backgroundColor: theme.palette.common.white }}
        onChange={(e) => {
          setCurrentValue(e.target.value);
          handleChange(e.target.value);
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={resetCurrentValue}>
                <HighlightOff />
              </IconButton>
            </InputAdornment>
          ),
        }}
        label={label}
        disabled={disabled}
      />
      {error && <HelperText error={error} helperText={helperText} />}
    </FormControl>
  );
};

export default Account;
