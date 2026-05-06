import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Typography,
  useTheme,
  Avatar,
  Box,
  Link,
} from '@mui/material';
import Button from '../../Forms/Button';
import Heading from '../../Page/Heading';

import { borderRadius, svgSize } from '../../styles/spacing';
import { SVGProps, isValidElement, cloneElement } from 'react';
interface cta {
  ctaText: string;
  ctaAction: () => void;
  fullWidth?: boolean;
}

interface LaunchCardProps {
  variant: 'Launch-Card' | 'Avatar-Container';
  avatarIcon?: React.ReactElement;
  actionButtonIcon?: React.ReactElement;
  actionButtonAction?: () => void;
  cardHeading: string;
  subHeader?: string;
  subTextHeader?: string;
  cardLinkText?: string;
  cardLink?: string;
  paragraphText?: string;
  cardSubText?: string;
  ctas?: [cta, cta?, cta?];
}

export default function LaunchCard({
  variant = 'Launch-Card',
  avatarIcon,
  actionButtonIcon,
  actionButtonAction,
  cardHeading,
  subHeader,
  cardLinkText,
  cardLink,
  subTextHeader,
  paragraphText,
  cardSubText,
  ctas,
}: LaunchCardProps) {
  const theme = useTheme();

  const cardText = (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Heading as={'h5'}>{cardHeading}</Heading>

      <Typography component="span" sx={{ font: theme.typography.xsRegular }}>
        {subHeader}
      </Typography>
      {subTextHeader && (
        <Typography
          component="span"
          sx={{
            font: theme.typography.xsRegular,
            color: theme.palette.grey[400],
          }}
        >
          {subTextHeader}
        </Typography>
      )}
      {cardLink && cardLinkText && variant === 'Launch-Card' && (
        <Link
          href={cardLink}
          sx={{ font: theme.typography.xsMedium, textDecoration: 'none' }}
        >
          {cardLinkText}
        </Link>
      )}
    </Box>
  );
  return (
    <Card
      sx={{
        width: 400,
        backgroundColor: theme.palette.common.white,
        padding: 3,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderRadius: borderRadius.borderRadiusSmall,
        border: `1px solid ${theme.palette.grey[300]}`,
        boxShadow: 'none',
        '&:hover': {
          boxShadow: '0 0.375rem 0.25rem rgba(0, 0, 0, 0.25)',
        },
      }}
    >
      <>
        {variant === 'Launch-Card' && (
          <Box
            sx={{
              width: '0.5rem',

              backgroundColor: theme.palette.primary.dark,
              borderRadius: '9999px',
              position: 'absolute',
              left: -4,
              top: 22,
              bottom: 22,
            }}
          ></Box>
        )}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            backgroundColor: theme.palette.common.white,
          }}
        >
          {cardText && (
            <CardHeader
              avatar={
                avatarIcon && (
                  <Avatar sx={{ height: '100%', width: '100%' }} aria-label="">
                    {isValidElement<SVGProps<SVGSVGElement>>(avatarIcon) &&
                      cloneElement(avatarIcon, {
                        width: svgSize.large,
                        height: svgSize.large,
                      })}
                  </Avatar>
                )
              }
              component={'h3'}
              title={cardText}
              sx={{
                padding: 0,
                margin: 0,
              }}
            />
          )}
          {actionButtonAction && actionButtonIcon && (
            <Box
              sx={{
                display: 'flex',
                alignItems:
                  variant === 'Avatar-Container' ? 'flex-start ' : 'center',
              }}
            >
              <Button
                onClick={actionButtonAction}
                buttonVariant={
                  variant === 'Launch-Card' ? 'tertiary' : 'secondary'
                }
                iconOnly
                small
              >
                {actionButtonIcon}
              </Button>
            </Box>
          )}
        </Box>

        {variant === 'Avatar-Container' && (
          <>
            <CardContent
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                padding: 0,
                mt: 1.5,
              }}
            >
              <Typography sx={{ font: theme.typography.mRegular }}>
                {paragraphText}
              </Typography>
              <Typography sx={{ font: theme.typography.sRegular }}>
                {cardSubText}
              </Typography>
            </CardContent>
            {ctas && (
              <CardActions
                sx={{
                  padding: 0,
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  mt: '1rem',
                }}
              >
                {ctas?.map((cta, index) => (
                  <Button
                    key={index}
                    small
                    fullWidth={cta?.fullWidth}
                    buttonVariant="tertiary"
                    onClick={cta?.ctaAction}
                  >
                    {cta?.ctaText}
                  </Button>
                ))}
              </CardActions>
            )}
          </>
        )}
      </>
    </Card>
  );
}
