'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import AvatarAlertSuccess from 'public/icons/avatar_alert_success.svg';
import Image from 'next/image';
import IcnInfoCircle from 'public/icons/icn_info_circle.svg';
import { Button } from 'dist/standard-bank-react';
import { buildTestId } from 'src/utils/testIds';

interface SuccessMessageProps {
  icon?: React.ReactNode;
  title?: string;
  message: string;
  subtext?: string;
  infoNote?: string; // deprecated alias for subtext; kept for compatibility
  primaryCTALabel?: string;
  onPrimaryCTA?: () => void;
  primaryCTALoading?: boolean;
  primaryCTAStartIcon?: React.ReactNode;
  primaryCTAEndIcon?: React.ReactNode;
  primaryCTAStyle?: React.CSSProperties;
  secondaryCTALabel?: string;
  onSecondaryCTA?: () => void;
  secondaryCTALoading?: boolean;
  secondaryCTAStartIcon?: React.ReactNode;
  secondaryCTAEndIcon?: React.ReactNode;
  secondaryCTAStyle?: React.CSSProperties;
  tertiaryCTALabel?: string;
  onTertiaryCTA?: () => void;
  tertiaryCTALoading?: boolean;
  tertiaryCTAStartIcon?: React.ReactNode;
  tertiaryCTAEndIcon?: React.ReactNode;
  tertiaryCTAStyle?: React.CSSProperties;
  testIdPrefix?: string;
}
export default function SuccessMessage({
  icon,
  title = 'Success',
  message,
  subtext,
  infoNote,
  primaryCTALabel,
  onPrimaryCTA,
  primaryCTALoading,
  primaryCTAStartIcon,
  primaryCTAEndIcon,
  primaryCTAStyle,
  secondaryCTALabel,
  onSecondaryCTA,
  secondaryCTALoading,
  secondaryCTAStartIcon,
  secondaryCTAEndIcon,
  secondaryCTAStyle,
  tertiaryCTALabel,
  onTertiaryCTA,
  tertiaryCTALoading,
  tertiaryCTAStartIcon,
  tertiaryCTAEndIcon,
  tertiaryCTAStyle,
  testIdPrefix = 'success-message',
}: SuccessMessageProps) {

  const resolvedTitle = title ?? 'Success';
 const resolvedSubtext = subtext ?? infoNote ?? ''; // prefer subtext, fallback to legacy infoNote
  const defaultIconSrc = AvatarAlertSuccess;

  return (
    <Box
      data-testid={buildTestId(testIdPrefix, 'container')}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
      }}
    >
      <Box
        data-testid={buildTestId(testIdPrefix, 'card')}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 5,
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          textAlign: 'center',
          minHeight: '360px',
        }}
      >
        <Box sx={{ mb: 2 }}>
          {icon ? (
            icon
          ) : (
            <Image src={defaultIconSrc} alt={resolvedTitle} width={80} height={79} />
          )}
        </Box>

        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: '#000000',
            mb: 1,
            fontSize: '20px',
          }}
        >
          {resolvedTitle}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            textAlign: 'center',
            fontSize: '18px',
            fontWeight: 400,
          }}
        >
          {message}
        </Typography>

        {resolvedSubtext && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              mt: 4,
              width: '100%',
            }}
          >
            <Box sx={{ mb: 1 }}>
              <Image src={IcnInfoCircle} alt="Info" width={32} height={32} />
            </Box>

            <Typography
              variant="body2"
              sx={{
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: 400,
              }}
            >
              {resolvedSubtext}
            </Typography>
          </Box>
        )}
      </Box>

      {(onPrimaryCTA || onSecondaryCTA || onTertiaryCTA) && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: '16px',
            width: '100%',
          }}
        >
          {onTertiaryCTA && (
            <Button
              onClick={onTertiaryCTA}
              data-testid={buildTestId(testIdPrefix, 'tertiary-cta')}
              buttonVariant="tertiary"
              loading={tertiaryCTALoading}
              startIcon={tertiaryCTAStartIcon}
              endIcon={tertiaryCTAEndIcon}
              style={tertiaryCTAStyle}
            >
              {tertiaryCTALabel}
            </Button>
          )}

          <Box
            sx={{
              display: 'flex',
              gap: 2,
              marginLeft: 'auto',
            }}
          >
              {onSecondaryCTA && (
              <Box sx={{ '&:hover img': { filter: 'brightness(0) invert(1)' } }}>
                <Button
                  onClick={onSecondaryCTA}
                  data-testid={buildTestId(testIdPrefix, 'secondary-cta')}
                  buttonVariant="secondary"
                  loading={secondaryCTALoading}
                  startIcon={secondaryCTAStartIcon}
                  endIcon={secondaryCTAEndIcon}
                  style={secondaryCTAStyle}
                >
                  {secondaryCTALabel}
                </Button>
              </Box>
            )}

            {onPrimaryCTA && (
              <Button
                onClick={onPrimaryCTA}
                data-testid={buildTestId(testIdPrefix, 'primary-cta')}
                buttonVariant="primary"
                loading={primaryCTALoading}
                startIcon={primaryCTAStartIcon}
                endIcon={primaryCTAEndIcon}
                style={primaryCTAStyle}
              >
                {primaryCTALabel}
              </Button>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}
