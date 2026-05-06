'use client';
import { useMemo, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import styles from './Limits.module.scss';
import { Grid, useTheme, Alert } from '@mui/material';
import { BreadcrumbList } from 'components/lib/Page/Breadcrumb';
import { Heading } from 'components/lib/Page';
import JournyForm from 'components/common/JournyForm';
import { useForm } from 'react-hook-form';
import { RootState } from '@store/index';
import { useSelector } from 'react-redux';
import { Icon } from '@atoms/index';
import { buildManageLimitFields } from 'src/utils/manageLimit';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from 'components/lib/Forms';
import ValidationErrorDialog from 'components/common/ValidationErrorDialog';
import DeleteConfirmationDialog from 'components/common/DeleteConfirmationDialog';
import {
  validateCreateLimit,
  validateUpdateLimit,
  type ValidationResult,
  type LimitTO
} from '@lib/utils/limitValidation';

const ManageLimit = () => {
  const t = useTranslations('limits');
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const limitId = searchParams?.get('limitId');
  const mode = searchParams?.get('mode');
  const limitDetails = useSelector((state: RootState) => state.limitDetails.selectedLimit);
  const limitFields = useMemo(() => buildManageLimitFields(t, limitDetails), [t, limitDetails]);
  const [limitMode, setLimitMode] = useState<'create' | 'review'>('create');
  const [reviewData, setReviewData] = useState<any>({});

  // Create updated fields with review data values when in review mode
  const displayFields = useMemo(() => {
    if (limitMode === 'review' && reviewData && Object.keys(reviewData).length > 0) {
      return limitFields.map(field => ({
        ...field,
        value: reviewData[field.name] !== undefined ? reviewData[field.name] : field.value,
      }));
    }
    return limitFields;
  }, [limitFields, limitMode, reviewData]);
  const [validationError, setValidationError] = useState<{
    open: boolean;
    title: string;
    message: string;
    fieldErrors?: Record<string, string>;
  }>({
    open: false,
    title: '',
    message: '',
  });

  const [cancellationDialogOpen, setCancellationDialogOpen] = useState(false);

  const [submissionError, setSubmissionError] = useState<{
    open: boolean;
    errorType: 'create' | 'update' | null;
  }>({
    open: false,
    errorType: null,
  });

  const methodsDetails = useForm({ mode: 'onTouched', defaultValues: {} });

  const breadcrumbLinks = useMemo(
    () => [
      { href: '/', label: t('dashboard') },
      { href: '/limits', label: t('limits') },
      { href: '/limits/manage-limit', label: `${t(limitId ? 'manage' : 'create')} ${t('limit')?.toLocaleLowerCase()}` },
    ],
    [t, limitId],
  );

  // Validate and handle limit submission (create or update)
  const handleSubmitLimit = useCallback(async () => {
    if (limitMode === 'review') {
      try {
        // TODO: Replace with actual API call to submit the limit
        // const response = await submitLimitAPI(formData);
        // For now, simulate submission
        await new Promise((resolve) => setTimeout(resolve, 500));

        // On success, redirect to success page
        router.push('/limits/success');
      } catch (error) {
        // Show submission error dialog
        setSubmissionError({
          open: true,
          errorType: limitId ? 'update' : 'create',
        });
      }
      return;
    }

    // Get form values
    const formData = methodsDetails.getValues() as any;

    // Validate form data based on mode (create or update)
    let validation: ValidationResult;

    if (limitId) {
      // Update validation
      const currentLimit: LimitTO = {
        id: limitId,
        limitTypeName: formData?.limitTypeName || '',
        limitType: formData?.limitType || '',
        limitCurrency: formData?.limitCurrency || '',
        limitAmount: formData?.limitAmount || '',
        limitPeriodDays: formData?.limitPeriodDays || '',
        productType: formData?.productType || '',
        correctStatus: limitDetails?.status || 'N',
      };

      validation = validateUpdateLimit(currentLimit, formData);
    } else {
      // Create validation
      validation = validateCreateLimit(formData);
    }

    // If validation fails, show error dialog
    if (!validation.valid) {
      const fieldErrorsText =
        validation.fieldErrors && Object.keys(validation.fieldErrors).length > 0
          ? '\n' +
          Object.entries(validation.fieldErrors)
            .map(([field, error]) => `• ${field}: ${error}`)
            .join('\n')
          : '';

      setValidationError({
        open: true,
        title: 'Validation Error',
        message:
          (validation.message || 'Please fix the validation errors') +
          fieldErrorsText,
        fieldErrors: validation.fieldErrors,
      });
      return;
    }

    // If validation passes, proceed to review
    // Store form data for review display
    setReviewData({ ...formData });
    setLimitMode('review');
  }, [limitMode, methodsDetails, limitId, limitDetails, router]);

  const handleValidationErrorClose = useCallback(() => {
    setValidationError({
      open: false,
      title: '',
      message: '',
    });
  }, []);

  const handleCancellationDialogClose = useCallback(() => {
    setCancellationDialogOpen(false);
  }, []);

  const handleConfirmCancel = useCallback(() => {
    setCancellationDialogOpen(false);
    if (!limitId) {
      router.push('/limits');
      return;
    }
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.delete('mode');
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, [limitId, router, searchParams]);

  const handleSubmissionErrorClose = useCallback(() => {
    setSubmissionError({
      open: false,
      errorType: null,
    });
  }, []);

  const handleRetrySubmission = useCallback(async () => {
    setSubmissionError({
      open: false,
      errorType: null,
    });

    // Retry the submission
    try {
      // TODO: Replace with actual API call to submit the limit
      // const response = await submitLimitAPI(formData);
      // For now, simulate submission
      await new Promise((resolve) => setTimeout(resolve, 500));

      // On success, redirect to success page
      router.push('/limits/success');
    } catch (error) {
      // Show submission error dialog again
      setSubmissionError({
        open: true,
        errorType: limitId ? 'update' : 'create',
      });
    }
  }, [limitId, router]);

  const editDetails = () => {
    if (limitMode === 'review') {
      setLimitMode('create');
      // Restore form data from reviewData
      methodsDetails.reset(reviewData, { keepValues: true });
      return;
    }
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('mode', 'edit');
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  };

  const handleBeforeCancel = useCallback((): boolean => {
    // Check if form has unsaved changes
    if (methodsDetails.formState.isDirty) {
      setCancellationDialogOpen(true);
      return false; // Prevent default cancel behavior
    }

    // No unsaved changes, proceed with cancel
    return true; // Allow default cancel behavior
  }, [methodsDetails.formState.isDirty]);

  const cancelEdit = () => {
    // Check if form has unsaved changes
    if (methodsDetails.formState.isDirty) {
      setCancellationDialogOpen(true);
      return;
    }

    // No unsaved changes, proceed with cancel
    if (!limitId) {
      router.push('/limits');
      return;
    }
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.delete('mode');
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  };

  // Compute validation messages based on limit type
  const validationAlerts = useMemo(() => {
    const alerts: Array<{
      type: 'error' | 'warning' | 'info';
      title: string;
      message: string;
    }> = [];

    if (!limitDetails) return alerts;

    const details = limitDetails as any;

    // Only show alerts for Overall limit types
    const isOverallLimit = details?.limitType === 'OVERALL_PAYMENT' || details?.limitType === 'OVERALL_TRANSFER';

    if (!isOverallLimit) {
      return alerts;
    }

    // Check if user has edit permission
    const hasEditPermission = details?.editButtonEnabled !== false;

    if (!hasEditPermission) {
      alerts.push({
        type: 'error',
        title: '',
        message: 'You do not have permission to perform this action. Contact an administrator to review your access permissions.',
      });
    }

    // Show Overall limit warning message
    if (isOverallLimit && hasEditPermission) {
      alerts.push({
        type: 'warning',
        title: '',
        message: `You are managing an Overall limit. Changes to this mandatory limit require administrator approval.`,
      });
    }

    // Check if limit is in certain statuses
    const forbiddenStatuses = ['ACA', 'ACT', 'R'];
    if (forbiddenStatuses.includes(details?.status)) {
      alerts.push({
        type: 'warning',
        title: '',
        message: `This limit is currently under ${details?.status === 'ACA' ? 'authorization' : details?.status === 'ACT' ? 'authorization review' : 'repair'} and cannot be modified.`,
      });
    }

    return alerts;
  }, [limitDetails]);

  return (
    <div className={styles.container}>
      <BreadcrumbList links={breadcrumbLinks} />
      <Grid
        size={12}
        className={styles.headerRow}
      >
        <Heading as="h4" fontSize="28px">
          {`${t(limitId ? 'manage' : 'create')} ${t('limit')?.toLocaleLowerCase()}`}
        </Heading>
      </Grid>

      {/* Validation Alerts */}
      {validationAlerts.map((alert, index) => (
        <Alert
          key={index}
          severity={alert.type}
          sx={{ mb: 2 }}
        >
          {alert.message}
        </Alert>
      ))}

      {/* Validation Error Dialog */}
      <ValidationErrorDialog
        open={validationError.open}
        onClose={handleValidationErrorClose}
        title={validationError.title}
        message={validationError.message}
      />

      {/* Cancellation Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={cancellationDialogOpen}
        onClose={handleCancellationDialogClose}
        onPrimaryCTA={handleConfirmCancel}
        onSecondaryCTA={handleCancellationDialogClose}
        selectedCount={1}
        title={t('cancellationConfirmationTitle')}
        name={t('cancellationConfirmationTitle')}
        markedCount={0}
        itemLabel={t('cancellationConfirmationMessage')}
        itemLabel3={t('cancellationConfirmationDesc')}
        primaryCTALabel={t('cancellationConfirm')}
        secondaryCTALabel={t('cancel')}
      />

      {/* Submission Error Dialog */}
      <DeleteConfirmationDialog
        open={submissionError.open}
        onClose={handleSubmissionErrorClose}
        onPrimaryCTA={handleRetrySubmission}
        onSecondaryCTA={handleSubmissionErrorClose}
        selectedCount={0}
        markedCount={0}
        title={t('systemError')}
        name={t('submissionErrorMessage')}
        itemLabel={t('submissionErrorMessage')}
        itemLabel2={t('submissionErrorMsg')}
        itemLabel3={t('submissionErrorDesc')}
        primaryCTALabel={t('tryAgain')}
        secondaryCTALabel={t('cancel')}
      />
      <JournyForm
        onChange={() => { }}
        mode={limitMode === 'review' ? 'view' : (mode ? 'edit' : 'view')}
        ShowActionBtns={mode ? false : true}
        renderWithRHF
        formMethods={methodsDetails}
        syncOnChange={false}
        editHandler={editDetails}
        onBeforeCancel={handleBeforeCancel}
        sections={[
          {
            title: t('limitNameAndSettings'),
            titleIconEelement: <Icon name="manageLimit" width="20px" height="20px" bgColor={theme.palette.text.secondary} />,
            fields: displayFields as any,
            ShowActionBtns: mode && limitMode !== 'review' ? false : true
          }
        ]}
      />
      {mode &&
        <Grid size={12} className={`${styles.btnContainer} ${styles.saveLimitBtnContainer}`}>
          <Button
            buttonVariant="text"
            onClick={() => cancelEdit()}
            startIcon={<Icon name="cancel" width="24px" height="24px" bgColor={theme.palette.secondary.main} />}
          >
            {t('cancel')?.toLocaleUpperCase()}
          </Button>
          <Button
            buttonVariant="secondary"
            onClick={() => handleSubmitLimit()}
            startIcon={<Icon name={limitId && limitMode !== 'review' ? "save" : "next"} width="24px" height="24px" bgColor={theme.palette.primary.main} />}
            className={styles.saveLimitBtn}
          >
            {limitId ? limitMode !== 'review' ? t('saveChanges')?.toLocaleUpperCase() : t('submitForApproval')?.toLocaleUpperCase() : limitMode !== 'review' ? t('reviewAndSubmit')?.toLocaleUpperCase() : t('submitForApproval')?.toLocaleUpperCase()}
          </Button>
        </Grid>
      }
    </div>
  );
};

export default ManageLimit;
