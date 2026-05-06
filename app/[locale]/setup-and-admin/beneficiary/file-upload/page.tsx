'use client';

import BeneficiaryFileUpload from '@molecules/BeneficiaryFileUpload/BeneficiaryFileUpload';
import SourceFile from '@molecules/SourceFile/SourceFile';
import { useRouter } from 'next/navigation';
import { Breadcrumb, Heading } from 'dist/standard-bank-react';
import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import { useState, useCallback, useEffect } from 'react';
import { buildTestId } from 'src/utils/testIds';
import { useAppDispatch } from '@lib/hooks/useAppDispatch';
import { resetUploadState } from '@store/slices/createBeneficiarySlice';

function Page() {
  const testIdPrefix = 'beneficiary-file-upload-page';
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [currentStep, setCurrentStep] = useState(0);
  const [lastHighestProgressIndex, setLastHighestProgressIndex] = useState(0);

  // Reset upload state on page mount/refresh
  useEffect(() => {
    dispatch(resetUploadState());
  }, [dispatch]);

  const steps = [
    { label: 'File upload', description: 'Description' },
    { label: 'Review and submit', description: 'PLEASE NOTE: Only valid beneficiaries can be successfully imported' },
  ];

  const handleCancel = useCallback(() => {
    router.push('/setup-and-admin/beneficiary/create' as any);
  }, [router]);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setLastHighestProgressIndex((prev) => Math.max(prev, nextStep));
    }
  }, [currentStep, steps.length]);

  const onSelectStep = useCallback(
    (stepIndex: number) => {
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
    return <BeneficiaryFileUpload />;
  };

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
      data-testid={buildTestId(testIdPrefix, 'page')}
    >
      <Box sx={{ p: 2, mb: -2 }}>
        <Breadcrumb
          links={[
            { href: '/', label: 'Dashboard' },
            { href: '/setup-and-admin/beneficiary', label: 'Beneficiaries' },
            { href: '/setup-and-admin/beneficiary/create', label: 'Select a creation method' },
            {
              href: '/setup-and-admin/beneficiary/file-upload',
              label: 'File upload',
            },
          ]}
        />
        <Heading as="h4" fontSize="28px" style={{ marginTop: '16px', marginLeft: '10px' }}>
          Create a beneficiary (file upload)
        </Heading>
      </Box>

      <Box sx={{ flex: 1, p: 2 }}>
        <Paper
          data-testid={buildTestId(testIdPrefix, 'stepper-container')}
          sx={{
            p: '0.5rem 1rem',
            backgroundColor: '#f9fafb',
            boxShadow: 'none',
          }}
        >
          <Stepper activeStep={currentStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label} completed={index < lastHighestProgressIndex} disabled={index === 0 && currentStep > 0}>
                <StepLabel
                  onClick={() => onSelectStep(index)}
                  data-testid={buildTestId(testIdPrefix, 'step-label', index)}
                  optional={
                    <Typography variant="body2" sx={{ color: '#999', fontSize: '13px' }}>
                      {step.description}
                    </Typography>
                  }
                >
                  {step.label}
                </StepLabel>
                <StepContent data-testid={buildTestId(testIdPrefix, 'step-content', index)}>
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
