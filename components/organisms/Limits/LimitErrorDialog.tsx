/**
 * LimitErrorDialog Component
 * Reusable dialog component for displaying limit validation and operation errors
 * Handles special formatting for error code 211007 (mandatory limit delete)
 */

'use client';

import { Dialog, DialogTitle, DialogContent, DialogActions, Alert, Typography, Box } from '@mui/material';
import { Button } from 'components/lib/Forms';
import { useTranslations } from 'next-intl';
import { LIMIT_CONSTANTS } from '@lib/utils/limitValidation';

export interface LimitErrorDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  code?: number;
  isMandatoryError?: boolean;
  fieldErrors?: Record<string, string>;
  severity?: 'error' | 'warning' | 'info';
  showContactAdmin?: boolean;
}

export const LimitErrorDialog: React.FC<LimitErrorDialogProps> = ({
  open,
  onClose,
  title,
  message,
  code,
  isMandatoryError = false,
  fieldErrors,
  severity = 'error',
  showContactAdmin = false,
}) => {
  const t = useTranslations('limits');

  const getSeverityAlert = () => {
    if (isMandatoryError) {
      return (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <strong>System-Required Limit</strong>
          <br />
          This is a mandatory limit that must exist in the system. It cannot be deleted.
          {showContactAdmin && (
            <>
              <br />
              Contact your administrator if you need to modify this limit.
            </>
          )}
        </Alert>
      );
    }

    if (severity === 'error') {
      return (
        <Alert severity="error" sx={{ mb: 2 }}>
          {severity === 'error'
            ? 'Please fix the errors and try again.'
            : 'Please review the information and try again.'}
        </Alert>
      );
    }

    return null;
  };

  const formatFieldErrors = (
    fieldErrors: Record<string, string> | undefined
  ): React.ReactNode => {
    if (!fieldErrors || Object.keys(fieldErrors).length === 0) {
      return null;
    }

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Field Errors:
        </Typography>
        <Box component="ul" sx={{ pl: 2, m: 0 }}>
          {Object.entries(fieldErrors).map(([field, error]) => (
            <Typography
              component="li"
              key={field}
              variant="body2"
              sx={{ mb: 0.5 }}
            >
              <strong>{formatFieldName(field)}:</strong> {error}
            </Typography>
          ))}
        </Box>
      </Box>
    );
  };

  const formatFieldName = (field: string): string => {
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, fontSize: '18px', pb: 1 }}>
        {title}
        {code && (
          <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
            Error Code: {code}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent sx={{ py: 2 }}>
        {getSeverityAlert()}
        <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mb: 1 }}>
          {message}
        </Typography>
        {fieldErrors && formatFieldErrors(fieldErrors)}
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          buttonVariant="tertiary"
          onClick={onClose}
        >
          {t('close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LimitErrorDialog;
