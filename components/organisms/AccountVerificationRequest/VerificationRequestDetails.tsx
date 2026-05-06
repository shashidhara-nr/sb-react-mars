'use client';
import { useMemo, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import styles from './BillingAccounts.module.scss';
import { Grid, Box, Accordion, AccordionSummary, AccordionDetails, Typography, InputAdornment, TextField } from '@mui/material';
import { BreadcrumbList } from 'components/lib/Page/Breadcrumb';
import { Heading } from 'components/lib/Page';
import { Icon } from '@atoms/index';
import { Button } from 'components/lib/Forms';
import { mockAccountVerificationRequest, mockVerificationRequestBatchData } from '@lib/mock/mockAccountVerificationRequest';
import CustomPagination from 'components/lib/Tables/TablePagination';
import theme from 'components/lib/styles/theme';
import DownloadDebtorDialog from '@molecules/DownloadDebtorDialog/DownloadDebtorDialog';
import VerificationRequestBatchFilterDialog, { VerificationBatchFilterValues } from './VerificationRequestBatchFilterDialog';

const VerificationRequestDetails = () => {
  const t = useTranslations('accountVerificationRequest');
  const router = useRouter();
  
  // Mock data - in real app this would come from API/query params
  const verificationRequest = mockAccountVerificationRequest[0];
  
  // State for verification request batch list
  const [searchText, setSearchText] = useState('');
  const [expandCollapseIndex, setExpandCollapseIndex] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState<15 | 30 | 50>(15);
  const [accountList] = useState<any[]>(mockVerificationRequestBatchData);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<HTMLElement | null>(null);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);
  const [filterValues, setFilterValues] = useState<VerificationBatchFilterValues>({
    accountNumber: '',
    idNumber: '',
    lastName: '',
    status: '',
    submissionMechanism: '',
  });
  const batchContainerRef = useRef<HTMLDivElement>(null);

  const breadcrumbLinks = useMemo(
    () => [
      { href: '/', label: t('dashboard') },
      { href: '/account-verification-request', label: t('accountVerificationRequest') }, 
      { href: '/verification-request-details', label: t('verificationRequestDetails') },
    ],
    [t],
  );

  const handlePageChange = (_: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
    setExpandCollapseIndex(null);
  };

  const handleRowsPerPageChange = (newPerPage: number) => {
    if (newPerPage === 15 || newPerPage === 30 || newPerPage === 50) {
      setPerPage(newPerPage);
      setPage(0);
      setExpandCollapseIndex(null);
    }
  };

  const handleDownloadOpen = useCallback(() => {
    setDownloadDialogOpen(true);
    setDownloadAnchorEl(batchContainerRef.current);
  }, []);

  const handleDownloadClose = useCallback(() => {
    setDownloadDialogOpen(false);
    setDownloadAnchorEl(null);
  }, []);

  const handleDownload = useCallback(({ format, sortBy }: any) => {
    // Prepare data - sort if needed
    let dataToExport = [...accountList];
    if (sortBy === 'descending') {
      dataToExport.reverse();
    }

    // Generate content based on format
    let content = '';
    let mimeType = '';
    let fileExtension = '';

    if (format === 'csv') {
      // CSV format
      const headers = [
        'Account Number',
        'Last Name / Company Name',
        'ID Number',
        'Status',
        'Email Address',
        'Telephone Number',
        'Account Name',
        'Account Status',
        'Branch / Sort Code'
      ];
      
      const csvRows = dataToExport.map((account: any) => [
        account.accountNumber || '',
        account.lastName || '',
        account.idNumber || '',
        account.status || '',
        account.emailAddress || '',
        account.telephoneNumber || '',
        account.accountName || '',
        account.accountStatus || '',
        account.branchSortCode || ''
      ].map(cell => `"${cell}"`).join(','));

      content = [headers.join(','), ...csvRows].join('\n');
      mimeType = 'text/csv;charset=utf-8;';
      fileExtension = 'csv';
    } else if (format === 'txt') {
      // TXT format
      const txtRows = dataToExport.map((account: any, index: number) => 
        `Record ${index + 1}:\n` +
        `  Account Number: ${account.accountNumber}\n` +
        `  Last Name / Company Name: ${account.lastName}\n` +
        `  ID Number: ${account.idNumber}\n` +
        `  Status: ${account.status}\n` +
        `  Email Address: ${account.emailAddress}\n` +
        `  Telephone Number: ${account.telephoneNumber}\n` +
        `  Account Name: ${account.accountName}\n` +
        `  Account Status: ${account.accountStatus}\n` +
        `  Branch / Sort Code: ${account.branchSortCode}\n`
      );
      
      content = txtRows.join('\n');
      mimeType = 'text/plain;charset=utf-8;';
      fileExtension = 'txt';
    } else if (format === 'pdf') {
      // PDF format (simplified - in production you'd use a library like jsPDF)
      const pdfRows = dataToExport.map((account: any, index: number) => 
        `${index + 1}. Account: ${account.accountNumber} | ${account.lastName} | ${account.status}`
      );
      
      content = `Verification Request Batch Export\n\n` + pdfRows.join('\n');
      mimeType = 'application/pdf;charset=utf-8;';
      fileExtension = 'txt'; // Using txt for simplified PDF
    }

    // Create blob and download
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `verification-request-batch-${verificationRequest.batchId}-${new Date().toISOString().split('T')[0]}.${fileExtension}`;
    link.click();
    URL.revokeObjectURL(url);

    // Close dialog
    setDownloadDialogOpen(false);
    setDownloadAnchorEl(null);
  }, [accountList, verificationRequest.batchId]);

  const handleFilterOpen = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterDialogOpen(true);
    setFilterAnchorEl(event.currentTarget);
  }, []);

  const handleFilterClose = useCallback(() => {
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
  }, []);

  const handleFilterApply = useCallback((values: VerificationBatchFilterValues) => {
    setFilterValues(values);
    setPage(0);
    setExpandCollapseIndex(null);
    handleFilterClose();
  }, []);

  // Combine search and filter logic
  const filteredAndSearchedAccountList = useMemo(() => {
    return accountList.filter((account: any) => {
      // Search filter
      const searchLower = searchText.toLowerCase();
      const matchesSearch = 
        !searchText ||
        account.accountNumber?.toLowerCase().includes(searchLower) ||
        account.lastName?.toLowerCase().includes(searchLower) ||
        account.idNumber?.toLowerCase().includes(searchLower) ||
        account.accountName?.toLowerCase().includes(searchLower) ||
        account.emailAddress?.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      // Filter logic
      if (filterValues.accountNumber && !account.accountNumber?.includes(filterValues.accountNumber)) return false;
      if (filterValues.idNumber && !account.idNumber?.includes(filterValues.idNumber)) return false;
      if (filterValues.lastName && !account.lastName?.toLowerCase().includes(filterValues.lastName.toLowerCase())) return false;
      if (filterValues.status && account.status !== filterValues.status) return false;
      if (filterValues.submissionMechanism && account.submissionMethod !== filterValues.submissionMechanism) return false;

      return true;
    });
  }, [accountList, searchText, filterValues]);

  return (
    <section className={styles.container}>
      <BreadcrumbList links={breadcrumbLinks} />
      
      {/* Header with title and button */}
      <Grid container size={12} className={styles.headerRow} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Grid>
          <Heading as="h4" fontSize="28px">
            [{verificationRequest.batchId}] {t('verificationRequestDetails')}
          </Heading>
        </Grid>
        <Grid>
         <Button
          buttonVariant="secondary"
          startIcon={<Icon name="add" width="24" height="24" bgColor='#0051FF' />}
          onClick={() => router.push('/account-verification-request/create' as any)}
        >
          {t('createVerificationRequest')}
        </Button>

        </Grid>
      </Grid>

      {/* Batch ID Section */}
      <Box className={styles.batchContainer}>
        <Box className={styles.batchHeader}>
          <Box className={styles.batchHeaderTitle}>
            <Icon name="layers" width="24px" height="24px" bgColor={theme.palette.text.secondary} />
            <Typography variant="h2" className={styles.batchHeaderTitleText}>
              {t('batchId')} [{verificationRequest.batchId}]
            </Typography>
          </Box>
        </Box>
        <Box className={styles.batchContent}>
          <Box sx={{ padding: '24px' }}>
            {/* Fields in horizontal row */}
            <Grid container spacing={3} sx={{ mb: 2 }}>
              <Grid size={2.4}>
                <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 0.5 }}>
                  {t('created')}
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {verificationRequest.created}
                </Typography>
              </Grid>
              <Grid size={2.4}>
                <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 0.5 }}>
                  {t('serviceType')}
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  [{verificationRequest.serviceType}]
                </Typography>
              </Grid>
              <Grid size={2.4}>
                <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 0.5 }}>
                  {t('submissionMethod')}
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  [{verificationRequest.submissionMethod}]
                </Typography>
              </Grid>
              <Grid size={2.4}>
                <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 0.5 }}>
                  {t('verified')}
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {verificationRequest.verified}
                </Typography>
              </Grid>
              <Grid size={2.4}>
                <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 0.5 }}>
                  {t('status')}
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  [{verificationRequest.status}]
                </Typography>
              </Grid>
            </Grid>

            {/* Description Accordion */}
            <Accordion defaultExpanded={false} sx={{ mt: 2, boxShadow: 'none', border: 'none', '&:before': { display: 'none' } }}>
              <AccordionSummary
                expandIcon={<Icon name="arrowDown" width="16px" height="16px" />}
                sx={{ padding: 0, minHeight: 'auto', '& .MuiAccordionSummary-content': { margin: '12px 0' } }}
              >
                <Typography variant="body2" fontWeight={500}>
                  {t('description')}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ padding: '8px 0 0 0' }}>
                <Typography variant="body2" color="textSecondary">
                  {verificationRequest.description}
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Box>
        </Box>
      </Box>

      {/* Verification Request Batch Section */}
      <Box className={styles.batchContainer} sx={{ mt: 2 }} ref={batchContainerRef}>
        <Box className={styles.batchHeader}>
          <Box className={styles.batchHeaderTitle}>
            <Icon name="accounts" width="24px" height="24px" bgColor={theme.palette.text.secondary} />
            <Typography variant="h2" className={styles.batchHeaderTitleText}>
              Verification request batch
            </Typography>
          </Box>
        </Box>
        <Box className={styles.batchContent}>
          <Box className={styles.batchInnerContent}>
            <Box className={styles.batchInnerHeader}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search within batch"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Icon name="search" width="24px" height="24px" bgColor={theme.palette.text.secondary} />
                    </InputAdornment>
                  ),
                }}
                className={styles.searchField}
              />
              <Button
                buttonVariant="text"
                className={styles.downloadBtn}
                onClick={handleDownloadOpen}
              >
                <Icon name="download" width="24px" height="24px" bgColor={theme.palette.secondary.main} />
                {t('download')}
              </Button>
              <Button
                buttonVariant="text"
                className={styles.filterBtn}
                onClick={handleFilterOpen}
              >
                <Icon name="filter" width="28px" height="28px" bgColor={theme.palette.secondary.main} />
                {t('filter')}
              </Button>
            </Box>
            <Box className={styles.batchInnerBody}>
              <Box className={styles.batchInnerBodyContent}>
                <Box className={styles.batchList}>
                {filteredAndSearchedAccountList
                  ?.slice(page * perPage, page * perPage + perPage)
                  .map((account: any, idx: number) => {
                    const globalIdx = page * perPage + idx;
                    const displayNumber = filteredAndSearchedAccountList.length - globalIdx;
                    return (
                      <Box className={styles.batchListItem} key={account.id ?? globalIdx}>
                        <Box
                          className={styles.batchListItemHeader}
                          onClick={() => setExpandCollapseIndex(expandCollapseIndex === globalIdx ? null : globalIdx)}
                        >
                          <Box className={styles.batchListItemHeaderLeft}>
                            <Icon name="user" width="24px" height="24px" bgColor={theme.palette.text.secondary} />
                            <Typography variant="h3" className={styles.batchListItemHeaderText}>
                              {displayNumber}. Account number: {account.accountNumber}
                            </Typography>
                          </Box>
                          <Box className={styles.batchListItemHeaderRight}>
                            <Typography variant="body2" className={styles.batchListItemHeaderLabel}>
                              {account.lastName}
                            </Typography>
                            <Typography variant="body2" className={styles.batchListItemHeaderValue} sx={{ mx: 2 }}>
                              ID number: {account.idNumber}
                            </Typography>
                            <Typography variant="body2" className={styles.batchListItemHeaderValue} sx={{ mx: 2 }}>
                              Status: [{account.status}]
                            </Typography>
                            <Icon
                              name={expandCollapseIndex === globalIdx ? "arrowUp" : "arrowDown"}
                              width="24px"
                              height="24px"
                              bgColor={theme.palette.secondary.main}
                            />
                          </Box>
                        </Box>
                        <Box className={`${styles.batchListItemContent} ${expandCollapseIndex === globalIdx ? styles.expanded : ''}`}>
                          <Box className={styles.batchListItemContentRow}>
                            <Typography variant="body2" className={styles.batchListItemContentRowLabel}>
                              Last name / Company name (Fixed)
                            </Typography>
                            <Typography variant="body2" className={styles.batchListItemContentRowValue}>
                              {account.lastNameFixed}
                            </Typography>
                          </Box>
                          <Box className={styles.batchListItemContentRow}>
                            <Typography variant="body2" className={styles.batchListItemContentRowLabel}>
                              ID number ({account.idNumberValue})
                            </Typography>
                            <Typography variant="body2" className={styles.batchListItemContentRowValue}>
                              {account.verificationStatus1}
                            </Typography>
                          </Box>
                          <Box className={styles.batchListItemContentRow}>
                            <Typography variant="body2" className={styles.batchListItemContentRowLabel}>
                              Email address
                            </Typography>
                            <Typography variant="body2" className={styles.batchListItemContentRowValue}>
                              {account.emailAddress}
                            </Typography>
                          </Box>
                          <Box className={styles.batchListItemContentRow}>
                            <Typography variant="body2" className={styles.batchListItemContentRowLabel}>
                              Telephone number
                            </Typography>
                            <Typography variant="body2" className={styles.batchListItemContentRowValue}>
                              {account.telephoneNumber}
                            </Typography>
                          </Box>
                          <Box className={styles.batchListItemContentRow}>
                            <Typography variant="body2" className={styles.batchListItemContentRowLabel}>
                              Account name
                            </Typography>
                            <Typography variant="body2" className={styles.batchListItemContentRowValue}>
                              {account.accountName}
                            </Typography>
                          </Box>
                          <Box className={styles.batchListItemContentRow}>
                            <Typography variant="body2" className={styles.batchListItemContentRowLabel}>
                              Account status
                            </Typography>
                            <Typography variant="body2" className={styles.batchListItemContentRowValue}>
                              {account.accountStatus}
                            </Typography>
                          </Box>
                          <Box className={styles.batchListItemContentRow}>
                            <Typography variant="body2" className={styles.batchListItemContentRowLabel}>
                              Account type match {account.accountTypeMatch}
                            </Typography>
                            <Typography variant="body2" className={styles.batchListItemContentRowValue}>
                              {account.verificationStatus2}
                            </Typography>
                          </Box>
                          <Box className={styles.batchListItemContentRow}>
                            <Typography variant="body2" className={styles.batchListItemContentRowLabel}>
                              Branch / Sort code {account.branchSortCode}
                            </Typography>
                            <Typography variant="body2" className={styles.batchListItemContentRowValue}>
                              {account.verificationStatus3}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}
              </Box>
            </Box>
          </Box>
            <Box className={styles.batchInnerFooter}>
              {filteredAndSearchedAccountList.length !== 0 && (
                <CustomPagination
                  rows={filteredAndSearchedAccountList}
                  page={page}
                  rowsPerPage={perPage}
                  onPageChange={handlePageChange}
                  onRowsPerPageChange={handleRowsPerPageChange}
                />
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      <DownloadDebtorDialog
        open={downloadDialogOpen}
        anchorEl={downloadAnchorEl}
        onClose={handleDownloadClose}
        onDownload={handleDownload}
        title={t('download')}
      />

      <VerificationRequestBatchFilterDialog
        open={filterDialogOpen}
        anchorEl={filterAnchorEl}
        onClose={handleFilterClose}
        onApply={handleFilterApply}
        initialValues={filterValues}
      />
    </section>
  );
};

export default VerificationRequestDetails;
