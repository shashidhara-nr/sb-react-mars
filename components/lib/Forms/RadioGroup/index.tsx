import {
  Radio,
  RadioGroup as MUIRadioGroup,
  RadioGroupProps as MUIRadioGroupProps,
  FormControlLabel,
  FormControl,
  FormLabel,
  FormHelperText,
} from '@mui/material';
import React from 'react';

export type RadioType = {
  value: string;
  label: string;
};

interface RadioGroupProps {
  /** The available options. Each options is a `{ value:string, label: string }` object. */
  options: RadioType[];
  /** Label for the group */
  label: string;
  /** Group ID */
  id: string;
  /** Optional pass through MUI RadioGroupProps. */
  radioProps?: MUIRadioGroupProps;
  /** The name, generally this can match the ID. Used for referencing when in forms. */
  name: string;
  /** Direction of laying the radio buttons, can be `horizontal` or `vertical`. Defaults to `horizontal`. */
  direction?: 'horizontal' | 'vertical';
  /** Optional helper text. */
  helperText?: string;
  /** Set the value for controlled components. */
  value?: string;
  /** Disables the component. */
  disabled?: boolean;
  /** Optional default value. This should be the `value` of one of the `option` objects. */
  defaultValue?: string;
  /** Change handler. */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function RadioGroup({
  options,
  label,
  id,
  radioProps,
  name,
  direction = 'horizontal',
  helperText,
  value,
  disabled,
  defaultValue,
  onChange,
}: RadioGroupProps) {
  return (
    <FormControl>
      <FormLabel id={id}>{label}</FormLabel>
      <MUIRadioGroup
        {...radioProps}
        defaultValue={defaultValue}
        aria-labelledby={id}
        name={name}
        sx={{ flexDirection: direction === 'horizontal' ? 'row' : 'column' }}
        onChange={onChange}
        value={value}
      >
        {options.map(({ label, value }) => (
          <FormControlLabel
            disabled={disabled}
            key={`radio-option-${value}`}
            value={value}
            control={<Radio />}
            label={label}
          />
        ))}
      </MUIRadioGroup>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}
