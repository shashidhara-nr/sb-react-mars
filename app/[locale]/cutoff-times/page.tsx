import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import CutoffTimes from '@organisms/CutoffTimes/CutoffTimes';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('cutoffTimes');

  return {
    title: `${t('cutoffTimes')} - Standard Bank`,
    description: '',
  };
}

export default function CutoffTimesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CutoffTimes />
    </Suspense>
  );
}
