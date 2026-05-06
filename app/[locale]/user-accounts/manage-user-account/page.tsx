import ManageUserAccount from '@organisms/UserAccounts/ManageUserAccount';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('userAccounts');
  
  return {
    title: `${t('manage')} ${t('userAccount')?.toLocaleLowerCase()} - Standard Bank`,
    description: '',
  };
}

export default function ManageUserAccountPage() {
  return <ManageUserAccount />;
}
