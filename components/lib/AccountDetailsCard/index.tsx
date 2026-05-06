// @ts-nocheck
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import React, { cloneElement, isValidElement, SVGProps } from 'react';
import { svgSize, borderRadius } from '../styles/spacing';
import { accountNumberFormat } from '../utils';

interface InfoCells {
  title: string;
  value?: number | string;
}

export interface AccountInfoProps {
  variant: 'account' | 'balance';
  cardIcon?: React.ReactElement<{ style?: React.CSSProperties }>;
  cardTitle?: string;
  cardSubheader?: number | string;
  iconElement?: React.ReactElement;
  cardCells?: InfoCells[];
}

export interface CardProps {
  cards: AccountInfoProps[];
  moreDetails: {
    title: string;
    description: string;
  };
  moreCardDetails?: InfoCells[];
}

export default function AccountInfo({ cards, moreDetails, moreCardDetails = [], hideCardCell }: CardProps & { hideCardCell?: boolean }) {
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        display: 'flex',
        borderRadius: borderRadius.borderRadiusSmall,
        flexDirection: 'column',
        border: `1px solid ${theme.palette.grey[300]}`,
        overflow: 'hidden',
        width: '100%',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          overflow: 'hidden',
          width: '100%',
        }}
      >
        {cards &&
          cards.map((card, index) => {
            const { cardIcon, iconElement, cardTitle, cardSubheader, variant, cardCells } =
              card;
            const key = `card-${cardTitle}-${index}`;
            return (
              <Box
                key={key}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  borderLeft:
                    !isMobile && index === 1
                      ? `1px solid ${theme.palette.grey[300]}`
                      : '',
                  borderTop:
                    isMobile && index === 1
                      ? `1px solid ${theme.palette.grey[300]}`
                      : '',
                  width: isTablet ? '100%' : '50%',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    p: 2,
                    alignItems: 'center',
                    overflow: 'hidden',
                    backgroundColor: theme.palette.common.white,
                  }}
                >
                  {cardIcon &&
                    isValidElement<SVGProps<SVGSVGElement>>(cardIcon) &&
                    cloneElement(cardIcon, {
                      width: svgSize.large,
                      height: svgSize.large,
                    })}
                  {iconElement}
                  <Box sx={{ ml: 1.5 }}>
                    {cardTitle && (
                      <Typography sx={{ font: theme.typography.xsRegular }}>
                        {cardTitle}
                      </Typography>
                    )}
                    {cardSubheader && (
                      <Typography sx={{ font: theme.typography.mMedium }}>
                        {variant === 'account' &&
                        typeof cardSubheader === 'number'
                          ? accountNumberFormat(cardSubheader)
                          : cardSubheader}
                      </Typography>
                    )}
                  </Box>
                </Box>

                {cardCells && !hideCardCell && (
                  <Box
                    className="cardcell"
                    sx={{
                      p: 2,
                      display: isTablet ? 'grid' : 'flex',
                      gridTemplateColumns: isTablet ? 'repeat(2, 1fr)' : 'none', //
                      backgroundColor: theme.palette.grey[200],
                      overflow: 'hidden',
                      flexGrow: 1,
                      gap: 2,
                      borderTop: `1px solid ${theme.palette.grey[300]}`,
                    }}
                  >
                    {cardCells.map((cell) => (
                      <Box
                        key={cell.title}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          minWidth: 0,
                          width: '100%',
                        }}
                      >
                        <Typography sx={{ font: theme.typography.sRegular }}>
                          {cell.title}
                        </Typography>
                        <Typography
                          sx={{ font: theme.typography.sMedium, mt: 1 }}
                        >
                          {cell.value
                            ? typeof cell.value === 'number'
                              ? cell.value.toLocaleString()
                              : cell.value
                            : '-'}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            );
          })}
      </Box>
      {(moreDetails?.title || moreDetails?.description) && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            width: '100%',
            backgroundColor: theme.palette.common.white,
            padding: '16px',
            borderTop: `1px solid ${theme.palette.grey[300]}`,
          }}
        >
          {moreDetails.title && 
            <Typography sx={{ font: theme.typography.sRegular }}>
              {moreDetails.title}
            </Typography>
          }
          <Typography
            sx={{ font: theme.typography.sMedium, mt: 1 }}
          >
            {moreDetails.description}
          </Typography>
        </Box>
      )}

      {moreCardDetails?.length > 0 && (
        <Box
          className="cardcell"
          sx={{
            p: 2,
            display: isTablet ? 'grid' : 'flex',
            gridTemplateColumns: isTablet ? 'repeat(2, 1fr)' : 'none', //
            backgroundColor: theme.palette.grey[200],
            overflow: 'hidden',
            flexGrow: 1,
            gap: 2,
            borderTop: `1px solid ${theme.palette.grey[300]}`,
          }}
        >
          {moreCardDetails.map((detail: InfoCells, index: number) => {
            const { title, value } = detail;
            const key = `more-card-${title}-${index}`;
            return (
                <Box
                  key={key}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0,
                    width: '100%',
                  }}
                >
                  <Typography sx={{ font: theme.typography.sRegular }}>
                    {title}
                  </Typography>
                  <Typography
                    sx={{ font: theme.typography.sMedium, mt: 1 }}
                  >
                    {value
                      ? typeof value === 'number'
                        ? value.toLocaleString()
                        : value
                      : '-'}
                  </Typography>
                </Box>
              
            );
          })}
        </Box>
      )}
    </Box>
  );
}
