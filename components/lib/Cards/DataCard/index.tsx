import { Card, Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import Button from '../../Forms/Button';
import { borderRadius } from '../../styles/spacing';

interface DataCardLabel {
  label: string;
  labelDescription: string;
}

interface DataCard {
  cardTitle?: string;
  labels?: DataCardLabel[];
}

interface DataCardProps {
  buttonIcon: React.ReactElement;
  buttonClick: () => void;
  dataCards?: DataCard[];
}

export default function DataCard({
  dataCards,
  buttonClick,
  buttonIcon,
}: DataCardProps) {
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const dataCard = dataCards?.map((card: DataCard, index) => (
    <Box
      key={index}
      sx={{
        width: isTablet ? '100%' : '33%',
        display: 'flex',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <Typography component={'h3'} sx={{ font: theme.typography.mMedium }}>
          {card.cardTitle}
        </Typography>
        {card?.labels?.map((label: DataCardLabel, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              marginTop: '1.5rem',
            }}
          >
            <Typography sx={{ font: theme.typography.xsRegular }}>
              {label.label}
            </Typography>
            <Typography sx={{ font: theme.typography.sMedium }}>
              {label.labelDescription}
            </Typography>
          </Box>
        ))}
      </Box>
      {isTablet && index === 0 && (
        <Box>
          <Button
            buttonVariant={'secondary'}
            small
            iconOnly
            onClick={buttonClick}
          >
            {buttonIcon}
          </Button>
        </Box>
      )}
    </Box>
  ));

  return (
    <Card
      sx={{
        width: '100%',
        backgroundColor: theme.palette.common.white,
        display: 'flex',
        flexDirection: isTablet ? 'column' : 'row',
        padding: '1.5rem',
        gap: isTablet ? '1.5rem' : 0,
        borderRadius: borderRadius.borderRadiusSmall,
        border: `1px solid ${theme.palette.grey[300]}`,
      }}
    >
      {dataCard}
      {!isTablet && buttonIcon && buttonClick && (
        <Box>
          <Button
            buttonVariant="secondary"
            small
            iconOnly
            onClick={buttonClick}
          >
            {buttonIcon}
          </Button>
        </Box>
      )}
    </Card>
  );
}
