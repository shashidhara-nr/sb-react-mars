'use client';

import ManageBankAccount from '@organisms/BankingAccounts/ManageBankAccount';

interface ManageBankAccountWrapperProps {
    accountId: string;
}

export default function ManageBankAccountWrapper({ accountId }: ManageBankAccountWrapperProps) {
    return <ManageBankAccount accountIdParam={accountId} />;
}
