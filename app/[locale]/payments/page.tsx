import { getTranslations } from 'next-intl/server';
import PaymentList from '@organisms/PaymentList/PaymentList';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('payments');
  
  return {
    title: `${t('payments')} - Standard Bank`,
    description: '',
  };
}

export default function PaymentsPage() {
  return <PaymentList />;
}
