import { Box } from '@mui/material';
import { Dialog } from 'dist/standard-bank-react';
import Image from 'next/image';
import React from 'react';
import AvatarAlert from 'public/icons/avatar_alert.svg';
import { buildTestId } from 'src/utils/testIds';

interface DeleteConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onPrimaryCTA: () => void;
  onSecondaryCTA: () => void;
  selectedCount: number;
  title?: string;
  name?: string;
  primaryCTALabel?: string;
  secondaryCTALabel?: string;
  exclamationIcon?: any; 
  itemLabel?: string; 
  itemLabel2?:string;
  itemLabel3?:string;
  markedCount?: number; 
  message?: React.ReactNode;
  messageFontWeight?: number | string;
  secondaryCTAWidth?: string;
  secondaryCTAHeight?: string;
  tertiaryCTAWidth?: string;
  tertiaryCTAHeight?: string;
  testIdPrefix?: string;
  showUndoWarning?: boolean;
  loading?: boolean;
  primaryCTALoading?: boolean;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  open,
  onClose,
  onPrimaryCTA,
  onSecondaryCTA,
  selectedCount,
  title = 'Multiple delete confirmation',
  name = 'Multiple delete confirmation',
  primaryCTALabel = 'Yes, delete the selected items',
  secondaryCTALabel = 'Dismiss',
  itemLabel = 'items',
  itemLabel2,
  itemLabel3,
  markedCount,
  message,
  messageFontWeight = 400,
  secondaryCTAWidth,
  secondaryCTAHeight = '48px',
  tertiaryCTAWidth,
  tertiaryCTAHeight = '48px',
  exclamationIcon,
  testIdPrefix = 'delete-confirmation-dialog',
  showUndoWarning = true,
  loading = false,
  primaryCTALoading = false,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="560px"
      content={
        <Box
          data-testid={buildTestId(testIdPrefix, 'content')}
          sx={{
            padding: '16px 0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <Image src={AvatarAlert} alt="Alert" width={48} height={48} />
          {markedCount !== undefined && (
            <Box sx={{ fontWeight: 500, fontSize: '16px', textAlign: 'center' }}>
              {itemLabel}
            </Box>
          )}
          {message ? (
            <Box sx={{ textAlign: 'center' }}>{message}</Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {itemLabel2 ? (
                <Box
                  sx={{
                    fontWeight: messageFontWeight,
                    fontSize: '16px',
                    textAlign: 'center',
                    color: '#222E37',
                  }}
                >
                  {itemLabel2}
                </Box>
              ) : null}
              {showUndoWarning && itemLabel3 ? (
                <Box sx={{ fontWeight: 400, fontSize: '14px', textAlign: 'center', color: '#666666' }}>
                  {itemLabel3}
                </Box>
              ) : null}
            </Box>
          )}
        </Box>
      }
      title={title}
      name={name}
      secondaryCTALabel={primaryCTALabel}
      tertiaryCTALabel={secondaryCTALabel}
      onSecondaryCTA={onPrimaryCTA}
      onTertiaryCTA={onSecondaryCTA}
      secondaryCTAWidth={secondaryCTAWidth}
      secondaryCTAHeight={secondaryCTAHeight}
      tertiaryCTAWidth={tertiaryCTAWidth}
      tertiaryCTAHeight={tertiaryCTAHeight}
      loading={loading || primaryCTALoading}
    />
  );
};

export default DeleteConfirmationDialog;
 