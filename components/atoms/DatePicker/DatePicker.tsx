import React from 'react';
import { LocalizationProvider, DatePicker as MuiDatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

export interface DatePickerProps {
  name: string;
  label?: string;
  placeholder?: string;
  value: any;
  onChange: (name: string, value: string) => void;
  error?: boolean;
  helperText?: string;
  onBlur?: () => void;
  disabled?: boolean;
  sx?: any;
  dataTestId?: string;
  minDate?: Dayjs;
  maxDate?: Dayjs;
}

const DatePicker: React.FC<DatePickerProps> = ({
  name,
  label,
  placeholder,
  value,
  onChange,
  error,
  helperText,
  onBlur,
  disabled,
  sx,
  dataTestId,
  minDate,
  maxDate,
}) => {
  const handleDateChange = (newValue: Dayjs | null) => {
    const formattedDate = newValue ? newValue.format('YYYY-MM-DD') : '';
    onChange(name, formattedDate);
  };

  const dayjsValue = value ? dayjs(value) : null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <MuiDatePicker
        label={label}
        value={dayjsValue}
        onChange={handleDateChange}
        format="DD/MM/YYYY"
        minDate={minDate}
        maxDate={maxDate}
        slotProps={{
          textField: {
            fullWidth: true,
            error: Boolean(error),
            helperText: helperText || '',
            placeholder: placeholder,
            size: 'small',
            sx: {
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                height: '48px',
              },
              '& .MuiOutlinedInput-root.Mui-disabled': {
                backgroundColor: '#F5F5F5',
              },
              ...(sx || {}),
            },
          } as any,
        }}
        disabled={disabled}
        onClose={onBlur}
      />
    </LocalizationProvider>
  );
};

export default DatePicker;
