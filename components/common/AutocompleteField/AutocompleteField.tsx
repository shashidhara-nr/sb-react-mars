import * as React from 'react';
import { Autocomplete, Box, Divider, Stack, TextField, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import Image from 'next/image';
import { AccountWallet } from '@lib/icons';
export type AutocompleteRichMetadataItem = {
  label: string;
  value: string;
};

export type AutocompleteFieldOption = {
  label: string;
  value: string;
  subtitle?: string;
  metadata?: AutocompleteRichMetadataItem[];
};

export type AutocompleteFieldProps = {
  label?: string;
  placeholder?: string;
  options: AutocompleteFieldOption[];
  value: string | null | undefined;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  rich?: boolean;
  dataTestId?: string;
};

function RichRow({ option }: { option: AutocompleteFieldOption }) {
  return (
    <Grid container alignItems="center" spacing={1} wrap="nowrap" sx={{ width: '100%' }}>
      <Grid size={6} sx={{ display: 'flex', alignItems: 'center', minWidth: 220 }}>
        <Stack
          direction="row"
          divider={<Divider orientation="vertical" flexItem />}
          alignItems="center"
          spacing={0}
          sx={{ gap: '12px' }}
        >
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: 1,
            
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image src={AccountWallet} alt="Account" width={28} height={28} />
          </Box>
          <Stack spacing={0}>
            <Typography variant="body2" color="text.secondary" noWrap>
              {option.label}
            </Typography>
            {option.subtitle && (
              <Typography variant="subtitle2" fontWeight={700} noWrap>
                {option.subtitle}
              </Typography>
            )}
          </Stack>
        </Stack>
      </Grid>

      <Grid>
        <Divider orientation="vertical" flexItem sx={{ borderColor: 'primary.main' }} />
      </Grid>

      {option.metadata && option.metadata.length > 0 && (
        <Grid
          size={6}
          sx={{ flex: 1, minWidth: 240, pr: 2 }}
        >
          <Stack
            direction="row"
            gap={1.5}
            flexWrap="nowrap"
            justifyContent="flex-end"
            alignItems="center"
          >
            <Divider orientation="vertical" flexItem sx={{ alignSelf: 'stretch' }} />
            {option.metadata.slice(0, 3).map((m, idx) => (
              <React.Fragment key={m.label}>
                {idx > 0 && (
                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{ alignSelf: 'stretch', borderColor: 'divider' }}
                  />
                )}
                <Stack spacing={0} sx={{ alignItems: 'center' }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    noWrap
                    sx={{ fontSize: '0.7rem' }}
                  >
                    {m.label}
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    noWrap
                    sx={{ fontSize: '0.875rem' }}
                  >
                    {m.value}
                  </Typography>
                </Stack>
              </React.Fragment>
            ))}
          </Stack>
        </Grid>
      )}
    </Grid>
  );
}

export function AutocompleteField({
  label,
  placeholder,
  options,
  value,
  onChange,
  disabled,
  error,
  helperText,
  rich,
  dataTestId,
}: AutocompleteFieldProps) {
  const selected = React.useMemo(
    () => options.find((o) => o.value === String(value ?? '')) || null,
    [options, value],
  );

  // Custom filter function to search across label, subtitle, and metadata
  const filterOptions = React.useMemo(
    () => (options: AutocompleteFieldOption[], state: { inputValue: string }) => {
      const searchTerm = state.inputValue.toLowerCase().trim();
      
      if (!searchTerm) {
        return options;
      }

      return options.filter((option) => {
        // Search in label
        if (option.label?.toLowerCase().includes(searchTerm)) {
          return true;
        }

        // Search in subtitle
        if (option.subtitle?.toLowerCase().includes(searchTerm)) {
          return true;
        }

        // Search in metadata values (e.g., country/region, sort code, etc.)
        if (option.metadata && option.metadata.length > 0) {
          return option.metadata.some(
            (meta) =>
              meta.label?.toLowerCase().includes(searchTerm) ||
              meta.value?.toLowerCase().includes(searchTerm)
          );
        }

        return false;
      });
    },
    []
  );

  return (
    <Autocomplete
      options={options}
      value={selected}
      onChange={(_, newValue) => {
        onChange(newValue ? newValue.value : '');
      }}
      getOptionLabel={(option) => option.label || ''}
      isOptionEqualToValue={(option, v) => option.value === v?.value}
      disabled={disabled}
      filterOptions={filterOptions}
      renderOption={
        rich
          ? (props, option) => {
              const { key, ...rest } = props as any;
              const uniqueKey = (option as any).id || (option as any).accNumber || (option as any).accountNumber || option.value;
              const boxKey = uniqueKey || key;
              return (
                <Box
                  component="li"
                  key={boxKey}
                  {...rest}
                  sx={{ padding: '12px 16px !important' }}
                >
                  <RichRow option={option} />
                </Box>
              );
            }
          : undefined
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={error}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            sx: { borderRadius: '8px' },
            startAdornment:
              selected && rich ? (
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mr: 1 }}>
                  <RichRow option={selected} />
                </Box>
              ) : (
                params.InputProps.startAdornment
              ),
          }}
          inputProps={{
            ...params.inputProps,
            'data-testid': dataTestId,
            style: selected && rich ? { display: 'none' } : undefined,
          }}
        />
      )}
    />
  );
}
