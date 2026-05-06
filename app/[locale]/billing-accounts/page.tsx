import { getTranslations } from 'next-intl/server';
import BillingAccounts from '@organisms/BillingAccounts/BillingAccounts';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('billingAccounts');
  
  return {
    title: `${t('billingAccounts')} - Standard Bank`,
    description: '',
  };
}

export default function BillingAccountsPage() {
  return <BillingAccounts />;
}
