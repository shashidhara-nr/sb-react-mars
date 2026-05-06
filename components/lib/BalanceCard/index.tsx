import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { padding, borderWidth } from '../styles/spacing';

interface BalanceCardProps {
  balanceTitle: string;
  currencySymbol?: string;
  balance?: number | string;
}

export default function BalanceCard({
  balanceTitle,
  currencySymbol = 'R',
  balance,
}: BalanceCardProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',

        borderLeft: `${borderWidth.regular} solid ${theme.palette.primary.main}`,
        paddingLeft: padding.small,

        flexBasis: isMobile ? 'calc(100% - 8px)' : 'fit-content',
        boxSizing: 'border-box',
      }}
    >
      <Typography
        sx={{
          color: theme.palette.action.disabled,
          font: theme.typography.xsRegular,
        }}
      >
        {balanceTitle}
      </Typography>
      <Typography
        sx={{
          font: theme.typography.mRegular,
        }}
      >
        {currencySymbol} {balance}
      </Typography>
    </Box>
  );
}
