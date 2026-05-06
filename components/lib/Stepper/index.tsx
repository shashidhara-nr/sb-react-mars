import React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import {
  margin,
  gap,
  borderRadius,
  svgSize,
  padding,
} from '../styles/spacing';

import Typography from '@mui/material/Typography';
import {
  StepContent,
  StepLabel,
  StepperProps,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Check, Warning, Pencil } from 'assets/icons';
import { useEffect, useState } from 'react';
import OverallProgressCircle from '../CircularProgress';

export type StepperStep = {
  label: string;
  description?: string;
  stepFailed?: boolean;
  optional?: boolean;
  skipped?: boolean;
  stepContent: React.ReactNode;
};

export interface StepperPropsExt extends StepperProps {
  steps: StepperStep[];
  activeStepProp?: number;
  stepCompleted: { [k: number]: boolean };
  blockViewSteps?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

export default function HorizontalNonLinearStepper(props: StepperPropsExt) {
  const theme = useTheme();
  const {
    steps,
    activeStepProp,
    stepCompleted,
    blockViewSteps,
    orientation = 'horizontal',
  } = props;
  const [activeStep, setActiveStep] = useState(activeStepProp ?? 0);
  const [completed, setCompleted] = useState<{
    [k: number]: boolean;
  }>({});

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    setCompleted(stepCompleted);
    setActiveStep(activeStepProp ?? 0);
  }, [activeStepProp, stepCompleted]);

  return (
    <Box sx={{ width: '100%', px: 0.5 }}>
      {isMobile ? (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <OverallProgressCircle
            steps={steps.map((step) => step.label)}
            currentStep={activeStep + 1}
          />
          <Box sx={{ ml: margin.small }}>
            <Typography sx={{ font: theme.typography.sMedium }}>
              {steps[activeStep]?.label}
            </Typography>
            <Typography
              sx={{
                font: theme.typography.xsRegular,
                color: theme.palette.grey[400],
              }}
            >
              {steps[activeStep]?.description}
            </Typography>
          </Box>
        </Box>
      ) : (
        <Stepper
          nonLinear
          activeStep={activeStep}
          {...(blockViewSteps ? { alternativeLabel: true } : {})}
          sx={{
            '& .MuiStepLabel-alternativeLabel': { marginRight: '0' },
            '& .MuiStepLabel-root': { gap: gap.gapLarge },
            ...(orientation === 'vertical'
              ? {
                  '& .MuiStepConnector-root': { display: 'block' },
                }
              : { '& .MuiStepConnector-root': { top: '19px' } }),
          }}
          orientation={orientation}
        >
          {steps.map((step, index) => {
            const labelProps: {
              optional?: React.ReactNode;
              skipped?: boolean;
              error?: boolean;
            } = {};

            if (step.stepFailed) {
              if (completed[index] === true) {
                labelProps.error = false;
              } else {
                labelProps.error = true;
              }
            }
            if (step.optional && !stepCompleted[index] && activeStep) {
              labelProps.skipped = true;
            }

            return (
              <Step
                key={step.label}
                completed={completed[index]}
                sx={{
                  backgroundColor:
                    orientation === 'horizontal' && completed[index]
                      ? theme.palette.secondary.light
                      : 'transparent',

                  borderRadius: borderRadius.borderRadiusXSmall,
                  padding: 0,
                  '&. MuiStepper': {
                    gap: 0,
                  },
                }}
              >
                <StepLabel
                  {...labelProps}
                  icon={
                    completed[index] ? (
                      <Check
                        height={svgSize.xSmall}
                        width={svgSize.xSmall}
                        stroke={theme.palette.common.white}
                        color={theme.palette.secondary.main}
                        fill={theme.palette.secondary.main}
                      />
                    ) : labelProps.skipped && !labelProps.error ? (
                      <Pencil
                        height={svgSize.xSmall}
                        width={svgSize.xSmall}
                        stroke={theme.palette.common.white}
                        color={theme.palette.secondary.main}
                        fill={theme.palette.secondary.main}
                      />
                    ) : labelProps.error ? (
                      <Warning
                        height={svgSize.regular}
                        width={svgSize.regular}
                        stroke={theme.palette.common.white}
                        color={theme.palette.error.main}
                      />
                    ) : (
                      <Typography>{index + 1}</Typography>
                    )
                  }
                  sx={{
                    px: orientation === 'horizontal' ? padding.regular : 0,
                    gap: '0.75rem !important',
                    '& .MuiStepLabel-label.MuiStepLabel-alternativeLabel ': {
                      mt: 0,
                    },

                    py: padding.small,
                    '& .MuiStepLabel-iconContainer': {
                      backgroundColor:
                        completed[index] ||
                        (activeStep === index && !step.stepFailed)
                          ? theme.palette.secondary.main
                          : step.stepFailed
                            ? 'transparent'
                            : labelProps.skipped
                              ? theme.palette.secondary.main
                              : theme.palette.grey[300],
                      color:
                        completed[index] ||
                        (activeStep === index && !step.stepFailed)
                          ? theme.palette.common.white
                          : step.stepFailed
                            ? 'transparent'
                            : labelProps.skipped
                              ? theme.palette.secondary.main
                              : theme.palette.grey[500],
                      width: svgSize.regular,
                      height: svgSize.regular,
                      borderRadius: '50%',
                      display: 'flex',
                      justifyContent: 'center',

                      alignItems: 'center',
                      padding: 0,
                    },
                  }}
                >
                  <Typography
                    sx={{
                      font: theme.typography.mMedium,
                      color: labelProps.error
                        ? theme.palette.error.main
                        : theme.palette.grey[500],
                    }}
                  >
                    {step.label}
                  </Typography>
                  <Typography
                    sx={{
                      font: theme.typography.xsRegular,
                      color: labelProps.error
                        ? theme.palette.error.main
                        : theme.palette.grey[500],
                    }}
                  >
                    {step.description}
                  </Typography>
                </StepLabel>
                {orientation === 'vertical' && (
                  <StepContent>{step.stepContent}</StepContent>
                )}
              </Step>
            );
          })}
        </Stepper>
      )}
    </Box>
  );
}
