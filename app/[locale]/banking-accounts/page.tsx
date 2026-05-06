import { getTranslations } from 'next-intl/server';
import BankingAccounts from '@organisms/BankingAccounts/BankingAccounts';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('bankingAccounts');
  
  return {
    title: `${t('bankingAccounts')} - Standard Bank`,
    description: '',
  };
}

export default function BankingAccountsPage() {
  return <BankingAccounts />;
}
