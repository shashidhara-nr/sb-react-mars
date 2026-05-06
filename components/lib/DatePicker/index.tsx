// @ts-nocheck
"use client";

import CalendarSvg from 'public/icons/icn_calendar.svg';
import ChevronLeftColorSvg from 'public/icons/icn_chevron_left_color.svg';
import ChevronRightSvg from 'public/icons/icn_chevron_right.svg';
import DownIconSolidSvg from 'public/icons/icn_arrow_solid_down.svg';
import dayjs, { Dayjs } from 'dayjs';
import * as React from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Image from 'next/image';

// Custom icon components
const DownIcon = () => (
  <Image src={DownIconSolidSvg} alt="Down" width={10} height={10} />
);

const CalendarIconComponent = () => (
  <Image src={CalendarSvg} alt="Calendar" width={24} height={24} />
);

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// Custom calendar header for the popup, per Material 3 docked spec
interface CustomCalendarHeaderProps {
  currentMonth: dayjs.Dayjs;
  onMonthChange: (date: dayjs.Dayjs, slideDirection: 'left' | 'right') => void;
  disabled?: boolean;
  setIsSelectOpen?: (isOpen: boolean) => void;
  minDate?: dayjs.Dayjs | null;
  maxDate?: dayjs.Dayjs | null;
}

const CustomCalendarHeader: React.FC<CustomCalendarHeaderProps> = (props) => {
  const { currentMonth, onMonthChange, disabled, setIsSelectOpen, minDate, maxDate } = props;
  
  // Generate years based on minDate and maxDate if provided, otherwise use default range
  const minYear = minDate ? minDate.year() : 1900;
  const maxYear = maxDate ? maxDate.year() : 2100;
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);

  const handlePrevYear = () => {
    if (!disabled) onMonthChange(dayjs(currentMonth).subtract(1, 'year'), 'left');
  };
  const handleNextYear = () => {
    if (!disabled) onMonthChange(dayjs(currentMonth).add(1, 'year'), 'right');
  };
  const handlePrevMonth = () => {
    if (!disabled) onMonthChange(dayjs(currentMonth).subtract(1, 'month'), 'left');
  };
  const handleNextMonth = () => {
    if (!disabled) onMonthChange(dayjs(currentMonth).add(1, 'month'), 'right');
  };
  const handleYearSelect = (event: any) => {
    if (!disabled) {
      event.stopPropagation();
      onMonthChange(
        dayjs(currentMonth).year(Number(event.target.value)),
        'right'
      );
    }
  };
  const handleMonthSelect = (event: any) => {
    if (!disabled) {
      event.stopPropagation();
      onMonthChange(
        dayjs(currentMonth).month(Number(event.target.value)),
        'right'
      );
    }
  };
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      px={1}
      py={0.5}
      gap={0.5}
    >
      {/* Month Selector with Arrows and Dropdown (now on the left) */}
      <Box display="flex" alignItems="center" gap={0.25}>
        <IconButton
          size="small"
          onClick={handlePrevMonth}
          disabled={disabled}
          aria-label="Previous Month"
          sx={{ p: 0, border: 'none', minWidth: 0, background: 'none' }}
        >
          <Image
            src={ChevronLeftColorSvg}
            alt="Previous"
            width={14}
            height={14}
            style={{ display: 'block' }}
          />
        </IconButton>
        <Select
          value={dayjs(currentMonth).month()}
          onChange={handleMonthSelect}
          size="small"
          disabled={disabled}
          IconComponent={DownIcon}
          onOpen={() => setIsSelectOpen?.(true)}
          onClose={() => setIsSelectOpen?.(false)}
          sx={{
            fontSize: 14,
            height: 32,
            border: 'none',
            boxShadow: 'none',
            '. MuiOutlinedInput-notchedOutline': { border: 'none' },
            '.MuiSelect-select': { padding: '4px 12px' },
          }}
          MenuProps={{
            disablePortal: false,
            disableScrollLock: true,
            disableAutoFocusItem: true,
            disableEnforceFocus: true,
            disableRestoreFocus: true,
            keepMounted: false,
            style: {
              zIndex: 100001,
            },
            PaperProps: {
              sx: {
                margin: 0,
                padding: 0,
                maxHeight: 350,
                zIndex: 100001,
              },
              style: {
                zIndex: 100001,
              },
              onMouseDown: (e: React.MouseEvent) => e.stopPropagation(),
              onClick: (e: React.MouseEvent) => e.stopPropagation(),
            },
            MenuListProps: {
              sx: {
                maxHeight: 350,
                overflow: 'auto',
              },
              onMouseDown: (e: React.MouseEvent) => e.stopPropagation(),
              onClick: (e: React.MouseEvent) => e.stopPropagation(),
            },
            slotProps: {
              paper: {
                style: {
                  zIndex: 100001,
                },
              },
            },
            anchorOrigin: {
              vertical: 'bottom',
              horizontal: 'left',
            },
            transformOrigin: {
              vertical: 'top',
              horizontal: 'left',
            },
          }}
        >
          {monthNames.map((name, idx) => (
            <MenuItem
              key={name}
              value={idx}
              sx={{
                fontSize: 14,
                '&.Mui-selected, &.Mui-selected:hover': {
                  backgroundColor: '#003bb3',
                  border: '1px solid #003bb3',
                  color: '#fff',
                },
              }}
            >
              {name}
            </MenuItem>
          ))}
        </Select>
        <IconButton
          size="small"
          onClick={handleNextMonth}
          disabled={disabled}
          aria-label="Next Month"
          sx={{ p: 0, border: 'none', minWidth: 0, background: 'none' }}
        >
          <Image
            src={ChevronRightSvg}
            alt="Next"
            width={14}
            height={14}
            style={{ display: 'block' }}
          />
        </IconButton>
      </Box>
      {/* Year Selector with Arrows and Dropdown (now on the right) */}
      <Box display="flex" alignItems="center" gap={0.25}>
        <IconButton
          size="small"
          onClick={handlePrevYear}
          disabled={disabled}
          aria-label="Previous Year"
          sx={{ p: 0, border: 'none', minWidth: 0, background: 'none' }}
        >
          <Image
            src={ChevronLeftColorSvg}
            alt="Previous"
            width={14}
            height={14}
            style={{ display: 'block' }}
          />
        </IconButton>
        <Select
          value={dayjs(currentMonth).year()}
          onChange={handleYearSelect}
          size="small"
          disabled={disabled}
          IconComponent={DownIcon}
          onOpen={() => setIsSelectOpen?.(true)}
          onClose={() => setIsSelectOpen?.(false)}
          sx={{
            fontSize: 14,
            height: 32,
            border: 'none',
            boxShadow: 'none',
            '.MuiOutlinedInput-notchedOutline': { border: 'none' },
            '.MuiSelect-select': { padding: '4px 12px' },
          }}
          MenuProps={{
            disablePortal: false,
            disableScrollLock: true,
            disableAutoFocusItem: true,
            disableEnforceFocus: true,
            disableRestoreFocus: true,
            keepMounted: false,
            style: {
              zIndex: 100001,
            },
            PaperProps: {
              sx: {
                margin: 0,
                padding: 0,
                maxHeight: 350,
                zIndex: 100001,
              },
              style: {
                zIndex: 100001,
              },
              onMouseDown: (e: React.MouseEvent) => e.stopPropagation(),
              onClick: (e: React.MouseEvent) => e.stopPropagation(),
            },
            MenuListProps: {
              sx: {
                maxHeight: 350,
                overflow: 'auto',
              },
              onMouseDown: (e: React.MouseEvent) => e.stopPropagation(),
              onClick: (e: React.MouseEvent) => e.stopPropagation(),
            },
            slotProps: {
              paper: {
                style: {
                  zIndex: 100001,
                },
              },
            },
            anchorOrigin: {
              vertical: 'bottom',
              horizontal: 'left',
            },
            transformOrigin: {
              vertical: 'top',
              horizontal: 'left',
            },
          }}
        >
          {years.map((y) => (
            <MenuItem
              key={y}
              value={y}
              sx={{
                fontSize: 14,
                '&.Mui-selected, &.Mui-selected:hover': {
                  backgroundColor: '#003bb3',
                  border: '1px solid #003bb3',
                  color: '#fff',
                },
              }}
            >
              {y}
            </MenuItem>
          ))}
        </Select>
        <IconButton
          size="small"
          onClick={handleNextYear}
          disabled={disabled}
          aria-label="Next Year"
          sx={{ p: 0, border: 'none', minWidth: 0, background: 'none' }}
        >
          <Image
            src={ChevronRightSvg}
            alt="Next"
            width={14}
            height={14}
            style={{ display: 'block' }}
          />
        </IconButton>
      </Box>
    </Box>
  );
};

export interface DatePickerButton {
  label: string;
  variant?: 'primary' | 'secondary' | 'tertiary';
  onClick?: () => void;
}

export interface DatePickerProps {
  label?: string;
  onChange?: (date: unknown) => void;
  value?: unknown;
  actions?: DatePickerButton[];
  placeholder?: string;
  width?: string | number;
  height?: string | number;
  fullWidth?: boolean;
  minDate?: Date | null;
  maxDate?: Date | null;
}

interface CustomActionBarProps {
  actionsFromComponent: DatePickerButton[];
}

interface CustomActionBarPropsExtended extends CustomActionBarProps {
  onClose?: () => void;
}

const CustomActionBar = (props: CustomActionBarPropsExtended) => {
  const actions = props.actionsFromComponent || [];
  const { onClose } = props;
  if (!actions.length) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        bottom: 0,
        width: '100%',
        background: '#fff',
        zIndex: 2,
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'flex-end',
        textTransform: 'uppercase'
      }}
    >
      <ButtonGroup
        variant="text"
        color="primary"
        sx={{
          boxShadow: 'none',
          background: '#fff',
          gap: 2,
          '& > : first-of-type': {
            borderRight: 'none ! important',
          },
        }}
      >
        {actions.slice(0, 2).map((action: DatePickerButton, idx: number) => {
          let sx: React.CSSProperties = {
            fontSize: 14,
            textTransform: 'uppercase',
            borderRadius: 2,
            minWidth: 50,
            ...(idx === 0 ? { borderRight: 'none' } : {}),
          };
          let variant: 'contained' | 'outlined' | 'text' = 'text';
          if (action.variant === 'primary') {
            sx = {
              ...sx,
              backgroundColor: '#0051FF',
              color: '#fff',
            };
            variant = 'contained';
          } else if (action.variant === 'secondary') {
            sx = {
              ...sx,
              color: '#0051FF',
              border: '2px solid #0051FF',
            };
            variant = 'outlined';
          } else if (action.variant === 'tertiary') {
            sx = {
              ...sx,
              color: '#0051FF',
              border: 'none',
            };
            variant = 'text';
          }
          const handleClick = () => {
            action.onClick?.();
            onClose?.();
          };
          return (
            <Button
              key={action.label + idx}
              onClick={handleClick}
              sx={sx}
              variant={variant}
              fullWidth={false}
            >
              {action.label}
            </Button>
          );
        })}
      </ButtonGroup>
    </div>
  );
};

const DatePickerComponent: React.FC<DatePickerProps> = ({
  label = 'Basic date picker',
  onChange,
  value: valueProp,
  actions,
  placeholder,
  width,
  height = '48px',
  fullWidth = false,
  minDate = null,
  maxDate = null,
}) => {
  const [internalValue, setInternalValue] = React.useState<Dayjs | null>(
    valueProp && dayjs.isDayjs(valueProp) ? (valueProp as Dayjs) : null,
  );
  const [open, setOpen] = React.useState(false);
  const [isSelectOpen, setIsSelectOpen] = React.useState(false);
  
  const isControlled = valueProp !== undefined && valueProp !== null;
  const value = isControlled
    ? valueProp && dayjs.isDayjs(valueProp)
      ? (valueProp as Dayjs)
      : null
    : internalValue;

  const handleDateChange = (newValue: Dayjs | null) => {
    if (newValue) {
      if (!isControlled) setInternalValue(newValue);
      onChange?.(newValue);
    }
  };

  const defaultActions: DatePickerButton[] = [
    {
      label: 'Tertiary Button',
      variant: 'tertiary',
      onClick: () => alert('Tertiary Button Clicked'),
    },
    {
      label: 'Tertiary Button',
      variant: 'tertiary',
      onClick: () => alert('Tertiary Button Clicked'),
    },
  ];
  const actionsToUse = actions && actions.length > 0 ? actions : defaultActions;

  // Custom day renderer to highlight today
  const renderDay = (props: PickersDayProps<Dayjs>) => {
    // eslint-disable-next-line react/prop-types
    const isToday = dayjs().isSame(props.day, 'day');
    return (
      <PickersDay
        {...props}
        sx={{
          // eslint-disable-next-line react/prop-types
          ...props.sx,
          ...(isToday && {
            border: '2px solid #0051FF',
            borderRadius: '50%',
          }),
        }}
      />
    );
  };

  // ✅ Calculate final width
  const finalWidth = fullWidth ? '100%' : width || 'auto';

  // Custom handler to prevent closing when clicking on Select elements
  const handleClose = (event?: any, reason?: string) => {
    // Don't close if a Select menu is open
    if (isSelectOpen) {
      return;
    }
    
    // Don't close if clicking on Select or MenuItem
    if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
      const target = event?.target as HTMLElement;
      if (target) {
        // Check if click is on Select, MenuItem, or their children
        const isSelectClick = target.closest('.MuiSelect-root') || 
                             target.closest('.MuiMenuItem-root') ||
                             target.closest('[role="listbox"]') ||
                             target.closest('[role="presentation"]');
        if (isSelectClick) {
          return; // Don't close
        }
      }
    }
    setOpen(false);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          width: finalWidth,
          '& .MuiTextField-root': {
            width: finalWidth,
          },
        }}
      >
        <DatePicker
          showDaysOutsideCurrentMonth
          label={label}
          value={value}
          onChange={handleDateChange}
          open={open}
          onOpen={() => setOpen(true)}
          onClose={handleClose}
          format="DD/MM/YYYY"
          closeOnSelect={false}
          minDate={minDate ? dayjs(minDate) : undefined}
          maxDate={maxDate ? dayjs(maxDate) : undefined}
          slots={{
            calendarHeader: CustomCalendarHeader,
            actionBar: (props) => (
              <CustomActionBar
                {...props}
                actionsFromComponent={actionsToUse}
                onClose={() => setOpen(false)}
              />
            ),
            openPickerIcon: CalendarIconComponent,
            day: renderDay,
          }}
          slotProps={{
            calendarHeader: {
              setIsSelectOpen: setIsSelectOpen,
              minDate: minDate ? dayjs(minDate) : null,
              maxDate: maxDate ? dayjs(maxDate) : null,
            },
            openPickerIcon: {
              // ✅ Size the calendar icon to 24x24
              sx: {
                width: '24px ! important',
                height: '24px !important',
              },
            },
            openPickerButton: {
              // ✅ Size the icon button container
              onClick: () => setOpen(true),
              sx: {
                padding: '8px',
                '& svg': {
                  width: '24px !important',
                  height: '24px !important',
                },
              },
            },
            popper: {
              placement: 'bottom-start',
              disablePortal: false,
              disableRestoreFocus: true,
              disableEnforceFocus: true,
              sx: {
                zIndex: 99999,
                '& .MuiPaper-root': {
                  backgroundColor: '#fff',
                  minWidth: 280,
                  maxWidth: '100%',
                  height: 'auto',
                  padding: 2,
                },
                '& .MuiPickersDay-root': {
                  fontSize: 14,
                },
                '& .MuiPickersDay-root.Mui-selected': {
                  backgroundColor: '#0051FF',
                  color: '#fff',
                  border: '1px solid #0051FF',
                  boxSizing: 'border-box',
                },
                '& .MuiPickersDay-root.Mui-selected:hover': {
                  backgroundColor: '#003bb3',
                  border: '1px solid #003bb3',
                },
                '& .MuiPickersDay-root.Mui-selected: focus': {
                  backgroundColor: '#003bb3',
                  border: '1px solid #003bb3',
                },
                '& .MuiYearCalendar-button. Mui-selected: hover': {
                  backgroundColor: '#003bb3',
                  border: '1px solid #003bb3',
                  color: '#fff',
                },
                '& .MuiYearCalendar-button.Mui-selected:focus': {
                  backgroundColor: '#003bb3',
                  border: '1px solid #003bb3',
                  color: '#fff',
                },
                '& .MuiPickersDay-root.MuiPickersDay-dayOutsideMonth': {
                  color: '#697786',
                  backgroundColor: 'transparent',
                  pointerEvents: 'none',
                  opacity: 0.5,
                },
              },
            },
            textField: {
              fullWidth: fullWidth,
              placeholder,
              onClick: () => setOpen(true),
              sx: {
                width: finalWidth,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px ! important',
                  '& fieldset': {
                    borderRadius: '8px !important',
                  },
                },
              },
              InputProps: {
                sx: {
                  fontSize: '16px',
                  height: height,
                  width: finalWidth,
                  borderRadius: '8px !important',
                  cursor: 'pointer',
                  // ✅ Target the calendar icon button specifically
                  '& .MuiIconButton-root': {
                    padding: '8px',
                    '& svg': {
                      width: '24px !important',
                      height: '24px !important',
                    },
                  },
                },
              },
              inputProps: {
                style: {
                  fontSize: '16px',
                  height: height,
                  cursor: 'pointer',
                },
              },
            },
          }}
          openTo="day"
          views={['day']}
          disableFuture={false}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default DatePickerComponent;
