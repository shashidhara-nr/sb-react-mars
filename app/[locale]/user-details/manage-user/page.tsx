import { getTranslations } from 'next-intl/server';
import ManageUser from '@organisms/UserDetails/ManageUser';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('userDetails');
  
  return {
    title: `${t('manageUser')} - Standard Bank`,
    description: '',
  };
}

export default function ManageUserPage() {
  return <ManageUser />;
}
