import { Box, ThemeProvider, useTheme } from '@mui/material';
import React from 'react';

type AlertAvatarProps = {
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'error';
  size?: 'large' | 'medium' | 'small' | 'extraSmall';
  notification?: boolean;
  notificationIcon?: React.ReactNode;
};

export default function AlertAvatar({
  icon,
  size = 'medium',
  variant = 'primary',
  notification = false,
  notificationIcon,
}: AlertAvatarProps) {
  const theme = useTheme();
  const outerColor = theme.palette?.[variant].light;
  const innerColor = theme.palette?.[variant].main;

  const sizeMap = {
    large: 80,
    medium: 48,
    small: 40,
    extraSmall: 28,
  };

  const sizeValue = sizeMap[size] || sizeMap.medium;

  const svgSizeMap = (() => {
    switch (size) {
      case 'large':
        return 48;
      case 'small':
        return 24;
      case 'extraSmall':
        return 20;
      default:
        return 32;
    }
  })();

  console.log('svg size map', svgSizeMap);

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          position: 'relative',
          width: `${sizeValue + 2 * 2 + 2 * 6}px`, // size + 2 x the border sizes
          height: `${sizeValue + 2 * 2 + 2 * 6}px`, // size + 2 x the border sizes
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: `7px solid ${outerColor}`,
            boxSizing: 'border-box',
            zIndex: 1,
            backgroundColor: theme.palette.common.white,
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            top: 6,
            left: 6,
            width: `${sizeValue + 2 * 2}px`,
            height: `${sizeValue + 2 * 2}px`,
            borderRadius: '50%',
            border: `2px solid ${innerColor}`,
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
            padding:
              size === 'medium' || size === 'small'
                ? '0.5rem'
                : size === 'extraSmall'
                  ? '0.25rem'
                  : '1rem',
          }}
        >
          {notification && (
            <Box
              sx={{
                position: 'absolute',
                top: 10,
                right: 10,
                transform: 'translate(50%, -50%)',
                width: 45,
                height: 45,
                borderRadius: '50%',
                border: `4px solid ${theme.palette.common.white}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 4,
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor: theme.palette.error.main,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    '& svg': {
                      width: '100%',
                      height: '100%',
                      color: '#fff',
                    },
                  }}
                >
                  {notificationIcon}
                </Box>
              </Box>
            </Box>
          )}

          <Box
            sx={{
              width: { sizeValue },
              height: { sizeValue },
              borderRadius: '50%',
              backgroundColor: `${theme.palette.common.white}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',

              color: `${innerColor}`,

              '& svg': {
                width: svgSizeMap,
                height: svgSizeMap,
              },
            }}
          >
            {icon}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
