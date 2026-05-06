import { getTranslations } from 'next-intl/server';
import TransactionalAuthProfiles from '@organisms/TransactionalAuthProfiles/TransactionalAuthProfiles';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('transactionalAuthProfiles');
  
  return {
    title: `${t('transactionalAuthProfiles')} - Standard Bank`,
    description: '',
  };
}

export default function TransactionalAuthProfilesPage() {
  return <TransactionalAuthProfiles />;
}
