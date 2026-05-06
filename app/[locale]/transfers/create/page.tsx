import { getTranslations } from 'next-intl/server';
import CreateTransfers from '@organisms/TransfersList/CreateTransfers';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('transfers');
  
  return {
    title: `${t('createATransfer')} - Standard Bank`,
    description: '',
  };
}

export default function CreateTransfersPage() {
  return <CreateTransfers />;
}
