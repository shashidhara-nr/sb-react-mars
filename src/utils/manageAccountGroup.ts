import { FieldConfig } from './domesticBase';
import { CreateAccountGroupPayload } from 'types/accountGroupDetails';

export function buildCreateAccountGroupTypeFields(
  t: (key: string) => string,
  account: CreateAccountGroupPayload,
): FieldConfig[] {
  return [
    {
      name: 'accountGroupName',
      label: t('accountGroupName'),
      value: account.accountGroupName || '',
      type: 'text',
      required: true,
    },
    {
      name: 'serviceAgreement',
      label: t('serviceAgreement'),
      value: account.serviceAgreement || '',
      type: 'select',
      required: true,
      options: [
        { value: '[Service Agreement name 1]', label: t('serviceAgreementName1') },
        { value: '[Service Agreement name 2]', label: t('serviceAgreementName2') },
        { value: '[Service Agreement name 3]', label: t('serviceAgreementName3') },
      ],
    },
  ];
}

export function buildManageAccountGroupTypeFields(
  t: (key: string) => string,
  account: CreateAccountGroupPayload,
): FieldConfig[] {
  return [
    {
      name: 'accountGroupName',
      label: t('accountGroupName'),
      value: account.accountGroupName || '',
      type: 'text',
      required: true,
    },
    {
      name: 'serviceAgreement',
      label: t('serviceAgreement'),
      value: account.serviceAgreement || '',
      type: 'select',
      required: true,
      options: [
        { value: '[Service Agreement name 1]', label: t('serviceAgreementName1') },
        { value: '[Service Agreement name 2]', label: t('serviceAgreementName2') },
        { value: '[Service Agreement name 3]', label: t('serviceAgreementName3') },
      ],
    },
  ];
}
