import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  useTheme,
  Box,
  OutlinedInput,
  InputAdornment,
} from '@mui/material';

export type DropDownOption = {
  label: string;
  value: string;
};

export type DropDownProps = {
  label: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  options?: DropDownOption[];
  handleChange?: (event: SelectChangeEvent<string>) => void;
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
};

export default function DropDown({
  label,
  value,
  defaultValue,
  disabled = false,
  options = [],
  handleChange,
  fullWidth = true,
  startIcon,
}: DropDownProps) {
  const theme = useTheme();
  const labelId = `${label.replace(/\s+/g, '-').toLowerCase()}-label`;
  const selectId = `${label.replace(/\s+/g, '-').toLowerCase()}-select`;

  return (
    <Box sx={{ minWidth: 120, width: fullWidth ? '100%' : 'auto' }}>
      <FormControl fullWidth={fullWidth} size="small" disabled={disabled}>
        <InputLabel
          id={labelId}
          sx={{
            font: theme.typography.sRegular,
          }}
        >
          {label}
        </InputLabel>
        <Select
          labelId={labelId}
          id={selectId}
          label={label}
          onChange={handleChange}
          disabled={disabled}
          {...(value !== undefined ? { value } : { defaultValue })}
          input={
            <OutlinedInput
              label={label}
              startAdornment={
                startIcon ? (
                  <InputAdornment position="start">{startIcon}</InputAdornment>
                ) : null
              }
            />
          }
          sx={{
            font: theme.typography.sRegular,
            '&.Mui-disabled': {
              color: theme.palette.grey[500],
            },
            '& .MuiSelect-select': {
              paddingTop: '8px',
              paddingBottom: '8px',
            },
            '& .MuiSelect-icon': {
              color: '#0051FF',
            },
            '&:hover': {
              backgroundColor: theme.palette.grey[50],
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.secondary.main,
            },
          }}
        >
          {options.map((opt) => (
            <MenuItem
              key={opt.value}
              value={opt.value}
              sx={{ font: theme.typography.sRegular }}
            >
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
