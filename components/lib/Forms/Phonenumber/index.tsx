// @ts-nocheck
import React, { useEffect } from 'react';
import { Box, FormControl, FormHelperText, useTheme } from '@mui/material';
import { MuiTelInput, MuiTelInputCountry } from 'mui-tel-input';

interface PhoneNumberProps {
  label?: string;
  disabled?: boolean;
  defaultValue?: string;
  onChange: (value: string) => void;
  defaultCountry: MuiTelInputCountry;
  error: boolean;
  helperText: string;
}

const PhoneNumber = ({
  label = 'phonenumber',
  disabled = false,
  defaultValue = '',
  onChange,
  defaultCountry = 'ZA' as MuiTelInputCountry,
  error,
  helperText,
  value: controlledValue,
}: PhoneNumberProps & { value?: string }) => {
  const theme = useTheme();
  const [currentValue, setCurrentValue] = React.useState(
    controlledValue ?? defaultValue ?? '',
  );

  useEffect(() => {
    if (controlledValue !== undefined && controlledValue !== currentValue) {
      setCurrentValue(controlledValue);
    }
  }, [controlledValue, currentValue]);

  const handleOnChange = (newValue: string) => {
    if (controlledValue === undefined) {
      setCurrentValue(newValue);
    }
    onChange(newValue);
  };

  return (
    <Box>
      <style>{`
            .MenuItem-root {border: 1px solid blue;  }
        .MuiTelInput-FlagImg,  MuiTelInput-ListItemIcon-flag, .MuiTelInput-ListItemText-country { display: none }
        .MuiIconButton-root { width: 50px;  height: 50px; }
        .MuiTelInput-ListItemText-country { position: absolute; left: 1rem; }
     .MuiButtonBase-root .MuiTypography-body2 { position: absolute; left: 0rem; padding: 0.9rem; }
        .MuiMenuItem-root { background-color: ${theme.palette.common.white}; padding: 0.9rem; width: 102px; :}
       }

      `}</style>
      <FormControl
        fullWidth
        sx={{
          '& .Mui-disabled': {
            backgroundColor: `${theme.palette.grey}`,
            width: '100%',
          },

          '.MuiButtonBase-root': {
            position: 'absolute',
            top: '0px',
          },

          '&.MenuItem-root': {
            border: '1px solid blue',
          },
        }}
      >
        <MuiTelInput
          defaultCountry={defaultCountry}
          onChange={(value: string) => handleOnChange(value as string)}
          variant="outlined"
          fullWidth
          value={controlledValue ?? currentValue}
          label={label}
          disabled={disabled}
          role="textbox"
          error={error}
          sx={{
            '& .Mui-disabled': {
              backgroundColor: `${theme.palette.grey}`,
              width: '100%',
            },

            '& label.Mui-disabled': {
              backgroundColor: 'initial',
            },

            '&.MuiTelInput-MenuItem': {
              display: 'none',
            },

            'input[type="tel"]': {
              color: error ? theme.palette.error.dark : 'initial',
            },
          }}
        />
        {helperText && (
          <FormHelperText
            sx={{ color: error ? theme.palette.error.dark : 'initial' }}
          >
            {helperText}
          </FormHelperText>
        )}
      </FormControl>
    </Box>
  );
};

export default PhoneNumber;
