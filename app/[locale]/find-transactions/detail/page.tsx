import TransactionDetails from '@organisms/FindTransactionsList/TransactionDetails';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('findTransaction');
  
  return {
    title: `${t('transactionDetails')} - Standard Bank`,
    description: '',
  };
}

export default function TransactionDetailPage() {
  return <TransactionDetails />;
}
