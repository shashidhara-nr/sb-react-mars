import * as React from 'react';
import { Stack, Typography } from '@mui/material';

export type DescriptionItem = {
  label: string;
  value: React.ReactNode;
};

export type DescriptionListProps = {
  items: DescriptionItem[];
  spacing?: number;
};

export default function DescriptionList({ items, spacing = 2 }: DescriptionListProps) {
  return (
    <Stack spacing={spacing}>
      {items.map((item) => (
        <Stack spacing={0.75} key={item.label}>
          <Typography
            variant="body2"
            color="text.neutral"
            sx={{ fontSize: '1rem', fontWeight: 400 }}
          >
            {item.label}
          </Typography>
          <Typography sx={{ fontSize: '1.25rem', fontWeight: 500 }}>
            {item.value}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}
