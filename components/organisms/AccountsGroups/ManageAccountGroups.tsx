'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import styles from './AccountGroups.module.scss';
import {
  Box,
  Grid,
  useTheme,
  TextField,
  Snackbar,
  Alert,
  Typography,
  Collapse,
} from '@mui/material';
import { BreadcrumbList } from 'components/lib/Page/Breadcrumb';
import { Heading } from 'components/lib/Page';
import { Icon } from '@atoms/index';
import { buildManageAccountGroupTypeFields } from 'src/utils/manageAccountGroup';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { RootState } from 'store';
import CreateJournyForm from 'components/common/CreateJournyForm';
import UserCard from '@atoms/UserCard/UserCard';
import AccountInfoDropdown from 'components/common/AccountDropDown';
import IconChevronDown from 'public/icons/chevron_down.svg';
import IconSearch from 'public/icons/icn_search.svg';
import { Button } from 'components/lib/Forms';
import { ACCOUNT_LIST } from './constant';
import AccountGroupsBatch from './AccountGroupsBatch';
import RHFProvider from 'components/common/forms/RHFProvider';
import Image from 'next/image';
import PencilIcon from 'public/icons/col-icon-left-pencil.svg';
import IcnCloseIcon from 'public/icons/close-icon.svg';
import IcnSaveIcon from 'public/icons/col-icon-left-save.svg';
import DeleteIcon from 'public/icons/icn_bin.svg';
import { SubGroup } from 'types/accountGroupDetails';
import { useRouter } from 'next/navigation';
import SaveIconGray from 'public/icons/save-icon-grey.svg';

import {
  updateAccountGroupDetails,
  deleteAddedAccounts,
  deleteAccountFromAddedAccounts,
  toggleAccountCheckbox,
  togglesubGroupAccountsCheckbox,
  deleteAllSubGroupAccounts,
  deleteSubGroupAccountByIndex,
  deleteAccountsFromSubGroup,
  createSubGroup,
  renameSubGroup,
  accountGroupDetailsMain,
} from '@store/slices/createAccountGroupDetails';

import DeleteAccountGroupPopper from './DeleteAccountGroupDialog';
import AvatarAlert from 'public/icons/avatar_alert.svg';
import { AvatarAlertSuccess, ListIcon } from '@lib/icons';
import { buildTestId } from 'src/utils/testIds';

const testIdPrefix = 'manage-account-groups';

const ManageAccountGroups = () => {
  const t = useTranslations('accountGroups');
  const theme = useTheme();
  const router = useRouter();

  const dispatch = useDispatch();

  const [selectedAccount, setSelectedAccount] = useState('');
  const [addAccountsMode, setAddAccountsMode] = useState<'edit' | 'review'>('review');
  const [subGroupsMode, setSubGroupsMode] = useState<'edit' | 'review'>('review');

  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');

  // State for subgroup creation / rename
  const [subGroupName, setSubGroupName] = useState('');
  const [selectedSubGroupAccount, setSelectedSubGroupAccount] = useState('');
  const [renamingSubGroupIndex, setRenamingSubGroupIndex] = useState<number | null>(null);

  const [deleteAccountGroupOpen, setDeleteAccountGroupOpen] = useState<boolean>(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState<boolean>(false);

  // open/close state for each subgroup (default OPEN)
  const [openSubGroups] = useState<Record<string, boolean>>({});
  const getSubGroupKey = (account: SubGroup, index: number) => `${account.subGroupName}-${index}`;
  const isSubGroupOpen = (key: string) => openSubGroups[key] ?? true;

  const accountGroupDetails = useSelector(
    (state: RootState) => state.createAccountGroupDetails.create,
  );

  const accountFields = useMemo(
    () => buildManageAccountGroupTypeFields(t, accountGroupDetails),
    [t, accountGroupDetails],
  );

  const detailsDefaultValues = {
    accountGroupName: accountGroupDetails?.accountGroupName || '',
    serviceAgreement: accountGroupDetails?.serviceAgreement || '',
    addAccounts: accountGroupDetails?.addAccounts || [],
    subGroups: accountGroupDetails?.subGroups || [],
  } as const;

  const methodsDetails = useForm({ mode: 'onTouched', defaultValues: detailsDefaultValues });
  const isRenaming = renamingSubGroupIndex !== null;

  const handleSaveAccountGroupDetails = () => {
    dispatch(
      accountGroupDetailsMain({
        accountGroupName: 'accountGroupDetails',
        serviceAgreement: {
          label: 'Service Agreement',
          value: detailsDefaultValues.serviceAgreement,
        },
      }),
    );
  };

  // Update field handler
  const handleChange = (name: string, value: any) => {
    dispatch(updateAccountGroupDetails({ field: name, value }));
  };

  // Add account to group
  const handleAddAccount = () => {
    if (!selectedAccount) return;
    const found = ACCOUNT_LIST.find((a) => a.id === selectedAccount);
    if (!found) return;
    handleChange('addAccounts', [
      ...(accountGroupDetails.addAccounts || []),
      { ...found, checkbox: false },
    ]);
    setSelectedAccount('');
  };

  // Remove selected accounts
  const handleDeleteSelectedAccounts = () => {
    dispatch(deleteAccountFromAddedAccounts());
  };

  // Remove all accounts
  const handleClearBatch = () => {
    dispatch(deleteAddedAccounts());
  };

  // Checkbox toggle for accounts
  const handleCheckboxChange = (id: string) => {
    dispatch(toggleAccountCheckbox({ id }));
  };

  // Checkbox toggle for subgroups
  const handleSubGroupCheckboxChange = (subGroupIndex: number, id: string) => {
    dispatch(togglesubGroupAccountsCheckbox({ subGroupIndex, id }));
  };

  // Remove all subgroups
  const handleDeleteAllSubGroups = () => {
    dispatch(deleteAllSubGroupAccounts());
  };

  // Remove subgroup by index
  const handleDeleteSubGroupAccountByIndex = (index: number) => {
    dispatch(deleteSubGroupAccountByIndex({ index }));
  };

  // Remove selected accounts from subgroup
  const handleDeleteAccountsFromSubGroup = (index: number) => {
    dispatch(deleteAccountsFromSubGroup({ index }));
  };

  // Delete entire account group
  const deleteAccountGroup = () => {
    handleDeleteAllSubGroups();
    handleClearBatch();
    handleDeleteSelectedAccounts();
    router.push('/account-groups');
  };

  // Create subgroup handler
  const handleCreateSubGroup = (name: string, value: string) => {
    const foundAccount = ACCOUNT_LIST.find((account) => account.id === value);
    if (!foundAccount) return;

    dispatch(
      createSubGroup({
        subGroupName: name,
        account: foundAccount,
      }),
    );
  };

  // Rename subgroup handler: populate input + set rename mode
  const handleRenameSubGroup = (index: number, name: string) => {
    setSubGroupsMode('edit');
    setSubGroupName(name);
    setSelectedSubGroupAccount('');
    setRenamingSubGroupIndex(index);
  };

  // Subgroups header: CANCEL
  const handleSubGroupsCancel = () => {
    setSubGroupsMode('review');
    setSubGroupName('');
    setSelectedSubGroupAccount('');
    setRenamingSubGroupIndex(null);
  };

  // Subgroups header: SAVE (applies rename if in rename mode)
  const handleSubGroupsSave = () => {
    if (renamingSubGroupIndex !== null) {
      const trimmed = subGroupName.trim();
      if (trimmed) {
        dispatch(renameSubGroup({ index: renamingSubGroupIndex, name: trimmed }));
        setSnackbarMessage(t('renameSuccess') || 'Sub-group renamed successfully');
        setSnackbarOpen(true);
      }
    }

    setSubGroupsMode('review');
    setSubGroupName('');
    setSelectedSubGroupAccount('');
    setRenamingSubGroupIndex(null);
  };

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
      { href: '/account-groups/manage', label: t('manageAccountGroup') },
    ],
    [t],
  );

  return (
    <section className={styles.container} data-testid={buildTestId(testIdPrefix, 'container')}>
      <Box data-testid={buildTestId(testIdPrefix, 'breadcrumb')}>
        <BreadcrumbList links={breadcrumbLinks} />
      </Box>

      <Grid
        size={12}
        className={styles.headerRow}
        data-testid={buildTestId(testIdPrefix, 'header-row')}
      >
        <Box data-testid={buildTestId(testIdPrefix, 'page-heading')}>
          <Heading as="h4" fontSize="28px">
            {t('manageAccountGroup')}
          </Heading>
        </Box>
      </Grid>

      {showSuccessScreen ? (
        <Box
          data-testid={buildTestId(testIdPrefix, 'success-screen')}
          sx={{
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            padding: '64px 48px',
            textAlign: 'center',
            mt: 4,
          }}
        >
          <Box sx={{ mb: 3 }} data-testid={buildTestId(testIdPrefix, 'success-icon')}>
            <Box
              sx={{
                width: 96,
                height: 96,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
              }}
            >
              <Image src={AvatarAlertSuccess} alt="Info" width={100} height={100} />
            </Box>
          </Box>

          <Box data-testid={buildTestId(testIdPrefix, 'success-heading')}>
            <Heading as="h4" fontSize="24px">
              {t('success')}
            </Heading>
          </Box>

          <Box
            data-testid={buildTestId(testIdPrefix, 'success-message')}
            sx={{ fontSize: '16px', color: '#6B7280', maxWidth: 520, mx: 'auto' }}
          >
            [{accountGroupDetails?.accountGroupName}] {t('accountGroupSueessMessage')}
          </Box>
        </Box>
      ) : (
        <>
          <Box>
            <CreateJournyForm
              testIdPrefix={buildTestId(testIdPrefix, 'account-group-details')}
              onChange={handleChange}
              mode={'review'}
              ShowActionBtns={false}
              renderWithRHF
              formMethods={methodsDetails}
              syncOnChange={false}
              sections={[
                {
                  title: t('accountGroupDetails'),
                  titleIcon: '',
                  titleIconEelement: (
                    <Icon
                      name="user"
                      width="24px"
                      height="24px"
                      bgColor={theme.palette.text.secondary}
                    />
                  ),
                  fields: accountFields as any,
                  ShowActionBtns: true,
                  readOnly: true,
                },
              ]}
              onSubmit={handleSaveAccountGroupDetails}
              onValidationFail={() => {}}
            />
          </Box>

          {/* ADD ACCOUNTS */}
          <Box data-testid={buildTestId(testIdPrefix, 'add-accounts-section')}>
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
              headerActions={
                addAccountsMode === 'review' ? (
                  <Box display="flex" alignItems="center" gap={1}>
                    <Button
                      buttonVariant="tertiary"
                      onClick={() => setAddAccountsMode('edit')}
                      startIcon={<Image src={PencilIcon} alt="Rename" width={24} height={24} />}
                      style={{ padding: '6px 16px', minWidth: '32px', height: '32px' }}
                      data-testid={buildTestId(testIdPrefix, 'add-accounts-edit')}
                    >
                      {t('edit')}
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <Button
                      buttonVariant="text"
                      onClick={() => setAddAccountsMode('review')}
                      startIcon={<Image src={IcnCloseIcon} alt="close" width={24} height={24} />}
                      style={{ padding: '6px 16px', minWidth: '32px', height: '32px' }}
                      data-testid={buildTestId(testIdPrefix, 'add-accounts-cancel')}
                    >
                      CANCEL
                    </Button>
                    <Button
                      buttonVariant="text"
                      onClick={() => setAddAccountsMode('review')}
                      startIcon={<Image src={IcnSaveIcon} alt="save" width={24} height={24} />}
                      style={{ padding: '6px 16px', minWidth: '32px', height: '32px' }}
                      data-testid={buildTestId(testIdPrefix, 'add-accounts-save')}
                    >
                      SAVE
                    </Button>
                  </Box>
                )
              }
            >
              {addAccountsMode === 'edit' && (
                <>
                  <Box
                    className={styles.accountDropdownContainer}
                    data-testid={buildTestId(testIdPrefix, 'add-accounts-dropdown-container')}
                  >
                    <Box
                      className={styles.accountDropdown}
                      data-testid={buildTestId(testIdPrefix, 'add-accounts-dropdown')}
                    >
                      <AccountInfoDropdown
                        label={t('searchToSelectAccounts')}
                        value={selectedAccount || ''}
                        options={ACCOUNT_INFO_OPTIONS}
                        onChange={(e: any) => setSelectedAccount(e.target.value)}
                        iconChevronDown={IconChevronDown}
                        startIcon={IconSearch}
                        fullWidth
                      />
                    </Box>
                  </Box>

                  <Box
                    className={styles.batchBtnContainer}
                    data-testid={buildTestId(testIdPrefix, 'add-accounts-actions')}
                  >
                    {accountGroupDetails?.addAccounts?.length > 0 && (
                      <Button
                        buttonVariant="tertiary"
                        startIcon={<Icon name="delete" width="24" height="24" bgColor="#0051FF" />}
                        onClick={handleClearBatch}
                        data-testid={buildTestId(testIdPrefix, 'add-accounts-clear-batch')}
                      >
                        {t('clearBatch')?.toLocaleUpperCase()}
                      </Button>
                    )}
                    {selectedAccount !== '' && (
                      <Button
                        buttonVariant="secondary"
                        startIcon={<Icon name="add" width="24" height="24" bgColor="#0051FF" />}
                        onClick={handleAddAccount}
                        data-testid={buildTestId(testIdPrefix, 'add-accounts-add-account')}
                      >
                        {t('addAccount')}
                      </Button>
                    )}
                  </Box>
                </>
              )}

              {accountGroupDetails?.addAccounts?.length > 0 && (
                <Box sx={{ pt: 2 }} data-testid={buildTestId(testIdPrefix, 'added-accounts-batch')}>
                  <RHFProvider methods={methodsDetails} onSubmit={() => {}} asForm={false}>
                    <AccountGroupsBatch
                      accountData={accountGroupDetails.addAccounts}
                      edit={false}
                      isEditable={addAccountsMode === 'edit'}
                      handleCheckboxChange={handleCheckboxChange}
                      handleDeleteSubGroup={() => {}}
                      handleDeleteSelectedAccounts={handleDeleteSelectedAccounts}
                      index={0}
                    />
                  </RHFProvider>
                </Box>
              )}
            </UserCard>
          </Box>

          {/* SUB GROUPS */}
          <Box data-testid={buildTestId(testIdPrefix, 'sub-groups-section')}>
            <UserCard
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
                subGroupsMode === 'review' ? (
                  <Box display="flex" alignItems="center" gap={1}>
                    <Button
                      buttonVariant="tertiary"
                      onClick={() => setSubGroupsMode('edit')}
                      startIcon={<Image src={PencilIcon} alt="Rename" width={24} height={24} />}
                      style={{ padding: '6px 16px', minWidth: '32px', height: '32px' }}
                      data-testid={buildTestId(testIdPrefix, 'sub-groups-edit')}
                    >
                      {t('edit')}
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <Button
                      buttonVariant="text"
                      onClick={handleSubGroupsCancel}
                      startIcon={<Image src={IcnCloseIcon} alt="close" width={24} height={24} />}
                      style={{ padding: '6px 16px', minWidth: '32px', height: '32px' }}
                      data-testid={buildTestId(testIdPrefix, 'sub-groups-cancel')}
                    >
                      CANCEL
                    </Button>
                    <Button
                      buttonVariant="text"
                      onClick={handleSubGroupsSave}
                      startIcon={<Image src={IcnSaveIcon} alt="save" width={24} height={24} />}
                      style={{ padding: '6px 16px', minWidth: '32px', height: '32px' }}
                      data-testid={buildTestId(testIdPrefix, 'sub-groups-save')}
                    >
                      SAVE
                    </Button>
                  </Box>
                )
              }
            >
              {subGroupsMode === 'edit' && (
                <>
                  <Grid
                    container
                    spacing={2}
                    sx={{ py: 1 }}
                    data-testid={buildTestId(testIdPrefix, 'sub-groups-form')}
                  >
                    <Grid size={{ md: 12, lg: 4, xl: 6 }}>
                      <TextField
                        label={t('createASubGroup')}
                        value={subGroupName}
                        onChange={(e) => setSubGroupName(e.target.value)}
                        fullWidth
                        size="medium"
                        data-testid={buildTestId(testIdPrefix, 'sub-group-name-input')}
                      />
                    </Grid>

                    <Grid size={{ md: 12, lg: 8, xl: 6 }}>
                      <Box className={styles.accountDropdownContainer} sx={{ m: 0 }}>
                        <Box
                          className={styles.accountDropdown}
                          data-testid={buildTestId(testIdPrefix, 'sub-group-account-dropdown')}
                          sx={{
                            pointerEvents: isRenaming ? 'none' : 'auto',
                            opacity: isRenaming ? 0.5 : 1,
                          }}
                        >
                          <AccountInfoDropdown
                            label={t('allocateAccounts')}
                            value={selectedSubGroupAccount}
                            options={SUB_GROUP_ACCOUNT_INFO_OPTIONS}
                            onChange={(e: any) => setSelectedSubGroupAccount(e.target.value)}
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
                    data-testid={buildTestId(testIdPrefix, 'sub-groups-actions')}
                  >
                    {accountGroupDetails?.subGroups?.length > 0 && (
                      <Button
                        buttonVariant="tertiary"
                        startIcon={<Icon name="delete" width="24" height="24" bgColor="#0051FF" />}
                        onClick={handleDeleteAllSubGroups}
                        data-testid={buildTestId(testIdPrefix, 'sub-groups-clear-batch')}
                      >
                        {t('clearBatch')?.toLocaleUpperCase()}
                      </Button>
                    )}

                    {/* CREATE is only for create flow (not rename flow) */}
                    {!isRenaming && subGroupName !== '' && selectedSubGroupAccount && (
                      <Button
                        buttonVariant="secondary"
                        startIcon={<Icon name="add" width="24" height="24" bgColor="#0051FF" />}
                        onClick={() => {
                          handleCreateSubGroup(subGroupName, selectedSubGroupAccount);
                          setSelectedSubGroupAccount('');
                          setSubGroupName('');
                        }}
                        data-testid={buildTestId(testIdPrefix, 'create-sub-group')}
                      >
                        {t('createSubGroup')?.toLocaleUpperCase()}
                      </Button>
                    )}
                  </Box>
                </>
              )}

              {accountGroupDetails?.subGroups?.length > 0 &&
                accountGroupDetails?.subGroups?.map((account: SubGroup, index: number) => {
                  const key = getSubGroupKey(account, index);
                  const open = isSubGroupOpen(key);

                  return (
                    <Box key={key} data-testid={buildTestId(testIdPrefix, `subgroup-${index}`)}>
                      <Collapse
                        in={open}
                        timeout="auto"
                        unmountOnExit
                        data-testid={buildTestId(testIdPrefix, `subgroup-${index}-collapse`)}
                      >
                        <Box sx={{ pt: 2 }}>
                          <RHFProvider methods={methodsDetails} onSubmit={() => {}} asForm={false}>
                            <Box data-testid={buildTestId(testIdPrefix, `subgroup-${index}-batch`)}>
                              <AccountGroupsBatch
                                title={account.subGroupName}
                                accountData={account.subGroupAccounts}
                                edit={false}
                                accordion={true}
                                isEditable={subGroupsMode === 'edit'}
                                handleCheckboxChange={(id: string) =>
                                  handleSubGroupCheckboxChange(index, id)
                                }
                                handleDeleteSubGroup={() =>
                                  handleDeleteSubGroupAccountByIndex(index)
                                }
                                handleDeleteSelectedAccounts={() =>
                                  handleDeleteAccountsFromSubGroup(index)
                                }
                                handleRenameSubGroup={() =>
                                  handleRenameSubGroup(index, account.subGroupName)
                                }
                                index={index}
                              />
                            </Box>
                          </RHFProvider>
                        </Box>
                      </Collapse>
                    </Box>
                  );
                })}
            </UserCard>

            {/* Bottom actions */}
            <Box
              data-testid={buildTestId(testIdPrefix, 'bottom-actions')}
              sx={{
                mt: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <Box data-testid={buildTestId(testIdPrefix, 'bottom-left-actions')}>
                {(addAccountsMode === 'edit' || subGroupsMode === 'edit') && (
                  <Button
                    buttonVariant="text"
                    onClick={() => {
                      setAddAccountsMode('review');
                      setSubGroupsMode('review');
                      setRenamingSubGroupIndex(null);
                      setSubGroupName('');
                      setSelectedSubGroupAccount('');
                    }}
                    disabled={false}
                    startIcon={
                      <Image
                        src={IcnCloseIcon}
                        alt={t('cancel').toLowerCase()}
                        width={20}
                        height={20}
                      />
                    }
                    style={{ height: '48px', minHeight: '48px' }}
                    data-testid={buildTestId(testIdPrefix, 'bottom-cancel')}
                  >
                    {t('cancel').toLowerCase()}
                  </Button>
                )}
              </Box>

              <Box
                display="flex"
                justifyContent="flex-end"
                gap={2}
                data-testid={buildTestId(testIdPrefix, 'bottom-right-actions')}
              >
                <Button
                  buttonVariant="tertiary"
                  onClick={() => setDeleteAccountGroupOpen(true)}
                  startIcon={<Image src={DeleteIcon} alt="Delete" width={24} height={24} />}
                  style={{ padding: '6px 16px', minWidth: '32px', height: '32px' }}
                  data-testid={buildTestId(testIdPrefix, 'delete-account-group')}
                >
                  {t('deleteAccountGroup')}
                </Button>

                {(addAccountsMode === 'edit' || subGroupsMode === 'edit') && (
                  <Button
                    buttonVariant="primary"
                    onClick={() => {
                      setShowSuccessScreen(true);
                      setAddAccountsMode('review');
                      setSubGroupsMode('review');
                      setRenamingSubGroupIndex(null);
                      setSubGroupName('');
                      setSelectedSubGroupAccount('');
                    }}
                    disabled={false}
                    startIcon={
                      <Image
                        src={SaveIconGray}
                        alt={t('saveChanges').toLowerCase()}
                        width={24}
                        height={24}
                      />
                    }
                    style={{ padding: '6px 16px', minWidth: '32px', height: '32px' }}
                    data-testid={buildTestId(testIdPrefix, 'save-changes')}
                  >
                    {t('saveChanges')}
                  </Button>
                )}
              </Box>
            </Box>
          </Box>

          {/* Snackbar */}
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={4000}
            onClose={(_event, reason) => {
              if (reason === 'clickaway') return;
              setSnackbarOpen(false);
            }}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            className={styles['non-trans-audit-approve__snackbar']}
            data-testid={buildTestId(testIdPrefix, 'snackbar')}
          >
            <Alert
              severity="info"
              className={styles['non-trans-audit-approve__alert']}
              onClose={() => setSnackbarOpen(false)}
              data-testid={buildTestId(testIdPrefix, 'snackbar-alert')}
            >
              {snackbarMessage}
            </Alert>
          </Snackbar>

          <DeleteAccountGroupPopper
            open={deleteAccountGroupOpen}
            onClose={() => setDeleteAccountGroupOpen(false)}
            onPrimaryCTA={() => {
              deleteAccountGroup();
              setDeleteAccountGroupOpen(false);
            }}
            title={t('deleteAccountGroupTitle')}
            subMessage="Are you sure you want to delete this account group?"
            message={t('deleteAccountGroupConfirmation')}
            icon={AvatarAlert}
          />
        </>
      )}

      {showSuccessScreen ? (
        <Box
          data-testid={buildTestId(testIdPrefix, 'go-to-account-groups')}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            cursor: 'pointer',
            color: '#1C5ED7',
          }}
          onClick={() => router.push('/account-groups')}
        >
          <Image src={ListIcon} alt="Info" width={30} height={30} />
          <Typography
            data-testid={buildTestId(testIdPrefix, 'go-to-account-groups-text')}
            sx={{ color: '#1C5ED7', fontSize: '17px', lineHeight: '24px', fontWeight: 700 }}
          >
            {t('goToAccountGroups')?.toLocaleUpperCase()}
          </Typography>
        </Box>
      ) : null}
    </section>
  );
};

export default ManageAccountGroups;
