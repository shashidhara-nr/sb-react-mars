import { useTranslations } from 'next-intl';
import {
	getTableHeadCells,
	getStatusTabs,
	getLinkTextByStatus,
	getBreadcrumbLinks,
	getDeleteDialogContent,
	navlinks,
	TABLE_COLUMNS,
	TEST_ID_PREFIX,
	LINK_TEXT,
} from '../../../app/[locale]/setup-and-admin/collection-types/collectionTypesHelper';
import { COLLECTION_TYPE_STATUS_CODES } from 'types/redux/collectionTypes';

jest.mock('next-intl');

describe('collectionTypesHelper', () => {
	const mockTranslate = jest.fn((key: string) => key);

	beforeEach(() => {
		jest.clearAllMocks();
		(useTranslations as jest.Mock).mockReturnValue(mockTranslate);
	});

	it('exports expected constants and navlinks', () => {
		expect(TABLE_COLUMNS).toEqual([
			'id',
			'collectionTypeName',
			'authorisationProfile',
			'customerAgreement',
			'numberOfCount',
			{ key: 'status', type: 'chip' },
			{ key: 'links', type: 'link' },
		]);
		expect(TEST_ID_PREFIX).toBe('collection-types-hub');
		expect(LINK_TEXT).toEqual({
			reminder: 'collectionTypesRemind',
			manage: 'collectionTypesManage',
			complete: 'collectionTypesComplete',
		});
		expect(navlinks.dashboard).toBe('/');
		expect(navlinks.collectionTypes).toBe('/collection-types');
		expect(navlinks.setupAndAdmin).toBe('/setup-and-admin/collection-types');
		expect(navlinks.createCollectionType).toBe('/setup-and-admin/collection-types/create');
		expect(navlinks.manageCollectionType('123')).toBe('/setup-and-admin/collection-types/manage/123');
	});

	it('builds translated table head cells and tabs', () => {
		const t = useTranslations();
		expect(getTableHeadCells(t)).toEqual([
			{ id: 'id', label: 'id', numeric: false },
			{ id: 'collectionTypeName', label: 'tableCollectionTypeName', numeric: false },
			{ id: 'authorisationProfile', label: 'tableAuthorisationProfile', numeric: false },
			{ id: 'customerAgreement', label: 'tableCustomerAgreement', numeric: false },
			{ id: 'numberOfCount', label: 'tableNumberOfCount', numeric: true },
			{ id: 'status', label: 'tableStatus', numeric: false },
		]);
		expect(getStatusTabs(t)).toEqual(['allRecords', 'awaitingApproval', 'active', 'draft']);
	});

	it('maps status to link text translation keys', () => {
		const t = useTranslations();
		const cases: Array<[string | undefined, string]> = [
			[COLLECTION_TYPE_STATUS_CODES.AWAITING_APPROVAL, 'sendReminderLink'],
			[COLLECTION_TYPE_STATUS_CODES.DRAFT, 'completeCollectionTypeLink'],
			[COLLECTION_TYPE_STATUS_CODES.ACTIVE, 'manageCollectionTypeLink'],
			[undefined, 'manageCollectionTypeLink'],
			['Unknown Status', 'manageCollectionTypeLink'],
		];

		for (const [status, expected] of cases) {
			mockTranslate.mockClear();
			expect(getLinkTextByStatus(status as any, t)).toBe(expected);
			expect(mockTranslate).toHaveBeenCalledWith(expected);
		}
	});

	it('builds breadcrumbs with translations', () => {
		const t = useTranslations();
		expect(getBreadcrumbLinks(t)).toEqual([
			{ href: '/', label: 'dashboard' },
			{ href: '/collection-types', label: 'collectionTypesTitle' },
		]);
	});

	it('builds delete dialog content variants', () => {
		const t = useTranslations();
		const cases: Array<[any, number | undefined, string]> = [
			['delete_active', 2, 'deleteActiveTitle'],
			['delete_active', undefined, 'deleteActiveTitle'],
			['delete_awaiting', undefined, 'deleteAwaitingTitle'],
			['delete_error', undefined, 'deleteErrorTitle'],
		];

		for (const [key, count, title] of cases) {
			mockTranslate.mockClear();
			const content = getDeleteDialogContent(key, t, count as any);
			expect(content.title).toBe(title);
		}
	});
});
