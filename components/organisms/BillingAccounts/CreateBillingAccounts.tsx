'use client';
import { useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import styles from './BillingAccounts.module.scss';
import { Box, Grid, Paper, Step, StepContent, StepLabel, Stepper, Typography, useTheme } from '@mui/material';
import { Dialog } from 'dist/standard-bank-react';
import { BreadcrumbList } from 'components/lib/Page/Breadcrumb';
import { Heading } from 'components/lib/Page';
import RHFProvider from 'components/common/forms/RHFProvider';
import { useAppDispatch, useAppSelector } from '@lib/hooks/useAppDispatch';
import { useForm } from 'react-hook-form';
import { CreateJournyForm } from 'components/common';
import FormActionButtons from 'components/common/formActionButtons';
import { Icon } from '@atoms/index';
import BillingAccountsBatch from './BillingAccountsBatch';
import { buildCreateBillingAccountFields, buildCreateBillingAccountTypeFields } from 'src/utils/manageBillingAccount';
import UserCard from '@atoms/UserCard/UserCard';
import AccountInfoDropdown from 'components/common/AccountDropDown';
import { ACCOUNT_LIST } from './constant';
import IconChevronDown from 'public/icons/chevron_down.svg';
import IconSearch from 'public/icons/icn_search.svg';
import { updateBillingAccountsDetails } from '@store/slices/createBillingAccountDetails';
import { Button } from 'components/lib/Forms';
import AvatarAlert from 'public/icons/avatar_alert.svg';
import Image from 'next/image';

const CreateBillingAccounts = () => {
  const t = useTranslations('billingAccounts');
  const theme = useTheme();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [lastHighestProgressIndex, setLastHighestProgressIndex] = useState(0);
  const dispatch = useAppDispatch();
  const [typeChangeDialog, setTypeChangeDialog] = useState(false);
  const [pendingTypeValue, setPendingTypeValue] = useState<string | null>(null);
  const [previousType, setPreviousType] = useState<string>('');

  const billingAccountDetails = useAppSelector((state) => state.createBillingAccountDetails.create);
  const detailsDefaultValues = {
    billingAccount: billingAccountDetails?.billingAccount || '',
    billingAddBankAccounts: billingAccountDetails?.billingAddBankAccounts || [],
    billingAccountType: billingAccountDetails?.billingAccountType || '',
  } as const;
  const methodsDetails = useForm({ mode: 'onTouched', defaultValues: detailsDefaultValues });
  const billingAccountTypeFields = buildCreateBillingAccountTypeFields(t, billingAccountDetails);

  // Memoize breadcrumb links
  const breadcrumbLinks = useMemo(
    () => [
      { href: '/', label: t('dashboard') },
      { href: '/billing-accounts', label: t('billingAccounts') },
      { href: '/billing-accounts/create', label: t('addBillingAccount') },
    ],
    [t],
  );

  const onSelectStep = useCallback(
    (stepIndex: number) => {
      if (stepIndex <= lastHighestProgressIndex) {
        setCurrentStep(stepIndex);
      }
    },
    [lastHighestProgressIndex],
  );

  const handleChange = (name: string, value: any) => {
    // Check if changing billing account type
    if (name === 'billingAccountType' && billingAccountDetails?.billingAccountType !== value) {
      setPreviousType(billingAccountDetails?.billingAccountType || '');
      setPendingTypeValue(value);
      setTypeChangeDialog(true);
      return;
    }
    dispatch(updateBillingAccountsDetails({ field: name, value }));
  };

  const handleTypeChangeConfirm = () => {
    if (pendingTypeValue) {
      dispatch(updateBillingAccountsDetails({ field: 'billingAccountType', value: pendingTypeValue }));
    }
    setTypeChangeDialog(false);
    setPendingTypeValue(null);
    setPreviousType('');
  };

  const handleTypeChangeCancel = () => {
    setTypeChangeDialog(false);
    setPendingTypeValue(null);
    setPreviousType('');
  };

  const steps = [
    { label: t('billingAccount'), description: t('description') },
    { label: t('accounts'), description: t('description') },
    { label: t('billingAccountType'), description: t('description') },
    { label: t('reviewAndSubmit'), description: t('description') },
  ];

  const getBalances = (account: { sortCode: string; bic: string; currency: string; countryRegion: string }) => [
    { label: t('bicSwift'), value: account.bic },
    { label: t('sortCode'), value: account.sortCode },
    { label: t('currency'), value: account.currency },
    { label: t('countryRegion'), value: account.countryRegion },
  ];

  const ACCOUNT_INFO_OPTIONS = ACCOUNT_LIST.map((account) => ({
    value: account.id,
    name: account.name,
    masked: account.masked,
    accNumber: account.accNumber,
    sortCode: account.sortCode,
    bic: account.bic,
    balances: getBalances(account),
    currency: account.currency,
    countryRegion: account.countryRegion,
    iconChevronDown: IconChevronDown,
  }));

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setLastHighestProgressIndex((prev) => Math.max(prev, nextStep));
    } else if (currentStep === steps.length - 1) {
      // Submit - redirect to success page
      const accountName = ACCOUNT_INFO_OPTIONS.find(
        (option) => option.value === billingAccountDetails?.billingAccount
      )?.name || 'Billing Account';
      router.push(`/billing-accounts/success?mode=create&name=${encodeURIComponent(accountName)}`);
    }
  }, [currentStep, steps.length, billingAccountDetails?.billingAccount, ACCOUNT_INFO_OPTIONS, router]);

  const handleCancel = useCallback(() => {
    // Handle cancel logic here
  }, []);

  const selectedAccount = ACCOUNT_INFO_OPTIONS.find((option) => option.value === billingAccountDetails?.billingAccount);

  const reviewBillingAccountData = [
    {
      name: 'accountName',
      label: t('accountName'),
      value: selectedAccount?.name || ''
    },
    {
      name: 'accountNumber',
      label: t('accountNumber'),
      value: selectedAccount?.accNumber || ''
    },
    {
      name: 'branchSortCode',
      label: t('branchSortCode'),
      value: selectedAccount?.sortCode || ''
    },
    {
      name: 'bicSwift',
      label: t('bicSwift'),
      value: selectedAccount?.bic || ''
    },
    {
      name: 'currency',
      label: t('currency'),
      value: selectedAccount?.currency || ''
    },
    {
      name: 'countryRegion',
      label: t('countryRegion'),
      value: selectedAccount?.countryRegion || ''
    }
  ];

  return (
    <section className={styles.container}>
      <BreadcrumbList links={breadcrumbLinks} />
      <Grid
        size={12}
        className={styles.headerRow}
      >
        <Heading as="h4" fontSize="28px">
            {t('addBillingAccount')}
        </Heading>
      </Grid>
      <section className={styles.content}>
        <Paper
          sx={{
            p: '0.5rem 1rem',
            backgroundColor: 'transparent',
          }}
          elevation={0}
        >
            <Stepper activeStep={currentStep} orientation="vertical">
              {steps.map((step, index) => (
                <Step key={step.label} completed={index < lastHighestProgressIndex}>
                  <StepLabel
                    onClick={() => onSelectStep(index)}
                    sx={{ cursor: index <= lastHighestProgressIndex ? 'pointer' : 'default' }}
                    optional={
                      <Typography variant="body2" className={styles.stepDescription}>
                        {step.description}
                      </Typography>
                    }
                  >
                    {step.label}
                  </StepLabel>
                  <StepContent>
                    {currentStep === 0 && (
                      <Box>
                        <UserCard title={t('billingAccount')} icon={<Icon name="billingAccountSelect" width="24px" height="24px" bgColor={theme.palette.text.secondary} />}>
                          <Box className={styles.accountDropdownContainer}>
                            <Box className={styles.accountDropdown}>
                              <AccountInfoDropdown
                                label={t('searchAccounts')}
                                value={billingAccountDetails?.billingAccount || ''}
                                options={ACCOUNT_INFO_OPTIONS}
                                onChange={(e: any) => handleChange('billingAccount', e.target.value)}
                                iconChevronDown={IconChevronDown}
                                startIcon={IconSearch}
                                fullWidth
                              />
                            </Box>
                          </Box>
                        </UserCard>
                        <FormActionButtons nextText={t('next')} cancelText={t('cancel')} onCancel={handleCancel} onNext={() => methodsDetails.handleSubmit(() => handleNext())()} />
                      </Box>
                    )}
                    {currentStep === 1 && (
                      <Box>
                        <RHFProvider methods={methodsDetails} onSubmit={() => {}} asForm={false}>
                          <BillingAccountsBatch edit={false} />
                        </RHFProvider>
                        <FormActionButtons nextText={t('next')} cancelText={t('cancel')} onCancel={handleCancel} onNext={() => methodsDetails.handleSubmit(() => handleNext())()} />
                      </Box>
                    )}
                    {currentStep === 2 && (
                      <Box>
                        <RHFProvider methods={methodsDetails} onSubmit={() => {}} asForm={false}>
                          <CreateJournyForm
                            title={t('billingAccountType')}
                            titleIconEelement={<Icon name="billingAccountType" width="24px" height="24px" bgColor={theme.palette.text.secondary} />}
                            fields={billingAccountTypeFields as any}
                            onChange={handleChange}
                            mode="edit"
                            ShowActionBtns={false}
                            renderWithRHF
                            formMethods={methodsDetails}
                          />
                        </RHFProvider>
                        <FormActionButtons nextText={t('reviewAndSubmit')} cancelText={t('cancel')} onCancel={handleCancel} onNext={() => methodsDetails.handleSubmit(() => handleNext())()} />
                      </Box>
                    )}
                    {currentStep === 3 && (
                      <Box>
                        <RHFProvider methods={methodsDetails} onSubmit={() => {}} asForm={false}>
                          <CreateJournyForm
                            title={t('billingAccount')}
                            titleIconEelement={<Icon name="billingAccountSelect" width="24px" height="24px" bgColor={theme.palette.text.secondary} />}
                            fields={reviewBillingAccountData as any}
                            onChange={handleChange}
                            mode="review"
                            ShowActionBtns={false}
                            renderWithRHF
                            formMethods={methodsDetails}
                          />
                          <BillingAccountsBatch edit={true} />
                          <CreateJournyForm
                            title={t('billingAccountType')}
                            titleIconEelement={<Icon name="billingAccountType" width="24px" height="24px" bgColor={theme.palette.text.secondary} />}
                            fields={billingAccountTypeFields as any}
                            onChange={handleChange}
                            mode="review"
                            ShowActionBtns={true}
                            renderWithRHF
                            formMethods={methodsDetails}
                          />
                        </RHFProvider>
                        <FormActionButtons nextText={t('submit')} cancelText={t('cancel')} onCancel={handleCancel} onNext={() => methodsDetails.handleSubmit(() => handleNext())()} />
                      </Box>
                    )}
                  </StepContent>
                </Step>
              ))}
            </Stepper>
        </Paper>
      </section>
      
      {/* Type Change Confirmation Dialog */}
      <Dialog
        open={typeChangeDialog}
        onClose={handleTypeChangeCancel}
        maxWidth="560px"
        content={
          <Box
            sx={{
              padding: '16px 0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <Image src={AvatarAlert} alt="Alert" width={48} height={48} />
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Box
                sx={{
                  fontWeight: 600,
                  fontSize: '16px',
                  textAlign: 'center',
                  color: '#222E37',
                }}
              >
                {pendingTypeValue === 'transactional'
                  ? 'Non-transactional account selected'
                  : 'Transaction account selected'}
              </Box>
              <Box sx={{ fontWeight: 400, fontSize: '14px', textAlign: 'center', color: '#666666', lineHeight: 1.6 }}>
                {pendingTypeValue === 'transactional' ? (
                  <>
                    You have selected <strong>non-transactional</strong> billing account type. Please be aware your current non-transactional account type will be changed to <strong>transactional</strong>. Would you like to continue?
                  </>
                ) : (
                  <>
                    You have selected <strong>transactional</strong> billing account type. Please be aware your current transactional account type will be changed to <strong>non-transactional</strong>. Would you like to continue?
                  </>
                )}
              </Box>
            </Box>
          </Box>
        }
        title="Confirmation"
        name="Confirmation"
        secondaryCTALabel="Yes,Continue"
        tertiaryCTALabel="Cancel"
        onSecondaryCTA={handleTypeChangeConfirm}
        onTertiaryCTA={handleTypeChangeCancel}
        secondaryCTAHeight="48px"
        tertiaryCTAHeight="48px"
      />
    </section>
  );
};
export default CreateBillingAccounts;
