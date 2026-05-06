// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  TableRow,
  TableCell,
  Checkbox,
  IconButton,
  Collapse,
  Box,
  useTheme,
  Typography,
  Radio,
} from '@mui/material';
import { useState } from 'react';
import Button from '../../Forms/Button';
import StatusLabel from '../../StatusLabel';
import { Icon } from '@atoms/index';
import styles from './TableRow.module.scss';

type ColumnType =
  | 'account'
  | 'normal'
  | 'link'
  | 'status'
  | 'chip'
  | 'button'
  | 'more'
  | 'radioText'
  | undefined;

interface DataTableRowProps<T = Record<string, unknown>> {
  row: T;
  columns: (
    | string
    | {
      key: string;
      type?: ColumnType;
    }
  )[];
  variant: 'default' | 'dropdown' | 'checkbox' | 'radio';
  isSelected?: boolean;
  onSelect?: () => void;
  showMoreButton?: boolean;
  onRowClick?: () => void;
  onQuickLinkClick?: (link: any) => void;
  onMoreButtonClick?: () => void;
  onRowDropdownClick?: (expanded: boolean) => void;

  accountIcon?: React.ReactElement;
  className?: string;
  style?: React.CSSProperties;

  headCells?: any[];
  additionalCells?: any;
  isSmallScreen?: boolean;
}

export default function DataTableRow<T = Record<string, unknown>>({
  row,
  columns,
  variant,
  isSelected = false,
  onSelect,
  showMoreButton,
  onRowClick,
  onMoreButtonClick,
  onRowDropdownClick,
  onQuickLinkClick,
  className,
  style,
  accountIcon = undefined,
  isSmallScreen = false,
  headCells,
  additionalCells,
}: DataTableRowProps<T>) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const columnsLength = columns.length + 1;

  const handleCell = (colKey: string, colType?: ColumnType) => {
    if (colType === 'radioText') {
      const value = (row as Record<string, any>)[colKey];

      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Radio
            checked={isSelected}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              e.stopPropagation();
              onSelect?.();
            }}
            sx={{
              p: 0.5,
              color: '#9E9E9E',      
              '&.Mui-checked': {
                color: '#9E9E9E',        
              },
            }}
          />
          <Typography
            sx={{
              ...(isSmallScreen ? theme.typography.sRegular : theme.typography.sRegular),
              fontWeight: isSelected ? 600 : 400,
            }}
          >
            {String(value ?? '')}
          </Typography>
        </Box>
      );
    }

    // ✅ existing "account"
    if (colType === 'account') {
      const value = (row as Record<string, any>)[colKey] || {};
      const { name, icon, ...rest } = value;

      const iconNode = icon ? icon : accountIcon || null;

      const lines = Object.entries({ name, ...rest })
        .filter(([, v]) => typeof v === 'string' && v)
        .map(([k, v], idx) => (
          <Typography
            key={k}
            variant={idx === 0 ? undefined : 'body2'}
            sx={{
              ...(idx === 0 ? theme.typography.sMedium : theme.typography.xsRegular),
              fontWeight: idx === 0 ? 500 : undefined,
              color: idx === 0 ? undefined : theme.palette.text.secondary,
            }}
          >
            {String(v)}
          </Typography>
        ));

      return (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {iconNode && <Box sx={{ display: 'flex' }}>{iconNode}</Box>}
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>{lines}</Box>
        </Box>
      );
    }

    // ✅ existing "chip"
    if (colType === 'chip') {
      const value = (row as Record<string, any>)[colKey];
      if (isSmallScreen) {
        if (value && typeof value === 'object' && 'value' in value) {
          return <span>{String(value?.value)}</span>;
        }
        return <span>{String(value)}</span>;
      }
      return <StatusLabel text={value?.value} paletteColor={value?.color} />;
    }

    // ✅ existing "link"
    if (colType === 'link') {
      const value = (row as Record<string, any>)[colKey];

      if (value && typeof value === 'object' && value.href) {
        return (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onQuickLinkClick?.(value);
            }}
            style={{
              color: theme.palette.secondary.main,
              fontWeight: 500,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            {value.text || value.href}
          </span>
        );
      }

      if (value && Array.isArray(value)) {
        return (
          <section style={{ display: 'flex', gap: '1rem' }}>
            {value.map((link: any, index: number) => (
              <span
                key={`${link}-${index}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickLinkClick?.(link);
                }}
                style={{
                  color: theme.palette.secondary.main,
                  fontWeight: 500,
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'block',
                }}
              >
                {link.text || link.href}
              </span>
            ))}
          </section>
        );
      }

      return <span>{String(value || '')}</span>;
    }

    // default
    return <span>{String((row as Record<string, any>)[colKey] || '')}</span>;
  };

  return (
    <>
      <TableRow
        className={className}
        style={style}
        sx={{
          borderBottom: isSelected ? `1px solid #0033AA` : `1px solid ${theme.palette.grey[300]}`,
          transition: 'border-color 0.3s ease',
          borderLeft: expanded ? `2px solid #0033AA` : '',
          cursor: onRowClick ? 'pointer' : undefined,
          backgroundColor: isSelected ? '#F3F7FF' : 'transparent',
        }}
        onClick={onRowClick}
      >
        {variant === 'checkbox' && (
          <TableCell sx={{ padding: '0px', width: '40px' }}>
            <Checkbox
              checked={isSelected}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                e.stopPropagation();
                onSelect?.();
              }}
            />
          </TableCell>
        )}

        {variant === 'dropdown' && (
          <TableCell padding="checkbox">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
                onRowDropdownClick?.(!expanded);
              }}
              sx={{
                '&:hover': { backgroundColor: 'transparent' },
                '&:active': { backgroundColor: 'transparent' },
              }}
            >
              <Box
                sx={{
                  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: '0.3s',
                }}
              >
                <Icon name="arrow" width="16px" height="16px" bgColor="#0051FF" />
              </Box>
            </IconButton>
          </TableCell>
        )}

        {columns.map((column: any, colIndex: number) => {
          const colKey = typeof column === 'string' ? column : column.key;
          const colType: ColumnType =
            typeof column === 'string' ? 'normal' : column.type || 'normal';

          const isFirstCol = colIndex === 0;
          const columnObj = headCells?.find((col: any) => col.id === colKey);
          const textAlign = columnObj?.textAlign;

          return (
            <TableCell
              key={`${colKey}-${colIndex}`}
              sx={{
                py: isSmallScreen ? 1.5 : 2.125,
                px: isSmallScreen ? 1 : 2,
                ...(isFirstCol && variant === 'checkbox' ? { pl: '10px' } : {}),
                ...(isSmallScreen ? theme.typography.sRegular : theme.typography.sRegular),
                fontSize: isSmallScreen ? '0.95rem' : undefined,
                wordBreak: isSmallScreen ? 'break-word' : undefined,
                textAlign: textAlign || 'left',
              }}
            >
              {handleCell(colKey, colType)}
            </TableCell>
          );
        })}

        {showMoreButton && (
          <TableCell sx={{ py: 1, px: 1, width: `calc(100% / ${columnsLength})` }}>
            <Button
              buttonVariant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onMoreButtonClick?.();
              }}
              iconOnly
              small
            >
              <Icon name="iconOverflow" width="3px" height="18px" />
            </Button>
          </TableCell>
        )}
      </TableRow>

      {variant === 'dropdown' && (
        <TableRow className={`${styles.additionalInfoContainer} ${expanded ? styles.expanded : ''}`}>
          <TableCell colSpan={columns.length + 1}>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
              <Box className={styles.additionalInfoContent}>
                {Array.isArray(additionalCells) &&
                  additionalCells.length > 0 &&
                  additionalCells.map((additionalCellKey: any, index: number) => {
                    const keyParam = `additional-cell-${index}`;
                    const additionalCellColType =
                      typeof additionalCellKey === 'string'
                        ? 'normal'
                        : additionalCellKey.type || 'normal';

                    return (
                      <Box key={keyParam} className={styles.additionalInfoContentItem}>
                        <Typography variant="h6">{additionalCellKey?.label}</Typography>
                        <Typography variant="body1">
                          {handleCell(additionalCellKey.id, additionalCellColType)}
                        </Typography>
                      </Box>
                    );
                  })}
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
