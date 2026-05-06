// @ts-nocheck
import { CircularProgress, Stack, useTheme } from '@mui/material';
import React from 'react';

interface LoaderProps {
  children?: React.ReactNode;
  loaded?: boolean;
  size?: number;
  backgroundColor?: string;
  hideText?: boolean;
  color?:
  | 'primary'
  | 'secondary'
  | 'error'
  | 'info'
  | 'success'
  | 'warning'
  | 'inherit';
  inheritColor?: string;
}

export type { LoaderProps };

const Loader = ({
  children,
  loaded = false,
  size = 40,
  color = 'primary',
  inheritColor,
  backgroundColor,
  hideText = false,
}: LoaderProps & {
  children?: React.ReactNode;
}) => {
  const theme = useTheme();
  const finalInheritColor = inheritColor ?? theme.palette.common.black;
  const finalBackgroundColor = backgroundColor ?? theme.palette.common.white;
  return (
    <div
      style={{ backgroundColor: finalBackgroundColor, textAlign: 'center' }}
      className="flex flex-col items-center justify-center w-full h-full"
    >
      {!loaded && (
        <Stack sx={{ color: 'grey.500' }} spacing={2} direction="column">
          <CircularProgress
            color={color}
            sx={() => ({
              color: color === 'inherit' ? finalInheritColor : '',
              alignSelf: 'center',
            })}
            size={size}
          />
          {!hideText && (
            <p
              style={{
                fontSize: theme.typography.xsMedium.fontSize,
                color: finalInheritColor,
              }}
            >
              Loading...
            </p>
          )}
        </Stack>
      )}
      {loaded && <div className="text-gray-500">{children}</div>}
    </div>
  );
};
export default Loader;
