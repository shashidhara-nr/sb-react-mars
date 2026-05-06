import { getTranslations } from 'next-intl/server';
import CreateBillingAccounts from '@organisms/BillingAccounts/CreateBillingAccounts';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('billingAccounts');
  
  return {
    title: `${t('addBillingAccount')} - Standard Bank`,
    description: '',
  };
}

export default function CreateBillingAccountsPage() {
  return <CreateBillingAccounts />;
}
