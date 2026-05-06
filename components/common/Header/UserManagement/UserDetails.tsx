'use client';

import { useState } from 'react';
import * as React from 'react';
import {
  Popper,
  Paper,
  IconButton,
  Typography,
  Box,
  TextField,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { buildTestId } from 'src/utils/testIds';

export interface UserDetailsDialogProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onApply: (values: any) => void;
}

export default function UserDetailsDialog({
  open,
  anchorEl,
  onClose,
  onApply,
}: UserDetailsDialogProps) {
  if (!open) return null;

  const testIdPrefix = 'user-profile';

  const [email, setEmail] = useState<string>('');
  const [notifyByEmail, setNotifyByEmail] = useState(true);
  const [timeZone, setTimeZone] = useState('Africa/Bangui/WAT');
  const [language, setLanguage] = useState('English (South Africa)');

  const handleSave = () => {
    const values = {};
    onApply(values);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-end"
      data-testid={buildTestId(testIdPrefix, 'popper')}
    >
      <Paper
        sx={{
          width: 750,
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0px 20px 40px rgba(0,0,0,0.25)',
        }}
        data-testid={buildTestId(testIdPrefix, 'dialog')}
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
          data-testid={buildTestId(testIdPrefix, 'header')}
        >
          <Typography
            sx={{
              fontSize: 18,
              fontWeight: 600,
              lineHeight: '24px',
              paddingLeft: '6px',
            }}
            data-testid={buildTestId(testIdPrefix, 'heading')}
          >
            My details
          </Typography>

          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ color: '#FFFFFF', padding: 0 }}
            data-testid={buildTestId(testIdPrefix, 'button-close')}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* ================= BODY ================= */}
        <Box
          sx={{ px: 4, py: 5 }}
          data-testid={buildTestId(testIdPrefix, 'details-section')}
        >
          <Typography
            sx={{
              fontSize: 20,
              fontWeight: 600,
              mb: 4,
              color: '#111827',
            }}
            data-testid={buildTestId(testIdPrefix, 'details-title')}
          >
            My details
          </Typography>

          <Box
            display="grid"
            gridTemplateColumns="1fr 1fr"
            columnGap="64px"
            rowGap="40px"
            data-testid={buildTestId(testIdPrefix, 'details-grid')}
          >
            <Box data-testid={buildTestId(testIdPrefix, 'user-account')}>
              <Typography sx={{ fontSize: 14, color: '#6B7280', mb: 0.5 }}>
                User account name
              </Typography>
              <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
                Sam SA customer
              </Typography>
            </Box>

            <Box data-testid={buildTestId(testIdPrefix, 'user-name')}>
              <Typography sx={{ fontSize: 14, color: '#6B7280', mb: 0.5 }}>
                Name
              </Typography>
              <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
                Sam
              </Typography>
            </Box>

            <Box data-testid={buildTestId(testIdPrefix, 'password-last-changed')}>
              <Typography sx={{ fontSize: 14, color: '#6B7280', mb: 0.5 }}>
                Password last changed on
              </Typography>
              <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
                20 October 2025 10:47 WAT
              </Typography>
            </Box>

            <Box data-testid={buildTestId(testIdPrefix, 'change-password')}>
              <Typography sx={{ fontSize: 14, color: '#6B7280', mb: 1 }}>
                Change password on OneHub
              </Typography>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#2563EB',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em',
                  width: 'fit-content',
                }}
                data-testid={buildTestId(testIdPrefix, 'change-password-link')}
              >
                Change password
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* ================= SETTINGS ================= */}
        <Box
          sx={{ px: 4, pb: 2 }}
          data-testid={buildTestId(testIdPrefix, 'settings-section')}
        >
          <Typography
            sx={{
              fontSize: 20,
              fontWeight: 600,
              color: '#111827',
              mb: 3,
            }}
            data-testid={buildTestId(testIdPrefix, 'settings-title')}
          >
            Settings & preferences
          </Typography>

          <Box
            display="grid"
            gridTemplateColumns="1fr 1fr"
            columnGap="48px"
            rowGap="32px"
            data-testid={buildTestId(testIdPrefix, 'settings-grid')}
          >
            <TextField
              label="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              data-testid={buildTestId(testIdPrefix, 'input-email')}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={notifyByEmail}
                  onChange={(e) => setNotifyByEmail(e.target.checked)}
                  sx={{
                    color: '#2563EB',
                    '&.Mui-checked': { color: '#2563EB' },
                  }}
                  data-testid={buildTestId(testIdPrefix, 'checkbox-notify-email')}
                />
              }
              label="Notify me by email"
            />

            <FormControl fullWidth>
              <InputLabel>Time zone</InputLabel>
              <Select
                value={timeZone}
                label="Time zone"
                onChange={(e) => setTimeZone(e.target.value)}
                data-testid={buildTestId(testIdPrefix, 'select-timezone')}
              >
                <MenuItem value="Africa/Bangui/WAT">
                  Africa/Bangui/WAT
                </MenuItem>
                <MenuItem value="Africa/Johannesburg/SAST">
                  Africa/Johannesburg/SAST
                </MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Language</InputLabel>
              <Select
                value={language}
                label="Language"
                onChange={(e) => setLanguage(e.target.value)}
                data-testid={buildTestId(testIdPrefix, 'select-language')}
              >
                <MenuItem value="English (South Africa)">
                  English (South Africa)
                </MenuItem>
                <MenuItem value="English (UK)">English (UK)</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* ================= FOOTER ================= */}
        <Box
          sx={{
            px: 4,
            py: 2,
            display: 'flex',
            justifyContent: 'space-between',
            borderTop: '1px solid #E5E7EB',
            backgroundColor: '#F9FAFB',
          }}
          data-testid={buildTestId(testIdPrefix, 'footer')}
        >
          <Button
            onClick={handleCancel}
            sx={{ fontWeight: 600, color: '#2563EB' }}
            data-testid={buildTestId(testIdPrefix, 'button-cancel')}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSave}
            variant="contained"
            sx={{
              backgroundColor: '#2563EB',
              fontWeight: 600,
              textTransform: 'uppercase',
              px: 3,
            }}
            data-testid={buildTestId(testIdPrefix, 'button-save')}
          >
            Save
          </Button>
        </Box>
      </Paper>
    </Popper>
  );
}