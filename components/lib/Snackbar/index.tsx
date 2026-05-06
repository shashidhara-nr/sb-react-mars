import { Box, SnackbarContent, useTheme } from '@mui/material';
import Button from '../Forms/Button';
import {
  AlertCircle,
  WarningOutline,
  CheckOutline,
} from '../../../assets/icons';
import React from 'react';
import { SnackbarTheme } from '../config';

interface primaryCTA {
  ctaClick: () => void;
  icon?: React.ReactElement;
  ctaMessage: React.ReactNode;
  iconOnly?: boolean;
}

interface SnackbarProps {
  snackbarTheme: SnackbarTheme;
  snackBarMessage: string;
  buttons: primaryCTA[];
  variant?: 'default' | 'bordered';
}

export default function Snackbar({
  snackbarTheme,
  snackBarMessage,
  buttons,
  variant = 'default',
}: SnackbarProps) {
  const theme = useTheme();

  let icon;
  switch (snackbarTheme) {
    case SnackbarTheme.Success:
      icon = <CheckOutline />;
      break;
    case SnackbarTheme.Warning:
      icon = <WarningOutline />;
      break;
    default:
      icon = <AlertCircle />;
      break;
  }

  const action = (
    <Box
      sx={{
        padding: 0,
      }}
    >
      {buttons &&
        buttons.map((button, index) => (
          <Button
            key={index}
            onClick={button.ctaClick}
            iconOnly={button.iconOnly}
            small
          >
            {button.ctaMessage}
          </Button>
        ))}
    </Box>
  );

  // Bordered variant styles
  const isBordered = variant === 'bordered';
  const borderColor =
    snackbarTheme === SnackbarTheme.Warning
      ? theme.palette.error.main
      : snackbarTheme === SnackbarTheme.Success
        ? theme.palette.success.main
        : theme.palette.grey[500];

  return (
    <SnackbarContent
      message={
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            padding: 0,
          }}
        >
          {icon} {snackBarMessage}
        </Box>
      }
      action={buttons && buttons.length > 0 ? action : null}
      sx={{
        width: '22.5rem',
        px: 1.5,
        py: 0.5,
        borderRadius: 2,
        flexDirection: buttons && buttons.length >= 2 ? 'column' : 'row',
        alignItems: 'flex-start',
        font: theme.typography.mRegular,
        backgroundColor: isBordered
          ? '#fff'
          : snackbarTheme === SnackbarTheme.Warning
            ? theme.palette.error.main
            : snackbarTheme === SnackbarTheme.Success
              ? theme.palette.success.main
              : theme.palette.grey[500],
        border: isBordered ? `2px solid ${borderColor}` : undefined,
        color: isBordered ? borderColor : undefined,
        '& .MuiSnackbarContent-message': {
          padding: 0,
          py: 1,
        },
      }}
    />
  );
}
