'use client';
import { useCallback, useMemo, useState, ChangeEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import styles from './CreateTransfers.module.scss';
import { Box, Grid, Paper, Step, StepContent, StepLabel, Stepper, Typography, TextField, InputAdornment, Accordion, AccordionSummary, AccordionDetails, FormHelperText } from '@mui/material';
import { BreadcrumbList } from 'components/lib/Page/Breadcrumb';
import { Button } from 'components/lib/Forms';
import DatePicker from 'components/lib/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { Heading } from 'components/lib/Page';
import RHFProvider from 'components/common/forms/RHFProvider';
import { useForm, Controller } from 'react-hook-form';
import { CreateJournyForm } from 'components/common';
import DeleteConfirmationDialog from 'components/common/DeleteConfirmationDialog';
import CancellationConfirmationDialog from 'components/common/CancellationConfirmationDialog';
import FormActionButtons from 'components/common/formActionButtons';
import { Icon } from '@atoms/index';
// import theme from 'components/lib/styles/theme';
import AccountInfoDropdown from 'components/common/AccountDropDown';
import { 
  ACCOUNT_LIST, 
  TRANSFER_TYPE_OPTIONS, 
  CURRENCY_OPTIONS, 
  COLORS,
} from './constant';
import IconChevronDown from 'public/icons/chevron_down.svg';
import IconSearch from 'public/icons/icn_search.svg';
import { getRulesForField } from 'src/utils/transferCreateLogic';
import CustomPagination from 'components/lib/Tables/TablePagination';
import PaymentDetailsSection from './PaymentDetailsSection';

const CreateTransfers = () => {
  const t = useTranslations('transfers');
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [lastHighestProgressIndex, setLastHighestProgressIndex] = useState(0);
  const [transferMode, setTransferMode] = useState(0);
  const [batchItems, setBatchItems] = useState<any[]>([]);
  const [lastInstructionItemCount, setLastInstructionItemCount] = useState(0);
  const [instructionCount, setInstructionCount] = useState(0);
  const [instructions, setInstructions] = useState<any[]>([]);
  const [expandedInstruction, setExpandedInstruction] = useState<number | false>(false);
  const [searchBatch, setSearchBatch] = useState('');
  const [expandedBatchItem, setExpandedBatchItem] = useState<number | false>(false);
  const [paymentId, setPaymentId] = useState('[Auto generated (editable) payment ID]');
  const [paymentDate, setPaymentDate] = useState<Dayjs | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<15 | 30 | 50>(15);
  const [cancellationDialogOpen, setCancellationDialogOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('We are unable to process your request. Please try again or contact your bank representative.');
  const [errorRetryAction, setErrorRetryAction] = useState<(() => void) | null>(null);
  const [transferDetails, setTransferDetails] = useState<any>({
    transferType: '',
    sourceAccount: '',
    sourceAccountName: '',
    sourceAccountNumber: '',
    sourceAccountBranch: '',
    sourceAccountBic: '',
    sourceAccountCountry: '',
    destinationAccount: '',
    transferCurrency: '',
    debitCurrency: '',
    debitReference: '',
    transferAmount: '',
    creditReference: '',
    paymentDate: null,
  });
  const [instructionsList, setInstructionsList] = useState<any[]>([]);

  const detailsDefaultValues = {
    transferType: transferDetails?.transferType || '',
    sourceAccount: transferDetails?.sourceAccount || '',
    destinationAccount: transferDetails?.destinationAccount || '',
    transferCurrency: transferDetails?.transferCurrency || '',
    debitCurrency: transferDetails?.debitCurrency || '',
    debitReference: transferDetails?.debitReference || '',
    transferAmount: transferDetails?.transferAmount || '',
    creditReference: transferDetails?.creditReference || '',
    paymentDate: transferDetails?.paymentDate || null,
  } as const;

  const methodsDetails = useForm({ mode: 'onTouched', defaultValues: detailsDefaultValues });

  // Error dialog handlers
  const handleErrorClose = () => {
    setErrorDialogOpen(false);
    setErrorRetryAction(null);
  };

  const handleErrorRetry = () => {
    handleErrorClose();
    errorRetryAction?.();
  };

  const showError = (message: string, retryAction?: () => void) => {
    setErrorMessage(message);
    setErrorRetryAction(() => retryAction || null);
    setErrorDialogOpen(true);
  };

  const breadcrumbLinks = useMemo(
    () => [
      { href: '/', label: t('dashboard') },
      { href: '/transfers', label: t('transfers') },
      { href: '/transfers/create', label: t('createATransfer') },
    ],
    [t],
  );

  const onSelectStep = useCallback(
    (stepIndex: number) => {
      if (stepIndex <= lastHighestProgressIndex) {
        setCurrentStep(stepIndex);
      }
    },
    [lastHighestProgressIndex],
  );

  const handleChange = (name: string, value: any) => {
    setTransferDetails((prev: any) => ({ ...prev, [name]: value }));

    if (name === "transferType") {
      const selectedType = TRANSFER_TYPE_OPTIONS.find((option) => option.value === value);
      setInstructionCount(selectedType ? selectedType.maxInstructions : 0);
    }

    // If source account is changed, capture its details
    if (name === 'sourceAccount') {
      const selectedSourceAccount = ACCOUNT_INFO_OPTIONS.find((acc) => acc.value === value);
      if (selectedSourceAccount) {
        setTransferDetails((prev: any) => ({
          ...prev,
          sourceAccountName: selectedSourceAccount.name,
          sourceAccountNumber: selectedSourceAccount.accNumber,
          sourceAccountBranch: selectedSourceAccount.sortCode,
          sourceAccountBic: selectedSourceAccount.bic,
          sourceAccountCountry: selectedSourceAccount.countryRegion,
        }));
      }
    }
  };

  const getBalances = (account: { sortCode: string; bic: string; currency: string; countryRegion: string }) => [
    { label: 'BIC/SWIFT', value: account.bic },
    { label: 'Sort Code', value: account.sortCode },
    { label: 'Currency', value: account.currency },
    { label: 'Country/Region', value: account.countryRegion },
  ];

  const ACCOUNT_INFO_OPTIONS = useMemo(() => ACCOUNT_LIST.map((account) => ({
    value: account.id,
    name: account.name,
    masked: account.masked,
    accNumber: account.accNumber,
    sortCode: account.sortCode,
    bic: account.bic,
    balances: getBalances(account),
    currency: account.currency,
    countryRegion: account.countryRegion,
    iconChevronDown: IconChevronDown,
  })), []);

  const handleAddToBatch = useCallback(() => {
    try {
      if (!transferDetails.destinationAccount || !transferDetails.transferAmount) {
        return;
      }

      const selectedAccount = ACCOUNT_INFO_OPTIONS.find(
        (option) => option.value === transferDetails.destinationAccount
      );

      const nextId = batchItems.length + 1;
      const newBatchItem = {
        id: nextId,
        accountName: selectedAccount?.name || '',
        accountNumber: selectedAccount?.accNumber || '',
        sortCode: selectedAccount?.sortCode || '',
        bic: selectedAccount?.bic || '',
        transferAmount: transferDetails.transferAmount,
        creditReference: transferDetails.creditReference || `${nextId}`,
        currency: selectedAccount?.currency || 'ZAR',
      };

      setBatchItems((prev) => [...prev, newBatchItem]);
      
      // Clear transfer to fields
      setTransferDetails((prev: any) => ({
        ...prev,
        destinationAccount: '',
        transferAmount: '',
        creditReference: '',
      }));

      methodsDetails.setValue('destinationAccount', '');
      methodsDetails.setValue('transferAmount', '');
      methodsDetails.setValue('creditReference', '');
    } catch (error) {
      console.error('Error adding batch item:', error);
      showError('Failed to add item to batch. Please try again.');
    }
  }, [transferDetails, batchItems, ACCOUNT_INFO_OPTIONS, methodsDetails]);

  const handleAddInstruction = useCallback(() => {
    // Create a new instruction with current transfer details and batch items
    const newInstruction = {
      id: instructionsList.length + 1,
      transferDetails: { ...transferDetails },
      batchItems: [...batchItems],
      paymentDate: paymentDate,
      transferMode: transferMode,
      searchBatch: '',
      expandedBatchItem: false as number | false,
    };

    setInstructionsList((prev) => [...prev, newInstruction]);

    // Reset the form completely for the next instruction - all fields should be empty
    setTransferDetails({
      transferType: transferDetails.transferType, // Keep transfer type only
      sourceAccount: '', // Clear source account
      sourceAccountName: '', // Clear source account name
      sourceAccountNumber: '', // Clear source account number
      sourceAccountBranch: '', // Clear source account branch
      sourceAccountBic: '', // Clear source account BIC
      sourceAccountCountry: '', // Clear source account country
      destinationAccount: '', // Clear destination
      transferCurrency: '', // Clear transfer currency
      debitCurrency: '', // Clear debit currency
      debitReference: '', // Clear debit reference
      transferAmount: '', // Clear transfer amount
      creditReference: '', // Clear credit reference
      paymentDate: null, // Clear payment date
    });
    setBatchItems([]); // Clear batch items to start fresh
    setPaymentDate(null); // Clear payment date state
    setTransferMode(0); // Reset transfer mode
    setSearchBatch('');

    methodsDetails.reset({
      sourceAccount: '', // Clear source account
      destinationAccount: '', // Clear destination
      transferCurrency: '', // Clear transfer currency
      debitCurrency: '', // Clear debit currency
      debitReference: '', // Clear debit reference
      transferAmount: '', // Clear transfer amount
      creditReference: '', // Clear credit reference
      paymentDate: null, // Clear payment date
    });
  }, [instructionsList, transferDetails, batchItems, paymentDate, transferMode, methodsDetails]);

  const handleRemoveInstruction = useCallback((id: number) => {
    setInstructionsList((prev) => prev.filter((instr) => instr.id !== id));
  }, []);

  const handleUpdateInstructionField = useCallback((instructionId: number, fieldName: string, value: any) => {
    setInstructionsList((prev) =>
      prev.map((instr) => {
        if (instr.id === instructionId) {
          return {
            ...instr,
            transferDetails: {
              ...instr.transferDetails,
              [fieldName]: value,
            },
          };
        }
        return instr;
      })
    );
  }, []);

  const handleUpdateInstructionTransferMode = useCallback((instructionId: number, mode: number) => {
    setInstructionsList((prev) =>
      prev.map((instr) => {
        if (instr.id === instructionId) {
          return { ...instr, transferMode: mode };
        }
        return instr;
      })
    );
  }, []);

  const handleUpdateInstructionPaymentDate = useCallback((instructionId: number, date: Dayjs | null) => {
    setInstructionsList((prev) =>
      prev.map((instr) => {
        if (instr.id === instructionId) {
          return { ...instr, paymentDate: date };
        }
        return instr;
      })
    );
  }, []);

  const handleUpdateInstructionBatchItems = useCallback((instructionId: number, batchItems: any[]) => {
    setInstructionsList((prev) =>
      prev.map((instr) => {
        if (instr.id === instructionId) {
          return { ...instr, batchItems };
        }
        return instr;
      })
    );
  }, []);

  const handleRemoveInstructionBatchItem = useCallback((instructionId: number, batchItemId: number) => {
    setInstructionsList((prev) =>
      prev.map((instr) => {
        if (instr.id === instructionId) {
          return {
            ...instr,
            batchItems: instr.batchItems.filter((item: any) => item.id !== batchItemId),
          };
        }
        return instr;
      })
    );
  }, []);

  const handleAddToInstructionBatch = useCallback((instructionId: number) => {
    setInstructionsList((prev) =>
      prev.map((instruction) => {
        if (instruction.id === instructionId) {
          const selectedAccount = ACCOUNT_INFO_OPTIONS.find(
            (option) => option.value === instruction.transferDetails.destinationAccount
          );

          const nextId = (instruction.batchItems?.length || 0) + 1;
          const newBatchItem = {
            id: nextId,
            accountName: selectedAccount?.name || '',
            accountNumber: selectedAccount?.accNumber || '',
            sortCode: selectedAccount?.sortCode || '',
            bic: selectedAccount?.bic || '',
            transferAmount: instruction.transferDetails.transferAmount,
            creditReference: instruction.transferDetails.creditReference || `${nextId}`,
            currency: selectedAccount?.currency || 'ZAR',
          };

          return {
            ...instruction,
            batchItems: [...(instruction.batchItems || []), newBatchItem],
            transferDetails: {
              ...instruction.transferDetails,
              destinationAccount: '',
              transferAmount: '',
              creditReference: '',
            },
          };
        }
        return instruction;
      })
    );
  }, [ACCOUNT_INFO_OPTIONS]);

  const handleClearBatch = useCallback(() => {
    setBatchItems([]);
    setLastInstructionItemCount(0);
  }, []);

  const handleRemoveBatchItem = useCallback((id: number) => {
    setBatchItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleExpandBatchItem = useCallback(
    (panel: number) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedBatchItem(isExpanded ? panel : false);
    },
    []
  );

  const filteredBatchItems = useMemo(() => {
    if (!searchBatch) return batchItems;
    return batchItems.filter(
      (item) =>
        item.accountName.toLowerCase().includes(searchBatch.toLowerCase()) ||
        item.accountNumber.includes(searchBatch) ||
        item.creditReference.toLowerCase().includes(searchBatch.toLowerCase())
    );
  }, [batchItems, searchBatch]);

  const paginatedBatchItems = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredBatchItems.slice(startIndex, endIndex);
  }, [filteredBatchItems, currentPage, rowsPerPage]);

  const handlePageChange = (_: ChangeEvent<unknown>, newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage as 15 | 30 | 50);
    setCurrentPage(1);
  };

  const totalBatchAmount = useMemo(() => {
    return batchItems.reduce((sum, item) => sum + parseFloat(item.transferAmount || 0), 0);
  }, [batchItems]);

  const steps = [
    { label: t('transferType'), description: t('description') },
    { label: t('paymentDetails'), description: t('description') },
    { label: t('reviewAndSubmit'), description: t('description') },
  ];

  const handleNext = useCallback(() => {
    // Use react-hook-form's two-callback handleSubmit pattern
    // This prevents form submission when validation fails
    const onValid = () => {
      try {
        if (currentStep < steps.length - 1) {
          const nextStep = currentStep + 1;
          setCurrentStep(nextStep);
          setLastHighestProgressIndex((prev) => Math.max(prev, nextStep));
        }
      } catch (error) {
        console.error('Error advancing step:', error);
        showError('An unexpected error occurred. Please try again.');
      }
    };

    const onInvalid = () => {
      // Validation failed - errors are already displayed in form fields
      // This prevents form submission
      console.log('Form validation failed');
    };

    // Step-specific validation
    if (currentStep === 0) {
      // Step 0: Validate only transfer type
      methodsDetails.handleSubmit(onValid, onInvalid)();
    } else if (currentStep === 1) {
      // Step 1: Skip validation if batch items exist, otherwise validate all payment details
      if (batchItems.length > 0) {
        // Skip validation when batch items are present
        onValid();
      } else {
        // First trigger validation on all required fields
        methodsDetails.trigger([
          'sourceAccount',
          'transferCurrency',
          'debitCurrency',
          'destinationAccount',
          'transferAmount',
          'paymentDate',
        ]).then((isValid) => {
          if (isValid) {
            onValid();
          }
        }).catch((error) => {
          console.error('Validation error:', error);
          showError('An error occurred during validation. Please try again.');
        });
      }
    } else {
      // Other steps - just proceed
      onValid();
    }
  }, [currentStep, steps.length, methodsDetails, batchItems]);

  const handleCancelClick = useCallback(() => {
    setCancellationDialogOpen(true);
  }, []);

  const handleCancellationDialogDismiss = useCallback(() => {
    setCancellationDialogOpen(false);
  }, []);

  const handleCancellationConfirm = useCallback(() => {
    setCancellationDialogOpen(false);
    window.history.back();
  }, []);

  const handleSubmitTransfer = useCallback(() => {
    try {
      // Validate the form before submitting
      methodsDetails.handleSubmit(
        async (data) => {
          try {
            // Form is valid - proceed with submission
            console.log('Submitting transfer:', data);
            // TODO: Call API to submit transfer
            // await submitTransfer(data);
            showError('Transfer submitted successfully!', undefined);
            
            // Redirect to success page
            setTimeout(() => {
              router.push('/transfers/create/success' as any);
            }, 1500);
          } catch (error) {
            console.error('Error submitting transfer:', error);
            showError('Failed to submit transfer. Please try again.');
          }
        },
        () => {
          // Validation failed - errors already displayed in form
          console.log('Form validation failed - cannot submit');
        }
      )();
    } catch (error) {
      console.error('Error in form submission:', error);
      showError('An unexpected error occurred. Please try again.');
    }
  }, [methodsDetails, router]);

  const transferTypeField = [
    {
      name: 'transferType',
      label: t('transferType'),
      value: transferDetails?.transferType || '',
      type: 'select' as const,
      required: true,
      placeholder: t('transferTypeName'),
      options: TRANSFER_TYPE_OPTIONS,
    },
  ];

  const transferFromFields = [
    {
      name: 'transferCurrency',
      label: t('transferCurrency'),
      value: transferDetails?.transferCurrency || '',
      type: 'select' as const,
      required: true,
      options: CURRENCY_OPTIONS,
    },
    {
      name: 'debitCurrency',
      label: t('debitCurrency'),
      value: transferDetails?.debitCurrency || '',
      type: 'select' as const,
      required: true,
      options: CURRENCY_OPTIONS,
    },
    {
      name: 'debitReference',
      label: t('debitReference'),
      value: transferDetails?.debitReference || '',
      type: 'text' as const,
      required: false,
    },
  ];

  const transferToFields = [
    {
      name: 'transferAmount',
      label: t('transferAmount'),
      value: transferDetails?.transferAmount || '',
      type: 'text' as const,
      required: true,
    },
    {
      name: 'creditReference',
      label: t('creditReference'),
      value: transferDetails?.creditReference || '',
      type: 'text' as const,
      required: false,
    },
  ];

  const handlePaymentDateChange = (date: unknown) => {
    if (date && dayjs.isDayjs(date)) {
      setPaymentDate(date as Dayjs);
      handleChange('paymentDate', date);
    } else {
      setPaymentDate(null);
      handleChange('paymentDate', null);
    }
  };

  return (
    <section className={styles.container}>
      <BreadcrumbList links={breadcrumbLinks} />
      <Grid size={12} className={styles.headerRow}>
        <Heading as="h4" fontSize="28px">{t('createATransfer')}</Heading>
      </Grid>
      <section className={styles.content}>
        <Paper className={styles.paperContainer} elevation={0}>
          <Stepper activeStep={currentStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label} completed={index < lastHighestProgressIndex}>
                <StepLabel className={styles.stepLabel} onClick={() => onSelectStep(index)} sx={{ cursor: index <= lastHighestProgressIndex ? 'pointer' : 'default' }} optional={<Typography variant="body2" className={styles.stepDescription}>{step.description}</Typography>}>{step.label}</StepLabel>
                <StepContent>
                  {currentStep === 0 && (
                    <Box  className={styles.stepContainer}>
                      <RHFProvider methods={methodsDetails} onSubmit={() => {}} asForm={false}>
                        <Box className={styles.createTransfersForm}>
                          <CreateJournyForm 
                            title={t('transferType')} 
                            titleIconEelement={<Icon name="bank" width="24px" height="24px"  bgColor={"#0051FF"} />} 
                            fields={transferTypeField as any} 
                            onChange={handleChange} 
                            mode="edit" 
                            ShowActionBtns={false} 
                            renderWithRHF 
                            formMethods={methodsDetails}
                            rulesProvider={(name, getVals) => getRulesForField(name as any, getVals)}
                          />
                        </Box>
                      </RHFProvider>
                      <FormActionButtons nextText={t('next')} cancelText={t('cancel')} onCancel={handleCancelClick} onNext={handleNext} />
                    </Box>
                  )}
                  {currentStep === 1 && (
                    <Box className={styles.stepContentstepContent}>
                      {/* Display existing instructions as editable sections */}
                      {instructionsList.map((instruction, index) => {
                        const instructionBatchItems = instruction.batchItems || [];
                        const instructionFilteredBatchItems = instructionBatchItems;
                        const instructionPaginatedBatchItems = instructionBatchItems.slice(0, 15);
                        const instructionTotalBatchAmount = instructionBatchItems.reduce((sum: number, item: any) => sum + parseFloat(item.transferAmount || 0), 0);

                        // Create instruction-specific field definitions based on the instruction's transferDetails
                        const instructionTransferFromFields = [
                          {
                            name: 'transferCurrency',
                            label: t('transferCurrency'),
                            value: instruction.transferDetails?.transferCurrency || '',
                            type: 'select' as const,
                            required: true,
                            options: CURRENCY_OPTIONS,
                          },
                          {
                            name: 'debitCurrency',
                            label: t('debitCurrency'),
                            value: instruction.transferDetails?.debitCurrency || '',
                            type: 'select' as const,
                            required: true,
                            options: CURRENCY_OPTIONS,
                          },
                          {
                            name: 'debitReference',
                            label: t('debitReference'),
                            value: instruction.transferDetails?.debitReference || '',
                            type: 'text' as const,
                            required: false,
                          },
                        ];

                        const instructionTransferToFields = [
                          {
                            name: 'transferAmount',
                            label: t('transferAmount'),
                            value: instruction.transferDetails?.transferAmount || '',
                            type: 'text' as const,
                            required: true,
                          },
                          {
                            name: 'creditReference',
                            label: t('creditReference'),
                            value: instruction.transferDetails?.creditReference || '',
                            type: 'text' as const,
                            required: false,
                          },
                        ];

                        return (
                          <Box key={instruction.id} >
                            {/* Instruction Header with Delete */}
                            {/* <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2, paddingBottom: 2, borderBottom: '2px solid #0051FF' }}>
                              <Typography sx={{ fontWeight: 600, fontSize: '16px', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Icon name="instructions" width="20" height="20" bgColor="#0051FF" />
                                Instruction {index + 1}
                              </Typography>
                              <Button buttonVariant="tertiary" sx={{ textTransform: 'none', padding: '4px 8px', color: '#FF0000' }} onClick={() => handleRemoveInstruction(instruction.id)}>
                                <Icon name="delete" width="18" height="18" bgColor="#FF0000" />
                              </Button>
                            </Box> */}

                            {/* Editable PaymentDetailsSection for this instruction */}
                            <PaymentDetailsSection
                              formMethods={methodsDetails}
                              transferDetails={instruction.transferDetails}
                              transferMode={instruction.transferMode}
                              transferFromFields={instructionTransferFromFields}
                              transferToFields={instructionTransferToFields}
                              accountInfoOptions={ACCOUNT_INFO_OPTIONS}
                              batchItems={instructionBatchItems}
                              searchBatch={instruction.searchBatch}
                              paymentId={paymentId}
                              paymentDate={instruction.paymentDate}
                              expandedBatchItem={instruction.expandedBatchItem}
                              paginatedBatchItems={instructionPaginatedBatchItems}
                              filteredBatchItems={instructionFilteredBatchItems}
                              currentPage={1}
                              rowsPerPage={15}
                              totalBatchAmount={instructionTotalBatchAmount}
                              onChangeField={(name, value) => handleUpdateInstructionField(instruction.id, name, value)}
                              onSetTransferMode={(mode) => handleUpdateInstructionTransferMode(instruction.id, mode)}
                              onSetSearchBatch={(search) => setSearchBatch(search)}
                              onSetPaymentId={() => {}}
                              onSetExpandedBatchItem={(expanded) => setExpandedBatchItem(expanded)}
                              onAddToBatch={() => handleAddToInstructionBatch(instruction.id)}
                              onClearBatch={() => handleUpdateInstructionBatchItems(instruction.id, [])}
                              onRemoveBatchItem={(itemId) => handleRemoveInstructionBatchItem(instruction.id, itemId)}
                              onExpandBatchItem={() => () => {}}
                              onPageChange={() => {}}
                              onRowsPerPageChange={() => {}}
                              onPaymentDateChange={(date) => handleUpdateInstructionPaymentDate(instruction.id, date as Dayjs | null)}
                              iconChevronDown={IconChevronDown}
                              iconSearch={IconSearch}
                              isSavedInstruction={true}
                              instructionIndex={index}
                            />
                          </Box>
                        );
                      })}

                      <PaymentDetailsSection
                        formMethods={methodsDetails}
                        transferDetails={transferDetails}
                        transferMode={transferMode}
                        transferFromFields={transferFromFields}
                        transferToFields={transferToFields}
                        accountInfoOptions={ACCOUNT_INFO_OPTIONS}
                        batchItems={batchItems}
                        searchBatch={searchBatch}
                        paymentId={paymentId}
                        paymentDate={paymentDate}
                        expandedBatchItem={expandedBatchItem}
                        paginatedBatchItems={paginatedBatchItems}
                        filteredBatchItems={filteredBatchItems}
                        currentPage={currentPage}
                        rowsPerPage={rowsPerPage}
                        totalBatchAmount={totalBatchAmount}
                        onChangeField={handleChange}
                        onSetTransferMode={setTransferMode}
                        onSetSearchBatch={setSearchBatch}
                        onSetPaymentId={setPaymentId}
                        onSetExpandedBatchItem={setExpandedBatchItem}
                        onAddToBatch={handleAddToBatch}
                        onClearBatch={handleClearBatch}
                        onRemoveBatchItem={handleRemoveBatchItem}
                        onExpandBatchItem={handleExpandBatchItem}
                        onPageChange={handlePageChange}
                        onRowsPerPageChange={handleRowsPerPageChange}
                        onPaymentDateChange={handlePaymentDateChange}
                        iconChevronDown={IconChevronDown}
                        iconSearch={IconSearch}
                      />

                      {/* ADD AN INSTRUCTION - Outside the form container */}
                      <Box className={styles.addInstructionContainer}>
                        <Button buttonVariant="tertiary" startIcon={<Icon name="add" width="20" height="20"  bgColor={"#0051FF"} />} onClick={handleAddInstruction}>
                          {t('addAnInstruction')}
                        </Button>
                      </Box>

                      {/* Action Buttons - Outside the form container */}
                      <Box className={styles.reviewActionFooter}>
                        <FormActionButtons cancelText={t('cancel')} onCancel={handleCancelClick} showNext={false} />
                        <Box className={styles.reviewActionEnd}>
                          <Box className={styles.reviewActionButtons}>
                            <Button buttonVariant="secondary" startIcon={<Icon name="save" width="20" height="20" bgColor={"#0051FF"} />} onClick={() => console.log('Save to drafts')}>{t('saveToDrafts')}</Button>
                            <Button buttonVariant="primary" startIcon={<Icon name="arrowRight" width="20" height="20" bgColor="#fff" />} onClick={handleNext}>{t('reviewAndSubmitBtn')}</Button>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  )}
                  {currentStep === 2 && (
                    <Box className={styles.stepContentstepContent}>
                      {/* Transfer Type Section */}
                      <Box className={styles.section}>
                        <Box className={styles.sectionHeader}>
                          <Icon name="bank" width="24" height="24" bgColor={"#0051FF"} />
                          <Typography variant="h6">{t('transferType')}</Typography>
                          <Box sx={{ marginLeft: 'auto' }}>
                            <Button buttonVariant="tertiary" sx={{ textTransform: 'none', padding: '4px 8px' }} onClick={() => setCurrentStep(0)}>
                              {t('edit') || 'EDIT'}
                            </Button>
                          </Box>
                        </Box>
                        <Box className={styles.sectionContent}>
                          <Box sx={{ display: 'grid', gap: 2 }}>
                            <Box>
                              <Typography sx={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>{t('transferType')}</Typography>
                              <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>{transferDetails?.transferType || '-'}</Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Box>

                      {/* Instructions as Accordions */}
                      <Box sx={{ marginTop: 3 }}>
                        {instructions.map((instruction, index) => (
                          <Accordion
                            key={instruction.instructionId}
                            expanded={expandedInstruction === instruction.instructionId}
                            onChange={() => setExpandedInstruction(expandedInstruction === instruction.instructionId ? false : instruction.instructionId)}
                            sx={{ marginBottom: 2, border: `1px solid ${COLORS.BORDER}`, borderRadius: '8px' }}
                          >
                            <AccordionSummary 
                              expandIcon={<Icon name="chevronDown" width="20" height="20" />}
                              sx={{ backgroundColor: COLORS.BACKGROUND_LIGHT }}
                            >
                              <Icon name="instructions" width="20" height="20" bgColor={"#0051FF"} />
                              <Typography sx={{ marginLeft: 1, fontWeight: 600 }}>Instruction {index + 1}</Typography>
                              <Box sx={{ marginLeft: 'auto', display: 'flex', gap: 1 }}>
                                <Button buttonVariant="tertiary" sx={{ textTransform: 'none', padding: '4px 8px' }} onClick={() => setCurrentStep(1)}>
                                  {t('edit') || 'EDIT'}
                                </Button>
                                <Button buttonVariant="tertiary" sx={{ textTransform: 'none', padding: '4px 8px', color: '#FF0000' }} onClick={() => setInstructions((prev) => prev.filter((i) => i.instructionId !== instruction.instructionId))}>
                                  DELETE
                                </Button>
                              </Box>
                            </AccordionSummary>
                            <AccordionDetails sx={{ padding: 2 }}>
                              {/* Transfer From */}
                              <Box sx={{ marginBottom: 3 }}>
                                <Typography sx={{ fontSize: '14px', fontWeight: 600, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Icon name="bank" width="20" height="20"  bgColor={"#0051FF"} />
                                  Transfer From
                                </Typography>
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, paddingLeft: 4 }}>
                                  <Box>
                                    <Typography sx={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Account name</Typography>
                                    <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>{instruction.transferFrom.accountName || '-'}</Typography>
                                  </Box>
                                  <Box>
                                    <Typography sx={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Account number</Typography>
                                    <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>{instruction.transferFrom.accountNumber || '-'}</Typography>
                                  </Box>
                                  <Box>
                                    <Typography sx={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Transfer Currency</Typography>
                                    <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>{instruction.transferFrom.transferCurrency || '-'}</Typography>
                                  </Box>
                                  <Box>
                                    <Typography sx={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Debit Currency</Typography>
                                    <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>{instruction.transferFrom.debitCurrency || '-'}</Typography>
                                  </Box>
                                  <Box>
                                    <Typography sx={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Branch Code</Typography>
                                    <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>{instruction.transferFrom.branchCode || '-'}</Typography>
                                  </Box>
                                  <Box>
                                    <Typography sx={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>BIC/SWIFT</Typography>
                                    <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>{instruction.transferFrom.bicSwift || '-'}</Typography>
                                  </Box>
                                </Box>
                              </Box>

                              {/* Transfer To Items */}
                              <Box sx={{ marginBottom: 3 }}>
                                <Typography sx={{ fontSize: '14px', fontWeight: 600, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Icon name="accounts" width="20" height="20" bgColor={"#0051FF"} />
                                  Transfer To ({instruction.transferTo.length} items)
                                </Typography>
                                <Box sx={{ border: `1px solid ${COLORS.BORDER}`, borderRadius: '8px', overflow: 'hidden', paddingLeft: 4 }}>
                                  {instruction.transferTo.map((item: any, itemIndex: number) => (
                                    <Box
                                      key={item.id}
                                      sx={{
                                        padding: 2,
                                        borderBottom: itemIndex < instruction.transferTo.length - 1 ? `1px solid ${COLORS.BORDER_LIGHT}` : 'none',
                                        display: 'grid',
                                        gridTemplateColumns: '100px 1fr 150px 150px',
                                        gap: 2,
                                        alignItems: 'center',
                                      }}
                                    >
                                      <Box>
                                        <Typography sx={{ fontSize: '12px', color: '#666' }}>#{itemIndex + 1}</Typography>
                                        <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>{item.accountName}</Typography>
                                      </Box>
                                      <Box>
                                        <Typography sx={{ fontSize: '12px', color: '#666' }}>Account Number</Typography>
                                        <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>{item.accountNumber}</Typography>
                                      </Box>
                                      <Box>
                                        <Typography sx={{ fontSize: '12px', color: '#666' }}>Branch/Sort Code</Typography>
                                        <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>{item.sortCode || '-'}</Typography>
                                      </Box>
                                      <Box>
                                        <Typography sx={{ fontSize: '12px', color: '#666' }}>Transfer Amount</Typography>
                                        <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>{item.currency} {item.transferAmount}</Typography>
                                      </Box>
                                    </Box>
                                  ))}
                                </Box>
                              </Box>

                              {/* Payment Schedule */}
                              <Box>
                                <Typography sx={{ fontSize: '14px', fontWeight: 600, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Icon name="calendar" width="20" height="20" bgColor={"#0051FF"} />
                                  Payment Schedule
                                </Typography>
                                <Box sx={{ paddingLeft: 4 }}>
                                  <Typography sx={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Payment Date</Typography>
                                  <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>{instruction.paymentDate ? instruction.paymentDate.format('DD/MM/YYYY') : '-'}</Typography>
                                </Box>
                              </Box>
                            </AccordionDetails>
                          </Accordion>
                        ))}
                      </Box>

                      {/* Action Buttons */}
                      <Box sx={{ marginTop: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Button buttonVariant="tertiary" onClick={handleCancelClick}>
                          {t('cancel') || 'CANCEL'}
                        </Button>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Button buttonVariant="secondary" onClick={() => console.log('Save to drafts')}>
                            {t('saveToDrafts') || 'SAVE TO DRAFTS'}
                          </Button>
                          <Button buttonVariant="primary" onClick={handleSubmitTransfer}>
                            {t('submitPaymentApproval') || 'SUBMIT PAYMENT FOR APPROVAL'}
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  )}
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Paper>
      </section>

      {/* Cancellation Confirmation Dialog */}
      <CancellationConfirmationDialog
        open={cancellationDialogOpen}
        onClose={handleCancellationDialogDismiss}
        onDismiss={handleCancellationDialogDismiss}
        onCancel={handleCancellationConfirm}
        title={t('cancellationConfirmation') || 'Cancellation confirmation'}
        heading={t('areYouSureYouWantToCancel') || 'Are you sure you want to cancel?'}
        subheading={t('unsavedChangesWillBeLost') || 'Unsaved changes to the payment information will be lost'}
        dismissLabel={t('dismiss') || 'DISMISS'}
        cancelLabel={t('yesCancel') || 'YES, CANCEL'}
      />

      {/* System Error Dialog */}
      <DeleteConfirmationDialog
        open={errorDialogOpen}
        onClose={handleErrorClose}
        onPrimaryCTA={handleErrorRetry}
        onSecondaryCTA={handleErrorClose}
        selectedCount={1}
        exclamationIcon={<Icon name="alert" width="56" height="56" bgColor={"#FF0000"} />}
        title="System error"
        message={
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ fontWeight: 700, fontSize: '16px', marginBottom: '16px', marginTop: '12px' }}>
              Something went wrong
            </Box>
            <Box sx={{ fontSize: '14px', color: '#222E37' }}>
              {errorMessage}
            </Box>
          </Box>
        }
        primaryCTALabel={errorRetryAction ? "Try again" : "Dismiss"}
        secondaryCTALabel={errorRetryAction ? "Cancel" : undefined}
      />
    </section>
  );
};

export default CreateTransfers;
