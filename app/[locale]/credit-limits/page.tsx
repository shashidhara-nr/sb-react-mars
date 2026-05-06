import { getTranslations } from 'next-intl/server';
import CreditLimits from '@organisms/CreditLimits/CreditLimits';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('limits');
  
  return {
    title: `${t('creditLimits')} - Standard Bank`,
    description: '',
  };
}

export default function CreditLimitsPage() {
  return <CreditLimits />;
}
