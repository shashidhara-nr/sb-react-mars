import { getTranslations } from 'next-intl/server';
import ManageBankAccount from '@organisms/BankingAccounts/ManageBankAccount';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('bankingAccounts');
  return {
    title: `${t('bankAccountDetails')} - Standard Bank`,
    description: '',
  };
}

export default function ManageBankAccountPage() {
  return <ManageBankAccount />;
}
