
import MyBillsPay from '@organisms/MyBills/MyBillsPay';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('myBills');
  
  return {
    title: `${t('myBillsPay')} - Standard Bank`,
    description: '',
  };
}

export default function MyBillsDetailsPage() {
  return <MyBillsPay />;
}
