'use client';
import { useCallback, useMemo, useState, ChangeEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import styles from './CreateTransfers.module.scss';
import { Box, Grid, Paper, Step, StepContent, StepLabel, Stepper, Typography, TextField, InputAdornment, Accordion, AccordionSummary, AccordionDetails, FormHelperText, Tooltip } from '@mui/material';
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
import InstructionForm from './InstructionForm';
import PaymentDetailsForm from './PaymentDetailsForm';

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
  const [instructionBatchSearch, setInstructionBatchSearch] = useState<{ [key: number]: string }>({});
  const [instructionBatchPage, setInstructionBatchPage] = useState<{ [key: number]: number }>({});
  const [instructionBatchRowsPerPage, setInstructionBatchRowsPerPage] = useState<{ [key: number]: 15 | 30 | 50 }>({});
  const [instructionExpandedBatchItem, setInstructionExpandedBatchItem] = useState<{ [key: number]: string | false }>({});
  const [instructionBatchExpandedItems, setInstructionBatchExpandedItems] = useState<{ [key: number]: Set<string> }>({});
  const [instructionPaymentId, setInstructionPaymentId] = useState<{ [key: number]: string }>({});
  const [paymentId, setPaymentId] = useState('[Auto generated (editable) payment ID]');
  const [paymentDate, setPaymentDate] = useState<Dayjs | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<15 | 30 | 50>(15);
  const [nextInstructionId, setNextInstructionId] = useState(1);
  const [collapsedInstructions, setCollapsedInstructions] = useState<Set<number>>(new Set());
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

  const detailsDefaultValues = {
    transferType: transferDetails?.transferType || '',
    sourceAccount: transferDetails?.sourceAccount || '',
    destinationAccount: transferDetails?.destinationAccount || '',
    transferCurrency: transferDetails?.transferCurrency || '',
    debitAmount: transferDetails?.debitAmount || '',
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
        // When going back from Step 2 (Review & Submit) to Step 1 (Payment Details)
        if (stepIndex === 1 && currentStep === 2 && instructions.length > 0) {
          // Get the last instruction from the array
          const lastInstruction = instructions[instructions.length - 1];
          
          // Restore data based on transferMode
          const restoredData: any = {
            transferCurrency: lastInstruction.transferCurrency || '',
            paymentDate: lastInstruction.paymentDate || null,
          };

          if (lastInstruction.transferMode === 0) {
            // Mode 0: Single to Multiple - restore source account details
            restoredData.sourceAccount = lastInstruction.sourceAccount || '';
            restoredData.sourceAccountName = lastInstruction.sourceAccountName || '';
            restoredData.sourceAccountNumber = lastInstruction.sourceAccountNumber || '';
            restoredData.sourceAccountBranch = lastInstruction.sourceAccountBranch || '';
            restoredData.sourceAccountBic = lastInstruction.sourceAccountBic || '';
            restoredData.sourceAccountCountry = lastInstruction.sourceAccountCountry || '';
            restoredData.debitCurrency = lastInstruction.debitCurrency || '';
            restoredData.debitAmount = '';
            restoredData.debitReference = '';
            restoredData.destinationAccount = '';
            restoredData.transferAmount = '';
            restoredData.creditReference = '';
          } else {
            // Mode 1: Multiple to Single - restore destination and source account details from batch
            restoredData.sourceAccount = lastInstruction.sourceAccount || '';
            restoredData.sourceAccountName = lastInstruction.sourceAccountName || '';
            restoredData.sourceAccountNumber = lastInstruction.sourceAccountNumber || '';
            restoredData.sourceAccountBranch = lastInstruction.sourceAccountBranch || '';
            restoredData.sourceAccountBic = lastInstruction.sourceAccountBic || '';
            restoredData.sourceAccountCountry = '';
            restoredData.debitCurrency = '';
            restoredData.debitAmount = '';
            restoredData.debitReference = '';
            restoredData.destinationAccount = lastInstruction.destinationAccount || '';
            restoredData.transferAmount = lastInstruction.transferAmount || '';
            restoredData.creditReference = lastInstruction.creditReference || '';
          }

          setTransferDetails((prev: any) => ({
            ...prev,
            ...restoredData,
          }));
          
          setPaymentDate(lastInstruction.paymentDate || null);
          setTransferMode(lastInstruction.transferMode || 0);
          setBatchItems(lastInstruction.batchItems || []);
          
          // Update react-hook-form values
          methodsDetails.setValue('transferCurrency', lastInstruction.transferCurrency || '');
          methodsDetails.setValue('paymentDate', lastInstruction.paymentDate || null);
          
          if (lastInstruction.transferMode === 0) {
            methodsDetails.setValue('sourceAccount', lastInstruction.sourceAccount || '');
            methodsDetails.setValue('debitCurrency', lastInstruction.debitCurrency || '');
            methodsDetails.setValue('debitAmount', '');
            methodsDetails.setValue('debitReference', '');
            methodsDetails.setValue('destinationAccount', '');
            methodsDetails.setValue('transferAmount', '');
            methodsDetails.setValue('creditReference', '');
          } else {
            methodsDetails.setValue('sourceAccount', lastInstruction.sourceAccount || '');
            methodsDetails.setValue('debitCurrency', '');
            methodsDetails.setValue('debitAmount', '');
            methodsDetails.setValue('debitReference', '');
            methodsDetails.setValue('destinationAccount', lastInstruction.destinationAccount || '');
            methodsDetails.setValue('transferAmount', lastInstruction.transferAmount || '');
            methodsDetails.setValue('creditReference', lastInstruction.creditReference || '');
          }
          
          // Remove last instruction from array (so it shows in form, not in list)
          setInstructions((prev) => prev.slice(0, -1));
        }
        
        setCurrentStep(stepIndex);
      }
    },
    [lastHighestProgressIndex, currentStep, instructions, methodsDetails],
  );

  const handleChange = (name: string, value: any) => {
    setTransferDetails((prev: any) => ({ ...prev, [name]: value }));

    if (name === "transferType") {
      const selectedType = TRANSFER_TYPE_OPTIONS.find((option) => option.value === value);
      setInstructionCount(selectedType ? selectedType.maxInstructions : 0);
      
      // Clear instructions, batch items, and payment date when transfer type changes
      setInstructions([]);
      setBatchItems([]);
      setPaymentDate(null);
      setLastInstructionItemCount(0);
      setNextInstructionId(1);
      setTransferMode(0);
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
      // Mode 0: Single to Multiple - capture destination account
      if (transferMode === 0) {
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
      }
      // Mode 1: Multiple to Single - capture source account
      else if (transferMode === 1) {
        if (!transferDetails.sourceAccount || !transferDetails.debitAmount || transferDetails.debitAmount.toString().trim() === '') {
          console.log('PaymentDetailsForm Mode 1 Add to Batch validation failed:', { sourceAccount: transferDetails.sourceAccount, debitAmount: transferDetails.debitAmount });
          return;
        }

        const selectedAccount = ACCOUNT_INFO_OPTIONS.find(
          (option) => option.value === transferDetails.sourceAccount
        );

        const nextId = batchItems.length + 1;
        const newBatchItem = {
          id: nextId,
          accountName: selectedAccount?.name || '',
          accountNumber: selectedAccount?.accNumber || '',
          sortCode: selectedAccount?.sortCode || '',
          bic: selectedAccount?.bic || '',
          transferAmount: transferDetails.debitAmount,
          creditReference: transferDetails.debitReference || `${nextId}`,
          currency: selectedAccount?.currency || 'ZAR',
          debitAmount: transferDetails.debitAmount,
        };

        setBatchItems((prev) => [...prev, newBatchItem]);
        
        // Clear transfer from fields (keep sourceAccount for Multiple-to-Single mode)
        setTransferDetails((prev: any) => ({
          ...prev,
          debitAmount: '',
          debitReference: '',
        }));

        methodsDetails.setValue('debitAmount', '');
        methodsDetails.setValue('debitReference', '');
      }
    } catch (error) {
      console.error('Error adding batch item:', error);
      showError('Failed to add item to batch. Please try again.');
    }
  }, [transferDetails, batchItems, transferMode, ACCOUNT_INFO_OPTIONS, methodsDetails]);

  const handleAddInstruction = useCallback(() => {
    try {
      // Get only NEW items added since the last instruction
      const newItemsForInstruction = batchItems.slice(lastInstructionItemCount);
      
      // Validate that we have all required data to create an instruction
      if (newItemsForInstruction.length === 0) {
        showError('Please add at least one item to the batch before creating an instruction.');
        return;
      }

      if (!paymentDate) {
        showError('Please select a payment date.');
        return;
      }

      // Mode-specific instruction creation
      let newInstruction: any;

      if (transferMode === 0) {
        // Mode 0: Single to Multiple - Keep source account, clear destination
        if (!transferDetails.sourceAccount) {
          showError('Please select a source account.');
          return;
        }

        newInstruction = {
          instructionId: nextInstructionId,
          sourceAccount: transferDetails.sourceAccount || '',
          sourceAccountName: transferDetails.sourceAccountName || '',
          sourceAccountNumber: transferDetails.sourceAccountNumber || '',
          sourceAccountBranch: transferDetails.sourceAccountBranch || '',
          sourceAccountBic: transferDetails.sourceAccountBic || '',
          sourceAccountCountry: transferDetails.sourceAccountCountry || '',
          transferCurrency: transferDetails.transferCurrency || '',
          debitCurrency: '',
          debitAmount: '',
          debitReference: '',
          destinationAccount: '',
          transferAmount: '',
          creditReference: '',
          paymentDate: paymentDate,
          batchItems: [...batchItems],
          transferMode: transferMode,
        };
      } else {
        // Mode 1: Multiple to Single - Capture source account from first batch item, keep destination
        if (!transferDetails.destinationAccount) {
          showError('Please select a destination account.');
          return;
        }

        // Get first batch item details to populate source account in instruction
        const firstBatchItem = batchItems[0];
        const sourceAccountDetails = firstBatchItem ? {
          sourceAccountName: firstBatchItem.accountName || '',
          sourceAccountNumber: firstBatchItem.accountNumber || '',
          sourceAccountBranch: firstBatchItem.sortCode || '',
          sourceAccountBic: firstBatchItem.bic || '',
        } : {
          sourceAccountName: '',
          sourceAccountNumber: '',
          sourceAccountBranch: '',
          sourceAccountBic: '',
        };

        newInstruction = {
          instructionId: nextInstructionId,
          sourceAccount: transferDetails.sourceAccount || '',
          sourceAccountName: sourceAccountDetails.sourceAccountName,
          sourceAccountNumber: sourceAccountDetails.sourceAccountNumber,
          sourceAccountBranch: sourceAccountDetails.sourceAccountBranch,
          sourceAccountBic: sourceAccountDetails.sourceAccountBic,
          sourceAccountCountry: '',
          transferCurrency: transferDetails.transferCurrency || '',
          debitCurrency: '',
          debitAmount: '',
          debitReference: '',
          destinationAccount: transferDetails.destinationAccount || '',
          transferAmount: transferDetails.transferAmount || '',
          creditReference: transferDetails.creditReference || '',
          paymentDate: paymentDate,
          batchItems: [...batchItems],
          transferMode: transferMode,
        };
      }

      setInstructions((prev) => [...prev, newInstruction]);
      setNextInstructionId((prev) => prev + 1);

      // Reset form for next instruction
      setTransferDetails((prev: any) => ({
        ...prev,
        sourceAccount: '',
        sourceAccountName: '',
        sourceAccountNumber: '',
        sourceAccountBranch: '',
        sourceAccountBic: '',
        sourceAccountCountry: '',
        destinationAccount: '',
        transferCurrency: '',
        debitCurrency: '',
        debitAmount: '',
        debitReference: '',
        transferAmount: '',
        creditReference: '',
      }));

      methodsDetails.reset();
      setBatchItems([]);
      setPaymentDate(null);
      setTransferMode(0);
    } catch (error) {
      console.error('Error adding instruction:', error);
      showError('Failed to add instruction. Please try again.');
    }
  }, [batchItems, lastInstructionItemCount, transferDetails, paymentDate, instructions, methodsDetails, transferMode]);

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
      // Step 1: When moving to Review & Submit - Auto-save PaymentDetailsForm data to instructions array
      if (batchItems.length > 0) {
        try {
          if (!paymentDate) {
            showError('Please select a payment date.');
            return;
          }

          // Mode-specific instruction creation
          let newInstruction: any;

          if (transferMode === 0) {
            // Mode 0: Single to Multiple - Keep source, clear destination
            if (!transferDetails.sourceAccount) {
              showError('Please select a source account.');
              return;
            }

            newInstruction = {
              instructionId: nextInstructionId,
              sourceAccount: transferDetails.sourceAccount || '',
              sourceAccountName: transferDetails.sourceAccountName || '',
              sourceAccountNumber: transferDetails.sourceAccountNumber || '',
              sourceAccountBranch: transferDetails.sourceAccountBranch || '',
              sourceAccountBic: transferDetails.sourceAccountBic || '',
              sourceAccountCountry: transferDetails.sourceAccountCountry || '',
              transferCurrency: transferDetails.transferCurrency || '',
              debitCurrency: '',
              debitAmount: '',
              debitReference: '',
              destinationAccount: '',
              transferAmount: '',
              creditReference: '',
              paymentDate: paymentDate,
              batchItems: [...batchItems],
              transferMode: transferMode,
            };
          } else {
            // Mode 1: Multiple to Single - Capture source account from first batch item, keep destination
            if (!transferDetails.destinationAccount) {
              showError('Please select a destination account.');
              return;
            }

            // Get first batch item details to populate source account in instruction
            const firstBatchItem = batchItems[0];
            const sourceAccountDetails = firstBatchItem ? {
              sourceAccountName: firstBatchItem.accountName || '',
              sourceAccountNumber: firstBatchItem.accountNumber || '',
              sourceAccountBranch: firstBatchItem.sortCode || '',
              sourceAccountBic: firstBatchItem.bic || '',
            } : {
              sourceAccountName: '',
              sourceAccountNumber: '',
              sourceAccountBranch: '',
              sourceAccountBic: '',
            };

            newInstruction = {
              instructionId: nextInstructionId,
              sourceAccount: transferDetails.sourceAccount || '',
              sourceAccountName: sourceAccountDetails.sourceAccountName,
              sourceAccountNumber: sourceAccountDetails.sourceAccountNumber,
              sourceAccountBranch: sourceAccountDetails.sourceAccountBranch,
              sourceAccountBic: sourceAccountDetails.sourceAccountBic,
              sourceAccountCountry: '',
              transferCurrency: transferDetails.transferCurrency || '',
              debitCurrency: '',
              debitAmount: '',
              debitReference: '',
              destinationAccount: transferDetails.destinationAccount || '',
              transferAmount: transferDetails.transferAmount || '',
              creditReference: transferDetails.creditReference || '',
              paymentDate: paymentDate,
              batchItems: [...batchItems],
              transferMode: transferMode,
            };
          }

          // Add to instructions array
          setInstructions((prev) => [...prev, newInstruction]);
          setNextInstructionId((prev) => prev + 1);

          // Clear form for next instruction
          setTransferDetails((prev: any) => ({
            ...prev,
            sourceAccount: '',
            sourceAccountName: '',
            sourceAccountNumber: '',
            sourceAccountBranch: '',
            sourceAccountBic: '',
            sourceAccountCountry: '',
            destinationAccount: '',
            transferCurrency: '',
            debitCurrency: '',
            debitAmount: '',
            debitReference: '',
            transferAmount: '',
            creditReference: '',
          }));

          methodsDetails.reset();
          setBatchItems([]);
          setPaymentDate(null);
          setTransferMode(0);

          // Move to Review & Submit
          onValid();
        } catch (error) {
          console.error('Error saving PaymentDetailsForm:', error);
          showError('Failed to save payment details. Please try again.');
        }
      } else {
        showError('Please add at least one item to the batch before proceeding to review.');
      }
    } else {
      // Other steps - just proceed
      onValid();
    }
  }, [currentStep, steps.length, methodsDetails, batchItems, instructions, transferDetails, paymentDate, transferMode, nextInstructionId, showError]);

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

  const transferFromFieldsSingleToMultiple = [
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
  
    const transferFromFieldsMultipleToSingle = [
      {
        name: 'transferCurrency',
        label: t('transferCurrency'),
        value: transferDetails?.transferCurrency || '',
        type: 'select' as const,
        required: true,
        options: CURRENCY_OPTIONS,
      },
      {
        name: 'debitAmount',
        label: t('debitAmount'),
        value: transferDetails?.debitAmount || '',
        type: 'text' as const,
        required: true,
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
  
    const transferToFieldsSingleToMultiple = [
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
  
    const transferToFieldsMultipleToSingle = [
      {
        name: 'creditReference',
        label: t('creditReference'),
        value: transferDetails?.creditReference || '',
        type: 'text' as const,
        required: false,
      },
    ];

   // Conditionally select the correct field arrays based on transfer mode
  const transferFromFields = transferMode === 0 ? transferFromFieldsSingleToMultiple : transferFromFieldsMultipleToSingle;
  const transferToFields = transferMode === 0 ? transferToFieldsSingleToMultiple : transferToFieldsMultipleToSingle;   

  const handlePaymentDateChange = (date: unknown) => {
    if (date && dayjs.isDayjs(date)) {
      setPaymentDate(date as Dayjs);
      handleChange('paymentDate', date);
    } else {
      setPaymentDate(null);
      handleChange('paymentDate', null);
    }
  };

  const handleUpdateInstruction = useCallback((instructionId: number, updatedData: any) => {
    setInstructions((prev) =>
      prev.map((instruction) =>
        instruction.instructionId === instructionId ? { ...instruction, ...updatedData } : instruction
      )
    );
    
    // Update only the main transferMode state if editing the current instruction
    if (updatedData.transferMode !== undefined && updatedData.transferMode !== transferMode) {
      setTransferMode(updatedData.transferMode);
    }
  }, [transferMode]);

  const handlePaymentDetailsTransferModeChange = useCallback((newMode: number) => {
    // Update all existing instructions' transfer mode
    setInstructions((prev) =>
      prev.map((instruction) => ({
        ...instruction,
        transferMode: newMode
      }))
    );
    // Update global transfer mode
    setTransferMode(newMode);
  }, []);

  const handleDeleteInstruction = useCallback((instructionId: number) => {
    setInstructions((prev) => prev.filter((instruction) => instruction.instructionId !== instructionId));
  }, []);

  const handleToggleInstructionCollapse = useCallback((instructionId: number) => {
    setCollapsedInstructions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(instructionId)) {
        newSet.delete(instructionId);
      } else {
        newSet.add(instructionId);
      }
      return newSet;
    });
  }, []);

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
                    <Box className={styles.stepContent}>
                      {/* Render all added instructions */}
                      {instructions.length > 0 && (
                        <Box>
                          {instructions.map((instruction, index) => (
                            <Box key={instruction.instructionId} sx={{ marginBottom: 3}}>
                              <InstructionForm 
                                instructionNumber={index + 1}
                                instructionData={instruction}
                                onUpdate={handleUpdateInstruction}
                                onDelete={handleDeleteInstruction}
                                isCollapsed={collapsedInstructions.has(instruction.instructionId)}
                                onToggleCollapse={() => handleToggleInstructionCollapse(instruction.instructionId)}
                              />
                            </Box>
                          ))}
                        </Box>
                      )}

                      {/* Form for adding new instruction */}
                      <PaymentDetailsForm
                        transferMode={transferMode}
                        setTransferMode={handlePaymentDetailsTransferModeChange}
                        transferDetails={transferDetails}
                        handleChange={handleChange}
                        transferFromFields={transferFromFields}
                        methodsDetails={methodsDetails}
                        ACCOUNT_INFO_OPTIONS={ACCOUNT_INFO_OPTIONS}
                        transferToFields={transferToFields}
                        handleAddToBatch={handleAddToBatch}
                        handleClearBatch={handleClearBatch}
                        batchItems={batchItems}
                        searchBatch={searchBatch}
                        setSearchBatch={setSearchBatch}
                        expandedBatchItem={expandedBatchItem}
                        handleExpandBatchItem={handleExpandBatchItem}
                        handleRemoveBatchItem={handleRemoveBatchItem}
                        paginatedBatchItems={paginatedBatchItems}
                        currentPage={currentPage}
                        rowsPerPage={rowsPerPage}
                        handlePageChange={handlePageChange}
                        handleRowsPerPageChange={handleRowsPerPageChange}
                        totalBatchAmount={totalBatchAmount}
                        filteredBatchItems={filteredBatchItems}
                        paymentId={paymentId}
                        setPaymentId={setPaymentId}
                        paymentDate={paymentDate}
                        handlePaymentDateChange={handlePaymentDateChange}
                        handleAddInstruction={handleAddInstruction}
                        instructionCount={instructionCount}
                        instructions={instructions}
                        IconChevronDown={IconChevronDown}
                        IconSearch={IconSearch}
                        getRulesForField={getRulesForField}
                      />

                      {/* ADD AN INSTRUCTION - Outside the form container */}
                      <Box className={styles.addInstructionContainer}>
                        <Tooltip title={instructionCount > 0 && instructions.length + 1 > instructionCount ? `Maximum ${instructionCount} instructions allowed` : ''} placement="top">
                          <span>
                            <Button 
                              buttonVariant="tertiary" 
                              startIcon={<Icon name="add" width="20" height="20"  bgColor={"#0051FF"} />} 
                              onClick={handleAddInstruction}
                              disabled={instructionCount > 0 && instructions.length + 1 > instructionCount}
                            >
                              {t('addAnInstruction')}
                            </Button>
                          </span>
                        </Tooltip>
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
                    <Box className={styles.stepContent}>
                      {/* Transfer Type Section */}
                      <Box sx={{ border: '1px solid #CED3D9', borderRadius: '12px', marginBottom: '16px', backgroundColor: '#FFFFFF', overflow: 'hidden' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid #E3E6EA' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Icon name="type_transfer" width="24" height="24" bgColor={"#0051FF"} />
                            <Typography variant="h6" sx={{ fontSize: '14px', fontWeight: 600, color: '#222E37' }}>{t('transferType')}</Typography>
                          </Box>
                          <Button buttonVariant="tertiary" sx={{ textTransform: 'uppercase', padding: '4px 8px', fontSize: '12px', fontWeight: 600, color: '#0051FF' }} onClick={() => setCurrentStep(0)}>
                            {t('edit') || 'EDIT'}
                          </Button>
                        </Box>
                        <Box sx={{ padding: '16px', backgroundColor: '#FFFFFF' }}>
                          <Box>
                            <Typography sx={{ fontSize: '11px', color: '#999', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>{t('transferType')}</Typography>
                            <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#222E37' }}>{transferDetails?.transferType || '-'}</Typography>
                          </Box>
                        </Box>
                      </Box>

                      {/* Instructions as Accordions */}
                      <Box sx={{ marginTop: 0 }}>
                        {instructions.map((instruction, index) => (
                          <Box key={instruction.instructionId} sx={{ marginBottom: '16px' }}>
                            <Accordion
                              expanded={expandedInstruction === instruction.instructionId}
                              onChange={() => setExpandedInstruction(expandedInstruction === instruction.instructionId ? false : instruction.instructionId)}
                              className={styles.accordion}
                            >
                            <AccordionSummary 
                              expandIcon={<Icon name="chevronDown" width="20" height="20" />}
                              className={styles.accordionSummary}
                            >
                              <Box className={styles.accordionSummaryLeft}>
                                <Icon name="instructions" width="24" height="24" bgColor={"#0051FF"} />
                                <Box className={styles.accordionSummaryContent}>
                                  <Typography className={styles.accountName}>Instruction {index + 1}</Typography>
                                </Box>
                              </Box>
                              <Box className={styles.accordionSummaryRight}>
                                <Typography 
                                  onClick={(e) => {e.stopPropagation(); setCurrentStep(1);}}
                                  sx={{ cursor: 'pointer', color: '#0051FF', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', textDecoration: 'none', '&:hover': { textDecoration: 'underline' }, mr: 2 }}
                                >
                                  EDIT
                                </Typography>
                                <Typography 
                                  onClick={(e) => {e.stopPropagation(); setInstructions((prev) => prev.filter((i) => i.instructionId !== instruction.instructionId));}}
                                  sx={{ cursor: 'pointer', color: '#0051FF', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                                >
                                  DELETE
                                </Typography>
                              </Box>
                            </AccordionSummary>
                            <AccordionDetails className={styles.accordionDetails}>
                              {instruction.transferMode === 0 ? (
                                <>
                                  {/* Mode 0: Single to Multiple */}
                                  {/* Transfer From */}
                                  <Box sx={{ marginBottom: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 1 }}>
                                      <Icon name="transfer_from" width="20" height="20" bgColor={"#0051FF"} />
                                      <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Transfer From</Typography>
                                    </Box>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, paddingLeft: 2 }}>
                                      <Box>
                                        <Typography sx={{ fontSize: '11px', color: '#999', marginBottom: '2px', textTransform: 'uppercase' }}>Account name</Typography>
                                        <Typography sx={{ fontSize: '13px', fontWeight: 500, color: '#222E37' }}>{instruction.sourceAccountName || '-'}</Typography>
                                      </Box>
                                      <Box>
                                        <Typography sx={{ fontSize: '11px', color: '#999', marginBottom: '2px', textTransform: 'uppercase' }}>Account number</Typography>
                                        <Typography sx={{ fontSize: '13px', fontWeight: 500, color: '#222E37' }}>{instruction.sourceAccountNumber || '-'}</Typography>
                                      </Box>
                                      <Box>
                                        <Typography sx={{ fontSize: '11px', color: '#999', marginBottom: '2px', textTransform: 'uppercase' }}>Transfer currency</Typography>
                                        <Typography sx={{ fontSize: '13px', fontWeight: 500, color: '#222E37' }}>{instruction.transferCurrency || '-'}</Typography>
                                      </Box>
                                      <Box>
                                        <Typography sx={{ fontSize: '11px', color: '#999', marginBottom: '2px', textTransform: 'uppercase' }}>Debit currency</Typography>
                                        <Typography sx={{ fontSize: '13px', fontWeight: 500, color: '#222E37' }}>{instruction.debitCurrency || '-'}</Typography>
                                      </Box>
                                      <Box>
                                        <Typography sx={{ fontSize: '11px', color: '#999', marginBottom: '2px', textTransform: 'uppercase' }}>Debit reference</Typography>
                                        <Typography sx={{ fontSize: '13px', fontWeight: 500, color: '#222E37' }}>{instruction.debitReference || '-'}</Typography>
                                      </Box>
                                    </Box>
                                  </Box>

                                  {/* Transfer To - Batch List Section */}
                                  <Box sx={{ marginBottom: 2, border: '1px solid #CED3D9', borderRadius: '12px', overflow: 'hidden' }}>
                                    {/* Transfer To Header */}
                                    <Box sx={{ padding: '12px', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E3E6EA' }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <Icon name="transfer_to" width="20" height="20" bgColor={"#0051FF"} />
                                        <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#222E37', textTransform: 'uppercase' }}>
                                          Transfer To ({instruction.batchItems?.length || 0} items)
                                        </Typography>
                                      </Box>
                                    </Box>

                                {/* Batch Header with Payment ID, Search and Filter */}
                                <Box sx={{ padding: '12px', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E3E6EA' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '24px', width: '100%' }}>
                                    {/* Payment ID Section */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, width: '50%' }}>
                                      <Icon name="accounts" width="24" height="24" bgColor={"#0051FF"} />
                                      <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#222E37' }}>{instructionPaymentId[instruction.instructionId] || '[Auto generated (editable) payment ID]'}</Typography>
                                      <Box 
                                        onClick={() => setInstructionPaymentId({ ...instructionPaymentId, [instruction.instructionId]: '' })} 
                                        sx={{ 
                                          cursor: 'pointer', 
                                          display: 'flex', 
                                          alignItems: 'center', 
                                          justifyContent: 'center', 
                                          padding: '4px',
                                          borderRadius: '6px', 
                                          transition: 'background-color 0.2s ease',
                                          '&:hover': { backgroundColor: 'rgba(0, 81, 255, 0.08)' }
                                        }}
                                      >
                                        <Icon name="edit" width="18" height="18" bgColor={"#0051FF"} />
                                      </Box>
                                    </Box>

                                    {/* Search and Filter Section */}
                                    <Box sx={{ display: 'flex', gap: '12px', flex: 1, alignItems: 'center' }}>
                                      <TextField
                                        fullWidth
                                        placeholder={t('searchWithinBatch')}
                                        size="small"
                                        value={instructionBatchSearch[instruction.instructionId] || ''}
                                        onChange={(e) => setInstructionBatchSearch({ ...instructionBatchSearch, [instruction.instructionId]: e.target.value })}
                                        InputProps={{
                                          startAdornment: (
                                            <InputAdornment position="start">
                                              <Icon name="search" width="18" height="18" bgColor={"#0051FF"} />
                                            </InputAdornment>
                                          )
                                        }}
                                        sx={{ flex: 1 }}
                                      />
                                      <Button buttonVariant="tertiary" startIcon={<Icon name="filter" width="18" height="18" bgColor={"#0051FF"} />}>
                                        {t('filter')}
                                      </Button>
                                    </Box>
                                  </Box>
                                </Box>

                                {/* Batch Items Container */}
                                <Box sx={{ backgroundColor: '#F8F8FA', padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                  {(() => {
                                    const search = instructionBatchSearch[instruction.instructionId] || '';
                                    const page = instructionBatchPage[instruction.instructionId] || 1;
                                    const rowsPerPage = instructionBatchRowsPerPage[instruction.instructionId] || 15;
                                    
                                    const filteredItems = instruction.batchItems.filter((item: any) =>
                                      item.accountName.toLowerCase().includes(search.toLowerCase()) ||
                                      item.accountNumber.includes(search) ||
                                      item.creditReference?.toLowerCase().includes(search.toLowerCase())
                                    );
                                    
                                    const startIndex = (page - 1) * rowsPerPage;
                                    const paginatedItems = filteredItems.slice(startIndex, startIndex + rowsPerPage);

                                    return paginatedItems.length > 0 ? (
                                      <>
                                        {paginatedItems.map((item: any, itemIndex: number) => {
                                          const itemKey = `${instruction.instructionId}-${item.id}`;
                                          const expandedSet = instructionBatchExpandedItems[instruction.instructionId] || new Set();
                                          const isExpanded = expandedSet.has(itemKey);
                                          
                                          return (
                                          <Accordion 
                                            key={item.id}
                                            expanded={isExpanded}
                                            onChange={() => {
                                              const newSet = new Set(expandedSet);
                                              if (newSet.has(itemKey)) {
                                                newSet.delete(itemKey);
                                              } else {
                                                newSet.add(itemKey);
                                              }
                                              setInstructionBatchExpandedItems({
                                                ...instructionBatchExpandedItems,
                                                [instruction.instructionId]: newSet
                                              });
                                            }}
                                            className={styles.accordion}
                                          >
                                            <AccordionSummary 
                                              expandIcon={<Icon name="arrow" width="20" height="20" bgColor={"#0051FF"} />} 
                                              className={styles.accordionSummary}
                                            >
                                              <Box className={styles.accordionSummaryLeft}>
                                                <Icon name="user" width="24" height="24" bgColor={"#0051FF"} />
                                                <Box className={styles.accordionSummaryContent}>
                                                  <Typography className={styles.accountName}>{startIndex + itemIndex + 1}. {item.accountName}</Typography>
                                                </Box>
                                              </Box>
                                              <Box className={styles.accordionSummaryRight}>
                                                <Box className={styles.accountNumberLabel}>
                                                  <Typography className={styles.label}>{t('accNumber')}</Typography>
                                                  <Typography className={styles.value}>{item.accountNumber}</Typography>
                                                </Box>
                                                <Box className={styles.transferAmountSection}>
                                                  <Typography className={styles.label}>{t('transferAmount')}</Typography>
                                                  <Typography className={styles.value}>{item.currency} {item.transferAmount}</Typography>
                                                </Box>
                                              </Box>
                                            </AccordionSummary>
                                            <AccordionDetails className={styles.accordionDetails}>
                                              <Box className={styles.detailsGrid}>
                                                <Box className={styles.detailsField}>
                                                  <Typography className={styles.fieldLabel}>{t('branchSortCode')}</Typography>
                                                  <Box className={styles.fieldValuePlain}><Typography>{item.sortCode || '-'}</Typography></Box>
                                                </Box>
                                                <Box className={styles.detailsField}>
                                                  <Typography className={styles.fieldLabel}>{t('bicSwift')}</Typography>
                                                  <Box className={styles.fieldValuePlain}><Typography>{item.bic || '-'}</Typography></Box>
                                                </Box>
                                                <Box className={styles.detailsField}>
                                                  <Typography className={styles.fieldLabel}>{t('creditAmount')}</Typography>
                                                  <Box className={`${styles.fieldValue} ${styles.creditAmountField}`}><Typography>R {item.transferAmount}</Typography></Box>
                                                </Box>
                                                <Box className={styles.detailsField}>
                                                  <Typography className={styles.fieldLabel}>{t('creditReference')}</Typography>
                                                  <Box className={styles.fieldValue}><Typography>{item.creditReference || '-'}</Typography></Box>
                                                </Box>
                                              </Box>
                                            </AccordionDetails>
                                          </Accordion>
                                          );
                                        })}
                                      </>
                                    ) : (
                                      <Typography sx={{ fontSize: '13px', color: '#999', textAlign: 'center', py: 3 }}>
                                        No batch items found
                                      </Typography>
                                    );
                                  })()}
                                </Box>

                                {/* Batch Footer with Pagination */}
                                <Box sx={{ padding: '12px 16px', backgroundColor: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', borderTop: '1px solid #E3E6EA' }}>
                                  <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#222E37'}}>
                                    Total: R {instruction.batchItems?.reduce((sum: number, item: any) => sum + parseFloat(item.transferAmount || 0), 0).toFixed(2) || '0.00'}
                                  </Typography>
                                  {(() => {
                                    const search = instructionBatchSearch[instruction.instructionId] || '';
                                    const filteredItems = instruction.batchItems.filter((item: any) =>
                                      item.accountName.toLowerCase().includes(search.toLowerCase()) ||
                                      item.accountNumber.includes(search) ||
                                      item.creditReference?.toLowerCase().includes(search.toLowerCase())
                                    );
                                    
                                    return filteredItems.length > 0 ? (
                                      <CustomPagination
                                        rows={filteredItems}
                                        page={instructionBatchPage[instruction.instructionId] || 1}
                                        rowsPerPage={instructionBatchRowsPerPage[instruction.instructionId] || 15}
                                        onPageChange={(_: ChangeEvent<unknown>, newPage: number) => {
                                          setInstructionBatchPage({ ...instructionBatchPage, [instruction.instructionId]: newPage });
                                        }}
                                        onRowsPerPageChange={(newRowsPerPage: number) => {
                                          setInstructionBatchRowsPerPage({ ...instructionBatchRowsPerPage, [instruction.instructionId]: newRowsPerPage as 15 | 30 | 50 });
                                          setInstructionBatchPage({ ...instructionBatchPage, [instruction.instructionId]: 1 });
                                        }}
                                      />
                                    ) : null;
                                  })()}
                                </Box>
                              </Box>
                                </>
                              ) : (
                                <>
                                  {/* Mode 1: Multiple to Single */}
                                  {/* Transfer From - Batch List Section */}
                                  <Box sx={{ marginBottom: 2, border: '1px solid #CED3D9', borderRadius: '12px', overflow: 'hidden' }}>
                                    {/* Transfer From Header */}
                                    <Box sx={{ padding: '12px', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E3E6EA' }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <Icon name="transfer_from" width="20" height="20" bgColor={"#0051FF"} />
                                        <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#222E37', textTransform: 'uppercase' }}>
                                          Transfer From ({instruction.batchItems?.length || 0} items)
                                        </Typography>
                                      </Box>
                                    </Box>

                                    {/* Batch Header with Payment ID, Search and Filter */}
                                    <Box sx={{ padding: '12px', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E3E6EA' }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '24px', width: '100%' }}>
                                        {/* Payment ID Section */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, width: '50%' }}>
                                          <Icon name="accounts" width="24" height="24" bgColor={"#0051FF"} />
                                          <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#222E37' }}>{instructionPaymentId[instruction.instructionId] || '[Auto generated (editable) payment ID]'}</Typography>
                                          <Box 
                                            onClick={() => setInstructionPaymentId({ ...instructionPaymentId, [instruction.instructionId]: '' })} 
                                            sx={{ 
                                              cursor: 'pointer', 
                                              display: 'flex', 
                                              alignItems: 'center', 
                                              justifyContent: 'center', 
                                              padding: '4px',
                                              borderRadius: '6px', 
                                              transition: 'background-color 0.2s ease',
                                              '&:hover': { backgroundColor: 'rgba(0, 81, 255, 0.08)' }
                                            }}
                                          >
                                            <Icon name="edit" width="18" height="18" bgColor={"#0051FF"} />
                                          </Box>
                                        </Box>

                                        {/* Search and Filter Section */}
                                        <Box sx={{ display: 'flex', gap: '12px', flex: 1, alignItems: 'center' }}>
                                          <TextField
                                            fullWidth
                                            placeholder={t('searchWithinBatch')}
                                            size="small"
                                            value={instructionBatchSearch[instruction.instructionId] || ''}
                                            onChange={(e) => setInstructionBatchSearch({ ...instructionBatchSearch, [instruction.instructionId]: e.target.value })}
                                            InputProps={{
                                              startAdornment: (
                                                <InputAdornment position="start">
                                                  <Icon name="search" width="18" height="18" bgColor={"#0051FF"} />
                                                </InputAdornment>
                                              )
                                            }}
                                            sx={{ flex: 1 }}
                                          />
                                          <Button buttonVariant="tertiary" startIcon={<Icon name="filter" width="18" height="18" bgColor={"#0051FF"} />}>
                                            {t('filter')}
                                          </Button>
                                        </Box>
                                      </Box>
                                    </Box>

                                    {/* Batch Items Container */}
                                    <Box sx={{ backgroundColor: '#F8F8FA', padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                      {(() => {
                                        const search = instructionBatchSearch[instruction.instructionId] || '';
                                        const page = instructionBatchPage[instruction.instructionId] || 1;
                                        const rowsPerPage = instructionBatchRowsPerPage[instruction.instructionId] || 15;
                                        
                                        const filteredItems = instruction.batchItems.filter((item: any) =>
                                          item.accountName.toLowerCase().includes(search.toLowerCase()) ||
                                          item.accountNumber.includes(search) ||
                                          item.creditReference?.toLowerCase().includes(search.toLowerCase())
                                        );
                                        
                                        const startIndex = (page - 1) * rowsPerPage;
                                        const paginatedItems = filteredItems.slice(startIndex, startIndex + rowsPerPage);

                                        return paginatedItems.length > 0 ? (
                                          <>
                                            {paginatedItems.map((item: any, itemIndex: number) => {
                                              const itemKey = `${instruction.instructionId}-${item.id}`;
                                              const expandedSet = instructionBatchExpandedItems[instruction.instructionId] || new Set();
                                              const isExpanded = expandedSet.has(itemKey);
                                              
                                              return (
                                              <Accordion 
                                                key={item.id}
                                                expanded={isExpanded}
                                                onChange={() => {
                                                  const newSet = new Set(expandedSet);
                                                  if (newSet.has(itemKey)) {
                                                    newSet.delete(itemKey);
                                                  } else {
                                                    newSet.add(itemKey);
                                                  }
                                                  setInstructionBatchExpandedItems({
                                                    ...instructionBatchExpandedItems,
                                                    [instruction.instructionId]: newSet
                                                  });
                                                }}
                                                className={styles.accordion}
                                              >
                                                <AccordionSummary 
                                                  expandIcon={<Icon name="arrow" width="20" height="20" bgColor={"#0051FF"} />} 
                                                  className={styles.accordionSummary}
                                                >
                                                  <Box className={styles.accordionSummaryLeft}>
                                                    <Icon name="user" width="24" height="24" bgColor={"#0051FF"} />
                                                    <Box className={styles.accordionSummaryContent}>
                                                      <Typography className={styles.accountName}>{startIndex + itemIndex + 1}. {item.accountName}</Typography>
                                                    </Box>
                                                  </Box>
                                                  <Box className={styles.accordionSummaryRight}>
                                                    <Box className={styles.accountNumberLabel}>
                                                      <Typography className={styles.label}>{t('accNumber')}</Typography>
                                                      <Typography className={styles.value}>{item.accountNumber}</Typography>
                                                    </Box>
                                                    <Box className={styles.transferAmountSection}>
                                                      <Typography className={styles.label}>{t('transferAmount')}</Typography>
                                                      <Typography className={styles.value}>{item.currency} {item.transferAmount}</Typography>
                                                    </Box>
                                                  </Box>
                                                </AccordionSummary>
                                                <AccordionDetails className={styles.accordionDetails}>
                                                  <Box className={styles.detailsGrid}>
                                                    <Box className={styles.detailsField}>
                                                      <Typography className={styles.fieldLabel}>{t('branchSortCode')}</Typography>
                                                      <Box className={styles.fieldValuePlain}><Typography>{item.sortCode || '-'}</Typography></Box>
                                                    </Box>
                                                    <Box className={styles.detailsField}>
                                                      <Typography className={styles.fieldLabel}>{t('bicSwift')}</Typography>
                                                      <Box className={styles.fieldValuePlain}><Typography>{item.bic || '-'}</Typography></Box>
                                                    </Box>
                                                    <Box className={styles.detailsField}>
                                                      <Typography className={styles.fieldLabel}>{t('debitAmount')}</Typography>
                                                      <Box className={`${styles.fieldValue} ${styles.creditAmountField}`}><Typography>R {item.transferAmount}</Typography></Box>
                                                    </Box>
                                                    <Box className={styles.detailsField}>
                                                      <Typography className={styles.fieldLabel}>{t('creditReference')}</Typography>
                                                      <Box className={styles.fieldValue}><Typography>{item.creditReference || '-'}</Typography></Box>
                                                    </Box>
                                                  </Box>
                                                </AccordionDetails>
                                              </Accordion>
                                              );
                                            })}
                                          </>
                                        ) : (
                                          <Typography sx={{ fontSize: '13px', color: '#999', textAlign: 'center', py: 3 }}>
                                            No batch items found
                                          </Typography>
                                        );
                                      })()}
                                    </Box>

                                    {/* Batch Footer with Pagination */}
                                    <Box sx={{ padding: '12px 16px', backgroundColor: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', borderTop: '1px solid #E3E6EA' }}>
                                      <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#222E37'}}>
                                        Total: R {instruction.batchItems?.reduce((sum: number, item: any) => sum + parseFloat(item.transferAmount || 0), 0).toFixed(2) || '0.00'}
                                      </Typography>
                                      {(() => {
                                        const search = instructionBatchSearch[instruction.instructionId] || '';
                                        const filteredItems = instruction.batchItems.filter((item: any) =>
                                          item.accountName.toLowerCase().includes(search.toLowerCase()) ||
                                          item.accountNumber.includes(search) ||
                                          item.creditReference?.toLowerCase().includes(search.toLowerCase())
                                        );
                                        
                                        return filteredItems.length > 0 ? (
                                          <CustomPagination
                                            rows={filteredItems}
                                            page={instructionBatchPage[instruction.instructionId] || 1}
                                            rowsPerPage={instructionBatchRowsPerPage[instruction.instructionId] || 15}
                                            onPageChange={(_: ChangeEvent<unknown>, newPage: number) => {
                                              setInstructionBatchPage({ ...instructionBatchPage, [instruction.instructionId]: newPage });
                                            }}
                                            onRowsPerPageChange={(newRowsPerPage: number) => {
                                              setInstructionBatchRowsPerPage({ ...instructionBatchRowsPerPage, [instruction.instructionId]: newRowsPerPage as 15 | 30 | 50 });
                                              setInstructionBatchPage({ ...instructionBatchPage, [instruction.instructionId]: 1 });
                                            }}
                                          />
                                        ) : null;
                                      })()}
                                    </Box>
                                  </Box>

                                  {/* Transfer To */}
                                  <Box sx={{ marginBottom: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 1 }}>
                                      <Icon name="transfer_to" width="20" height="20" bgColor={"#0051FF"} />
                                      <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Transfer To</Typography>
                                    </Box>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, paddingLeft: 2 }}>
                                      <Box>
                                        <Typography sx={{ fontSize: '11px', color: '#999', marginBottom: '2px', textTransform: 'uppercase' }}>Account name</Typography>
                                        <Typography sx={{ fontSize: '13px', fontWeight: 500, color: '#222E37' }}>{instruction.destinationAccountName || '-'}</Typography>
                                      </Box>
                                      <Box>
                                        <Typography sx={{ fontSize: '11px', color: '#999', marginBottom: '2px', textTransform: 'uppercase' }}>Account number</Typography>
                                        <Typography sx={{ fontSize: '13px', fontWeight: 500, color: '#222E37' }}>{instruction.destinationAccountNumber || '-'}</Typography>
                                      </Box>
                                      <Box>
                                        <Typography sx={{ fontSize: '11px', color: '#999', marginBottom: '2px', textTransform: 'uppercase' }}>Transfer currency</Typography>
                                        <Typography sx={{ fontSize: '13px', fontWeight: 500, color: '#222E37' }}>{instruction.transferCurrency || '-'}</Typography>
                                      </Box>
                                      <Box>
                                        <Typography sx={{ fontSize: '11px', color: '#999', marginBottom: '2px', textTransform: 'uppercase' }}>Credit reference</Typography>
                                        <Typography sx={{ fontSize: '13px', fontWeight: 500, color: '#222E37' }}>{instruction.creditReference || '-'}</Typography>
                                      </Box>
                                    </Box>
                                  </Box>
                                </>
                              )}

                              {/* Payment Schedule */}
                              <Box sx={{ paddingLeft: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 1 }}>
                                  <Icon name="payment_schedule" width="20" height="20" bgColor={"#0051FF"} />
                                  <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Payment Schedule</Typography>
                                </Box>
                                <Box sx={{ paddingLeft: 2 }}>
                                  <Box sx={{ marginBottom: 2 }}>
                                    <Typography sx={{ fontSize: '11px', color: '#999', marginBottom: '2px', textTransform: 'uppercase' }}>Single / first payment date</Typography>
                                    <Typography sx={{ fontSize: '13px', fontWeight: 500, color: '#222E37' }}>{instruction.paymentDate ? (typeof instruction.paymentDate === 'string' ? instruction.paymentDate : instruction.paymentDate.format?.('DD/MM/YYYY')) : '-'}</Typography>
                                  </Box>
                                  <Box>
                                    <Typography sx={{ fontSize: '11px', color: '#999', marginBottom: '2px', textTransform: 'uppercase' }}>Repeat pattern (optional)</Typography>
                                    <Typography sx={{ fontSize: '13px', fontWeight: 500, color: '#222E37' }}>None</Typography>
                                  </Box>
                                </Box>
                              </Box>
                            </AccordionDetails>
                          </Accordion>
                        </Box>
                      ))}
                      </Box>

                      {/* Action Buttons */}
                      <Box sx={{ marginTop: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Button buttonVariant="tertiary" onClick={handleCancelClick} startIcon={<Icon name="cancel" width="20" height="20" bgColor={"#0051FF"} />}>
                          {t('cancel') || 'CANCEL'}
                        </Button>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Button buttonVariant="secondary" onClick={() => console.log('Save to drafts')} startIcon={<Icon name="save" width="18" height="18" bgColor={"#0051FF"} />}>
                            {t('saveToDrafts') || 'SAVE TO DRAFTS'}
                          </Button>
                          <Button buttonVariant="primary" onClick={handleSubmitTransfer} endIcon={<Icon name="arrowRight" width="20" height="20" bgColor="rgb(255, 255, 255)" />}>
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