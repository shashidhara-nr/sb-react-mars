import { getTranslations } from 'next-intl/server';
import UserAccounts from '@organisms/UserAccounts/UserAccounts';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('userAccounts');
  
  return {
    title: `${t('userAccounts')} - Standard Bank`,
    description: '',
  };
}

export default function UserAccountsPage() {
  return <UserAccounts />;
}
