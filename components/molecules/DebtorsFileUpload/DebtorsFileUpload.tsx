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
import DebtorRow from './DebtorsRow';
import { Debtor } from './types';
import { Button, MultipleSelectChip, Dialog, DialogInfoCard } from 'dist/standard-bank-react';
import styles from './DebtorsFileUpload.module.scss';
import IcnCardQuestion from 'public/icons/icn_card_question.svg';
import { Box } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@lib/hooks/useAppDispatch';
import { updateBeneficiary } from '@store/slices/createBeneficiarySlice';
import { setCollectionTypes } from '@store/slices/debtorSlice';
import IcnCloseIcon from 'public/icons/close-icon.svg';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DebtorFilter, { FilterValues } from './DebtorsFilter';
import { useTranslations } from 'next-intl';
import { UploadedDebtorRecord, processDebtorBatch } from '@lib/api/debtorApi';
import { getCollectionTypesList } from '@lib/api/collectionTypesApi';
import ValidationErrorDialog from 'components/common/ValidationErrorDialog';
import { extractErrorIssues, formatErrorMessages } from 'src/utils/errorMessageFormatter';

const displayValue = (value: any): string => {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  return String(value);
};

function mapUploadedDebtorToDebtor(
  record: UploadedDebtorRecord,
  status: 'verified' | 'partially-verified' | 'not-verified' | 'invalid' | 'duplicate',
): Debtor {
  const declineReasonValue = displayValue(
    record.declineReason || record.issueLogTO?.issues?.[0]?.message
  );

  return {
    id: record.entityKey?.toString() || Math.random().toString(),
    name: record.counterPartyName || '[Unknown]',
    status: status,
    accountNumber: record.accountNumber || '[Account Number]',
    debtorCode: record.referenceIDX || '[Debtor code]',
    bankName: record.financialInstitutionName || '[Bank name]',
    cdiNumber: record.branchSortCode || '[CDI number]',
    debtorReference: record.counterPartyReference || '[Debtor reference]',
    iban: record.iban || '-',
    transactionLimit:
      record.transactionLimit && record.transactionLimitCurrency
        ? `${record.transactionLimitCurrency} ${record.transactionLimit.toLocaleString()}`
        : '[XXX, xxx, xxxx, xxx]',
    rawData: record, // Store full record for detail view
    declineReason: declineReasonValue,
  };
}

interface DebtorFileUploadProps {
  onCancel?: () => void;
}

function DebtorFileUpload({ onCancel }: DebtorFileUploadProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const uploadResult = useAppSelector((state) => state.debtor.uploadResult);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<5 | 15 | 30 | 50 | 100>(15);

  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [filteredDebtors, setFilteredDebtors] = useState<Debtor[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterValues | null>(null);
  const [collectionTypeOptions, setCollectionTypeOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [collectionTypesList, setCollectionTypesList] = useState<any[]>([]);
  const [debtorCollectionTypes, setDebtorCollectionTypes] = useState<Map<string, string[]>>(
    new Map(),
  );
  const [selectedCollectionTypes, setSelectedCollectionTypes] = useState<string[]>([]);
  const [errorDialog, setErrorDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    secondaryMessage?: string;
  }>({
    open: false,
    title: '',
    message: '',
    secondaryMessage: '',
  });
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string>('');

  useEffect(() => {
    const fetchCollectionTypes = async () => {
      try {
        const response = await getCollectionTypesList();
        const list = response.collectionTypeList || [];
        const options = list
          .filter((item) => item.collectionTypeName)
          .map((item) => ({
            label: item.collectionTypeName!,
            value: item.collectionTypeName!,
          }))
          .sort((a, b) => a.label.localeCompare(b.label)); // Sort alphabetically
        setCollectionTypesList(list);
        setCollectionTypeOptions(options);
      } catch (error) {
        setCollectionTypesList([]);
        setCollectionTypeOptions([]);
      }
    };
    fetchCollectionTypes();
  }, []);

  // Map API response to debtors when uploadResult changes
  useEffect(() => {
    if (uploadResult) {
      const mappedDebtors: Debtor[] = [];

      // Map new records
      if (uploadResult.newRecords) {
        uploadResult.newRecords.forEach((record) => {
          mappedDebtors.push(mapUploadedDebtorToDebtor(record, 'not-verified'));
        });
      }

      // Map existing records
      if (uploadResult.existingRecords) {
        uploadResult.existingRecords.forEach((record) => {
          mappedDebtors.push(mapUploadedDebtorToDebtor(record, 'verified'));
        });
      }

      // Map invalid records
      if (uploadResult.inValidRecords) {
        uploadResult.inValidRecords.forEach((record) => {
          mappedDebtors.push(mapUploadedDebtorToDebtor(record, 'invalid'));
        });
      }

      // Map error records
      if (uploadResult.errorRecords) {
        uploadResult.errorRecords.forEach((record) => {
          mappedDebtors.push(mapUploadedDebtorToDebtor(record, 'invalid'));
        });
      }

      // Map duplicate records
      if (uploadResult.dupRecords) {
        uploadResult.dupRecords.forEach((record) => {
          mappedDebtors.push(mapUploadedDebtorToDebtor(record, 'duplicate'));
        });
      }

      setDebtors(mappedDebtors);
      setFilteredDebtors(mappedDebtors);

      const initialCollectionTypes = new Map<string, string[]>();
      mappedDebtors.forEach((debtor) => {
        if (debtor.rawData?.linkedCollectionProfiles) {
          const types = debtor.rawData.linkedCollectionProfiles
            .map((profile: any) => profile.customerPaymentProfileName)
            .filter((name: string) => name);
          initialCollectionTypes.set(debtor.id, types);
        }
      });
      setDebtorCollectionTypes(initialCollectionTypes);
    }
  }, [uploadResult]);

  const filterOpen = Boolean(filterAnchorEl);

  const totalItems = filteredDebtors.length;
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedDebtors = filteredDebtors.slice(startIndex, endIndex);

  const handleChange = (field: string, value: any) => {
    dispatch(updateBeneficiary({ field, value }));
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
    // Check if the debtor is invalid or duplicate and prevent selection
    const debtor = debtors.find(d => d.id === id);
    if (debtor && (debtor.status === 'invalid' || debtor.status === 'duplicate')) {
      return;
    }
    
    setSelectedIds((prev) => {
      const newSelection = prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id];

      if (newSelection.length === 1) {
        const selectedId = newSelection[0];
        const types = debtorCollectionTypes.get(selectedId) || [];
        setSelectedCollectionTypes(types);
      } else {
        setSelectedCollectionTypes([]);
      }

      return newSelection;
    });
  };

  useEffect(() => {
    if (selectedIds.length === 1) {
      const selectedId = selectedIds[0];
      const types = debtorCollectionTypes.get(selectedId) || [];
      setSelectedCollectionTypes(types);
    } else {
      setSelectedCollectionTypes([]);
    }
  }, [selectedIds, debtorCollectionTypes]);

  const isCollectionTypeEnabled = selectedIds.length === 1;
  const currentCollectionTypes =
    isCollectionTypeEnabled && selectedIds.length === 1
      ? debtorCollectionTypes.get(selectedIds[0]) || []
      : [];
  const selectedCollectionTypesForChip = currentCollectionTypes.map((type) => ({
    label: type,
    value: type,
  }));

  const validDebtorsCount = debtors.filter(
    (d) => d.status === 'verified' || d.status === 'not-verified',
  ).length;

  const handleToggleExpand = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((expandedId) => expandedId !== id) : [...prev, id],
    );
  };

  const handleRemoveSingle = (id: string) => {
    setDebtors((prev) => prev.filter((b) => b.id !== id));
    setFilteredDebtors((prev) => prev.filter((b) => b.id !== id));
    setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
    setExpandedIds((prev) => prev.filter((expandedId) => expandedId !== id));
  };

  const handleRemoveBulk = () => {
    setDebtors((prev) => prev.filter((b) => !selectedIds.includes(b.id)));
    setFilteredDebtors((prev) => prev.filter((b) => !selectedIds.includes(b.id)));
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

    const filtered = debtors.filter((debtor) => {
      const matchName =
        !filters.debtorName || debtor.name.toLowerCase().includes(filters.debtorName.toLowerCase());

      const matchCode =
        !filters.debtorCode ||
        debtor?.debtorCode?.toLowerCase().includes(filters.debtorCode.toLowerCase());

      const matchAccount =
        !filters.accountNumber ||
        debtor.accountNumber.toLowerCase().includes(filters.accountNumber.toLowerCase());

      const matchCDI =
        !filters.cdiNumber ||
        debtor?.cdiNumber?.toLowerCase().includes(filters.cdiNumber.toLowerCase());

      const matchIBAN =
        !filters.iban || debtor?.iban?.toLowerCase().includes(filters.iban.toLowerCase());

      const matchBank =
        !filters.bankName ||
        debtor?.bankName?.toLowerCase().includes(filters.bankName.toLowerCase());

      const matchStatus =
        !filters.verificationStatus || debtor.status === filters.verificationStatus;

      return (
        matchName && matchCode && matchAccount && matchCDI && matchIBAN && matchBank && matchStatus
      );
    });

    setFilteredDebtors(filtered);
    setPage(1); // Reset to first page after filtering
  };

  const handleRemoveFilters = () => {
    setActiveFilters(null);
    setFilteredDebtors(debtors);
    setPage(1);
  };

  const transformDebtorRecord = (record: any) => {
    const transformValue = (val: any): any => {
      if (val === null || val === undefined) return '';
      if (typeof val === 'object' && !Array.isArray(val)) {
        const transformed: any = {};
        for (const key in val) {
          if (key === 'coreAddressTO') continue;
          transformed[key] = transformValue(val[key]);
        }
        return transformed;
      }
      if (Array.isArray(val)) {
        return val.map(transformValue);
      }
      return val;
    };

    const transformed = transformValue(record);

    if (!transformed.entityKey) {
      delete transformed.entityKey;
    }

    if (!transformed.classification || transformed.classification === '') {
      transformed.classification = 'domestic';
    }

    if (!transformed.issueLogTO || transformed.issueLogTO === '') {
      transformed.issueLogTO = { issues: [{}] };
    }

    return transformed;
  };

  const handleSubmit = async () => {
    if (!uploadResult) return;

    try {
      // Helper function to update collection profiles on a record
      const updateRecordWithCollectionTypes = (record: any) => {
        const transformed = transformDebtorRecord(record);

        // Find matching debtor in our debtors list to get the correct ID
        // This is important because new records have random IDs, not entityKeys
        const matchingDebtor = debtors.find(
          (d) =>
            // First try exact match by entityKey if both exist
            (record.entityKey && d.rawData?.entityKey && 
             d.rawData.entityKey.toString() === record.entityKey.toString()) ||
            // Otherwise match by unique combination of name and account
            (d.rawData?.counterPartyName === record.counterPartyName &&
             d.rawData?.accountNumber === record.accountNumber &&
             d.rawData?.referenceIDX === record.referenceIDX),
        );

        // Get collection types for this specific debtor using its ID
        let collectionTypeNames: string[] | undefined;
        if (matchingDebtor) {
          collectionTypeNames = debtorCollectionTypes.get(matchingDebtor.id);
        }

        // Check if user has interacted with this record's collection types
        const hasModifiedCollectionTypes = collectionTypeNames !== undefined;

        if (hasModifiedCollectionTypes) {
          // User has modified collection types for this record
          if (collectionTypeNames && collectionTypeNames.length > 0) {
            // Collection types selected
            const originalProfiles = record.linkedCollectionProfiles || [];

            // Create profiles for newly selected types
            const updatedProfiles = collectionTypeNames.map((name: string) => {
              // Find if this profile already existed
              const existingProfile = originalProfiles.find(
                (p: any) => p.customerPaymentProfileName === name,
              );

              // If it existed, preserve its structure; otherwise create new
              if (existingProfile) {
                return existingProfile;
              } else {
                // Look up the collectionTypeKey from the fetched collection types list
                const collectionType = collectionTypesList.find(
                  (item: any) => item.collectionTypeName === name || item.name === name || item.code === name
                );
                const entityKey = collectionType?.collectionTypeKey || collectionType?.entityKey || 0;

                return {
                  customerPaymentProfileName: name,
                  entityKey: entityKey,
                  manualEntryServiceName: '',
                  payAlertsEnabled: false,
                  active: true,
                  hidebeneficiaryenabled: false,
                };
              }
            });

            transformed.linkedCollectionProfiles = updatedProfiles;
            transformed.collectionTypeNames = collectionTypeNames.join(',');
          } else {
            // User removed all collection types - set to empty
            transformed.linkedCollectionProfiles = [];
            transformed.collectionTypeNames = '';
          }
        }
        // If no collection types were modified, keep the original linkedCollectionProfiles and collectionTypeNames

        return transformed;
      };

      const newRecords = (uploadResult.newRecords || []).map(updateRecordWithCollectionTypes);
      const existingRecords = (uploadResult.existingRecords || []).map(
        updateRecordWithCollectionTypes,
      );

      const payload = {
        newRecords,
        existingRecords,
      };

      await processDebtorBatch(payload);

      router.push('/setup-and-admin/debtors/file-upload/success' as any);
    } catch (error: any) {
      // Extract and format error codes if available
      const errorIssues = extractErrorIssues(error?.response?.data || error?.data || error);
      let errorMsg = translateLang('unableProcessDebtors');
      if (errorIssues && errorIssues.length > 0) {
        try {
          const formattedErrors = formatErrorMessages(errorIssues);
          if (formattedErrors && formattedErrors !== 'Something went wrong') {
            errorMsg = formattedErrors;
          }
        } catch (e) {
          // fallback to default message
        }
      }
      setSubmitErrorMessage(errorMsg);

      // Show error popup with common error message pattern
      setErrorDialog({
        open: true,
        title: translateLang('systemError'),
        message: translateLang('somethingWentWrong'),
        secondaryMessage: `We are unable to process the debtors. ${translateLang('contactBankRepresentative')}`,
      });
    }
  };

  const handleErrorDialogClose = () => {
    setErrorDialog({
      open: false,
      title: '',
      message: '',
      secondaryMessage: '',
    });
  };
  const translateLang = useTranslations('debtorsHubData');

  return (
    <>
      <UserCard
        title={translateLang('fileUpload')}
        icon={<Image src={PaperStack} alt="Paper Stack Icon" />}
        headerActions={
          <>
            {selectedIds.length > 0 && (
              <Button
                buttonVariant="tertiary"
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
                {translateLang('remove')}({selectedIds.length})
              </Button>
            )}

            {activeFilters && (
              <Button
                buttonVariant="tertiary"
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
                {translateLang('removeFilters')}
              </Button>
            )}

            <Button
              buttonVariant="tertiary"
              startIcon={<Image src={FilterIcon} alt="filter" width={24} height={24} />}
              onClick={handleFilter}
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
        <div className={styles.debtorList}>
          {uploadResult && !uploadResult.schemaValidated && uploadResult.validationMsg ? (
            <div style={{
              fontSize: '14px',
              fontWeight: 500,
              color: '#E31E46',
              textAlign: 'center',
              padding: '16px 0'
            }}>
              {uploadResult.validationMsg}
            </div>
          ) : paginatedDebtors.length === 0 ? (
            <div className={styles.emptyState}>No debtors found</div>
          ) : (
            paginatedDebtors.map((debtor) => (
              <DebtorRow
                key={debtor.id}
                debtor={debtor}
                isSelected={selectedIds.includes(debtor.id)}
                isExpanded={expandedIds.includes(debtor.id)}
                onToggleSelect={handleToggleSelect}
                onToggleExpand={handleToggleExpand}
                onRemove={handleRemoveSingle}
              />
            ))
          )}
        </div>

        <CustomPagination
          rows={filteredDebtors}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 15, 30, 50, 100]}
          itemsLabel="list items"
          testIdPrefix="debtors-file-upload-pagination"
        />
      </UserCard>

      <Box sx={{ marginTop: '24px' }}>
        <UserCard
          title="Collection type"
          icon={<Image src={IcnCardQuestion} alt="Collection type" />}
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
            <MultipleSelectChip
              label="Collection type"
              options={collectionTypeOptions}
              selected={selectedCollectionTypesForChip}
              OnChange={(selectedItems: string[]) => {
                if (isCollectionTypeEnabled && selectedIds.length === 1) {
                  const selectedId = selectedIds[0];
                  setDebtorCollectionTypes((prev) => {
                    const newMap = new Map(prev);
                    newMap.set(selectedId, selectedItems);
                    return newMap;
                  });
                  setSelectedCollectionTypes(selectedItems);
                }
              }}
              placeholder={
                isCollectionTypeEnabled
                  ? 'Select collection types'
                  : 'Select exactly one record to manage collection types'
              }
              disabled={!isCollectionTypeEnabled}
              error={false}
              helperText={
                !isCollectionTypeEnabled
                  ? 'Please select exactly one record to view and edit its collection types'
                  : ''
              }
              sx={{
                height: '48px',
                minHeight: '48px',
                '& .MuiChip-root': {
                  display: isCollectionTypeEnabled ? 'inline-flex' : 'none !important',
                },
                '& .MuiSelect-select .MuiChip-root': {
                  display: isCollectionTypeEnabled ? 'inline-flex' : 'none !important',
                },
              }}
            />
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
          onClick={() => router.push('/setup-and-admin/debtors/create')}
          startIcon={<Image src={IcnCloseIcon} alt="close" width={20} height={20} />}
          style={{ height: '48px', minHeight: '48px', width: '112px' }}
        >
          {translateLang('cancel')}
        </Button>
        <Button
          buttonVariant="primary"
          onClick={handleSubmit}
          disabled={
            !uploadResult || 
            debtors.length === 0 || 
            validDebtorsCount === 0 || 
            (uploadResult && !uploadResult.schemaValidated && uploadResult.validationMsg)
          }
          startIcon={<ArrowForwardIcon />}
          style={{
            height: '48px',
            minHeight: '48px',
            width: '349px',
          }}
        >
          {translateLang('submitValidDebtorsForApproval')}
        </Button>
      </Box>

      <DebtorFilter
        open={filterOpen}
        anchorEl={filterAnchorEl}
        onClose={handleCloseFilter}
        onApplyFilter={handleApplyFilter}
        activeFilters={activeFilters}
      />

      <Dialog
        name="remove-debtors-dialog"
        title="Remove Debtors"
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
                {`${selectedIds.length} ${selectedIds.length === 1 ? 'debtor' : 'debtors'} marked for removal`}
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                {`Are you sure you want to remove the ${selectedIds.length} ${selectedIds.length === 1 ? 'debtor' : 'debtors'} selected?`}
              </Box>
            </Box>
          </>
        }
        secondaryCTALabel="YES, remove THE SELECTED ITEMS"
        tertiaryCTALabel="CANCEL"
        onSecondaryCTA={handleRemoveBulk}
        onTertiaryCTA={handleCancelRemove}
        maxWidth="560px"
        secondaryCTAWidth="278px"
        secondaryCTAHeight="48px"
        tertiaryCTAWidth="82px"
        tertiaryCTAHeight="48px"
      />

      <ValidationErrorDialog
        open={errorDialog.open}
        onClose={handleErrorDialogClose}
        title={!submitErrorMessage || submitErrorMessage === translateLang('unableProcessDebtors') ? errorDialog.title : ''}
        message={!submitErrorMessage || submitErrorMessage === translateLang('unableProcessDebtors') ? errorDialog.message : submitErrorMessage}
        isMandatoryError={true}
        secondaryMessage={!submitErrorMessage || submitErrorMessage === translateLang('unableProcessDebtors') ? errorDialog.secondaryMessage : ''}
      />
    </>
  );
}

export default DebtorFileUpload;
