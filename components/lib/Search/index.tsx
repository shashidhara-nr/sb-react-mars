import React, { useState } from 'react';
import { Box, TextField, SvgIcon, FormControl } from '@mui/material';
import MagIcon from '../../../assets/icons/magglass.svg?react';
import theme from '../styles/theme';

export interface SearchProps<T> {
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  data: T[];
  getLabel: (item: T) => string;
  onSelect: (item: T) => void;
  error?: boolean;
  helperText?: string;
}

export default function Search<T>({
  label = 'Search',
  placeholder = 'Type to search...',
  disabled = false,
  data,
  getLabel,
  onSelect,
  error = false,
  helperText = '',
}: SearchProps<T>) {
  const [inputValue, setInputValue] = useState('');
  const [filtered, setFiltered] = useState<T[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (value) {
      setFiltered(
        data.filter((item) =>
          getLabel(item).toLowerCase().includes(value.toLowerCase()),
        ),
      );
    } else {
      setFiltered([]);
    }
  };

  return (
    <FormControl variant="filled" fullWidth>
      <TextField
        label={label}
        placeholder={placeholder}
        value={inputValue}
        onChange={handleChange}
        disabled={disabled}
        error={error}
        sx={{
          'input, svg': {
            color: error ? theme.palette.error.dark : 'initial',
          },
        }}
        InputProps={{
          startAdornment: (
            <SvgIcon component={MagIcon} viewBox="0 0 25 25" sx={{ mr: 1 }} />
          ),
        }}
        helperText={helperText}
      />
      {inputValue && filtered.length > 0 && (
        <Box
          sx={{
            border: '1px solid #eee',
            borderRadius: 1,
            mt: 1,
            background: '#fff',
            maxHeight: 200,
            overflowY: 'auto',
          }}
        >
          {filtered.map((item, idx) => (
            <Box
              key={idx}
              sx={{
                px: 2,
                py: 1,
                cursor: 'pointer',
                '&:hover': { background: '#f5f5f5' },
              }}
              onClick={() => {
                setInputValue(getLabel(item));
                setFiltered([]);
                onSelect(item);
              }}
            >
              {getLabel(item)}
            </Box>
          ))}
        </Box>
      )}
      {error && helperText && (
        <Box sx={{ color: theme.palette.error.dark, mt: 1 }}>{helperText}</Box>
      )}
    </FormControl>
  );
}
