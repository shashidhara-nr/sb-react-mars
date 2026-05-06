'use client';

import { Box, Menu, MenuItem, Avatar } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { ReactNode, useState } from 'react';
import styles from './Header.module.scss';

export interface CustomHeaderProps {
  bankLogo?: ReactNode;
  children?: ReactNode;
  username?: string;
  userAvatar?: string;
  menuItems: string[];
  onMenuItemClick?: (index: number, anchorEl: HTMLElement) => void;
}

export default function CustomHeader({
  bankLogo,
  children,
  username = 'Username',
  userAvatar = '/icons/icn_people_profile.svg',
  menuItems,
  onMenuItemClick,
}: CustomHeaderProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (index: number) => {
    if (anchorEl) {
      onMenuItemClick?.(index, anchorEl);
    }
    handleClose();
  };

  return (
    <Box className={styles.header}>
      <Box className={styles.logoSection}>{bankLogo}</Box>

      <Box className={styles.rightSection}>
        <button className={styles.userButton} onClick={handleClick}>
          <Avatar
            sx={{ width: 24, height: 24, mr: 0.5 }}
            src={userAvatar}
          />
          <span className={styles.username}>{username}</span>
          <ArrowDropDownIcon />
        </button>

        <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
          {menuItems.map((item, index) => (
            <MenuItem
              key={index}
              sx={{ width: 230 }}
              onClick={() => handleMenuItemClick(index)}
            >
              {item}
            </MenuItem>
          ))}
        </Menu>

        {children}
      </Box>
    </Box>
  );
}