'use client';

import { Box, Paper, Stepper, Step, StepLabel, StepContent, Typography, Divider } from '@mui/material';
import {  Breadcrumb, Heading } from 'dist/standard-bank-react';
import { useRouter ,useParams } from 'next/navigation';
import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '@lib/hooks/useAppDispatch';
import { useTranslations } from 'next-intl';
import { resetBiller, updateBiller } from '@store/slices/createBillerSlice';
import Image from 'next/image';
import { DocumentIcon, IcnCardQuestion, ListIcon, IcnBellBell  } from 'lib/icons';
import { FormActionButtons } from 'components/common/formActionButtons';
import CreateJournyForm from 'components/common/CreateJournyForm';
import CreatePayAlertsForm, { CreatePayAlertsFormHandle } from 'components/common/CreatePayAlertsForm';
import { BillerReferenceReview } from 'components/common/BillerReferenceReview';
import { BillsField } from 'src/utils/BillsField';
import {  getRulesForField } from 'src/utils/BillsCreateLogic';
import { buildTestId } from 'src/utils/testIds';
import {   getBreadcrumbsWithTranslation, transformBillerToSubmitPayload } from '../BillsHelper';
import { submitBillerForApproval } from '@lib/api/billsApi';
import styles from '../bills.module.scss';

const AddBillerPage = () => {
  const testIdPrefix = 'bills-create';
  const t = useTranslations('billsHubData');
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const biller = useAppSelector((state) => state.createBiller.biller);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [lastHighestProgressIndex, setLastHighestProgressIndex] = useState(0);
  const [payAlerts, setPayAlerts] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const payAlertsFormRef = useRef<CreatePayAlertsFormHandle>(null);
  const [selectedReferenceChips, setSelectedReferenceChips] = useState<string[]>(['RT001', 'RT002', 'RT003', 'RT004', 'RT005']);
  const [activeReferenceSections, setActiveReferenceSections] = useState<Array<{
    typeId: string;
    typeName: string;
    value: string;
    isDynamic: boolean;
  }>>([
    {
      typeId: 'RT001',
      typeName: 'Reference number',
      value: 'REF-2024-001',
      isDynamic: false,
    },
    {
      typeId: 'RT002',
      typeName: 'Reference number',
      value: 'REF-2024-002',
      isDynamic: true,
    },
    {
      typeId: 'RT003',
      typeName: 'Reference number',
      value: 'REF-2024-003',
      isDynamic: false,
    },
  ]);
  const [isBillerDetailsEditing, setIsBillerDetailsEditing] = useState(false);
  const reviewReferenceSnapshotRef = useRef<{
    formValues: any;
    selectedReferenceChips: string[];
    activeReferenceSections: Array<{
      typeId: string;
      typeName: string;
      value: string;
      isDynamic: boolean;
    }>;
  } | null>(null);

  useEffect(() => {
    dispatch(resetBiller());
    dispatch(updateBiller({ field: 'currency', value: 'ZAR' }));
  }, [dispatch]);

  const handleChange = useCallback((name: string, value: any) => {
    if (name === 'referenceFields') {
      const chips = typeof value === 'string' ? value.split(',').map((s: string) => s.trim()).filter(Boolean) : (Array.isArray(value) ? value : []);
      setSelectedReferenceChips(chips);
      dispatch(updateBiller({ field: name, value }));
      return;
    }

    if (name === 'billerName') {
      dispatch(updateBiller({ field: name, value }));
      if (value && (value.startsWith('BL') || /^\d+$/.test(value))) {
        dispatch(updateBiller({ field: 'billerId', value }));
      }
      return;
    }

    dispatch(updateBiller({ field: name, value }));
  }, [dispatch, biller]);

  const billerDetailsDefaults = useMemo(() => ({
    billerName: biller?.billerName || '',
    billerId: biller?.billerId || '',
    currency: biller?.currency || 'ZAR',
    transactionLimit: biller?.transactionLimit || '',
  }), [biller]);

  const methodsBillerDetails = useForm({
    mode: 'onChange',
    defaultValues: billerDetailsDefaults,
  });

  const paymentTypesDefaults = useMemo(() => ({
    paymentTypes: Array.isArray(biller?.paymentTypes) ? biller.paymentTypes : [],
  }), [biller?.paymentTypes]);

  const methodsPaymentTypes = useForm({
    mode: 'onChange',
    defaultValues: paymentTypesDefaults,
  });

  const referenceDefaults = useMemo(() => ({
    referenceFields: Array.isArray(biller?.referenceFields) ? biller.referenceFields : [],
  }), [biller?.referenceFields]);

  const methodsReference = useForm({
    mode: 'onChange',
    defaultValues: referenceDefaults,
  });

  const payAlertsDefaults = useMemo(() => ({
    phoneNumber: biller?.phoneNumber || '',
    phoneUsage: biller?.phoneUsage || [],
    phoneAlertEnabled: biller?.phoneAlertEnabled || false,
    emailAddress: biller?.emailAddress || '',
    emailUsage: biller?.emailUsage || [],
    emailAlertEnabled: biller?.emailAlertEnabled || false,
  }), [biller]);

  const methodsPayAlerts = useForm({
    mode: 'onChange',
    defaultValues: payAlertsDefaults,
  });

  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);

  useEffect(() => {
    if (!isInitialLoadComplete) {
      methodsBillerDetails.reset(billerDetailsDefaults);
      methodsPaymentTypes.reset(paymentTypesDefaults);
      methodsReference.reset(referenceDefaults);
      methodsPayAlerts.reset(payAlertsDefaults);
      setIsInitialLoadComplete(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialLoadComplete]);

  useEffect(() => {
    if (biller?.referenceFields && Array.isArray(biller.referenceFields) && biller.referenceFields.length > 0) {
      const chipIds = biller.referenceFields.map((field) => field.id);
      setSelectedReferenceChips(chipIds);
      
      const sections = biller.referenceFields.map((field) => ({
        typeId: field.id,
        typeName: field.name,
        value: field.value || '',
        isDynamic: field.dynamicReference || false,
      }));
      setActiveReferenceSections(sections);
    }
  }, [biller?.referenceFields]);

  useEffect(() => {
    if (!biller?.currency || biller.currency !== 'ZAR') {
      dispatch(updateBiller({ field: 'currency', value: 'ZAR' }));
    }
  }, [dispatch, biller?.currency]);

  const localePrefix = useMemo(() => {
    const locale = typeof params?.locale === 'string' ? params.locale : '';
    return locale ? `/${locale}` : '';
  }, [params]);

  const pushWithLocale = useCallback(
    (href: string) => {
      const normalized = href.startsWith('/') ? href : `/${href}`;
      router.push(`${localePrefix}${normalized}` as any);
    },
    [router, localePrefix],
  );

  const handleCancel = useCallback(() => {
    pushWithLocale('/setup-and-admin/bills' as any);
  }, [pushWithLocale]);

  const handleNext = useCallback(async () => {
    let isValid = false;
    
    if (currentStep === 0) {
      isValid = await methodsBillerDetails.trigger();
    } else if (currentStep === 1) {
      isValid = await methodsPaymentTypes.trigger();
    } else if (currentStep === 2) {
      // Validate pay alerts form
      if (payAlertsFormRef.current) {
        isValid = payAlertsFormRef.current.validate();
      } else {
        isValid = true;
      }
    } else if (currentStep === 3) {
      isValid = true;
    }

    if (!isValid) {
      return;
    }

    if (currentStep === 3) {
      setIsSubmitting(true);
      setSubmitError(null);
      
      try {
        const payload = transformBillerToSubmitPayload(biller, payAlerts);
        await submitBillerForApproval(payload);
        pushWithLocale('/setup-and-admin/bills/create/success');
      } catch (error: any) {
        console.error('Failed to submit biller:', error);
        setSubmitError(error.message || 'Failed to submit biller for approval');
      } finally {
        setIsSubmitting(false);
      }
    } else if (currentStep < 3) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setLastHighestProgressIndex((prev) => Math.max(prev, nextStep));
    }
  }, [currentStep, pushWithLocale, methodsBillerDetails, methodsPaymentTypes, biller, payAlerts]);

  const onSelectStep = useCallback(
    (stepIndex: number) => {
      if (stepIndex <= lastHighestProgressIndex) {
        setCurrentStep(stepIndex);
      }
    },
    [lastHighestProgressIndex],
  );

  const steps = [
    { label: t('stepBillerDetails'), description: t('stepDescription') },
    { label: t('stepPaymentType'), description: t('stepDescription') },
    { label: t('stepPayAlerts'), description: t('stepDescription') },
    { label: t('stepReviewSubmit'), description: t('stepDescription') },
  ];

  const buildBillerDetailsFields = useCallback(
    () => BillsField.buildBillerDetailsFieldsTranslated(t, biller),
    [t, biller],
  );

  const buildPaymentTypeFields = useCallback(
    () => BillsField.buildPaymentTypeFieldsTranslated(t, biller),
    [t, biller],
  );

  const handleAddReference = useCallback(() => {
    if (selectedReferenceChips.length === 0) {
      setActiveReferenceSections([]);
      return;
    }

    setActiveReferenceSections((prevSections) =>
      selectedReferenceChips.map((chipId) => {
        const existingSection = prevSections.find((section) => section.typeId === chipId);
        if (existingSection) return existingSection;

        const referenceType = BillsField.REFERENCE_TYPES.find((rt) => rt.id === chipId);
        return {
          typeId: chipId,
          typeName: referenceType?.name || '',
          value: '',
          isDynamic: false,
        };
      }),
    );
  }, [selectedReferenceChips]);

  const handleRemoveReferenceType = useCallback((typeId: string) => {
    setActiveReferenceSections(activeReferenceSections.filter(section => section.typeId !== typeId));
    const updatedChips = selectedReferenceChips.filter(chipId => chipId !== typeId);
    setSelectedReferenceChips(updatedChips);
    dispatch(updateBiller({ field: 'referenceFields', value: updatedChips }));
  }, [activeReferenceSections, selectedReferenceChips, dispatch]);

  const handleReferenceFieldChange = useCallback((typeId: string, value: string) => {
    setActiveReferenceSections(activeReferenceSections.map(section =>
      section.typeId === typeId ? { ...section, value } : section
    ));
  }, [activeReferenceSections]);

  const handleDynamicReferenceToggle = useCallback((typeId: string) => {
    setActiveReferenceSections(activeReferenceSections.map(section =>
      section.typeId === typeId ? { ...section, isDynamic: !section.isDynamic } : section
    ));
  }, [activeReferenceSections]);

  const getReferenceInputField = useCallback((typeId: string) => {
    return BillsField.getTranslatedReferenceInputField(t, typeId);
  }, [t]);

  const buildReferenceFields = useCallback(
    () => BillsField.buildReferenceFieldsTranslated(t, biller, handleAddReference),
    [t, biller, handleAddReference],
  );

  const buildPayAlertsFields = useCallback(
    () => BillsField.buildPayAlertsFieldsTranslated(t, biller),
    [t, biller],
  );

  const renderStepContent = (stepIndex: number) => {
    if (stepIndex === 0) {
      return (
        <Box data-testid={buildTestId(testIdPrefix, 'step-biller-details')}>
          <Box className={styles.stepCardBox}>
            <Box className={styles.stepHeaderBox}>
              <Image src={DocumentIcon} alt="document" width={24} height={24} />
              <Typography className={styles.stepTitle}>
                {t('stepBillerDetails')}
              </Typography>
            </Box>
            
            <CreateJournyForm
              testIdPrefix={buildTestId(testIdPrefix, 'form-biller-details')}
              fields={buildBillerDetailsFields()}
              onChange={handleChange}
              mode="edit"
              noBorder={true}
              renderWithRHF
              formMethods={methodsBillerDetails}
              rulesProvider={(fieldName: string) => 
                getRulesForField(fieldName as any, () => methodsBillerDetails.getValues())
              }
              onSubmit={(data: any) => {
                Object.entries(data || {}).forEach(([name, value]) => handleChange(name, value));
              }}
            />
          </Box>

          <FormActionButtons
            testIdPrefix={buildTestId(testIdPrefix, 'form-actions-step-0')}
            onCancel={handleCancel}
            onNext={handleNext}
            nextText={t('buttonNext')}
          />
        </Box>
      );
    }

    if (stepIndex === 1) {
      return (
        <Box data-testid={buildTestId(testIdPrefix, 'step-payment-type')}>
          <Box className={styles.stepCardBox}>
            <Box className={styles.stepHeaderBox}>
              <Image src={IcnCardQuestion} alt="payment" width={24} height={24} />
              <Typography className={styles.stepTitle}>
                {t('stepPaymentType')}
              </Typography>
            </Box>
            
            <CreateJournyForm
              testIdPrefix={buildTestId(testIdPrefix, 'form-payment-type')}
              fields={buildPaymentTypeFields()}
              onChange={handleChange}
              noBorder={true}
              mode="edit"
              renderWithRHF
              formMethods={methodsPaymentTypes}
              rulesProvider={(fieldName: string) => 
                getRulesForField(fieldName as any, () => methodsPaymentTypes.getValues())
              }
              onSubmit={(data: any) => {
                Object.entries(data || {}).forEach(([name, value]) => handleChange(name, value));
              }}
            />
          </Box>

          <FormActionButtons
            testIdPrefix={buildTestId(testIdPrefix, 'form-actions-step-1')}
            onCancel={handleCancel}
            onNext={handleNext}
            nextText={t('buttonNext')}
          />
        </Box>
      );
    }

    if (stepIndex === 2) {
      return (
        <Box data-testid={buildTestId(testIdPrefix, 'step-pay-alerts')}>
          <Box className={styles.stepCardBox}>
            <Box className={styles.stepHeaderBox}>
              <Image src={IcnBellBell} alt="bell" width={24} height={24} style={{ fontWeight: 'bold' }} />
              <Typography className={styles.stepTitle} >
                {t('stepPayAlerts')}
              </Typography>
            </Box>
            <Divider sx={{ marginBottom: '24px' }} />
            <CreatePayAlertsForm
              ref={payAlertsFormRef}
              testIdPrefix={buildTestId(testIdPrefix, 'form-pay-alerts')}
              alerts={payAlerts}
              onChange={(updatedAlerts) => {
                setPayAlerts(updatedAlerts);
                dispatch(updateBiller({ field: 'payAlerts', value: updatedAlerts }));
              }}
              mode="edit"
              ShowActionBtns={false}
              enableCountSelector={true}
              defaultAlertsCount={1}
              
            />
          </Box>

          <FormActionButtons
            testIdPrefix={buildTestId(testIdPrefix, 'form-actions-step-2')}
            onCancel={handleCancel}
            onNext={handleNext}
            nextText={t('buttonReviewSubmit')}
          />
        </Box>
      );
    }

    return (
      <Box data-testid={buildTestId(testIdPrefix, 'step-review')}>
        <CreateJournyForm
          testIdPrefix={buildTestId(testIdPrefix, 'review-biller-details')}
          title={t('stepBillerDetails')}
          titleIcon={DocumentIcon as any}
          fields={buildBillerDetailsFields()}
          onChange={handleChange}
          mode="review"
          ShowActionBtns={true}
          renderWithRHF
          formMethods={methodsBillerDetails}
          rulesProvider={(name: string, getVals: () => any) =>
            getRulesForField(name as any, getVals)
          }
          onSubmit={(data: any) => {
            Object.entries(data || {}).forEach(([name, value]) => handleChange(name, value));
          }}
          onValidationFail={() => {}}
          syncOnChange={false}
          onEditModeChange={setIsBillerDetailsEditing}
        />
        {!isBillerDetailsEditing && (
          <BillerReferenceReview
            testIdPrefix={buildTestId(testIdPrefix, 'review-biller-reference')}
            title={t('stepBillerReference')}
            icon={ListIcon}
            iconAlt="Biller reference"
            activeSections={activeReferenceSections}
            t={t}
            styles={styles}
          />
        )}
        <Box className={styles.reviewSectionBox}>
          <CreateJournyForm
            testIdPrefix={buildTestId(testIdPrefix, 'review-payment-type')}
            title={t('stepPaymentType')}
            titleIcon={IcnCardQuestion as any}
            fields={buildPaymentTypeFields()}
            onChange={handleChange}
            mode="review"
            ShowActionBtns={true}
            renderWithRHF
            formMethods={methodsPaymentTypes}
            rulesProvider={(name: string, getVals: () => any) =>
              getRulesForField(name as any, getVals)
            }
            onSubmit={(data: any) => {
              Object.entries(data || {}).forEach(([name, value]) => handleChange(name, value));
            }}
            onValidationFail={() => {}}
            syncOnChange={false}
          />
        </Box>

        <Box className={styles.reviewSectionBox}>
          <CreatePayAlertsForm
            testIdPrefix={buildTestId(testIdPrefix, 'review-pay-alerts')}
            title={t('stepPayAlerts')}
            titleIcon={IcnBellBell}
            alerts={payAlerts}
            onChange={(updatedAlerts) => {
              setPayAlerts(updatedAlerts);
              dispatch(updateBiller({ field: 'payAlerts', value: updatedAlerts }));
            }}
            onSubmit={(updatedAlerts) => {
              setPayAlerts(updatedAlerts);
              dispatch(updateBiller({ field: 'payAlerts', value: updatedAlerts }));
            }}
            mode="review"
            ShowActionBtns={true}
            enableCountSelector={false}
          />
        </Box>

        <FormActionButtons
          testIdPrefix={buildTestId(testIdPrefix, 'form-actions-review')}
          onCancel={handleCancel}
          onNext={handleNext}
          nextText={t('buttonSubmitBillerApproval')}
          disabled={isSubmitting}
        />
        <br/>
      </Box>
    );
  };

  return (
    <Box className={styles.addBillerContainer} data-testid={buildTestId(testIdPrefix, 'page')}>
      <Box>
        <Breadcrumb 
          links={getBreadcrumbsWithTranslation(t, 'create')} 
          data-testid={buildTestId(testIdPrefix, 'breadcrumbs')}
        />
        <Heading 
          as="h4" 
          fontSize="28px" 
          style={{ marginBottom: '44px', marginTop: '32px' }}
          data-testid={buildTestId(testIdPrefix, 'heading')}
        >
          {t('pageHeadingAddBiller')}
        </Heading>
      </Box>

      <Box sx={{ flex: 1 }}>
        <Paper className={styles.mainStepper} data-testid={buildTestId(testIdPrefix, 'stepper')}>
          <Stepper activeStep={currentStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label} completed={index < lastHighestProgressIndex}>
                <StepLabel
                  data-testid={buildTestId(testIdPrefix, `step-label-${index}`)}
                  onClick={() => onSelectStep(index)}
                  optional={
                    <Typography variant="body2" className={styles.stepLabelDescription}>
                      {step.description}
                    </Typography>
                  }
                >
                  {step.label}
                </StepLabel>
                <StepContent data-testid={buildTestId(testIdPrefix, `step-content-${index}`)}>{index === currentStep && renderStepContent(currentStep)}</StepContent>
              </Step>
            ))}
          </Stepper>
        </Paper>
      </Box>
    </Box>
  );
};

export default AddBillerPage;
