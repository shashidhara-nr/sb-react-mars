'use client';

import React, { useState, useCallback, useMemo, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { useTranslations } from 'next-intl';

import { Grid, TextField, Select, MenuItem, FormControl, InputLabel, FormHelperText, TextareaAutosize, Box, Snackbar, Alert, Tab, Tabs, Accordion, AccordionSummary, AccordionDetails, Pagination, Paper } from '@mui/material';
import { Breadcrumb, Button, Heading } from 'dist/standard-bank-react';
import { Icon } from '@atoms/index';
import styles from '@organisms/AccountVerificationRequest/BillingAccounts.module.scss';
import { buildTestId } from 'src/utils/testIds';
import { CheckCircleIcon } from 'lib/icons';
import Image from 'next/image';
import { updateVerificationRequest } from '@store/slices/createAccountVerificationRequestSlice';
import { RootState } from '@store/index';
import theme from 'components/lib/styles/theme';

import {
  VERIFICATION_REQUEST_FORM_FIELDS,
  COUNTRY_LIST,
} from '@organisms/AccountVerificationRequest/constant';
import {
  getRulesForField,
  VerificationRequestFormValues,
  VERIFICATION_REQUIRED_FIELDS,
} from 'src/utils/verificationCreateLogic';

export default function VerificationRequestBatchPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const t = useTranslations('accountVerificationRequest');
  const testIdPrefix = 'verification-request-batch';
  const [selectedTab, setSelectedTab] = useState(0);

  const verificationRequest = useSelector(
    (state: RootState) => state.createAccountVerificationRequest.verificationRequest
  );

  const { control, handleSubmit, formState: { errors }, watch, trigger, reset } = useForm<VerificationRequestFormValues>({
    defaultValues: {
      lastName: verificationRequest?.lastName || '',
      idNumber: verificationRequest?.idNumber || '',
      emailAddress: verificationRequest?.emailAddress || '',
      telephoneNumber: verificationRequest?.telephoneNumber || '',
      country: verificationRequest?.country || 'ZA',
      accountNumber: verificationRequest?.accountNumber || '',
      branchSortCode: verificationRequest?.branchSortCode || '',
      bicSwift: verificationRequest?.bicSwift || '',
      description: verificationRequest?.description || '',
    },
  });


  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);
  const [batchValidationError, setBatchValidationError] = useState(false);

  // Batch items state
  const [batchItems, setBatchItems] = useState<any[]>([]);
  const [searchBatch, setSearchBatch] = useState('');
  const [expandedBatchItem, setExpandedBatchItem] = useState<number | false>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<10 | 20 | 50>(10);

  // Memoize tab labels
  const tabLabels = useMemo(() => [
    'Manual entry',
    'Import file',
  ], []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };



  const onValid = (data: VerificationRequestFormValues) => {
    // Check if batch items exist
    if (batchItems.length === 0) {
      setBatchValidationError(true);
      return;
    }

    setBatchValidationError(false);

    try {
      // Save batch items to redux/store
      dispatch(updateVerificationRequest({ field: 'batchItems', value: batchItems }));
      setSuccessSnackbarOpen(true);
      setTimeout(() => {
        router.push('/account-verification-request/create/success' as any);
      }, 1500);
    } catch (error) {
      console.error('Error saving verification request:', error);
    }
  };

  const onInvalid = () => {
    // Validation errors are displayed on individual fields
  };

  const handleCancel = () => {
    router.back();
  };

  const handleNext = useCallback(() => {
    // Check if batch items exist
    if (batchItems.length === 0) {
      setBatchValidationError(true);
      return;
    }

    setBatchValidationError(false);

    try {
      // Save batch items to redux/store
      dispatch(updateVerificationRequest({ field: 'batchItems', value: batchItems }));
      setSuccessSnackbarOpen(true);
      setTimeout(() => {
        router.push('/account-verification-request/create/success' as any);
      }, 1500);
    } catch (error) {
      console.error('Error proceeding to success page:', error);
    }
  }, [batchItems, dispatch, router]);

  const handleSaveDrafts = async () => {
    const formData = watch();
    try {
      dispatch(updateVerificationRequest({ field: 'formData', value: formData }));
      dispatch(updateVerificationRequest({ field: 'status', value: 'draft' }));
    } catch (error) {
      console.error('Error saving to drafts:', error);
    }
  };

  // Batch handling functions
  const handleAddToBatch = useCallback(() => {
    const formData = watch();
    
    // Validate that required fields are filled
    if (!formData.lastName || !formData.emailAddress || !formData.telephoneNumber || !formData.accountNumber) {
      return;
    }

    try {
      const nextId = batchItems.length + 1;
      const newBatchItem = {
        id: nextId,
        lastName: formData.lastName,
        idNumber: formData.idNumber,
        emailAddress: formData.emailAddress,
        telephoneNumber: formData.telephoneNumber,
        country: formData.country,
        accountNumber: formData.accountNumber,
        branchSortCode: formData.branchSortCode,
        bicSwift: formData.bicSwift,
        description: formData.description,
      };

      setBatchItems((prev) => [...prev, newBatchItem]);
      setBatchValidationError(false);

      // Reset form fields except country
      reset({
        lastName: '',
        idNumber: '',
        emailAddress: '',
        telephoneNumber: '',
        country: 'ZA',
        accountNumber: '',
        branchSortCode: '',
        bicSwift: '',
        description: '',
      });
    } catch (error) {
      console.error('Error adding batch item:', error);
    }
  }, [watch, batchItems, reset]);

  const handleClearBatch = useCallback(() => {
    setBatchItems([]);
    setCurrentPage(1);
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
        item.lastName.toLowerCase().includes(searchBatch.toLowerCase()) ||
        item.emailAddress.toLowerCase().includes(searchBatch.toLowerCase()) ||
        item.accountNumber.includes(searchBatch)
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
    setRowsPerPage(newRowsPerPage as 10 | 20 | 50);
    setCurrentPage(1);
  };

  return (
    <>
      <Grid container spacing={4} padding={2} data-testid={buildTestId(testIdPrefix, 'page')}>
        <Grid size={12}>
          <Breadcrumb
            links={[
              { href: '/', label: t('dashboard') },
              {
                href: '/account-verification-request',
                label: t('accountVerificationRequest'),
              },
              {
                href: '/account-verification-request/create',
                label: t('verificationRequestServiceType'),
              },
              {
                href: '/account-verification-request/create/batch',
                label: t('batchVerificationRequest'),
              },
            ]}
          />
        </Grid>

        <Grid size={12}>
          <Heading as="h4" fontSize="28px" data-testid={buildTestId(testIdPrefix, 'heading')}>
            {t('batchDelayedResponseDescription')}
          </Heading>
        </Grid>

        {/* Tabs Section */}
       
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            aria-label="batch-entry-tabs"
            sx={{
              '& .MuiTabs-indicator': {
                display: 'none',
              },
              '& .MuiTabs-scroller .MuiTabs-flexContainer': {
                border: '1px solid #e0e0e0',
                borderRadius: '16px',
              },
            }}
          >
            {tabLabels.map((label, index) => {
              const tabKey = `batch-entry-tab-${index}`;
              return (
                <Tab 
                  key={tabKey} 
                  label={label} 
                  value={index}
                  sx={{
                    borderRight: '1px solid #e0e0e0',
                    color: '#666666',
                    backgroundColor: '#ffffff',
                    textTransform: 'none',
                    fontSize: '14px',
                    fontWeight: 500,
                    flex: 1,
                    whiteSpace: 'nowrap',
                    padding: '18px 24px 16px',
                    '&:last-of-type': {
                      borderRight: 'none',
                      borderRadius: '0 16px 16px 0',
                    },
                    '&:first-of-type': {
                      borderRadius: '16px 0 0 16px',
                    },
                    '&.Mui-selected': {
                      backgroundColor: '#0051FF',
                      color: '#ffffff',
                    },
                  }}
                />
              );
            })}
          </Tabs>
       

        {/* Manual Entry Tab Content */}
        {selectedTab === 0 && (
          <Grid size={12}>
            <form
              id="verification-form"
              onSubmit={handleSubmit(onValid, onInvalid)}
              className={styles.container}
              data-testid={buildTestId(testIdPrefix, 'form')}
            >
              <Box
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '24px',
                  backgroundColor: '#ffffff',
                }}
              >
                <Grid container spacing={3}>
                  {VERIFICATION_REQUEST_FORM_FIELDS.map((field) => {
                    const fieldName = field.name as keyof VerificationRequestFormValues;
                    const fieldError = errors[fieldName];
                    const fieldNameStr = String(field.name);

                    // Handle spacer fields
                    if ((field as any).spacer) {
                      return (
                        <Grid key={field.name} size={field.gridSize || 12} />
                      );
                    }

                    const translatedLabel = t(field.label as any);

                    return (
                      <Grid key={field.name} size={field.gridSize || 12}>
                      {field.type === 'select' ? (
                        <Controller
                          name={fieldNameStr as any}
                          control={control}
                          rules={getRulesForField(fieldNameStr)}
                          render={({ field: fieldProps }) => (
                            <FormControl fullWidth error={!!fieldError}>
                              <InputLabel>{translatedLabel}</InputLabel>
                              <Select
                                {...fieldProps}
                                label={translatedLabel}
                                data-testid={buildTestId(testIdPrefix, field.name)}
                              >
                                {field.options?.map((option: any) => (
                                  <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                  </MenuItem>
                                ))}
                              </Select>
                              {fieldError && (
                                <FormHelperText>
                                  {typeof fieldError.message === 'string' ? fieldError.message : ''}
                                </FormHelperText>
                              )}
                            </FormControl>
                          )}
                        />
                      ) : field.type === 'textarea' ? (
                        <Controller
                          name={fieldNameStr as any}
                          control={control}
                          rules={getRulesForField(fieldNameStr)}
                          render={({ field: fieldProps }) => (
                            <>
                              <TextareaAutosize
                                {...fieldProps}
                                minRows={field.rows || 4}
                                placeholder={field.placeholder}
                                style={{
                                  width: '100%',
                                  padding: '12px',
                                  borderRadius: '8px',
                                  border: `1px solid ${fieldError ? '#d32f2f' : '#ccc'}`,
                                  fontFamily: 'inherit',
                                  fontSize: '14px',
                                }}
                                data-testid={buildTestId(testIdPrefix, field.name)}
                              />
                              {fieldError && (
                                <FormHelperText error>
                                  {typeof fieldError.message === 'string' ? fieldError.message : ''}
                                </FormHelperText>
                              )}
                            </>
                          )}
                        />
                      ) : (
                        <Controller
                          name={fieldNameStr as any}
                          control={control}
                          rules={getRulesForField(fieldNameStr)}
                          render={({ field: fieldProps }) => (
                            <TextField
                              {...fieldProps}
                              type={field.type}
                              label={translatedLabel}
                              placeholder={field.placeholder}
                              fullWidth
                              error={!!fieldError}
                              helperText={typeof fieldError?.message === 'string' ? fieldError.message : ''}
                              data-testid={buildTestId(testIdPrefix, field.name)}
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                            />
                          )}
                        />
                      )}
                    </Grid>
                    );
                  })}
                </Grid>
              </Box>

              {/* Batch buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, marginTop: '24px', marginBottom: '24px' }}>
                <Button 
                  buttonVariant="tertiary" 
                  startIcon={<Icon name="delete" width="20" height="20" bgColor={theme.palette.primary.main} />} 
                  onClick={handleClearBatch}
                >
                  {t('clearBatch')}
                </Button>
                <Button 
                  buttonVariant="secondary" 
                  startIcon={<Icon name="add" width="20" height="20" bgColor={theme.palette.primary.main} />} 
                  onClick={handleAddToBatch}
                >
                  Add to Verification Request Batch
                </Button>
              </Box>
            </form>

            {/* Batch Items Display - Always Visible */}
            <Box sx={{ marginTop: '32px' }}>
              <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '24px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Icon name="layers" width="24" height="24" />
                    <Heading as="h6" fontSize="18px">
                      Verification request batch
                    </Heading>
                  </Box>
                </Box>

                {batchItems.length > 0 ? (
                  <>
                    {/* Search */}
                    <Box sx={{ marginBottom: '24px' }}>
                      <TextField
                        placeholder="Search within batch"
                        value={searchBatch}
                        onChange={(e) => {
                          setSearchBatch(e.target.value);
                          setCurrentPage(1);
                        }}
                        fullWidth
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                      />
                    </Box>

                    {/* Batch Items Accordion */}
                    <Box sx={{ marginBottom: '24px' }}>
                      {paginatedBatchItems.map((item, index) => (
                        <Accordion
                          key={item.id}
                          expanded={expandedBatchItem === item.id}
                          onChange={handleExpandBatchItem(item.id)}
                          sx={{ marginBottom: '8px', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                        >
                          <AccordionSummary
                            sx={{ 
                              backgroundColor: '#f5f5f5',
                              '&:hover': {
                                backgroundColor: '#eeeeee'
                              }
                            }}
                          >
                            <Icon name="settings" width="20" height="20" />
                            <Box sx={{ marginLeft: '12px', display: 'flex', alignItems: 'center', flex: 1 }}>
                              <span style={{ fontWeight: 600 }}>{(currentPage - 1) * rowsPerPage + index + 1}. Request {item.id}</span>
                            </Box>
                            <Button
                              buttonVariant="tertiary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveBatchItem(item.id);
                              }}
                              startIcon={<Icon name="delete" width="16" height="16" bgColor={theme.palette.error.main} />}
                            >
                              DELETE
                            </Button>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Grid container spacing={2}>
                              <Grid size={6}>
                                <Box><strong>Last Name:</strong> {item.lastName}</Box>
                              </Grid>
                              <Grid size={6}>
                                <Box><strong>ID Number:</strong> {item.idNumber}</Box>
                              </Grid>
                              <Grid size={6}>
                                <Box><strong>Email:</strong> {item.emailAddress}</Box>
                              </Grid>
                              <Grid size={6}>
                                <Box><strong>Phone:</strong> {item.telephoneNumber}</Box>
                              </Grid>
                              <Grid size={6}>
                                <Box><strong>Country:</strong> {item.country}</Box>
                              </Grid>
                              <Grid size={6}>
                                <Box><strong>Account Number:</strong> {item.accountNumber}</Box>
                              </Grid>
                              <Grid size={6}>
                                <Box><strong>Branch/Sort Code:</strong> {item.branchSortCode}</Box>
                              </Grid>
                              <Grid size={6}>
                                <Box><strong>BIC/SWIFT:</strong> {item.bicSwift}</Box>
                              </Grid>
                              <Grid size={12}>
                                <Box><strong>Description:</strong> {item.description}</Box>
                              </Grid>
                            </Grid>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </Box>

                    {/* Pagination */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>Total: {batchItems.length}</Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box>Rows per page:</Box>
                        <select
                          value={rowsPerPage}
                          onChange={(e) => handleRowsPerPageChange(Number(e.target.value) as 10 | 20 | 50)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '4px',
                            border: '1px solid #e0e0e0',
                            fontSize: '14px',
                          }}
                        >
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                        </select>
                        <Pagination
                          count={Math.ceil(filteredBatchItems.length / rowsPerPage)}
                          page={currentPage}
                          onChange={handlePageChange}
                        />
                        <Box sx={{ fontSize: '14px', color: '#666' }}>
                          {(currentPage - 1) * rowsPerPage + 1} - {Math.min(currentPage * rowsPerPage, filteredBatchItems.length)} of {filteredBatchItems.length} items
                        </Box>
                      </Box>
                    </Box>
                  </>
                ) : (
                  <Box sx={{ textAlign: 'center', padding: '48px 24px', color: '#999' }}>
                    <Box sx={{ fontSize: '14px' }}>
                      No verification requests added to batch yet. Fill in the form above and click "Add to Verification Request Batch" to get started.
                    </Box>
                  </Box>
                )}
              </Paper>
            </Box>

            {/* Batch Validation Error */}
            {batchValidationError && (
              <Box sx={{ marginTop: '16px', padding: '12px 16px', backgroundColor: '#ffebee', border: '1px solid #ef5350', borderRadius: '4px', color: '#d32f2f' }}>
                <Box sx={{ fontSize: '14px', fontWeight: 500 }}>
                  Please add at least one verification request to the batch before proceeding.
                </Box>
              </Box>
            )}

            {/* Action Buttons - After Batch Section */}
            <Grid container spacing={2} sx={{ padding: '24px 0', marginTop: '8px' }}>
              <Grid size={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button onClick={handleCancel} buttonVariant="tertiary">
                  {t('cancel')}
                </Button>
                <Grid sx={{ display: 'flex', gap: 2 }}>
                  <Button onClick={handleSaveDrafts} buttonVariant="secondary">
                    {t('saveToDrafts')}
                  </Button>
                  <Button onClick={handleNext} buttonVariant="primary">
                    {t('next')}
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        )}

        {/* Import File Tab Content */}
        {selectedTab === 1 && (
          <Grid size={12}>
            <Box
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '48px 24px',
                backgroundColor: '#ffffff',
                textAlign: 'center',
              }}
            >
              <TextField
                type="file"
                fullWidth
                inputProps={{ accept: '.csv,.xlsx,.xls' }}
                sx={{ mb: 2 }}
              />
              <Heading as="h6" fontSize="16px">
                Import verification requests from file
              </Heading>
              <p style={{ color: '#666', fontSize: '14px' }}>
                Supported formats: CSV, XLSX, XLS
              </p>
            </Box>
          </Grid>
        )}
      </Grid>



      <Snackbar
        open={successSnackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSuccessSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ mt: 8 }}
      >
        <Alert
          icon={<Image src={CheckCircleIcon} alt="Success" width={20} height={20} />}
          severity="success"
          sx={{
            backgroundColor: '#e8f5e9',
            color: '#2e7d32',
            fontWeight: 500,
          }}
        >
          Verification request details saved successfully!
        </Alert>
      </Snackbar>
    </>
  );
}
