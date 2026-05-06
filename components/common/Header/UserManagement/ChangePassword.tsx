'use client';

import { useState, useEffect } from 'react';
import {
  Popper,
  Paper,
  IconButton,
  Typography,
  Box,
  TextField,
  Button,
  InputAdornment,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CloseIcon from '@mui/icons-material/Close';
import { passwordRules } from './userManagement.helper';
import { buildTestId } from 'src/utils/testIds';

export interface ChangePasswordDialogProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onApply: (values: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => void;
}

export default function ChangePasswordDialog({
  open,
  anchorEl,
  onClose,
  onApply,
}: ChangePasswordDialogProps) {
  const testIdPrefix = 'user-profile';

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const hasPassword = newPassword.length > 0;

  const ruleStates = passwordRules.map(rule => ({
    ...rule,
    valid: newPassword.length > 0 ? rule.test(newPassword) : false,
  }));

  const passwordsDoNotMatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword;

  const allRulesValid = ruleStates.every(r => r.valid);
  const canSubmit = allRulesValid && !passwordsDoNotMatch;

  useEffect(() => {
    if (!open) {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowNew(false);
      setShowConfirm(false);
    }
  }, [open]);

  if (!open) return null;

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-end"
      data-testid={buildTestId(testIdPrefix, 'change-password-popper')}
    >
      <Paper
        sx={{
          width: 600,
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0px 20px 40px rgba(0,0,0,0.25)',
        }}
        data-testid={buildTestId(testIdPrefix, 'change-password-dialog')}
      >
        {/* ================= HEADER ================= */}
        <Box
          sx={{
            height: 64,
            px: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#1434A4',
            color: '#FFFFFF',
          }}
          data-testid={buildTestId(testIdPrefix, 'change-password-header')}
        >
          <Typography
            sx={{ fontSize: 18, fontWeight: 600 }}
            data-testid={buildTestId(testIdPrefix, 'change-password-heading')}
          >
            Change password
          </Typography>

          <IconButton
            onClick={onClose}
            sx={{ color: '#fff' }}
            data-testid={buildTestId(testIdPrefix, 'button-close-change-password')}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* ================= BODY ================= */}
        <Box
          sx={{ px: 6, py: 4 }}
          data-testid={buildTestId(testIdPrefix, 'change-password-body')}
        >
          <Box display="flex" flexDirection="column" gap={3}>
            <TextField
              label="Old password*"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              fullWidth
              data-testid={buildTestId(testIdPrefix, 'input-old-password')}
            />

            <TextField
              label="New password*"
              type={showNew ? 'text' : 'password'}
              error={passwordsDoNotMatch}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
              data-testid={buildTestId(testIdPrefix, 'input-new-password')}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNew(v => !v)}
                      data-testid={buildTestId(
                        testIdPrefix,
                        'toggle-new-password-visibility'
                      )}
                    >
                      {showNew ? (
                        <VisibilityOff sx={{ color: '#83aafd' }} />
                      ) : (
                        <Visibility sx={{ color: '#83aafd' }} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Re-enter new password*"
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              error={passwordsDoNotMatch}
              helperText={passwordsDoNotMatch ? 'Passwords do not match' : ''}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              data-testid={buildTestId(testIdPrefix, 'input-confirm-password')}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirm(v => !v)}
                      data-testid={buildTestId(
                        testIdPrefix,
                        'toggle-confirm-password-visibility'
                      )}
                    >
                      {showConfirm ? (
                        <VisibilityOff sx={{ color: '#83aafd' }} />
                      ) : (
                        <Visibility sx={{ color: '#83aafd' }} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* ================= PASSWORD RULES ================= */}
          <Box
            mt={4}
            display="flex"
            flexDirection="column"
            gap={1.5}
            data-testid={buildTestId(testIdPrefix, 'password-rules')}
          >
            {ruleStates.map(rule => {
              const showValidation = hasPassword;
              const isValid = rule.valid;

              return (
                <Box
                  key={rule.id}
                  data-testid={buildTestId(
                    testIdPrefix,
                    `password-rule-${rule.id}`
                  )}
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 20,
                    fontSize: 14,
                    width: 'fit-content',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    border: `1px solid ${
                      !showValidation
                        ? '#E5E7EB'
                        : isValid
                        ? '#A7F3D0'
                        : '#FCA5A5'
                    }`,
                    backgroundColor: !showValidation
                      ? '#F9FAFB'
                      : isValid
                      ? '#ECFDF5'
                      : '#FEF2F2',
                    color: !showValidation
                      ? '#6B7280'
                      : isValid
                      ? '#047857'
                      : '#B91C1C',
                  }}
                >
                  ● {rule.label}
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* ================= FOOTER ================= */}
        <Box
          sx={{
            px: 4,
            py: 1.5,
            borderTop: '1px solid #E5E7EB',
            display: 'flex',
            justifyContent: 'space-between',
            backgroundColor: '#F9FAFB',
          }}
          data-testid={buildTestId(testIdPrefix, 'change-password-footer')}
        >
          <Button
            variant="text"
            sx={{ fontWeight: 600, color: '#2563EB' }}
            onClick={onClose}
            data-testid={buildTestId(testIdPrefix, 'button-cancel-change-password')}
          >
            CANCEL
          </Button>

          <Button
            variant="text"
            disabled={!canSubmit}
            sx={{ fontWeight: 600, color: '#2563EB' }}
            onClick={() =>
              onApply({ oldPassword, newPassword, confirmPassword })
            }
            data-testid={buildTestId(testIdPrefix, 'button-submit-change-password')}
          >
            SUBMIT
          </Button>
        </Box>
      </Paper>
    </Popper>
  );
}