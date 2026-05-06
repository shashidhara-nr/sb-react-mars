import { getTranslations } from 'next-intl/server';
import ManageAccountGroups from '@organisms/AccountsGroups/ManageAccountGroups';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('accountGroups');

  return {
    title: `${t('manageAccountGroup')} - Standard Bank`,
    description: '',
  };
}

export default function ManageAccountGroupsPage() {
  return <ManageAccountGroups />;
}
