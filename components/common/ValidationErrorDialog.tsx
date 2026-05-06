'use client';
import { Box } from '@mui/material';
import { Dialog } from 'dist/standard-bank-react';
import React from 'react';

interface ValidationErrorDialogProps {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
  isMandatoryError?: boolean;
  secondaryMessage?: string;
  cancelLabel?: string;
}

const ValidationErrorDialog: React.FC<ValidationErrorDialogProps> = ({
  open,
  title,
  message,
  onClose,
  isMandatoryError = false,
  secondaryMessage,
  cancelLabel = 'CANCEL',
}: ValidationErrorDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="560px"
      content={
        <Box
          sx={{
            padding: '16px 0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          {/* Warning Icon */}
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            border: `3px solid #D32F2F`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#D32F2F',
            fontSize: '28px',
            fontWeight: 'bold'
          }}>
            !
          </div>

          {/* Error Message */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
            }}
          >
            <Box
              sx={{
                fontWeight: 600,
                fontSize: '16px',
                textAlign: 'center',
                color: '#222E37',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                width: '100%',
                lineHeight: '1.6',
              }}
            >
              {message}
            </Box>

            {/* Secondary Message for Mandatory Errors */}
            {isMandatoryError && (
              <Box
                sx={{
                  fontWeight: 400,
                  fontSize: '14px',
                  textAlign: 'center',
                  color: '#666666',
                }}
              >
                {secondaryMessage || `Overall customer limit is mandatory and cannot be deleted`}
              </Box>
            )}
          </Box>
        </Box>
      }
      title={title}
      name={title}
      tertiaryCTALabel={cancelLabel}
      onTertiaryCTA={onClose}
      tertiaryCTAHeight="48px"
    />
  );
};

export default ValidationErrorDialog;
