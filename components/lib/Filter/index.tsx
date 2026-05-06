import React from 'react';
import Box from '@mui/material/Box';
import CommonDialog from '../CommonDialog';

export interface FilterSubHeader {
  subHeader: string;
  fields: { label: string; value: string }[];
}

export interface FilterProps {
  open: boolean;
  onClose: () => void;
  header?: string;
  subHeaders: FilterSubHeader[];
  children?: React.ReactNode;
  titleSx?: object;
}

const Filter: React.FC<FilterProps> = ({
  open,
  onClose,
  header = 'FILTER YOUR RESULTS',
  subHeaders,
  children,
  titleSx,
}) => {
  return (
    <CommonDialog
      open={open}
      title={header}
      onClose={onClose}
      titleSx={titleSx}
    >
      <Box sx={{ px: 0, pt: 1, pb: 0 }}>
        {subHeaders.map((sh, subIdx) => (
          <Box key={subIdx} mb={3}>
            <Box
              sx={{
                fontWeight: 600,
                fontSize: 15,
                color: '#222',
                mb: 1,
                textAlign: 'left',
                letterSpacing: 0.1,
              }}
            >
              {sh.subHeader || '[Sub-header]'}
            </Box>
          </Box>
        ))}
        {children}
      </Box>
    </CommonDialog>
  );
};
export default Filter;
