import BillingAdviceDetails from '@organisms/BillingAdviceList/BillingAdviceDetails';
import MyBillsDetails from '@organisms/MyBills/MyBillsDetails';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('myBills');
  
  return {
    title: `${t('myBillsDetails')} - Standard Bank`,
    description: '',
  };
}

export default function MyBillsDetailsPage() {
  return <MyBillsDetails />;
}
