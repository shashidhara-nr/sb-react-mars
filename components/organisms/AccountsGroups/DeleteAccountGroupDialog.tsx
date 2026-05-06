'use client';

import { Box } from '@mui/material';
import { Dialog } from 'dist/standard-bank-react';
import Image, { StaticImageData } from 'next/image';
import { buildTestId } from 'src/utils/testIds';

export interface DeleteAccountGroupPopperProps {
  open: boolean;
  onClose: () => void;
  onPrimaryCTA: () => void;
  title?: string;
  message?: string;
  subMessage?: string;
  icon?: StaticImageData;
  dialogName?: string;
  primaryCTALabel?: string;
  secondaryCTALabel?: string;
  maxWidth?: string;
  primaryCTAWidth?: string;
  primaryCTAHeight?: string;
  secondaryCTAWidth?: string;
  secondaryCTAHeight?: string;
}

const DeleteAccountGroupPopper = ({
  open,
  onClose,
  onPrimaryCTA,
  title = 'Delete confirmation',
  message,
  icon,
  dialogName = 'delete-account-group-dialog',
  subMessage,
  primaryCTALabel = 'YES, DELETE',
  secondaryCTALabel = 'CANCEL',

  maxWidth = '560px',
  primaryCTAWidth = '140px',
  primaryCTAHeight = '48px',
  secondaryCTAWidth = '82px',
  secondaryCTAHeight = '48px',
}: DeleteAccountGroupPopperProps) => {
  const testIdPrefix = 'delete-account-group';

  return (
    <Dialog
      name={dialogName}
      title={title}
      open={open}
      onClose={onClose}
      content={
        <Box
          sx={{
            padding: '16px 0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}
          data-testid={buildTestId(testIdPrefix, 'content')}
        >
          {icon ? (
            <Box data-testid={buildTestId(testIdPrefix, 'icon')}>
              <Image src={icon} alt="Alert" width={48} height={48} />
            </Box>
          ) : null}

          <Box
            sx={{ fontWeight: 700, fontSize: '16px', textAlign: 'center' }}
            data-testid={buildTestId(testIdPrefix, 'submessage')}
          >
            {subMessage}
          </Box>
          <Box
            sx={{ fontWeight: 500, fontSize: '14px', textAlign: 'center' }}
            data-testid={buildTestId(testIdPrefix, 'message')}
          >
            {message}
          </Box>
        </Box>
      }
      secondaryCTALabel={primaryCTALabel}
      tertiaryCTALabel={secondaryCTALabel}
      onSecondaryCTA={() => {
        onPrimaryCTA();
      }}
      onTertiaryCTA={onClose}
      maxWidth={maxWidth}
      secondaryCTAWidth={primaryCTAWidth}
      secondaryCTAHeight={primaryCTAHeight}
      tertiaryCTAWidth={secondaryCTAWidth}
      tertiaryCTAHeight={secondaryCTAHeight}
    />
  );
};

export default DeleteAccountGroupPopper;
