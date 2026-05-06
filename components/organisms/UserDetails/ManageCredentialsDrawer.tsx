import {
  Box,
  Drawer,
  Typography,
  IconButton,
  Divider,
  Card,
  CardContent,
  Button,
  Stack,
  CardActions,
  CardHeader,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import React, { useMemo } from 'react';
import TableWithTab from '@molecules/TableWithTab';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { mockUserManagePassword } from '@lib/mock/mockUserDetails';
import { IcnCashDeposit, IcnPeopleNameTag } from 'public/icons';

const drawerWidth = 692;
const TABLE_COLUMNS = [
  'credentials',
  'lastPasswordChanged',
  'failedLoginAttempts',
  'status',
] as const;

export default function ManageCredentialsDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations('userDetails');
  const rowsPerPage = 10;
  const totalRows = 100;

  const [page, setPage] = React.useState(0); // zero-based

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Memoize filtered rows
  const mappedRows = useMemo(() => {
    return mockUserManagePassword;
  }, []);
  // Memoize table head cells
  const tableHeadCells = useMemo(
    () => [
      { id: 'credentials', label: t('credentials'), numeric: false },
      { id: 'lastPasswordChanged', label: t('lastPasswordChanged'), numeric: false },
      { id: 'failedLoginAttempts', label: t('failedLoginAttempts'), numeric: false },
      { id: 'status', label: t('status'), numeric: false },
    ],
    [t],
  );

  // const tableAdditionalCells = useMemo(
  //   () => [
  //     { id: 'credentials', label: 'credentials', numeric: false },
  //     { id: 'lastPasswordChanged', label: 'lastPasswordChanged', numeric: false },
  //     { id: 'failedLoginAttempts', label: 'failedLoginAttempts', numeric: false },
  //     { id: 'status', label: 'status', numeric: false,},
  //   ],
  //   [],
  // );
  const tableData = useMemo(
    () => ({
      columns: TABLE_COLUMNS,
      headCells: tableHeadCells,
      rowButton: false,
      // additionalCells: tableAdditionalCells,
      rows: mappedRows,
      pageSize: 15,
      rowCount: mappedRows.length,
      // rowVariant: 'dropdown',
    }),
    [tableHeadCells, mappedRows],
  );
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: drawerWidth,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#f5f5f5',
          },
        },
      }}
    >
      {/* ================= Header ================= */}
      <Box
        sx={{
          px: 3,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack
          direction="row"
          spacing={3}
          alignItems="center"
          justifyContent={'space-between'}
          width={'90%'}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
            <Image src={IcnCashDeposit} alt="Bank details" width={24} height={24} />
            <Typography variant="h4">{t('manageCredentials')}</Typography>
          </Box>

          {/* Pagination Controls */}
          <Stack direction="row" spacing={1} alignItems="center" ml={'auto'}>
            <IconButton
              size="small"
              disabled={page === 0}
              onClick={() => handlePageChange(page - 1)}
            >
              <ExpandLessIcon />
            </IconButton>

            <Typography color="primary" fontWeight={600}>
              {page + 1}
            </Typography>

            <Typography>{Math.ceil(totalRows / rowsPerPage)}</Typography>

            <IconButton
              size="small"
              disabled={(page + 1) * rowsPerPage >= totalRows}
              onClick={() => handlePageChange(page + 1)}
            >
              <ExpandMoreIcon color="primary" />
            </IconButton>

            <Typography variant="body2" sx={{ ml: 2 }}>
              Row {page * rowsPerPage + 1} of {totalRows}
            </Typography>
          </Stack>
        </Stack>

        <Box textAlign="right">
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      <Divider />

      {/* ================= Content ================= */}
      <Box sx={{ flex: 1, p: 3, overflowY: 'auto' }}>
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardHeader
            title={t('managePassword')}
            avatar={<Image src={IcnPeopleNameTag} alt="Bank details" width={24} height={24} />}
            sx={{ borderBottom: '1px solid grey' }}
          ></CardHeader>
          <CardContent>
            <TableWithTab
              tableData={tableData}
              filterButtons={[]}
              selectedRows={[]}
              onCheckboxClick={() => {}}
              onRowClick={(rowData: any) => console.log('rowData', rowData)}
              rightPanelButtons={null}
              onPageChange={handlePageChange}
              onPerPageChange={() => {}}
              hidePagination
              hideTableHeader
            />
          </CardContent>
          <CardActions
            sx={{
              px: 2,
              pb: 2,
              justifyContent: 'flex-end',
              gap: 3,
            }}
          >
            <Button variant="text">{t('resetPassword')}</Button>
            <Button variant="text">{t('activate')}</Button>
            <Button variant="text">{t('lock')}</Button>
          </CardActions>
        </Card>
      </Box>

      <Divider />

      {/* ================= Footer ================= */}
      <Box
        sx={{
          px: 3,
          py: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Button variant="text" startIcon={<CloseIcon />} onClick={onClose}>
          {t('close')}
        </Button>

        <Stack direction="row" spacing={2}>
          <Button variant="outlined">{t('backUp')}</Button>
          <Button variant="contained">{t('save')}</Button>
        </Stack>
      </Box>
    </Drawer>
  );
}
