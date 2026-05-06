import { getTranslations } from 'next-intl/server';
import AccountGroups from '@organisms/AccountsGroups/AccountGroups';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('accountGroups');

  return {
    title: `${t('accountGroups')} - Standard Bank`,
    description: '',
  };
}

export default function AccountGroupsPage() {
  return <AccountGroups />;
}
