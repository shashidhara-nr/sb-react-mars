import {
	getBreadCrumbs,
	createFilterButtons,
	transformFilterValues,
	handleQuickLinkSelection,
	getSelectedRowIndex,
	getPreviousRow,
	getNextRow,
	getSuccessMessage,
	TIMING,
	DIALOG_CONFIG,
	nonTransactionalAuditRoutes,
} from '../../../app/[locale]/audit-and-approve/non-transactional/nonTransactionalAuditHelper';
import type { EventFilterValues } from '../../../components/molecules/EventFilterDialog';

const createMockT = (translations: Record<string, string> = {}) =>
	((key: string) => translations[key] || key) as any;

describe('nonTransactionalAuditHelper', () => {


	describe('getBreadCrumbs', () => {
		it('should return breadcrumbs with correct structure', () => {
			const mockT = createMockT({ dashboard: 'Dashboard', auditAndApprove: 'Audit', pageTitle: 'Non-Trans' });
			const breadcrumbs = getBreadCrumbs(mockT);

			expect(breadcrumbs).toHaveLength(3);
			expect(breadcrumbs[0]).toEqual({ href: '/', label: 'Dashboard' });
			expect(breadcrumbs[2].href).toBe('/audit-and-approve/non-transactional');
		});
	});

	describe('createFilterButtons', () => {
		it('should return filter configuration and execute callback', () => {
			const mockT = createMockT({ filter: 'Filter', altFilter: 'Alt' });
			const mockOnClick = jest.fn();
			const config = createFilterButtons(mockT, mockOnClick);

			expect(config.buttonVariant).toBe('tertiary');
			expect(config.filterLabel).toBe('Filter');
			config.onClick({} as any);
			expect(mockOnClick).toHaveBeenCalled();
		});
	});

	describe('transformFilterValues', () => {
		it('should transform filter values correctly', () => {
			const testDate = new Date('2024-01-01');
			const filters: EventFilterValues = {
				userAccountName: 'John',
				eventFunction: 'User Mgmt',
				entityName: 'User',
				initiatorUserId: 'user123',
				valueDate: testDate,
			};
			const result = transformFilterValues(filters);
			expect(result).toEqual({
				userAccountName: 'John',
				eventFunction: 'User Mgmt',
				entityName: 'User',
				initiatorUserId: 'user123',
				valueDate: testDate.toISOString(),
			});
		});
	});

	describe('handleQuickLinkSelection', () => {
		const rows = [{ id: '1' }, { id: '2' }, { id: '3' }];

		it('should return selected rows for multi-selection or empty array otherwise', () => {
			expect(handleQuickLinkSelection(rows[0], [rows[0], rows[1]])).toEqual([rows[0], rows[1]]);
			expect(handleQuickLinkSelection(rows[0], [rows[0]])).toEqual([]);
			expect(handleQuickLinkSelection(rows[2], [rows[0]])).toEqual([]);
			expect(handleQuickLinkSelection(rows[0], [])).toEqual([]);
		});
	});

	describe('getSelectedRowIndex', () => {
		const rows = [{ id: '1' }, { id: '2' }, { id: '3' }];

		it('should return correct index or default values', () => {
			expect(getSelectedRowIndex(rows[1], rows)).toBe(1);
			expect(getSelectedRowIndex(null, rows)).toBe(-1);
			expect(getSelectedRowIndex(rows[0], [])).toBe(0);
			expect(getSelectedRowIndex({ id: '999' }, rows)).toBe(0);
		});
	});

	describe('getPreviousRow', () => {
		const rows = [{ id: '1' }, { id: '2' }, { id: '3' }];

		it('should return previous row or null', () => {
			expect(getPreviousRow(rows[1], rows)).toEqual(rows[0]);
			expect(getPreviousRow(rows[0], rows)).toBeNull();
			expect(getPreviousRow(null, rows)).toBeNull();
			expect(getPreviousRow(rows[0], [rows[0]])).toBeNull();
		});
	});

	describe('getNextRow', () => {
		const rows = [{ id: '1' }, { id: '2' }, { id: '3' }];

		it('should return next row or null', () => {
			expect(getNextRow(rows[1], rows)).toEqual(rows[2]);
			expect(getNextRow(rows[2], rows)).toBeNull();
			expect(getNextRow(null, rows)).toBeNull();
			expect(getNextRow(rows[0], [rows[0]])).toBeNull();
		});
	});

	describe('getSuccessMessage', () => {
		const mockT = createMockT({
			auditSuccess: 'Audited',
			approveSuccess: 'Approved',
			declineSuccess: 'Declined',
		});

		it('should return correct success message based on action and mode', () => {
			expect(getSuccessMessage('audit', true, mockT)).toBe('Audited');
			expect(getSuccessMessage('approve', false, mockT)).toBe('Approved');
			expect(getSuccessMessage('decline', true, mockT)).toBe('Declined');
			expect(getSuccessMessage('decline', false, mockT)).toBe('Declined');
		});
	});
});
