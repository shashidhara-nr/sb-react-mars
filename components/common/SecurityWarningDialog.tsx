'use client';

import * as React from 'react';
import { Button, Dialog, DialogContent, IconButton } from '@mui/material';
import CloseIcon from "@mui/icons-material/Close";
import Image from 'next/image';
import AlertIcon from 'public/icons/avatar_questionMark_circle.svg';
import styles from './SecurityWarningDialog.module.scss';
import { buildTestId } from 'src/utils/testIds';
export type SecurityWarningDialogProps = {
  open: boolean;
  onClose: () => void;
  onDismiss: () => void;
  onConfirm: () => void;
  title?: string;
  heading?: string;
  subheading?: string;
  dismissLabel?: string;
  confirmLabel?: string;
  showConfirmButton?: boolean;
  testIdPrefix?: string;
  icon?: any;
};

export default function SecurityWarningDialog({
  open,
  onClose,
  onDismiss,
  onConfirm,
  title = 'Security warning',
  heading = "Are you sure you don't want to create any authorisation rules?",
  subheading =
    'Authorisation rules are not mandatory, but add a valuable layer of security to an authorisation profile.',
  dismissLabel = 'DISMISS',
  confirmLabel = 'YES, CONTINUE TO REVIEW',
  showConfirmButton = true,
  testIdPrefix = 'security-warning-dialog',
  icon,
}: SecurityWarningDialogProps) {
  const dialogIcon = icon || AlertIcon;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        className: styles.paper,
        sx: { maxWidth: 480, borderRadius: 1, overflow: 'hidden' },
      }}
      data-testid={buildTestId(testIdPrefix, 'dialog')}
    >
      <div className={styles.header}>
        <div className={styles.headerTitle}>{title}</div>
        <IconButton 
          aria-label="Close security warning dialog" 
          onClick={onClose} 
          className={styles.closeButton} 
          size="small"
          data-testid={buildTestId(testIdPrefix, 'button-close')}
        >
          <CloseIcon htmlColor="#FFFFFF" />
        </IconButton>
      </div>

      <DialogContent className={styles.content}>
        <div className={styles.stack}>
          <div className={styles.iconBox}>
            <Image src={dialogIcon} alt="Alert" width={58} height={58} />
          </div>
          <div>
            <div className={styles.bodyHeading}>{heading}</div>
            <div className={styles.bodySubheading}>{subheading}</div>
          </div>
        </div>
      </DialogContent>

      <div className={styles.footer}>
        <Button
          onClick={onDismiss}
          variant="text"
          className={styles.footerButton}
          data-testid={buildTestId(testIdPrefix, 'button-dismiss')}
          aria-label="Dismiss security warning"
        >
          {dismissLabel}
        </Button>

        {showConfirmButton ? (
          <Button
            onClick={onConfirm}
            variant="text"
            className={styles.footerButton}
            data-testid={buildTestId(testIdPrefix, 'button-confirm')}
            aria-label="Confirm and continue"
          >
            {confirmLabel}
          </Button>
        ) : null}
      </div>
    </Dialog>
  );
}
 