import { getTranslations } from 'next-intl/server';
import TransfersList from '@organisms/TransfersList/TransfersList';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('transfers');
  
  return {
    title: `${t('transfers')} - Standard Bank`,
    description: '',
  };
}

export default function TransfersPage() {
  return <TransfersList />;
}
