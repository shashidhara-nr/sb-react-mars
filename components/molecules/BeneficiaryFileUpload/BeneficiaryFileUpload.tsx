'use client';

import UserCard from '@atoms/UserCard/UserCard';
import Image from 'next/image';
import PaperStack from 'public/icons/icn_paper_stack.svg';
import IcnBin from 'public/icons/icn_bin.svg';
import FilterIcon from 'public/icons/col-icon-filter.svg';
import AvatarAlert from 'public/icons/avatar_alert.svg';
import { useState, ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CustomPagination from './CustomPagination';
import BeneficiaryRow from './BeneficiaryRow';
import { Beneficiary } from './types';
import { Button, MultipleSelectChip, Dialog } from 'dist/standard-bank-react';
import DeleteConfirmationDialog from 'components/common/DeleteConfirmationDialog';
import styles from './BeneficiaryFileUpload.module.scss';
import IcnCardQuestion from 'public/icons/icn_card_question.svg';
import { Box, CircularProgress } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@lib/hooks/useAppDispatch';
import { updateBeneficiary, fetchPaymentProfilesForFileUpload } from '@store/slices/createBeneficiarySlice';
import IcnCloseIcon from 'public/icons/close-icon.svg';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BeneficiaryFilter, { FilterValues } from './BeneficiaryFilter';
import { buildTestId } from 'src/utils/testIds';
import { post } from '@lib/api/httpClient';
import { API_ROUTES } from '@lib/utils/apiRoute';
import { extractErrorIssues, formatErrorMessages } from 'src/utils/errorMessageFormatter';

const displayValue = (value: any): string => {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  return String(value);
};

const convertRecordsToBeneficiaries = (apiResponse: any): Beneficiary[] => {
  if (!apiResponse) return [];

  const beneficiaries: Beneficiary[] = [];
  let id = 0;

  const mapAuthoriseStatusToBeneficiaryStatus = (authoriseStatus: any): 'verified' | 'partially-verified' | 'not-verified' | 'invalid' | 'duplicate' => {
    if (!authoriseStatus) return 'not-verified';
    
    const status = String(authoriseStatus).toLowerCase();
    if (status === 'active') return 'verified';
    if (status === 'inactive') return 'not-verified';
    if (status === 'pending') return 'partially-verified';
    return 'not-verified';
  };

  const processRecord = (record: any, recordType: 'valid' | 'invalid' | 'duplicate' | 'error' = 'valid') => {
    id++;
    const currency = displayValue(record.transactionLimitCurrency);
    const limit = displayValue(record.transactionLimit);
    const transactionLimitAndCurrency = currency === '-' || limit === '-' 
      ? '-' 
      : `${currency} ${limit}`;

    const status = mapAuthoriseStatusToBeneficiaryStatus(record.authoriseStatus);

    const declineReasonValue = displayValue(
      record.declineReason || record.issueLogTO?.issues?.[0]?.message
    );

    beneficiaries.push({
      id: String(id),
      name: displayValue(record.counterPartyName),
      status,
      accountNumber: displayValue(record.accountNumber),
      beneficiaryCode: displayValue(record.referenceIDX),
      bankName: displayValue(record.financialInstitutionName),
      cdiNumber: displayValue(record.cdiNumber),
      beneficiaryReference: displayValue(record.counterPartyReference),
      iban: displayValue(record.iban),
      transactionLimit: transactionLimitAndCurrency,
      recordType,
      declineReason: declineReasonValue,
    });
  };

  const newRecords = apiResponse.newRecords || [];
  newRecords.forEach((record: any) => processRecord(record, 'valid'));

  const existingRecords = apiResponse.existingRecords || [];
  existingRecords.forEach((record: any) => processRecord(record, 'valid'));

  const errorRecords = apiResponse.errorRecords || [];
  errorRecords.forEach((record: any) => processRecord(record, 'error'));

  const dupRecords = apiResponse.dupRecords || [];
  dupRecords.forEach((record: any) => processRecord(record, 'duplicate'));

  const inValidRecords = apiResponse.inValidRecords || [];
  inValidRecords.forEach((record: any) => processRecord(record, 'invalid'));

  const potentialDupRecords = apiResponse.potentialDupRecords || [];
  potentialDupRecords.forEach((record: any) => processRecord(record, 'duplicate'));

  return beneficiaries;
};

interface BeneficiaryFileUploadProps {
}

function BeneficiaryFileUpload() {
  const testIdPrefix = 'beneficiary-file-upload';
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<5 | 15 | 30 | 50 | 100>(15);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [filteredBeneficiaries, setFilteredBeneficiaries] = useState<Beneficiary[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterValues | null>(null);
  const [resetFiltersTrigger, setResetFiltersTrigger] = useState(0);
  const [recordPaymentTypes, setRecordPaymentTypes] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitErrorDialogOpen, setSubmitErrorDialogOpen] = useState(false);
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string>('');
  const beneficiary = useAppSelector((state) => state.createBeneficiary.beneficiary);
  const uploadedFileData = useAppSelector((state) => state.createBeneficiary.uploadedFileData);
  const paymentProfiles = useAppSelector((state) => state.createBeneficiary.paymentProfiles);
  const paymentTypes = useAppSelector((state) => state.createBeneficiary.paymentTypes);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (uploadedFileData) {
      const processedBeneficiaries = convertRecordsToBeneficiaries(uploadedFileData);
      setBeneficiaries(processedBeneficiaries);
      setFilteredBeneficiaries(processedBeneficiaries);
    }
  }, [uploadedFileData]);

  useEffect(() => {
    dispatch(fetchPaymentProfilesForFileUpload());
  }, [dispatch]);

  useEffect(() => {
    const validSelectedCount = selectedIds.filter((id) =>
      beneficiaries.find((b) => b.id === id && b.recordType === 'valid')
    ).length;

    if (validSelectedCount !== 1 && beneficiary.paymentType) {
      dispatch(updateBeneficiary({ field: 'paymentType', value: '' }));
    }
  }, [selectedIds, beneficiaries, beneficiary.paymentType, dispatch]);

  useEffect(() => {
    const validSelectedCount = selectedIds.filter((id) =>
      beneficiaries.find((b) => b.id === id && b.recordType === 'valid')
    ).length;

    if (validSelectedCount === 1 && uploadedFileData) {
      const selectedBeneficiary = beneficiaries.find((b) =>
        selectedIds.includes(b.id) && b.recordType === 'valid'
      );

      if (selectedBeneficiary) {
        const savedPaymentTypes = recordPaymentTypes[selectedBeneficiary.id];
        
        if (savedPaymentTypes) {
          dispatch(updateBeneficiary({ 
            field: 'paymentType', 
            value: savedPaymentTypes 
          }));
        } else {
          const allRecords = [
            ...(uploadedFileData.newRecords || []),
            ...(uploadedFileData.existingRecords || []),
          ];

          const originalRecord = allRecords.find(
            (record: any) =>
              (record.counterPartyName || '-') === selectedBeneficiary.name &&
              (record.accountNumber || '-') === selectedBeneficiary.accountNumber
          );

          if (originalRecord && originalRecord.paymentTypeNames) {
            dispatch(updateBeneficiary({ 
              field: 'paymentType', 
              value: originalRecord.paymentTypeNames 
            }));
            setRecordPaymentTypes((prev) => ({
              ...prev,
              [selectedBeneficiary.id]: originalRecord.paymentTypeNames,
            }));
          }
        }
      }
    }
  }, [selectedIds, beneficiaries, uploadedFileData, recordPaymentTypes, dispatch]);

  const filterOpen = Boolean(filterAnchorEl);

  const totalItems = filteredBeneficiaries.length;
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedBeneficiaries = filteredBeneficiaries.slice(startIndex, endIndex);

  const handleChange = (field: string, value: any) => {
    dispatch(updateBeneficiary({ field, value }));
  };

  const handlePaymentTypeChange = (selectedItems: string[]) => {
    const paymentTypeValue = selectedItems.join(', ');
    
    const selectedValidRecords = beneficiaries.filter(
      (b) => selectedIds.includes(b.id) && b.recordType === 'valid'
    );
    
    if (selectedValidRecords.length === 1) {
      const recordId = selectedValidRecords[0].id;
      
      setRecordPaymentTypes((prev) => ({
        ...prev,
        [recordId]: paymentTypeValue,
      }));
      
      dispatch(updateBeneficiary({ field: 'paymentType', value: paymentTypeValue }));
    }
  };

  const handleChangePage = (_: ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (newRowsPerPage: number) => {
    if (newRowsPerPage === 5 || newRowsPerPage === 15 || newRowsPerPage === 30 || newRowsPerPage === 50 || newRowsPerPage === 100) {
      setRowsPerPage(newRowsPerPage);
    }
    setPage(1);
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id],
    );
  };

  const handleToggleExpand = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((expandedId) => expandedId !== id) : [...prev, id],
    );
  };

  const handleRemoveSingle = (id: string) => {
    setBeneficiaries((prev) => prev.filter((b) => b.id !== id));
    setFilteredBeneficiaries((prev) => prev.filter((b) => b.id !== id));
    setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
    setExpandedIds((prev) => prev.filter((expandedId) => expandedId !== id));
  };

  const handleRemoveBulk = () => {
    setBeneficiaries((prev) => prev.filter((b) => !selectedIds.includes(b.id)));
    setFilteredBeneficiaries((prev) => prev.filter((b) => !selectedIds.includes(b.id)));
    setExpandedIds((prev) => prev.filter((id) => !selectedIds.includes(id)));
    setSelectedIds([]);
    setRemoveDialogOpen(false);
  };

  const handleRemoveClick = () => {
    setRemoveDialogOpen(true);
  };

  const handleCancelRemove = () => {
    setRemoveDialogOpen(false);
  };

  const handleFilter = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleCloseFilter = () => {
    setFilterAnchorEl(null);
  };

  const handleApplyFilter = (filters: FilterValues) => {
    setActiveFilters(filters);
    
    const filtered = beneficiaries.filter((beneficiary) => {
      const matchName = !filters.beneficiaryName || 
        beneficiary.name.toLowerCase().includes(filters.beneficiaryName.toLowerCase());
      
      const matchCode = !filters.beneficiaryCode || 
        beneficiary?.beneficiaryCode?.toLowerCase().includes(filters.beneficiaryCode.toLowerCase());
      
      const matchAccount = !filters.accountNumber || 
        beneficiary.accountNumber.toLowerCase().includes(filters.accountNumber.toLowerCase());
      
      const matchCDI = !filters.cdiNumber || 
        beneficiary?.cdiNumber?.toLowerCase().includes(filters.cdiNumber.toLowerCase());
      
      const matchIBAN = !filters.iban || 
        beneficiary?.iban?.toLowerCase().includes(filters.iban.toLowerCase());
      
      const matchBank = !filters.bankName || 
        beneficiary?.bankName?.toLowerCase().includes(filters.bankName.toLowerCase());

      let matchValidation = true;
      if (filters.validation) {
        if (filters.validation === 'valid') {
          matchValidation = beneficiary.recordType === 'valid';
        } else if (filters.validation === 'invalid') {
          matchValidation = beneficiary.recordType === 'invalid' || beneficiary.recordType === 'error' || beneficiary.recordType === 'duplicate';
        }
      }

      return matchName && matchCode && matchAccount && matchCDI && matchIBAN && matchBank && matchValidation;
    });

    setFilteredBeneficiaries(filtered);
    setPage(1);
  };

  const handleRemoveFilters = () => {
    setActiveFilters(null);
    setFilteredBeneficiaries(beneficiaries);
    setPage(1);
    setResetFiltersTrigger((prev) => prev + 1);
  };

  const handleSubmitError = () => {
    setSubmitErrorDialogOpen(false);
  };

  const handleSubmitRetry = () => {
    setSubmitErrorDialogOpen(false);
    handleSubmit();
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      const validBeneficiaryIds = beneficiaries
        .filter((b) => b.recordType === 'valid')
        .map((b) => b.id);

      if (validBeneficiaryIds.length === 0) {
        setIsSubmitting(false);
        return;
      }

      const removeAddressCore = (record: any) => {
        const cleaned = { ...record };
        if (cleaned.counterPartyAddress) {
          const { coreAddressTO, ...addressWithoutCore } = cleaned.counterPartyAddress;
          cleaned.counterPartyAddress = addressWithoutCore;
        }
        if (cleaned.bankBranchAddress) {
          const { coreAddressTO, ...branchAddressWithoutCore } = cleaned.bankBranchAddress;
          cleaned.bankBranchAddress = branchAddressWithoutCore;
        }
        return cleaned;
      };

      const injectPaymentData = (record: any, beneficiaryId: string) => {
        const enriched = { ...record };
        
        const originalLinkedProfiles = (record.linkedPaymentProfiles || []).filter(
          (profile: any) => profile.customerPaymentProfileName && (profile.entityKey || profile.manualEntryServiceName)
        );
        const originalPaymentTypeNames = record.paymentTypeNames || '';
        
        const recordSpecificPaymentType = recordPaymentTypes[beneficiaryId];
        
        // If user selected new payment types for this record, merge with originals
        if (recordSpecificPaymentType && recordSpecificPaymentType.length > 0) {
          const paymentTypeArray = recordSpecificPaymentType
            .split(',')
            .map((pt: string) => pt.trim())
            .filter((pt: string) => pt.length > 0);
          
          let newLinkedProfiles: any[] = [];
          if (paymentProfiles && paymentProfiles.length > 0) {
            newLinkedProfiles = paymentProfiles
              .filter((p) => p.entityKey || p.customerPaymentProfileName)
              .filter((p) =>
                paymentTypeArray.includes(
                  p.customerPaymentProfileName ||
                    p.description ||
                    p.name ||
                    p.label ||
                    p.code ||
                    p.paymentProfileID?.toString() ||
                    p.value ||
                    '',
                ),
              );
          }
          
          const mergedProfiles = [...originalLinkedProfiles];
          const foundProfileNames = new Set<string>();
          
          const isValidProfile = (profile: any) => {
            return profile && 
                   profile.customerPaymentProfileName && 
                   (profile.entityKey || profile.manualEntryServiceName) &&
                   !profile.label &&
                   !profile.value;
          };
          
          newLinkedProfiles.forEach((newProfile) => {
            if (isValidProfile(newProfile)) {
              const profileName = newProfile.customerPaymentProfileName;
              const existsInOriginal = originalLinkedProfiles.some(
                (orig: any) => orig.entityKey === newProfile.entityKey
              );
              if (!existsInOriginal) {
                mergedProfiles.push(newProfile);
                foundProfileNames.add(profileName);
              }
            }
          });
          
          paymentTypeArray.forEach((paymentType) => {
            const profileExists = mergedProfiles.some(
              (p) => p.customerPaymentProfileName === paymentType
            );
            if (!profileExists) {
              const profileFromApi = paymentProfiles?.find(
                (p) => 
                  p.customerPaymentProfileName === paymentType ||
                  p.description === paymentType ||
                  p.name === paymentType ||
                  p.label === paymentType ||
                  p.code === paymentType ||
                  p.value === paymentType
              );
              
              if (profileFromApi && isValidProfile(profileFromApi)) {
                mergedProfiles.push(profileFromApi);
              } else {
                mergedProfiles.push({
                  customerPaymentProfileName: paymentType,
                  manualEntryServiceName: paymentType,
                  payAlertsEnabled: false,
                  active: true,
                  hidebeneficiaryenabled: false,
                });
              }
            }
          });
          
          const existingTypeNames = originalPaymentTypeNames
            ? originalPaymentTypeNames.split(',').map((t: string) => t.trim())
            : [];
          const newTypeNames = paymentTypeArray.filter(
            (pt: string) => !existingTypeNames.includes(pt)
          );
          const mergedTypeNames = [...existingTypeNames, ...newTypeNames].join(', ');
          
          enriched.linkedPaymentProfiles = mergedProfiles;
          enriched.paymentTypeNames = mergedTypeNames;
        } else {
          enriched.linkedPaymentProfiles = originalLinkedProfiles;
          enriched.paymentTypeNames = originalPaymentTypeNames;
        }
        
        return enriched;
      };

      const originalData = uploadedFileData;
      const payload: any = {
        newRecords: [],
        existingRecords: [],
      };

      const filterValidRecords = (records: any[] = []) => {
        return records
          .filter((record: any) => {
            const beneItem = beneficiaries.find(
              (b) =>
                b.name === (record.counterPartyName || '-') &&
                b.accountNumber === (record.accountNumber || '-')
            );
            return beneItem && validBeneficiaryIds.includes(beneItem.id);
          })
          .map((record: any) => {
            const beneItem = beneficiaries.find(
              (b) =>
                b.name === (record.counterPartyName || '-') &&
                b.accountNumber === (record.accountNumber || '-')
            );
            return injectPaymentData(removeAddressCore(record), beneItem?.id || '');
          });
      };

      // Populate payload with valid records only
      payload.newRecords = filterValidRecords(originalData?.newRecords);
      payload.existingRecords = filterValidRecords(originalData?.existingRecords);

      const response = await post(API_ROUTES.BENEFICIARIES_PROCESS_BATCH, payload);

      router.push('/setup-and-admin/beneficiary/file-upload/success' as any);
    } catch (error: any) {
      setIsSubmitting(false);
      
      // Extract error issues and try to map to error codes
      const errorIssues = extractErrorIssues(error?.response?.data || error?.data || error);
      let errorMsg = 'We are unable to submit the beneficiaries.';
      
      if (errorIssues && errorIssues.length > 0) {
        try {
          const formattedErrors = formatErrorMessages(errorIssues);
          if (formattedErrors && formattedErrors !== 'Something went wrong') {
            errorMsg = formattedErrors; // Use mapped error codes
          }
        } catch (e) {
          // Keep generic fallback on error
        }
      }
      
      setSubmitErrorMessage(errorMsg);
      setSubmitErrorDialogOpen(true);
    }
  };

  const selectedValidRecords = beneficiaries.filter(
    (b) => selectedIds.includes(b.id) && b.recordType === 'valid'
  );
  const isPaymentTypeEnabled = selectedValidRecords.length === 1;
  const selectedBeneficiary = isPaymentTypeEnabled ? selectedValidRecords[0] : null;

  const hasValidRecords = beneficiaries.some((b) => b.recordType === 'valid');
  const isSubmitDisabled = !hasValidRecords || beneficiaries.length === 0;

  return (
    <>
      <UserCard
        title="Beneficiary file upload"
        icon={<Image src={PaperStack} alt="Paper Stack Icon" />}
        testId={buildTestId(testIdPrefix, 'list-card')}
        headerActions={
          <>
            {selectedIds.length > 0 && (
              <Button
                buttonVariant="tertiary"
                data-testid={buildTestId(testIdPrefix, 'remove-selected-button')}
                startIcon={<Image src={IcnBin} alt="Remove" width={24} height={24} />}
                onClick={handleRemoveClick}
                style={{
                  height: '48px',
                  minHeight: '48px',
                  width: '141px',
                  fontWeight: 700,
                  fontSize: '14px',
                }}
              >
                REMOVE({selectedIds.length})
              </Button>
            )}

            {activeFilters && (
              <Button
                buttonVariant="tertiary"
                data-testid={buildTestId(testIdPrefix, 'remove-filters-button')}
                endIcon={<Image src={IcnCloseIcon} alt="close" width={20} height={20} />}
                onClick={handleRemoveFilters}
                style={{
                  height: '48px',
                  minHeight: '48px',
                  width: '180px',
                  fontWeight: 700,
                  fontSize: '14px',
                  textTransform: 'none',
                }}
              >
                Remove filters
              </Button>
            )}

            <Button
              buttonVariant="tertiary"
              data-testid={buildTestId(testIdPrefix, 'filter-button')}
              startIcon={<Image src={FilterIcon} alt="filter" width={24} height={24} />}
              onClick={handleFilter}
              disabled={beneficiaries.length === 0}
              style={{
                height: '48px',
                minHeight: '48px',
                width: '112px',
                fontWeight: 700,
                fontSize: '14px',
              }}
            >
              FILTER
            </Button>
          </>
        }
      >
        <div
          className={styles.beneficiaryList}
          data-testid={buildTestId(testIdPrefix, 'beneficiary-list')}
        >
          {uploadedFileData && !uploadedFileData.schemaValidated && uploadedFileData.validationMsg ? (
            <div style={{
              fontSize: '14px',
              fontWeight: 500,
              color: '#E31E46',
              textAlign: 'center',
              padding: '16px 0'
            }}>
              {uploadedFileData.validationMsg}
            </div>
          ) : paginatedBeneficiaries.length === 0 ? (
            <div className={styles.emptyState}>No beneficiaries found</div>
          ) : (
            paginatedBeneficiaries.map((beneficiary) => (
              <BeneficiaryRow
                key={beneficiary.id}
                beneficiary={beneficiary}
                isSelected={selectedIds.includes(beneficiary.id)}
                isExpanded={expandedIds.includes(beneficiary.id)}
                onToggleSelect={handleToggleSelect}
                onToggleExpand={handleToggleExpand}
                onRemove={handleRemoveSingle}
              />
            ))
          )}
        </div>

        <CustomPagination
          rows={filteredBeneficiaries}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 15, 30, 50, 100]}
          itemsLabel="list items"
          testIdPrefix={buildTestId(testIdPrefix, 'pagination')}
        />
      </UserCard>

      <Box sx={{ marginTop: '24px' }} data-testid={buildTestId(testIdPrefix, 'payment-type-section')}>
        <UserCard
          title="Payment type"
          icon={<Image src={IcnCardQuestion} alt="Payment type" />}
          testId={buildTestId(testIdPrefix, 'payment-type-card')}
        >
          <Box
            sx={{
              width: '50%',
              marginTop: '36px',
              '& .MuiOutlinedInput-root': { borderRadius: '8px' },
              '& .MuiInputLabel-root:not(.MuiInputLabel-shrink)': {
                top: '50%',
                transform: 'translateY(-50%)',
                left: '14px',
              },
              '& .MuiInputLabel-root.MuiInputLabel-shrink': { top: '0px', left: '0px' },
              '& .MuiFormControl-root': {
                margin: 0,
                width: '100%',
              },
            }}
          >
            <Box data-testid={buildTestId(testIdPrefix, 'payment-type-select')}>
              <MultipleSelectChip
              label="Payment type"
              options={Array.isArray(paymentTypes) ? paymentTypes : []}
              selected={
                beneficiary.paymentType
                  ? beneficiary.paymentType
                      .split(',')
                      .map((pt: string) => pt.trim())
                      .filter((pt: string) => pt.length > 0)
                      .map((pt: string) => ({ value: pt }))
                  : []
              }
              OnChange={handlePaymentTypeChange}
              disabled={!isPaymentTypeEnabled}
              placeholder="Payment type"
              error={false}
              helperText=""
              sx={{
                height: '48px',
                minHeight: '48px',
              }}
              />
            </Box>
          </Box>
        </UserCard>
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          mt: '20px',
          mb: '20px',
        }}
      >
        <Button
          buttonVariant="text"
          onClick={() => router.push('/setup-and-admin/beneficiary/create')}
          data-testid={buildTestId(testIdPrefix, 'cancel-button')}
          startIcon={<Image src={IcnCloseIcon} alt="close" width={20} height={20} />}
          style={{ height: '48px', minHeight: '48px', width: '112px' }}
        >
          CANCEL
        </Button>
        <Button
          buttonVariant="primary"
          onClick={handleSubmit}
          disabled={isSubmitDisabled || isSubmitting}
          data-testid={buildTestId(testIdPrefix, 'submit-button')}
          startIcon={!isSubmitting ? <ArrowForwardIcon /> : undefined}
          style={{
            height: '48px',
            minHeight: '48px',
            width: '390px',
          }}
        >
          {isSubmitting ? <CircularProgress size={24} sx={{ color: '#0062E1' }} /> : 'SUBMIT VALID BENEFICIARIES FOR APPROVAL'}
        </Button>
      </Box>

      <BeneficiaryFilter
        open={filterOpen}
        anchorEl={filterAnchorEl}
        onClose={handleCloseFilter}
        onApplyFilter={handleApplyFilter}
        resetTrigger={resetFiltersTrigger}
        testIdPrefix={buildTestId(testIdPrefix, 'filter-popover')}
      />

      <div data-testid={buildTestId(testIdPrefix, 'remove-dialog')}>
      <Dialog
        name="remove-beneficiaries-dialog"
        title="Remove Beneficiaries"
        open={removeDialogOpen}
        onClose={handleCancelRemove}
        content={
          <>
            <Box
              sx={{
                padding: '16px 0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <Image src={AvatarAlert} alt="Alert" width={48} height={48} />
              <Box sx={{ fontWeight: 700, fontSize: '16px', textAlign: 'center' }}>
                {`${selectedIds.length} ${selectedIds.length === 1 ? 'beneficiary' : 'beneficiaries'} marked for removal`}
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                {`Are you sure you want to remove the ${selectedIds.length} ${selectedIds.length === 1 ? 'beneficiary' : 'beneficiaries'} selected?`}
              </Box>
            </Box>
          </>
        }
        secondaryCTALabel="YES, remove THE SELECTED ITEMS"
        tertiaryCTALabel="CANCEL"
        onSecondaryCTA={handleRemoveBulk}
        onTertiaryCTA={handleCancelRemove}
        maxWidth="560px"
        secondaryCTAWidth="290px"
        secondaryCTAHeight="48px"
        tertiaryCTAWidth="82px"
        tertiaryCTAHeight="48px"
      />
      </div>

      <DeleteConfirmationDialog
        open={submitErrorDialogOpen}
        onClose={() => setSubmitErrorDialogOpen(false)}
        onPrimaryCTA={handleSubmitRetry}
        onSecondaryCTA={handleSubmitError}
        selectedCount={0}
        exclamationIcon={AvatarAlert}
        itemLabel=""
        markedCount={undefined}
        showUndoWarning={false}
        title="System error"
        message={
          <div style={{ textAlign: 'center' }}>
            {!submitErrorMessage || submitErrorMessage === 'We are unable to submit the beneficiaries.' ? (
              <>
                <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>
                  Something went wrong
                </div>
                <div style={{ fontWeight: 400, fontSize: '16px', marginBottom: '16px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: '1.6' }}>
                  {submitErrorMessage || 'We are unable to submit the beneficiaries.'}
                </div>
                <div style={{ fontWeight: 400, fontSize: '16px', color: '#222E37' }}>
                  Please try again or contact your bank representative for assistance.
                </div>
              </>
            ) : (
              <div style={{ fontWeight: 400, fontSize: '16px', marginBottom: '16px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: '1.6' }}>
                {submitErrorMessage}
              </div>
            )}
          </div>
        }
        primaryCTALabel="Try again"
        secondaryCTALabel="Dismiss"
        secondaryCTAWidth="auto"
        tertiaryCTAWidth="auto"
        testIdPrefix={buildTestId(testIdPrefix, 'submit-error-dialog')}
      />
    </>
  );
}

export default BeneficiaryFileUpload;
