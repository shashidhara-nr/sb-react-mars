import { Box, Typography } from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';

type LabelChipStatus = 'neutral' | 'valid' | 'invalid';

interface LabelChipProps {
  label: string;
  status?: LabelChipStatus;
}

const statusStyles = {
  neutral: {
    backgroundColor: '#F4F5F7',
    borderColor: '#E3E6EA',
    dotColor: '#222E37',
    textColor: '#222E37',
  },
  valid: {
    backgroundColor: '#F5FAF7',
    borderColor: '#BFE0CC',
    dotColor: '#008545',
    textColor: '#222E37',
  },
  invalid: {
    backgroundColor: '#FEF5F5',
    borderColor: '#F6C2C2',
    dotColor: '#E31E46',
    textColor: '#222E37',
  },
};

export default function LabelChip({ label, status = 'neutral' }: LabelChipProps) {
  const styles = statusStyles[status];

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        border: `1px solid ${styles.borderColor}`,
        backgroundColor: styles.backgroundColor,
        borderRadius: '16px',
        height: '24px',
        padding: '0 8px',
        width: 'fit-content',
      }}
    >
      <CircleIcon htmlColor={styles.dotColor} sx={{ fontSize: '8px' }} />
      <Typography color={styles.textColor} sx={{fontSize: '12px'}} variant="body2">
        {label}
      </Typography>
    </Box>
  );
}
