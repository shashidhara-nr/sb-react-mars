import ServiceAgreementsDetails from '@organisms/ServiceAgreements/ServiceAgreementsDetails';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('serviceAgreements');
  
  return {
    title: `${t('serviceAgreementDetails')} - Standard Bank`,
    description: '',
  };
}

export default async function ServiceAgreementsDetailsPage({ 
  params 
}: { 
  params: Promise<{ locale: string; id: string }> 
}) {
  const { id } = await params;
  return <ServiceAgreementsDetails id={id} />;
}
