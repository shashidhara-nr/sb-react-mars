import { Card, useTheme } from '@mui/material';
import { borderRadius } from '../styles/spacing';

interface ContentSlotCardProps {
  component: React.ReactElement;
  padding: 0 | 16 | 24 | 32 | 40 | 64 | 80;
}

export default function ContentSlotCard({
  component,
  padding = 0,
}: ContentSlotCardProps) {
  const theme = useTheme();
  return (
    <Card
      sx={{
        display: 'flex',
        flexGrow: 1,
        boxShadow: 'none',
        padding: `${padding}px`,
        backgroundColor: theme.palette.common.white,
        borderRadius: borderRadius.borderRadiusSmall,
        border: `1px solid ${theme.palette.grey[300]}`,
        '&:hover': {
          boxShadow: '0 0.375rem 0.25rem rgba(0, 0, 0, 0.25)',
        },
      }}
    >
      {component}
    </Card>
  );
}
