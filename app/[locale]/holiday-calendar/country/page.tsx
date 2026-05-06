import { getTranslations } from 'next-intl/server';
import CountryHoliday from '@organisms/HolidayCalendar/CountryHoliday';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('holidayCalendar');
  
  return {
    title: `${t('countryHolidayCalendar')} - Standard Bank`,
    description: '',
  };
}

export default function CountryHolidayCalendarPage() {
  return <CountryHoliday />;
}
