// @ts-nocheck
import * as React from 'react';
import { SxProps, Theme, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import HelperText from '../HelperText';

interface MultSelectProps {
  label: string;
  options: Record<string, string>[];
  OnChange: (items: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  selected?: Record<string, string>[];
  error: boolean;
  helperText: string;
  sx?: SxProps;
}

function getStyles(name: string, selected: readonly string[], theme: Theme) {
  return {
    fontWeight: selected.includes(name)
      ? theme.typography.fontWeightMedium
      : theme.typography.fontWeightRegular,
  };
}

export default function MultipleSelectChip({
  label,
  options,
  placeholder,
  OnChange,
  disabled = false,
  error,
  helperText,
  sx,
}: MultSelectProps) {
  const theme = useTheme();
  const [selected, setSelected] = React.useState<string[]>([]);

  const handleOpen = (event: React.SyntheticEvent) => {
    const element = (event.target as HTMLElement).parentElement;

    if (element?.tagName === 'svg') {
      const optionToRemove = element.parentElement
        ?.getAttribute('id')
        ?.split('-')[1];

      setSelected((selected) =>
        selected.filter((item) => optionToRemove !== item),
      );

      OnChange(selected);
    }
  };

  const handleChange = (event: SelectChangeEvent<typeof selected>) => {
    const {
      target: { value },
    } = event;
    OnChange(typeof value === 'string' ? value.split(',') : value);
    setSelected(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  const handleDelete = (event: React.SyntheticEvent) => {
    const element = (event.target as HTMLElement).parentElement;

    if (element?.getAttribute('role') === 'button') {
      const optionToRemove = element?.getAttribute('id')?.split('-')[1];

      setSelected((selected) =>
        selected.filter((item) => optionToRemove !== item),
      );
    }
  };

  return (
    <div>
      <FormControl
        disabled={disabled}
        error={error}
        sx={{
          m: 1,
          mb: 0,
          width: '100%',

          '& .Mui-disabled': {
            backgroundColor: `${theme.palette.grey[100]}`,
          },
        }}
      >
        <InputLabel htmlFor="outlined-adornment-amount">{label}</InputLabel>
        <Select
          labelId="outlined-adornment-amount"
          id="demo-multiple-chip"
          label={placeholder}
          multiple
          error={error}
          disabled={disabled}
          value={selected}
          onOpen={handleOpen}
          onChange={handleChange}
          sx={{
            width: '100%',

            ...sx,
            backgroundColor: theme.palette.common.white,

            svg: {
              fill: error
                ? `${theme.palette.error.dark}`
                : `${theme.palette.primary}`,
            },
          }}
          input={<OutlinedInput id="select-multiple-chip" label={label} />}
          renderValue={(selected) => (
            <Box>
              {selected.map((value) => (
                <Chip
                  key={value}
                  label={value}
                  id={`chip-${value}`}
                  onDelete={handleDelete}
                  sx={{
                    backgroundColor: `${theme.palette.secondary.main}`,
                    color: `${theme.palette.common.white}`,
                    marginRight: '0.5rem',

                    '&.MuiChip-root svg': {
                      borderRadius: '50%',
                      fill: `${theme.palette.secondary.main}`,
                      background: `${theme.palette.common.white}`,
                    },
                  }}
                />
              ))}
            </Box>
          )}
        >
          {options.map(({ value, label }, index) => (
            <MenuItem
              key={index}
              value={value}
              style={getStyles(label, selected, theme)}
              sx={{
                width: '100%',
                paddingLeft: '16px',
                paddingRight: '16px',
                '&.MuiMenuItem-root': {
                  backgroundColor: `${theme.palette.common.white}`,
                  color: `${theme.palette.common.black}`,
                  width: '100%',
                },
                '&.Mui-selected': {
                  backgroundColor: `${theme.palette.secondary.main} !important`,
                  color: `${theme.palette.common.white}`,
                  width: '100%',
                },
                '&.Mui-selected:hover': {
                  backgroundColor: `${theme.palette.secondary.main} !important`,
                },
              }}
            >
              {value}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {error && <HelperText error={error} helperText={helperText} />}
    </div>
  );
}
