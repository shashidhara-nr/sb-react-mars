import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Drawer,
  Slide,
  SvgIconProps,
} from '@mui/material';
import {
  BillIcn,
  CheckCircleIcn,
  DashboardIcn,
  IOSOverflowIcn,
  LinkOutIcn,
  SettingIcn,
  TransactIcn,
} from 'assets/icons';

const iconMap: Record<string, React.ReactElement<unknown>> = {
  Dashboard: <DashboardIcn />,
  AccountBalance: <BillIcn />,
  Receipt: <TransactIcn />,
  CheckCircle: <CheckCircleIcn />,
  Settings: <SettingIcn />,
  MoreHoriz: <IOSOverflowIcn />,
  OpenInNew: <LinkOutIcn />,
};

const defaultMenu = [
  { label: 'Dashboard', icon: 'Dashboard' },
  {
    label: 'Accounts & Balances',
    icon: 'AccountBalance',
    submenu: [
      { label: 'Savings', icon: 'Dashboard' },
      { label: 'Credit Cards', icon: 'Dashboard' },
      { label: 'Loans', icon: 'Dashboard' },
      { label: 'Receipts', icon: 'Dashboard' },
    ],
  },
  { label: 'Transact', icon: 'Receipt' },
  { label: 'Approve', icon: 'CheckCircle' },
  {
    label: 'Setup And Admin',
    icon: 'Settings',
    selected: true,
    submenu: [
      { label: 'User Management', icon: 'Dashboard' },
      { label: 'System Settings', icon: 'Dashboard' },
      { label: 'Audit Logs', icon: 'Dashboard' },
    ],
    styles: {
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
      padding: '10px',
    },
  },
  { label: 'More', icon: 'MoreHoriz', divider: true },
];

const externalMenu = [
  { label: 'Investor Services', icon: 'OpenInNew' },
  { label: 'ITMS', icon: 'OpenInNew' },
  { label: 'International Trade', icon: 'OpenInNew' },
];

export interface SideBarProps {
  menuItems?: Array<{
    label: string;
    icon: string;
    selected?: boolean;
    divider?: boolean;
    submenu?: Array<{ label: string; icon: string }>;
  }>;
  externalItems?: Array<{
    label: string;
    icon: string;
  }>;
}

const SIDEBAR_WIDTH = 120;
const ITEM_RADIUS = '0px';
const DRAWER_RADIUS = '16px';

type MenuItem = {
  label: string;
  icon: string;
  selected?: boolean;
  divider?: boolean;
  submenu?: Array<{ label: string; icon: string }>;
};

const SideBar: React.FC<SideBarProps> = ({
  menuItems = defaultMenu,
  externalItems = externalMenu,
}) => {
  // Track which section and index is selected
  const [selected, setSelected] = React.useState<{
    section: 'menu' | 'external';
    index: number;
  }>(() => {
    const initialMenu = menuItems.findIndex((item) => item.selected);
    if (initialMenu >= 0) return { section: 'menu', index: initialMenu };
    return { section: 'menu', index: 0 };
  });

  // Submenu drawer state
  const [submenuOpen, setSubmenuOpen] = React.useState(false);
  const [submenuIdx, setSubmenuIdx] = React.useState<number | null>(null);

  // Hover logic with timer for smooth close
  const closeTimer = React.useRef<NodeJS.Timeout | null>(null);
  const handleMenuMouseEnter = (item: MenuItem, idx: number) => {
    if (item.submenu && Array.isArray(item.submenu)) {
      if (closeTimer.current) {
        clearTimeout(closeTimer.current);
        closeTimer.current = null;
      }
      setSubmenuOpen(true);
      setSubmenuIdx(idx);
    } else {
      // If hovering a menu item without submenu, close any open submenu
      setSubmenuOpen(false);
      setSubmenuIdx(null);
    }
  };

  const handleSubmenuMouseEnter = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setSubmenuOpen(true);
  };
  const handleSubmenuMouseLeave = () => {
    closeTimer.current = setTimeout(() => {
      setSubmenuOpen(false);
      setSubmenuIdx(null);
    }, 150);
  };
  const handleMenuClick = (item: MenuItem, idx: number) => {
    setSelected({ section: 'menu', index: idx });
    // No submenu open/close on click
    if (!item.submenu) {
      setSubmenuOpen(false);
      setSubmenuIdx(null);
    }
  };

  // Updated submenu click handler to support redirection
  const handleSubmenuClick = (subitem: {
    label: string;
    icon: string;
    link?: string;
  }) => {
    if (subitem.link) {
      window.location.href = subitem.link; // Redirect to the specified link
    }
  };

  return (
    <Box
      sx={{
        width: SIDEBAR_WIDTH,
        bgcolor: '#fff',
        borderRight: '1px solid #eee',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        pt: 2,
        px: 0,
      }}
    >
      <List
        sx={{
          width: '100%',
          gap: 1,
          pb: 0,
          px: '0.25rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {menuItems.map((item, idx) => {
          const isSelected =
            selected.section === 'menu' && selected.index === idx;
          // const isSubmenuActive = submenuOpen && submenuIdx === idx; // removed unused variable
          const isMoreIcon = item.icon === 'MoreHoriz';
          return (
            <React.Fragment key={item.label}>
              <ListItem
                component="button"
                onClick={() => handleMenuClick(item, idx)}
                onMouseEnter={() => handleMenuMouseEnter(item, idx)}
                onMouseLeave={() => {
                  // If leaving a menu item, close submenu unless mouse is over submenu
                  if (!item.submenu) {
                    setSubmenuOpen(false);
                    setSubmenuIdx(null);
                  }
                }}
                sx={{
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 1,
                  px: 1,
                  my: 1,
                  mx: 0,
                  minHeight: 72,
                  height: 72,
                  width: 90,
                  minWidth: 90,
                  borderRadius: ITEM_RADIUS,
                  backgroundColor: 'transparent',
                  position: 'relative',
                  boxShadow: 'none',
                  border: 'none',
                  outline: 'none',
                  fontWeight: 400,
                  color: '#222',
                  paddingLeft: '0',
                  '&:hover': {
                    backgroundColor: 'rgba(0,81,255,0.16)',
                  },
                }}
              >
                {/* Blue indicator for selected (left side) */}
                {isSelected && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: -7,
                      top: '0.25rem',
                      bottom: '0.25rem',
                      width: 4,
                      borderRadius: '0 2px 2px 0',
                      bgcolor: '#0051FF',
                    }}
                  />
                )}
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mb: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 24,
                    width: 24,
                  }}
                >
                  <Box
                    sx={{
                      fontSize: 24,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {iconMap[item.icon]}
                  </Box>
                </ListItemIcon>
                {!isMoreIcon && (
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      sx: {
                        fontSize: 10,
                        fontWeight: 400,
                        textAlign: 'center',
                        // mt: 0,
                      },
                    }}
                  />
                )}
              </ListItem>
              {/* Submenu drawer */}
              {item.submenu && submenuOpen && submenuIdx === idx && (
                <Drawer
                  anchor="left"
                  open={submenuOpen}
                  variant="persistent"
                  hideBackdrop
                  PaperProps={{
                    sx: {
                      width: 250,
                      position: 'fixed',
                      left: 140,
                      top: 0,
                      borderRadius: DRAWER_RADIUS,
                      boxShadow: 3,
                      p: 0,
                      m: 0,
                      bgcolor: '#fff',
                      zIndex: 1301,
                    },
                  }}
                >
                  <Slide
                    direction="right"
                    in={submenuOpen}
                    mountOnEnter
                    unmountOnExit
                    appear
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                      }}
                      onMouseEnter={handleSubmenuMouseEnter}
                      onMouseLeave={handleSubmenuMouseLeave}
                    >
                      <List sx={{ p: 0, m: 0 }}>
                        {item.submenu.map((subitem) => (
                          <ListItem
                            key={subitem.label}
                            component="button"
                            sx={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              py: 1.5,
                              px: 2,
                              mx: 0,
                              minHeight: 48,
                              borderRadius: ITEM_RADIUS,
                              backgroundColor: 'transparent',
                              transition: 'background 0.2s',
                              '&:hover': {
                                backgroundColor: 'rgba(0,81,255,0.08)',
                              },
                              border: 'none',
                              outline: 'none',
                            }}
                            onClick={() => handleSubmenuClick(subitem)}
                          >
                            <ListItemIcon
                              sx={{
                                minWidth: 0,
                                color: '#222',
                                mr: 2,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: 32,
                                width: 32,
                              }}
                            >
                              <Box
                                sx={{
                                  fontSize: 24,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                {iconMap[subitem.icon]}
                              </Box>
                            </ListItemIcon>
                            <ListItemText
                              primary={subitem.label}
                              primaryTypographyProps={{
                                sx: {
                                  fontSize: 16,
                                  color: '#222',
                                  fontWeight: 400,
                                },
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </Slide>
                </Drawer>
              )}
            </React.Fragment>
          );
        })}
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ width: '100%', px: 0, my: 2 }}>
          <Box sx={{ borderBottom: '1px solid #eee', my: 1, mx: 1 }} />
          <List sx={{ width: '100%', pt: 0, pl: 0, pr: 0 }}>
            {externalItems.map((item, idx) => {
              const isSelected =
                selected.section === 'external' && selected.index === idx;
              return (
                <React.Fragment key={item.label}>
                  <Box
                    sx={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      pl: 0,
                      pr: 0,
                    }}
                  >
                    <ListItem
                      component="button"
                      key={item.label}
                      onClick={() =>
                        setSelected({ section: 'external', index: idx })
                      }
                      sx={{
                        flexDirection: 'column',
                        py: 1,
                        width: 64,
                        mx: 0,
                        my: 0.5,
                        borderRadius: '12px',
                        backgroundColor: 'transparent',
                        position: 'relative',
                        boxShadow: 'none',
                        transition: 'background 0.2s',
                        border: 'none',
                        outline: 'none',
                      }}
                    >
                      {isSelected && (
                        <Box
                          sx={{
                            position: 'absolute',
                            left: -12,
                            top: 8,
                            height: 50,
                            width: 4,
                            borderRadius: '4px',
                            // bgcolor: '#0051FF',
                          }}
                        />
                      )}
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mb: 0.5,
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          height: 24,
                          width: 24,
                        }}
                      >
                        {React.cloneElement(
                          iconMap[
                            item.icon
                          ] as React.ReactElement<SvgIconProps>,
                          { sx: { fontSize: 16 } },
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          sx: {
                            fontSize: 10,
                            fontWeight: 400,
                            textAlign: 'center',
                            // mt: 0.5,
                          },
                        }}
                      />
                    </ListItem>
                  </Box>
                </React.Fragment>
              );
            })}
          </List>
        </Box>
      </List>
    </Box>
  );
};

export default SideBar;
