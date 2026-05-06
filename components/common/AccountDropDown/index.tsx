"use client";
import * as React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Box,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import Image from 'next/image';
import CurrentAccountIcon from 'public/icons/current_account.svg';
 
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
  startIcon?: string;
  fullWidth?: boolean;
  selectProps?: Record<string, any>;
  dataTestId?: string;
}

const AccountInfoDropdown: React.FC<AccountInfoDropdownProps> = ({
  label = 'Search accounts',
  value,
  options,
  onChange,
  iconChevronDown,
  startIcon,
  fullWidth = true,
  selectProps = {},
  dataTestId,
}) => {
  const selected = options.find(opt => opt.value === value);
  const [isFocused, setIsFocused] = React.useState(false);
  const [searchText, setSearchText] = React.useState('');
  const hasValue = Boolean(value);
  const isLabelShrunk = isFocused || hasValue;

  // Filter options based on search text
  const filteredOptions = React.useMemo(() => {
    if (!searchText.trim()) return options; // Show all when no search
    const search = searchText.toLowerCase();
    return options.filter(opt => 
      opt.name.toLowerCase().includes(search) ||
      opt.accNumber.toLowerCase().includes(search) ||
      opt.sortCode.toLowerCase().includes(search) ||
      opt.bic.toLowerCase().includes(search)
    );
  }, [options, searchText]);

  // Handle keyboard input for search
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      e.stopPropagation();
      setSearchText(prev => prev + e.key);
    } else if (e.key === 'Backspace' && searchText) {
      e.preventDefault();
      e.stopPropagation();
      setSearchText(prev => prev.slice(0, -1));
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setSearchText('');
    } else if (e.key === 'Enter' && filteredOptions.length === 1 && searchText) {
      e.preventDefault();
      onChange({ target: { value: filteredOptions[0].value } } as any);
      setSearchText('');
    }
  };

  // Reset search when menu closes
  const handleClose = () => {
    setSearchText('');
    setIsFocused(false);
  };

  const handleOpen = () => {
    setIsFocused(true);
  };

  return (
    <FormControl fullWidth={fullWidth}>
      <Select
        labelId="account-info-dropdown-label"
        value={value}
        onOpen={handleOpen}
        onClose={handleClose}
        displayEmpty
        onKeyDown={handleKeyDown}
        onChange={onChange}
        MenuProps={{
          autoFocus: false,
        }}
        renderValue={(selected) => {
          // If user is typing, show search text with search icon
          if (searchText && !selected) {
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#000' }}>
                {startIcon && <Image src={startIcon} alt="search" width={24} height={24} style={{ display: 'block' }} />}
                <span>{searchText}</span>
              </Box>
            );
          }
          
          if (!selected) {
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(0, 0, 0, 0.6)' }}>
                {startIcon && <Image src={startIcon} alt="search" width={24} height={24} style={{ display: 'block' }} />}
                <span>{label}</span>
              </Box>
            );
          }
          const selectedOption = options.find(opt => opt.value === selected);
          if (!selectedOption) return selected;
          
          return (
            <Grid container alignItems="center" spacing={2} wrap="nowrap" sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <Grid size={{ xs: 3, md: 3 }} sx={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Image src={CurrentAccountIcon} alt="account" width={28} height={28} />
                <Stack sx={{ borderLeft: '1px solid blue', padding: '8px', height: '40px', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {selectedOption.name}
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {selectedOption.accNumber}
                  </Typography>
                </Stack>
              </Grid>
              <Grid size={{ xs: 6, md: 6 }} sx={{ ml: '12px' }}>
                <Stack direction="row" gap={0} flexWrap="nowrap" justifyContent="flex-end" sx={{ width: '100%' }}>
                  {selectedOption.balances.filter(b => {
                    // Only show Sort Code and BIC/SWIFT in selected state (exclude Account Type and Country)
                    const label = b.label.toLowerCase();
                    const isAccountType = label.includes('account') || label.includes('type') || label.includes('tipo') || label.includes('compte');
                    const isCountry = label.includes('country') || label.includes('pays') || label.includes('país') || label.includes('pais');
                    return !isAccountType && !isCountry;
                  }).map(b => (
                    <Stack key={b.label} direction="row" alignItems="center" spacing={1} sx={{ minWidth: 12, borderLeft: '1px solid blue', padding: '8px', height: '40px' }}>
                      <Stack spacing={0.3}>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {b.label}
                        </Typography>
                        <Typography variant="subtitle2" fontWeight={700}>
                          {b.value}
                        </Typography>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          );
        }}
        sx={{ 
          minHeight: '60px !important',
          maxHeight: '60px !important',
          height: '60px !important',
          '& .MuiInputBase-root': {
            minHeight: '60px !important',
            maxHeight: '60px !important',
            height: '60px !important',
          },
          '& .MuiOutlinedInput-root': {
            minHeight: '60px !important',
            maxHeight: '60px !important',
            height: '60px !important',
          },
          '& .MuiSelect-select': {
            display: 'flex',
            alignItems: 'center',
            minHeight: '60px !important',
            maxHeight: '60px !important',
            height: '60px !important',
            padding: '0 26px 0 14px !important',
          },
          '& .MuiSelect-icon': { 
            color: '#0051FF',
            right: '14px',
          }, 
          '& .MuiOutlinedInput-notchedOutline': { 
            borderRadius: '8px',
          } 
        }}
        IconComponent={iconChevronDown ? ((props: any) => (
          <Image
            src={iconChevronDown}
            alt="chevron down"
            width={20}
            height={20}
            className={props.className}
            style={{ ...props.style, position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          />
        )) : undefined}
        data-testid={dataTestId}
        {...selectProps}
      >
        {filteredOptions.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center', width: '100%' }}>
              No accounts found
            </Typography>
          </MenuItem>
        ) : (
          filteredOptions.map(opt => (
          <MenuItem key={opt.value} value={opt.value}>
            <Grid container alignItems="center" spacing={2} wrap="nowrap" sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <Grid  size={{ xs: 3, md: 3 }} sx={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Image src={CurrentAccountIcon} alt="account" width={28} height={28} />
                <Stack  sx={{borderLeft:'1px solid blue', padding:'8px', height: '40px', justifyContent: 'center'}}>
                  <Typography variant="body2" color="text.secondary">
                    {opt.name}
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {opt.accNumber}
                  </Typography>
                </Stack>
              </Grid>
              <Grid size={{ xs: 6, md: 6 }} sx={{ ml: '12px', pr: '7px' }}>
                <Stack direction="row" gap={0.5} flexWrap="nowrap" justifyContent="flex-end" sx={{ width: '100%' }} >
                  {opt.balances.filter(b => {
                    // Only show Sort Code and BIC/SWIFT (exclude Account Type and Country)
                    const label = b.label.toLowerCase();
                    const isAccountType = label.includes('account') || label.includes('type') || label.includes('tipo') || label.includes('compte');
                    const isCountry = label.includes('country') || label.includes('pays') || label.includes('país') || label.includes('pais');
                    return !isAccountType && !isCountry;
                  }).map(b => (
                    <Stack key={b.label} direction="row" alignItems="center" spacing={1} sx={{ minWidth: 12,borderLeft:'1px solid blue', padding:'8px', height: '40px' }}>
                      <Stack spacing={0.3}>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {b.label}
                        </Typography>
                        <Typography variant="subtitle2" fontWeight={700}>
                          {b.value}
                        </Typography>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </MenuItem>
        ))
        )}
      </Select>
    </FormControl>
  );
};
 
export default AccountInfoDropdown;
