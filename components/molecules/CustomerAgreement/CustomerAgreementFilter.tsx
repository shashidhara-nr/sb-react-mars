"use client";

import * as React from "react";
import { Popover, Stack, Typography, TextField, Button } from "@mui/material";
import { useTranslations } from 'next-intl';

export type CustomerAgreementFilterProps = {
  anchorEl: HTMLElement | null;
  open: boolean;
  accountName: string;
  accountNumber: string;
  bic: string;
  onAccountNameChange: (value: string) => void;
  onAccountNumberChange: (value: string) => void;
  onBicChange: (value: string) => void;
  onCancel: () => void;
  onApply: () => void;
};

export const CustomerAgreementFilter: React.FC<CustomerAgreementFilterProps> = ({
  anchorEl,
  open,
  accountName,
  accountNumber,
  bic,
  onAccountNameChange,
  onAccountNumberChange,
  onBicChange,
  onCancel,
  onApply,
}) => {
  const translateLang = useTranslations('collectionTypesHubData');
  
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onCancel}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      PaperProps={{ sx: { p: 2, width: 320 } }}
    >
      <Stack spacing={2}>
        <Typography variant="subtitle1" fontWeight={600}>
          {translateLang('filterPaymentTypes')}
        </Typography>
        <Stack spacing={2}>
          <TextField
            fullWidth
            size="small"
            placeholder={translateLang('accountName')}
            value={accountName}
            onChange={(e) => onAccountNameChange(e.target.value)}
          />
          <TextField
            fullWidth
            size="small"
            placeholder={translateLang('accountNumber')}
            value={accountNumber}
            onChange={(e) => onAccountNumberChange(e.target.value)}
          />
          <TextField
            fullWidth
            size="small"
            placeholder={translateLang('bicSwift')}
            value={bic}
            onChange={(e) => onBicChange(e.target.value)}
          />
        </Stack>
        <Stack direction="row" justifyContent="space-between" sx={{ pt: 1 }}>
          <Button
            variant="text"
            color="primary"
            onClick={onCancel}
            sx={{ fontWeight: 700 }}
          >
            {translateLang('cancel').toUpperCase()}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={onApply}
            sx={{ fontWeight: 700 }}
          >
            {translateLang('updateTable').toUpperCase()}
          </Button>
        </Stack>
      </Stack>
    </Popover>
  );
};

export default CustomerAgreementFilter;
