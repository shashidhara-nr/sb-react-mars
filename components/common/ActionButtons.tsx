import React from 'react';
import { Box, Stack } from '@mui/material';

interface ActionButtonProps {
  buttons: any[];
}

const ActionButtons: React.FC<ActionButtonProps> = ({ buttons }) => {
  return (
    <Stack direction="row" spacing={1}>
      {buttons.map((btn, idx) => (
        <Box key={idx} component="span">
          {/* Assume each button is a React element or object with children and onClick */}
          {btn.children && typeof btn.children === 'object' ? (
            <button type="button" onClick={btn.onClick} style={{ marginRight: 8 }}>
              {btn.children}
            </button>
          ) : null}
        </Box>
      ))}
    </Stack>
  );
};

export default ActionButtons;