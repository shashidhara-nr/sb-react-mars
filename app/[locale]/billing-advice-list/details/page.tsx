import BillingAdviceDetails from '@organisms/BillingAdviceList/BillingAdviceDetails';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('billingAdviceList');
  
  return {
    title: `${t('billingAdviceDetails')} - Standard Bank`,
    description: '',
  };
}

export default function BillingAdviceDetailsPage() {
  return <BillingAdviceDetails />;
}
