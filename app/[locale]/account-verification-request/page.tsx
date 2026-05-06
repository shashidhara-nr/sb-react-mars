import { getTranslations } from 'next-intl/server';
import AccountVerificationRequest from '@organisms/AccountVerificationRequest/AccountVerificationRequest';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('accountVerificationRequest');
  
  return {
    title: `${t('accountVerificationRequest')} - Standard Bank`,
    description: '',
  };
}

export default function AccountVerificationRequestPage() {
  return <AccountVerificationRequest />;
}
