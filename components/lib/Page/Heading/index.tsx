// @ts-nocheck
import React from 'react';
import style from './Heading.module.css';
import { Box, Typography, useTheme } from '@mui/material';

export interface HeadingProps extends React.HTMLAttributes<HTMLElement> {
  as: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'legend' | 'label';
  children: React.ReactNode;
  subtitle?: string;
  subtitleColor?: string;
  padding?: string;
  margin?: string;
  lineHeight?: string;
  fontSize?: string | number;
  dark?: boolean;
  hasBorder?: boolean;
}

export const Heading: React.FC<HeadingProps> = ({
  as,
  children,
  subtitle,
  subtitleColor,
  color,
  margin,
  padding,
  lineHeight,
  fontSize,
  dark = false,
  hasBorder = false,
  ...rest
}: HeadingProps) => {
  const HeadingElement = as;
  const theme = useTheme();

  const typographyStyles = {
    h1: theme.typography.xxxxlRegular,
    h2: theme.typography.xxxxlRegular,
    h3: theme.typography.sMedium,
    h4: theme.typography.lMedium,
    h5: theme.typography.mMedium,
    h6: theme.typography.sMedium,
    label: theme.typography.xsMedium,
    legend: theme.typography.xsMedium,
  };
  return (
    <Box
      className={style.heading}
      sx={{
        color: color ?? '#000000',
        borderTop: hasBorder ? `1px solid ${theme.palette.grey[300]}` : 'none',
        padding: padding,
        margin: margin,
        div: {
          '& h1': {
            p: {
              ...theme.typography.xxxxlRegular,
            },
          },
        },
      }}
    >
      {subtitle && (
        <div className={style.subtitle} color={subtitleColor ?? '#000000'}>
          {subtitle}
        </div>
      )}
      <HeadingElement
        style={{
          lineHeight: lineHeight,
          color: dark ? theme.palette.primary.dark : '',
          fontWeight: dark ? '500' : '',
          margin: 0,
        }}
        {...rest}
      >
        <Typography
          sx={{
            ...typographyStyles[as],
            ...(fontSize ? { fontSize } : {}),
          }}
        >
          {children}
        </Typography>
      </HeadingElement>
    </Box>
  );
};

export default Heading;
