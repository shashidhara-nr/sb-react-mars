import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Supported languages
export const locales = ['en','fr', 'pt'] as const;
export const defaultLocale = 'en' as const;

export default getRequestConfig(async ({ requestLocale }) => {
  // Get the locale from the request
  const locale = await requestLocale;
  
  // Validate that the incoming locale parameter is valid
  if (!locale || !locales.includes(locale as any)) notFound();
const messages = {
  beneficiarieshub: (await import(`./src/locales/${locale}/beneficiarieshub.json`)).default,
  createauseraccount: (await import(`./src/locales/${locale}/createauseraccount.json`)).default,
  paymenttypes: (await import(`./src/locales/${locale}/paymentTypes.json`)).default,
  accountsAndBalances: (await import(`./src/locales/${locale}/accountsAndBalances.json`)).default,
  transactionalAuditAndApprove: (await import(`./src/locales/${locale}/transactionalAuditAndApprove.json`)).default,
  holidayCalendar: (await import(`./src/locales/${locale}/holidayCalendar.json`)).default,
  serviceAgreements: (await import(`./src/locales/${locale}/serviceAgreements.json`)).default,
  billingAccounts: (await import(`./src/locales/${locale}/billingAccounts.json`)).default,
  manageLimit: (await import(`./src/locales/${locale}/manageLimit.json`)).default,
  limits: (await import(`./src/locales/${locale}/limits.json`)).default,
  creditLimits: (await import(`./src/locales/${locale}/creditLimit.json`)).default,

  userDetails: (await import(`./src/locales/${locale}/userDetails.json`)).default,
  userAccounts: (await import(`./src/locales/${locale}/userAccounts.json`)).default,
  bankingAccounts: (await import(`./src/locales/${locale}/bankingAccounts.json`)).default,
  billingAdviceList: (await import(`./src/locales/${locale}/billingAdviceList.json`)).default,
  auditLogHub: (await import(`./src/locales/${locale}/auditLogHub.json`)).default,
  companyDetails: (await import(`./src/locales/${locale}/companyDetails.json`)).default,
  cutoffTimes: (await import(`./src/locales/${locale}/cutoffTimes.json`)).default,
  participatingBanks: (await import(`./src/locales/${locale}/participatingBanks.json`)).default,
  branchCodes: (await import(`./src/locales/${locale}/branchCodes.json`)).default,
  currencyRates: (await import(`./src/locales/${locale}/currencyRates.json`)).default,
  common: (await import(`./src/locales/${locale}/common.json`)).default,
  payments: (await import(`./src/locales/${locale}/payments.json`)).default,
    transactionalAuthProfiles: (
      await import(`./src/locales/${locale}/transactionalAuthProfiles.json`)
    ).default,
  unpaid: (await import(`./src/locales/${locale}/unpaid.json`)).default,
    collectionTypesHubData: (await import(`./src/locales/${locale}/collectionTypesHub.json`))
      .default,
    collections: (await import(`./src/locales/${locale}/collections.json`)).default,
    customerAgreement: (await import(`./src/locales/${locale}/customerAgreement.json`)).default,
    transferType: (await import(`./src/locales/${locale}/transferType.json`)).default,
    bopThirdParties: (await import(`./src/locales/${locale}/bopThirdParties.json`)).default,
    debtorsHubData: (await import(`./src/locales/${locale}/debtorsHub.json`)).default,
    nonTransactionalAuditApprove: (await import(`./src/locales/${locale}/nonTransactionalAuditApprove.json`)).default,
    billsHubData: (await import(`./src/locales/${locale}/bills.json`)).default,
    nonTransactionalHubData: (await import(`./src/locales/${locale}/nonTransactionalAuthRules.json`)).default,
    accountGroups: (await import(`./src/locales/${locale}/accountGroups.json`)).default,
    historicalData: (await import(`./src/locales/${locale}/historicalData.json`)).default,
    sfiUploads: (await import(`./src/locales/${locale}/sfiUploads.json`)).default,
    helpCentre: (await import(`./src/locales/${locale}/helpCentre.json`)).default,
    messageAlerts: (await import(`./src/locales/${locale}/messageAlerts.json`)).default,
    errorCodes: (await import(`./src/locales/${locale}/errorCodes.json`)).default,
    reports: (await import(`./src/locales/${locale}/reports.json`)).default,
    collectionsfileupload: (await import(`./src/locales/${locale}/collectionsfileupload.json`)).default,
    myBills: (await import(`./src/locales/${locale}/myBills.json`)).default,
    transfers: (await import(`./src/locales/${locale}/transfers.json`)).default,
    signinHub: (await import(`./src/locales/${locale}/signinHub.json`)).default,
    // ...add more as needed
  };
  return {
    locale,
    messages
  };
});