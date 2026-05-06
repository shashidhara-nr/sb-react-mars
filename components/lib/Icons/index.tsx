import React from 'react';
import { Box, Typography } from '@mui/material';

export interface IconWithTextProps {
  icon?: React.ReactNode;
  text?: string;
  iconSize?: number | string;
  textProps?: React.ComponentProps<typeof Typography>;
  boxProps?: React.ComponentProps<typeof Box>;
}

const Icons: React.FC<IconWithTextProps> = ({
  icon,
  text,
  iconSize = 32,
  textProps,
  boxProps,
}) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      {...boxProps}
    >
      {icon && (
        <span
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: iconSize,
          }}
        >
          {icon}
        </span>
      )}
      {text && (
        <Typography variant="caption" mt={0.5} {...textProps}>
          {text}
        </Typography>
      )}
    </Box>
  );
};

export default Icons;
