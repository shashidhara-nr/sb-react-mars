import { getTranslations } from 'next-intl/server';
import ServiceAgreements from '@organisms/ServiceAgreements/ServiceAgreements';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('serviceAgreements');
  
  return {
    title: `${t('serviceAgreements')} - Standard Bank`,
    description: '',
  };
}

export default function ServiceAgreementsPage() {
  return <ServiceAgreements />;
}
