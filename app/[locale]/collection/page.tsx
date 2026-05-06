'use client'

import { useMemo, useState, useCallback } from 'react';
import { Box, Grid, Tabs, Tab, TextField, InputAdornment } from '@mui/material';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Breadcrumb, Heading, TableWrapper, Loader } from 'dist/standard-bank-react';
import { CommonSnackbar, ListRightPanelActions } from 'components/common';
import EmptyState from 'components/common/EmptyState';
import { useRouter } from 'next/navigation';
import styles from './collection.module.scss';

import { SearchIcon, FunnelIcon, DownloadIcon, IcnInfoCircleBlack } from 'lib/icons';
import CollectionHistoryFilterDialog from '@molecules/CollectionHistoryFilterDialog';
import DownloadCollectionDialog from '@molecules/DownloadCollectionDialog';
import { navlinks, TABLE_COLUMNS, getTableHeadCells, transformDebtorsToRows, type DebtorRow } from './collectionHelper';
import { buildTestId } from 'src/utils/testIds';
import { useCollection } from '@lib/hooks/useCollection';

function CollectionsPage() {
	const testIdPrefix = 'collections-page';
	const t = useTranslations('collections');
	const router = useRouter();
	const [selectedTab, setSelectedTab] = useState(2); // 0: Track, 1: Reports, 2: History
	const [searchText, setSearchText] = useState('');
	const [selectedRows, setSelectedRows] = useState<DebtorRow[]>([]);
	const [isFilterApplied, setIsFilterApplied] = useState(false);
	const [filterDialogOpen, setFilterDialogOpen] = useState(false);
	const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
 	const [snackbarOpen, setSnackbarOpen] = useState(false);
	const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
	const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);

	const { debtors, loading, pageSize, currentPage, rowCount, filters, hasFilters, sortBy, sortAsc, setFilters, clearFilters, handlePageChange, handlePerPageChange, handleSort } = useCollection();

	const breadcrumbLinks = useMemo(
		() => [
			{ href: navlinks.dashboard, label: t('dashboard') },
			{ href: navlinks.collection, label: t('breadcrumbCollections') },
		],
		[t]
	);

	const tableHeadCells = useMemo(() => getTableHeadCells(t), [t]);

	const allRows: DebtorRow[] = useMemo(() => {
		return transformDebtorsToRows(debtors, t('quickLinkViewHistory'));
	}, [debtors, t]);

	const tableData = useMemo(() => ({
		columns: TABLE_COLUMNS as any,
		headCells: tableHeadCells as any,
		rows: allRows,
		rowsPerPage: pageSize,
		rowButton: false,
	}), [tableHeadCells, allRows, pageSize]);

	const onPageChange = useCallback((newPage: number) => {
		handlePageChange(newPage);
		setSelectedRows([]);
	}, [handlePageChange]);

	const onPerPageChange = useCallback((newPerPage: number) => {
		handlePerPageChange(newPerPage);
		setSelectedRows([]);
	}, [handlePerPageChange]);

	const handleRemoveFilters = useCallback(() => {
		clearFilters();
		setSearchText('');
	}, [clearFilters]);

	const hasFiltersOrSearch = useMemo(
		() => hasFilters || searchText.trim().length > 0,
		[hasFilters, searchText]
	);

	const rightPanelButtons = useMemo(() => (
		<ListRightPanelActions
			selectedCount={selectedRows.length}
			hasFilters={hasFiltersOrSearch}
			onRemoveFilters={handleRemoveFilters}
		/>
	), [selectedRows.length, hasFiltersOrSearch, handleRemoveFilters]);

	const filterButtons = useMemo(() => {
		const buttons = [
			{
				children: (
					<>
							<Image src={FunnelIcon} alt={t('altIconFilter')} width={16} height={16} style={{ marginRight: 4 }} />
							{t('buttonFilter')}
					</>
				),
				buttonVariant: 'tertiary',
				'data-testid': buildTestId(testIdPrefix, 'filter-button'),
				onClick: (event: any) => {
					setFilterDialogOpen(true);
					setFilterAnchorEl(event?.currentTarget ?? null);
				},
			},
		];

		// Only show download button when filters/search are applied AND there are results
		if (hasFiltersOrSearch && allRows.length > 0) {
			buttons.unshift({
				children: (<><Image src={DownloadIcon} alt={t('altIconDownload')} width={16} height={16} style={{ marginRight: 4 }} />{t('buttonDownload')}</>),
				buttonVariant: 'tertiary',
				'data-testid': buildTestId(testIdPrefix, 'download-button'),
				onClick: (event: any) => {
					setDownloadDialogOpen(true);
					setDownloadAnchorEl(event?.currentTarget ?? null);
				},
			});
		}

		return buttons;
	}, [t, allRows.length, hasFiltersOrSearch]);

	const handleCheckboxClick = useCallback((rows: any | any[]) => {
		const selected = Array.isArray(rows) ? rows : rows ? [rows] : [];
		setSelectedRows(selected as DebtorRow[]);
	}, []);

	const handleQuickLinkClick = useCallback((row: DebtorRow) => {
		const params = new URLSearchParams({ name: row.debtorName, code: row.debtorCode });
		router.push(`${navlinks.history}?${params.toString()}` as any);
	}, [router]);

	const handleDownload = useCallback((payload: { format: string; sortBy: string }) => {
		// Sort the data
		const sortedData = [...allRows].sort((a, b) => {
			const comparison = a.debtorName.localeCompare(b.debtorName);
			return payload.sortBy === 'ascending' ? comparison : -comparison;
		});

		// Generate filename
		const timestamp = new Date().toISOString().split('T')[0];
		const filename = `debtor-history-${timestamp}`;

		// Export based on format
		if (payload.format === 'csv') {
			exportToCSV(sortedData, filename);
		} else if (payload.format === 'txt') {
			exportToTXT(sortedData, filename);
		} else if (payload.format === 'pdf') {
			exportToPDF(sortedData, filename);
		}

		setDownloadDialogOpen(false);
		setDownloadAnchorEl(null);
		setSnackbarOpen(true);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [allRows]);

	const exportToCSV = (data: DebtorRow[], filename: string) => {
		const headers = ['Debtor Name', 'Debtor Code'];
		const csvContent = [
			headers.join(','),
			...data.map(row => `"${row.debtorName}","${row.debtorCode}"`)
		].join('\n');

		downloadFile(csvContent, `${filename}.csv`, 'text/csv');
	};

	const exportToTXT = (data: DebtorRow[], filename: string) => {
		const txtContent = [
			'DEBTOR HISTORY REPORT',
			'='.repeat(50),
			'',
			...data.map((row, index) => 
				`${index + 1}. ${row.debtorName} (${row.debtorCode})`
			),
			'',
			`Total Records: ${data.length}`,
			`Generated: ${new Date().toLocaleString()}`
		].join('\n');

		downloadFile(txtContent, `${filename}.txt`, 'text/plain');
	};

	const exportToPDF = (data: DebtorRow[], filename: string) => {
		// Create a simple HTML table for PDF export
		const htmlContent = `
			<!DOCTYPE html>
			<html>
			<head>
				<title>Debtor History</title>
				<style>
					body { font-family: Arial, sans-serif; padding: 20px; }
					h1 { color: #003366; }
					table { width: 100%; border-collapse: collapse; margin-top: 20px; }
					th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
					th { background-color: #003366; color: white; }
				tr:nth-of-type(even) { background-color: #f2f2f2; }
					.footer { margin-top: 20px; font-size: 12px; color: #666; }
				</style>
			</head>
			<body>
				<h1>Debtor History Report</h1>
				<p>Generated: ${new Date().toLocaleString()}</p>
				<table>
					<thead>
						<tr>
							<th>#</th>
							<th>Debtor Name</th>
							<th>Debtor Code</th>
						</tr>
					</thead>
					<tbody>
						${data.map((row, index) => `
							<tr>
								<td>${index + 1}</td>
								<td>${row.debtorName}</td>
								<td>${row.debtorCode}</td>
							</tr>
						`).join('')}
					</tbody>
				</table>
				<div class="footer">
					<p>Total Records: ${data.length}</p>
				</div>
			</body>
			</html>
		`;

		// Convert HTML to PDF using print
		const printWindow = window.open('', '_blank');
		if (printWindow) {
			printWindow.document.write(htmlContent);
			printWindow.document.close();
			printWindow.onload = () => {
				printWindow.print();
				setTimeout(() => printWindow.close(), 100);
			};
		}
	};

	const downloadFile = (content: string, filename: string, mimeType: string) => {
		const blob = new Blob([content], { type: mimeType });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		link.remove();
		URL.revokeObjectURL(url);
	};

	return (
		<Grid container spacing={2} sx={{ pb: 2 }} data-testid={buildTestId(testIdPrefix, 'container')}>
			<Grid size={12} sx={{ mb: 0.5, mt: 1 }} data-testid={buildTestId(testIdPrefix, 'breadcrumbs')}>
				<Breadcrumb links={breadcrumbLinks} />
			</Grid>

			<Grid size={12} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: '40px', mb: 0.5 }} data-testid={buildTestId(testIdPrefix, 'header')}>
				<Heading as="h4" fontSize="24px">{t('collectionsPageHeading')}</Heading>
				{/* Optional: action button placeholder */}
				<Box />
			</Grid>

			{/* Tabs: Track | Reports | History */}
			<Grid size={12} data-testid={buildTestId(testIdPrefix, 'tabs-container')}>
				<Tabs
					value={selectedTab}
					onChange={(_, v) => setSelectedTab(v)}
					aria-label="collections tabs"
					data-testid={buildTestId(testIdPrefix, 'tabs')}
					TabIndicatorProps={{ style: { display: 'none' } }}
					className={styles.tabsSection}
					sx={(theme) => ({
						'& .MuiTab-root': {
							color: theme.palette.text.primary,
						},
						'& .MuiTab-root.Mui-selected': {
							backgroundColor: theme.palette.primary.main,
							color: theme.palette.common.white,
						},
					})}
				>
				<Tab label={t('tabTrack')} value={0} data-testid={buildTestId(testIdPrefix, 'tab-track')} />
				<Tab label={t('tabReports')} value={1} data-testid={buildTestId(testIdPrefix, 'tab-reports')} />
				<Tab label={t('tabHistory')} value={2} data-testid={buildTestId(testIdPrefix, 'tab-history')} />
				</Tabs>
			</Grid>

			{/* Search field */}
			<Grid size={12} sx={{ mt: 1 }} data-testid={buildTestId(testIdPrefix, 'search-container')}>
				<TextField
					fullWidth
					variant="outlined"
					placeholder={allRows.length === 0 ? t('searchPlaceholderEmpty') : t('searchPlaceholder')}
					value={searchText}
					onChange={(e) => setSearchText(e.target.value)}
					inputProps={{
						'data-testid': buildTestId(testIdPrefix, 'search-input')
					}}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<Image src={SearchIcon} alt={t('altIconSearch')} width={32} height={32} />
							</InputAdornment>
						),
					}}
					className={styles.searchField}
				/>
			</Grid>

			{/* Table container */}
			<Grid
				size={12}
				className={styles.tableContainerGrid}
				data-testid={buildTestId(testIdPrefix, 'table-container')}
			>
				{loading ? (
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							minHeight: '400px',
						}}
					>
						<Loader backgroundColor="transparent" />
					</Box>
				) : (
					<Box sx={{ minWidth: 320, width: '100%' }}>
						<TableWrapper
							dataSets={[tableData]}
							filterButtons={filterButtons as any}
							onCheckboxClick={handleCheckboxClick}
							selectedRows={selectedRows}
							onQuickLinkClick={(row: any) => handleQuickLinkClick(row as DebtorRow)}
							onPageChange={onPageChange}
							onPerPageChange={onPerPageChange}
							serverSidePagination={true}
							totalRecords={rowCount}
							page={currentPage}
							rowsPerPage={pageSize}
							tableIndex={0}
							isFilterApplied={isFilterApplied}
							rightPanelContent={rightPanelButtons}
							serverSideSorting={true}
							onSort={handleSort}
							externalOrder={sortAsc ? 'asc' : 'desc'}
							externalOrderBy={sortBy}
							sx={{ borderRadius: 0, border: 0 }}
							emptyStateContent={
								allRows.length === 0
									? (
										<EmptyState
											title={hasFiltersOrSearch ? t('emptyStateNoResultsTitle') : t('emptyStateNoCollectionsTitle')}
											description={hasFiltersOrSearch ? t('emptyStateNoResultsDescription') : t('emptyStateNoCollectionsDescription')}
											icon={
												<Image 
													src={hasFiltersOrSearch ? SearchIcon : IcnInfoCircleBlack} 
													alt={hasFiltersOrSearch ? t('altIconNoResults') : t('altIconInfo')} 
													width={32} 
													height={32} 
												/>
											}
										/>
									)
									: null
							}
						/>
					</Box>
				)}
			</Grid>
			{/* Filter dialog */}
			<CollectionHistoryFilterDialog
				open={filterDialogOpen}
				anchorEl={filterAnchorEl}
				onClose={() => { setFilterDialogOpen(false); setFilterAnchorEl(null); }}
				onApply={(values) => {
					setFilters(values);
					setIsFilterApplied(Boolean(values.debtorName || values.debtorCode));
					setFilterDialogOpen(false);
					setFilterAnchorEl(null);
				}}
				initialValues={filters}
			/>

			{/* Download dialog */}
			<DownloadCollectionDialog
				open={downloadDialogOpen}
				anchorEl={downloadAnchorEl}
				onClose={() => { setDownloadDialogOpen(false); setDownloadAnchorEl(null); }}
				onDownload={handleDownload}
				title={t('downloadCollectionDialogTitle') || 'Download debtor history'}
			/>

			<CommonSnackbar
					open={snackbarOpen}
					onClose={() => setSnackbarOpen(false)}
					message={t('snackbarDownloadSuccess')}
					severity="success"
				  />
		</Grid>
	);
}

export default CollectionsPage;
