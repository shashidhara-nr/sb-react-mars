import { getTranslations } from 'next-intl/server';
import ManageBillingAccounts from '@organisms/BillingAccounts/ManageBillingAccounts';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('billingAccounts');
  
  return {
    title: `${t('manageBillingAccount')} - Standard Bank`,
    description: '',
  };
}

export default function ManageBillingAccountsPage() {
  return <ManageBillingAccounts />;
}
