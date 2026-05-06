import {
  FormControl,
  FormControlProps,
  InputLabel,
  MenuItem,
  Select as MUISelect,
  SelectProps as MUISelectProps,
  styled,
  useTheme,
  Checkbox,
  ListItemText,
} from '@mui/material';
import { useEffect, useState } from 'react';
import HelperText from '../HelperText';

export type SelectType = {
  value: string;
  label: string;
};

interface SelectProps {
  formOptions?: FormControlProps;
  selectProps?: MUISelectProps;
  options: SelectType[];
  rounded?: boolean;
  helperText?: string;
  value: string | string[];
  name: string;
  error: boolean;
  height?: string | number;
  width?: string | number;
}

const StyledMUISelect = styled((props: MUISelectProps) => (
  <MUISelect {...props}>{props.children}</MUISelect>
))(() => ({}));

export default function Select({
  formOptions = {},
  selectProps = {},
  options,
  rounded,
  helperText,
  value: controlledValue,
  name,
  error,
  height = 40, // default height
  width,
}: SelectProps & { value?: string | string[] }) {
  const theme = useTheme();
  const [currentValue, setCurrentValue] = useState<string | string[]>(
    controlledValue ?? '',
  );

  useEffect(() => {
    if (controlledValue !== undefined && controlledValue !== currentValue) {
      setCurrentValue(controlledValue);
    }
  }, [controlledValue, currentValue]);

  return (
    <FormControl
      {...formOptions}
      size="small"
      fullWidth
      sx={{
        width,
        '.MuiSelect-select': {
          color: error ? theme.palette.error.dark : '',
          background: theme.palette.common.white,
        },
        '.MuiSelect-select.Mui-disabled': {
          WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)',
        },

        '&.MuiSelect-outlined': {
          border: '1px solid red important',
        },

        '& .MuiInputLabel-root': {
          color: error ? theme.palette.error.main : '',
        },

        '& .MuiInputLabel-root.Mui-focused': {
          color: error ? theme.palette.error.main : '',
        },

        '& .MuiInputLabel-root.MuiInputLabel-shrink': {
          color: error ? theme.palette.error.main : '',
        },
      }}
    >
      {selectProps?.labelId && selectProps?.label && (
        <InputLabel id={selectProps.labelId}>{selectProps.label}</InputLabel>
      )}
      <StyledMUISelect
        {...selectProps}
        sx={{
          borderRadius: rounded ? 5 : '8px',
          height,
          width,
          color: error ? theme.palette.error.dark : '',
          '&.Mui-disabled': {
            backgroundColor: `${theme.palette.grey[100]}`,
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderRadius: '8px',
          },
          '& .MuiSelect-select.Mui-disabled': {
            backgroundColor: `${theme.palette.grey[100]}`,
            WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)',
          },
          '& .MuiSelect-icon': {
            color: '#0051FF',
          },
          ...selectProps?.sx,
        }}
        value={controlledValue ?? currentValue}
        name={name}
        error={error}
        onChange={(e) => {
          if (controlledValue === undefined) {
            setCurrentValue(e.target.value as string | string[]);
          }
          selectProps.onChange?.(e, null);
        }}
        label={selectProps.label}
      >
        {options.map(({ label: l, value }) => {
          const isMultiple = selectProps.multiple;
          const currentVal = controlledValue ?? currentValue;
          const isSelected = isMultiple 
            ? Array.isArray(currentVal) && currentVal.includes(value)
            : currentVal === value;
          
          return (
            <MenuItem
              key={`select-option-${value}`}
              value={value}
              sx={{
                backgroundColor: 'white',
              }}
            >
              {isMultiple && (
                <Checkbox 
                  checked={isSelected}
                  sx={{
                    color: '#0051FF',
                    '&.Mui-checked': {
                      color: '#0051FF',
                    },
                  }}
                />
              )}
              <ListItemText primary={l} />
            </MenuItem>
          );
        })}
      </StyledMUISelect>
      {error && <HelperText error={error} helperText={helperText} />}
    </FormControl>
  );
}
