'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Checkbox,
  Select,
  MenuItem,
  Stack,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LockIcon from '@mui/icons-material/Lock';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useTranslations } from 'next-intl';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import styles from './ManageTokenDrawer.module.scss';
import Image from 'next/image';
import { IcnCashDeposit, IcnPeopleNameTag } from 'public/icons';
import TableWithTab from '@molecules/TableWithTab';
import { mockUserManagePassword, mockVasCogToken } from '@lib/mock/mockUserDetails';

const drawerWidth = 692;

const STRONG_AUTH_TABLE_COLUMNS = ['credentials', 'status'] as const;
const VAS_COG_TOKEN_TABLE_COLUMNS = ['credentials', 'status'] as const;
const DEVICES_TABLE_COLUMNS = ['name', { key: 'action', type: 'link' }] as const;

interface Device {
  id: string;
  name: string;
  action: {
    href: string;
    text: string;
  };
}

interface ManageTokenDrawerProps {
  open: boolean;
  onClose: () => void;
}

const DEFAULT_DEVICES: Device[] = [
  {
    id: '1',
    name: 'iPhone 14 Pro',
    action: {
      href: `#`,
      text: 'REMOVE DEVICES',
    },
  },
  {
    id: '2',
    name: 'iPhone 14 Pro',
    action: {
      href: `#`,
      text: 'REMOVE DEVICES',
    },
  },
  {
    id: '3',
    name: 'iPhone 14 Pro',
    action: {
      href: `#`,
      text: 'REMOVE DEVICES',
    },
  },
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index } = props;

  return (
    <div hidden={value !== index}>{value === index && <Box sx={{ pt: 2 }}>{children}</Box>}</div>
  );
};

const ManageTokenDrawer: React.FC<ManageTokenDrawerProps> = ({ open, onClose }) => {
  const t = useTranslations('userDetails');
  const rowsPerPage = 10;
  const totalRows = 100;

  const [page, setPage] = React.useState(0); // zero-based

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };
  const [activeTab, setActiveTab] = useState(0);
  const [devicePage, setDevicePage] = useState(1);
  const devicesPerPage = 10;
  const totalDevices = 20;
  const totalDevicePages = Math.ceil(totalDevices / devicesPerPage);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleRemoveToken = useCallback(() => {
    console.log('Remove token clicked');
  }, []);

  const handleBackUp = useCallback(() => {
    console.log('Back up clicked');
  }, []);

  const handleDecline = useCallback(() => {
    console.log('Decline clicked');
  }, []);

  const handleRemoveDevice = useCallback((deviceId: string) => {
    console.log('Remove device:', deviceId);
  }, []);

  const handleSave = useCallback(() => {
    console.log('Save clicked');
    onClose();
  }, [onClose]);

  // Memoize filtered rows
  const mappedRows = useMemo(() => {
    return mockUserManagePassword.slice(0, 1);
  }, []);

  // Memoize filtered rows
  const vasCogTokenMappedRows = useMemo(() => {
    // return mockVasCogToken.map((item) => ({
    //   ...item,
    //   credentials: { label: 'error counter', age: '0',name1: 're sync counter', age1: '0',name2: 're sync counter', age2: '0' },
    //   status: { name: 'error counter', age: '0',name1: 're sync counter', age1: '0',name2: 're sync counter', age2: '0' },
    // }));
    return mockVasCogToken.slice(0, 1);
  }, []);

  // Memoize filtered rows
  const devicesMappedRows = useMemo(() => {
    return DEFAULT_DEVICES;
  }, []);
  // Memoize table head cells
  const strongPasswordTableHeadCells = useMemo(
    () => [
      { id: 'credentials', label: t('credentials'), numeric: false },
      { id: 'status', label: t('status'), numeric: false },
    ],
    [t],
  );

  // Memoize table head cells
  const vasCogTokenTableHeadCells = useMemo(
    () => [
      { id: 'credentials', label: t('credentials'), numeric: false },
      { id: 'status', label: t('status'), numeric: false },
    ],
    [t],
  );

  const DevicesTableHeadCells = useMemo(
    () => [
      { id: 'name', label: t('deviceName'), numeric: false },
      //   { id: 'action', label: t('removeDevice'), numeric: false },
      {
        id: 'action',
        label: t('removeDevice'),
        numeric: false,
        type: 'link',
        disableSort: true,
      },
    ],
    [t],
  );

  const tableAdditionalCells = useMemo(
    () => [
      {
        id: 'errorCounter',
        labelVariant: 'h5',
        valueVariant: 'h5',
        label: t('errorCounter'),
        numeric: false,
      },
      {
        id: 'reSyncCounter',
        labelVariant: 'h5',
        valueVariant: 'h5',
        label: t('reSyncCounter'),
        numeric: false,
      },
      {
        id: 'backupUseCount',
        labelVariant: 'h5',
        valueVariant: 'h5',
        label: t('backupUseCount'),
        numeric: false,
      },
      {
        id: 'backupReissueExtensionCounter',
        labelVariant: 'h5',
        valueVariant: 'h5',
        label: t('backupReissueExtensionCounter'),
        numeric: false,
      },
    ],
    [t],
  );
  const strongAuthTableData = useMemo(
    () => ({
      columns: STRONG_AUTH_TABLE_COLUMNS,
      headCells: strongPasswordTableHeadCells,
      rowButton: false,
      // additionalCells: tableAdditionalCells,
      rows: mappedRows,
      pageSize: 15,
      rowCount: mappedRows.length,
      // rowVariant: 'dropdown',
    }),
    [strongPasswordTableHeadCells, mappedRows],
  );
  const devicesTableData = useMemo(
    () => ({
      columns: DEVICES_TABLE_COLUMNS,
      headCells: DevicesTableHeadCells,
      rowButton: false,
      // additionalCells: tableAdditionalCells,
      rows: devicesMappedRows,
      pageSize: 15,
      rowCount: devicesMappedRows.length,
      // rowVariant: 'dropdown',
    }),
    [DevicesTableHeadCells, devicesMappedRows],
  );

  const vasCogTokenTableData = useMemo(
    () => ({
      columns: VAS_COG_TOKEN_TABLE_COLUMNS,
      headCells: vasCogTokenTableHeadCells,
      rowButton: false,
      additionalCells: tableAdditionalCells,
      rows: vasCogTokenMappedRows,
      pageSize: 15,
      rowCount: vasCogTokenMappedRows.length,
      rowVariant: 'dropdown',
    }),
    [vasCogTokenTableHeadCells, vasCogTokenMappedRows, tableAdditionalCells],
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
      {/* Sticky Header */}
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

      {/* Main Content */}
      <Box sx={{ flex: 1, p: 3, overflowY: 'auto' }}>
        {/* Manage Token Card */}
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          {/* Card Header */}
          <CardHeader
            title={t('manageToken')}
            avatar={<Image src={IcnPeopleNameTag} alt="Bank details" width={24} height={24} />}
            sx={{ borderBottom: '1px solid grey' }}
          ></CardHeader>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ borderBottom: '1px solid #e8e8e8', backgroundColor: '#ffffff' }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#616161',
                    '&.Mui-selected': {
                      color: '#1976d2',
                      fontWeight: 600,
                    },
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#1976d2',
                  },
                }}
              >
                <Tab label={t('strongAuthentication') || 'Strong authentication'} />
                <Tab label="Vascogo3 token" />
              </Tabs>
            </Box>
          </CardContent>
          {/* Tabs */}

          {/* Tab Panel 1: Strong Authentication */}
          <TabPanel value={activeTab} index={0}>
            <CardContent
              className={styles.cardContent}
              sx={{
                padding: '0 20px 20px 20px',
                backgroundColor: '#ffffff',
              }}
            >
              {/* Credential Table
              <TableContainer sx={{ mb: '24px' }}>
                <Table
                  sx={{
                    minWidth: '750px',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <TableHead>
                    <TableRow
                      sx={{
                        backgroundColor: '#f9f9f9',
                        borderBottom: '1px solid #e8e8e8',
                      }}
                    >
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          fontSize: '13px',
                          padding: '14px 18px',
                          color: '#616161',
                          textTransform: 'capitalize',
                          letterSpacing: '0.2px',
                        }}
                      >
                        {t('credential') || 'Credential'}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          fontSize: '13px',
                          padding: '14px 18px',
                          color: '#616161',
                          textAlign: 'right',
                          textTransform: 'capitalize',
                          letterSpacing: '0.2px',
                        }}
                      >
                        {t('status') || 'Status'}
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    <TableRow
                      sx={{
                        '&:hover': {
                          backgroundColor: '#fafafa',
                        },
                        borderBottom: '1px solid #e8e8e8',
                      }}
                    >
                      <TableCell
                        sx={{
                          padding: '14px 18px',
                          fontSize: '13px',
                          color: '#212121',
                          fontWeight: 500,
                        }}
                      >
                        Token
                      </TableCell>
                      <TableCell
                        sx={{
                          padding: '14px 18px',
                          fontSize: '13px',
                          color: '#212121',
                          textAlign: 'right',
                          fontWeight: 500,
                        }}
                      >
                        Awaiting token credentials
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer> */}
              <TableWithTab
                tableData={strongAuthTableData}
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
              {/* Checkboxes */}
              <Box sx={{ mb: 1, ml: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Checkbox defaultChecked />
                  <Typography sx={{ fontSize: '13px', color: '#212121' }}>
                    {t('enableStrongAuth') || 'Enable strong authentication for this user'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Checkbox defaultChecked />
                  <Typography sx={{ fontSize: '13px', color: '#212121' }}>
                    {t('useMobileAsSingleAuth') || 'Use mobile app as login authentication only'}
                  </Typography>
                </Box>
              </Box>

              {/* Form Fields Grid */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 3,
                  mb: '20px',
                  ml: 2,
                }}
              >
                <Box>
                  <Typography sx={{ fontSize: '13px', color: '#616161', mb: 1 }}>
                    {t('errorCounter') || 'Error counter'}
                  </Typography>
                  <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#212121' }}>
                    0
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '13px', color: '#616161', mb: 1 }}>
                    {t('reSyncCounter') || 'Re-sync counter'}
                  </Typography>
                  <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#212121' }}>
                    0
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '13px', color: '#616161', mb: 1 }}>
                    {t('backupUseCount') || 'Backup use count'}
                  </Typography>
                  <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#212121' }}>
                    0
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '13px', color: '#616161', mb: 1 }}>
                    {t('backupReissueExtensionCounter') || 'Backup reissue extension counter'}
                  </Typography>
                  <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#212121' }}>
                    0
                  </Typography>
                </Box>
              </Box>

              {/* Devices Card Nested Inside */}
              <Card
                variant="outlined"
                sx={{
                  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid #e8e8e8',
                  mt: '20px',
                }}
              >
                {/* Card Header */}
                <CardHeader
                  title={t('devices')}
                  avatar={
                    <Image src={IcnPeopleNameTag} alt="Bank details" width={24} height={24} />
                  }
                  sx={{ borderBottom: '1px solid grey' }}
                ></CardHeader>

                {/* Card Content - Table */}
                <CardContent
                  sx={{
                    padding: '0px',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <TableWithTab
                    tableData={devicesTableData}
                    filterButtons={[]}
                    selectedRows={[]}
                    onCheckboxClick={() => {}}
                    onRowClick={(rowData: any) => console.log('rowData', rowData)}
                    rightPanelButtons={null}
                    onPageChange={handlePageChange}
                    onPerPageChange={() => {}}
                    hideTableHeader
                  />
                </CardContent>
              </Card>
            </CardContent>
          </TabPanel>

          {/* Tab Panel 2: Vascogo3 Token */}
          <TabPanel value={activeTab} index={1}>
            <Card>
              <CardContent
                sx={{
                  padding: 2,
                  backgroundColor: '#ffffff',
                }}
              >
                <TableWithTab
                  tableData={vasCogTokenTableData}
                  filterButtons={[]}
                  selectedRows={[]}
                  onCheckboxClick={() => {}}
                  onRowClick={(rowData: any) => console.log('rowData', rowData)}
                  rightPanelButtons={null}
                  onPageChange={handlePageChange}
                  onPerPageChange={() => {}}
                  hideTableHeader
                  hidePagination
                  additionalCellsProps={{
                    additionalCellsStyle: {
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 3,
                      mb: '20px',
                      ml: 2,
                      pt: 2,
                    },
                    removeDefaultStyle: true,
                  }}
                />
              </CardContent>
              {/* Card Actions */}
              <Divider sx={{ mx: 2 }} />
              <CardActions
                sx={{
                  //   px: 2,
                  //   pb: 2,
                  justifyContent: 'flex-end',
                }}
              >
                <Button variant="text" onClick={handleRemoveToken}>
                  {t('resetPassword')}
                </Button>
                <Button variant="text" onClick={handleRemoveToken}>
                  {t('activate')}
                </Button>
                <Button variant="text" onClick={handleRemoveToken}>
                  {t('re-sync')}
                </Button>
                <Button variant="text" onClick={handleRemoveToken}>
                  {t('de-link')}
                </Button>
                <Button variant="text" onClick={handleBackUp}>
                  {t('decline')}
                </Button>
                <Button variant="text" onClick={handleDecline}>
                  {t('lock')}
                </Button>
              </CardActions>
            </Card>
          </TabPanel>
        </Card>
      </Box>

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
};

export default ManageTokenDrawer;
