import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  FormControl,
  IconButton,
  InputAdornment,
  SxProps,
  TextField,
  useTheme,
} from '@mui/material';
import { useState, forwardRef } from 'react';
import HelperText from '../HelperText';

interface PasswordProps {
  label: string;
  required: boolean;
  disabled: boolean;
  placeholder: string;
  type: string;
  error: boolean;
  helperText: string;
  sx?: SxProps;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Password = forwardRef<HTMLInputElement, PasswordProps>(
  (
    { label, required, disabled, error, helperText, sx, value, onChange },
    ref,
  ) => {
    const theme = useTheme();
    const [showHidden, setShowHidden] = useState(false);
    const handleClickShowPassword = () => setShowHidden((show) => !show);
    const [currentValue, setCurrentValue] = useState('');

    const isControlled = value !== undefined;
    const inputValue = isControlled ? value : currentValue;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (!isControlled) {
        setCurrentValue(newValue);
      }
      onChange?.(e);
    };

    const handleMouseDownPassword = (
      event: React.MouseEvent<HTMLButtonElement>,
    ) => {
      event.preventDefault();
    };

    const handleMouseUpPassword = (
      event: React.MouseEvent<HTMLButtonElement>,
    ) => {
      event.preventDefault();
    };

    return (
      <FormControl
        variant="filled"
        sx={{
          width: '100%',
          ...sx,

          '& .Mui-disabled': {
            backgroundColor: `${theme.palette.grey[100]}`,
            width: '100%',
          },
        }}
      >
        <TextField
          ref={ref}
          id="outlined-adornment-password"
          type={showHidden ? 'text' : 'password'}
          fullWidth
          variant="outlined"
          required={required}
          onChange={handleChange}
          error={error}
          value={inputValue}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={
                    showHidden ? 'hide the password' : 'display the password'
                  }
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  onMouseUp={handleMouseUpPassword}
                  edge="end"
                  sx={{
                    svg: {
                      color: error ? theme.palette.error.dark : 'initial',
                    },
                  }}
                >
                  {showHidden ? <VisibilityOff /> : <Visibility />}
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
  },
);

Password.displayName = 'Password';

export default Password;
