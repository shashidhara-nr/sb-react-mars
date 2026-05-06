import { useTranslations } from 'next-intl';
import { COLLECTION_TYPE_STATUS_CODES } from 'types/redux/collectionTypes';

export const LINK_TEXT = {
	reminder: 'collectionTypesRemind',
	manage: 'collectionTypesManage',
	complete: 'collectionTypesComplete',
} as const;

export type CollectionTypeRow = {
	id: string;
	collectionTypeName: string;
	authorisationProfile: string;
	customerAgreement: string;
	numberOfCount: number;
	status?: { value: string; color?: 'success' | 'warning' | 'error' | 'default' };
	links?: { text: string; href?: string };
	collectionTypeKey?: string;
};

export const TABLE_COLUMNS = [
	'id',
	'collectionTypeName',
	'authorisationProfile',
	'customerAgreement',
	'numberOfCount',
	{ key: 'status', type: 'chip' },
	{ key: 'links', type: 'link' },
] as const;

export const getTableHeadCells = (t: ReturnType<typeof useTranslations>) => [
	{ id: 'id', label: t('id'), numeric: false },
	{ id: 'collectionTypeName', label: t('tableCollectionTypeName'), numeric: false },
	{ id: 'authorisationProfile', label: t('tableAuthorisationProfile'), numeric: false },
	{ id: 'customerAgreement', label: t('tableCustomerAgreement'), numeric: false },
	{ id: 'numberOfCount', label: t('tableNumberOfCount'), numeric: true },
	{ id: 'status', label: t('tableStatus'), numeric: false },
] as const;

export const navlinks = {
	dashboard: '/',
	collectionTypes: '/collection-types',
	setupAndAdmin: '/setup-and-admin/collection-types',
	createCollectionType: '/setup-and-admin/collection-types/create',
	manageCollectionType: (key: string) => `/setup-and-admin/collection-types/manage/${key}`,
	successCollectionType: '/setup-and-admin/collection-types/success',
};

export const getStatusTabs = (t: ReturnType<typeof useTranslations>) => [
	t('allRecords'),
	t('awaitingApproval'),
	t('active'),
	t('draft'),
];

export const getLinkTextByStatus = (status: string | undefined, t: ReturnType<typeof useTranslations>): string => {
	switch (status) {
		case COLLECTION_TYPE_STATUS_CODES.AWAITING_APPROVAL:
			return t('sendReminderLink');
		case COLLECTION_TYPE_STATUS_CODES.DRAFT:
			return t('completeCollectionTypeLink');
		default:
			return t('manageCollectionTypeLink');
	}
};

export const getBreadcrumbLinks = (t: ReturnType<typeof useTranslations>) => [
	{ href: navlinks.dashboard, label: t('dashboard') },
	{ href: navlinks.collectionTypes, label: t('collectionTypesTitle') },
];

export const getCreateBreadcrumbLinks = (t: ReturnType<typeof useTranslations>) => [
	{ href: navlinks.dashboard, label: t('dashboard') },
	{ href: navlinks.setupAndAdmin, label: t('collectionTypesTitle') },
	{ href: navlinks.createCollectionType, label: t('titleCreate') },
];

export const getManageBreadcrumbLinks = (t: ReturnType<typeof useTranslations>) => [
	{ href: navlinks.dashboard, label: t('dashboard') },
	{ href: navlinks.setupAndAdmin, label: t('collectionTypesTitle') },
	{ href: '#', label: t('manageCollectionType') },
];

export const getSuccessBreadcrumbLinks = (t: ReturnType<typeof useTranslations>) => [
	{ href: navlinks.dashboard, label: t('dashboard') },
	{ href: navlinks.setupAndAdmin, label: t('collectionTypesTitle') },
	{ href: navlinks.successCollectionType, label: t('success') },
];

export const getDeleteDialogContent = (
	key: 'delete_active' | 'delete_awaiting' | 'delete_error' | 'delete_manage',
	t: ReturnType<typeof useTranslations>,
	count: number = 0
): { title: string; primary: string; secondary: string; itemLabel: string; itemLabel2: string } => {
	switch (key) {
		case 'delete_active':
			return {
				title: t('deleteActiveTitle'),
				primary: t('deleteActivePrimary'),
				secondary: t('dismiss'),
				itemLabel: t('deleteActiveItemLabel', { count }),
				itemLabel2: t('deleteActiveItemLabel2', { count }),
			};
		case 'delete_awaiting':
			return {
				title: t('deleteAwaitingTitle'),
				primary: t('deleteAwaitingPrimary'),
				secondary: t('dismiss'),
				itemLabel: t('deleteAwaitingItemLabel'),
				itemLabel2: t('deleteAwaitingItemLabel2'),
			};
		case 'delete_error':
			return {
				title: t('deleteErrorTitle'),
				primary: t('deleteErrorPrimary'),
				secondary: t('dismiss'),
				itemLabel: t('deleteErrorItemLabel'),
				itemLabel2: t('deleteErrorItemLabel2'),
			};
		case 'delete_manage':
			return {
				title: '',
				primary: t('deleteActivePrimary'),
				secondary: t('dismiss'),
				itemLabel: t('deleteManageItemLabel'),
				itemLabel2: '',
			};
	}
};

export const TEST_ID_PREFIX = 'collection-types-hub';
