'use client';

import React from 'react';
import Image from 'next/image';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { COUNTRY_LIST, getCountryOption } from 'lib/countryUtils';

export interface CountrySelectFieldProps {
  name: string;
  label?: string;
  value: string | number;
  onChange: (name: string, value: string | number) => void;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  height?: string;
  required?: boolean;
}

const CountrySelectField: React.FC<CountrySelectFieldProps> = ({
  name,
  label = 'Country',
  value,
  onChange,
  disabled = false,
  error = false,
  helperText = '',
  height = '48px',
  required = false,
}) => {
  const handleChange = (event: SelectChangeEvent<any>) => {
    onChange(name, event.target.value);
  };

  const selectedCountry = getCountryOption(String(value));

  return (
    <FormControl 
      fullWidth 
      error={error}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '8px',
          height: height,
        },
      }}
    >
      <InputLabel id={`${name}-label`}>{label}</InputLabel>
      <Select
        labelId={`${name}-label`}
        id={name}
        name={name}
        value={String(value || '')}
        onChange={handleChange}
        label={label}
        disabled={disabled}
        displayEmpty
        renderValue={(selected) => {
          if (!selected) return '';
          const country = getCountryOption(String(selected));
          if (!country) return String(selected);

          return (
            <Box display="flex" alignItems="center" gap={1}>
              <Box
                sx={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
                  border: '1px solid #e0e0e0',
                  backgroundColor: '#f5f5f5'
                }}
              >
                <Image
                  src={country.flagIcon}
                  alt={country.label}
                  width={28}
                  height={28}
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
              </Box>
              <span>{country.label}</span>
            </Box>
          );
        }}
        MenuProps={{
          sx: { zIndex: 1500 },
        }}
      >
        <MenuItem value="">
          <em>Select a country...</em>
        </MenuItem>
        {COUNTRY_LIST.map((country) => (
          <MenuItem key={country.value} value={country.value}>
            <Box display="flex" alignItems="center" gap={1}>
              <Box
                sx={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
                  border: '1px solid #e0e0e0',
                  backgroundColor: '#f5f5f5'
                }}
              >
                <Image
                  src={country.flagIcon}
                  alt={country.label}
                  width={28}
                  height={28}
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
              </Box>
              <span>{country.label}</span>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default CountrySelectField;
