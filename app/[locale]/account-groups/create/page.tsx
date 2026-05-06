import { getTranslations } from 'next-intl/server';
import CreateAccountGroups from '@organisms/AccountsGroups/CreateAccountGroup';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('accountGroups');

  return {
    title: `${t('addAccountGroup')} - Standard Bank`,
    description: '',
  };
}

export default function CreateAccountGroupsPage() {
  return <CreateAccountGroups />;
}
