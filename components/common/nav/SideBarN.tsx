'use client';

import * as React from 'react';
import Image, { StaticImageData } from 'next/image';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Drawer,
  Slide,
} from '@mui/material';
import { usePathname } from 'next/navigation';
import NavSidebar from './NavSidebar';
import type { NavItem } from './menuData';
import DashboardIcn from 'public/icons/icn_dashboard.svg';
import BillIcn from 'public/icons/icn_bill.svg';
// Ensure grouped menu data imports
import { menuData, approveMenuData, transactMenuData } from './menuData';
import TransactIcn from 'public/icons/icn_cash_notes.svg';
import CheckCircleIcn from 'public/icons/icn_check_circle.svg';
import SettingIcn from 'public/icons/icn_settings_outline.svg';
import OverflowIcn from 'public/icons/icn_overflow_ios.svg';
import LinkOutIcn from 'public/icons/icn_link_out.svg';
 
const iconMap: Record<string, StaticImageData> = {
  Dashboard: DashboardIcn,
  AccountBalance: BillIcn,
  Receipt: TransactIcn,
  CheckCircle: CheckCircleIcn,
  Settings: SettingIcn,
  MoreHoriz: OverflowIcn,
  OpenInNew: LinkOutIcn,
};
 
const defaultMenu = [
  { label: 'Dashboard', icon: 'Dashboard' },
  {
    label: 'Accounts & Balances',
    icon: 'AccountBalance',
  },
  { label: 'Transact', icon: 'Receipt' },
  { label: 'Audit & Approve', icon: 'CheckCircle' },
  { label: 'Setup And Admin', icon: 'Settings', selected: true },
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
 
const SIDEBAR_WIDTH = 80;
const ITEM_RADIUS = '0px';
const DRAWER_RADIUS = '16px';
 
type MenuItem = {
  label: string;
  icon: string;
  selected?: boolean;
  divider?: boolean;
  submenu?: Array<{ label: string; icon: string }>;
};
 
const SideBarN: React.FC<SideBarProps> = ({
  menuItems = defaultMenu,
  externalItems = externalMenu,
}) => {
  const pathname = usePathname();
  
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
  const [navOpen, setNavOpen] = React.useState(false);
  const [navIdx, setNavIdx] = React.useState<number | null>(null);
  const [currentNavItems, setCurrentNavItems] = React.useState<NavItem[]>(menuData);

  // Update selected menu item and current nav items based on route (but don't auto-open drawer)
  React.useEffect(() => {
    if (!pathname) return;

    // Helper to check if pathname matches any item in a nav array
    const hasMatchingRoute = (items: NavItem[]): boolean => {
      const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(\/|$)/, '/');
      
      const checkItems = (navItems: NavItem[]): boolean => {
        return navItems.some(item => {
          if (item.href && (pathWithoutLocale.startsWith(item.href) || pathname.includes(item.href))) {
            return true;
          }
          if (item.children?.length) {
            return checkItems(item.children);
          }
          return false;
        });
      };
      
      return checkItems(items);
    };

    // Check each menu section and update selected state (without opening drawer)
    if (hasMatchingRoute(menuData)) {
      const setupAdminIdx = menuItems.findIndex(item => item.label === 'Setup And Admin');
      if (setupAdminIdx >= 0) {
        setCurrentNavItems(menuData);
        setSelected({ section: 'menu', index: setupAdminIdx });
      }
    } else if (hasMatchingRoute(approveMenuData)) {
      const approveIdx = menuItems.findIndex(item => item.label === 'Audit & Approve');
      if (approveIdx >= 0) {
        setCurrentNavItems(approveMenuData);
        setSelected({ section: 'menu', index: approveIdx });
      }
    } else if (hasMatchingRoute(transactMenuData)) {
      const transactIdx = menuItems.findIndex(item => item.label === 'Transact');
      if (transactIdx >= 0) {
        setCurrentNavItems(transactMenuData);
        setSelected({ section: 'menu', index: transactIdx });
      }
    }
  }, [pathname, menuItems]);
 
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
      setNavOpen(false);
      setNavIdx(null);
    } else {
      // Special case: open NavSidebar for Setup And Admin or Approve
      if (item.label === 'Setup And Admin') {
        if (closeTimer.current) {
          clearTimeout(closeTimer.current);
          closeTimer.current = null;
        }
        setNavOpen(true);
        setNavIdx(idx);
        setCurrentNavItems(menuData);
        setSubmenuOpen(false);
        setSubmenuIdx(null);
      } else if (item.label === 'Audit & Approve') {
        if (closeTimer.current) {
          clearTimeout(closeTimer.current);
          closeTimer.current = null;
        }
        setNavOpen(true);
        setNavIdx(idx);
        setCurrentNavItems(approveMenuData);
        setSubmenuOpen(false);
        setSubmenuIdx(null);
      } else if (item.label === 'Transact') {
        if (closeTimer.current) {
          clearTimeout(closeTimer.current);
          closeTimer.current = null;
        }
        setNavOpen(true);
        setNavIdx(idx);
        setCurrentNavItems(transactMenuData);
        setSubmenuOpen(false);
        setSubmenuIdx(null);
      } else {
        // If hovering a menu item without submenu, close any open drawers
        setSubmenuOpen(false);
        setSubmenuIdx(null);
        setNavOpen(false);
        setNavIdx(null);
      }
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
  const handleNavMouseEnter = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setNavOpen(true);
  };
  const handleNavMouseLeave = () => {
    closeTimer.current = setTimeout(() => {
      setNavOpen(false);
      setNavIdx(null);
    }, 150);
  };
  const handleMenuClick = (item: MenuItem, idx: number) => {
    setSelected({ section: 'menu', index: idx });
    // No submenu open/close on click
    if (!item.submenu) {
      setSubmenuOpen(false);
      setSubmenuIdx(null);
      if (item.label !== 'Setup And Admin') {
        setNavOpen(false);
        setNavIdx(null);
      }
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
        {menuItems.map((item: MenuItem, idx: number) => {
          const isSelected =
            selected.section === 'menu' && selected.index === idx;
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
                  width: 64,
                  minWidth: 64,
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
                      left: -5,
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
                  {iconMap[item.icon] && (
                    <Image
                      src={iconMap[item.icon]}
                      alt={`${item.label} icon`}
                      width={24}
                      height={24}
                    />
                  )}
                </ListItemIcon>
                {!isMoreIcon && (
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      sx: {
                        fontSize: 10,
                        fontWeight: 400,
                        textAlign: 'center',
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
                      width: 180,
                      position: 'fixed',
                      left: SIDEBAR_WIDTH,
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
                        {item.submenu!.map((subitem: { label: string; icon: string }) => (
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
                            onClick={handleSubmenuMouseLeave}
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
                              {iconMap[subitem.icon] && (
                                <Image
                                  src={iconMap[subitem.icon]}
                                  alt={`${subitem.label} icon`}
                                  width={24}
                                  height={24}
                                />
                              )}
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
              {/* NavSidebar drawer for grouped menus */}
              {navOpen && navIdx === idx && (
                <Drawer
                  anchor="left"
                  open={navOpen}
                  variant="persistent"
                  hideBackdrop
                  PaperProps={{
                    sx: {
                      width: 280,
                      position: 'fixed',
                      left: SIDEBAR_WIDTH,
                      top: 0,
                      borderRadius: `0 ${DRAWER_RADIUS} ${DRAWER_RADIUS} 0`,
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
                    in={navOpen}
                    mountOnEnter
                    unmountOnExit
                    appear
                  >
                    <Box
                      sx={{ display: 'flex', height: '100%' }}
                      onMouseEnter={handleNavMouseEnter}
                      onMouseLeave={handleNavMouseLeave}
                    >
                      <NavSidebar width={280} items={currentNavItems} onClose={() => { setNavOpen(false); setNavIdx(null); }} />
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
                            bgcolor: '#0051FF',
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
                        {iconMap[item.icon] && (
                          <Image
                            src={iconMap[item.icon]}
                            alt={`${item.label} icon`}
                            width={16}
                            height={16}
                          />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          sx: {
                            fontSize: 10,
                            fontWeight: 400,
                            textAlign: 'center',
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
 
export default SideBarN;