import {
	DebtorRow,
	TABLE_COLUMNS,
	HistoryRow,
	HISTORY_TABLE_COLUMNS,
	getTableHeadCells,
	getHistoryTableHeadCells,
	navlinks,
} from '../../app/[locale]/collection/collectionHelper';

const createMockT = (translations: Record<string, string> = {}) =>
	((key: string) => translations[key] || key) as ReturnType<
		typeof import('next-intl').useTranslations
	>;

describe('collectionHelper', () => {
	describe('TABLE_COLUMNS', () => {
		it('should have correct structure and content', () => {
			expect(TABLE_COLUMNS).toHaveLength(4);
			expect(TABLE_COLUMNS).toContain('id');
			expect(TABLE_COLUMNS).toContain('debtorName');
			expect(TABLE_COLUMNS).toContain('debtorCode');
			expect(TABLE_COLUMNS.find((col) => typeof col === 'object' && col.key === 'links')).toEqual({
				key: 'links',
				type: 'link',
			});
		});
	});

	describe('HISTORY_TABLE_COLUMNS', () => {
		it('should have correct structure and content', () => {
			expect(HISTORY_TABLE_COLUMNS).toHaveLength(5);
			['collection_id', 'date', 'currency', 'amount'].forEach((col) => {
				expect(HISTORY_TABLE_COLUMNS).toContain(col);
			});
			expect(
				HISTORY_TABLE_COLUMNS.find((col) => typeof col === 'object' && col.key === 'status')
			).toEqual({ key: 'status', type: 'chip' });
		});
	});

	describe('getTableHeadCells', () => {
		it('should return correct head cells with translations', () => {
			const mockT = createMockT({
				tableColumnCollectionId: 'Collection ID',
				tableColumnDebtorName: 'Debtor Name',
				tableColumnDebtorCode: 'Debtor Code',
				tableColumnQuickLinks: 'Quick Links',
			});

			const cells = getTableHeadCells(mockT);

			expect(cells).toHaveLength(4);
			expect(cells.map((c) => c.id)).toEqual(['id', 'debtorName', 'debtorCode', 'links']);
			expect(cells.map((c) => c.label)).toEqual([
				'Collection ID',
				'Debtor Name',
				'Debtor Code',
				'Quick Links',
			]);
			cells.forEach((cell) => {
				expect(cell.numeric).toBe(false);
				expect(cell).toHaveProperty('id');
				expect(cell).toHaveProperty('label');
			});
		});
	});

	describe('getHistoryTableHeadCells', () => {
		it('should return correct head cells with translations', () => {
			const mockT = createMockT({
				tableColumnCollectionId: 'Collection ID',
				tableColumnDate: 'Date',
				tableColumnCurrency: 'Currency',
				tableColumnAmount: 'Amount',
				tableColumnStatus: 'Status',
			});

			const cells = getHistoryTableHeadCells(mockT);

			expect(cells).toHaveLength(5);
			expect(cells.map((c) => c.id)).toEqual([
				'collection_id',
				'date',
				'currency',
				'amount',
				'status',
			]);
			expect(cells.map((c) => c.label)).toEqual([
				'Collection ID',
				'Date',
				'Currency',
				'Amount',
				'Status',
			]);
			cells.forEach((cell) => {
				expect(cell.numeric).toBe(false);
				expect(cell).toHaveProperty('id');
				expect(cell).toHaveProperty('label');
			});
		});
	});

	describe('navlinks', () => {
		it('should have correct navigation routes', () => {
			expect(navlinks.dashboard).toBe('/');
			expect(navlinks.collection).toBe('/collection');
			expect(navlinks.history).toBe('/collection/history');
			expect(Object.keys(navlinks)).toHaveLength(3);
		});
	});

	describe('Type Definitions', () => {
		it('should create valid DebtorRow instances', () => {
			const debtor: DebtorRow = {
				id: '123',
				debtorName: 'John Doe',
				debtorCode: 'D001',
				links: { text: 'View', href: '/details' },
			};

			expect(debtor.id).toBe('123');
			expect(debtor.debtorName).toBe('John Doe');
			expect(debtor.debtorCode).toBe('D001');
			expect(debtor.links?.text).toBe('View');
		});

		it('should create valid HistoryRow instances', () => {
			const history: HistoryRow = {
				collection_id: 'COLL001',
				date: '2024-01-15',
				currency: 'USD',
				amount: '1000',
				status: { value: 'Completed', color: 'success' },
			};

			expect(history.collection_id).toBe('COLL001');
			expect(history.date).toBe('2024-01-15');
			expect(history.currency).toBe('USD');
			expect(history.amount).toBe('1000');
			expect(history.status.value).toBe('Completed');
			expect(history.status.color).toBe('success');
		});
	});
});
