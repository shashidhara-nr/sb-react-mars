'use client';
import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import styles from './BillingAccounts.module.scss';
import { Grid } from '@mui/material';
import { BreadcrumbList } from 'components/lib/Page/Breadcrumb';
import { Heading } from 'components/lib/Page';
import JournyForm from 'components/common/JournyForm';
import { Icon } from '@atoms/index';
import { buildManageBillingAccountFields, buildManageBillingAccountTypeFields } from 'src/utils/manageBillingAccount';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import BillingAccountsBatch from './BillingAccountsBatch';
import theme from 'components/lib/styles/theme';

const ManageBillingAccounts = () => {
  const t = useTranslations('billingAccounts');
  const billingAccountDetails = useSelector((state: RootState) => state.billingAccountDetails.details);
  const accountFields = useMemo(() => buildManageBillingAccountFields(t, billingAccountDetails), [t, billingAccountDetails]);
  const billingAccountTypeFields = useMemo(() => buildManageBillingAccountTypeFields(t, billingAccountDetails), [t, billingAccountDetails]);

  const detailsDefaultValues = {} as const;
  const methodsDetails = useForm({ mode: 'onTouched', defaultValues: detailsDefaultValues });
  const detailsValues = methodsDetails.getValues();

  const applyOverrides = (fieldsArr: any[], overrides: Record<string, any>) =>
    (Array.isArray(fieldsArr) ? fieldsArr : []).map((f: any) => {
      const nf: any = { ...f };
      if (Object.prototype.hasOwnProperty.call(overrides || {}, f.name)) nf.value = overrides[f.name];
      if (f.type === 'amount') {
        const currencyName = f.amountCurrencyTargetName || `${f.name}Currency`;
        if (Object.prototype.hasOwnProperty.call(overrides || {}, currencyName))
          nf.amountCurrency = overrides[currencyName];
      }
      return nf;
    });

  const accountFieldsOv = applyOverrides(accountFields as any[], detailsValues as any);
  const billingAccountTypeFieldsOv = applyOverrides(billingAccountTypeFields as any[], detailsValues as any);

  const handleChange = () => {};

  // Memoize breadcrumb links
  const breadcrumbLinks = useMemo(
    () => [
      { href: '/', label: t('dashboard') },
      { href: '/billing-accounts', label: t('billingAccounts') },
      { href: '/billing-accounts/manage', label: t('manageBillingAccount') },
    ],
    [t],
  );

  return (
    <section className={styles.container}>
      <BreadcrumbList links={breadcrumbLinks} />
      <Grid
        size={12}
        className={styles.headerRow}
      >
        <Heading as="h4" fontSize="28px">
          {t('manageBillingAccount')} [Account Name]
        </Heading>
      </Grid>
      <JournyForm
        onChange={handleChange}
        mode="view"
        ShowActionBtns={false}
        renderWithRHF
        formMethods={methodsDetails}
        syncOnChange={false}
        sections={[{
          title: t('billingAccount'),
          titleIcon: '',
          titleIconEelement: <Icon name="billingAccountSelect" width="24px" height="24px" bgColor={theme.palette.text.secondary} />, 
          fields: accountFieldsOv as any,
          ShowActionBtns: false,
          readOnly: true
        }]}
        onSubmit={(data: any) => {
          Object.entries(data || {}).forEach(([name, value]) => handleChange(name, value));
        }}
        onValidationFail={() => {
          // handle validation fail
        }}
      />
      <BillingAccountsBatch edit={true} />
      <JournyForm
        onChange={handleChange}
        mode="view"
        ShowActionBtns={false}
        renderWithRHF
        formMethods={methodsDetails}
        syncOnChange={false}
        sections={[{
          title: t('billingAccountType'),
          titleIcon: '',
          titleIconEelement: <Icon name="billingAccountType" width="24px" height="24px" bgColor={theme.palette.text.secondary} />, 
          fields: billingAccountTypeFieldsOv as any,
          ShowActionBtns: true,
          readOnly: true
        }]}
        onSubmit={(data: any) => {
          Object.entries(data || {}).forEach(([name, value]) => handleChange(name, value));
        }}
        onValidationFail={() => {
          // handle validation fail
        }}
      />
    </section>
  );
};
export default ManageBillingAccounts;
