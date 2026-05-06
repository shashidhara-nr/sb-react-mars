import { Checkbox, useTheme, FormControlLabel } from '@mui/material';
import { ChangeEvent } from 'react';

interface CustomCheckboxProps {
  variant: 'error' | 'primary';
  label: string;
  disabled?: boolean;
  defaultChecked?: boolean;
  checked?: boolean;
  handleChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  indeterminate?: boolean;
}

export default function CustomCheckbox({
  variant,
  disabled = false,
  defaultChecked = false,
  label,
  indeterminate,
  handleChange,
}: CustomCheckboxProps) {
  const theme = useTheme();
  const getColour = (variant: string) => {
    switch (variant) {
      case 'error':
        return theme.palette.error.main;
      default:
        return theme.palette.secondary.main;
    }
  };
  const getHoverColour = (variant: string) => {
    switch (variant) {
      case 'error':
        return theme.palette.error.lighter;
      default:
        return theme.palette.secondary.lighter;
    }
  };

  return (
    <FormControlLabel
      label={label}
      sx={{
        '&.Mui-focusVisible': {
          color: getHoverColour(variant),
        },
        '& .MuiFormControlLabel-label': {
          font: theme.typography.sRegular,
        },
      }}
      control={
        <Checkbox
          disableRipple
          slotProps={{
            input: {
              'aria-label': 'Checkbox',
            },
          }}
          indeterminate={indeterminate}
          onChange={handleChange}
          disabled={disabled}
          defaultChecked={defaultChecked}
          sx={{
            color: getColour(variant),
            '&.Mui-focusVisible': {
              backgroundColor: getHoverColour(variant),
            },
            '&.Mui-disabled': {
              color: theme.palette.grey[500],
            },
            '&.MuiCheckbox-indeterminate': {
              color: getColour(variant),
            },

            '&.Mui-checked.Mui-disabled': {
              color: theme.palette.grey[300],
            },
            '&.Mui-checked': {
              color: getColour(variant),
            },

            '&:hover': {
              backgroundColor: getHoverColour(variant),
            },
          }}
        />
      }
    />
  );
}
