// Unpaid Options field utilities: constants and field builders for CreateJournyForm
import { FieldConfig, FieldOption } from './domesticBase';
import { AccountInfoOption } from 'components/common/AccountInfoDropdown';

// Static options for selects used in Unpaid Options flow
export const POSTING_OPTIONS = [
  { key: 1, value: 'Itemized' },
  { key: 2, value: 'Consolidate per agent bank' },
  { key: 3, value: 'Consolidate across all agent banks' },
] as const;

export const POSTING_ACCOUNT_OPTIONS = [
  { key: 1, value: 'Use nominated account', label: 'Use a nominated account' },
  { key: 2, value: 'Use the ordering account', label: 'Use the ordering account' },
] as const;

export const NOMINATED_ACCOUNTS: AccountInfoOption[] = [
  {
    value: 'acc1',
    name: 'Current Account',
    masked: '****1234',
    accNumber: '1234567890',
    sortCode: '12-34-56',
    bic: 'ABCDZAJJ',
    balances: [
      { label: 'Opening balance', value: 'R 10,000.00' },
      { label: 'Closing balance', value: 'R 9,500.00' },
      { label: 'Cleared balance', value: 'R 9,200.00' },
      { label: 'Available balance', value: 'R 8,800.00' },
    ],
  },
  {
    value: 'acc2',
    name: 'Savings Account',
    masked: '****5678',
    accNumber: '5678901234',
    sortCode: '56-78-90',
    bic: 'ABCDZAJJ',
    balances: [
      { label: 'Opening balance', value: 'R 25,000.00' },
      { label: 'Closing balance', value: 'R 25,100.00' },
      { label: 'Cleared balance', value: 'R 25,100.00' },
      { label: 'Available balance', value: 'R 25,100.00' },
    ],
  },
  {
    value: 'acc3',
    name: 'Business Account',
    masked: '****9012',
    accNumber: '9012345678',
    sortCode: '90-12-34',
    bic: 'ABCDZAJJ',
    balances: [
      { label: 'Opening balance', value: 'R 50,000.00' },
      { label: 'Closing balance', value: 'R 48,750.00' },
      { label: 'Cleared balance', value: 'R 48,500.00' },
      { label: 'Available balance', value: 'R 47,900.00' },
    ],
  },
];

export const POSTING_OPTION_SELECT: FieldOption[] = POSTING_OPTIONS.map((t) => ({
  label: t.value,
  value: t.value,
}));

export const POSTING_ACCOUNT_RADIO: FieldOption[] = POSTING_ACCOUNT_OPTIONS.map((t) => ({
  label: t.label,
  value: t.value,
}));

export function buildUnpaidOptionDetailsFields(
  unpaidOption: any,
  mode?: 'edit' | 'review',
): FieldConfig[] {
  const fields: FieldConfig[] = [
    {
      name: 'unpaidOptionName',
      label: 'Unpaid option name*',
      value: unpaidOption?.unpaidOptionName || '',
      type: 'text',
      required: true,
      fullWidth: false,
      rightBlank: false,
    },
    {
      name: 'postingOption',
      label: 'Posting option*',
      value: unpaidOption?.postingOption || '',
      type: 'select',
      required: true,
      fullWidth: false,
      options: POSTING_OPTION_SELECT,
    },
  ];

  // Add posting account field
  fields.push({
    name: 'postingAccount',
    label: mode === 'edit' ? 'Which posting account do you want to use?' : 'Posting account',
    value: unpaidOption?.postingAccount || '',
    type: 'radio',
    required: true,
    options: POSTING_ACCOUNT_RADIO,
    fullWidth: true,
  });

  // Add nominated account dropdown - shows when 'Use nominated account' is selected (in edit mode)
  fields.push({
    name: 'selectedNominatedAccount',
    label: 'Select a nominated account*',
    value: unpaidOption?.selectedNominatedAccount || '',
    type: 'accountInfo' as any,
    required: true,
    accountInfoOptions: NOMINATED_ACCOUNTS,
    fullWidth: true,
    showWhen: { field: 'postingAccount', value: 'Use nominated account' },
  });

  // In review mode, show nominated account details side by side when an account was selected
  if (
    mode === 'review' &&
    unpaidOption?.postingAccount === 'Use nominated account' &&
    unpaidOption?.selectedNominatedAccount
  ) {
    const selectedAccount = NOMINATED_ACCOUNTS.find(
      (acc) => acc.value === unpaidOption?.selectedNominatedAccount,
    );

    if (selectedAccount) {
      fields.push({
        name: 'nominatedAccountName',
        label: 'Nominated account name',
        value: selectedAccount.name,
        type: 'text',
        fullWidth: false,
        rightBlank: false,
        hideInEdit: true,
      });

      fields.push({
        name: 'nominatedAccountNumber',
        label: 'Nominated account number',
        value: selectedAccount.masked,
        type: 'text',
        fullWidth: false,
        hideInEdit: true,
      });
    }
  }

  return fields;
}
