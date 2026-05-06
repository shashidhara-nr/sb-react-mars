import { getTranslations } from 'next-intl/server';
import VerificationRequestDetails from '@organisms/AccountVerificationRequest/VerificationRequestDetails';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('accountVerificationRequest');
  
  return {
    title: `${t('verificationRequestDetails')} - Standard Bank`,
    description: '',
  };
}

export default function VerificationRequestDetailsPage() {
  return <VerificationRequestDetails />;
}
