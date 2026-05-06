import { getTranslations } from 'next-intl/server';
import FindTransactionsList from '@organisms/FindTransactionsList/FindTransactionsList';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {  
  const { locale } = await params;
  const t = await getTranslations('findTransaction');

  return {
    title: `${t('findTransaction')} - Standard Bank`,
    description: '',
  };
}

export default function FindTransactionsPage() {
  return <FindTransactionsList />;
}
