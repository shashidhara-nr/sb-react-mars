'use client';
import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import styles from './ServiceAgreements.module.scss';
import { Grid, InputAdornment, TextField, Typography, useTheme, Box, Collapse, IconButton, Checkbox, Table, TableBody, TableCell, TableHead, TableRow, Popover, MenuItem, Select } from '@mui/material';
import { BreadcrumbList } from 'components/lib/Page/Breadcrumb';
import { Heading } from 'components/lib/Page';
import TableWithTab from '@molecules/TableWithTab/TableWithTab';
import { ListRightPanelActions } from 'components/common';
import { mockServiceAgreementAccountData, mockServiceAgreementServiceData, getServiceAgreementById, getAccountsByServiceAgreementId, getServicesByServiceAgreementId } from '@lib/mock/mockServiceAgreement';
import { useRouter } from 'next/navigation';
import { Icon } from '@atoms/index';
import DownloadDebtorDialog from '@molecules/DownloadDebtorDialog/DownloadDebtorDialog';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CloseIcon from '@mui/icons-material/Close';
import StorageIcon from '@mui/icons-material/Storage';
import TuneIcon from '@mui/icons-material/Tune';
import InfoIcon from '@mui/icons-material/Info';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';

const ACCOUNT_TABLE_COLUMNS = [
  'owner',
  'accountName',
  'accountNumber',
  'branchSortCode',
  'bicSwift',
  'iban',
  'bankName',
  'currency'
] as const;

const SERVICE_TABLE_COLUMNS = [
  'serviceName',
  'serviceModule',
  'serviceGroup',
  { key: 'links', type: 'link' }
] as const;

const ServiceAgreementsDetails = ({ id }: { id?: string }) => {
  const t = useTranslations('serviceAgreements');
  const theme = useTheme();
  const router = useRouter();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState<any>({});
  const [searchText, setSearchText] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(15);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);
  const [descriptionExpanded, setDescriptionExpanded] = useState<boolean>(true);
  const [serviceAgreementId, setServiceAgreementId] = useState<string>(id || '');
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editFormData, setEditFormData] = useState<any>({
    name: '',
    description: '',
  });
  const [serviceFilterAnchorEl, setServiceFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [showAddServiceDialog, setShowAddServiceDialog] = useState<boolean>(false);
  const [currentServiceAgreement, setCurrentServiceAgreement] = useState<any>(null);
  const [serviceAgreementAccounts, setServiceAgreementAccounts] = useState<any[]>([]);
  const [serviceAgreementServices, setServiceAgreementServices] = useState<any[]>([]);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [selectedServicesForActivation, setSelectedServicesForActivation] = useState<Record<string, boolean>>({});
  
  // Load service agreement details based on ID
  useEffect(() => {
    if (id) {
      setServiceAgreementId(id);
      // Fetch specific service agreement data based on ID
      const agreement = getServiceAgreementById(id);
      const accounts = getAccountsByServiceAgreementId(id);
      const services = getServicesByServiceAgreementId(id);
      
      setCurrentServiceAgreement(agreement);
      setServiceAgreementAccounts(accounts);
      setServiceAgreementServices(services);
      
      console.log('Loading service agreement details for ID:', id, agreement);
    }
  }, [id]);
  
  // Memoize breadcrumb links
  const breadcrumbLinks = useMemo(
    () => [
      { href: '/', label: t('dashboard') },
      { href: '/service-agreements', label: t('serviceAgreements') },
      { href: '/service-agreements/details', label: t('serviceAgreementDetails') },
    ],
    [t],
  );

  // Memoize filtered rows
  const mappedRows = useMemo(() => {
    let filtered = mockServiceAgreementAccountData as any[]; // Replace with actual data source and type

    // Apply dialog filters
    if (filters.branchSortCode) {
      const search = filters.branchSortCode.toLowerCase();
      filtered = filtered.filter((row: any) => 
        row.accountBalance?.branch?.toLowerCase().includes(search)
      );
    }
    if (filters.accountBalanceName) {
      const search = filters.accountBalanceName.toLowerCase();
      filtered = filtered.filter((row: any) =>
        row.accountBalance?.name?.toLowerCase().includes(search),
      );
    }
    if (filters.accountNumber) {
      const search = filters.accountNumber.toLowerCase();
      filtered = filtered.filter((row: any) => 
        row.accountBalance?.accountNumber?.toLowerCase().includes(search)
      );
    }
    if (filters.paymentCategory) {
      filtered = filtered.filter((row: any) => row.paymentCategory === filters.paymentCategory);
    }
    if (filters.statusCode) {
      filtered = filtered.filter((row: any) => row.authoriseStatus === filters.statusCode);
    }

    // Apply search text
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        (row: any) =>
          row?.accountBalance?.name?.toLowerCase().includes(search) ||
          row?.accountBalance?.accountNumber?.toLowerCase().includes(search),
      );
    }

    const withAccountDetails = filtered.map((row: any) => ({
      ...row,
      links: {
        href: row?.links?.href,
        text: row?.links?.text ? t(row.links.text)?.toLocaleUpperCase() : '',
      },
    }));

    return withAccountDetails;
  }, [filters, searchText, t]);

  // Memoize callbacks
  const handleDownloadOpen = useCallback(() => {
    setDownloadDialogOpen(true);
    setDownloadAnchorEl(tableContainerRef.current);
  }, []);

  const handleDownloadClose = useCallback(() => {
    setDownloadDialogOpen(false);
    setDownloadAnchorEl(null);
  }, []);

  const handleCheckboxClick = useCallback(
    (rows: any | any[]) => {
      const selected = Array.isArray(rows) ? rows : rows ? [rows] : [];

      // If "select all" was clicked (array with multiple or zero rows)
      if (Array.isArray(rows)) {
        if (rows.length === 0) {
          // Deselect all - clear everything
          setSelectedRows([]);
        } else if (rows.length > 1) {
          // Select all - limit to current page only
          const startIndex = (currentPage - 1) * perPage;
          const endIndex = startIndex + perPage;
          const currentPageRows = mappedRows.slice(startIndex, endIndex);
          const currentPageIds = new Set(currentPageRows.map((r: any) => r.id));

          // Only keep selections from current page
          const pageSelections = selected.filter((row: any) => currentPageIds.has(row.id));
          setSelectedRows(pageSelections);
        } else {
          // Single row selection/deselection
          setSelectedRows(selected);
        }
      } else {
        // Single row click
        setSelectedRows(selected);
      }
    },
    [currentPage, perPage, mappedRows],
  );

  const handleDownload = useCallback(({ format, sortBy }: any) => {
    setDownloadDialogOpen(false);
    setDownloadAnchorEl(null);
  }, []);

  const handleEditServiceAgreement = useCallback((row: any) => {
    setEditFormData({
      name: row.serviceAgreementName || '',
      description: row.description || '',
    });
    setIsEditMode(true);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setIsEditMode(false);
    setEditFormData({
      name: '',
      description: '',
    });
  }, []);

  const handleSaveEdit = useCallback(() => {
    console.log('Saving service agreement:', editFormData);
    setIsEditMode(false);
    setEditFormData({
      name: '',
      description: '',
    });
  }, [editFormData]);

  const handleEditFormChange = useCallback((field: string, value: string) => {
    setEditFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleServiceFilterOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setServiceFilterAnchorEl(event.currentTarget);
  }, []);

  const handleServiceFilterClose = useCallback(() => {
    setServiceFilterAnchorEl(null);
  }, []);

  const handleAddService = useCallback(() => {
    // Load available services when opening the dialog
    const allServices = mockServiceAgreementServiceData.slice(0, 10);
    setAvailableServices(allServices);
    setSelectedServicesForActivation({});
    setShowAddServiceDialog(true);
  }, []);

  const handleCloseAddServiceDialog = useCallback(() => {
    setShowAddServiceDialog(false);
    setAvailableServices([]);
    setSelectedServicesForActivation({});
  }, []);

  const handleServiceActivationChange = useCallback((serviceId: string) => {
    setSelectedServicesForActivation((prev) => ({
      ...prev,
      [serviceId]: !prev[serviceId],
    }));
  }, []);

  const handleSaveSelfServices = useCallback(() => {
    console.log('Saving self-services:', selectedServicesForActivation);
    // Handle save logic here
    handleCloseAddServiceDialog();
  }, [selectedServicesForActivation, handleCloseAddServiceDialog]);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    setSelectedRows([]); // Clear selections when changing pages
  }, []);

  const handlePerPageChange = useCallback((newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
    setSelectedRows([]); // Clear selections when changing rows per page
  }, []);

  // Memoize action buttons for right panel
  // Will be defined after currentTab is initialized

  // Memoize table head cells
  const accountTableHeadCells = useMemo(
    () => [
      { id: 'owner', label: t('owner'), numeric: false, colWidth: '180px' },
      { id: 'accountName', label: t('accountName'), numeric: false, colWidth: '180px' },
      { id: 'accountNumber', label: t('accountNumber'), numeric: false, colWidth: '180px' },
      { id: 'branchSortCode', label: t('branchSortCode'), numeric: false, colWidth: '200px' },
      { id: 'bicSwift', label: t('bicSwift'), numeric: false, colWidth: '180px' },
      { id: 'iban', label: t('iban'), numeric: false, colWidth: '300px' },
      { id: 'bankName', label: t('bankName'), numeric: false, colWidth: '150px' },
      { id: 'currency', label: t('currency'), numeric: false, colWidth: '100px' }
    ],
    [t],
  );

  const serviceTableHeadCells = useMemo(
    () => [
      { id: 'serviceName', label: t('serviceName'), numeric: false },
      { id: 'serviceModule', label: t('serviceModule'), numeric: false },
      { id: 'serviceGroup', label: t('serviceGroup'), numeric: false },
      { id: 'links', label: t('quickLinks'), numeric: false, type: 'link', colWidth: '200px', disableSort: true }
    ],
    [t],
  );

  // Memoize table data
  const accountTableData = useMemo(
    () => ({
      columns: ACCOUNT_TABLE_COLUMNS,
      headCells: accountTableHeadCells,
      rowButton: false,
      rows: serviceAgreementAccounts.length > 0 ? serviceAgreementAccounts : mockServiceAgreementAccountData,
      pageSize: 15,
      rowCount: serviceAgreementAccounts.length > 0 ? serviceAgreementAccounts.length : mockServiceAgreementAccountData.length,
      rowVariant: 'checkbox'
    }),
    [accountTableHeadCells, serviceAgreementAccounts],
  );

  const serviceTableData = useMemo(
    () => {
      const dataToUse = serviceAgreementServices.length > 0 ? serviceAgreementServices : mockServiceAgreementServiceData;
      const updatedData = dataToUse.map((row: any) => ({
        ...row,
        links: {
          href: row?.links?.href || '#',
          text: t(row?.links?.text).toLocaleUpperCase()
        }
      }));
      return {
        columns: SERVICE_TABLE_COLUMNS,
        headCells: serviceTableHeadCells,
        rowButton: false,
        rows: updatedData,
        pageSize: 15,
        rowCount: updatedData.length,
        rowVariant: 'checkbox'
      };
    },
    [serviceTableHeadCells, serviceAgreementServices, t],
  );

  const [currentTableData, setCurrentTableData] = useState<any>(accountTableData);
  const [currentTab, setCurrentTab] = useState<string>('accounts');

  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
    setSelectedRows([]); 
    if (newValue === 'accounts') {
      setCurrentTableData(accountTableData);
    } else if (newValue === 'services') {
      setCurrentTableData(serviceTableData);
    }
  }, [accountTableData, serviceTableData]);

  const statusTabs = useMemo(
    () => [
      { label: t('accounts'), value: 'accounts' },
      { label: t('services'), value: 'services' }
    ],
    [t],
  );

  // Memoize action buttons for right panel - now defined after currentTab
  const rightPanelButtons = useMemo(() => {
    const count = selectedRows.length;
    const hasFilters = Object.keys(filters).length > 0 || searchText.trim().length > 0;

    if (currentTab === 'services') {
      // For services tab, show Add Service and Filter buttons
      return (
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', ml: 'auto' }}>
          <Box
            component="button"
            onClick={handleAddService}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              padding: '0',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              color: theme.palette.primary.main,
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              '&:hover': {
                opacity: 0.8,
              },
            }}
          >
            + {t('addService') || 'ADD SERVICE'}
          </Box>
          <Box
            component="button"
            onClick={handleServiceFilterOpen}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              padding: '0',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              color: theme.palette.primary.main,
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              '&:hover': {
                opacity: 0.8,
              },
            }}
          >
            <Icon name="filter" width='20' height='20' bgColor={theme.palette.primary.main} />
            {t('filter') || 'FILTER'}
          </Box>
        </Box>
      );
    }

    // For accounts tab, show download actions
    return (
      <ListRightPanelActions
        selectedCount={count}
        hasFilters={hasFilters}
        onRemoveFilters={() => {}}
        onDownloadClick={handleDownloadOpen}
      />
    );
  }, [currentTab, selectedRows.length, filters, searchText, handleDownloadOpen, handleAddService, handleServiceFilterOpen, t, theme]);

  const handleLinkClick = useCallback((row: any) => {
    console.log('Link clicked for row:', row);
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
                {t('serviceAgreementDetails')}
            </Heading>
        </Grid>
        
        {/* Service Agreement Edit Form Card */}
        {isEditMode && (
          <Box
            sx={{
              border: `1px solid ${theme.palette.grey[300]}`,
              borderRadius: '12px',
              overflow: 'hidden',
              backgroundColor: theme.palette.common.white,
              p: 3,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Icon name="notes" width={'24'} height={'24'} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {t('serviceAgreementDetails')}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Box
                  component="button"
                  onClick={handleCancelEdit}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    padding: '8px 16px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    color: theme.palette.primary.main,
                    fontSize: '14px',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: theme.palette.grey[100],
                      borderRadius: '4px',
                    },
                  }}
                >
                  ✕ {t('cancel')}
                </Box>
                <Box
                  component="button"
                  onClick={handleSaveEdit}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    padding: '8px 16px',
                    border: 'none',
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    cursor: 'pointer',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  }}
                >
                  💾 {t('save')}
                </Box>
              </Box>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 3,
                position: 'relative',
              }}
            >
              {/* Service Agreement Name Field */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.grey[600], mb: 0.5, display: 'block' }}>
                  {t('serviceAgreementName')}
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  value={editFormData.name}
                  onChange={(e) => handleEditFormChange('name', e.target.value)}
                  placeholder="Populated"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: theme.palette.common.white,
                    },
                  }}
                />
              </Box>

              {/* Avatar Circle in the Center */}
              <Box
                sx={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  fontSize: '20px',
                  fontWeight: 600,
                  zIndex: 1,
                }}
              >
                R
              </Box>

              {/* Service Agreement Description Field */}
              <Box sx={{ gridColumn: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.grey[600], mb: 0.5, display: 'block' }}>
                  {t('serviceAgreementDescription')}
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  value={editFormData.description}
                  onChange={(e) => handleEditFormChange('description', e.target.value)}
                  placeholder="Populated"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: theme.palette.common.white,
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>
        )}
        
        {/* Service Agreement Details - 2 Column Layout */}
        <Box
          sx={{
            border: `1px solid ${theme.palette.grey[300]}`,
            borderRadius: '12px',
            overflow: 'hidden',
            backgroundColor: theme.palette.common.white,
          }}
        >
          {/* First Row - Name and Status Cards */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              minHeight: '120px',
            }}
          >
            {/* Service Agreement Name Card */}
            <Box
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                borderRight: `1px solid ${theme.palette.grey[300]}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icon name="notes" width={'24'} height={'24'} />
                <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.grey[600] }}>
                  {t('serviceAgreementName')}
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 600, mt: 1 }}>
                {currentServiceAgreement?.serviceAgreementName || '[Service Agreement Name]'}
              </Typography>
            </Box>

            {/* Status Card */}
            <Box
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: currentServiceAgreement?.status?.color === 'success' ? theme.palette.success.main : theme.palette.grey[500],
                  }}
                />
                <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.grey[600] }}>
                  {t('status')}
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 600, mt: 1 }}>
                {currentServiceAgreement?.status?.value || '[Status]'}
              </Typography>
            </Box>

            {/* Centered Avatar Circle - REMOVED */}
          </Box>

          {/* Second Row - Description Section */}
          <Box
            sx={{
              borderTop: `1px solid ${theme.palette.grey[300]}`,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                p: 2,
                backgroundColor: theme.palette.common.white,
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: theme.palette.grey[50],
                },
              }}
              onClick={() => setDescriptionExpanded(!descriptionExpanded)}
            >
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  {t('serviceAgreementDescription')}
                </Typography>
                {descriptionExpanded && (
                  <Typography variant="body2" sx={{ color: theme.palette.grey[700], lineHeight: 1.6 }}>
                    {currentServiceAgreement?.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'}
                  </Typography>
                )}
              </Box>
              <IconButton
                size="small"
                sx={{
                  ml: 1,
                  mt: -0.5,
                  transform: descriptionExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease',
                  flexShrink: 0,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setDescriptionExpanded(!descriptionExpanded);
                }}
              >
                {descriptionExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
          </Box>
        </Box>
        <Grid size={12} className={styles.searchRow}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder={t('searchAccounts')}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            InputProps={
              {
                startAdornment: (
                  <InputAdornment position="start">
                    <Icon name="search" width='32' height='32' bgColor={theme.palette.navy.main} />
                  </InputAdornment>
                ),
              }
            }
            className={styles.searchField}
          />
        </Grid>
        <section className={styles.tableContainer}>
          <TableWithTab
            statusTabs={statusTabs}
            currentTab={currentTab}
            tableData={currentTableData}
            onTabChange={handleTabChange}
            selectedRows={selectedRows}
            onCheckboxClick={handleCheckboxClick}
            onRowClick={(rowData: any) => handleEditServiceAgreement(rowData)}
            rightPanelButtons={rightPanelButtons}
            onPageChange={handlePageChange}
            onPerPageChange={handlePerPageChange}
            onQuickLinkClick={handleLinkClick}
            filterButtons={[]}
          />
          <DownloadDebtorDialog
            open={downloadDialogOpen}
            anchorEl={downloadAnchorEl}
            onClose={handleDownloadClose}
            onDownload={handleDownload}
            title={`${t('download')} ${t('serviceAgreements')}`}
          />

          {/* Add Self-Service Dialog */}
          {showAddServiceDialog && (
            <Box
              sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1300,
              }}
              onClick={handleCloseAddServiceDialog}
            >
              <Box
                sx={{
                  backgroundColor: theme.palette.common.white,
                  borderRadius: '8px',
                  width: '90%',
                  maxWidth: '800px',
                  maxHeight: '90vh',
                  overflow: 'auto',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Dialog Header */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2.5,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TuneIcon sx={{ fontSize: '26px', color: theme.palette.text.primary }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {t('addSelfService') || 'Add Self-Service'}
                    </Typography>
                  </Box>
                  <IconButton onClick={handleCloseAddServiceDialog} size="small">
                    <CloseIcon sx={{ color: theme.palette.grey[600] }} />
                  </IconButton>
                </Box>

                {/* Dialog Content */}
                <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Info Notice Section */}
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 2,
                      p: 2,
                      backgroundColor: theme.palette.mode === 'light' ? '#f5f5f5' : theme.palette.grey[800],
                      borderRadius: '8px',
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Box sx={{ flexShrink: 0, mt: 0.5 }}>
                      <InfoIcon sx={{ fontSize: '24px', color: theme.palette.primary.main }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {t('selfServiceActivationNotice') || 'Self-Service Activation Notice'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {t('selfServiceActivationText') ||
                          'The following services can be activated without contacting the bank. Contact Client Services should you wish to change any additional services on agreement.'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Self-Service Confirmation Section */}
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <StorageIcon sx={{ fontSize: '20px', color: theme.palette.primary.main }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {t('selfServiceConfirmation') || 'Self-Service Confirmation'}
                      </Typography>
                    </Box>

                    {/* Services Table */}
                    <Box
                      sx={{
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: '8px',
                        overflow: 'hidden',
                      }}
                    >
                      <Table size="small">
                        <TableHead sx={{ backgroundColor: theme.palette.grey[100] }}>
                          <TableRow>
                            <TableCell sx={{ width: '50px' }}>
                              <Checkbox size="small" disabled />
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              {t('service') || 'Service'}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              {t('subService') || 'Sub-service'}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              {t('comment') || 'Comment'}
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, width: '100px' }}>
                              {t('activate') || 'Activate'}
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {availableServices.map((service) => (
                            <TableRow
                              key={service.id}
                              hover
                              sx={{
                                '&:last-child td, &:last-child th': { border: 0 },
                              }}
                            >
                              <TableCell>
                                <Checkbox size="small" disabled />
                              </TableCell>
                              <TableCell>{service.serviceName}</TableCell>
                              <TableCell>{service.serviceModule}</TableCell>
                              <TableCell>{service.serviceGroup}</TableCell>
                              <TableCell align="center">
                                <Checkbox
                                  size="small"
                                  checked={selectedServicesForActivation[service.id] || false}
                                  onChange={() => handleServiceActivationChange(service.id)}
                                  inputProps={{ 'aria-label': `Activate ${service.serviceName}` }}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Box>
                  </Box>

                  {/* Dialog Actions */}
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 2,
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderTop: `1px solid ${theme.palette.divider}`,
                      pt: 2,
                      mt: 1,
                    }}
                  >
                    <Box
                      component="button"
                      onClick={handleCloseAddServiceDialog}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        padding: '8px 16px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: theme.palette.primary.main,
                        cursor: 'pointer',
                        borderRadius: '4px',
                        fontSize: '14px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        transition: 'all 0.2s',
                        '&:hover': {
                          backgroundColor: theme.palette.action.hover,
                        },
                      }}
                    >
                      <CloseIcon sx={{ fontSize: '18px' }} />
                      {t('close') || 'Close'}
                    </Box>
                    <Box
                      component="button"
                      onClick={handleSaveSelfServices}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        padding: '12px 32px',
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        transition: 'all 0.2s',
                        '&:hover': {
                          backgroundColor: theme.palette.primary.dark,
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        },
                      }}
                    >
                      <ThumbUpAltIcon sx={{ fontSize: '18px' }} />
                      {t('accept') || 'Accept'}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}

          {/* Filter Dialog Popover */}
          <Popover
            open={Boolean(serviceFilterAnchorEl)}
            anchorEl={serviceFilterAnchorEl}
            onClose={handleServiceFilterClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <Box
              sx={{
                p: 3,
                width: '350px',
                backgroundColor: theme.palette.common.white,
              }}
            >
              {/* Filter Header */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 3,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {t('filterServiceAgreements') || 'Filter service agreements'}
                </Typography>
                <IconButton onClick={handleServiceFilterClose} size="small">
                  <CloseIcon sx={{ fontSize: '20px' }} />
                </IconButton>
              </Box>

              {/* Filter Fields */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                {/* Account Name */}
                <TextField
                  fullWidth
                  placeholder={t('accountName') || 'Account name'}
                  variant="outlined"
                  size="small"
                  value={filters.accountName || ''}
                  onChange={(e) => setFilters({ ...filters, accountName: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: theme.palette.common.white,
                    },
                  }}
                />

                {/* Account Number */}
                <TextField
                  fullWidth
                  placeholder={t('accountNumber') || 'Account number'}
                  variant="outlined"
                  size="small"
                  value={filters.accountNumber || ''}
                  onChange={(e) => setFilters({ ...filters, accountNumber: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: theme.palette.common.white,
                    },
                  }}
                />

                {/* Branch / Sort Code */}
                <TextField
                  fullWidth
                  placeholder={t('branchSortCode') || 'Branch / Sort code'}
                  variant="outlined"
                  size="small"
                  value={filters.branchSortCode || ''}
                  onChange={(e) => setFilters({ ...filters, branchSortCode: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: theme.palette.common.white,
                    },
                  }}
                />

                {/* IBAN */}
                <TextField
                  fullWidth
                  placeholder={t('iban') || 'IBAN'}
                  variant="outlined"
                  size="small"
                  value={filters.iban || ''}
                  onChange={(e) => setFilters({ ...filters, iban: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: theme.palette.common.white,
                    },
                  }}
                />

                {/* Bank Name */}
                <TextField
                  fullWidth
                  placeholder={t('bankName') || 'Bank name'}
                  variant="outlined"
                  size="small"
                  value={filters.bankName || ''}
                  onChange={(e) => setFilters({ ...filters, bankName: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: theme.palette.common.white,
                    },
                  }}
                />

                {/* Currency Dropdown */}
                <TextField
                  fullWidth
                  select
                  label={t('currency') || 'Currency'}
                  variant="outlined"
                  size="small"
                  value={filters.currency || ''}
                  onChange={(e) => setFilters({ ...filters, currency: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: theme.palette.common.white,
                    },
                  }}
                >
                  <MenuItem value="">
                    <em>{t('currency') || 'Currency'}</em>
                  </MenuItem>
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="EUR">EUR</MenuItem>
                  <MenuItem value="GBP">GBP</MenuItem>
                  <MenuItem value="JPY">JPY</MenuItem>
                  <MenuItem value="AUD">AUD</MenuItem>
                  <MenuItem value="CAD">CAD</MenuItem>
                  <MenuItem value="CHF">CHF</MenuItem>
                  <MenuItem value="ZAR">ZAR</MenuItem>
                </TextField>
              </Box>

              {/* Action Buttons */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  justifyContent: 'flex-end',
                  borderTop: `1px solid ${theme.palette.divider}`,
                  pt: 2,
                }}
              >
                <Box
                  component="button"
                  onClick={handleServiceFilterClose}
                  sx={{
                    padding: '8px 24px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: theme.palette.primary.main,
                    cursor: 'pointer',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                >
                  {t('cancel') || 'Cancel'}
                </Box>
                <Box
                  component="button"
                  onClick={handleServiceFilterClose}
                  sx={{
                    padding: '8px 24px',
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  }}
                >
                  {t('updateTable') || 'Update Table'}
                </Box>
              </Box>
            </Box>
          </Popover>
        </section>
      </section>
    </section>
  );
};
export default ServiceAgreementsDetails;
