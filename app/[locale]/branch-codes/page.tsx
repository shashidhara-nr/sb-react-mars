import { getTranslations } from 'next-intl/server';
import CountryHoliday from '@organisms/HolidayCalendar/CountryHoliday';
import BranchCodes from '@organisms/BranchCodes/BranchCodes';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('branchCodes');
  
  return {
    title: `${t('branchCodes')} - Standard Bank`,
    description: '',
  };
}

export default function BranchCodesPage() {
  return <BranchCodes />;
}
