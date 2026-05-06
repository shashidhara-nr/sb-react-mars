import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export const getWeekDates = (date: Date | string = new Date()) => {
  const d = dayjs(date);
  const weekStart = d.startOf('week').toDate();
  const weekEnd = d.endOf('week').toDate();

  return {
    start: d.startOf('week').format('DD/MM/YYYY'),
    end: d.endOf('week').format('DD/MM/YYYY'),
    startDate: weekStart,
    endDate: weekEnd,
  };
};

export const getMonthDates = (date: Date | string = new Date()) => {
  const d = dayjs(date);
  return {
    start: d.startOf('month').format('DD/MM/YYYY'),
    end: d.endOf('month').format('DD/MM/YYYY'),
    startDate: d.startOf('month').toDate(),
    endDate: d.endOf('month').toDate(),
  };
};

export const getDayDates = (date: Date | string = new Date()) => {
  const d = dayjs(date);
  return {
    start: d.format('DD/MM/YYYY'),
    end: d.format('DD/MM/YYYY'),
    startDate: d.toDate(),
    endDate: d.toDate(),
  };
};

export const isDateInRange = (
  dateToCheck: string | Date,
  startDate: string | Date,
  endDate: string | Date
): boolean => {
  const check = dayjs(dateToCheck).format('YYYY-MM-DD');
  const start = dayjs(startDate).format('YYYY-MM-DD');
  const end = dayjs(endDate).format('YYYY-MM-DD');

  return check >= start && check <= end;
};

export const formatDateRange = (startDate: string | Date, endDate: string | Date): string => {
  const start = dayjs(startDate).format('MMM DD');
  const end = dayjs(endDate).format('MMM DD, YYYY');
  return `${start} - ${end}`;
};
