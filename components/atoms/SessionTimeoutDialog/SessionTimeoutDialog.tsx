import React, { useEffect, useState } from 'react';
import { Dialog, Button } from 'dist/standard-bank-react';
import { Box, Typography } from '@mui/material';
import { useSessionTimeout } from 'lib/hooks/useSessionTimeout';
import styles from './SessionTimeoutDialog.module.scss';

export interface SessionTimeoutDialogProps {
  open: boolean;
  warningTimeoutMs?: number;
  onDialogClose: () => void;
}

export const SessionTimeoutDialog: React.FC<SessionTimeoutDialogProps> = ({
  open,
  warningTimeoutMs = 30000,
  onDialogClose,
}) => {
  const [countdownSeconds, setCountdownSeconds] = useState(Math.ceil(warningTimeoutMs / 1000));
  const { extendSession, performLogout, isLoading } = useSessionTimeout();

  // Reset countdown when dialog opens
  useEffect(() => {
    if (open) {
      setCountdownSeconds(Math.ceil(warningTimeoutMs / 1000));
    }
  }, [open, warningTimeoutMs]);

  // Countdown timer - AUTO-LOGOUT enabled
  useEffect(() => {
    if (!open) return;

    if (countdownSeconds <= 0) {
      performLogout();
      return;
    }

    const timer = setTimeout(() => {
      setCountdownSeconds(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdownSeconds, open, performLogout]);

  const handleStayLoggedIn = async () => {
    await extendSession();
    onDialogClose();
  };

  const handleLogOut = async () => {
    await performLogout();
  };

  const dialogContent = (
    <Box className={styles.dialogContent}>
      <Box className={styles.clockIcon}>
        <img src="/icons/icn_clock_standard.svg" alt="Clock" />
      </Box>

      <Typography variant="body2" className={styles.timeoutMessage}>
        Your online session will timeout in
      </Typography>

      <Typography variant="h3" className={styles.countdown}>
        {countdownSeconds} seconds
      </Typography>

      <Typography variant="caption" className={styles.description}>
        You have not interacted with this website for a while. To protect your accounts security,
        you will automatically be logged out.
      </Typography>
    </Box>
  );

  return (
    <div>
      <Dialog
        name="session-timeout"
        title="Session timeout"
        content={dialogContent}
        open={open}
        tertiaryCTALabel="LOG OUT"
        onTertiaryCTA={handleLogOut}
        tertiaryCTAStyle={{ color: '#0051FF', fontWeight: 'bold' }}
        secondaryCTAStyle={{ color: '#0051FF', fontWeight: 'bold' }}
        secondaryCTALabel="STAY LOGGED IN"
        onSecondaryCTA={handleStayLoggedIn}
        maxWidth="36rem"
        primaryCTALoading={isLoading}
        secondaryCTALoading={isLoading}
        tertiaryCTALoading={isLoading}
      />
    </div>

  );
};

export default SessionTimeoutDialog;
