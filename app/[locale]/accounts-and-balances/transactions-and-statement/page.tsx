import { getTranslations } from 'next-intl/server';
import AccountsAndBalancesDetail from '@organisms/AccountsAndBalancesList/AccountsAndBalancesDetail';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('accountsAndBalances');
  
  return {
    title: `${t('accountDetails')} - Standard Bank`,
    description: '',
  };
}

export default function TransactionsAndStatementPage() {
  return <AccountsAndBalancesDetail />;
}
