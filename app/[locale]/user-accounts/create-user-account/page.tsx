import { getTranslations } from 'next-intl/server';
import CreateUserAccount from '@organisms/UserAccounts/CreatUserAccount';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('userAccounts');
  
  return {
    title: `${t('createAUserAccount')} - Standard Bank`,
    description: '',
  };
}

export default function CreateUserAccountPage() {
  return <CreateUserAccount />;
}
