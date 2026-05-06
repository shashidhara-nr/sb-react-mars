'use client';
import SuccessMessage from '@molecules/SuccessMessage/SucessMessage';
import { useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import styles from './AccountGroups.module.scss';
import {
  Box,
  Grid,
  Paper,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { BreadcrumbList } from 'components/lib/Page/Breadcrumb';
import { Heading } from 'components/lib/Page';
import RHFProvider from 'components/common/forms/RHFProvider';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from 'store';
import { useForm } from 'react-hook-form';
import { CreateJournyForm } from 'components/common';
import FormActionButtons from 'components/common/formActionButtons';
import { Icon } from '@atoms/index';
import { Button } from 'components/lib/Forms';
import { buildCreateAccountGroupTypeFields } from 'src/utils/manageAccountGroup';
import UserCard from '@atoms/UserCard/UserCard';
import AccountInfoDropdown from 'components/common/AccountDropDown';
import IconChevronDown from 'public/icons/chevron_down.svg';
import IconSearch from 'public/icons/icn_search.svg';
import { ACCOUNT_LIST } from './constant';
import {
  updateAccountGroupDetails,
  deleteAddedAccounts,
  createSubGroup,
  toggleAccountCheckbox,
  togglesubGroupAccountsCheckbox,
  deleteAllSubGroupAccounts,
  deleteSubGroupAccountByIndex,
  deleteAccountFromAddedAccounts,
  deleteAccountsFromSubGroup,
} from '@store/slices/createAccountGroupDetails';
import AccountGroupsBatch from './AccountGroupsBatch';
import { AccountGroupAccountDetails, SubGroup } from 'types/accountGroupDetails';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import PencilIcon from 'public/icons/col-icon-left-pencil.svg';
import { buildTestId } from 'src/utils/testIds';

const CreateAccountGroups = () => {
  const t = useTranslations('accountGroups');
  const theme = useTheme();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [lastHighestProgressIndex, setLastHighestProgressIndex] = useState(0);
  const dispatch = useDispatch();
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedSubGroupAccount, setSelectedSubGroupAccount] = useState('');
  const [subGroupName, setSubGroupName] = useState('');

  const testIdPrefix = 'manage-account-groups-create';

  const accountGroupDetails = useSelector(
    (state: RootState) => state.createAccountGroupDetails.create,
  );

  const detailsDefaultValues = {
    accountGroupName: accountGroupDetails?.accountGroupName || '',
    serviceAgreement: accountGroupDetails?.serviceAgreement || '',
    addAccounts: accountGroupDetails?.addAccounts || [],
    subGroups: accountGroupDetails?.subGroups || [],
  } as const;
  const methodsDetails = useForm({ mode: 'onTouched', defaultValues: detailsDefaultValues });
  const accountGroupTypeFields = buildCreateAccountGroupTypeFields(t, accountGroupDetails);

  const reviewAccountGroupData = [
    {
      name: 'accountGroupName',
      label: t('accountGroupName'),
      value: accountGroupDetails?.accountGroupName || '',
    },
    {
      name: 'serviceAgreement',
      label: t('serviceAgreement'),
      value: accountGroupDetails?.serviceAgreement || '',
    },
  ];

  const getBalances = (account: {
    sortCode: string;
    bic: string;
    currency: string;
    countryRegion: string;
  }) => [
    { label: t('bicSwift'), value: account.bic },
    { label: t('sortCode'), value: account.sortCode },
    { label: t('currency'), value: account.currency },
    { label: t('countryRegion'), value: account.countryRegion },
  ];

  const SUB_GROUP_ACCOUNT_INFO_OPTIONS = accountGroupDetails.addAccounts.map((account) => ({
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

  // Memoize breadcrumb links
  const breadcrumbLinks = useMemo(
    () => [
      { href: '/', label: t('dashboard') },
      { href: '/account-groups', label: t('accountGroups') },
      { href: '/account-groups/create', label: t('addAccountGroup') },
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

  const handleCheckboxChange = (id: string) => {
    dispatch(toggleAccountCheckbox({ id }));
  };

  const handleSubGroupCheckboxChange = (subGroupIndex: number, id: string) => {
    dispatch(togglesubGroupAccountsCheckbox({ subGroupIndex, id }));
  };

  const handleChange = (name: string, value: any) => {
    dispatch(updateAccountGroupDetails({ field: name, value }));
  };

  const handleCreateSubGroup = (name: string, value: any) => {
    const foundAccount = ACCOUNT_LIST.find((account) => account.id === value);
    if (!foundAccount) {
      return;
    }
    dispatch(
      createSubGroup({
        subGroupName: name,
        account: foundAccount,
      }),
    );
  };

  const handleDeleteAccount = () => {
    dispatch(deleteAddedAccounts());
  };

  const handleDeleteAllSubGroups = () => {
    dispatch(deleteAllSubGroupAccounts());
  };

  const handleDeleteSubGroupAccountByIndex = (index: number) => {
    const subGroups = accountGroupDetails?.subGroups || [];
    if (index >= 0 && index < subGroups.length) {
      dispatch(deleteSubGroupAccountByIndex({ index }));
    }
  };

  const handleDeleteAccountFromAddedAccounts = () => {
    dispatch(deleteAccountFromAddedAccounts());
  };

  const handleDeleteAccountsFromSubGroup = (index: number) => {
    const subGroups = accountGroupDetails?.subGroups || [];
    if (index >= 0 && index < subGroups.length) {
      dispatch(deleteAccountsFromSubGroup({ index }));
    }
  };

  const steps = [
    { label: t('accountGroupDetails'), description: t('accountGroupDetailsDescription') },
    { label: t('accounts'), description: t('accountsDescription') },
    { label: t('subGrouping'), description: t('subGroupingDescription') },
    { label: t('reviewAndSubmit'), description: t('reviewAndSubmitDescription') },
  ];

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setLastHighestProgressIndex((prev) => Math.max(prev, nextStep));
    }
  }, [currentStep, steps.length]);

  const handleCancel = useCallback(() => {
    // Handle cancel logic here
  }, []);

  return (
    <section className={styles.container} data-testid={buildTestId(testIdPrefix, 'container')}>
      <BreadcrumbList links={breadcrumbLinks} />
      <Grid size={12} className={styles.headerRow}>
        <Heading as="h4" fontSize="28px" data-testid={buildTestId(testIdPrefix, 'heading')}>
          {t('addAccountGroup')}
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
          <Stepper
            activeStep={currentStep}
            orientation="vertical"
            data-testid={buildTestId(testIdPrefix, 'stepper')}
          >
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
                      <RHFProvider methods={methodsDetails} onSubmit={() => {}} asForm={false}>
                        <CreateJournyForm
                          title={t('accountGroupType')}
                          titleIconEelement={
                            <Icon
                              name="user"
                              width="24px"
                              height="24px"
                              bgColor={theme.palette.text.secondary}
                            />
                          }
                          fields={accountGroupTypeFields as any}
                          onChange={handleChange}
                          mode="edit"
                          ShowActionBtns={false}
                          renderWithRHF
                          formMethods={methodsDetails}
                        />
                      </RHFProvider>
                      <FormActionButtons
                        nextText={t('next')}
                        cancelText={t('cancel')}
                        onCancel={handleCancel}
                        onNext={() => methodsDetails.handleSubmit(() => handleNext())()}
                      />
                    </Box>
                  )}
                  {currentStep === 1 && (
                    <Box>
                      <UserCard
                        title={t('addAccounts')}
                        icon={
                          <Icon
                            name="accounts"
                            width="24px"
                            height="24px"
                            bgColor={theme.palette.text.secondary}
                          />
                        }
                      >
                        <Box className={styles.accountDropdownContainer}>
                          <Box className={styles.accountDropdown}>
                            <AccountInfoDropdown
                              label={t('searchToSelectAccounts')}
                              value={selectedAccount || ''}
                              options={ACCOUNT_INFO_OPTIONS}
                              onChange={(e: any) => {
                                setSelectedAccount(e.target.value);
                              }}
                              iconChevronDown={IconChevronDown}
                              startIcon={IconSearch}
                              fullWidth
                            />
                          </Box>
                        </Box>
                        <Box
                          className={styles.batchBtnContainer}
                          data-testid={buildTestId(testIdPrefix, 'batch-btn-container')}
                        >
                          {accountGroupDetails?.addAccounts?.length > 0 && (
                            <Button
                              buttonVariant="tertiary"
                              startIcon={
                                <Icon name="delete" width="24" height="24" bgColor="#0051FF" />
                              }
                              onClick={() => handleDeleteAccount()}
                            >
                              {t('clearBatch')?.toLocaleUpperCase()}
                            </Button>
                          )}
                          {selectedAccount !== null && (
                            <Button
                              buttonVariant="secondary"
                              startIcon={
                                <Icon name="add" width="24" height="24" bgColor="#0051FF" />
                              }
                              onClick={() => {
                                handleChange('addAccounts', [
                                  ...(accountGroupDetails?.addAccounts || []),
                                  ACCOUNT_LIST.find(
                                    (account) => account.id === selectedAccount,
                                  ) as any,
                                ]);
                                setSelectedAccount('');
                              }}
                            >
                              {t('addAccount')}
                            </Button>
                          )}
                        </Box>
                        {accountGroupDetails?.addAccounts?.length > 0 && (
                          <Box
                            sx={{ pt: 2 }}
                            data-testid={buildTestId(testIdPrefix, 'added-accounts-list')}
                          >
                            <RHFProvider
                              methods={methodsDetails}
                              onSubmit={() => {}}
                              asForm={false}
                            >
                              <AccountGroupsBatch
                                accountData={accountGroupDetails.addAccounts}
                                edit={false}
                                handleCheckboxChange={handleCheckboxChange}
                                handleDeleteSubGroup={() => {}}
                                handleDeleteSelectedAccounts={() =>
                                  handleDeleteAccountFromAddedAccounts()
                                }
                              />
                            </RHFProvider>
                          </Box>
                        )}
                      </UserCard>
                      <FormActionButtons
                        nextText={t('next')}
                        cancelText={t('cancel')}
                        onCancel={handleCancel}
                        onNext={() => methodsDetails.handleSubmit(() => handleNext())()}
                        data-testid={buildTestId(testIdPrefix, 'form-action-buttons')}
                      />
                    </Box>
                  )}
                  {currentStep === 2 && (
                    <>
                      <Box data-testid={buildTestId(testIdPrefix, 'sub-group-container')}>
                        <UserCard
                          title={t('createSubGroup')}
                          icon={
                            <Icon
                              name="accounts"
                              width="24px"
                              height="24px"
                              bgColor={theme.palette.text.secondary}
                            />
                          }
                        >
                          <Grid container spacing={2} sx={{ py: 1 }}>
                            <Grid size={{ md: 12, lg: 4, xl: 6 }}>
                              <TextField
                                label={t('createASubGroup')}
                                value={subGroupName}
                                onChange={(e) => setSubGroupName(e.target.value)}
                                fullWidth
                                size="medium"
                              />
                            </Grid>
                            <Grid size={{ md: 12, lg: 8, xl: 6 }}>
                              <Box className={styles.accountDropdownContainer} sx={{ m: 0 }}>
                                <Box className={styles.accountDropdown}>
                                  <AccountInfoDropdown
                                    label={t('allocateAccounts')}
                                    value={selectedSubGroupAccount}
                                    options={SUB_GROUP_ACCOUNT_INFO_OPTIONS}
                                    onChange={(e: any) => {
                                      setSelectedSubGroupAccount(e.target.value);
                                    }}
                                    iconChevronDown={IconChevronDown}
                                    startIcon={IconSearch}
                                    fullWidth
                                  />
                                </Box>
                              </Box>
                            </Grid>
                          </Grid>
                          <Box
                            className={styles.batchBtnContainer}
                            sx={{ my: 2 }}
                            data-testid={buildTestId(testIdPrefix, 'batch-btn-container')}
                          >
                            {accountGroupDetails?.subGroups?.length > 0 && (
                              <Button
                                buttonVariant="tertiary"
                                startIcon={
                                  <Icon name="delete" width="24" height="24" bgColor="#0051FF" />
                                }
                                onClick={() => handleDeleteAllSubGroups()}
                                data-testid={buildTestId(testIdPrefix, 'clear-batch-button')}
                              >
                                {t('clearBatch')?.toLocaleUpperCase()}
                              </Button>
                            )}
                            {subGroupName !== '' && selectedSubGroupAccount && (
                              <Button
                                buttonVariant="secondary"
                                startIcon={
                                  <Icon name="add" width="24" height="24" bgColor="#0051FF" />
                                }
                                onClick={() => {
                                  handleCreateSubGroup(subGroupName, selectedSubGroupAccount);
                                  setSelectedSubGroupAccount('');
                                  setSubGroupName('');
                                }}
                                data-testid={buildTestId(testIdPrefix, 'add-sub-group-button')}
                              >
                                {t('addAccount')}
                              </Button>
                            )}
                          </Box>
                          {accountGroupDetails?.subGroups?.length > 0 &&
                            accountGroupDetails?.subGroups?.map(
                              (account: SubGroup, index: number) => (
                                <Box
                                  sx={{ pt: 2 }}
                                  key={index}
                                  data-testid={buildTestId(testIdPrefix, `sub-group-${index}`)}
                                >
                                  <RHFProvider
                                    methods={methodsDetails}
                                    onSubmit={() => {}}
                                    asForm={false}
                                  >
                                    <AccountGroupsBatch
                                      data-testid={buildTestId(
                                        testIdPrefix,
                                        `sub-group-batch-${index}`,
                                      )}
                                      title={account.subGroupName}
                                      accountData={account.subGroupAccounts}
                                      edit={false}
                                      accordion={true}
                                      isEditable={true}
                                      handleCheckboxChange={(id: string) =>
                                        handleSubGroupCheckboxChange(index, id)
                                      }
                                      handleDeleteSubGroup={() => {
                                        handleDeleteSubGroupAccountByIndex(index);
                                      }}
                                      handleDeleteSelectedAccounts={() => {
                                        handleDeleteAccountsFromSubGroup(index);
                                      }}
                                    />
                                  </RHFProvider>
                                </Box>
                              ),
                            )}
                        </UserCard>
                        <FormActionButtons
                          nextText={t('next')}
                          cancelText={t('cancel')}
                          onCancel={handleCancel}
                          onNext={() => methodsDetails.handleSubmit(() => handleNext())()}
                        />
                      </Box>
                    </>
                  )}
                  {currentStep === 3 && (
                    <Box data-testid={buildTestId(testIdPrefix, 'review-submit-container')}>
                      <RHFProvider methods={methodsDetails} onSubmit={() => {}} asForm={false}>
                        <CreateJournyForm
                          title={t('accountGroupDetails')}
                          titleIconEelement={
                            <Icon
                              name="billingAccountSelect"
                              width="24px"
                              height="24px"
                              bgColor={theme.palette.text.secondary}
                            />
                          }
                          fields={reviewAccountGroupData as any}
                          onChange={handleChange}
                          mode="review"
                          ShowActionBtns={false}
                          renderWithRHF
                          formMethods={methodsDetails}
                        />
                      </RHFProvider>
                      <Box sx={{ height: 16 }} />
                      <AccountGroupsBatch
                        data-testid={buildTestId(testIdPrefix, 'review-submit-accounts-batch')}
                        title={t('accounts')}
                        accountData={accountGroupDetails.addAccounts}
                        edit={true}
                        handleCheckboxChange={() => {}}
                        handleDeleteSubGroup={() => {}}
                        handleDeleteSelectedAccounts={() => {}}
                      />
                      <Box sx={{ height: 16 }} />
                      <Box>
                        <UserCard
                          data-testid={buildTestId(testIdPrefix, 'review-submit-sub-groups')}
                          title={t('subGroups')}
                          icon={
                            <Icon
                              name="accounts"
                              width="24px"
                              height="24px"
                              bgColor={theme.palette.text.secondary}
                            />
                          }
                          headerActions={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Button
                                buttonVariant="tertiary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                                startIcon={
                                  <Image src={PencilIcon} alt="Rename" width={24} height={24} />
                                }
                                style={{ padding: '6px 16px', minWidth: '32px', height: '32px' }}
                                data-testid={buildTestId(testIdPrefix, 'rename-sub-groups-button')}
                              >
                                {t('edit')}
                              </Button>
                            </Box>
                          }
                        >
                          {accountGroupDetails?.subGroups?.length > 0 &&
                            accountGroupDetails?.subGroups?.map(
                              (account: SubGroup, index: number) => (
                                <Box
                                  sx={{ pt: 2 }}
                                  key={index}
                                  data-testid={buildTestId(testIdPrefix, `sub-group-${index}`)}
                                >
                                  <RHFProvider
                                    methods={methodsDetails}
                                    onSubmit={() => {}}
                                    asForm={false}
                                  >
                                    <AccountGroupsBatch
                                      title={account.subGroupName}
                                      accountData={account.subGroupAccounts}
                                      edit={false}
                                      handleCheckboxChange={() => {}}
                                      handleDeleteSubGroup={() => {}}
                                      handleDeleteSelectedAccounts={() => {}}
                                    />
                                  </RHFProvider>
                                </Box>
                              ),
                            )}
                        </UserCard>
                      </Box>
                      <FormActionButtons
                        data-testid={buildTestId(testIdPrefix, 'review-submit-action-buttons')}
                        nextText={t('submit')}
                        cancelText={t('cancel')}
                        onCancel={handleCancel}
                        onNext={() =>
                          methodsDetails.handleSubmit(() =>
                            router.push('/account-groups/success' as any),
                          )()
                        }
                      />
                    </Box>
                  )}
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Paper>
      </section>
    </section>
  );
};
export default CreateAccountGroups;
