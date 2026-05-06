'use client';

import { Icon } from "@atoms/index";
import { useTheme } from "@mui/material";

const IconsList = () => {
  const theme = useTheme();
    return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '24px' }}>
    {[
      'limits',
      'home',
      'settings',
      'user',
      'search',
      'notification',
      'logout',
      'dashboard',
      'wallet',
      'transfer',
      'help',
      'info',
      'calendar',
      'download',
      'upload',
      'edit',
      'delete',
      'add',
      'remove',
      'arrow-up',
      'arrow-down',
      'arrow-left',
      'arrow-right'
    ].map((iconName) => (
      <div key={iconName} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Icon name={iconName} bgColor={theme.palette.text.secondary} />
        <span style={{ fontSize: '12px', color: theme.palette.common.white, marginTop: '4px' }}>{iconName}</span>
      </div>
    ))}
  </div>
);
};

export default IconsList;
