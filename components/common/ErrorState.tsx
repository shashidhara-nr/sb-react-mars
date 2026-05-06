'use client';

import React from 'react';
import { Box } from '@mui/material';
import { Heading, Button } from 'dist/standard-bank-react';
import { buildTestId } from 'src/utils/testIds';
import styles from './EmptyState.module.scss';

interface ErrorStateProps {
  title: string;
  description: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
  icon?: React.ReactNode;
  buttonIcon?: React.ReactNode;
  testIdPrefix?: string;
}

const ErrorState = ({ title, description, buttonLabel, onButtonClick, icon, buttonIcon, testIdPrefix = 'error-state' }: ErrorStateProps) => {
  return (
    <Box
      className={styles.container}
      data-testid={buildTestId(testIdPrefix, 'container')}
    >
      {icon && (
        <Box className={styles.icon} data-testid={buildTestId(testIdPrefix, 'icon')}>
          {icon}
        </Box>
      )}
      <Heading as="h5" fontSize="20px" data-testid={buildTestId(testIdPrefix, 'title')}>
        {title}
      </Heading>
      <Box className={styles.description} data-testid={buildTestId(testIdPrefix, 'description')}>
        {description}
      </Box>
      {buttonLabel && onButtonClick && (
        <Box className={styles.buttonWrapper}>
          <Button
            buttonVariant="secondary"
            onClick={onButtonClick}
            startIcon={buttonIcon}
            data-testid={buildTestId(testIdPrefix, 'button')}
            aria-label={buttonLabel}
          >
            {buttonLabel}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ErrorState;
