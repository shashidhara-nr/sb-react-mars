'use client';
import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import styles from './UserAccounts.module.scss';
import { Grid, InputAdornment, TextField, Typography, useTheme, IconButton, Box } from '@mui/material';
import { BreadcrumbList } from 'components/lib/Page/Breadcrumb';
import { Heading } from 'components/lib/Page';
import TableWithTab from '@molecules/TableWithTab';
import { CommonSnackbar, ListRightPanelActions } from 'components/common';
import { useRouter } from 'next/navigation';
import Button from 'components/lib/Forms/Button';
import { Icon } from '@atoms/index';
import { mockUserAccountsData } from '@lib/mock/mockUserDetails';
import UserAccountsFilterDialog from './UserAccountsFilterDialog';
import DownloadDebtorDialog from '@molecules/DownloadDebtorDialog/DownloadDebtorDialog';
import DeleteConfirmationDialog from 'components/common/DeleteConfirmationDialog';
import { CloseCircle } from 'lib/icons';

const TABLE_COLUMNS = [
  'userAccountName',
  'userAccountId',
  'userName',
  'adminRole',
  'authClass',
  { key: 'status', type: 'chip' },
  { key: 'links', type: 'link' }
] as const;

const UserAccounts = () => {
  const t = useTranslations('userAccounts');
  const theme = useTheme();
  const [searchText, setSearchText] = useState('');
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
   const [snackbarOpen, setSnackbarOpen] = useState(false);
   const [alertMessage, setAlertMessage] = useState('');
   const [isLoading, setIsLoading] = useState(false);
   const [confirmBoxMessage , setConfirmBoxMessage] = useState({
    buttonLabel:'',
    itemLabel : '',
    itemLabel1:'',
    itemLabel2:''
   });

  // Loading effect for search and filter changes
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [searchText, filters]);

  // Memoize filtered rows
  const mappedRows = useMemo(() => {
    let filtered = mockUserAccountsData;

    if (filters.userAccountName) {
      const search = filters.userAccountName.toLowerCase();
      filtered = filtered.filter((row: any) => 
        row.userAccountName?.toLowerCase().includes(search)
      );
    }

    if (filters.userId) {
      const search = filters.userId.toLowerCase();
      filtered = filtered.filter((row: any) => 
        row.userAccountId?.toLowerCase().includes(search)
      );
    }

    if (filters.authClass) {
      const search = filters.authClass.toLowerCase();
      filtered = filtered.filter((row: any) => 
        row.authClass?.toLowerCase() === search.toLowerCase()
      );
    }

    if (filters.status) {
      const search = filters.status.toLowerCase();
      filtered = filtered.filter((row: any) => 
        row.status?.value?.toLowerCase() === search.toLowerCase()
      );
    }

     if (filters.role) {
      const search = filters.role.toLowerCase();
      filtered = filtered.filter((row: any) => 
        row.adminRole?.toLowerCase() === search.toLowerCase()
      );
    }
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
    if (searchText.trim() && searchText.length > 3) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        (row: any) =>
          row?.userAccountName?.toLowerCase().includes(search) ||
          row?.accountBalance?.name?.toLowerCase().includes(search) ||
          row?.accountBalance?.accountNumber?.toLowerCase().includes(search),
      );
    }

    const withAccountDetails = filtered.map((row: any) => ({
      ...row,
      accountDetails: {
        name: row?.accountBalance?.name || '',
        accountNumber: row?.accountBalance?.number || ''
      },
      links: {
        href: row?.links?.href || '#',
        text: t(row?.links?.text).toLocaleUpperCase()
      }
    }));

    return withAccountDetails;
  }, [filters, searchText]);

  // Memoize callbacks
  const handleFilterOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setFilterDialogOpen(true);
    setFilterAnchorEl(event.currentTarget);
    setDownloadDialogOpen(false);
    setDownloadAnchorEl(null);
  }, []);

  const handleFilterClose = useCallback(() => {
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
    setDownloadDialogOpen(false);
    setDownloadAnchorEl(null);
  }, []);

  const handleFilterApply = useCallback((appliedFilters: any) => {
    setFilters(appliedFilters);
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
    setDownloadDialogOpen(false);
    setDownloadAnchorEl(null);
    setSelectedRows([]); // Clear selections when filters are applied
  }, []);

  const handleDeleteOpen = useCallback((count:number = 0) => {
    setDeleteDialogOpen(true);
    // conformation box message here based on action
    setConfirmBoxMessage({
      buttonLabel:`Yes, delete the selected items`,
      itemLabel: `${count} Payment marked for deletion.`,
      itemLabel1:`Are you sure you want to delete the ${count} payment selected.`,
      itemLabel2:`This action cannot be undone.`
    });
    // based on the condition switch the call
    /*setConfirmBoxMessage({
      buttonLabel:`DELETE ELIGIBLE ITEMS`,
      itemLabel: `Some user account can't be deleted.`,
      itemLabel1:`The selected user account include item that cannot be deleted because of their current status.`,
      itemLabel2:``
    });*/

    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
    setDownloadDialogOpen(false);
  }, []);

  //const handleDeleteClose = useCallback(() => setDeleteDialogOpen(false), []);
  
      const handleDeleteClose = () => {
        setDeleteDialogOpen(false);
      };

      const handleDeleteConfirm = () => {
        setAlertMessage(t('userAccountDeletedSuccess'));  //t('userAccountDeletedSuccess')// based on api resp use userAccountDeletedSuccessApproval
        setSnackbarOpen(true);
        setDeleteDialogOpen(false);
      };

      const handleDeleteCancel = () => {
        //close button 
        setDeleteDialogOpen(false);
      };


  const handleDownloadOpen = useCallback(() => {
    setDownloadDialogOpen(true);
    setDownloadAnchorEl(tableContainerRef.current);
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
  }, []);

  const handleDownloadClose = useCallback(() => {
    setDownloadDialogOpen(false);
    setFilterDialogOpen(false);
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
  }, []);

  const handleDownload = useCallback(({ format, sortBy }: any) => {
    setDownloadDialogOpen(false);
    setDownloadAnchorEl(null);
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
  }, []);

  const handleCheckboxClick = useCallback(
    (rows: any | any[]) => {
      if (Array.isArray(rows)) {
        // Check for special flags from DataTable
        const isSelectAllOperation = rows.length > 0 && rows[0]?.__selectAllFlag;
        const isDeselectOperation = rows.length > 0 && rows[0]?.__deselectFlag;
        
        if (isSelectAllOperation) {
          // Select all on current page: add these rows to existing selections
          setSelectedRows(prev => {
            const existingMap = new Map(prev.map((row: any) => [row.id, row]));
            // Remove the flag and add rows
            rows.forEach((row: any) => {
              const { __selectAllFlag, ...cleanRow } = row;
              existingMap.set(cleanRow.id, cleanRow);
            });
            return Array.from(existingMap.values());
          });
        } else if (isDeselectOperation) {
          // Deselect all on current page: remove these rows from existing selections
          const idsToRemove = new Set(rows.map((r: any) => r.id));
          setSelectedRows(prev => prev.filter((row: any) => !idsToRemove.has(row.id)));
        } else {
          // Individual checkbox click: DataTable sends complete selection state
          // Just replace with what we received (DataTable already handles the toggle logic)
          setSelectedRows(rows);
        }
      } else {
        // Legacy support: Handle single row object (not from DataTable)
        const rowId = rows?.id;
        if (rowId) {
          setSelectedRows(prev => {
            const existingMap = new Map(prev.map((row: any) => [row.id, row]));
            
            if (existingMap.has(rowId)) {
              // Deselect: remove this row from selected state
              existingMap.delete(rowId);
            } else {
              // Select: add this row to selected state
              existingMap.set(rowId, rows);
            }
            
            return Array.from(existingMap.values());
          });
        } else {
          // Clear all selections if invalid row
          setSelectedRows([]);
        }
      }
    },
    [],
  );

  const handleRemoveFilters = useCallback(() => {
    setFilters({});
    setSearchText('');
    setSelectedRows([]); // Clear selections when filters are removed
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const handlePerPageChange = useCallback((newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  }, []);

  // Handle link click for manage beneficiary
  const handleLinkClick = useCallback((row: any, index: number, link: any) => {
    router.push(link.href);
  }, [router]);

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
  }, [handleFilterOpen, t]);

  // Memoize action buttons for right panel
  const rightPanelButtons = useMemo(() => {
    const count = selectedRows.length;
    const hasFilters = Object.keys(filters).length > 0 || searchText.trim().length > 0;

    return (
      <ListRightPanelActions
        selectedCount={count}
        hasFilters={hasFilters}
        onRemoveFilters={handleRemoveFilters}
        //onDownloadClick={handleDownloadOpen}  enable download button comment
        onDeleteClick={()=>handleDeleteOpen(count)}
      />
    );
  }, [selectedRows.length, filters, searchText, handleRemoveFilters, handleDownloadOpen, handleDeleteOpen, t]);

    // Memoize table head cells
    const tableHeadCells = useMemo(
        () => [
            { id: 'userAccountName', label: t('userAccountName'), numeric: false, colWidth: '200px', },
            { id: 'userAccountId', label: t('userAccountId'), numeric: false, colWidth: '200px', disableSort: true },
            { id: 'userName', label: t('userName'), numeric: false, colWidth: '200px', disableSort: true },
            { id: 'adminRole', label: t('adminRole'), numeric: false, colWidth: '150px', disableSort: true },
            { id: 'authClass', label: t('authClass'), numeric: false, colWidth: '200px', disableSort: true },
            { id: 'status', label: t('status'), numeric: false, colWidth: '150px', disableSort: true },
            { id: 'links', label: t('quickLinks'), numeric: false, disableSort: true, colWidth: '200px' },
        ],
        [t],
    );

  // Determine empty state message
  const hasActiveFilters = Object.keys(filters).length > 0 || searchText.trim().length > 0;
  const isEmpty = mappedRows.length === 0;
  const emptyStateMessage = isEmpty && hasActiveFilters ? 'noResultFound' : isEmpty ? 'noUserAccountYet' : '';

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
      emptyStateMessage,
    }),
    [tableHeadCells, mappedRows, emptyStateMessage],
  );

  // Memoize breadcrumb links
  const breadcrumbLinks = useMemo(
    () => [
      { href: '/', label: t('dashboard') },
      { href: '/user-accounts', label: t('userAccounts') },
    ],
    [t],
  );

  return (
    <section className={styles.container}>
      <BreadcrumbList links={breadcrumbLinks} />
      <Grid
        size={12}
        className={styles.headerRow}
      >
          <Heading as="h4" fontSize="28px">
            {t('userAccounts')}
          </Heading>
          <Button
            buttonVariant="secondary"
            startIcon={<Icon name="add" width="24" height="24" bgColor='#0051FF' />}
            onClick={() => router.push('/user-accounts/create-user-account' as any)}
          >
            {t('createAccount')}
          </Button>
      </Grid>
      <section className={styles.tabContent}>
        <Grid size={12} className={styles.searchRow}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder={t('searchUserAccounts')}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            InputProps={
              {
                startAdornment: (
                  <InputAdornment position="start"><Icon name="search" width='32' height='32' bgColor={theme.palette.navy.main} /></InputAdornment>
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
            isLoading={isLoading}
          />
          <UserAccountsFilterDialog
            open={filterDialogOpen}
            anchorEl={filterAnchorEl}
            onClose={handleFilterClose}
            onApply={handleFilterApply}
            initialValues={filters}
          />
          <DownloadDebtorDialog
            open={downloadDialogOpen}
            anchorEl={downloadAnchorEl}
            onClose={handleDownloadClose}
            onDownload={handleDownload}
            title={`${t('download')} ${t('userAccounts')?.toLocaleLowerCase()}`}
          />
          <DeleteConfirmationDialog
            open={deleteDialogOpen}
            primaryCTALabel={confirmBoxMessage.buttonLabel}
            onClose={handleDeleteClose}
            onPrimaryCTA={handleDeleteConfirm}
            onSecondaryCTA={handleDeleteCancel}
            selectedCount={selectedRows.length}
            itemLabel={confirmBoxMessage.itemLabel}
            itemLabel2={confirmBoxMessage.itemLabel1}
            itemLabel3={confirmBoxMessage.itemLabel2}
            markedCount={selectedRows.length}
            
          />
          <CommonSnackbar
            open={snackbarOpen}
            onClose={() => setSnackbarOpen(false)}
            message={alertMessage}
            severity="success"
          />
        </section>
      </section>
    </section>
  );
};
export default UserAccounts;
