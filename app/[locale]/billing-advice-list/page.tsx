import { getTranslations } from 'next-intl/server';
import BillingAdviceList from '@organisms/BillingAdviceList/BillingAdviceList';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('billingAdviceList');
  
  return {
    title: `${t('billingAdviceList')} - Standard Bank`,
    description: '',
  };
}

export default function BillingAdviceListPage() {
  return <BillingAdviceList />;
}
