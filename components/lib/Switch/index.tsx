import {
  FormControlLabel,
  FormGroup,
  useTheme,
  getSwitchUtilityClass,
  Switch as MUISwitch,
} from '@mui/material';
import React from 'react';

interface SwitchProps {
  name: string;
  label: string;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  defaultValue?: boolean;
}

export default function Switch({
  name,
  label,
  checked,
  disabled,
  onChange,
  defaultValue,
}: SwitchProps) {
  const theme = useTheme();
  return (
    <FormGroup sx={{ alignSelf: 'flex-start', userSelect: 'none' }}>
      <FormControlLabel
        control={
          <MUISwitch
            disabled={disabled}
            defaultChecked={defaultValue}
            name={name}
            checked={checked}
            onChange={onChange}
            sx={{
              //unchecked thumb styles
              [`& .${getSwitchUtilityClass('switchBase')}`]: {
                color: theme.palette.common.white,
              },

              // Default unchecked track
              [`& .${getSwitchUtilityClass('switchBase')} + .${getSwitchUtilityClass('track')}`]:
                {
                  backgroundColor: theme.palette.grey[300],
                },
              // Checked thumb
              [`& .${getSwitchUtilityClass('switchBase')}.${getSwitchUtilityClass('checked')}`]:
                {
                  color: theme.palette.secondary.main,
                },

              // Checked track
              [`& .${getSwitchUtilityClass('switchBase')}.${getSwitchUtilityClass('checked')} + .${getSwitchUtilityClass('track')}`]:
                {
                  backgroundColor: theme.palette.secondary.main,
                },

              //Disabled checked thumb
              [`& .${getSwitchUtilityClass('switchBase')}.${getSwitchUtilityClass('checked')}.${getSwitchUtilityClass('disabled')}`]:
                {
                  color: theme.palette.secondary.disabledDark,
                },

              // Disabled + checked track
              [`& .${getSwitchUtilityClass('switchBase')}.${getSwitchUtilityClass('disabled')}.${getSwitchUtilityClass('checked')} + .${getSwitchUtilityClass('track')}`]:
                {
                  backgroundColor: theme.palette.secondary.disabledLight,
                },

              // Disabled + unchecked thumb
              [`& .${getSwitchUtilityClass('switchBase')}.${getSwitchUtilityClass('disabled')}`]:
                {
                  color: theme.palette.common.white,
                  opacity: 1,
                },
              [`& .${getSwitchUtilityClass('switchBase')}.${getSwitchUtilityClass('disabled')} + .${getSwitchUtilityClass('track')}`]:
                {
                  backgroundColor: theme.palette.grey[200],
                  opacity: 1,
                },
            }}
          />
        }
        label={label}
      />
    </FormGroup>
  );
}
