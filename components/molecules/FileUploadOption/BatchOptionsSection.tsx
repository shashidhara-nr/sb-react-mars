'use client';

import * as React from 'react';
import { Box, Grid, Stack, Typography } from '@mui/material';

export type Row = { label: string; value: React.ReactNode };

export interface BatchOptionsSectionProps {
  left: Row[];
  right: Row[];
  dividerColor?: string;
  leftLabelWidth?: string | number | Record<string, string | number>;
  rightLabelWidth?: string | number | Record<string, string | number>;
  rowGap?: number;
}

export default function BatchOptionsSection({
  left,
  right,
  dividerColor = '#7C3AED',
  leftLabelWidth = { xs: 220, md: 280 },
  rightLabelWidth = { xs: 240, md: 320 },
  rowGap = 2,
}: BatchOptionsSectionProps) {
  const renderColumn = (rows: Row[], _labelWidth: BatchOptionsSectionProps['leftLabelWidth']) => (
    <Stack spacing={rowGap} component="dl" sx={{ m: 0 }}>
      {rows.map((r, index) => (
        <Stack key={`${String(r.label)}-${index}`} spacing={0.75}>
          <Typography
            component="dt"
            variant="body2"
            color="text.neutral"
            sx={{ fontSize: '1rem', fontWeight: 400 }}
          >
            {r.label}
          </Typography>
          <Typography
            component="dd"
            sx={{ m: 0, fontSize: '1.25rem', fontWeight: 500 }}
          >
            {r.value}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );

  return (
    <Box
      sx={{
        position: 'relative',
        pb: 1,
        '&::after': {
          content: '""',
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
        },
      }}
    >
      <Grid container spacing={4}>
        <Grid size={{ xs: 6, md: 6 }}>{renderColumn(left, leftLabelWidth)}</Grid>
        <Grid size={{ xs: 6, md: 6 }}>{renderColumn(right, rightLabelWidth)}</Grid>
      </Grid>
    </Box>
  );
}
