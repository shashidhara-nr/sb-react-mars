import { Radio, useTheme } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import React from 'react';

interface RadioButtonProps {
  value: unknown;
  label: string;
  disabled?: boolean;
  defaultChecked?: boolean;
  handleChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function RadioButton({
  value,
  label,
  disabled = false,
  defaultChecked = false,
  handleChange,
}: RadioButtonProps) {
  const theme = useTheme();
  return (
    <FormControlLabel
      value={value}
      sx={{
        '& .MuiFormControlLabel-label': {
          font: theme.typography.sRegular,
        },
      }}
      control={
        <Radio
          onChange={handleChange}
          disabled={disabled}
          defaultChecked={defaultChecked}
          sx={{
            '&.Mui-checked': {
              color: theme.palette.secondary.main,
            },
            '&.Mui-disabled': {
              color: theme.palette.grey[300],
            },
            '&.Mui-checked.Mui-disabled': {
              color: theme.palette.grey[300],
            },
            '&:hover': {
              backgroundColor: theme.palette.grey[100],
            },
          }}
        />
      }
      label={label}
    />
  );
}
