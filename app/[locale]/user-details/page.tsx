import { getTranslations } from 'next-intl/server';
import UserDetails from '@organisms/UserDetails/UserDetails';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('userDetails');
  
  return {
    title: `${t('userDetails')} - Standard Bank`,
    description: '',
  };
}

export default function UserDetailsPage() {
  return <UserDetails />;
}
