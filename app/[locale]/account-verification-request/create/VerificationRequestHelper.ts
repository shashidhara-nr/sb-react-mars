import type { AbstractIntlMessages } from 'next-intl';

export const getBreadcrumbsWithTranslation = (
  t: (key: string) => string,
  mode: 'create' | 'manage' = 'create'
) => {
  return [
    { href: '/', label: t('dashboard') },
    {
      href: '/account-verification-request',
      label: t('accountVerificationRequest'),
    },
    {
      href: '/account-verification-request/create',
      label: t('verificationRequestServiceType'),
    },
    {
      href: '/account-verification-request/create/success',
      label: 'Success',
    },
  ];
};

export const getTranslatedSuccessMessages = (t: (key: string) => string, mode: 'create' | 'manage' = 'create') => {
  return {
    title: 'Success',
    mainMessage: mode === 'create'
      ? 'Single, immediate response verification request successfully created and submitted for approval.'
      : 'Verification request updated successfully.',
    verificationIdLabel: 'Verification request ID',
    infoText: 'Save your verification request ID for your records and future reference. It will be used to track the status of your request.',
  };
};

export const getTranslatedSuccessButtons = (t: (key: string) => string, mode: 'create' | 'manage' = 'create') => {
  return {
    copy: 'COPY',
    goToVerificationList: 'GO TO ACCOUNT VERIFICATION LIST',
    createAnother: 'CREATE ANOTHER VERIFICATION REQUEST',
  };
};
