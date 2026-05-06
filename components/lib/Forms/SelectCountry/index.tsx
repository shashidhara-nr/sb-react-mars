import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
import { countries, CountryType } from './countries';
import { FormControl, useTheme } from '@mui/material';
import HelperText from '../HelperText';

interface CountrySelectProps {
  label: string;
  onChange: (value: CountryType) => void;
  placeholder: string;
  disabled: boolean;
  error: boolean;
  helperText: string;
}

export default function CountrySelect({
  label,
  onChange,
  placeholder,
  disabled,
  error,
  helperText,
}: CountrySelectProps) {
  const theme = useTheme();
  let currentIcon: string | null = null;

  return (
    <FormControl variant="filled">
      <Autocomplete
        id="icon-select-demo"
        options={countries}
        isOptionEqualToValue={(option, value) => option.code === value.code}
        disableClearable
        autoHighlight
        getOptionLabel={(option) => option.label}
        defaultValue={{ code: '-1', label: placeholder }}
        disabled={disabled}
        sx={{
          width: '300px',

          '.Mui-disabled': {
            backgroundColor: `${theme.palette.grey[100]}`,
          },
        }}
        renderOption={(props, option) => (
          <Box
            component="li"
            sx={{
              '& > span': { mr: 2, flexShrink: 0 },
              background: theme.palette.common.white,
            }}
            {...props}
            key={option.code}
          >
            {option.code !== '-1' && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                loading="lazy"
                width="20"
                style={{ marginRight: '1rem' }}
                srcSet={`https://flagcdn.com/w40/${option.code?.toLowerCase()}.png 2x`}
                src={`https://flagcdn.com/w20/${option.code?.toLowerCase()}.png`}
                alt=""
              />
            )}
            {option.label}
          </Box>
        )}
        renderInput={(params) => {
          return (
            <TextField
              {...params}
              label={label}
              error={error}
              sx={{
                input: {
                  color: error ? theme.palette.error.dark : 'initial',
                },
                svg: {
                  color: error ? theme.palette.error.dark : 'initial',
                },
              }}
              placeholder={label}
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <>
                    <InputAdornment position="start">
                      {currentIcon && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          loading="lazy"
                          width="24"
                          height="24"
                          style={{
                            borderRadius: '50%',
                            border: `1.5px solid ${theme.palette.divider}`,
                            objectFit: 'cover',
                            background: '#fff',
                          }}
                          srcSet={`https://flagcdn.com/w40/${currentIcon?.toLowerCase()}.png 2x`}
                          src={`https://flagcdn.com/w20/${currentIcon?.toLowerCase()}.png`}
                          alt=""
                        />
                      )}
                    </InputAdornment>
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

          const country = countries.filter(
            (country) => country.label === value,
          )[0];

          onChange(country);

          currentIcon = country.code;
        }}
      />
      {error && <HelperText error={error} helperText={helperText} />}
    </FormControl>
  );
}
