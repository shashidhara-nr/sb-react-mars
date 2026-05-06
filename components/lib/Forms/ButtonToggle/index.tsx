import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import { useTheme } from '@mui/material';
import React, { useState } from 'react';

type ToggleButtonGroupProps = {
  onChange?: (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: string | null,
  ) => void;

  fullWidth?: boolean;
  buttons?: { children: React.ReactNode; toggleValue?: string }[];
  initialSelected?: number;
};

export default function ToggleButtons({
  fullWidth,
  buttons,
  initialSelected,
  onChange,
}: ToggleButtonGroupProps) {
  const selectedButtonValue = (() => {
    if (initialSelected !== undefined && initialSelected !== null) {
      return (
        buttons?.[initialSelected]?.toggleValue ??
        `${buttons?.[initialSelected]?.children ?? ''}${initialSelected}`
      );
    }
    return (
      buttons?.[0]?.toggleValue ??
      (buttons?.[0] ? `${buttons[0].children ?? ''}0` : null)
    );
  })();

  const [alignment, setAlignment] = useState<string | null>(
    selectedButtonValue,
  );

  const theme = useTheme();

  const handlePressedAndChange = (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: string | null,
  ) => {
    if (newAlignment !== null) {
      setAlignment(newAlignment);
      if (onChange) {
        onChange(event, newAlignment);
      }
    }
  };
  return (
    <ToggleButtonGroup
      value={alignment}
      exclusive
      onChange={handlePressedAndChange}
      fullWidth={fullWidth}
      sx={{
        textTransform: 'none',
        borderRadius: 2,
        boxSizing: 'border-box',
        backgroundColor: theme.palette?.common?.white,
        border: 'none',

        '&.Mui-disabled': {
          backgroundColor: theme.palette?.action?.disabledBackground,
          color: theme.palette?.action?.disabled,
        },
        '& .MuiToggleButton-root.Mui-selected': {
          backgroundColor: `${theme.palette.secondary.main}`,
          color: `${theme.palette.common.white}`,
          '&:hover': {
            backgroundColor: `${theme.palette.secondary.main}`,
            color: `${theme.palette.common.white}`,
          },
        },
        '& .MuiToggleButton-root': {
          color: `${theme.palette.common.black}`,
          textTransform: 'none',
          border: `1px solid ${theme.palette?.grey[300]}`,

          '&:hover': {
            backgroundColor: 'transparent',
          },
          '&:first-of-type': {
            borderTopLeftRadius: 8,
            borderBottomLeftRadius: 8,
          },
          '&:last-of-type': {
            borderTopRightRadius: 8,
            borderBottomRightRadius: 8,
          },
        },
      }}
    >
      {buttons?.map((button, index) => (
        <ToggleButton
          key={index}
          value={button?.toggleValue ?? `${button?.children ?? ''}${index}`}
        >
          {button?.children ?? ''}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
