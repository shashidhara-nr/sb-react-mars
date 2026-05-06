// @ts-nocheck
import { Box, Typography, useTheme } from '@mui/material';
import AlertAvatar from '../../AlertAvatar';
import { margin } from '../../styles/spacing';
import React from 'react';

export interface DialogCardProps {
  variant?: 'alert' | 'text';
  cardTitle?: string;
  icon?: React.ReactNode;
  alertIconTheme?: 'primary' | 'secondary' | 'success' | 'error';
  alertIconSize: 'large' | 'medium' | 'small' | 'extraSmall';
  cardBodyText?: string[];
}

export default function DialogCard({
  variant = 'alert',
  cardTitle = '',
  icon,
  cardBodyText,
  alertIconSize,
  alertIconTheme,
}: DialogCardProps) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: variant == 'alert' ? 'center' : 'flex-start',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {icon && variant === 'alert' && (
        <AlertAvatar
          icon={icon}
          variant={alertIconTheme}
          size={alertIconSize}
        />
      )}
      {cardTitle && (
        <Typography
          sx={{
            mt: icon && variant === 'alert' ? margin.medium : 0,
            font: theme.typography.mMedium,
          }}
        >
          {cardTitle}
        </Typography>
      )}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: variant == 'alert' ? 'center' : 'flex-start',
        }}
      >
        {cardBodyText &&
          cardBodyText?.map((text, index) => (
            <Typography
              key={index}
              sx={{ mt: margin.xSmall, font: theme.typography.sRegular }}
            >
              {text}
            </Typography>
          ))}
      </Box>
    </Box>
  );
}
