import {
	DEFAULT_FORM_STATE,
	DEFAULT_FILE_UPLOAD_STATE,
	DEFAULT_STATEMENT_REFERENCING_STATE,
	DEFAULT_HOST_TO_HOST_STATE,
	DEFAULT_UNPAID_PROCESSING_STATE,
	getStatusByTabIndex,
	getStatusTabLabels,
	TABLE_COLUMNS,
	getTableHeadCells,
	navlinks,
	STATUS_TAB_VALUES,
} from '../../../app/[locale]/setup-and-admin/payment-types/paymentTypesHelper';

describe('paymentTypesHelper', () => {
	it('exports default form-related states with expected shapes', () => {
		expect(DEFAULT_FORM_STATE).toEqual(
			expect.objectContaining({
				name: expect.any(String),
				currency: expect.any(String),
				allowAdHoc: expect.any(Boolean),
				payAlertsAllowed: expect.any(Boolean),
			})
		);
		expect(DEFAULT_FILE_UPLOAD_STATE).toEqual(
			expect.objectContaining({
				errorRejection: expect.any(String),
				cutoffBreach: expect.any(String),
				posting: expect.any(String),
			})
		);
		expect(DEFAULT_STATEMENT_REFERENCING_STATE).toEqual(
			expect.objectContaining({
				debitItemised: expect.any(Object),
				creditConsolidated: expect.any(Object),
			})
		);
		expect(DEFAULT_HOST_TO_HOST_STATE).toEqual(
			expect.objectContaining({
				batchErrorRejection: expect.any(String),
				cutoffBreach: expect.any(String),
			})
		);
		expect(DEFAULT_UNPAID_PROCESSING_STATE).toEqual(
			expect.objectContaining({
				unpaidOptionName: expect.any(String),
				rows: expect.any(Array),
			})
		);
	});

	it('maps tab indices to correct status values', () => {
		expect(getStatusByTabIndex(0)).toBe(STATUS_TAB_VALUES.ALL);
		expect(getStatusByTabIndex(1)).toBe(STATUS_TAB_VALUES.AWAITING_APPROVAL);
		expect(getStatusByTabIndex(2)).toBe(STATUS_TAB_VALUES.ACTIVE);
		expect(getStatusByTabIndex(3)).toBe(STATUS_TAB_VALUES.DRAFT);
		expect(getStatusByTabIndex(999)).toBe(STATUS_TAB_VALUES.ALL);
	});

	it('builds tab labels and head cells using translations', () => {
		const t = (key: string) => `t:${key}`;
		const tabs = getStatusTabLabels(t as any);
		expect(tabs).toEqual(['t:allRecords', 't:awaitingApproval', 't:active', 't:draft']);

		const headCells = getTableHeadCells(t as any);
		expect(headCells.map((c) => c.id)).toEqual([
			'id',
			'paymentTypeName',
			'authorisationProfile',
			'customerAgreement',
			'numberOfAccounts',
			'payAlerts',
			'status',
		]);
	});

	it('exports TABLE_COLUMNS and navlinks', () => {
		expect(TABLE_COLUMNS).toContain('paymentTypeName');
		expect(navlinks.paymentTypes).toBe('/setup-and-admin/payment-types');
		expect(navlinks.createPaymentType).toBe('/setup-and-admin/payment-types/create');
		expect(navlinks.managePaymentType).toBe('/setup-and-admin/payment-types/manage');
		expect(navlinks.success).toBe('/setup-and-admin/payment-types/success');
	});
});
