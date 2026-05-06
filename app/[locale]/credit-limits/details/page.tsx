import { getTranslations } from 'next-intl/server';
import CreditLimitsDetail from '@organisms/CreditLimits/CreditLimitsDetail';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('limits');
  
  return {
    title: `${t('creditLimits')} - Standard Bank`,
    description: '',
  };
}

export default function CreditLimitsDetailPage() {
  return <CreditLimitsDetail />;
}
