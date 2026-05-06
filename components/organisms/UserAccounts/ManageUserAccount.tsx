'use client';
import { useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import styles from './UserAccounts.module.scss';
import { Grid, useTheme, Box } from '@mui/material';
import { BreadcrumbList } from 'components/lib/Page/Breadcrumb';
import { Heading } from 'components/lib/Page';
import JournyForm from 'components/common/JournyForm';
import { useForm } from 'react-hook-form';
import { RootState } from '@store/index';
import { useSelector } from 'react-redux';
import { Icon } from '@atoms/index';
import { useSearchParams } from 'next/navigation';
import { Button } from 'components/lib/Forms';
import { buildManageUserAccountFields, buildManageUserAccountRoleFields, buildManageUserAccountAddressFields, buildManageUserAccountCommunicationFields } from 'src/utils/manageUserAccount';
import DeleteConfirmationDialog from 'components/common/DeleteConfirmationDialog';
import { CommonSnackbar } from 'components/common';
import SuccessCard from '@organisms/SuccessCard/SuccessCard';

const ManageUserAccount = () => {
  const t = useTranslations('userAccounts');
  const theme = useTheme();
  const searchParams = useSearchParams();
  const userAccountId = searchParams?.get('userAccountId');
  const mode = searchParams?.get('mode');
  const userAccountDetails = useSelector((state: RootState) => state.userAccountDetails.details);
  const userAccountDetailsFields = useMemo(() => buildManageUserAccountFields(t, userAccountDetails), [t, userAccountDetails]);
  const userAccountRoleFields = useMemo(() => buildManageUserAccountRoleFields(t, userAccountDetails), [t, userAccountDetails]);
  const userAccountAddressFields = useMemo(() => buildManageUserAccountAddressFields(t, userAccountDetails), [t, userAccountDetails]);
  const userAccountCommunicationFields = useMemo(() => buildManageUserAccountCommunicationFields(t, userAccountDetails), [t, userAccountDetails]);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogType, setConfirmDialogType] = useState<'delete' | 'suspend' | 'cancel' | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [alertType, setAlertType] = useState('');
  const [dataSaved, setDataSaved] = useState(false);

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

  const userAccountDetailsFieldsOv = applyOverrides(userAccountDetailsFields as any[], detailsValues as any);
  const userAccountRoleFieldsOv = applyOverrides(userAccountRoleFields as any[], detailsValues as any);
  const userAccountAddressFieldsOv = applyOverrides(userAccountAddressFields as any[], detailsValues as any);
  const userAccountCommunicationFieldsOv = applyOverrides(userAccountCommunicationFields as any[], detailsValues as any);

  const breadcrumbLinks = useMemo(
    () => [
      { href: '/', label: t('dashboard') },
      { href: '/user-accounts', label: t('userAccounts') },
      { href: '/user-accounts/manage-user-account', label: `${t(userAccountId ? 'manage' : 'create')} ${t('userAccount')?.toLocaleLowerCase()}` },
    ],
    [t, userAccountId],
  );

  const handleChange = () => {
    if (mode === 'edit') {
      setDataSaved(true);
    }
  };

  const editDetails = (sectionParam: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('mode', 'edit');
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
    setEditingSection(sectionParam);
    setDataSaved(false);
  };

  const cancelEdit = () => {
    setConfirmDialogType('cancel');
    setConfirmDialogOpen(true);
  };

  const handleSubmitChangesForApproval = () => {
    setAlertType('submitForApproval');
    setShowInfo(true);
    setDataSaved(false);
  };

  const handleConfirmDialogOpen = useCallback((type: 'delete' | 'suspend') => {
    setConfirmDialogType(type);
    setAlertType(type);
    setConfirmDialogOpen(true);
  }, []);

  const handleConfirmDialogClose = () => {
    setConfirmDialogOpen(false);
    setConfirmDialogType(null);
  };

  const handleConfirmDialogConfirm = () => {
    if (confirmDialogType === 'cancel') {
      const params = new URLSearchParams(searchParams?.toString() || '');
      params.delete('mode');
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, '', newUrl);
      setEditingSection(null);
      setDataSaved(false);
    } else {
      setShowInfo(true);
      setSnackbarOpen(true);
    }
    setConfirmDialogOpen(false);
    setConfirmDialogType(null);
  };

  const successCardConfig = useMemo(() => {
    switch (alertType) {
      case 'delete':
        return {
          title: t('success'),
          message: t('userAccountDeletedSuccess'),
          note: t('userAccountDeletedNote'),
        };
      case 'suspend':
        return {
          title: t('success'),
          message: t('userAccountSuspendSuccess'),
          note: t('userAccountSuspendedNote'),
        };
      case 'submitForApproval':
        return {
          title: t('success'),
          message: t('userAccountEditedSuccess'),
          note: '',
        };
      default:
        return {
          title: t('success'),
          message: '',
          note: '',
        };
    }
  }, [alertType, t]);

  const dialogConfig = useMemo(() => {
    switch (confirmDialogType) {
      case 'delete':
        return {
          title: t('deletionConfirmation'),
          message: t('deleteConfirmation'),
          primaryCTALabel: t('yesDelete'),
        };
      case 'suspend':
        return {
          title: t('suspensionConfirmation'),
          message: t('suspensionMessage'),
          primaryCTALabel: t('yesSuspend'),
        };
      case 'cancel':
        return {
          title: t('cancellationConfirmation'),
          message: t('cancellationMessage'),
          message2: t('cancellationMessage2'),
          primaryCTALabel: t('yesCancel'),
        };
      default:
        return {
          title: '',
          message: '',
          primaryCTALabel: '',
        };
    }
  }, [confirmDialogType, t]);

  return (
    <div className={styles.container}>
      <BreadcrumbList links={breadcrumbLinks} />
      <Grid
        size={12}
        className={styles.headerRow}
      >
        <Heading as="h4" fontSize="28px">
          {`${t(userAccountId ? 'manage' : 'create')} ${userAccountId ? '[User Account name]' : ''} ${t('userAccount')?.toLocaleLowerCase()}`}
        </Heading>
      </Grid>

      {showInfo ? <SuccessCard
        title={successCardConfig.title}
        message={successCardConfig.message}
        note={successCardConfig.note}
        ctaLink="/user-accounts"
        ctaText={t('goToUserAccounts')}
        showCtaLink={true}
      /> :
        <>
          <JournyForm
            onChange={handleChange}
            mode={mode && editingSection === "userAccountDetails" ? 'edit' : 'view'}
            ShowActionBtns={true}
            renderWithRHF
            formMethods={methodsDetails}
            syncOnChange={false}
            onSubmit={(data) => setDataSaved(true)}
            editHandler={() => editDetails("userAccountDetails")}
            sections={[
              {
                title: t('userAccountDetails'),
                titleIcon: "",
                titleIconEelement: <Icon name="userAccount" width="20px" height="20px" bgColor={theme.palette.text.secondary} />,
                fields: userAccountDetailsFieldsOv as any,
                ShowActionBtns: true
              }
            ]}
          />
          <JournyForm
            onChange={handleChange}
            mode={mode && editingSection === "userAccountRole" ? 'edit' : 'view'}
            ShowActionBtns={true}
            renderWithRHF
            formMethods={methodsDetails}
            syncOnChange={false}
            onSubmit={(data) => setDataSaved(true)}
            editHandler={() => editDetails("userAccountRole")}
            sections={[
              {
                title: t('assignedUserRoles'),
                titleIcon: "",
                titleIconEelement: <Icon name="user" width="20px" height="20px" bgColor={theme.palette.text.secondary} />,
                fields: userAccountRoleFieldsOv as any,
                ShowActionBtns: true
              },
              {
                title: t('addressDetails'),
                titleIcon: "",
                titleIconEelement: <Icon name="address" width="20px" height="20px" bgColor={theme.palette.text.secondary} />,
                fields: userAccountAddressFieldsOv as any,
                ShowActionBtns: false
              },
              {
                title: t('phoneAndEmailDetails'),
                titleIcon: "",
                titleIconEelement: <Icon name="phone" width="20px" height="20px" bgColor={theme.palette.text.secondary} />,
                fields: userAccountCommunicationFieldsOv as any,
                ShowActionBtns: false
              }
            ]}
          />
          <Grid size={12} className={styles.btnContainer}>
            {mode === 'edit' ? (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <Button
                  buttonVariant="text"
                  onClick={cancelEdit}
                  sx={{
                    color: '#0051FF',
                    fontSize: '12px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                  }}
                >
                  {t('cancel')?.toLocaleUpperCase()}
                </Button>
                {dataSaved && (
                  <Button
                    buttonVariant="primary"
                    onClick={handleSubmitChangesForApproval}
                    sx={{
                      fontSize: '12px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      padding: '10px 24px',
                    }}
                  >
                    {t('submitChangesForApproval')?.toLocaleUpperCase() || 'SUBMIT CHANGES FOR APPROVAL'}
                  </Button>
                )}
              </Box>
            ) : (
              <>
                <Button
                  buttonVariant="text"
                  onClick={() => handleConfirmDialogOpen("delete")}
                  startIcon={<Icon name="delete" width="24px" height="24px" bgColor={theme.palette.secondary.main} />}
                >
                  {t('deleteUserAccount')?.toLocaleUpperCase()}
                </Button>
                <Button
                  buttonVariant="secondary"
                  onClick={() => handleConfirmDialogOpen("suspend")}
                  startIcon={<Icon name="cancel" width="24px" height="24px" bgColor={theme.palette.primary.main} />}
                >
                  {t('suspendUserAccount')?.toLocaleUpperCase()}
                </Button>
              </>
            )}
          </Grid>
          <DeleteConfirmationDialog
            open={confirmDialogOpen}
            onClose={handleConfirmDialogClose}
            onPrimaryCTA={handleConfirmDialogConfirm}
            onSecondaryCTA={handleConfirmDialogClose}
            selectedCount={0}
            markedCount={0}
            title={dialogConfig.title}
            itemLabel=""
            itemLabel2={dialogConfig.message}
            itemLabel3={dialogConfig.message2 || dialogConfig.message}
            primaryCTALabel={dialogConfig.primaryCTALabel}
          />
        </>
      }

    </div>
  );
};

export default ManageUserAccount;
