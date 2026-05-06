import { getTranslations } from 'next-intl/server';
import SFIUploads from '@organisms/SFIUploads/SFIUploads';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('sfiUploads');
  
  return {
    title: `${t('sfiUploads')} - Standard Bank`,
    description: '',
  };
}

export default function SFIUploadsPage() {
  return <SFIUploads />;
}
