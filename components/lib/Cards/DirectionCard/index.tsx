import { Card, CardHeader, styled, Typography, useTheme } from '@mui/material';

interface DirectionCardProps {
  cardIcon?: React.ReactElement;
  cardHeader?: string;
  cardSubheader?: string;
  paragraphText?: string;
  alternate?: boolean;
  endCard?: boolean;
}
export default function DirectionCard({
  cardIcon,
  cardHeader,
  cardSubheader,
  paragraphText,
  alternate,
  endCard,
}: DirectionCardProps) {
  const theme = useTheme();
  let cardBackgroundColour;
  let cardTextColour;

  switch (alternate) {
    case true:
      cardBackgroundColour = theme.palette.primary.main;
      cardTextColour = theme.palette.common.white;
      break;
    default:
      cardBackgroundColour = theme.palette.common.white;
      cardTextColour = theme.palette.text.secondary;
  }
  const CardWithTriangle = styled(Card)(() => ({
    position: 'relative',
    overflow: 'visible',
    padding: '3.25rem 2.5rem 2.5rem 2.5rem',
    display: 'flex',
    boxShadow: 'none',
    alignItems: 'center',
    flexDirection: 'column',
    color: cardTextColour,
    backgroundColor: cardBackgroundColour,
    minHeight: '19.8125rem',
    borderRadius: 0,
    '&::after': {
      content: '""',
      position: 'absolute',
      top: '50%',
      right: '-0.4375rem',
      transform: 'translateY(-50%)',
      width: 0,
      height: 0,
      borderTop: !endCard && '0.5rem solid transparent',
      borderBottom: !endCard && '0.5rem solid transparent',
      borderLeft: !endCard && `0.5rem  solid ${cardBackgroundColour}`,
      zIndex: 4,
      [theme.breakpoints.down('lg')]: {
        display: 'none',
      },
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      bottom: '-0.4375rem',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 0,
      height: 0,
      borderLeft: !endCard && '0.5rem solid transparent',
      borderRight: !endCard && '0.5rem solid transparent',
      borderTop: !endCard && `0.5rem solid ${cardBackgroundColour}`,
      zIndex: 4,
      [theme.breakpoints.up('lg')]: {
        display: 'none',
      },
    },
  }));

  return (
    <CardWithTriangle sx={{ height: '100%' }}>
      {cardIcon}
      <CardHeader
        sx={{
          padding: 0,
          mt: 2,
          '& .MuiCardHeader-content': {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          },
          '& .MuiCardHeader-title': {
            font: theme.typography.lMedium,
          },

          '& .MuiCardHeader-subheader': {
            font: theme.typography.sRegular,
            color: cardTextColour,
          },
        }}
        title={cardHeader}
        subheader={cardSubheader}
      />
      <Typography sx={{ mt: 2 }}>{paragraphText}</Typography>
    </CardWithTriangle>
  );
}
