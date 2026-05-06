import { FieldConfig } from 'src/utils/manageUserAccount';
import { BillingAccountDetails, CreateBillingAccountPayload } from 'types/billingAccountDetails';

export function buildManageBillingAccountFields(t: (key: string) => string, account: BillingAccountDetails): FieldConfig[] {
  return [
    {
      name: 'accountName',
      label: t('accountName'),
      value: account?.accountName || '',
      type: 'text',
      required: true,
      fullWidth: false,
    },
    {
      name: 'accountNumber',
      label: t('accountNumber'),
      value: account?.accountNumber || '',
      type: 'text',
      required: true,
      fullWidth: false,
    },
    {
      name: 'branchSortCode',
      label: t('branchSortCode'),
      value: account?.branchSortCode || '',
      type: 'text',
      required: true,
      fullWidth: false,
    },
    {
      name: 'bicSwift',
      label: t('bicSwift'),
      value: account?.bicSwift || '',
      type: 'text',
      required: true,
      fullWidth: false,
    },
    {
      name: 'currency',
      label: t('currency'),
      value: account?.currency || '',
      type: 'text',
      required: true,
      fullWidth: false,
    },
    {
      name: 'countryRegion',
      label: t('countryRegion'),
      value: account?.countryRegion || '',
      type: 'text',
      required: true,
      fullWidth: false,
    },
  ];
}

export function buildManageBillingAccountTypeFields(t: (key: string) => string, account: BillingAccountDetails): FieldConfig[] {
  return [
    {
      name: 'billingAccountType',
      label: t('billingAccountType'),
      value: account?.billingAccountType || '',
      type: 'text',
      required: true,
      fullWidth: false,
    },
  ];
}

export function buildCreateBillingAccountFields(t: (key: string) => string, account: CreateBillingAccountPayload): FieldConfig {
  return {
      name: 'billingAccount',
      label: t('billingAccount'),
      value: account?.billingAccount || '',
      type: 'select',
      required: true,
      fullWidth: true,
    };
}

export function buildCreateBillingAccountTypeFields(t: (key: string) => string, account: CreateBillingAccountPayload): FieldConfig[] {
  return [
    {
      name: 'billingAccountType',
      label: t('billingAccountType'),
      value: account?.billingAccountType || '',
      type: 'select',
      required: true,
      fullWidth: true,
      options: [
        { value: 'fixed', label: t('transactional') },
        { value: 'variable', label: t('nonTransactional') },
      ],
    },
  ];
}
