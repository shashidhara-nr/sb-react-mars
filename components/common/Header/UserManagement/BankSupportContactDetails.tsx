'use client';

import {
  Popper,
  Paper,
  IconButton,
  Typography,
  Box,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TableWithTabWithRadio from '@molecules/TableWithTabWithRadio';
import { buildTestId } from 'src/utils/testIds';
import { mockBankSupportContacts } from '@lib/mock/mockUserManagement';


export interface BankSupportContactDetailsProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onApply: (values: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => void;
}

export const BANK_SUPPORT_COLUMNS = [
  'branchName',
  'contactType',
  'phone',
  'email',
  'country',
] as const;

export const BANK_SUPPORT_HEAD_CELLS = [
  { id: 'branchName', label: 'Branch Name', numeric: false },
  { id: 'contactType', label: 'Contact Type', numeric: false },
  { id: 'phone', label: 'Phone Number', numeric: false },
  { id: 'email', label: 'Email', numeric: false },
  { id: 'country', label: 'Country / Region', numeric: false },
];

const tableData = {
  columns: BANK_SUPPORT_COLUMNS,
  headCells: BANK_SUPPORT_HEAD_CELLS,
  rows: mockBankSupportContacts,
  rowButton: false,
  rowVariant: 'none',
  pageSize: 5,
  rowCount: mockBankSupportContacts.length,
};

export default function BankSupportContactDetails({
  open,
  anchorEl,
  onClose,
}: BankSupportContactDetailsProps) {
  const testIdPrefix = 'user-profile';

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-end"
      data-testid={buildTestId(testIdPrefix, 'bank-support-popper')}
    >
      <Paper
        sx={{
          width: 900,
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0px 20px 40px rgba(0,0,0,0.25)',
        }}
        data-testid={buildTestId(testIdPrefix, 'bank-support-dialog')}
      >
        {/* ================= HEADER ================= */}
        <Box
          sx={{
            height: 64,
            px: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#1434A4',
            color: '#FFFFFF',
          }}
          data-testid={buildTestId(testIdPrefix, 'bank-support-header')}
        >
          <Typography
            sx={{ fontSize: 18, fontWeight: 600 }}
            data-testid={buildTestId(testIdPrefix, 'bank-support-heading')}
          >
            Bank Support Contact Details
          </Typography>

          <IconButton
            onClick={onClose}
            sx={{ color: '#fff' }}
            data-testid={buildTestId(testIdPrefix, 'button-close-bank-support')}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* ================= BODY ================= */}
        <Box
          sx={{ px: 4, py: 3 }}
          data-testid={buildTestId(testIdPrefix, 'bank-support-body')}
        >
          <TableWithTabWithRadio
            tableData={tableData}
            onRowClick={() => {}}
            filterButtons={[]}
            selectedRows={[]}
            rightPanelButtons={undefined}
            onCheckboxClick={() => {}}
            onPageChange={() => {}}
            onPerPageChange={() => {}}
            showPagination={false}
            data-testid={buildTestId(testIdPrefix, 'bank-support-table')}
          />
        </Box>

        {/* ================= FOOTER ================= */}
        <Box
          sx={{
            px: 4,
            py: 1.5,
            borderTop: '1px solid #E5E7EB',
            display: 'flex',
            justifyContent: 'flex-end',
            backgroundColor: '#F9FAFB',
          }}
          data-testid={buildTestId(testIdPrefix, 'bank-support-footer')}
        >
          <Button
            variant="text"
            sx={{ fontWeight: 600, color: '#2563EB' }}
            onClick={onClose}
            data-testid={buildTestId(testIdPrefix, 'button-close-bank-support-footer')}
          >
            CLOSE
          </Button>
        </Box>
      </Paper>
    </Popper>
  );
}