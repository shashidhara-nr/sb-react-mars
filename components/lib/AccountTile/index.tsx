import { Typography, useMediaQuery, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import React, { cloneElement } from 'react';
import Button from '../Forms/Button';
import { svgSize, padding, borderRadius, gap } from '../styles/spacing';
import BalanceCard from '../BalanceCard';
import { CurrentAccount, Overflow } from 'public/icons';

export interface AccountTileProps {
  icon: React.ReactElement<{ style?: React.CSSProperties }>;
  accountName: string;
  accountNumber: number;
  balanceCards?: React.ReactElement<typeof BalanceCard>[];
  buttons: React.ReactElement<typeof Button>[];
  overflowButtonIcon?: React.ReactElement;
  overflowButtonOnClick?: () => void;
}

export default function AccountTile({
  icon = <CurrentAccount />,
  accountName,
  accountNumber,
  buttons,
  overflowButtonIcon = (
    <Overflow style={{ height: svgSize.small, width: svgSize.small }} />
  ),
  balanceCards,
  overflowButtonOnClick,
}: AccountTileProps) {
  const theme = useTheme();
  const sizedIcon = cloneElement(icon, {
    style: { height: svgSize.large, width: svgSize.large },
  });

  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: !isMobile ? gap.gapMedium : gap.gapLarge,
        justifyContent: 'space-between',
        width: '100%',
        padding: padding.medium,
        borderRadius: borderRadius.borderRadiusSmall,
        boxSizing: 'border-box',
        border: `0.0625rem solid ${theme.palette.grey[300]}`,
        backgroundColor: theme.palette.common.white,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: isMobile ? 'space-between' : 'flex-start',
        }}
      >
        <Box sx={{ display: 'flex', gap: gap.gapSmall }}>
          <Box sx={{ display: 'flex' }}>{sizedIcon}</Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography sx={{ font: theme.typography.mMedium }}>
              {accountName}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                font: theme.typography.xsRegular,
              }}
            >
              {accountNumber}
            </Typography>
          </Box>
        </Box>
        {isMobile && (
          <Button
            buttonVariant="secondary"
            iconOnly
            small
            onClick={overflowButtonOnClick}
          >
            {overflowButtonIcon}
          </Button>
        )}
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          boxSizing: 'border-box',
          flexWrap: isMobile ? 'wrap' : 'nowrap',
          gap: gap.gapMedium,
        }}
      >
        {balanceCards}
      </Box>
      {!isMobile && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '1rem',
          }}
        >
          <Box>{!isTablet && buttons}</Box>
          <Box sx={{}}>
            <Button
              buttonVariant="secondary"
              iconOnly
              small
              onClick={overflowButtonOnClick}
            >
              {overflowButtonIcon}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}
