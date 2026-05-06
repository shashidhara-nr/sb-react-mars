// @ts-nocheck
import {
  alpha,
  FormControl,
  InputAdornment,
  TextField as MUITextField,
  styled,
  useTheme,
} from '@mui/material';
import { Fields } from 'lib/components/Form';
import { useState, useEffect } from 'react';
import Button from '../Button';
import HelperText from '../HelperText';

/**
 * The TextField component is used for normal text inputs.
 */
const TextField = styled((props: Fields) => {
  const theme = useTheme();
  const [currentValue, setCurrentValue] = useState(
    props.value ?? props.defaultValue ?? '',
  );

  useEffect(() => {
    if (props.value !== undefined) {
      setCurrentValue(props.value);
    }
  }, [props.value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setCurrentValue(newValue);
    props.onChange?.(e);
  };

  return (
    <>
      {props?.type === 'inputwithcta' ? (
        <FormControl
          variant="filled"
          sx={{
            '& .Mui-disabled': {
              backgroundColor: `${theme.palette.grey[100]}`,
              width: '100%',
            },

            '.MuiInputBase-root': {
              paddingRight: '0px',
            },

            'button, button:hover': {
              color: props.error
                ? theme.palette.error.dark
                : theme.palette.primary.main,
            },
            ...props?.sx,
          }}
        >
          <MUITextField
            error={props?.error}
            label={props?.label}
            required={props?.required}
            fullWidth
            sx={{ paddingRight: '0px' }}
            value={props.value ?? currentValue}
            name={props?.name}
            placeholder={props?.label}
            onChange={handleChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    buttonVariant="tertiary"
                    type="submit"
                    disabled={props?.disabled}
                    onClick={() => console.log(currentValue)}
                    sx={{
                      '& .Mui-disabled': {
                        backgroundColor: `${theme.palette.grey[100]}`,
                        width: '100%',
                      },
                    }}
                  >
                    Submit
                  </Button>
                </InputAdornment>
              ),
            }}
            disabled={props?.disabled}
          />
        </FormControl>
      ) : (
        <MUITextField
          required={props?.required}
          onChange={handleChange}
          value={props.value ?? currentValue}
          label={props?.label}
          name={props?.name}
          fullWidth
          error={props?.error}
          type={props.type}
          disabled={props?.disabled}
          placeholder={props?.label}
          sx={{
            '& .MuiOutlinedInput-root.Mui-disabled': {
              backgroundColor: `${theme.palette.grey[100]}`,
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderRadius: '8px',
            },
            '& .MuiOutlinedInput-input.Mui-disabled': {
              WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)',
            },
            ...props?.sx,
          }}
        />
      )}
      {props.error && (
        <HelperText error={props.error} helperText={props.helperText} />
      )}
    </>
  );
})(({ theme }) => ({
  '& .Mui-error .MuiInputBase-input': {
    backgroundColor: alpha(theme.palette.error.light, 0.2),
    borderRadius: theme.shape.borderRadius,
  },
}));

export default TextField;
