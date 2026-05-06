import { Box, Typography, useTheme } from '@mui/material';
interface HelperTextProps {
  error?: boolean;
  helperText?: string;
}

const HelperText = ({ error = false, helperText = '' }: HelperTextProps) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        paddingTop: '4px',
        paddingLeft: '16px',
      }}
    >
      {error && (
        <Typography
          component="span"
          sx={{
            color: theme.palette.error.main,
            fontSize: '12px',
            fontWeight: 400,
          }}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  );
};
export default HelperText;
