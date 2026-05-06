import { BankAccountDetails } from 'types/bankAccountDetails';
import { FieldConfig } from 'src/utils/manageUserAccount';

export function buildManageBankAccountOwnerFields(t: (key: string) => string, account: BankAccountDetails): FieldConfig[] {
  return [
    {
      name: 'accountOwnerName',
      label: t('accountOwnerName'),
      value: account?.accountOwnerName || '',
      type: 'text',
      required: true,
      fullWidth: false,
    },
    {
      name: 'hostToHostInterimStatementType',
      label: t('hostToHostInterimStatementType'),
      value: account?.hostToHostInterimStatementType || '',
      type: 'text',
      required: true,
      fullWidth: false,
    },
  ];
}

export function buildManageBankDetailsFields(t: (key: string) => string, account: BankAccountDetails): FieldConfig[] {
    return [
        {
            name: 'bankName',
            label: t('bankName'),
            value: account?.bankName || '',
            type: 'text',
            required: true,
        },
        {
            name: 'branchName',
            label: t('branchName'),
            value: account?.branchName || '',
            type: 'text',
        },
        {
            name: 'bic',
            label: t('bicSwift'),
            value: account?.bic || '',
            type: 'text',
        },
        {
            name: 'sortCode',
            label: t('branchSortCode'),
            value: account?.sortCode || '',
            type: 'text',
        },
        {
            name: 'townCity',
            label: t('townCity'),
            value: account?.townCity || '',
            type: 'text',
        },
        {
            name: 'country',
            label: t('countryRegion'),
            value: account?.country || '',
            type: 'text',
        }
    ];
}

export function buildManageBankAccountDetailsFields(t: (key: string) => string, account: BankAccountDetails): FieldConfig[] {
    return [
        {
            name: 'accountNumber',
            label: t('accountNumber'),
            value: account?.accountNumber || '',
            type: 'text',
            required: true,
        },
        {
            name: 'iban',
            label: t('iban'),
            value: account?.iban || '',
            type: 'text',
        },
        {
            name: 'currency',
            label: t('currency'),
            value: account?.currency || '',
            type: 'text',
        },
        {
            name: 'currencyAndTransactionLimit',
            label: t('currencyAndTransactionLimit'),
            value: account?.currencyAndTransactionLimit || '',
            type: 'text',
        },
        {
            name: 'accountType',
            label: t('accountType'),
            value: account?.accountType || '',
            type: 'text',
        }
    ];
}

export function buildManageBankAccountPaymentTypeFields(t: (key: string) => string, account: BankAccountDetails): FieldConfig[] {
    return [
        {
            name: 'paymentType',
            label: t('paymentType'),
            value: account?.paymentType || '',
            type: 'text',
            required: true,
        }
    ];
}
