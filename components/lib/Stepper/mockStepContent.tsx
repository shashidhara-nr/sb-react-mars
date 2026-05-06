import { Box, Button, Typography, StepperProps } from '@mui/material';
import React from 'react';

import HorizontalNonLinearStepper, { StepperStep } from '.';

export interface MockContentProps extends StepperProps {
  steps: StepperStep[];
  layoutVariant?: 'horizontal' | 'vertical'; // Renamed to avoid conflict
}

export default function MockContent({
  steps,
  layoutVariant = 'horizontal',
}: MockContentProps) {
  const [activeStep, setActiveStep] = React.useState(0);
  const [completed, setCompleted] = React.useState<{
    [k: number]: boolean;
  }>({});
  const totalSteps = () => {
    return steps.length;
  };

  const completedSteps = () => {
    return Object.keys(completed).length;
  };

  const isLastStep = () => {
    return activeStep === totalSteps() - 1;
  };

  const allStepsCompleted = () => {
    return completedSteps() === totalSteps();
  };

  const handleNext = () => {
    const newActiveStep =
      isLastStep() && !allStepsCompleted()
        ? steps.findIndex((_, i) => !(i in completed))
        : activeStep + 1;
    setActiveStep(newActiveStep);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleComplete = () => {
    setCompleted({
      ...completed,
      [activeStep]: true,
    });
    handleNext();
  };

  const handleReset = () => {
    setActiveStep(0);
    setCompleted({});
  };

  return (
    <Box sx={{ padding: 2 }}>
      <HorizontalNonLinearStepper
        activeStepProp={activeStep}
        stepCompleted={completed}
        steps={steps}
        orientation={layoutVariant}
      />

      <div>
        {allStepsCompleted() ? (
          <Box>
            <Typography sx={{ mt: 2, mb: 1 }}>
              All steps completed - you&apos;re finished
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
              <Box sx={{ flex: '1 1 auto' }} />
              <Button onClick={handleReset}>Reset</Button>
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              padding: 2,
              backgroundColor: '#f0f0f0',
              borderRadius: 2,
              border: '1px solid #ccc',
              mt: 4,
            }}
          >
            <Typography sx={{}}>Step {activeStep + 1}</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', pt: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  pt: 2,
                }}
              >
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  sx={{ mr: 1, color: 'blue' }}
                >
                  Back
                </Button>

                <Button onClick={handleNext} sx={{ mr: 1, color: 'blue' }}>
                  Next
                </Button>
                {activeStep !== steps.length &&
                  (completed[activeStep] ? (
                    <Typography
                      variant="caption"
                      sx={{ display: 'inline-block' }}
                    >
                      Step {activeStep + 1} already completed
                    </Typography>
                  ) : (
                    <Button
                      onClick={handleComplete}
                      sx={{ mr: 1, color: 'blue' }}
                    >
                      {completedSteps() === totalSteps() - 1
                        ? 'Finish'
                        : 'Complete Step'}
                    </Button>
                  ))}
              </Box>

              <Box>{steps[activeStep]?.stepContent}</Box>
            </Box>
          </Box>
        )}
      </div>
    </Box>
  );
}
