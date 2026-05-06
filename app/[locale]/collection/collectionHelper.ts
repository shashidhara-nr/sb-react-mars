import { useTranslations } from 'next-intl';
import { ApiDebtorItem } from '@lib/api/debtorApi';

export type DebtorRow = {
	id: string;
	debtorName: string;
	debtorCode: string;
	links?: { text: string; href?: string };
};

export const TABLE_COLUMNS = [
	'id',
	'debtorName',
	'debtorCode',
	{ key: 'links', type: 'link' },
] as const;

export const getTableHeadCells = (t: ReturnType<typeof useTranslations>) => [
	{ id: 'id', label: t('tableColumnCollectionId'), numeric: false, disableSort: true },
	{ id: 'debtorName', label: t('tableColumnDebtorName'), numeric: false, disableSort: false },
	{ id: 'debtorCode', label: t('tableColumnDebtorCode'), numeric: false, disableSort: false },
	{ id: 'links', label: t('tableColumnQuickLinks'), numeric: false, disableSort: true },
] as const;

export type HistoryRow = {
  collection_id: string;
  date: string;
  currency: string;
  amount: string;
  status: { value: string; color: 'success' | 'warning' | 'error' | 'default' };
};

export const HISTORY_TABLE_COLUMNS = [
  'collection_id',
  'date',
  'currency',
  'amount',
  { key: 'status', type: 'chip' },
] as const;

export const getHistoryTableHeadCells = (t: ReturnType<typeof useTranslations>) => [
  { id: 'collection_id', label: t('tableColumnCollectionId'), numeric: false },
  { id: 'date', label: t('tableColumnDate'), numeric: false },
  { id: 'currency', label: t('tableColumnCurrency'), numeric: false },
  { id: 'amount', label: t('tableColumnAmount'), numeric: false },
  { id: 'status', label: t('tableColumnStatus'), numeric: false },
] as const;

export const navlinks = {
	dashboard: '/',
	collection: '/collection',
	history: '/collection/history',
};

export const transformDebtorsToRows = (
	debtors: ApiDebtorItem[],
	quickLinkText: string
): DebtorRow[] => {
	return debtors.map((debtor) => ({
		id: debtor.referenceIDX || '',
		debtorName: debtor.counterPartyName || '',
		debtorCode: debtor.referenceIDX || '',
		links: { text: quickLinkText, href: `#` },
	}));
};

export const formatCurrency = (value: number | string): string => {
	const num = typeof value === 'string' ? parseFloat(value) : value;
	return isNaN(num) ? '0.00' : num.toFixed(2);
};

export const formatDate = (dateString: string): string => {
	if (!dateString) return '';
	const date = new Date(dateString);
	const day = date.getDate().toString().padStart(2, '0');
	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	const month = months[date.getMonth()];
	const year = date.getFullYear();
	return `${day} ${month} ${year}`;
};

export const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
	if (status === 'ACT') return 'success';
	if (status === 'TS') return 'warning';
	return 'default';
};

export const getStatusDisplayText = (status: string): string => {
	if (status === 'ACT') return 'Processed';
	if (status === 'TS') return 'Processing';
	return status;
};

export const transformCollectionHistoryToRows = (data: any[]): HistoryRow[] => {
	if (!data || !Array.isArray(data)) return [];
	
	return data.map((item) => ({
		collection_id: item.collectionId || '',
		date: formatDate(item.date),
		currency: item.currency || '',
		amount: formatCurrency(item.amount),
		status: {
			value: getStatusDisplayText(item.authoriseStatus || item.status || ''),
			color: getStatusColor(item.authoriseStatus || item.status || ''),
		},
	}));
};