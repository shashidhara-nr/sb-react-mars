'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch,useAppSelector } from '@lib/hooks/useAppDispatch';
import { Box, Typography, Grid } from '@mui/material';
import { Breadcrumb } from 'dist/standard-bank-react';
import CancelConfirmationDialog from 'components/common/CancellationConfirmationDialog';
import DeleteConfirmationDialog from 'components/common/DeleteConfirmationDialog';
import AvatarAlert from 'public/icons/avatar_alert.svg';
import { useTranslations } from 'next-intl';
import { FormFooterActions } from 'components/molecules';
import { transferTypeZodSchema } from 'utils/transferTypeLogic';
import { RootState, AppDispatch } from '@store/index';
import {
  saveForm as saveTransferForm,
  resetCreateTransferType,
  submitTransferType,
  clearSubmitStatus,
} from '@store/slices/createTransferTypeSlice';
import { buildTestId } from 'src/utils/testIds';
import { transferTypesRoute, getTransferTypeBreadcrumbs, TRANSFER_TYPE_PAGE } from '../transferTypeHelper';
import { TransferTypeFormState, TransferTypeFormWrapper } from '@molecules/TransferTypeForm';

export default function CreateTransferTypePage() {
  const testIdPrefix = 'transfer-types-create';
  const router = useRouter();
  const t = useTranslations('transferType');
  const dispatch = useAppDispatch();
  const persisted = useAppSelector((state) => state.createTransferType);

  const emptyForm: TransferTypeFormState = React.useMemo(
    () => ({
      transferTypeName: '',
      authorisationProfile: '',
      enforceAuditing: false,
      payerCustomerAgreement: '',
      payerAccount: '',
      paymentCustomerAgreement: '',
      paymentAccount: '',
    }),
    []
  );

  const [form, setForm] = React.useState<TransferTypeFormState>(emptyForm);

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [reviewMode, setReviewMode] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [status, setStatus] = React.useState<{ ok?: boolean; message?: string }>({});
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  // Monitor submission state from Redux
  const { isSubmitting, submitSuccess } = persisted;

  // Handle successful submission
  React.useEffect(() => {
    if (submitSuccess) {
      setStatus({ ok: true, message: 'Transfer type created successfully.' });
      router.push(transferTypesRoute.success);
      dispatch(clearSubmitStatus());
    }
  }, [submitSuccess, router, dispatch]);

  // Ensure Create starts fresh even after a hard refresh (redux-persist rehydrate)
  React.useEffect(() => {
    dispatch(resetCreateTransferType());
    setForm(emptyForm);
  }, [dispatch, emptyForm]);

  const handleFormChange = (newForm: TransferTypeFormState) => {
    setForm(newForm);
  };

  const handleCancel = () => {
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = () => {
    setCancelDialogOpen(false);
    router.push(transferTypesRoute.home);
  };

  const handleCancelClose = () => {
    setCancelDialogOpen(false);
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    setStatus({});

    try {
      const payload = {
        ...form,
        status: 'draft',
      };
      setStatus({ ok: true, message: 'Draft saved successfully.' });
    } catch (err: any) {
      setStatus({ ok: false, message: err?.message ?? 'Failed to save draft.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePaymentType = (data: TransferTypeFormState) => {
    dispatch(saveTransferForm(data));
  };

  const handleCancelPaymentType = () => {
    setForm(persisted.form);
    setErrors({});
  };

  const handleReviewSubmit = () => {
    const valid = validateAllSections();
    if (!valid) return;
    if (!reviewMode) {
      dispatch(saveTransferForm(form));
      setReviewMode(true);
    } else {
      void handleSubmitTransferType(form);
    }
  };

  const handleEditSection = (section: string) => {
    console.log(`Edit section: ${section}`);
  };

  const validateAllSections = () => {
    let isValid = true;

    const paymentResult = transferTypeZodSchema.safeParse(form);
    if (!paymentResult.success) {
      isValid = false;
      const fieldErrors: Record<string, string> = {};
      paymentResult.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (typeof field === 'string' && !fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });
      setErrors(fieldErrors);
    } else {
      setErrors({});
    }

    if (!isValid) {
      setStatus({ ok: false, message: '' });
    } else {
      setStatus({});
    }

    return isValid;
  };

  const handleSubmitTransferType = React.useCallback(async (data: TransferTypeFormState) => {
    // Save form data to Redux first
    dispatch(saveTransferForm(data));
    
    try {
      // Dispatch the thunk action to submit
      await dispatch(submitTransferType()).unwrap();
      // Success is handled by the useEffect watching submitSuccess
    } catch (error: any) {
      const errorMsg = error?.message || error || 'Failed to create transfer type';
      setErrorMessage(errorMsg);
      setErrorDialogOpen(true);
    }
  }, [dispatch]);

  const handleErrorRetry = React.useCallback(() => {
    setErrorDialogOpen(false);
    void handleSubmitTransferType(form);
  }, [form, handleSubmitTransferType]);

  const handleErrorDismiss = React.useCallback(() => {
    setErrorDialogOpen(false);
    setErrorMessage('');
  }, []);

  return (
    <Box data-testid={buildTestId(testIdPrefix, 'page')}>
      <Grid container spacing={2} data-testid={buildTestId(testIdPrefix, 'main-container')}>
        <Grid size={12} data-testid={buildTestId(testIdPrefix, 'breadcrumb-container')}>
          <Breadcrumb
            links={getTransferTypeBreadcrumbs(TRANSFER_TYPE_PAGE.CREATE, t)}
            data-testid={buildTestId(testIdPrefix, 'breadcrumbs')}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 12 }} data-testid={buildTestId(testIdPrefix, 'heading-container')}>
          <Box sx={{ mt: 2, mb: 2 }} data-testid={buildTestId(testIdPrefix, 'heading')}>
            <Typography variant="h5" fontWeight={400} fontSize={28} data-testid={buildTestId(testIdPrefix, 'heading-text')}>
              {t('createTransferTypeLabel')}
            </Typography>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 12 }} data-testid={buildTestId(testIdPrefix, 'form-container')}>
          <Box sx={{ mt: 4 }} data-testid={buildTestId(testIdPrefix, 'transfer-type-details-section')}>
            <TransferTypeFormWrapper
              form={form}
              errors={errors}
              submitting={isSubmitting}
              onFormChange={handleFormChange}
              status={status}
              initialMode="create"
              reviewMode={reviewMode}
              onSave={handleSavePaymentType}
              onCancel={handleCancelPaymentType}
              onValidSubmit={handleSubmitTransferType}
              testIdPrefix={buildTestId(testIdPrefix, 'form-wrapper')}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 12 }} data-testid={buildTestId(testIdPrefix, 'footer-actions-container')}>
          <Box sx={{ mt: 4, mb: 4 }} data-testid={buildTestId(testIdPrefix, 'footer-actions')}>
            <FormFooterActions
              saving={saving}
              submitting={isSubmitting}
              reviewMode={reviewMode}
              onCancel={handleCancel}
              onSaveDraft={handleSaveDraft}
              onReviewSubmit={handleReviewSubmit}
              labels={{
                cancel: t('buttonCancelLabel'),
                save: t('buttonSaveToDrafts'),
                  submit: reviewMode
                    ? t('buttonSubmitTransferTypeForApproval')
                    : t('buttonReviewSubmit')
              }}
            />
          </Box>
        </Grid>
      </Grid>
      <CancelConfirmationDialog
        open={cancelDialogOpen}
        onClose={handleCancelClose}
        onCancel={handleCancelConfirm}
        onSaveToDrafts={handleSaveDraft}
        testIdPrefix={buildTestId(testIdPrefix, 'cancel-confirmation-dialog')}
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
              We are unable to create this transfer type.
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
