// @ts-nocheck
import { Box, Typography, useTheme } from '@mui/material';

interface LabelProps {
  text: string;

  paletteColor?:
    | 'primary'
    | 'error'
    | 'warning'
    | 'info'
    | 'success'
    | undefined;
}

export default function Label({
  text,

  paletteColor,
}: LabelProps) {
  const theme = useTheme();

  return (
    <Box
      display="inline-flex"
      alignItems="center"
      borderRadius="1rem"
      padding="0.25rem 0.5rem"
      sx={{
        backgroundColor: paletteColor
          ? theme.palette[paletteColor]?.lighter
          : 'transparent',
        color: paletteColor ? theme.palette.common.black : 'inherit',
        border: paletteColor
          ? `1px solid ${theme.palette[paletteColor]?.light}`
          : '',
      }}
    >
      <Box
        sx={{
          width: '0.375rem',
          height: '0.375rem',
          borderRadius: '50%',
          backgroundColor: paletteColor
            ? theme.palette[paletteColor]?.main
            : 'transparent',
          marginRight: '0.25rem',
        }}
      />

      <Typography sx={{ fontSize: theme.typography.xsRegular }}>
        {text}
      </Typography>
    </Box>
  );
}
