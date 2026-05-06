'use client';
import { useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import styles from './UserAccounts.module.scss';
import {
  Box,
  Grid,
  Paper,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
  useTheme,
  Switch,
  FormControlLabel,
  TextField,
  MenuItem,
  Popper,
  ClickAwayListener,
  MenuList,
  Chip,
} from '@mui/material';
import { Button } from 'components/lib/Forms';
import { useForm } from 'react-hook-form';
import { RootState } from '@store/index';
import { useSelector } from 'react-redux';
import {
  buildCreateUserAccountAddressFields,
  buildCreateUserAccountCommunicationFields,
  buildCreateUserAccountFields,
  buildCreateUserAccountRolesFields,
  buildCreateUserSearchAccountFields,
  buildManageUserAccountRoleFields,
} from 'src/utils/manageUserAccount';
import { CreateJournyForm, RHFProvider } from 'components/common';
import FormActionButtons from 'components/common/formActionButtons';
import { Icon } from '@atoms/index';
import { Select } from 'components/lib/Forms';
import { Controller } from 'react-hook-form';
import JournyForm from 'components/common/JournyForm';
import { CardSelection, CardSelectionOption } from 'components/common/creationMethod';
import BreadcrumbList from 'components/lib/Page/Breadcrumb';
import { Heading } from 'components/lib/Page';
import CreateUserAccountStep2 from './CreateUserAccountStep2';
import Image from 'next/image';
import EditIcon from 'public/icons/col-icon-left-pencil.svg';

const CreateUserAccount = () => {
  const t = useTranslations('userAccounts');
  const theme = useTheme();
  const [proceedSteps, setProceedSteps] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [lastHighestProgressIndex, setLastHighestProgressIndex] = useState(0);
  const [searchUsers, setSearchUsers] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);

  // Dummy user data
  const dummyUsers = [
    { id: 1, name: 'John Doe', email: 'john.doe@standardbank.com', roles: ['admin', 'manager'] },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@standardbank.com', roles: ['user'] },
    { id: 3, name: 'Michael Johnson', email: 'michael.johnson@standardbank.com', roles: ['approver', 'reviewer'] },
    { id: 4, name: 'Sarah Williams', email: 'sarah.williams@standardbank.com', roles: ['manager'] },
    { id: 5, name: 'David Brown', email: 'david.brown@standardbank.com', roles: ['user', 'approver'] },
    { id: 6, name: 'Emily Davis', email: 'emily.davis@standardbank.com', roles: ['admin'] },
    { id: 7, name: 'Robert Miller', email: 'robert.miller@standardbank.com', roles: ['reviewer'] },
    { id: 8, name: 'Lisa Anderson', email: 'lisa.anderson@standardbank.com', roles: ['manager', 'user'] },
  ];

  // Dummy authorization class data
  const dummyAuthorizationClasses = [
    { id: 1, label: 'Class A - Full Access', value: 'class_a' },
    { id: 2, label: 'Class B - Limited Access', value: 'class_b' },
    { id: 3, label: 'Class C - Read Only', value: 'class_c' },
    { id: 4, label: 'Class D - Approver', value: 'class_d' },
    { id: 5, label: 'Class E - Viewer', value: 'class_e' },
  ];

  // Dummy language data
  const dummyLanguages = [
    { id: 1, label: 'English', value: 'en' },
    { id: 2, label: 'Spanish', value: 'es' },
    { id: 3, label: 'French', value: 'fr' },
    { id: 4, label: 'Portuguese', value: 'pt' },
    { id: 5, label: 'Afrikaans', value: 'af' },
    { id: 6, label: 'Zulu', value: 'zu' },
    { id: 7, label: 'Xhosa', value: 'xh' },
  ];

  // Dummy roles data
  const dummyRoles = [
    { id: 1, label: 'Administrator', value: 'admin' },
    { id: 2, label: 'Manager', value: 'manager' },
    { id: 3, label: 'User', value: 'user' },
    { id: 4, label: 'Approver', value: 'approver' },
    { id: 5, label: 'Reviewer', value: 'reviewer' },
  ];

  // Search users function
  const handleSearchUsers = useCallback((searchValue: string) => {
    setSearchUsers(searchValue);
    if (searchValue.trim() === '') {
      setFilteredUsers([]);
      setShowUserDropdown(false);
    } else {
      const filtered = dummyUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          user.email.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredUsers(filtered);
      setShowUserDropdown(true);
    }
  }, []);

  // Select user function
  const handleSelectUser = (user: any) => {
    setSearchUsers(user.name);
    setShowUserDropdown(false);
    setFilteredUsers([]);
    handleChange('searchUsers', user.name);
    
    // Populate roles if user has roles
    if (user.roles && user.roles.length > 0) {
      methodsDetails.setValue('rolesDropdown', user.roles);
    }
  };
  
  // Handle click away from dropdown
  const handleClickAway = () => {
    setShowUserDropdown(false);
  };
  
  // Handle remove role chip
  const handleRemoveRole = (roleToRemove: string) => {
    const currentRoles = methodsDetails.getValues('rolesDropdown') || [];
    const updatedRoles = currentRoles.filter((role: string) => role !== roleToRemove);
    methodsDetails.setValue('rolesDropdown', updatedRoles);
  };

  const userAccountDetails = useSelector(
    (state: RootState) => state.userAccountDetails?.details || {}
  );

  const userAccountSearchFields = useMemo(
    () => buildCreateUserSearchAccountFields(t, userAccountDetails),
    [t, userAccountDetails]
  );
  const userAccountFields = useMemo(
    () => buildCreateUserAccountFields(t, userAccountDetails),
    [t, userAccountDetails]
  );
  const userAccountAddressFields = useMemo(
    () => buildCreateUserAccountAddressFields(t, userAccountDetails),
    [t, userAccountDetails]
  );
  const userAccountCommunicationFields = useMemo(
    () => buildCreateUserAccountCommunicationFields(t, userAccountDetails),
    [t, userAccountDetails]
  );
  const userAccountRolesFields = useMemo(
    () => buildCreateUserAccountRolesFields(t, userAccountDetails),
    [t, userAccountDetails]
  );
  const userAccountRoleViewFields = useMemo(
    () => buildManageUserAccountRoleFields(t, userAccountDetails),
    [t, userAccountDetails]
  );

  const detailsDefaultValues = {
    searchUserAccounts: '',
    userAccountName: '',
    startDate: '',
    editDate: '',
    authorisationClass: '',
    language: '',
    email: '',
    receiveEmailNotifications: false,
    allowMobileAccess: false,
    searchUsers: '',
    rolesDropdown: [] as string[],
  };

  const methodsDetails = useForm<typeof detailsDefaultValues>({
    mode: 'onTouched',
    defaultValues: detailsDefaultValues,
  });
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  // Define flow types early
  const isCreateNewAccountFlow = selectedMethod === 'createAUserAccount';
  const isCopyExistingFlow = selectedMethod === 'copyExistingAccount';
  
  // Use watch to track form value changes in real-time
  const detailsValues = methodsDetails.watch();

  const applyOverrides = (
    fieldsArr: any[],
    overrides: Record<string, any>
  ) =>
    (Array.isArray(fieldsArr) ? fieldsArr : []).map((f: any) => {
      const nf: any = { ...f };
      if (Object.prototype.hasOwnProperty.call(overrides || {}, f.name))
        nf.value = overrides[f.name];
      if (f.type === 'amount') {
        const currencyName =
          f.amountCurrencyTargetName || `${f.name}Currency`;
        if (Object.prototype.hasOwnProperty.call(overrides || {}, currencyName))
          nf.amountCurrency = overrides[currencyName];
      }
      return nf;
    });

  // Add dummy options to dropdown fields
  const addDummyOptions = (fieldsArr: any[]) =>
    (Array.isArray(fieldsArr) ? fieldsArr : []).map((f: any) => {
      const nf: any = { ...f };
      if (f.name === 'authorisationClass' || f.name === 'authClass') {
        nf.options = dummyAuthorizationClasses.map((ac) => ({
          label: ac.label,
          value: ac.value,
        }));
      } else if (f.name === 'language') {
        nf.options = dummyLanguages.map((lang) => ({
          label: lang.label,
          value: lang.value,
        }));
      } else if (f.name === 'rolesDropdown' || f.name === 'rolesAssignedToThisUser') {
        nf.options = dummyRoles.map((role) => ({
          label: role.label,
          value: role.value,
        }));
      }
      return nf;
    });

  const userAccountSearchFieldsOv = applyOverrides(
    userAccountSearchFields as any[],
    detailsValues as any
  );
  const userAccountFieldsOv = applyOverrides(
    userAccountFields as any[],
    detailsValues as any
  );
  const userAccountAddressFieldsOv = applyOverrides(
    userAccountAddressFields as any[],
    detailsValues as any
  );
  const userAccountCommunicationFieldsOv = applyOverrides(
    userAccountCommunicationFields as any[],
    detailsValues as any
  );
  const userAccountRolesFieldsOv = addDummyOptions(
    applyOverrides(
      userAccountRolesFields as any[],
      detailsValues as any
    )
  );
  const userAccountRoleViewFieldsOv = applyOverrides(
    userAccountRoleViewFields as any[],
    detailsValues as any
  );

  // Apply dummy options to userAccountFields for auth class and language
  const userAccountFieldsWithOptions = addDummyOptions(
    applyOverrides(
      userAccountFields as any[],
      detailsValues as any
    )
  );

  const breadcrumbLinks = useMemo(
    () => [
      { href: '/', label: t('dashboard') },
      { href: '/user-accounts', label: t('userAccounts') },
      {
        href: '/user-accounts/create-user-account',
        label: `${t('create')} ${t('userAccount')?.toLocaleLowerCase()}`,
      },
    ],
    [t]
  );

  const rulesProvider = (fieldName: string) => {
    if (fieldName === 'searchUserAccounts') {
      return {
        required: {
          value: true,
          message: t('pleaseSelectUserAccount'),
        },
        validate: (value: string) => {
          return value && String(value).trim() !== ''
            ? true
            : t('pleaseSelectUserAccount');
        },
      };
    }
    if (fieldName === 'userAccountName') {
      return {
        required: {
          value: true,
          message: t('userAccountNameRequired'),
        },
        validate: (value: string) => {
          return value && String(value).trim() !== ''
            ? true
            : t('userAccountNameRequired');
        },
      };
    }
    if (fieldName === 'authClass') {
      return {
        required: {
          value: true,
          message: t('authClassRequired'),
        },
        validate: (value: string) => {
          return value && String(value).trim() !== ''
            ? true
            : t('authClassRequired');
        },
      };
    }
    if (fieldName === 'language') {
      return {
        required: {
          value: true,
          message: t('languageRequired'),
        },
        validate: (value: string) => {
          return value && String(value).trim() !== ''
            ? true
            : t('languageRequired');
        },
      };
    }
    if (fieldName === 'emailAddress') {
      return {
        required: {
          value: true,
          message: t('emailAddressRequired'),
        },
        validate: (value: string) => {
          return value && String(value).trim() !== ''
            ? true
            : t('emailAddressRequired');
        },
      };
    }
    return {};
  };

  const copyAccountSteps = [
     { label: t('userAccountDetails'), description: t('description') },
     { label: t('reviewAndSubmit'), description: t('description') },
  ];

  const createAccountSteps = [
    { label: t('userAccountDetails'), description: t('description') },
    { label: t('reviewAndSubmit'), description: t('description') },
  ];

  // Helper function to map currentStep to visual step index
  const getVisualStepIndex = useCallback(() => {
    if (isCreateNewAccountFlow) {
      if (currentStep <= 1) return 0;
      return 1;
    }
    // Copy account flow keeps normal step indexing
    return currentStep;
  }, [currentStep, isCreateNewAccountFlow]);

  // Helper function to map lastHighestProgressIndex to visual step index
  const getVisualLastHighestIndex = useCallback(() => {
    if (isCreateNewAccountFlow) {
      if (lastHighestProgressIndex <= 1) return 0;
      return 1;
    }
    return lastHighestProgressIndex;
  }, [lastHighestProgressIndex, isCreateNewAccountFlow]);

  const steps =
    selectedMethod === 'copyExistingAccount'
      ? copyAccountSteps
      : createAccountSteps;

  const handleNextStep = useCallback(() => {
    // For create flow, allow steps 0→1→2; for copy flow, allow 0→1→2→3
    const maxStep = isCreateNewAccountFlow ? 2 : steps.length - 1;
    if (currentStep < maxStep) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setLastHighestProgressIndex((prev) => Math.max(prev, nextStep));
    }
  }, [currentStep, steps.length, isCreateNewAccountFlow]);

  const handleChange = (name: string, value: any) => {
    methodsDetails.setValue(name as any, value);
    
    // Handle searchUsers field to trigger search functionality
    if (name === 'searchUsers') {
      handleSearchUsers(value);
    }
  };

  const onSelectStep = (index: number) => {
    if (isCreateNewAccountFlow) {
      // Map visual step index to currentStep value
      // Visual step 0 maps to currentStep 0
      // Visual step 1 maps to currentStep 2
      const mappedStep = index === 0 ? 0 : 2;
      if (mappedStep <= lastHighestProgressIndex) {
        setCurrentStep(mappedStep);
      }
    } else {
      // Copy flow keeps normal behavior
      if (index <= lastHighestProgressIndex) {
        setCurrentStep(index);
      }
    }
  };

  const handleSelect = (method: string) => {
    setSelectedMethod(method);
  };

  const creationOptions: CardSelectionOption[] = [
    {
      value: 'createAUserAccount',
      label: 'Create a new account',
      description: 'Optional concise description.',
      icon: 'africa',
    },
    {
      value: 'copyExistingAccount',
      label: 'Copy existing account',
      description: 'Optional concise description.',
      icon: 'globe',
    },
  ];

  const handleCancel = () => {
    setSelectedMethod(null);
    setCurrentStep(0);
    setLastHighestProgressIndex(0);
    methodsDetails.reset();
    setProceedSteps(false);
  };

  const handleNext = () => {
    if (!selectedMethod) return;
    setCurrentStep(0);
    setLastHighestProgressIndex(0);
    methodsDetails.reset();
    setProceedSteps(true);
  };

  return (
    <div className={styles.container}>
      <BreadcrumbList links={breadcrumbLinks} />
      <Grid size={12} className={styles.headerRow}>
        <Heading as="h4" fontSize="28px">
          {t('createUserAccount')}
        </Heading>
      </Grid>
      <section className={styles.content}>
        {!proceedSteps && (
          <section>
            <Typography className={styles.creationHeading}>
              {t('howToCreateUserAccount')}
            </Typography>
            <CardSelection
              options={creationOptions}
              selectedValue={selectedMethod}
              onSelect={handleSelect}
            />
            <Grid size={12} className={styles.actionButtons}>
              <Button buttonVariant="tertiary" onClick={handleCancel}>
                <Icon
                  name="cancel"
                  width="24px"
                  height="24px"
                  bgColor={theme.palette.primary.main}
                />
                {t('cancel')}
              </Button>
              <Button buttonVariant="primary" onClick={handleNext}>
                <Icon
                  name="next"
                  width="24px"
                  height="24px"
                  bgColor={theme.palette.common.white}
                />
                {t('next')}
              </Button>
            </Grid>
          </section>
        )}

        {proceedSteps && (
          <Stepper activeStep={getVisualStepIndex()} orientation="vertical">
            {steps.map((step, index) => (
              <Step
                key={step.label}
                completed={index < getVisualLastHighestIndex()}
              >
                <StepLabel
                  onClick={() => onSelectStep(index)}
                  className={index <= getVisualLastHighestIndex() ? styles.stepLabelClickable : styles.stepLabelDefault}
                  optional={
                    <Typography
                      variant="body2"
                      className={styles.stepDescription}
                    >
                      {step.description}
                    </Typography>
                  }
                >
                  {step.label}
                </StepLabel>
                <StepContent>
                  {currentStep === 0 && isCopyExistingFlow && (
                    <Box>
                      <RHFProvider
                        methods={methodsDetails}
                        onSubmit={() => {}}
                        asForm={false}
                      >
                        <CreateJournyForm
                          title={t('verifiedUserAccount')}
                          titleIconEelement={
                            <Icon
                              name="accountVerified"
                              width="24px"
                              height="24px"
                              bgColor={theme.palette.text.secondary}
                            />
                          }
                          fields={userAccountSearchFieldsOv as any}
                          onChange={handleChange}
                          mode="edit"
                          ShowActionBtns={false}
                          renderWithRHF
                          formMethods={methodsDetails}
                          rulesProvider={rulesProvider}
                        />
                      </RHFProvider>
                      <FormActionButtons
                        nextText={t('next')}
                        cancelText={t('cancel')}
                        onCancel={handleCancel}
                        onNext={() =>
                          methodsDetails.handleSubmit(() =>
                            handleNextStep()
                          )()
                        }
                      />
                    </Box>
                  )}

                  {(currentStep === 0 || currentStep === 1) && isCreateNewAccountFlow && (
                    <Box>
                      <RHFProvider
                        methods={methodsDetails}
                        onSubmit={() => {}}
                        asForm={false}
                      >
                        <CreateJournyForm
                          title={t('userAccountDetails')}
                          titleIconEelement={
                            <Icon
                              name="userAccount"
                              width="24px"
                              height="24px"
                              bgColor={theme.palette.text.secondary}
                            />
                          }
                          fields={userAccountFieldsWithOptions as any}
                          onChange={handleChange}
                          mode="edit"
                          ShowActionBtns={false}
                          renderWithRHF
                          formMethods={methodsDetails}
                          rulesProvider={rulesProvider}
                        />
                       
                        <Box sx={{ marginTop: '32px' }}>
                          <Paper className={styles.formSection}>
                            <Box className={styles.sectionHeader}>
                              <Icon
                                name="user"
                                width="24px"
                                height="24px"
                                bgColor={theme.palette.text.secondary}
                              />
                              <Typography className={styles.sectionTitle}>
                                {t('assignedUserAndRoles')}
                              </Typography>
                            </Box>

                            {currentStep == 0 && (
                              <Box className={styles.formGrid}>
                                {/* Search Users */}
                                <ClickAwayListener onClickAway={handleClickAway}>
                                  <Box className={styles.formField} sx={{ position: 'relative', width: '100%', gridColumn: '1 / -1' }}>
                                    <TextField
                                      fullWidth
                                      label={t('searchUsers')}
                                      value={searchUsers}
                                      onChange={(e) => handleSearchUsers(e.target.value)}
                                      placeholder={t('searchUsers')}
                                      variant="outlined"
                                    />
                                    {showUserDropdown && filteredUsers.length > 0 && (
                                      <Paper
                                        sx={{
                                          position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        right: 0,
                                        zIndex: 1300,
                                        maxHeight: '200px',
                                        overflow: 'auto',
                                        mt: 0.5,
                                      }}
                                    >
                                      <MenuList>
                                        {filteredUsers.map((user) => (
                                          <MenuItem
                                            key={user.id}
                                            onClick={() => handleSelectUser(user)}
                                          >
                                            <Box>
                                              <Typography variant="body1">{user.name}</Typography>
                                              <Typography variant="caption" color="text.secondary">
                                                {user.email}
                                              </Typography>
                                            </Box>
                                          </MenuItem>
                                        ))}
                                      </MenuList>
                                    </Paper>
                                  )}
                                </Box>
                              </ClickAwayListener>

                              {/* Roles Assigned Dropdown */}
                              <Box className={styles.formField} sx={{ width: '100%' }}>
                                <Controller
                                  name="rolesDropdown"
                                  control={methodsDetails.control}
                                  render={({ field }) => (
                                    <Select
                                      value={field.value}
                                      name={field.name}
                                      formOptions={{ fullWidth: true }}
                                      selectProps={{
                                        label: t('rolesAssigned'),
                                        labelId: 'roles-assigned-label',
                                        multiple: true,
                                        onChange: (e) => {
                                          field.onChange(e.target.value);
                                        },
                                        renderValue: (selected) => (
                                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {(selected as string[]).map((value) => {
                                              const role = dummyRoles.find((r) => r.value === value);
                                              return (
                                                <Chip
                                                  key={value}
                                                  label={role?.label || value}
                                                  onDelete={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveRole(value);
                                                  }}
                                                  onMouseDown={(e) => {
                                                    e.stopPropagation();
                                                  }}
                                                  size="small"
                                                  sx={{
                                                    backgroundColor: '#E3F2FD',
                                                    color: '#0051FF',
                                                    '& .MuiChip-deleteIcon': {
                                                      color: '#0051FF',
                                                      '&:hover': {
                                                        color: '#003DB5',
                                                      },
                                                    },
                                                  }}
                                                />
                                              );
                                            })}
                                          </Box>
                                        ),
                                      }}
                                      options={dummyRoles.map((role) => ({
                                        label: role.label,
                                        value: role.value,
                                      }))}
                                      error={false}
                                    />
                                  )}
                                />
                              </Box>
                            </Box>)}
                             {currentStep == 1 && (
                               <Box className={styles.assignedUserSection}>
                                 {/* User Info Card */}
                                 <Box className={styles.userInfoCard}>
                                   <Box className={styles.userInfoLeft}>
                                     <Box className={styles.userAvatar}>
                                       MS
                                     </Box>
                                     <Box className={styles.userDetails}>
                                       <Typography className={styles.userName}>
                                         Maya Smit
                                       </Typography>
                                       <Typography className={styles.userIdText}>
                                         A1234565
                                       </Typography>
                                     </Box>
                                   </Box>
                                   <Box className={styles.userInfoRight}>
                                     <Typography className={styles.userEmail}>
                                       MayaSmit@reducer.com
                                     </Typography>
                                     <Box className={styles.statusBadge}>
                                       <svg className={styles.statusIcon} viewBox="0 0 16 16" fill="none">
                                         <path d="M13.3337 4L6.00033 11.3333L2.66699 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                       </svg>
                                       Active
                                     </Box>
                                   </Box>
                                 </Box>

                                 {/* Roles Section */}
                                 <Box className={styles.rolesSection}>
                                   <Typography className={styles.rolesLabel}>
                                     Roles assigned to this user
                                   </Typography>
                                   <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                     <Chip
                                       label="Label 01"
                                       onDelete={() => {}}
                                       className={styles.roleChip}
                                     />
                                     <Chip
                                       label="Label 02"
                                       onDelete={() => {}}
                                       className={styles.roleChip}
                                     />
                                     <Chip
                                       label="Label 03"
                                       onDelete={() => {}}
                                       className={styles.roleChip}
                                     />
                                     <Chip
                                       label="Label 04"
                                       onDelete={() => {}}
                                       className={styles.roleChip}
                                     />
                                   </Box>
                                 </Box>

                                 <Box className={styles.sectionDivider} />

                                 {/* User Details Section */}
                                 <Box className={styles.detailsSection}>
                                   <Box className={styles.detailsGrid}>
                                     <Box className={styles.detailField}>
                                       <Typography className={styles.fieldLabel}>User ID</Typography>
                                       <Typography className={styles.fieldValue}>XXXXXX</Typography>
                                     </Box>
                                     <Box className={styles.detailField}>
                                       <Typography className={styles.fieldLabel}>Status</Typography>
                                       <Typography className={styles.fieldValue}>Active</Typography>
                                     </Box>
                                     <Box className={styles.detailField}>
                                       <Typography className={styles.fieldLabel}>First name</Typography>
                                       <Typography className={styles.fieldValue}>[First name]</Typography>
                                     </Box>
                                     <Box className={styles.detailField}>
                                       <Typography className={styles.fieldLabel}>Last name</Typography>
                                       <Typography className={styles.fieldValue}>[Last name]</Typography>
                                     </Box>
                                     <Box className={styles.detailField}>
                                       <Typography className={styles.fieldLabel}>Date of birth</Typography>
                                       <Typography className={styles.fieldValue}>[Date of birth]</Typography>
                                     </Box>
                                     <Box className={styles.detailField}>
                                       <Typography className={styles.fieldLabel}>ID number</Typography>
                                       <Typography className={styles.fieldValue}>[ID number]</Typography>
                                     </Box>
                                     <Box className={styles.detailField}>
                                       <Typography className={styles.fieldLabel}>Language</Typography>
                                       <Typography className={styles.fieldValue}>[Language]</Typography>
                                     </Box>
                                     <Box className={styles.detailField}>
                                       <Typography className={styles.fieldLabel}>Gender</Typography>
                                       <Typography className={styles.fieldValue}>[Gender]</Typography>
                                     </Box>
                                   </Box>
                                 </Box>

                                 <Box className={styles.sectionDivider} />

                                 {/* Address Details Section */}
                                 <Box className={styles.detailsSection}>
                                   <Typography className={styles.sectionTitleText}>
                                     <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                       <path d="M2 6L8 2L14 6V13C14 13.2652 13.8946 13.5196 13.7071 13.7071C13.5196 13.8946 13.2652 14 13 14H3C2.73478 14 2.48043 13.8946 2.29289 13.7071C2.10536 13.5196 2 13.2652 2 13V6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                     </svg>
                                     Address details
                                   </Typography>
                                   <Box className={styles.detailsGrid}>
                                     <Box className={styles.detailField}>
                                       <Typography className={styles.fieldLabel}>Address line 1</Typography>
                                       <Typography className={styles.fieldValue}>[Address line 1]</Typography>
                                     </Box>
                                     <Box className={styles.detailField}>
                                       <Typography className={styles.fieldLabel}>Address line 2</Typography>
                                       <Typography className={styles.fieldValue}>[Address line 2]</Typography>
                                     </Box>
                                     <Box className={styles.detailField}>
                                       <Typography className={styles.fieldLabel}>Country / Region</Typography>
                                       <Typography className={styles.fieldValue}>[Country/ Region]</Typography>
                                     </Box>
                                   </Box>
                                 </Box>

                                 <Box className={styles.sectionDivider} />

                                 {/* Phone and Email Details Section */}
                                 <Box className={styles.detailsSection}>
                                   <Typography className={styles.sectionTitleText}>
                                     <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                       <path d="M14.6667 11.28V13.28C14.6675 13.4657 14.6294 13.6494 14.555 13.8195C14.4807 13.9897 14.3716 14.1424 14.2348 14.2679C14.0979 14.3934 13.9364 14.489 13.7605 14.5485C13.5847 14.608 13.3983 14.63 13.2133 14.6133C11.1619 14.3904 9.19136 13.6894 7.46 12.5667C5.84919 11.5431 4.48353 10.1774 3.46 8.56666C2.33334 6.82745 1.6322 4.84731 1.41333 2.78666C1.39667 2.60233 1.41849 2.41671 1.4777 2.24141C1.53691 2.06612 1.63197 1.90501 1.75694 1.76841C1.88192 1.63181 2.03407 1.52273 2.20363 1.44817C2.37319 1.37361 2.55634 1.33519 2.74133 1.33599H4.74133C5.06478 1.33281 5.37897 1.4449 5.62613 1.65024C5.87329 1.85558 6.03804 2.14116 6.09 2.45999C6.18738 3.09618 6.35944 3.71945 6.604 4.31999C6.69371 4.55298 6.71404 4.80632 6.66271 5.05039C6.61138 5.29446 6.49032 5.51851 6.31467 5.69666L5.50667 6.50466C6.46588 8.17404 7.8306 9.53876 9.5 10.498L10.308 9.68999C10.4861 9.51434 10.7102 9.39328 10.9542 9.34195C11.1983 9.29062 11.4517 9.31095 11.6847 9.40066C12.2852 9.64522 12.9085 9.81728 13.5447 9.91466C13.8672 9.96714 14.1559 10.1349 14.3617 10.3863C14.5675 10.6377 14.6768 10.9565 14.6667 11.28Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                     </svg>
                                     Phone and email details
                                   </Typography>
                                   <Box className={styles.detailsGrid}>
                                     <Box className={styles.detailField}>
                                       <Typography className={styles.fieldLabel}>Phone number</Typography>
                                       <Typography className={styles.fieldValue}>[+27 XXX XXXX]</Typography>
                                     </Box>
                                     <Box className={styles.detailField}>
                                       <Typography className={styles.fieldLabel}>Communication preference</Typography>
                                       <Typography className={styles.fieldValue}>Use for communication</Typography>
                                     </Box>
                                     <Box className={styles.detailField}>
                                       <Typography className={styles.fieldLabel}>Email address</Typography>
                                       <Typography className={styles.fieldValue}>[Email address]</Typography>
                                     </Box>
                                     <Box className={styles.detailField}>
                                       <Typography className={styles.fieldLabel}>Communication preference</Typography>
                                       <Typography className={styles.fieldValue}>Use for communication, use for alerts</Typography>
                                     </Box>
                                   </Box>
                                 </Box>
                               </Box>
                             )}
                          </Paper>
                        </Box>
                      </RHFProvider>
                      <Box className={styles.actionButtonsContainer}>
                        <FormActionButtons
                          nextText={t('next')}
                          cancelText={t('cancel')}
                          onCancel={handleCancel}
                          onNext={() =>
                            methodsDetails.handleSubmit(() =>
                              handleNextStep()
                            )()
                          }
                        />
                      </Box>
                    </Box>
                  )}

                  {currentStep === 2 && isCreateNewAccountFlow && (
                    <Box>
                      <RHFProvider
                        methods={methodsDetails}
                        onSubmit={() => {}}
                        asForm={false}
                      >
                        {/* User Account Details Section */}
                        <Box sx={{ marginBottom: '2rem' }}>
                          <Paper
                            sx={{
                              padding: '24px',
                              borderRadius: '12px',
                              border: '1px solid #E5E7EB',
                            }}
                          >
                            {/* Section Header with Edit Button */}
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                paddingBottom: '16px',
                                borderBottom: '1px solid #E5E7EB',
                                marginBottom: '20px',
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Icon
                                  name="userAccount"
                                  width="20px"
                                  height="20px"
                                  bgColor="#222E37"
                                />
                                <Typography sx={{ fontWeight: 400, fontSize: '20px', color: '#333' }}>
                                  {t('userAccountDetails')}
                                </Typography>
                              </Box>
                              <Button
                                buttonVariant="text"
                                onClick={() => setCurrentStep(0)}
                                sx={{
                                  color: '#0051FF',
                                  fontWeight: '700',
                                  textTransform: 'uppercase',
                                  fontSize: '14px',
                                }}
                                startIcon={<Image src={EditIcon} alt="edit" width={24} height={24} />}
                              >
                                EDIT
                              </Button>
                            </Box>

                            {/* Display Fields in Review Mode */}
                            <Box
                              sx={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '20px',
                              }}
                            >
                              {userAccountFieldsWithOptions.map((field: any) => (
                                <Box
                                  key={field.name}
                                  sx={{
                                    gridColumn: field.fullWidth ? 'span 2' : 'span 1',
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      fontSize: '12px',
                                      color: '#6B7280',
                                      marginBottom: '4px',
                                    }}
                                  >
                                    {field.label}
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontSize: '14px',
                                      color: '#1F2937',
                                      fontWeight: 400,
                                    }}
                                  >
                                    {methodsDetails.getValues(field.name) || '—'}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          </Paper>
                        </Box>

                        {/* Assigned User and Roles Section */}
                        <Box>
                          <Paper
                            sx={{
                              padding: '24px',
                              borderRadius: '12px',
                              border: '1px solid #E5E7EB',
                            }}
                          >
                            {/* Section Header with Edit Button */}
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                paddingBottom: '16px',
                                borderBottom: '1px solid #E5E7EB',
                                marginBottom: '20px',
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Icon
                                  name="user"
                                  width="20px"
                                  height="20px"
                                  bgColor="#222E37"
                                />
                                <Typography sx={{ fontWeight: 400, fontSize: '20px', color: '#333' }}>
                                  {t('assignedUserAndRoles')}
                                </Typography>
                              </Box>
                              <Button
                                buttonVariant="text"
                                onClick={() => setCurrentStep(1)}
                                sx={{
                                  color: '#0051FF',
                                  fontWeight: '700',
                                  textTransform: 'uppercase',
                                  fontSize: '14px',
                                }}
                                startIcon={<Image src={EditIcon} alt="edit" width={24} height={24} />}
                              >
                                EDIT
                              </Button>
                            </Box>

                            {/* Display Fields in Review Mode */}
                            <Box
                              sx={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '20px',
                              }}
                            >
                              {userAccountRoleViewFieldsOv.map((field: any) => (
                                <Box
                                  key={field.name}
                                  sx={{
                                    gridColumn: field.fullWidth ? 'span 2' : 'span 1',
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      fontSize: '12px',
                                      color: '#6B7280',
                                      marginBottom: '4px',
                                    }}
                                  >
                                    {field.label}
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontSize: '14px',
                                      color: '#1F2937',
                                      fontWeight: 400,
                                    }}
                                  >
                                    {methodsDetails.getValues(field.name) || '—'}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          </Paper>
                        </Box>
                      </RHFProvider>
                      <FormActionButtons
                        nextText={t('submit')}
                        cancelText={t('cancel')}
                        onCancel={handleCancel}
                        onNext={() =>
                          methodsDetails.handleSubmit(() => {
                            console.log(detailsValues);
                          })()
                        }
                      />
                    </Box>
                  )}

                  {currentStep === 2 && isCopyExistingFlow && (
                    <Box>
                      <RHFProvider
                        methods={methodsDetails}
                        onSubmit={() => {}}
                        asForm={false}
                      >
                        <CreateJournyForm
                          title={t('verificationConfirmation')}
                          fields={userAccountAddressFieldsOv as any}
                          onChange={handleChange}
                          mode="edit"
                          ShowActionBtns={false}
                          renderWithRHF
                          formMethods={methodsDetails}
                          rulesProvider={rulesProvider}
                        />
                      </RHFProvider>
                      <FormActionButtons
                        nextText={t('next')}
                        cancelText={t('cancel')}
                        onCancel={handleCancel}
                        onNext={() =>
                          methodsDetails.handleSubmit(() =>
                            handleNextStep()
                          )()
                        }
                      />
                    </Box>
                  )}

                  {currentStep === 3 && isCopyExistingFlow && (
                    <Box>
                      <RHFProvider
                        methods={methodsDetails}
                        onSubmit={() => {}}
                        asForm={false}
                      >
                        <JournyForm
                          onChange={handleChange}
                          mode={'review'}
                          ShowActionBtns={false}
                          renderWithRHF
                          formMethods={methodsDetails}
                          syncOnChange={false}
                          sections={[
                            {
                              title: t('userAccountDetails'),
                              titleIcon: '',
                              titleIconEelement: (
                                <Icon
                                  name="userAccount"
                                  width="20px"
                                  height="20px"
                                  bgColor="#222E37"
                                />
                              ),
                              fields: userAccountFieldsWithOptions as any,
                              ShowActionBtns: false,
                            },
                          ]}
                        />
                      </RHFProvider>
                      <FormActionButtons
                        nextText={t('submit')}
                        cancelText={t('cancel')}
                        onCancel={handleCancel}
                        onNext={() =>
                          methodsDetails.handleSubmit(() => {
                            console.log(detailsValues);
                          })()
                        }
                      />
                    </Box>
                  )}

                  {currentStep === 1 && isCopyExistingFlow && (
                    <Box>
                      <RHFProvider
                        methods={methodsDetails}
                        onSubmit={() => {}}
                        asForm={false}
                      >
                        <CreateJournyForm
                          title={t('verificationConfirmation')}
                          fields={userAccountAddressFieldsOv as any}
                          onChange={handleChange}
                          mode="edit"
                          ShowActionBtns={false}
                          renderWithRHF
                          formMethods={methodsDetails}
                          rulesProvider={rulesProvider}
                        />
                      </RHFProvider>
                      <FormActionButtons
                        nextText={t('next')}
                        cancelText={t('cancel')}
                        onCancel={handleCancel}
                        onNext={() =>
                          methodsDetails.handleSubmit(() =>
                            handleNextStep()
                          )()
                        }
                      />
                    </Box>
                  )}

                  
                </StepContent>
              </Step>
            ))}
          </Stepper>
        )}
      </section>
    </div>
  );
};

export default CreateUserAccount;
