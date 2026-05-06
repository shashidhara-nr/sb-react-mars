import MyBills from '@organisms/MyBills/MyBills';
import { getTranslations } from 'next-intl/server';


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('myBills');

  return {
    title: `${t('myBills')} - Standard Bank`,
    description: '',
  };
}

export default function MyBillsPage() {
  return <MyBills />;
}
