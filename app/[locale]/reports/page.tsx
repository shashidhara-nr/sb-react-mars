import { getTranslations } from 'next-intl/server';
import ReportList from '@organisms/ReportList/ReportList';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('reports');

  return {
    title: `${t('reports')} - Standard Bank`,
    description: '',
  };
}

export default function ReportPage() {
  return <ReportList />;
}
