import { Stack } from '@mui/material';
import React from 'react';

type ButtonBarProps = {
  /** Optioanl property to align the buttons to the start or end of the bar. Values are `start` or `end`. Defaults to `end`. */
  align?: 'start' | 'end';
  /** These should be Button components but there is no real restriction. */
  children: React.ReactNode;
};

/** A compponent for laying Buttons horizontally. */
export default function ButtonBar({ children, align = 'end' }: ButtonBarProps) {
  return (
    <Stack direction="row" justifyContent={`flex-${align}`} spacing={2}>
      {children}
    </Stack>
  );
}
