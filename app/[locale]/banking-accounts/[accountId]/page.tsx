import { getTranslations } from 'next-intl/server';
import ManageBankAccountWrapper from './ManageBankAccountWrapper';

export async function generateMetadata({ params }: { params: Promise<{ locale: string; accountId: string }> }) {
    const { locale, accountId } = await params;
    const t = await getTranslations('bankingAccounts');
    return {
        title: `${t('bankAccountDetails')} - Standard Bank`,
        description: '',
    };
}

export default async function ManageBankAccountPage({ params }: { params: Promise<{ accountId: string }> }) {
    const { accountId } = await params;
    return <ManageBankAccountWrapper accountId={accountId} />;
}
