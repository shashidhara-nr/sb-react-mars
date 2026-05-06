import { getTranslations } from 'next-intl/server';
import UnpaidOptionList from '@organisms/UnpaidOptionList/UnpaidOptionList';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('unpaid');
  
  return {
    title: `${t('unpaidOptions')} - Standard Bank`,
    description: '',
  };
}

export default function UnpaidPage() {
  return <UnpaidOptionList />;
}
