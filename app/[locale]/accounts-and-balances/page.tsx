import { getTranslations } from 'next-intl/server';
import AccountsAndBalancesList from '@organisms/AccountsAndBalancesList/AccountsAndBalancesList';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('accountsAndBalances');
  
  return {
    title: `${t('accountsAndBalances')} - Standard Bank`,
    description: '',
  };
}

export default function AccountsAndBalancesPage() {
  return <AccountsAndBalancesList />;
}
