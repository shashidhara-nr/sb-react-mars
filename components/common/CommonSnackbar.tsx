"use client";

import React from 'react';
import { Snackbar, Alert, type SnackbarOrigin } from '@mui/material';
import Image from 'next/image';
import { CheckCircleIcon, Exclamation } from 'lib/icons';
import { buildTestId } from 'src/utils/testIds';

type Severity = 'success' | 'error' | 'warning' | 'info';

export type CommonSnackbarProps = {
  open: boolean;
  message: string;
  severity?: Severity;
  onClose: () => void;
  autoHideDuration?: number;
  anchorOrigin?: SnackbarOrigin;
};

const severityIcon = (severity: Severity) => {
  switch (severity) {
    case 'success':
      return CheckCircleIcon;
    case 'error':
      return Exclamation;
    case 'warning':
      return Exclamation;
    case 'info':
    default:
      return CheckCircleIcon;
  }
};

const severityBg = (severity: Severity) => {
  switch (severity) {
    case 'success':
      return '#008545';
    case 'error':
      return '#D13236';
    case 'warning':
      return '#C87F1F';
    case 'info':
    default:
      return '#1473E6';
  }
};

export default function CommonSnackbar({
  open,
  message,
  severity = 'success',
  onClose,
  autoHideDuration = 3000,
  anchorOrigin = { vertical: 'top', horizontal: 'right' },
}: CommonSnackbarProps) {
  const testIdPrefix = 'common-snackbar';
  const Icon = severityIcon(severity);
  const bg = severityBg(severity);

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
      sx={{ mt: 8 }}
      data-testid={buildTestId(testIdPrefix, 'snackbar', severity)}
    >
      <Alert
        icon={<Image src={Icon} alt={severity} width={20} height={20} />}
        severity={severity}
        sx={{ backgroundColor: bg, color: '#FFFFFF', fontWeight: 400, fontSize: 16, alignItems: 'center', borderRadius: 2 }}
        data-testid={buildTestId(testIdPrefix, 'alert', severity)}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
