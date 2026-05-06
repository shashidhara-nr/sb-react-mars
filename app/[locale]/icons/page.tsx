import IconsList from '@organisms/IconsList/IconsList';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('icons');
  
  return {
    title: `${t('icons')} - Standard Bank`,
    description: '',
  };
}

export default function IconsPage() {
  return <IconsList />;
}
