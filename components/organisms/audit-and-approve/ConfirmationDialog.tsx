import React from 'react';
import { Box, Typography, Dialog, DialogContent } from '@mui/material';
import { Button } from 'dist/standard-bank-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { CloseBlue } from 'lib/icons';
import styles from "./styles.module.scss";

export interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  avatarIcon: any;
  avatarAlt: string;
  heading: string;
  message: string;
  dismissLabel: string;
  confirmLabel: string;
  onConfirm: () => void;
  dialogTestId: string;
  closeTestId: string;
  dismissTestId: string;
  confirmTestId: string;
  children?: React.ReactNode;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onClose,
  title,
  avatarIcon,
  avatarAlt,
  heading,
  message,
  dismissLabel,
  confirmLabel,
  onConfirm,
  dialogTestId,
  closeTestId,
  dismissTestId,
  confirmTestId,
  children,
}) => {
  const t = useTranslations('nonTransactionalAuditApprove');
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      sx={{ zIndex: 1500 }}
      PaperProps={{
        sx: {
          borderRadius: 1,
          overflow: 'hidden',
        },
      }}
      data-testid={dialogTestId}
    >
      <Box className={styles.dialogHeader}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Box 
          sx={{ cursor: 'pointer' }} 
          onClick={onClose}
          data-testid={closeTestId}
          role="button"
          aria-label="Close dialog"
          tabIndex={0}
        >
          <Image src={CloseBlue} alt={t('altCloseIcon')} width={18} height={18} />
        </Box>
      </Box>

      <DialogContent sx={{ pt: 4, pb: 2.5 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
            <Image src={avatarIcon} alt={avatarAlt} width={58} height={58} />
          </Box>
          <Typography sx={{ fontWeight: 500, fontSize: '16px', color: '#222E37', textAlign: 'center' }}>
            {heading}
          </Typography>
          <Typography sx={{ fontSize: '14px', color: '#222E37', maxWidth: 400, textAlign: 'center', fontWeight: 400 }}>
            {message}
          </Typography>
          {children}
        </Box>
      </DialogContent>

      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Button 
          buttonVariant="tertiary" 
          onClick={onClose}
          data-testid={dismissTestId}
        >
          {dismissLabel}
        </Button>
        <Button
          buttonVariant="tertiary"
          onClick={onConfirm}
          data-testid={confirmTestId}
        >
          {confirmLabel}
        </Button>
      </Box>
    </Dialog>
  );
};

export default ConfirmationDialog;
