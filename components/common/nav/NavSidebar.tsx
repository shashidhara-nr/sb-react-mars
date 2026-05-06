
'use client';

import * as React from 'react';
import {
  Box,
  Divider,
  InputBase,
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  alpha,
  useTheme,
  styled,
} from '@mui/material';
import Image from 'next/image';
import ChevronDownIcon from 'public/icons/icn_chevron_down.svg';
import ChevronUpIcon from 'public/icons/icn_chevron_up.svg';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import Link from 'next/link';
 
import { usePathname, useRouter } from 'next/navigation';
import type { NavItem } from './menuData';

type SidebarProps = {
  width?: number;
  items: NavItem[];
  onClose?: () => void; // for mobile sheets/drawers
};

const SearchBox = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  height: 40,
  padding: '0 12px',
  borderRadius: 8,
  border: `1px solid ${alpha(theme.palette.text.primary, 0.15)}`,
  background: theme.palette.background.paper,
}));

function useFiltered(items: NavItem[], q: string) {
  return React.useMemo(() => {
    if (!q.trim()) return items;
    const query = q.toLowerCase();

    const filterItem = (it: NavItem): NavItem | null => {
      const selfMatch = it.label.toLowerCase().includes(query);
      if (it.children?.length) {
        const kids = it.children
          .map(filterItem)
          .filter(Boolean) as NavItem[];
        if (kids.length || selfMatch) {
          return { ...it, children: kids };
        }
        return null;
      }
      return selfMatch ? it : null;
    };

    return items
      .map(filterItem)
      .filter(Boolean) as NavItem[];
  }, [items, q]);
}

export default function Sidebar({ width = 280, items, onClose }: SidebarProps) {
  const [openIds, setOpenIds] = React.useState<Set<string>>(new Set());
  const [query, setQuery] = React.useState('');
  const list = useFiltered(items, query);
  const theme = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  const toggle = (id: string) => {
    setOpenIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isActive = (href?: string) => {
    if (!href || !pathname) return false;
    // Remove locale prefix from pathname for comparison
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(\/|$)/, '/');
    return pathWithoutLocale.startsWith(href) || pathname.includes(href);
  };

  // Auto-expand parent items when their children are active
  React.useEffect(() => {
    const checkActive = (href?: string) => {
      if (!href || !pathname) return false;
      const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(\/|$)/, '/');
      return pathWithoutLocale.startsWith(href) || pathname.includes(href);
    };

    const findActiveParents = (items: NavItem[]): string[] => {
      const activeParents: string[] = [];
      
      items.forEach(item => {
        if (item.children?.length) {
          const hasActiveChild = item.children.some(child => checkActive(child.href));
          if (hasActiveChild) {
            activeParents.push(item.id);
          }
        }
      });
      
      return activeParents;
    };

    const activeParentIds = findActiveParents(items);
    if (activeParentIds.length > 0) {
      setOpenIds(new Set(activeParentIds));
    }
  }, [pathname, items]);

  const renderItem = (item: NavItem, depth = 0) => {
    const hasChildren = !!item.children?.length;
    const open = openIds.has(item.id);

    const button = (
      <ListItemButton
        key={item.id}
        
        component={item.href && !hasChildren ? Link : 'div'}
        href={item.href && !hasChildren ? item.href : undefined}
        onClick={() => {
          if (hasChildren) {
            toggle(item.id);
          } else if (item.href) {
            router.push(item.href as any);
            onClose?.(); // Close the panel when navigating
          }
        }}
        disableRipple
        sx={{
          pl: 2 + depth * 2,
          pr: 1,
          minHeight: 40,
          borderRadius: 1,
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
          },
          ...(isActive(item.href) && {
            backgroundColor: alpha(theme.palette.primary.main, 0.06),
            '& .MuiListItemText-primary': {
              color: theme.palette.primary.main,
              fontWeight: 600,
            },
          }),
        }}
      >
        <ListItemText
          primaryTypographyProps={{
            fontSize: 14,
            color: 'text.primary',
            noWrap: true,
          }}
          primary={item.label}
        />
        {hasChildren ? (
          open ? (
            <Image src={ChevronUpIcon} alt="chevron up" width={18} height={18} style={{ color: theme.palette.primary.main }} />
          ) : (
            <Image src={ChevronDownIcon} alt="chevron down" width={18} height={18} style={{ color: theme.palette.primary.main }} />
          )
        ) : null}
      </ListItemButton>
    );

    return (
      <React.Fragment key={item.id}>
        {button}
        {hasChildren && (
          <Collapse in={open} timeout="auto" unmountOnExit>
            <List disablePadding>
              {item.children!.map((child) => (
                <ListItemButton
                  key={child.id}
                  component={child.href ? Link : 'div'}
                  href={child.href}
                  onClick={() => {
                    if (child.href) {
                      router.push(child.href as any);
                      onClose?.(); // Close the panel when navigating to child link
                    }
                  }}
                  disableRipple
                  sx={{
                    pl: 6 + depth * 2,
                    pr: 1,
                    minHeight: 36,
                    borderRadius: 1,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    },
                    ...(isActive(child.href) && {
                      backgroundColor: alpha(theme.palette.primary.main, 0.06),
                      '& .MuiListItemText-primary': {
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                      },
                    }),
                  }}
                >
                  <ListItemText
                    primaryTypographyProps={{ fontSize: 13 }}
                    primary={child.label}
                  />
                </ListItemButton>
              ))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <Box
      sx={{
        width,
        height: '100%',
        borderRight: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        p: 2,
      }}
    >
      {/* Header with search and close */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SearchBox sx={{ flex: 1 }}>
          <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          <InputBase
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ flex: 1, fontSize: 14 }}
            inputProps={{ 'aria-label': 'Search menu' }}
          />
        </SearchBox>
        {onClose && (
          <Box
            role="button"
            aria-label="Close sidebar"
            onClick={onClose}
            sx={{
              p: 0.5,
              borderRadius: 1,
              cursor: 'pointer',
              '&:hover': { backgroundColor: alpha(theme.palette.text.primary, 0.06) },
            }}
          >
            <CloseIcon fontSize="small" />
          </Box>
        )}
      </Box>

      {/* Nav list */}
      <Box sx={{ overflowY: 'auto' }}>
        <List disablePadding>
          {list.map((item) => renderItem(item))}
        </List>
      </Box>
    </Box>
  );
}
