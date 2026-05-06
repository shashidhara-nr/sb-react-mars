import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';

interface OverallProgressCircleProps {
  currentStep?: number;
  circularProgressSize?: number;
  circularProgressThickness?: number;
  steps: string[];
}

export default function OverallProgressCircle({
  currentStep = 0,
  circularProgressSize = 56,
  circularProgressThickness = 4,
  steps = [],
}: OverallProgressCircleProps) {
  const totalSteps = steps.length;

  const percentageComplete = (currentStep / totalSteps) * 100;

  const [percentage, setPercentage] = useState(percentageComplete);
  const [activeStep, setActiveStep] = useState(currentStep);

  useEffect(() => {
    setPercentage(percentageComplete);
    setActiveStep(currentStep);
  }, [percentageComplete, currentStep]);

  const theme = useTheme();

  return (
    <Box position="relative" display="inline-flex">
      <CircularProgress
        variant="determinate"
        value={percentage}
        size={circularProgressSize}
        thickness={circularProgressThickness}
        sx={{
          zIndex: 1,
          '& .MuiCircularProgress-circle': {
            stroke: theme.palette.secondary.main,
          },
        }}
      />
      <CircularProgress
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          '& .MuiCircularProgress-circle': {
            stroke: theme.palette.secondary.light,
          },
        }}
        variant="determinate"
        value={100}
        size={circularProgressSize}
        thickness={circularProgressThickness}
        aria-hidden="true"
      />
      <Box
        position="absolute"
        top={0}
        left={0}
        width="100%"
        height="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
      >
        <Typography sx={{ font: theme.typography.xxsMedium }}>
          {activeStep} of {totalSteps}
        </Typography>
      </Box>
    </Box>
  );
}
