import ServiceAgreementsDetailsService from '@organisms/ServiceAgreements/ServiceAgreementsDetailsService';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('serviceAgreements');
  
  return {
    title: `${t('serviceAgreementDetails')} - Standard Bank`,
    description: '',
  };
}

export default function ServiceAgreementsDetailsServicePage() {
  return <ServiceAgreementsDetailsService />;
}
