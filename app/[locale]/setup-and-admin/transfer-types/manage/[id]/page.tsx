'use client';

import  React,{useState,useEffect,useMemo,useCallback} from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@lib/hooks/useAppDispatch';
import { shallowEqual } from 'react-redux';
import { Box, Typography, Grid, Button } from '@mui/material';
import Image from 'next/image';
import DeleteIcon from 'public/icons/icn_bin.svg';
import DeleteConfirmationDialog from 'components/common/DeleteConfirmationDialog';
import AvatarAlert from 'public/icons/avatar_alert.svg';
import { Breadcrumb } from 'dist/standard-bank-react';
import { useTranslations } from 'next-intl';
import {
  FormFooterActions,
} from 'components/molecules';
import { TransferTypeFormState, TransferTypeFormWrapper } from '@molecules/TransferTypeForm';
import { RootState } from '@store/index';
import { buildTestId } from 'src/utils/testIds';
import { transferTypesRoute, getTransferTypeBreadcrumbs, TRANSFER_TYPE_PAGE, INITIAL_FORM_STATE } from '../../transferTypeHelper';
import { fetchTransferTypeById, updateTransferTypeThunk, deleteTransferTypesThunk } from '@store/slices/setup-admin/transferTypes/transferTypesSlice';
import { transferTypeZodSchema } from 'utils/transferTypeLogic';
import { fetchAuthorisationProfiles } from '@store/slices/setup-admin/commonSlice/authorisationProfileSlice';
import { fetchCustomerAgreement } from '@store/slices/setup-admin/commonSlice/customerAgreementSlice';
export default function ManageTransferType() {
  const testIdPrefix = 'transfer-types-manage';
  const router = useRouter();
  const t = useTranslations('transferType');
  const params = useParams();
  const idParam = (params as any)?.id as string | string[] | undefined;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  const dispatch = useAppDispatch();
  const { selectedTransferType, isSelectedLoading, selectedError, isUpdating, isDeleting } = useAppSelector(
    (state) => ({
      selectedTransferType: state.transferTypes.selectedTransferType,
      isSelectedLoading: state.transferTypes.isSelectedLoading,
      selectedError: state.transferTypes.selectedError,
      isUpdating: state.transferTypes.isUpdating,
      isDeleting: state.transferTypes.isDeleting,
    }),
    shallowEqual
  );
  const [form, setForm] = useState<TransferTypeFormState>(INITIAL_FORM_STATE);
  const [originalForm, setOriginalForm] = useState<TransferTypeFormState>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [isEditingAny, setIsEditingAny] = useState<boolean>(false);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isDirty, setIsDirty] = useState<boolean>(false);

  const startEdit = useCallback(() => {
    setIsEditingAny(true);
  }, []);
  
  const checkForChanges = useCallback((currentForm: TransferTypeFormState) => {
    return Object.keys(currentForm).some(
      key => currentForm[key as keyof TransferTypeFormState] !== originalForm[key as keyof TransferTypeFormState]
    );
  }, [originalForm]);
  
  const endEdit = useCallback(() => {
    const hasChanges = checkForChanges(form);
    setIsEditingAny(hasChanges);
    setIsDirty(false);
    setErrors({});
  }, [form, checkForChanges]);

  const validateRequiredFields = useCallback((newForm: TransferTypeFormState): Record<string, string> => {
    const fieldErrors: Record<string, string> = {};
    if (!newForm.transferTypeName) {
      fieldErrors.transferTypeName = 'Transfer type name is required';
    }
    if (!newForm.authorisationProfile) {
      fieldErrors.authorisationProfile = 'Authorisation profile is required';
    }
    if (!newForm.payerCustomerAgreement) {
      fieldErrors.payerCustomerAgreement = 'Customer agreement is required';
    }
    if (!newForm.payerAccount) {
      fieldErrors.payerAccount = 'Account is required';
    }
    if (!newForm.paymentCustomerAgreement) {
      fieldErrors.paymentCustomerAgreement = 'Customer agreement is required';
    }
    if (!newForm.paymentAccount) {
      fieldErrors.paymentAccount = 'Account is required';
    }

    return fieldErrors;
  }, []);

  const validateDependencies = useCallback((newForm: TransferTypeFormState, isFormDirty: boolean): Record<string, string> => {
    const fieldErrors: Record<string, string> = {};

    // Show error for payer account if account is selected without agreement, or if form is dirty and no agreement is selected
    if (!newForm.payerCustomerAgreement && (newForm.payerAccount || isFormDirty)) {
      fieldErrors.payerAccount = 'Please select customer agreement first before select account';
    }

    // Show error for payment account if account is selected without agreement, or if form is dirty and no agreement is selected
    if (!newForm.paymentCustomerAgreement && (newForm.paymentAccount || isFormDirty)) {
      fieldErrors.paymentAccount = 'Please select customer agreement first before select account';
    }

    return fieldErrors;
  }, []);

  const isFormValid = useMemo(() => {
    const validation = transferTypeZodSchema.safeParse(form);
    return validation.success;
  }, [form]);

  useEffect(() => {
    if (!id) return;
    dispatch(fetchTransferTypeById(String(id)) as any);
    dispatch(fetchAuthorisationProfiles() as any);
    dispatch(fetchCustomerAgreement({ service: 'InterAccountTransfer' }) as any);
  }, [dispatch, id]);

  useEffect(() => {
    if (!selectedTransferType) return;
    const payerAccountKey = selectedTransferType.accountKeys?.[0]?.toString() ?? '';
    const paymentAccountKey = selectedTransferType.creditAccountKeys?.[0]?.toString() ?? '';

    const hydratedForm: TransferTypeFormState = {
      transferTypeName: selectedTransferType.transferTypeName ?? '',
      authorisationProfile: selectedTransferType.authorisationProfile ?? '',
      // Map the agreement key to both payer and payment (best-effort until API provides separate payer/payment agreements)
      payerCustomerAgreement: selectedTransferType.customerAgreement ?? '',
      paymentCustomerAgreement: selectedTransferType.customerAgreement ?? '',
      enforceAuditing: false,
      payerAccount: payerAccountKey,
      paymentAccount: paymentAccountKey,
    };
    
    setForm((prev) => {
      const same = Object.keys(hydratedForm).every(
        key => prev[key as keyof TransferTypeFormState] === hydratedForm[key as keyof TransferTypeFormState]
      );
      return same ? prev : hydratedForm;
    });
    
    // Store original form for comparison
    setOriginalForm(hydratedForm);
  }, [selectedTransferType]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedTransferType?.transferTypeKey || !selectedTransferType?.transferTypeName || selectedTransferType?.versionNumber === undefined) {
      setErrorMessage('Missing transfer type details for deletion');
      setErrorDialogOpen(true);
      setDeleteOpen(false);
      return;
    }

    try {
      const payload = [
        {
          transferTypeKey: selectedTransferType.transferTypeKey,
          name: selectedTransferType.transferTypeName,
          versionNumber: selectedTransferType.versionNumber,
        },
      ];

      await dispatch(deleteTransferTypesThunk(payload) as any).unwrap();
      
      // Close delete dialog and navigate to home page after successful deletion
      setDeleteOpen(false);
      router.push(transferTypesRoute.home as any);
    } catch (error: any) {
      const errorMsg = error?.message || error || 'Failed to delete transfer type';
      setErrorMessage(errorMsg);
      setErrorDialogOpen(true);
      setDeleteOpen(false);
    }
  }, [selectedTransferType, dispatch, router]);

  const handleReviewSubmit = useCallback(async () => {
    // Validate form before submitting for review
    const validation = transferTypeZodSchema.safeParse(form);
    
    if (!validation.success) {
      // Extract error messages and set them in the errors state
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue: any) => {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
      });
      // Also include dependency validation errors
      const dependencyErrors = validateDependencies(form, true);
      Object.assign(fieldErrors, dependencyErrors);
      setErrors(fieldErrors);
      return; // Don't navigate if validation fails
    }
    
    // If validation passes, proceed with update
    setErrors({});
    setSubmitting(true);
    
    try {
      if (!selectedTransferType?.transferTypeKey || selectedTransferType?.versionNumber === undefined) {
        setErrorMessage('Missing transfer type key or version number');
        setErrorDialogOpen(true);
        setSubmitting(false);
        return;
      }
      
      await dispatch(updateTransferTypeThunk({
        transferTypeKey: selectedTransferType.transferTypeKey,
        formData: form,
        versionNumber: selectedTransferType.versionNumber,
      }) as any).unwrap();
      
      // Navigate to success page only on successful update with MANAGE pageType
      const successUrl = `${transferTypesRoute.success}?pageType=MANAGE&managePageHeading=${encodeURIComponent(selectedTransferType.transferTypeName || '')}`;
      router.push(successUrl as any);
    } catch (error: any) {
      const errorMsg = error?.message || error || 'Failed to update transfer type';
      setErrorMessage(errorMsg);
      setErrorDialogOpen(true);
    } finally {
      setSubmitting(false);
    }
  }, [form, selectedTransferType, dispatch, router, validateDependencies]);

  const handleErrorRetry = useCallback(() => {
    setErrorDialogOpen(false);
    handleReviewSubmit();
  }, [handleReviewSubmit]);

  const handleErrorDismiss = useCallback(() => {
    setErrorDialogOpen(false);
    setErrorMessage('');
  }, []);

  const breadcrumbLinks = useMemo(
    () => getTransferTypeBreadcrumbs(TRANSFER_TYPE_PAGE.MANAGE, t),
    [t]
  );

  const handleFormChange = useCallback((newForm: TransferTypeFormState) => {
    setForm(newForm);
    
    const isFirstChange = !isDirty;
    if (isFirstChange) {
      setIsDirty(true);
    }
    
    setErrors((prevErrors) => {
      const updatedErrors = { ...prevErrors };
      
      const changedFields = Object.keys(newForm).filter((field) => {
        return form[field as keyof TransferTypeFormState] !== newForm[field as keyof TransferTypeFormState];
      });
      
      changedFields.forEach((field) => {
        delete updatedErrors[field];
      });
      
      if (changedFields.includes('payerCustomerAgreement')) {
        delete updatedErrors.payerAccount;
      }
      if (changedFields.includes('paymentCustomerAgreement')) {
        delete updatedErrors.paymentAccount;
      }
      
      const shouldValidate = isDirty || isFirstChange;
      if (shouldValidate) {
        const requiredErrors = validateRequiredFields(newForm);
        Object.assign(updatedErrors, requiredErrors);
      }
      
      const dependencyErrors = validateDependencies(newForm, isDirty || isFirstChange);
      Object.assign(updatedErrors, dependencyErrors);
      
      return updatedErrors;
    });
  }, [form, isDirty, validateRequiredFields, validateDependencies]);

  // Show loading state
  if (isSelectedLoading) {
    return (
      <Box data-testid={buildTestId(testIdPrefix, 'loading')}>
        <Typography>Loading transfer type details...</Typography>
      </Box>
    );
  }

  // Show error state
  if (selectedError) {
    return (
      <Box data-testid={buildTestId(testIdPrefix, 'error')}>
        <Typography color="error">Error: {selectedError}</Typography>
      </Box>
    );
  }

  return (
    <Box data-testid={buildTestId(testIdPrefix, 'page')}>
      <Grid container spacing={2} data-testid={buildTestId(testIdPrefix, 'main-container')}>
        <Grid size={12} data-testid={buildTestId(testIdPrefix, 'breadcrumb-container')}>
          <Breadcrumb links={breadcrumbLinks} data-testid={buildTestId(testIdPrefix, 'breadcrumbs')} />
        </Grid>
        <Grid size={{ xs: 12, md: 12 }} data-testid={buildTestId(testIdPrefix, 'heading-container')}>
          <Box sx={{ mt: 2, mb: 2 }} data-testid={buildTestId(testIdPrefix, 'heading')}>
            <Typography variant="h5" fontWeight={400} fontSize={28} data-testid={buildTestId(testIdPrefix, 'heading-text')}>
              {t('managePageHeading')} {selectedTransferType?.transferTypeName}
            </Typography>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 12 }} data-testid={buildTestId(testIdPrefix, 'form-container')}>
          <Box sx={{ mt: 4 }} data-testid={buildTestId(testIdPrefix, 'transfer-type-details-section')}>
            <TransferTypeFormWrapper
              form={form}
              errors={errors}
              submitting={submitting}
              testIdPrefix={buildTestId(testIdPrefix, 'form-wrapper')}
              onFormChange={handleFormChange}
              status={{}}
              initialMode="view"
              reviewMode
              onStartEdit={startEdit}
              onEndEdit={endEdit}
            />
          </Box>
        </Grid>
        
        <Grid size={{ xs: 12, md: 12 }} data-testid={buildTestId(testIdPrefix, 'actions-container')}>
          {isEditingAny ? (
            <Box data-testid={buildTestId(testIdPrefix, 'footer-actions')}>
              <FormFooterActions
                onCancel={endEdit}
                onReviewSubmit={handleReviewSubmit}
                reviewMode={true}
                submitting={submitting || isUpdating}
                disabled={!isFormValid || submitting || isUpdating}
                labels={{
                  cancel: t('buttonCancelLabel'),
                  submit: t('buttonSubmitTransferTypeForApproval'),
                }}
              />
            </Box>
          ) : (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }} data-testid={buildTestId(testIdPrefix, 'delete-button-container')}>
                <Button
                  variant="outlined"
                  onClick={() => setDeleteOpen(true)}
                  disabled={isDeleting}
                  startIcon={<Image src={DeleteIcon} alt={t('altIconDelete')} width={24} height={24} />}
                  data-testid={buildTestId(testIdPrefix, 'delete-button')}
                  aria-label={t('buttonDeleteTransferType')}
                  sx={{
                    color: '#0051FF',
                    borderColor: '#0051FF',
                    textTransform: 'none',
                    height: '3rem',
                    minHeight: '3rem',
                    '&:hover': {
                      borderColor: '#0051FF',
                      backgroundColor: 'rgba(0, 81, 255, 0.04)',
                    },
                  }}
                >
                  {t('buttonDeleteTransferType')}
                </Button>
              </Box>
            )
          }
        </Grid>
      </Grid>
      <DeleteConfirmationDialog
        open={deleteOpen}
        onClose={() => !isDeleting && setDeleteOpen(false)}
        onPrimaryCTA={handleDeleteConfirm}
        onSecondaryCTA={() => setDeleteOpen(false)}
        selectedCount={1}
        title={t('deleteDialogLabel')}
        name={t('deleteDialogLabel')}
        primaryCTALabel={t('deleteDialogPrimaryCTA')}
        secondaryCTALabel={t('buttonCancelLabel')}
        itemLabel={t('deleteDialogItemLabelSingle')}
        markedCount={undefined}
        message={t('deleteDialogMessage')}
        exclamationIcon={null}
        testIdPrefix={buildTestId(testIdPrefix, 'delete-dialog')}
      />
      
      <DeleteConfirmationDialog
        open={errorDialogOpen}
        onClose={handleErrorDismiss}
        onPrimaryCTA={handleErrorRetry}
        onSecondaryCTA={handleErrorDismiss}
        selectedCount={0}
        exclamationIcon={AvatarAlert}
        itemLabel=""
        markedCount={undefined}
        showUndoWarning={false}
        title="System error"
        message={
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '16px' }}>
              Something went wrong
            </div>
            <div style={{ fontSize: '14px', color: '#222E37' }}>
              {errorMessage || 'We are unable to process this request.'}
              <br />
              Please try again or contact your bank representative for assistance.
            </div>
          </div>
        }
        primaryCTALabel="Try again"
        secondaryCTALabel="Dismiss"
        secondaryCTAWidth="auto"
        tertiaryCTAWidth="auto"
        testIdPrefix={buildTestId(testIdPrefix, 'system-error-dialog')}
      />
    </Box>
  );
}
