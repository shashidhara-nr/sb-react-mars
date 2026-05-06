'use client';
import { useCallback, useMemo, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import styles from './UserDetails.module.scss';
import JournyForm from 'components/common/JournyForm';
import { useForm } from 'react-hook-form';
import { RootState } from '@store/index';
import { useDispatch, useSelector } from 'react-redux';
import { Icon } from '@atoms/index';
import {
  buildUserAddressFields,
  buildUserPersonalFields,
  buildUserPhoneEmailFields,
  getUserPersonalFieldsValidationRules,
  getPhoneEmailFieldsValidationRules,
  buildUserPostalAddressFields,
} from 'src/utils/userDetails';
import FormActionButtons from 'components/common/formActionButtons';
import CancellationConfirmationDialog from 'components/common/CancellationConfirmationDialog';
import { buildTestId } from 'src/utils/testIds';
import SuccessCard from '@organisms/SuccessCard/SuccessCard';
import CreateUpdateUserSuccess from './CreateUpdateUserSuccess';
import DeleteConfirmationDialog from 'components/common/DeleteConfirmationDialog';
import { redirect } from 'next/navigation';
import { BuildTwoTone } from '@mui/icons-material';
import { Button } from 'dist/standard-bank-react';
import Image from 'next/image';
import { updateMobileCommunicationPermissions } from '@store/slices/userDetails';
import { IcnFloppy } from 'public/icons';
const testIdPrefix = 'user-personal-details';

const UserPersonalDetail = ({ mode }: { mode: string }) => {
  const t = useTranslations('userDetails');
  const isCreateMode = mode?.toLowerCase() === 'create';

  const userDetails = useSelector((state: RootState) => state.userDetails.details);
  const dispatch = useDispatch();
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogMessage, setErrorDialogMessage] = useState('');
  const [showPostalAddress, setShowPostalAddress] = useState(false);
  const [inReviewMode, setInReviewMode] = useState(false);
  const [manageUserFormAction, setManageUserFormAction] = useState<{
    finalReview: boolean;
    finalSubmersion: boolean;
  }>({
    finalReview: false,
    finalSubmersion: false,
  });
  const [manageUserCancelAction, setManageUserCancelAction] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createUpdateUserError, setCreateUpdateUserError] = useState({
    duplicateUser: false,
    duplicateUserRequest: false,
    error: false,
  });

  let userPersonalFields, userAddressFields, userPhoneEmailFields, userPostalAddressFields;

  const countryOptions: any[] = []; // Replace with actual country options data

  userPersonalFields = useMemo(() => buildUserPersonalFields(t, userDetails), [t, userDetails]);
  userAddressFields = useMemo(
    () => buildUserAddressFields(t, userDetails?.addressDetails),
    [t, userDetails],
  );
  userPhoneEmailFields = useMemo(
    () => buildUserPhoneEmailFields(t, userDetails?.phoneEmailDetails),
    [t, userDetails],
  );

  // Postal address fields (same structure as address fields)
  userPostalAddressFields = useMemo(
    () => buildUserPostalAddressFields(t, userDetails?.postalAddressDetails),
    [t, userDetails],
  );

  console.log(userPersonalFields, userAddressFields, userPhoneEmailFields, userPostalAddressFields);

  const detailsDefaultValues = { ...userDetails } as const;

  const methodsDetails = useForm({ mode: 'onTouched', defaultValues: detailsDefaultValues });
  const detailsValues = methodsDetails.getValues();

  const applyOverrides = (fieldsArr: any[], overrides: Record<string, any>) =>
    fieldsArr?.map((f: any) => {
      const nf: any = { ...f };
      if (f.type === 'multiChip') {
        const tname = f.multiTargetFieldName || f.name;
        const raw = overrides?.[tname];
        if (Array.isArray(raw)) nf.multiSelectedValues = raw;
        else if (typeof raw === 'string')
          nf.multiSelectedValues = raw
            .split(',')
            .map((s: string) => s.trim())
            .filter(Boolean);
        return nf;
      }
      if (Object.prototype.hasOwnProperty.call(overrides || {}, f.name))
        nf.value = overrides[f.name];
      if (f.type === 'amount') {
        const currencyName = f.amountCurrencyTargetName || `${f.name}Currency`;
        if (Object.prototype.hasOwnProperty.call(overrides || {}, currencyName))
          nf.amountCurrency = overrides[currencyName];
      }
      return nf;
    });

  const userPersonalFieldsOv = applyOverrides(userPersonalFields as any[], detailsValues as any);
  const userAddressFieldsOv = applyOverrides(userAddressFields as any[], detailsValues as any);
  const userPhoneEmailFieldsOv = applyOverrides(
    userPhoneEmailFields as any[],
    detailsValues as any,
  );
  const userPostalAddressFieldsOv = applyOverrides(
    userPostalAddressFields as any[],
    detailsValues as any,
  );

  const handleConfirmCancel = () => {};
  const handleChange = (name: string, value: unknown) => {
    // Check if this is the postal address checkbox field
    if (name === 'postalAddressCheck') {
      // If checkbox value is true, show postal address section; otherwise hide it
      const isChecked = !!value;
      setShowPostalAddress(isChecked);
    }

    if (['mobileCommunicationPermissions', 'emailUsage'].includes(name)) {
      dispatch(updateMobileCommunicationPermissions(value));
    }
  };

  const handleReviewAndSubmit = useCallback(() => {
    // Validate the form before moving to review mode
    methodsDetails.handleSubmit(() => {
      setInReviewMode(true);
    })();
  }, [methodsDetails]);

  const handleEditAgain = useCallback(() => {
    // Go back to edit mode
    setInReviewMode(false);
  }, []);

  const handleFinalSubmit = useCallback(() => {
    // Final submission logic
    if (isCreateMode) {
      setManageUserFormAction({ finalReview: true, finalSubmersion: false });
    } else {
      const formData = methodsDetails.getValues();
      console.log('Submitting form data:', formData);
    }
    // Add your submission logic here
  }, [methodsDetails, isCreateMode]);

  const handleNext = useCallback(() => {}, []);

  const handleCancel = useCallback(() => {
    // Handle cancel logic here

    if (manageUserFormAction.finalReview && isCreateMode) {
      setManageUserCancelAction(true);
    }

    // redirect('/user-details')
  }, [manageUserFormAction, isCreateMode]);

  // Determine the current mode based on create flow and review state
  const currentMode = mode === 'create' ? (inReviewMode ? 'review' : 'edit') : 'review';

  // Rules provider for form validation
  const rulesProvider = useCallback(
    (fieldName: string, getAllValues: () => any) => {
      // Try phone/email validation first
      const phoneFields = ['mobilePhoneNumber', 'homePhoneNumber', 'emailAddress'];
      if (phoneFields.includes(fieldName)) {
        return getPhoneEmailFieldsValidationRules(fieldName, t);
      }
      // Otherwise try personal details validation
      const personalFields = [
        'userId',
        'firstName',
        'lastName',
        'identificationType',
        'identificationNumber',
        'language',
      ];
      if (personalFields.includes(fieldName)) {
        return getUserPersonalFieldsValidationRules(fieldName, t);
      }
      // No validation for other fields
      return {};
    },
    [t],
  );

  // Watch checkbox field and update showPostalAddress state
  useEffect(() => {
    const subscription = methodsDetails.watch((value: any) => {
      const checkboxValue = (value as any)?.postalAddressCheck;
      if (checkboxValue !== undefined && checkboxValue !== null) {
        setShowPostalAddress(!!checkboxValue);
      }
    });
    return () => subscription.unsubscribe();
  }, [methodsDetails]);

  const handelNext = () => {
    methodsDetails.handleSubmit((data) => {
      console.log('form data', data);

      if (isCreateMode) {
        if (manageUserFormAction.finalReview) {
          setManageUserFormAction({ ...manageUserFormAction, finalSubmersion: true });
        } else {
          setManageUserFormAction({
            ...manageUserFormAction,
            finalSubmersion: false,
            finalReview: true,
          });
          setInReviewMode(true);
        }
      } else if (!isCreateMode) {
        setManageUserFormAction({
          ...manageUserFormAction,
          finalSubmersion: true,
          finalReview: false,
        });
        setInReviewMode(true);
      }
      // handleEditAgain();
      // handleReviewAndSubmit();
      // handleFinalSubmit();
    })();
  };

  const handleDeleteOpen = useCallback(() => {
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteClose = useCallback(() => setDeleteDialogOpen(false), []);

  const editHandler = () => {
    if (isCreateMode && manageUserFormAction.finalReview) {
      setManageUserFormAction({ ...manageUserFormAction, finalReview: false });
    }
    setInReviewMode(false);
  };
  const deleteItemLabel = useMemo(() => {
    if (createUpdateUserError.error) {
      return {
        title: t('systemError'),
        itemLabel1: t('systemErrorHeading'),
        itemLabel2: t('somethingWentWrongDesc'),
        primaryCTALabel: t('tryAgain'),
        secondaryCTALabel: t('cancel'),
      };
    }
    if (createUpdateUserError.duplicateUser) {
      return {
        title: t('duplicateUser'),
        itemLabel1: t('thisUserAlreadyExists'),
        itemLabel2: t('aUserAlreadyExistsWithThisUserId'),
        primaryCTALabel: '',
        secondaryCTALabel: t('cancel'),
      };
    }
    if (createUpdateUserError.duplicateUserRequest) {
      return {
        title: t('duplicateRequest'),
        itemLabel1: t('activeRequestAlreadyExists'),
        itemLabel2: t('thereIsAlreadyAnActiveRequestForThisUser'),
        primaryCTALabel: '',
        secondaryCTALabel: t('cancel'),
      };
    }
  }, [t, createUpdateUserError]);
  return (
    <section className={styles.container}>
      {manageUserFormAction.finalSubmersion ? (
        <CreateUpdateUserSuccess isCreateMode={isCreateMode} testIdPrefix={testIdPrefix} />
      ) : (
        <>
          <JournyForm
            onChange={handleChange}
            mode={currentMode}
            ShowActionBtns={!inReviewMode}
            renderWithRHF
            formMethods={methodsDetails}
            syncOnChange={true}
            rulesProvider={rulesProvider}
            editHandler={editHandler}
            sections={[
              {
                title: t('personalDetails'),
                titleIcon: '',
                titleIconEelement: (
                  <Icon name="userAccount" width="20px" height="20px" bgColor="#222E37" />
                ),
                fields: userPersonalFieldsOv as any,
                ShowActionBtns: isCreateMode && inReviewMode ? true : !isCreateMode,
                //  || !(mode === 'create' && currentMode === 'edit' && !inReviewMode),
                // readOnly: mode !== 'create',
              },
              {
                title: t('addressDetails'),
                titleIcon: '',
                titleIconEelement: (
                  <Icon name="locator" width="24px" height="24px" bgColor="#222E37" />
                ),
                fields: (userAddressFieldsOv as any)?.map((f: any) =>
                  f.name === 'countryCode'
                    ? { ...f, type: 'select', lookupBtn: true, options: countryOptions }
                    : f,
                ),
                ShowActionBtns: false,
              },

              ...(showPostalAddress
                ? [
                    {
                      title: t('postalAddressDetails'),
                      titleIcon: '',
                      titleIconEelement: (
                        <Icon name="locator" width="24px" height="24px" bgColor="#222E37" />
                      ),
                      fields: (userPostalAddressFieldsOv as any)
                        ?.map((f: any) => ({
                          ...f,
                          name: `${f.name}`,
                          label: f.label,
                          required: showPostalAddress ? f.required : false,
                        }))
                        .map((f: any) =>
                          f.name === 'countryCode'
                            ? { ...f, type: 'select', lookupBtn: true, options: countryOptions }
                            : f,
                        ),
                      ShowActionBtns: false,
                    },
                  ]
                : []),
              {
                title: t('phoneEmailDetails'),
                titleIcon: '',
                titleIconEelement: (
                  <Icon name="tower" width="24px" height="24px" bgColor="#222E37" />
                ),
                fields: userPhoneEmailFieldsOv as any,
                ShowActionBtns: false,
              },
            ]}
            onSubmit={(data: any) => {
              if (!isCreateMode) {
                setManageUserFormAction({ ...manageUserFormAction, finalReview: true });
                setInReviewMode(true);
              }
              Object.entries(data || {}).forEach(([name, value]) => handleChange(name, value));
            }}
            onValidationFail={() => {
              setErrorDialogMessage('Please correct the highlighted fields and try again.');
              setErrorDialogOpen(true);
            }}
          />
          {(isCreateMode || (!isCreateMode && manageUserFormAction.finalReview)) && (
            <FormActionButtons
              testIdPrefix={testIdPrefix}
              nextText={
                isCreateMode && manageUserFormAction.finalReview
                  ? t('submitUserForApproval')
                  : isCreateMode
                    ? t('reviewAndSubmit')
                    : !isCreateMode && manageUserFormAction.finalReview
                      ? t('submitChangesForApproval')
                      : ''
              }
              cancelText={t('cancel')}
              onCancel={handleCancel}
              onNext={handelNext}
            >
              {isCreateMode && manageUserFormAction.finalReview && (
                <Button
                  buttonVariant={'text'}
                  data-testid={buildTestId(testIdPrefix, 'assign-account-to-user')}
                  sx={{
                    fontSize: '11px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                  }}
                  onClick={() => {}}
                  startIcon={
                    <Image
                      src={IcnFloppy}
                      alt={t('saveToDraft').toLowerCase()}
                      width={24}
                      height={24}
                    />
                  }
                  style={{
                    height: '48px',
                    minHeight: '48px',
                    width: 'auto',
                    marginRight: '16px',
                  }}
                >
                  {t('saveToDraft')}
                </Button>
              )}
            </FormActionButtons>
          )}
        </>
      )}

      <CancellationConfirmationDialog
        open={manageUserCancelAction}
        onClose={() => setManageUserCancelAction(false)}
        onDismiss={() => setManageUserCancelAction(false)}
        onCancel={handleConfirmCancel}
        heading={t('cancelConfirmationTitle')}
        subheading={t('cancelConfirmationDesc')}
        dismissLabel={t('dismiss').toLocaleUpperCase()}
        cancelLabel={t('yesCancel').toLocaleUpperCase()}
        testIdPrefix={buildTestId(testIdPrefix, 'cancel-confirmation-dialog')}
      />
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleDeleteClose}
        onPrimaryCTA={handleDeleteClose}
        onSecondaryCTA={handleDeleteClose}
        selectedCount={0}
        title={deleteItemLabel?.title}
        itemLabel={deleteItemLabel?.itemLabel1}
        itemLabel2={deleteItemLabel?.itemLabel2}
        primaryCTALabel={deleteItemLabel?.primaryCTALabel}
        secondaryCTALabel={deleteItemLabel?.secondaryCTALabel}
        markedCount={0}
      />
      {/* <Dialog open={errorDialogOpen} onClose={() => setErrorDialogOpen(false)}>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>{errorDialogMessage}</DialogContent>
        <DialogActions>
          <Button onClick={() => setErrorDialogOpen(false)} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog> */}
    </section>
  );
};
export default UserPersonalDetail;
