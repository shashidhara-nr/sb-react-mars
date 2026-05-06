import { getTranslations } from 'next-intl/server';
import Limits from '@organisms/Limits/Limits';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('limits');
  
  return {
    title: `${t('limits')} - Standard Bank`,
    description: '',
  };
}

export default function LimitsPage() {
  return <Limits />;
}
