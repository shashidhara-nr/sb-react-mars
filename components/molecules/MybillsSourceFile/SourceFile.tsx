'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Typography,
  TextField,
  MenuItem,
  Chip,
  OutlinedInput,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import { Button } from 'dist/standard-bank-react';
import { useTranslations } from 'next-intl';
import UserCard from '@atoms/UserCard/UserCard';
import IcnCardQuestion from 'public/icons/icn_card_question.svg';

import styles from './MyBills.module.scss';

const PayBillsSourceFile = () => {
  const t = useTranslations('myBills');
  const [activeStep] = useState(0);
  const [types, setTypes] = useState<string[]>([]);

  const steps = [
    { label: t('paymentType'), description: t('stepDescription') },
    { label: t('paymentDetails'), description: t('stepDescription') },
    { label: t('reviewAndSubmit'), description: t('stepDescription') },
  ];

  return (
    <Box className={styles.stepperWrapper}>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel
              optional={
                <Typography className={styles.stepDescription}>
                  {step.description}
                </Typography>
              }
            >
              {step.label}
            </StepLabel>

            <StepContent>
              {index === 0 && (
                <Box className={styles.stepContent}>
                  
                  <UserCard
                    title={t('paymentTypes')}
                    icon={
                      <Image
                        src={IcnCardQuestion}
                        alt={t('paymentTypeHelp')}
                      />
                    }
                  >
                    <Box className={styles.dropdownWrapper}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        value={types}
                        SelectProps={{
                          multiple: true,
                          displayEmpty: true,
                          onChange: (e) =>
                            setTypes(e.target.value as string[]),
                          input: <OutlinedInput />,
                          renderValue: (selected) =>
                            (selected as string[]).length === 0 ? (
                              <Typography className={styles.placeholder}>
                                {t('selectPaymentTypes')}
                              </Typography>
                            ) : (
                              <Box className={styles.selectedChips}>
                                {(selected as string[]).map((value) => (
                                  <Chip
                                    key={value}
                                    size="small"
                                    label={
                                      value === 'type1'
                                        ? t('paymentType1')
                                        : t('paymentType2')
                                    }
                                    onDelete={() =>
                                      setTypes((prev) =>
                                        prev.filter((i) => i !== value),
                                      )
                                    }
                                  />
                                ))}
                              </Box>
                            ),
                        }}
                      >
                        <MenuItem value="type1">
                          {t('paymentType1')}
                        </MenuItem>
                        <MenuItem value="type2">
                          {t('paymentType2')}
                        </MenuItem>
                      </TextField>
                    </Box>
                  </UserCard>

                  {/*  Footer*/}
                  <Box className={styles.footerActions}>
                    <Button
                      buttonVariant="text"
                      className={styles.cancelLink}
                    >
                      {t('cancel').toUpperCase()}
                    </Button>

                    <Button
                      buttonVariant="primary"
                      startIcon={<ArrowForwardIcon />}
                    >
                      {t('next').toUpperCase()}
                    </Button>
                  </Box>
                </Box>
              )}
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default PayBillsSourceFile;