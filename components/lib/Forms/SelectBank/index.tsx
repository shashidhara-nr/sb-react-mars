import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { BankType } from './banks';
import { FormControl, SvgIcon, useTheme } from '@mui/material';
import MagIcon from '../../../../assets/icons/magglass.svg?react';
import HelperText from '../HelperText';

interface BankSelectProps {
  label: string;
  mandatory?: boolean;
  onChange: (value: BankType) => void;
  placeholder: string;
  disabled: boolean;
  banks: BankType[];
  error: boolean;
  helperText: string;
}

export default function BankSelect({
  label,
  mandatory = false,
  onChange,
  placeholder,
  disabled,
  banks,
  error,
  helperText,
}: BankSelectProps) {
  const theme = useTheme();
  return (
    <FormControl variant="filled">
      <style>
        {`
        .MuiAutocomplete-option {  background-color: white; }
      `}
      </style>
      <Autocomplete
        id="icon-select-demo"
        options={banks}
        isOptionEqualToValue={(option, value) => option.bank === value.bank}
        disableClearable
        autoHighlight
        getOptionLabel={(option) => option.label}
        defaultValue={{ bank: '-1', label: placeholder }}
        disabled={disabled}
        fullWidth={true}
        sx={{
          width: '300px',

          '.Mui-disabled': {
            backgroundColor: `${theme.palette.grey[100]}`,
          },
        }}
        renderOption={(props, option) => (
          <Box
            component="li"
            sx={{ '& > span': { mr: 2, flexShrink: 0 } }}
            {...props}
            key={option.bank}
          >
            {option.label}
          </Box>
        )}
        renderInput={(params) => {
          return (
            <TextField
              {...params}
              label={
                mandatory ? (
                  <>
                    {label}
                    <span style={{ marginLeft: 2 }}>*</span>
                  </>
                ) : (
                  label
                )
              }
              error={error}
              placeholder={label}
              sx={{
                'input, svg': {
                  color: error ? theme.palette.error.dark : 'initial',
                },
              }}
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <>
                    <SvgIcon component={MagIcon} viewBox="0 0 25 25" />
                    {params.InputProps.startAdornment}
                  </>
                ),
              }}
            />
          );
        }}
        onInputChange={(event, value) => {
          // Update the icon at the start of the input field
          // (currentIcon is used to render the startAdornment)
          event.preventDefault();

          const selectedBank = banks.filter(
            (bank: BankType) => bank.label === value,
          )[0];

          onChange(selectedBank);
        }}
      />
      {error && <HelperText error={error} helperText={helperText} />}
    </FormControl>
  );
}
