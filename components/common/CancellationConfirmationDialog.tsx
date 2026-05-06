"use client";

import * as React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { buildTestId } from 'src/utils/testIds';
import Image from 'next/image';
import AlertIcon from 'public/icons/avatar_alert.svg';

type CancellationConfirmationDialogProps = {
  open: boolean;
  onClose: () => void;

  // Action callbacks
  onDismiss?: () => void;
  onSaveToDrafts?: () => void;
  onCancel?: () => void;

  // Optional text overrides
  title?: string;
  heading?: string;
  subheading?: string;

  // Button labels
  dismissLabel?: string;
  saveLabel?: string;
  cancelLabel?: string;

  // Loading/disabled states (optional)
  busy?: boolean;
  testIdPrefix?: string;
};

export default function CancellationConfirmationDialog({
  open,
  onClose,
  onDismiss,
  onSaveToDrafts,
  onCancel,
  title = "Cancellation confirmation",
  heading = "Are you sure you want to cancel?",
  subheading = "Any unsaved data will be lost.",
  dismissLabel = "DISMISS",
  saveLabel = "SAVE TO DRAFTS",
  cancelLabel = "CANCEL",
  busy = false,
  testIdPrefix = 'cancellation-confirmation-dialog',
}: CancellationConfirmationDialogProps) {
  const handleDismiss = () => {
    onDismiss?.();
    onClose();
  };

  const handleSave = () => {
    onSaveToDrafts?.();
    onClose();
  };

  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      data-testid={buildTestId(testIdPrefix, 'dialog')}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          maxWidth: 480,
          borderRadius: 1,
          overflow: "hidden",
        },
      }}
    >
      {/* Title bar */}
      <Box
        data-testid={buildTestId(testIdPrefix, 'title-bar')}
        sx={{
          px: 2,
          py: 1.25,
          bgcolor: "#0B3AAE", // deep blue like screenshot
          color: "common.white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '14px' }}>
          {title}
        </Typography>

        <IconButton
          aria-label="close"
          onClick={onClose}
          data-testid={buildTestId(testIdPrefix, 'close-button')}
          sx={{ color: "common.white" }}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ pt: 4, pb: 2.5, overflowY: 'visible' }}>
        {/* Center content */}
        <Stack spacing={2} alignItems="center" textAlign="center">
          {/* Icon circle */}
          <Box
            sx={{
              width: 48,
              height: 48,
            }}
          >
            <Image src={AlertIcon} alt="Alert" width={48} height={48} />
          </Box>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 500, fontSize: '14px' }}>
              {heading}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.75, color: "text.secondary", fontSize: '12px' }}>
              {subheading}
            </Typography>
          </Box>
        </Stack>
      </DialogContent>

      {/* Actions row */}
      <Box
        data-testid={buildTestId(testIdPrefix, 'actions')}
        sx={{
          px: 2,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Button
          onClick={handleDismiss}
          disabled={busy}
          data-testid={buildTestId(testIdPrefix, 'dismiss-button')}
          variant="text"
          sx={{ fontWeight: 700, letterSpacing: 0.4 }}
        >
          {dismissLabel}
        </Button>

        <Box sx={{ display: "flex", gap: 1 }}>
          {onSaveToDrafts && (
            <Button
              onClick={handleSave}
              disabled={busy}
              data-testid={buildTestId(testIdPrefix, 'save-draft-button')}
              variant="text"
              sx={{ fontWeight: 700, letterSpacing: 0.4 }}
            >
              {saveLabel}
            </Button>
          )}
          <Button
            onClick={handleCancel}
            disabled={busy}
            data-testid={buildTestId(testIdPrefix, 'cancel-button')}
            variant="text"
            sx={{ fontWeight: 700, letterSpacing: 0.4 }}
          >
            {cancelLabel}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
 