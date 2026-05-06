import {
	mapRejectionOption,
	mapCutoffOption,
	mapPostingOption,
	mapFundingOption,
	mapPaymentDetailsToFormState,
	mapFileUploadOptions,
	mapStatementReferencingOptions,
	mapHostToHostOptions,
	mapUnpaidProcessingOptions,
	buildAccountsBatchFromDetails,
	REJECTION_OPTIONS,
	CUTOFF_OPTIONS,
	POSTING_OPTIONS,
	FUNDING_OPTIONS,
	STATEMENT_REFERENCE_EDITABLE,
} from '../../../app/[locale]/setup-and-admin/payment-types/manage/paymentTypeMappers';

describe('paymentTypeMappers', () => {
	describe('simple option mappers', () => {
		it('maps rejection options with safe defaults', () => {
			expect(mapRejectionOption(REJECTION_OPTIONS.API.REJECT_BATCH)).toBe('rejectBatch');
			expect(mapRejectionOption(REJECTION_OPTIONS.API.REJECT_INSTRUCTION)).toBe('rejectInstruction');
			expect(mapRejectionOption(REJECTION_OPTIONS.API.REJECT_TRANSACTION)).toBe('rejectTransaction');
			expect(mapRejectionOption(undefined)).toBe('rejectBatch');
		});

		it('maps cutoff options with release adjust handled', () => {
			expect(mapCutoffOption(CUTOFF_OPTIONS.API.REJECT_BATCH)).toBe('rejectBatch');
			expect(mapCutoffOption(CUTOFF_OPTIONS.API.REJECT_INSTRUCTION)).toBe('rejectInstruction');
			expect(mapCutoffOption(CUTOFF_OPTIONS.API.RELEASE_ADJUST_INSTRUCTION)).toBe('adjustInstruction');
			expect(mapCutoffOption(CUTOFF_OPTIONS.API.ADJUST_INSTRUCTION)).toBe('adjustInstruction');
		});

		it('maps posting options to consolidated by default', () => {
			expect(mapPostingOption(POSTING_OPTIONS.API.CONSOLIDATED)).toBe('consolidated');
			expect(mapPostingOption(POSTING_OPTIONS.API.ITEMISED)).toBe('itemised');
			expect(mapPostingOption(POSTING_OPTIONS.API.ITEMIZED)).toBe('consolidated');
		});

		it('maps funding options by keyword match with safe default', () => {
			expect(mapFundingOption(FUNDING_OPTIONS.API.AVAILABLE_FUNDS)).toBe('Available funds');
			expect(mapFundingOption(FUNDING_OPTIONS.API.CREDIT_FACILITY)).toBe('Credit facility');
			expect(mapFundingOption(undefined)).toBe('Populated');
		});
	});

	it('maps payment details into form state', () => {
		const form = mapPaymentDetailsToFormState({
			name: 'P1',
			authProfileKey: 10,
			authProfileName: 'AP',
			allowAdhocCounterParty: true,
			adHocCounterPartyLimitCurrency: 'USD',
			adhocCounterPartyLimit: '100',
			payAlertsEnabled: true,
			defaultCustomerHostToHost: true,
		});

		expect(form).toEqual(
			expect.objectContaining({
				name: 'P1',
				authorisationProfile: '10',
				authorisationProfileName: 'AP',
				allowAdHoc: true,
				currency: 'USD',
				adHocLimit: '100',
				payAlertsAllowed: true,
				hostToHostDefault: true,
			})
		);
	});

	it('maps file upload options', () => {
		const opts = mapFileUploadOptions({
			fileUploadRejectionOption: REJECTION_OPTIONS.API.REJECT_INSTRUCTION,
			cutOffTimeBreachOption: CUTOFF_OPTIONS.API.REJECT_INSTRUCTION,
			fileUploadPostingOption: 'Itemised',
			allowEditingFileUpload: true,
		});

		expect(opts).toEqual(
			expect.objectContaining({
				errorRejection: 'rejectInstruction',
				cutoffBreach: 'rejectInstruction',
				posting: 'itemised',
				allowEditingAfterUpload: true,
			})
		);
	});

	it('maps statement referencing list into state flags and references', () => {
		const state = mapStatementReferencingOptions({
			statementReferenceListTO: [
				{
					statementReferenceType: 'Debit reference',
					postingOptions: 'Itemised',
					statmentReferenceEditable: STATEMENT_REFERENCE_EDITABLE.TRUE,
					statementReference: 'D-ITEM',
				},
				{
					statementReferenceType: 'Credit reference',
					postingOptions: 'Consolidated',
					statmentReferenceEditable: STATEMENT_REFERENCE_EDITABLE.FALSE,
					statementReference: 'C-CONS',
				},
			],
		});

		expect(state.debitItemised.selected).toBe(true);
		expect(state.debitItemised.references).toEqual(['D-ITEM']);
		expect(state.debitItemised.editableReference).toBe(true);

		expect(state.creditConsolidated.selected).toBe(true);
		expect(state.creditConsolidated.references).toEqual(['C-CONS']);
		expect(state.creditConsolidated.editableReference).toBe(false);
	});

	it('maps host-to-host options', () => {
		const state = mapHostToHostOptions({
			rejectionOptionHostToHost: REJECTION_OPTIONS.API.REJECT_TRANSACTION,
			cutOffTimeOptionHostToHost: CUTOFF_OPTIONS.API.RELEASE_ADJUST_INSTRUCTION,
			allowEditingHostToHost: true,
			h2hFundingOptions: 'Credit facility',
		});

		expect(state.batchErrorRejection).toBe('rejectTransaction');
		expect(state.cutoffBreach).toBe('adjustInstruction');
		expect(state.allowEditingAfterUpload).toBe(true);
		expect(state.defaultFundingOption).toBe('Credit facility');
	});

	it('maps unpaid processing options to numeric key or default string', () => {
		const mapped = mapUnpaidProcessingOptions({ unpaidOptionKey: 123 }, { unpaidOptionName: 'Populated', rows: [{ id: 1 } as any] } as any);
		expect(mapped.unpaidOptionName).toBe(123);

		const mapped2 = mapUnpaidProcessingOptions({ unpaidOptionKey: 0 }, { unpaidOptionName: 'Populated', rows: [] } as any);
		expect(mapped2.unpaidOptionName).toBe('Populated');
	});

	it('builds accountsBatch from details and account list', () => {
		const batch = buildAccountsBatchFromDetails(
			{ accountKeys: ['10', '20'] },
			[
				{ accountKey: 10, accountName: 'A', accountNumber: '111', currencyCode: 'ZAR', currencyDisplayName: 'Rand', countryCode: 'ZA', countryDisplayName: 'South Africa' },
				{ accountKey: 20, accountName: 'B', accountNumber: '222', currencyCode: 'USD', currencyDisplayName: 'USD', countryCode: 'US', countryDisplayName: 'United States' },
			]
		);

		expect(batch).toHaveLength(2);
		expect(batch[0]).toEqual(
			expect.objectContaining({
				name: '1. A',
				accNumber: '111',
				currencyCode: 'ZAR',
				countryCode: 'ZA',
			})
		);
	});
});
