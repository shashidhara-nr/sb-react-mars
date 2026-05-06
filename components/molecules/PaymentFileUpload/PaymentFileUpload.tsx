'use client';
 
import UserCard from '@atoms/UserCard/UserCard';
import Image from 'next/image';
import PaperStack from 'public/icons/icn_paper_stack.svg';
import IcnBin from 'public/icons/icn_bin.svg';
import FilterIcon from 'public/icons/col-icon-filter.svg';
import AvatarAlert from 'public/icons/avatar_alert.svg';
import { useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import CustomPagination from './CustomPagination';
import PaymentRow from './PaymentRow';
import { Payment } from './types';
import { Button, MultipleSelectChip, Dialog } from 'dist/standard-bank-react';
import styles from './PaymentFileUpload.module.scss';
import IcnCardQuestion from 'public/icons/icn_card_question.svg';
import { Box } from '@mui/material';
import IcnCloseIcon from 'public/icons/close-icon.svg';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PaymentFilter, { FilterValues } from './PaymentFilter';
import { buildTestId } from 'src/utils/testIds';
 
const mockPayments: Payment[] = [
  {
    id: '1',
    name: '5.  Ashok Zar',
    status: 'partially-verified',
    accountNumber: '[Account Number]',
    beneficiaryCode: '[Payment code]',
    bankName: '[Bank name]',
    cdiNumber: '[CDI number]',
    beneficiaryReference: '[Payment reference]',
    iban: 'XXXXXXXX',
    transactionLimit: '[XXX, xxx, xxxx, xxx]',
  },
  {
    id: '2',
    name: '4. City of Johannesburg',
    status: 'verified',
    accountNumber: '[Account Number]',
    beneficiaryCode: '[Payment code]',
    bankName: '[Bank name]',
    cdiNumber: '[CDI number]',
    beneficiaryReference: '[Payment reference]',
    iban: 'XXXXXXXX',
    transactionLimit: '[XXX, xxx, xxxx, xxx]',
  },
  {
    id: '3',
    name: '3. BW Base',
    status: 'not-verified',
    accountNumber: '[Account Number]',
    beneficiaryCode: '[Payment code]',
    bankName: '[Bank name]',
    cdiNumber: '[CDI number]',
    beneficiaryReference: '[Payment reference]',
    iban: 'XXXXXXXX',
    transactionLimit: '[XXX, xxx, xxxx, xxx]',
  },
  {
    id: '4',
    name: '2. BMW Group',
    status: 'invalid',
    accountNumber: '[Account number]',
    beneficiaryCode: '[Payment code]',
    bankName: '[Bank name]',
    cdiNumber: '[CDI number]',
    beneficiaryReference: '[Payment reference]',
    iban: 'XXXXXXXX',
    transactionLimit: '[XXX, xxx, xxxx, xxx]',
  },
  {
    id: '5',
    name: '1. Canada',
    status: 'duplicate',
    accountNumber: '[Account number]',
    beneficiaryCode: '[Payment code]',
    bankName: '[Bank name]',
    cdiNumber: '[CDI number]',
    beneficiaryReference: '[Payment reference]',
    iban: 'XXXXXXXX',
    transactionLimit: '[XXX, xxx, xxxx, xxx]',
  },
];
 
interface PaymentFileUploadProps {
  onCancel?: () => void;
}
 
function PaymentFileUpload({ onCancel }: PaymentFileUploadProps) {
  const testIdPrefix = 'payment-file-upload';
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<10 | 20 | 50>(10);
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>(mockPayments);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterValues | null>(null);
  const [paymentTypeNames, setPaymentTypeNames] = useState<string>('');
 
  const filterOpen = Boolean(filterAnchorEl);
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedPayments = filteredPayments.slice(startIndex, endIndex);
 
  const handleChange = (field: string, value: any) => {
    if (field === 'paymentTypeNames') {
      setPaymentTypeNames(value);
    }
  };
 
  const handleChangePage = (_: ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };
 
  const handleChangeRowsPerPage = (newRowsPerPage: number) => {
    if (newRowsPerPage === 10 || newRowsPerPage === 20 || newRowsPerPage === 50) {
      setRowsPerPage(newRowsPerPage);
    }
    setPage(1);
  };
 
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]));
  };
 
  const handleToggleExpand = (id: string) => {
    setExpandedIds((prev) => (prev.includes(id) ? prev.filter((expandedId) => expandedId !== id) : [...prev, id]));
  };
 
  const handleRemoveSingle = (id: string) => {
    setPayments((prev) => prev.filter((p) => p.id !== id));
    setFilteredPayments((prev) => prev.filter((p) => p.id !== id));
    setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
    setExpandedIds((prev) => prev.filter((expandedId) => expandedId !== id));
  };
 
  const handleRemoveBulk = () => {
    setPayments((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
    setFilteredPayments((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
    setExpandedIds((prev) => prev.filter((id) => !selectedIds.includes(id)));
    setSelectedIds([]);
    setRemoveDialogOpen(false);
  };
 
  const handleApplyFilter = (filters: FilterValues) => {
    setActiveFilters(filters);
 
    const filtered = payments.filter((payment) => {
      const matchName = !filters.beneficiaryName || payment.name.toLowerCase().includes(filters.beneficiaryName.toLowerCase());
      const matchCode = !filters.beneficiaryCode || payment?.beneficiaryCode?.toLowerCase().includes(filters.beneficiaryCode.toLowerCase());
      const matchAccount = !filters.accountNumber || payment.accountNumber.toLowerCase().includes(filters.accountNumber.toLowerCase());
      const matchCDI = !filters.cdiNumber || payment?.cdiNumber?.toLowerCase().includes(filters.cdiNumber.toLowerCase());
      const matchIBAN = !filters.iban || payment?.iban?.toLowerCase().includes(filters.iban.toLowerCase());
      const matchBank = !filters.bankName || payment?.bankName?.toLowerCase().includes(filters.bankName.toLowerCase());
      const matchStatus = !filters.verificationStatus || payment.status === filters.verificationStatus;
      return matchName && matchCode && matchAccount && matchCDI && matchIBAN && matchBank && matchStatus;
    });
 
    setFilteredPayments(filtered);
    setPage(1);
  };
 
  const handleRemoveFilters = () => {
    setActiveFilters(null);
    setFilteredPayments(payments);
    setPage(1);
  };
 
  const handleSubmit = () => {
    router.push('/payments/create-payment/file-upload/success' as any);
  };
 
  return (
    <>
      <UserCard
        title="Payment file upload"
        icon={<Image src={PaperStack} alt="Paper Stack Icon" />}
        testId={buildTestId(testIdPrefix, 'list-card')}
        headerActions={
          <>
            {selectedIds.length > 0 && (
              <Button
                buttonVariant="tertiary"
                data-testid={buildTestId(testIdPrefix, 'remove-selected-button')}
                startIcon={<Image src={IcnBin} alt="Remove" width={24} height={24} />}
                onClick={() => setRemoveDialogOpen(true)}
                style={{ height: '48px', minHeight: '48px', width: '141px', fontWeight: 700, fontSize: '14px' }}
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
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => setFilterAnchorEl(event.currentTarget)}
              style={{ height: '48px', minHeight: '48px', width: '112px', fontWeight: 700, fontSize: '14px' }}
            >
              FILTER
            </Button>
          </>
        }
      >
        <div className={styles.paymentList} data-testid={buildTestId(testIdPrefix, 'payment-list')}>
          {paginatedPayments.length === 0 ? (
            <div className={styles.emptyState}>No payments found</div>
          ) : (
            paginatedPayments.map((payment) => (
              <PaymentRow
                key={payment.id}
                payment={payment}
                isSelected={selectedIds.includes(payment.id)}
                isExpanded={expandedIds.includes(payment.id)}
                onToggleSelect={handleToggleSelect}
                onToggleExpand={handleToggleExpand}
                onRemove={handleRemoveSingle}
              />
            ))
          )}
        </div>
 
        <CustomPagination
          rows={filteredPayments}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 15, 20, 50]}
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
              '& .MuiFormControl-root': { margin: 0, width: '100%' },
            }}
          >
            <Box data-testid={buildTestId(testIdPrefix, 'payment-type-select')}>
              <MultipleSelectChip
                label="Payment type"
                options={[
                  { label: 'Payment type 1', value: 'Payment type 1' },
                  { label: 'Payment type 2', value: 'Payment type 2' },
                  { label: 'Payment type 3', value: 'Payment type 3' },
                  { label: 'Payment type 4', value: 'Payment type 4' },
                ]}
                OnChange={(selectedItems: string[]) => handleChange('paymentTypeNames', selectedItems.join(', '))}
                placeholder="Payment type"
                error={false}
                helperText=""
                sx={{ height: '48px', minHeight: '48px' }}
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
          onClick={onCancel}
          data-testid={buildTestId(testIdPrefix, 'cancel-button')}
          startIcon={<Image src={IcnCloseIcon} alt="close" width={20} height={20} />}
          style={{ height: '48px', minHeight: '48px', width: '112px' }}
        >
          CANCEL
        </Button>
        <Button
          buttonVariant="primary"
          onClick={handleSubmit}
          data-testid={buildTestId(testIdPrefix, 'submit-button')}
          startIcon={<ArrowForwardIcon />}
          style={{ height: '48px', minHeight: '48px', width: '390px' }}
        >
          SUBMIT VALID PAYMENTS FOR APPROVAL
        </Button>
      </Box>
 
      <PaymentFilter
        open={filterOpen}
        anchorEl={filterAnchorEl}
        onClose={() => setFilterAnchorEl(null)}
        onApplyFilter={handleApplyFilter}
        testIdPrefix={buildTestId(testIdPrefix, 'filter-popover')}
      />
 
      <div data-testid={buildTestId(testIdPrefix, 'remove-dialog')}>
        <Dialog
          name="remove-payments-dialog"
          title="Remove Payments"
          open={removeDialogOpen}
          onClose={() => setRemoveDialogOpen(false)}
          content={
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
                {`${selectedIds.length} ${selectedIds.length === 1 ? 'payment' : 'payments'} marked for removal`}
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                {`Are you sure you want to remove the ${selectedIds.length} ${selectedIds.length === 1 ? 'payment' : 'payments'} selected?`}
              </Box>
            </Box>
          }
          secondaryCTALabel="YES, REMOVE THE SELECTED ITEMS"
          tertiaryCTALabel="CANCEL"
          onSecondaryCTA={handleRemoveBulk}
          onTertiaryCTA={() => setRemoveDialogOpen(false)}
          maxWidth="560px"
          secondaryCTAWidth="278px"
          secondaryCTAHeight="48px"
          tertiaryCTAWidth="82px"
          tertiaryCTAHeight="48px"
        />
      </div>
 
      <div style={{ display: 'none' }} data-testid={buildTestId(testIdPrefix, 'payment-type-values')}>
        {paymentTypeNames}
      </div>
    </>
  );
}
 
export default PaymentFileUpload;
 
 