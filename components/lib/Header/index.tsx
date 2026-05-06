import React from 'react';
import { Box } from '@mui/material';

export interface HeaderProps {
  bankLogo?: React.ReactNode;
  bankTitle?: React.ReactNode;
  children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ bankLogo, bankTitle, children }) => {
  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--primary-color, #03A)',
        px: 3,
        height: 64,
        minHeight: 64,
      }}
    >
      {/* Left side: Logo + Title */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {bankLogo}
        {bankTitle}
      </Box>
      {/* Right side: Buttons */}
      <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        {children}
      </Box>
    </Box>
  );
};

export default Header;
