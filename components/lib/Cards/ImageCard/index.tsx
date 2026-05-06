import {
  Box,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Button from '../../Forms/Button';
import { borderRadius } from '../../styles/spacing';
import { Check } from 'public/icons';
import { useState } from 'react';
import { CardSize } from '../../config';
interface cta {
  ctaText: string;
  ctaAction: () => void;
  fullWidth?: boolean;
}

interface ImageCardProps {
  clickable: boolean;
  labelText?: string;
  imageUrl?: string;
  imageAltText?: string;
  cardHeading: string;
  paragraphText?: string;
  subText?: string;
  ctas?: [cta, cta?, cta?];
  ctaRightAlign?: boolean;
  ctaLeftAlign?: boolean;
  singleCard?: boolean;
}

export default function ImageCard({
  clickable,
  cardHeading,
  paragraphText,
  imageUrl,
  imageAltText,
  labelText,
  subText,
  ctas,
  ctaRightAlign,
  ctaLeftAlign,
  singleCard,
}: ImageCardProps) {
  const [isSelected, setIsSelected] = useState(false);
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  let ctaLayout;
  let ctaSpacing;

  switch (ctas?.length) {
    case 1:
      if (ctaRightAlign) {
        ctaLayout = 'flex-end';
      } else ctaLayout = 'flex-start';
      ctaSpacing = 0;
      break;
    case 2:
      if (ctaLeftAlign) {
        ctaLayout = 'flex-start';
      } else if (ctaRightAlign) {
        ctaLayout = 'flex-end';
      } else ctaLayout = 'space-between';
      ctaSpacing = 0;
      break;
    case 3:
      ctaSpacing = 'auto';
      ctaLayout = 'flex-start';
      break;
    default:
      ctaLayout = 'flex-start';
      ctaSpacing = 0;
  }

  let cardWidth;
  switch (clickable || !clickable) {
    case clickable:
      if (isTablet) {
        cardWidth = CardSize.medium;
      }
      if (isMobile) {
        cardWidth = '100%';
      } else cardWidth = CardSize.medium;

      break;
    case !clickable:
      if (isTablet) {
        cardWidth = CardSize.small;
      } else cardWidth = CardSize.medium;

      break;
    default:
      cardWidth = CardSize.medium;
  }

  const cardInnerContent = (
    <Box
      sx={{
        height: 'auto',
        display: 'flex',
        width: '100%',
        flexGrow: 1,
        marginBottom: 'auto',

        flexDirection: clickable ? (isMobile ? 'row' : 'column') : 'column',
      }}
    >
      {imageUrl && (
        <CardMedia
          component="img"
          sx={{
            width: clickable ? (isMobile ? '33%' : '100%') : '100%',
            height: clickable ? (isMobile ? 'auto' : 300) : 140,
            objectFit: 'cover',
            flexShrink: 0,
            alignSelf: 'stretch',
          }}
          image={imageUrl}
          title={imageAltText}
        />
      )}
      <CardContent
        sx={{
          padding: '1.5rem',
          paddingBottom: '1rem',
        }}
      >
        <CardHeader
          component={'h3'}
          title={cardHeading}
          sx={{
            span: {
              font: clickable
                ? theme.typography.mMedium
                : theme.typography.lRegular,
            },
            padding: 0,
            margin: 0,
          }}
        />
        {paragraphText && (
          <Typography sx={{ mt: 2, font: theme.typography.sRegular }}>
            {paragraphText}
          </Typography>
        )}
        {!clickable && subText && (
          <Typography
            sx={{
              mt: 2,
              font: theme.typography.xsRegular,
              color: theme.palette.grey[500],
            }}
          >
            {subText}
          </Typography>
        )}
      </CardContent>
    </Box>
  );

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'none',
        position: 'relative',
        boxSizing: 'border-box',
        width: singleCard ? cardWidth : null,
        backgroundColor: theme.palette.common.white,
        borderRadius: borderRadius.borderRadiusSmall,
        color: theme.palette.text.secondary,
        outline: isSelected
          ? `2px solid ${theme.palette.secondary.main}`
          : `2px solid ${theme.palette.grey[300]}`,
        overflow: 'visible',
        height: '100%',
        '&:hover': {
          boxShadow: '0 0.375rem 0.25rem rgba(0, 0, 0, 0.25)',
        },
      }}
    >
      {labelText && (
        <Box
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.common.white,
            minWidth: '6.25rem',
            position: 'absolute',
            left: -2,
            top: -10,
            padding: '0.125rem 0.75rem',
            borderBottomRightRadius: '3rem',
            zIndex: 6,
          }}
        >
          <Typography sx={{ font: theme.typography.xsMedium }}>
            {labelText}
          </Typography>
        </Box>
      )}
      {clickable ? (
        <CardActionArea
          className="card-action"
          disableRipple
          disableTouchRipple
          onClick={() => setIsSelected((prev) => !prev)}
          data-active={isSelected ? '' : undefined}
          sx={{
            backgroundColor: theme.palette.common.white,
            overflow: 'hidden',

            '& .MuiCardActionArea-focusHighlight': {
              display: 'none',
            },
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              right: 10,
              top: 10,
              height: isMobile ? '1.25rem' : '2rem',
              width: isMobile ? '1.25rem' : '2rem',
              borderRadius: '50%',
              border: `2px solid ${isSelected ? theme.palette.common.white : theme.palette.secondary.main}`,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'white',
              backgroundColor: isSelected
                ? theme.palette.secondary.main
                : theme.palette.common.white,
              zIndex: 3,
            }}
          >
            {isSelected ? <Check /> : null}
          </Box>
          {cardInnerContent}
        </CardActionArea>
      ) : (
        cardInnerContent
      )}
      {ctas && !clickable && (
        <CardActions
          sx={{
            display: 'flex',
            justifyContent: ctaLayout,
            paddingTop: 0,
            paddingBottom: '1.125rem',
            px: 1.5,
            alignItems: 'flex-end',
            '& > :first-of-type': {
              marginRight: ctaSpacing,
            },
          }}
        >
          {ctas?.map((cta, index) => (
            <Button
              key={index}
              fullWidth={cta?.fullWidth}
              buttonVariant="tertiary"
              onClick={cta?.ctaAction}
              small
            >
              {cta?.ctaText}
            </Button>
          ))}
        </CardActions>
      )}
    </Card>
  );
}
