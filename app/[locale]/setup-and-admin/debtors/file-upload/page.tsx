'use client';

import DebtorFileUpload from '@molecules/DebtorsFileUpload/DebtorsFileUpload';
import SourceFile from '@molecules/DebtorsFileUpload/SourceFile';
import { useRouter } from 'next/navigation';
import { Breadcrumb, Heading } from 'dist/standard-bank-react';
import { buildTestId } from 'src/utils/testIds';
import { useAppDispatch } from '@lib/hooks/useAppDispatch';
import { resetDebtor } from '@store/slices/createDebtorSlice';
import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';

function Page() {
  const router = useRouter();
  const dispatch = useAppDispatch();
   const translateLang = useTranslations('debtorsHubData');
  const testIdPrefix = 'debtors-file-upload';
  const [currentStep, setCurrentStep] = useState(0);
  const [lastHighestProgressIndex, setLastHighestProgressIndex] = useState(0);

  const steps = [
    { label: translateLang('fileUploadTitle'), description: translateLang('fileUploadDescription') },
    { label: translateLang('reviewAndSubmitTitle'), description: translateLang('reviewAndSubmitDescription') },
  ];

  const handleCancel = useCallback(() => {
    dispatch(resetDebtor());
    router.push('/setup-and-admin/debtors/create' as any);
  }, [router, dispatch]);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setLastHighestProgressIndex((prev) => Math.max(prev, nextStep));
    }
  }, [currentStep, steps.length]);

  const onSelectStep = useCallback(
    (stepIndex: number) => {
      // Prevent going back to step 0 once moved to step 1
      if (stepIndex === 0 && currentStep > 0) {
        return;
      }
      if (stepIndex <= lastHighestProgressIndex) {
        setCurrentStep(stepIndex);
      }
    },
    [lastHighestProgressIndex, currentStep],
  );

  const renderStepContent = (stepIndex: number) => {
    if (stepIndex === 0) {
      return <SourceFile onNext={handleNext} onCancel={handleCancel} />;
    }
    return <DebtorFileUpload />;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }} data-testid={buildTestId(testIdPrefix, 'page')}>
      <Box sx={{ p: 2, mb: -2 }}>
        <Breadcrumb
          links={[
            { href: '/', label: translateLang('breadcrumbDashboard') },
            { href: '/setup-and-admin/debtors', label: translateLang('breadcrumbDebtors') },
            { href: '/setup-and-admin/debtors/create', label: translateLang('breadcrumbSelectCreationMethod') },
            {
              href: '/setup-and-admin/debtors/file-upload',
              label: translateLang('fileUploadTitle'),
            },
          ]}
        />
        <Heading as="h4" fontSize="28px" style={{ marginTop: '16px', marginLeft: '10px' }} data-testid={buildTestId(testIdPrefix, 'heading')}>
          {translateLang('fileUploadTitle')}
        </Heading>
      </Box>

      <Box sx={{ flex: 1, p: 2 }}>
        <Paper
          sx={{
            p: '0.5rem 1rem',
            backgroundColor: '#f9fafb',
            boxShadow: 'none',
          }}
        >
          <Stepper activeStep={currentStep} orientation="vertical" data-testid={buildTestId(testIdPrefix, 'stepper')}>
            {steps.map((step, index) => (
              <Step key={step.label} completed={index < lastHighestProgressIndex} disabled={index === 0 && currentStep > 0}>
                <StepLabel
                  onClick={() => onSelectStep(index)}
                  optional={
                    <Typography variant="body2" sx={{ color: '#999', fontSize: '13px' }}>
                      {step.description}
                    </Typography>
                  }
                >
                  {step.label}
                </StepLabel>
                <StepContent data-testid={buildTestId(testIdPrefix, `step-content-${index}`)}>
                  {index === currentStep && renderStepContent(currentStep)}
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Paper>
      </Box>
    </Box>
  );
}

export default Page;