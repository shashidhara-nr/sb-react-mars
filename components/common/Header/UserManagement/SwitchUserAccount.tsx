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
import { useMemo, useState } from 'react';
import TableWithTab from '@molecules/TableWithTabWithRadio';
import { buildTestId } from 'src/utils/testIds';
import Image from 'next/image';
import { AlertCircle } from 'public/icons';
import { rows } from '@lib/mock/mockUserManagement';

/* ------------------------------------------------------------------ */
/* TYPES                                                              */
/* ------------------------------------------------------------------ */

interface SwitchUserRow {
  id: string;
  customerName: string;
  userAccount: string;
  lastAccessed: string;
}

interface SwitchUserAccountProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onApply: (selectedRow: SwitchUserRow) => void;
}

/* ------------------------------------------------------------------ */
/* TABLE CONFIG                                                       */
/* ------------------------------------------------------------------ */

const tableData = {
  columns: [
    { key: 'customerName', type: 'radioText' },
    'userAccount',
    'lastAccessed',
  ],
  headCells: [
    { id: 'customerName', label: 'Customer name', numeric: false },
    { id: 'userAccount', label: 'User account', numeric: false },
    { id: 'lastAccessed', label: 'Last accessed on', numeric: false },
  ],
  rows,
  rowVariant: 'radio',
  pageSize: 5,
  rowCount: rows.length,
};

const currentUser = {
  id: '3',
  customerName: 'TPS BAS South Africa Profile',
  userAccount: 'Lerato Serobatse',
  lastAccessed: '11 September 2025, 14:50:52',
};

/* ------------------------------------------------------------------ */
/* COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export default function SwitchUserAccount({
  open,
  anchorEl,
  onClose,
  onApply,
}: SwitchUserAccountProps) {
  const testIdPrefix = 'user-profile';

  const [selectedId, setSelectedId] = useState<string>('1');
  const [showAlreadySelectedState, setShowAlreadySelectedState] =
    useState<boolean>(false);

  const selectedRow = useMemo(
    () => rows.find(r => r.id === selectedId) ?? rows[0],
    [selectedId]
  );

  const handleSubmit = () => {
    if (selectedId === currentUser.id) {
      setShowAlreadySelectedState(true);
      return;
    }
    onApply(selectedRow);
  };

  const handleOk = () => {
    setShowAlreadySelectedState(false);
  };

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-start"
      data-testid={buildTestId(testIdPrefix, 'switch-user-popper')}
    >
      <Paper
        sx={{
          width: 900,
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0px 20px 40px rgba(0,0,0,0.25)',
        }}
        data-testid={buildTestId(testIdPrefix, 'switch-user-dialog')}
      >
        {/* ================= HEADER ================= */}
        <Box
          sx={{
            height: 64,
            px: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: '#1434A4',
            color: '#fff',
          }}
          data-testid={buildTestId(testIdPrefix, 'switch-user-header')}
        >
          <Typography
            fontSize={18}
            fontWeight={600}
            data-testid={buildTestId(testIdPrefix, 'switch-user-heading')}
          >
            {showAlreadySelectedState
              ? 'Account selected'
              : 'Switch User Account'}
          </Typography>

          <IconButton
            onClick={onClose}
            sx={{ color: '#fff' }}
            data-testid={buildTestId(testIdPrefix, 'button-close-switch-user')}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* ================= BODY ================= */}
        {!showAlreadySelectedState ? (
          <Box
            sx={{ display: 'flex', px: 3, pt: 3 }}
            data-testid={buildTestId(testIdPrefix, 'switch-user-body')}
          >
            <Box sx={{ flex: 1 }}>
              <TableWithTab
                tableData={tableData}
                selectedRows={[selectedId]}
                onRowClick={(row) => setSelectedId(row.id)}
                filterButtons={[]}
                rightPanelButtons={undefined}
                onCheckboxClick={() => {}}
                onPageChange={() => {}}
                onPerPageChange={() => {}}
                showHeader
                showPagination
                data-testid={buildTestId(testIdPrefix, 'switch-user-table')}
              />
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              px: 6,
              py: 6,
              textAlign: 'center',
            }}
            data-testid={buildTestId(testIdPrefix, 'account-in-use')}
          >
            <Image src={AlertCircle} alt="Info" width={50} height={50} color='#FAA0A0'/>
            <Typography fontSize={20} fontWeight={600} mb={2}>
              Account already in use
            </Typography>

            <Typography color="#6B7280">
              This user account is the same as the current user account. Please
              select another user account.
            </Typography>
          </Box>
        )}

        {/* ================= FOOTER ================= */}
        <Box
          sx={{
            px: 4,
            py: 1.5,
            borderTop: '1px solid #E5E7EB',
            display: 'flex',
            justifyContent: showAlreadySelectedState ? 'flex-end' : 'space-between',
            backgroundColor: '#F9FAFB',
          }}
          data-testid={buildTestId(testIdPrefix, 'switch-user-footer')}
        >
          {showAlreadySelectedState ? (
            <Button
              variant="text"
              sx={{ fontWeight: 600, color: '#2563EB' }}
              onClick={handleOk}
              data-testid={buildTestId(testIdPrefix, 'button-ok')}
            >
              OK
            </Button>
          ) : (
            <>
              <Button
                variant="text"
                sx={{ fontWeight: 600, color: '#2563EB' }}
                onClick={onClose}
                data-testid={buildTestId(testIdPrefix, 'button-cancel-switch-user')}
              >
                CANCEL
              </Button>

              <Button
                variant="text"
                sx={{ fontWeight: 600, color: '#2563EB' }}
                onClick={handleSubmit}
                data-testid={buildTestId(testIdPrefix, 'button-submit-switch-user')}
              >
                SUBMIT
              </Button>
            </>
          )}
        </Box>
      </Paper>
    </Popper>
  );
}