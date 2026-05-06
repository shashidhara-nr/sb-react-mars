import { getTranslations } from 'next-intl/server';
import CompanyDetails from '@organisms/CompanyDetails/CompanyDetails';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('companyDetails');
  
  return {
    title: `${t('companyDetails')} - Standard Bank`,
    description: '',
  };
}

export default function CompanyDetailsPage() {
  return <CompanyDetails />;
}
