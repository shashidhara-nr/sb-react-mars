'use client';
import { useCallback, useMemo, useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import styles from './ServiceAgreements.module.scss';
import { Grid, InputAdornment, TextField, Typography, useTheme, Box } from '@mui/material';
import Image from 'next/image';
import { BreadcrumbList } from 'components/lib/Page/Breadcrumb';
import { Heading } from 'components/lib/Page';
import TableWithTab from '@molecules/TableWithTab/TableWithTab';
import { ListRightPanelActions } from 'components/common';
import EmptyState from 'components/common/EmptyState';
import { mockServiceAgreementData } from '@lib/mock/mockServiceAgreement';
import { useRouter } from 'next/navigation';
import ServiceAgreementsFilterDialog from './ServiceAgreementsFilterDialog';
import DownloadServiceAgreementsDialog from '@molecules/DownloadServiceAgreementsDialog/DownloadServiceAgreementsDialog';
import { CommonSnackbar } from 'components/common';
import { Icon } from '@atoms/index';
import { CloseCircle, ErrorAlertIcon, ReloadRefreshIcon, SearchIcon } from 'lib/icons';

const TABLE_COLUMNS = [
  'serviceAgreementName',
  'numberOfAccounts',
  'description',
  { key: 'status', type: 'chip' },
  { key: 'links', type: 'link' }
] as const;

const ServiceAgreements = () => {
  const t = useTranslations('serviceAgreements');  const theme = useTheme();  const router = useRouter();
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(15);
  const [hasError, setHasError] = useState<boolean>(false);
  const [serviceAgreementData, setServiceAgreementData] = useState<any[]>(mockServiceAgreementData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('success');
  
  // API Integration - Fetch service agreements data
  useEffect(() => {
    const fetchServiceAgreementData = async () => {
      setIsLoading(true);
      try {
        // Mock API call with delay to simulate network request
        // Uncomment the line below to simulate API failure for testing
        // throw new Error('API request failed');

        // For now, using mock data
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        setServiceAgreementData(mockServiceAgreementData);
        setHasError(false);
      } catch (error) {
        console.error('Failed to load service agreement data:', error);
        setHasError(true);
        setServiceAgreementData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServiceAgreementData();
  }, [retryCount]);
  
  const handleReload = useCallback(() => {
    setRetryCount(prev => prev + 1);
  }, []);

  const handleDownloadClick = useCallback((event?: React.MouseEvent<HTMLElement>) => {
    setDownloadDialogOpen(true);
    setDownloadAnchorEl(event?.currentTarget || null);
  }, []);

  const handleDownloadClose = useCallback(() => {
    setDownloadDialogOpen(false);
    setDownloadAnchorEl(null);
  }, []);

  const handleDownloadConfirm = useCallback(
    async (payload: { format: 'pdf' | 'csv' | 'txt'; sortBy: 'ascending' | 'descending' }) => {
      try {
        setDownloadLoading(true);
        
        // Sort the selected rows based on sortBy parameter
        const sortedRows = [...selectedRows].sort((a, b) => {
          const nameA = a.serviceAgreementName?.toLowerCase() || '';
          const nameB = b.serviceAgreementName?.toLowerCase() || '';
          return payload.sortBy === 'ascending' 
            ? nameA.localeCompare(nameB)
            : nameB.localeCompare(nameA);
        });

        // Generate content based on format
        let content = '';
        let mimeType = '';
        const timestamp = new Date().getTime();

        if (payload.format === 'csv') {
          // Generate CSV content
          const headers = ['Service Agreement Name', 'Number of Accounts', 'Description', 'Status'];
          const rows = sortedRows.map(row => [
            `"${row.serviceAgreementName || ''}"`,
            row.numberOfAccounts || '0',
            `"${row.description || ''}"`,
            row.status?.label || 'N/A',
          ]);
          content = [headers, ...rows].map(row => row.join(',')).join('\n');
          mimeType = 'text/csv;charset=utf-8;';
        } else if (payload.format === 'txt') {
          // Generate fixed-length TXT content
          const headers = ['Service Agreement Name', 'Accounts', 'Description', 'Status'];
          const colWidths = [35, 10, 30, 15];
          
          const formatRow = (values: string[]) => {
            return values.map((val, idx) => 
              val.padEnd(colWidths[idx]).substring(0, colWidths[idx])
            ).join(' ');
          };

          content = formatRow(headers) + '\n';
          content += '='.repeat(colWidths.reduce((a, b) => a + b + 1, 0)) + '\n';
          
          sortedRows.forEach(row => {
            content += formatRow([
              row.serviceAgreementName || 'N/A',
              String(row.numberOfAccounts || '0'),
              row.description || 'N/A',
              row.status?.label || 'N/A',
            ]) + '\n';
          });
          mimeType = 'text/plain;charset=utf-8;';
        } else if (payload.format === 'pdf') {
          // For PDF, create a simple text representation
          // In a real application, you would use a library like jsPDF or PDFKit
          content = 'SERVICE AGREEMENTS REPORT\n';
          content += '='.repeat(50) + '\n\n';
          sortedRows.forEach(row => {
            content += `Name: ${row.serviceAgreementName}\n`;
            content += `Accounts: ${row.numberOfAccounts}\n`;
            content += `Description: ${row.description}\n`;
            content += `Status: ${row.status?.label}\n`;
            content += '-'.repeat(50) + '\n\n';
          });
          mimeType = 'application/pdf;charset=utf-8;';
        }

        // Create blob and trigger download
        const blob = new Blob([content], { type: mimeType });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `service-agreements-${timestamp}.${payload.format}`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL object
        URL.revokeObjectURL(url);
        
        // Show success message
        setToastMessage(t('downloadSuccessMessage'));
        setToastSeverity('success');
        setToastOpen(true);
        
        handleDownloadClose();
      } catch (error) {
        console.error('Download error:', error);
        setToastMessage(t('downloadError'));
        setToastSeverity('error');
        setToastOpen(true);
      } finally {
        setDownloadLoading(false);
      }
    },
    [handleDownloadClose, selectedRows, t],
  );

  const handleCloseToast = useCallback(() => {
    setToastOpen(false);
  }, []);
  
  // Memoize breadcrumb links
  const breadcrumbLinks = useMemo(
    () => [
      { href: '/', label: t('dashboard') },
      { href: '/service-agreements', label: t('serviceAgreements') },
    ],
    [t],
  );

  // Memoize filtered rows
  const mappedRows = useMemo(() => {
    let filtered = serviceAgreementData as any[];

    // Apply dialog filters
    if (filters.serviceAgreementName) {
      const search = filters.serviceAgreementName.toLowerCase();
      filtered = filtered.filter((row: any) =>
        row.serviceAgreementName?.toLowerCase().includes(search)
      );
    }

    if (filters.status) {
      filtered = filtered.filter((row: any) =>
        row.status?.value?.toLowerCase() === filters.status?.toLowerCase()
      );
    }

    // Apply search text - search by service agreement name
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        (row: any) =>
          row?.serviceAgreementName?.toLowerCase().includes(search),
      );
    }

    const withAccountDetails = filtered.map((row: any) => ({
      ...row,
      links: {
        href: row?.links?.href,
        text: t(row?.links?.text)?.toLocaleUpperCase(),
      },
    }));

    return withAccountDetails;
  }, [filters, searchText, t, serviceAgreementData]);

  // Memoize callbacks
  const handleCheckboxClick = useCallback(
    (rows: any | any[]) => {
      const selected = Array.isArray(rows) ? rows : rows ? [rows] : [];

      if (Array.isArray(rows)) {
        if (rows.length === 0) {
          setSelectedRows([]);
        } else if (rows.length > 1) {
          const startIndex = (currentPage - 1) * perPage;
          const endIndex = startIndex + perPage;
          const currentPageRows = mappedRows.slice(startIndex, endIndex);
          const currentPageIds = new Set(currentPageRows.map((r: any) => r.id));

          const pageSelections = selected.filter((row: any) => currentPageIds.has(row.id));
          setSelectedRows(pageSelections);
        } else {
          setSelectedRows(selected);
        }
      } else {
        setSelectedRows(selected);
      }
    },
    [currentPage, perPage, mappedRows],
  );

  const handleFilterOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setFilterDialogOpen(true);
    setFilterAnchorEl(event.currentTarget);
  }, []);

  const handleRemoveFilters = useCallback(() => {
    setFilters({});
    setSearchText('');
    setSelectedRows([]);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    setSelectedRows([]);
  }, []);

  const handlePerPageChange = useCallback((newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
    setSelectedRows([]);
  }, []);

  // Memoize filter button
  const filterButtons = useMemo(() => {
    return [
      {
        children: (
          <>
            <Icon name="filter" width='24' height='24' bgColor={theme.palette.secondary.main} />
            <Typography variant="button" className={styles.filterText}>{t('filter')}</Typography>
          </>
        ),
        buttonVariant: 'tertiary' as const,
        onClick: handleFilterOpen,
      },
    ];
  }, [handleFilterOpen, t, theme]);

  // Memoize action buttons for right panel
  const rightPanelButtons = useMemo(() => {
    const count = selectedRows.length;
    const hasFilters = Object.keys(filters).length > 0 || searchText.trim().length > 0;

    return (
      <ListRightPanelActions
        selectedCount={count}
        hasFilters={hasFilters}
        onRemoveFilters={handleRemoveFilters}
        onDownloadClick={count > 0 ? handleDownloadClick : undefined}
      />
    );
  }, [selectedRows.length, filters, searchText, handleRemoveFilters, handleDownloadClick]);

    // Memoize empty state content
    const emptyStateContent = useMemo(() => (
      <EmptyState
        title={t('noResultsFound')}
        description={t('noResultsDescription')}
        icon={
          <Image 
            src={SearchIcon} 
            alt="No results icon" 
            width={48} 
            height={48}
          />
        }
        testIdPrefix="service-agreements"
      />
    ), [t]);

    // Memoize error state content
    const errorStateContent = useMemo(() => (
      <EmptyState
        title={t('failedToLoad')}
        description={t('failedToLoadDescription')}
        buttonLabel={t('reload')}
        onButtonClick={handleReload}
        icon={
          <Image 
            src={ErrorAlertIcon} 
            alt="Error icon" 
            width={48} 
            height={48}
          />
        }
        buttonIcon={
          <Image 
            src={ReloadRefreshIcon}
            alt="Reload icon"
            width={20}
            height={20}
          />
        }
        testIdPrefix="service-agreements"
      />
    ), [t, handleReload]);

    // Memoize table head cells
    const tableHeadCells = useMemo(
        () => [
          { id: 'serviceAgreementName', label: t('serviceAgreementName'), numeric: false, colWidth: '400px' },
          { id: 'numberOfAccounts', label: t('numberOfAccounts'), numeric: false, colWidth: '220px' },
          { id: 'description', label: t('description'), numeric: false },
          { id: 'status', label: t('status'), numeric: false, colWidth: '120px' },
          { id: 'links', label: t('quickLinks'), numeric: false, colWidth: '280px', disableSort: true },
        ],
        [t],
    );

    // Memoize table data
    const tableData = useMemo(
        () => ({
          columns: TABLE_COLUMNS,
          headCells: tableHeadCells,
          rowButton: false,
          rows: mappedRows,
          pageSize: 15,
          rowCount: mappedRows.length,
          rowVariant: 'checkbox',
          hasError: hasError,
          emptyStateContent: hasError ? errorStateContent : emptyStateContent,
        }),
        [tableHeadCells, mappedRows, hasError, errorStateContent, emptyStateContent],
    );

    const handleLinkClick = useCallback((row: any) => {
      router.push(row?.links?.href || '/');
    }, [router]);

  return (
    <section className={styles.container}>
      <section className={styles.tabContent}>
        <BreadcrumbList links={breadcrumbLinks} />
        <Grid
          size={12}
          className={styles.headerRow}
        >
          <Heading as="h4" fontSize="28px">
            {t('serviceAgreements')}
          </Heading>
      </Grid>
        <Grid size={12} className={styles.searchRow}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder={t('searchPlaceholder')}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            InputProps={
              {
                startAdornment: (
                  <InputAdornment position="start">
                    <Icon name="search" width='32' height='32' bgColor={theme.palette.navy.main} />
                  </InputAdornment>
                ),
                ...(searchText.trim() && {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Box
                        component="img"
                        src={CloseCircle.src}
                        onClick={() => setSearchText('')}
                        className={styles.closeIconContainer}
                      />
                    </InputAdornment>
                  ),
                }),
              }
            }
            className={styles.searchField}
          />
        </Grid>
        <section className={styles.tableContainer}>
          <TableWithTab
            tableData={tableData}
            filterButtons={filterButtons}
            selectedRows={selectedRows}
            onCheckboxClick={handleCheckboxClick}
            onRowClick={(rowData: any) => console.log('rowData', rowData)}
            rightPanelButtons={rightPanelButtons}
            onPageChange={handlePageChange}
            onPerPageChange={handlePerPageChange}
            onQuickLinkClick={handleLinkClick}
          />
          <ServiceAgreementsFilterDialog
            open={filterDialogOpen}
            anchorEl={filterAnchorEl}
            onClose={() => setFilterDialogOpen(false)}
            onApply={(newFilters) => setFilters(newFilters)}
            initialValues={filters}
          />
          <DownloadServiceAgreementsDialog
            open={downloadDialogOpen}
            anchorEl={downloadAnchorEl}
            onClose={handleDownloadClose}
            onDownload={handleDownloadConfirm}
            loading={downloadLoading}
          />
        </section>
      </section>
      <CommonSnackbar
        open={toastOpen}
        onClose={handleCloseToast}
        message={toastMessage}
        severity={toastSeverity}
      />
    </section>
  );
}
export default ServiceAgreements;
