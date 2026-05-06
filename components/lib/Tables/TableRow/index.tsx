// @ts-nocheck
import {
  TableRow,
  TableCell,
  Checkbox,
  IconButton,
  Collapse,
  Box,
  useTheme,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import Button from '../../Forms/Button';
import StatusLabel from '../../StatusLabel';
import { Icon } from '@atoms/index';
import styles from './TableRow.module.scss';

interface DataTableRowProps<T = Record<string, unknown>> {
  row: T;
  columns: (
    | string
    | {
      key: string;
      type?:
      | 'account'
      | 'normal'
      | 'link'
      | 'status'
      | 'chip'
      | 'button'
      | 'more'
      | undefined;
    }
  )[];
  variant: 'default' | 'dropdown' | 'checkbox';
  isSelected?: boolean;
  onSelect?: () => void;
  showMoreButton?: boolean;
  onButtonClick?: () => void;
  onRowClick?: () => void;
  onQuickLinkClick?: (link: any) => void;
  onMoreButtonClick?: () => void;
  onRowDropdownClick?: (rowId: string, expanded: boolean) => void;
  expandedRowId?: string | null;
  singleRowExpansion?: boolean;
  statusLabel?: string;
  statusTheme?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  // For account type column
  accountIcon?: React.ReactElement;
  className?: string;
  style?: React.CSSProperties;
  headCells?: any[];
  additionalCellsProps?: {
    additionalCellsStyle?: SxProps;
    expandIconAtStart?: boolean;
    removeDefaultStyle?: boolean;
  };
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
  expandedRowId,
  singleRowExpansion = false,
  additionalCellsProps = {}
}: DataTableRowProps<T> & { isSmallScreen?: boolean }) {
  const theme = useTheme();
  const [localExpanded, setLocalExpanded] = useState(false);
  const rowId = (row as Record<string, any>)?.id;
  // Use prop-driven state if singleRowExpansion is enabled, otherwise use local state
  const expanded = singleRowExpansion ? expandedRowId === rowId : localExpanded;
  const columnsLength = columns.length + 1;
  const {
    additionalCellsStyle = {},
    expandIconAtStart = true,
    removeDefaultStyle = false,
  } = additionalCellsProps;
  const handleCell = (
    colKey: string,
    colType?:
      | 'account'
      | 'normal'
      | 'link'
      | 'status'
      | 'chip'
      | 'button'
      | 'more'
      | undefined,
  ) => {
    if (colType === 'account') {
      const value = (row as Record<string, any>)[colKey] || {};
      const { name, icon, ...rest } = value;
      // icon: use value.icon if present, else fallback to accountIcon prop if present, else nothing
      const iconNode = icon ? icon : accountIcon || null;
      // Render all string fields as lines (except icon)
      const lines = Object.entries({ name, ...rest })
        .filter(([, v]) => typeof v === 'string' && v)
        .map(([k, v], idx) => (
          <Typography
            key={k}
            variant={idx === 0 ? undefined : 'body2'}
            sx={{
              ...(idx === 0
                ? theme.typography.sMedium
                : theme.typography.xsRegular),
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
    } else if (colType === 'chip') {
      const value = (row as Record<string, any>)[colKey];
      if (isSmallScreen) {
        // On small screens, just render the value as text if it's an object, else as string
        if (value && typeof value === 'object' && 'value' in value) {
          return <span>{String(value?.value)}</span>;
        }
        return <span>{String(value)}</span>;
      }
      return <StatusLabel text={value?.value} paletteColor={value?.color} />;
    } else if (colType === 'link') {
      const value = (row as Record<string, any>)[colKey];
      if (value && typeof value === 'object' && value.href) {
        return (
          <span
            onClick={() =>
              onQuickLinkClick?.((row as Record<string, any>)[colKey])
            }
            style={{
              color: theme.palette.secondary.main,
              fontWeight: 500,
              fontSize: '12px',
              textDecoration: 'none',
              cursor: 'pointer',
            }}
          >
            {value.text || value.href}
          </span>
        );
      } else if (value && Array.isArray(value)) {
        return (
          <section
            style={{
              display: 'flex',
              gap: '1rem'
            }}
          >
            {value?.map((link: any, index: number) => {
              const keyParam = `${link}-${index}`;
              return (
                <span
                  key={keyParam}
                  onClick={() => onQuickLinkClick?.(link)}
                  style={{
                    color: theme.palette.secondary.main,
                    fontWeight: 500,
                    fontSize: '12px',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    display: 'block',
                  }}
                >
                  {link.text || link.href}
                </span>
              );
            })}
          </section>
        );
      }
      return <span>{String(value || '')}</span>;
    } else {
      const value = (row as Record<string, any>)[colKey];

      // ✅ Special handling for collapsed additional section values
      if (
        typeof value === 'number' ||
        (typeof value === 'string' && value !== '' && !isNaN(Number(value)))
      ) {
        return <span>{value}</span>;
      }

      // ✅ Default behaviour (unchanged)
      return <span>{String(value ?? '')}</span>;
    }
    // TODO: Will remove the below code once we confirm that the new handling for numbers in the additional section works as expected.
    // else {
    //   return <span>{String((row as Record<string, any>)[colKey] || '')}</span>;
    // }
  };
  return (
    <>
      <TableRow
        className={className}
        style={style}
        sx={{
          borderBottom: `1px solid ${theme.palette.grey[300]}`,
          transition: 'border-color 0.3s ease',
          borderLeft: expanded
            ? `2px solid #0033AA`
            : '',
          cursor: onRowClick ? 'pointer' : undefined,
        }}
        onClick={onRowClick}
      >
        {variant === 'checkbox' && (
          <TableCell
            sx={{
              padding: '0px',
              width: '40px',
            }}
          >
            <Checkbox checked={isSelected} onChange={onSelect} />
          </TableCell>
        )}
        {variant === 'dropdown' && expandIconAtStart && (
          <TableCell padding="checkbox">
            <IconButton
              onClick={() => {
                const rowId = (row as Record<string, any>)?.id;
                if (singleRowExpansion) {
                  onRowDropdownClick?.(rowId, !expanded);
                } else {
                  setLocalExpanded(!localExpanded);
                  onRowDropdownClick?.(rowId, !localExpanded);
                }
              }}
              sx={{
                '&:hover': {
                  backgroundColor: 'transparent',
                },
                '&:active': {
                  backgroundColor: 'transparent',
                },
              }}
            >
              <Box
                sx={{
                  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: '0.3s',
                }}
              >
                <Icon name="arrow" width="16px" height="16px" bgColor='#0051FF' />
              </Box>
            </IconButton>
          </TableCell>
        )}
        {columns.map((column, colIndex) => {
          const colKey = typeof column === 'string' ? column : column.key;
          const colType =
            typeof column === 'string' ? 'normal' : column.type || 'normal';
          const isFirstCol = colIndex === 0;
          const columnObj = headCells?.find((col) => col.id === colKey);
          const textAlign = columnObj?.textAlign
          return (
            <TableCell
              sx={{
                py: isSmallScreen ? 1.5 : 2.125,
                px: isSmallScreen ? 1 : 2,
                ...(isFirstCol && variant === 'checkbox' ? { pl: '10px' } : {}),
                ...(isSmallScreen
                  ? theme.typography.sRegular
                  : theme.typography.sRegular),
                fontSize: isSmallScreen ? '0.95rem' : undefined,
                wordBreak: isSmallScreen ? 'break-word' : undefined,
                textAlign: textAlign || 'left',
              }}
              key={colIndex}
            >
              {handleCell(colKey, colType)}
            </TableCell>
          );
        })}

        {/* {status && (
          <TableCell sx={{ py: 1, width: `calc(100% / ${columnsLength})` }}>
            <StatusLabel text={statusLabel} paletteColor={statusTheme} />
          </TableCell>
        )} */}

        {showMoreButton && (
          <TableCell
            sx={{ py: 1, px: 1, width: `calc(100% / ${columnsLength})` }}
          >
            <Button
              buttonVariant="secondary"
              onClick={onMoreButtonClick}
              iconOnly
              small
            >
              {<Icon name="iconOverflow" width="3px" height="18px" />}
            </Button>
          </TableCell>
        )}

        {variant === 'dropdown' && !expandIconAtStart && (
          <TableCell padding="checkbox">
            <IconButton
              onClick={() => {
                const rowId = (row as Record<string, any>)?.id;
                if (singleRowExpansion) {
                  onRowDropdownClick?.(rowId, !expanded);
                } else {
                  setLocalExpanded(!localExpanded);
                  onRowDropdownClick?.(rowId, !localExpanded);
                }
              }}
              sx={{
                '&:hover': {
                  backgroundColor: 'transparent',
                },
                '&:active': {
                  backgroundColor: 'transparent',
                },
              }}
            >
              <Box
                sx={{
                  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: '0.3s',
                }}
              >
                <Icon name="arrow" width="16px" height="16px" bgColor='#0051FF' />
              </Box>
            </IconButton>
          </TableCell>
        )}
      </TableRow>
      {/*This is a placeholder component until we get the dropdown finalised*/}
      {variant === 'dropdown' && (
        <TableRow
          className={`${removeDefaultStyle ? '' : styles.additionalInfoContainer} ${expanded ? styles.expanded : ''}`}
        >
          <TableCell colSpan={columns.length + 1}>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
              <Box className={styles.additionalInfoContent} sx={{ ...additionalCellsStyle }}>
                {Array?.isArray(additionalCells) &&
                  additionalCells?.length > 0 &&
                  additionalCells.map((additionalCellKey: any, index: number) => {
                    const keyParam = `additional-cell-${index}`;
                    const additionalCellColType =
                      typeof additionalCellKey === 'string'
                        ? 'normal'
                        : additionalCellKey.type || 'normal';
                    return (
                      <Box
                        key={keyParam}
                        className={removeDefaultStyle ? '' : styles.additionalInfoContentItem}
                      >
                        <Typography variant={additionalCellKey?.labelVariant || 'h6'}>
                          {additionalCellKey?.label}
                        </Typography>
                        <Typography variant={additionalCellKey?.valueVariant || 'body1'}>
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
