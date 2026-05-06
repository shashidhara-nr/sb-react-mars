import * as React from 'react';
import { Stack, Typography } from '@mui/material';

export type ReviewDescriptionListRow = {
  label: string;
  value: React.ReactNode;
};

interface ReviewDescriptionListProps {
  items: ReviewDescriptionListRow[];
  labelWidth?: any;
  rowGap: number;
  stack?: boolean;
}

const BoldValue: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography
    component="span"
    sx={{ fontSize: '1.25rem', fontWeight: 500, lineHeight: 1.5 }}
  >
    {children}
  </Typography>
);

const ReviewDescriptionList: React.FC<ReviewDescriptionListProps> = ({
  items,
  labelWidth,
  rowGap,
  stack = false,
}) => {
  return (
    <Stack component="dl" spacing={rowGap} sx={{ m: 0 }}>
      {items.map((it) => (
        <Stack
          key={it.label}
          direction={stack ? 'column' : 'row'}
          alignItems={stack ? 'stretch' : 'flex-start'}
          gap={stack ? 0.5 : 2}
          component="div"
          sx={{ minHeight: 24 }}
        >
          <Typography
            component="dt"
            sx={{
              width: stack ? undefined : labelWidth,
              color: (t) => t.palette.text.neutral,
              fontSize: '1rem',
              fontWeight: 400,
              lineHeight: 1.5,
              mt: stack ? 0 : '2px',
            }}
          >
            {it.label}
          </Typography>
          <Typography
            component="dd"
            sx={{
              m: 0,
              flex: stack ? undefined : 1,
              color: (t) => t.palette.text.primary,
              fontSize: '1.25rem',
              fontWeight: 500,
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
            }}
          >
            {it.value}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
};

export { BoldValue };
export default ReviewDescriptionList;
