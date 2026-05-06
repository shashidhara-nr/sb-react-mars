import { getTranslations } from 'next-intl/server';
import CurrencyHoliday from '@organisms/HolidayCalendar/CurrencyHoliday';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('holidayCalendar');
  
  return {
    title: `${t('currencyHolidayCalendar')} - Standard Bank`,
    description: '',
  };
}

export default function CurrencyHolidayCalendarPage() {
  return <CurrencyHoliday />;
}
