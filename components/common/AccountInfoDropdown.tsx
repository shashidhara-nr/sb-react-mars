import * as React from 'react';
import {
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  Box,
  Stack,
  Typography,
  Chip,
  Divider,
  FormHelperText,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { AccountBalance as AccountBalanceIcon } from '@mui/icons-material';
import Image from 'next/image';

export interface AccountInfoOption {
  value: string;
  name: string;
  masked: string;
  accNumber: string;
  sortCode: string;
  bic: string;
  balances: { label: string; value: string }[];
  iconChevronDown?: string;
}

interface AccountInfoDropdownProps {
  label?: string;
  value: string;
  options: AccountInfoOption[];
  onChange: (event: SelectChangeEvent<string>) => void;
  iconChevronDown?: string;
  fullWidth?: boolean;
  selectProps?: Record<string, any>;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  dataTestId?: string;
  disabled?: boolean;
}

const AccountInfoDropdown: React.FC<AccountInfoDropdownProps> = ({
  label = 'Account Info',
  value,
  options,
  onChange,
  iconChevronDown,
  fullWidth = true,
  selectProps = {},
  error = false,
  helperText,
  required = false,
  dataTestId,
  disabled = false,
}) => {
  const selected = options.find((opt) => opt.value === value);

  return (
    <FormControl size="small" fullWidth={fullWidth} error={error} required={required} disabled={disabled}>
      <Select
        value={value}
        onChange={onChange}
        displayEmpty
        disabled={disabled}
        sx={{
          '& .MuiSelect-icon': { color: '#0051FF' },
          '& .MuiOutlinedInput-notchedOutline': { borderRadius: '8px' },
        }}
        IconComponent={
          iconChevronDown
            ? ((props: any) => (
                <Image
                  src={iconChevronDown}
                  alt="chevron down"
                  width={20}
                  height={20}
                  className={props.className}
                  style={props.style}
                />
              ))
            : undefined
        }
        data-testid={dataTestId}
        // --- SELECTED VALUE WITH VERTICAL DIVIDERS ---
        renderValue={() =>
          selected ? (
            <Grid container alignItems="center" spacing={1} wrap="nowrap">
              {/* Left: Icon and Name/Masked aligned together */}
              <Grid size={6} sx={{ display: 'flex', alignItems: 'center', minWidth: 220 }}>
                <Stack direction="row"   divider={<Divider orientation="vertical" flexItem />} alignItems="center" spacing={0} sx={{ gap: '12px' }}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: 1,
                      bgcolor: 'primary.light',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <AccountBalanceIcon fontSize="small" />
                  </Box>
                  <Stack spacing={0}>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {selected.name}
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={700} noWrap>
                      {selected.masked}
                    </Typography>
                  </Stack>
                </Stack>
              </Grid>

              {/* Divider after left section */}
              <Grid>
                <Divider orientation="vertical" flexItem sx={{ borderColor: 'primary.main' }} />
              </Grid>

              {/* Right: Balances */}
              <Grid size={6} sx={{ flex: 1, minWidth: 240, pr:2 }}>
                <Stack
                  direction="row"
                  gap={1}
                  flexWrap="nowrap"
                  justifyContent="flex-end"
                  alignItems="center"
                >
                  {selected.balances.map((b, idx) => (
                    <React.Fragment key={b.label}>
                      {idx > 0 && (
                        <Divider orientation="vertical" flexItem sx={{ alignSelf: 'stretch' }} />
                      )}
                      <Stack spacing={0} sx={{ alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: '0.7rem' }}>
                          {b.label}
                        </Typography>
                        <Typography variant="body2" fontWeight={600} noWrap sx={{ fontSize: '0.875rem' }}>
                          {b.value}
                        </Typography>
                      </Stack>
                    </React.Fragment>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          ) : (
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary',
                fontSize: '0.875rem',
                fontWeight: 400,
              }}
            >
              {label}
            </Typography>
          )
        }
        {...selectProps}
      >
        {/* --- OPTIONS WITH VERTICAL DIVIDERS --- */}
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value} sx={{ py: 1.2 }}>
            <Grid container alignItems="center" spacing={1} wrap="nowrap" sx={{ width: '100%' }}>
              {/* Left: Icon and Name/Masked aligned together */}
              <Grid size={6} sx={{ display: 'flex', alignItems: 'center', minWidth: 220 }}>
                <Stack direction="row" alignItems="center"    divider={<Divider orientation="vertical" flexItem />} spacing={0} sx={{ gap: '12px' }}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: 1,
                      bgcolor: 'primary.light',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <AccountBalanceIcon fontSize="small" />
                  </Box>
                  <Stack spacing={0} >
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {opt.name}
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={700} noWrap>
                      {opt.masked}
                    </Typography>
                  </Stack>
                </Stack>
              </Grid>

              {/* Divider after left section */}
              <Grid>
                <Divider orientation="vertical" flexItem />
              </Grid>

              {/* Balances with internal vertical dividers */}
              <Grid size={6} >
                <Stack
                  direction="row"
                  gap={1.5}
                  flexWrap="nowrap"
                  justifyContent="flex-end"
                  alignItems="center"
                >
                  {opt.balances.map((b, idx) => (
                    <React.Fragment key={b.label}>
                      {idx > 0 && (
                        <Divider orientation="vertical" flexItem sx={{ alignSelf: 'stretch' }} />
                      )}
                      <Stack spacing={0} sx={{ alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: '0.7rem' }}>
                          {b.label}
                        </Typography>
                        <Typography variant="body2" fontWeight={600} noWrap sx={{ fontSize: '0.875rem' }}>
                          {b.value}
                        </Typography>
                      </Stack>
                    </React.Fragment>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </MenuItem>
        ))}
      </Select>
      {helperText && (
        <FormHelperText>{helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

export default AccountInfoDropdown;
