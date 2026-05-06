// @ts-nocheck
import {
  Box,
  Autocomplete as MUIAutocomplete,
  SvgIcon,
  SxProps,
  TextFieldProps,
  useTheme,
} from '@mui/material';
import { TextField as MUITextField } from '@mui/material';
import HelperText from '../HelperText';
import maggIcon from 'public/icons/maggIcon.svg';
import { Icon } from '@atoms/index';

type AutocompleteProps = {
  /** The label for the component. */
  label: string;
  /** Optional material UI styling properties. */
  sx?: SxProps;
  /** Thee available options as an array of strings. */
  options: Array<string | { label: string; id: string }>;
  disabled?: boolean;
  helperText?: string;
  error: boolean;
  /** Input change handler. */
  onInputChange: (event: React.SyntheticEvent, value: string) => void;
  onHighlightChange: (
    event: React.SyntheticEvent,
    option: string | null,
    reason: string,
  ) => void;
};

export default function Autocomplete({
  label,
  sx,
  options,
  onInputChange,
  onHighlightChange,
  disabled = false,
  error = false,
  helperText = '',
}: AutocompleteProps) {
  const theme = useTheme();
  return (
    <Box>
      <style>
        {`
        .MuiAutocomplete-option {  background-color: white; }

        label[data-shrink=true] {
          position: absolute;
          left: -1rem;
          top: 0px;
        }
      `}
      </style>
      <Icon name="magGlass" width="27px" height="27px" style={{ position: 'absolute', left: '0.5rem', top: '1.7rem', zIndex: 1000 }} />
      <MUIAutocomplete
        freeSolo
        disableClearable
        size="small"
        error={error}
        sx={{
          ...sx,
          borderRadius: 5,
          '.MuiAutocomplete-input': {
            marginLeft: '1.2rem !important',
          },
          '& .Mui-disabled': {
            backgroundColor: `${theme.palette.grey[100]}`,
            width: '100%',
          },
          label: {
            width: '80% !important',
          },
        }}
        onHighlightChange={onHighlightChange}
        fullWidth
        renderInput={(params: TextFieldProps) => (
          <MUITextField
            {...params}
            label={label}
            error={error}
            sx={{
              backgroundColor: theme.palette.common.white,
              '.MuiAutocomplete-input, label ': {
                marginLeft: '1.2rem !important',
              },
            }}
          />
        )}
        // @ts-expect-error - The options prop is not typed correctly vs the MUI docs.
        options={options}
        onInputChange={onInputChange}
        disabled={disabled}
        helperText={helperText}
      />
      {error && <HelperText error={error} helperText={helperText} />}
    </Box>
  );
}
