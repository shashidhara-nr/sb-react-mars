
'use client';

import * as React from 'react';
import {
  Box,
  Button,
  Stack,
  useTheme
} from '@mui/material';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';

type Props = {
  onCancel?: () => void;
  onSaveDraft?: () => void;
  onReviewSubmit?: () => void;

  /** Disable all actions */
  disabled?: boolean;

  /** Show loading state for async ops */
  saving?: boolean;
  submitting?: boolean;

  /** Review mode - changes button text and behavior */
  reviewMode?: boolean;

  /** Make footer sticky (default true) */
  sticky?: boolean;

  /** Optional: override labels for i18n */
  labels?: {
    cancel?: string;
    save?: string;
    submit?: string;
  };
};

export const FormFooterActions: React.FC<Props> = ({
  onCancel,
  onSaveDraft,
  onReviewSubmit,
  disabled = false,
  saving = false,
  submitting = false,
  reviewMode = false,
  sticky = true,
  labels = {
    cancel: 'Cancel',
    save: 'Save to drafts',
    submit: reviewMode ? 'Submit' : 'Review and submit'
  }
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: sticky ? 'sticky' : 'static',
        bottom: 0,
        zIndex: 1,
        border: 'none',
        borderTop: 'none',
        outline: 'none',
        marginTop: 2,
        pt: 1.5,
        pb: 1.5,
        [theme.breakpoints.down('sm')]: {
          pl: 1.5,
          pr: 1.5,
        }
      }}
    >
      <Stack direction="row" alignItems="center" gap={2}>
        {/* Left: Cancel (text / ghost look) */}
        <Button
          color="primary"
          variant="text"
          startIcon={<BlockOutlinedIcon />}
          onClick={onCancel}
          disabled={disabled || saving || submitting}
          sx={{
            fontWeight: 700,
            textTransform: 'uppercase',
            height: '48px'
          }}
        >
          {labels.cancel}
        </Button>

        <Box sx={{ flexGrow: 1 }} />

        {/* Right actions */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          {onSaveDraft && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<SaveOutlinedIcon />}
              onClick={onSaveDraft}
              disabled={disabled || submitting}
              loading={saving as any} // If using MUI v6 with LoadingButton, replace Button with LoadingButton
              sx={{
                fontWeight: 700,
                textTransform: 'uppercase',
                borderRadius: 1.25,
                px: 2.25,
                height: '48px'
              }}
            >
              {labels.save}
            </Button>
          )}

          <Button
            variant="contained"
            color="primary"
            startIcon={<ReceiptLongOutlinedIcon />}
            onClick={onReviewSubmit}
            disabled={disabled || saving}
            loading={submitting as any}
            sx={{
              fontWeight: 700,
              textTransform: 'uppercase',
              borderRadius: 1.25,
              px: 2.25,
              height: '48px'
            }}
          >
            {labels.submit}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

