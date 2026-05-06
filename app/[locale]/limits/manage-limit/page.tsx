import ManageLimit from '@organisms/Limits/ManageLimit';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('limits');
  
  return {
    title: `${t('manage')} ${t('limit')?.toLocaleLowerCase()} - Standard Bank`,
    description: '',
  };
}

export default function ManageLimitPage() {
  return <ManageLimit />;
}
