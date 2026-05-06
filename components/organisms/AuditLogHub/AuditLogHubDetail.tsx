'use client';
import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import styles from './AuditLogHub.module.scss';
import TableWithTab from '@molecules/TableWithTab';
import { Icon } from '@atoms/index';
import { Grid, InputAdornment, TextField, useTheme, Box, Typography } from '@mui/material';
import { BreadcrumbList } from 'components/lib/Page/Breadcrumb';
import { Heading } from 'components/lib/Page';
import { mockAuditLogHubDetailData } from '@lib/mock/mockAuditLogHub';

const TABLE_COLUMNS = [
  'auditRecords'
] as const;

const AuditLogHubDetail = () => {
  const t = useTranslations('auditLogHub');
  const theme = useTheme();
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);

  // Memoize filtered rows
  const mappedRows = useMemo(() => {
    let filtered = mockAuditLogHubDetailData as any[];

    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        (row: any) =>
          row?.accountBalance?.name?.toLowerCase().includes(search) ||
          row?.accountBalance?.accountNumber?.toLowerCase().includes(search),
      );
    }

    const withAccountDetails = filtered.map((row: any) => ({
      ...row
    }));

    return withAccountDetails;
  }, [searchText]);


  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const handlePerPageChange = useCallback((newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  }, []);

  // Memoize table head cells
  const tableHeadCells = useMemo(
    () => [
      { id: 'auditRecords', label: t('auditRecords'), numeric: false }
    ],
    [t],
  );

  // Memoize table data
  const tableData = useMemo(
    () => ({
      columns: TABLE_COLUMNS,
      headCells: tableHeadCells,
      rowButton: false,
      rows: mockAuditLogHubDetailData,
      pageSize: 15,
      rowCount: mockAuditLogHubDetailData.length,
      rowVariant: 'default'
    }),
    [tableHeadCells],
  );

  const breadcrumbLinks = useMemo(
    () => [
      { href: '/', label: t('dashboard') },
      { href: '/audit-log-hub', label: t('auditLogs') },
      { href: '/audit-log-hub/details', label: t('auditLogDetails') },
    ],
    [t],
  );

  return (
    <section className={styles.container}>
      <BreadcrumbList links={breadcrumbLinks} />
      <Grid
        size={12}
        className={styles.headerRow}
        sx={{ mb: 2 }}
      >
        <Heading as="h4" fontSize="28px">
          {t('auditLog')}
        </Heading>
      </Grid>
      <section className={styles.tabContent}>
        {/* Main container with two sections */}
        <Box className={styles.detailsContainer}>
          {/* Top section with two heading cards */}
          <div className={styles.headerCardsRow}>
            {/* Username Card */}
            <div className={styles.cardBox}>
              <Box className={styles.cardIconBox}>
                <Icon name="userAccount" width={'40'} height={'40'} bgColor='#02070D' />
              </Box>
              <Box>
                <Typography className={styles.cardLabel} variant="body2">
                  {t('username')}
                </Typography>
                <Typography className={styles.cardValue} variant="body1">
                  [Username]
                </Typography>
              </Box>
            </div>

            {/* Customer Name Card */}
            <div className={styles.cardBox}>
              <Box className={styles.cardIconBox}>
                <Icon name="userAccount" width={'40'} height={'40'} bgColor='#02070D' />
              </Box>
              <Box>
                <Typography className={styles.cardLabel} variant="body2">
                  {t('customerName')}
                </Typography>
                <Typography className={styles.cardValue} variant="body1">
                  [Customer name]
                </Typography>
              </Box>
            </div>
          </div>

          {/* Bottom section with details fields */}
          <Box className={styles.detailsFieldsBox}>
            <div className={styles.detailsFieldsGrid}>
              <div>
                <Typography className={styles.fieldLabel} variant="caption">
                  {t('userId')}
                </Typography>
                <Typography className={styles.fieldValue} variant="body2">
                  [User ID]
                </Typography>
              </div>
              <div>
                <Typography className={styles.fieldLabel} variant="caption">
                  {t('userAccountName')}
                </Typography>
                <Typography className={styles.fieldValue} variant="body2">
                  [User account name]
                </Typography>
              </div>
              <div>
                <Typography className={styles.fieldLabel} variant="caption">
                  {t('entityName')}
                </Typography>
                <Typography className={styles.fieldValue} variant="body2">
                  [Entity name]
                </Typography>
              </div>
              <div>
                <Typography className={styles.fieldLabel} variant="caption">
                  {t('entityType')}
                </Typography>
                <Typography className={styles.fieldValue} variant="body2">
                  [Entity type]
                </Typography>
              </div>
              <div>
                <Typography className={styles.fieldLabel} variant="caption">
                  {t('functionType')}
                </Typography>
                <Typography className={styles.fieldValue} variant="body2">
                  [Function type]
                </Typography>
              </div>
              <div>
                <Typography className={styles.fieldLabel} variant="caption">
                  {t('dateTime')}
                </Typography>
                <Typography className={styles.fieldValue} variant="body2">
                  DD/MM/YYYY. HH:MM
                </Typography>
              </div>
            </div>
          </Box>
        </Box>
      </section>
      <Grid size={12} className={styles.searchRow}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={t('searchActivities')}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          InputProps={
            {
              startAdornment: (
                <InputAdornment position="start"><Icon name="search" width='32' height='32' bgColor={theme.palette.navy.main} /></InputAdornment>
              ),
            }
          }
          className={styles.searchField}
        />
      </Grid>
      <section className={styles.tableContainer}>
        <TableWithTab
          tableData={tableData}
          filterButtons={[]}
          selectedRows={[]}
          onCheckboxClick={() => { }}
          onRowClick={(rowData: any) => console.log('rowData', rowData)}
          rightPanelButtons={[]}
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
        />
      </section>
    </section>

  );
};
export default AuditLogHubDetail;
