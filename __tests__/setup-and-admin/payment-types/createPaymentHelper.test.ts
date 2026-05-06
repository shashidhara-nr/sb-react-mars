import { transformToPaymentTypeRequest } from '../../../app/[locale]/setup-and-admin/payment-types/create/createPaymentHelper';

describe('createPaymentHelper.transformToPaymentTypeRequest', () => {
	it('builds statementReferenceListTO with one entry per selected reference type and joins multiple refs', () => {
		const payload = transformToPaymentTypeRequest({
			form: {
				name: 'My Payment Type',
				authorisationProfile: '7',
				authorisationProfileName: 'Profile',
				allowAdHoc: true,
				currency: 'ZAR',
				adHocLimit: '12,345',
				payAlertsAllowed: true,
				hostToHostDefault: false,
			} as any,
			fileUploadOptions: {
				errorRejection: 'rejectBatch',
				cutoffBreach: 'rejectBatch',
				posting: 'consolidated',
				allowEditingAfterUpload: false,
			} as any,
			statementReferencing: {
				creditConsolidated: { selected: true, references: ['REF001', { reference: ['REF002'] }], editableReference: true },
				debitConsolidated: { selected: false, references: [], editableReference: false },
				creditItemised: { selected: true, references: [{ reference: 'REF003' }], editableReference: false },
				debitItemised: { selected: true, references: ['REF004'], editableReference: false },
			} as any,
			hostToHostOptions: {
				batchErrorRejection: 'rejectBatch',
				cutoffBreach: 'rejectBatch',
				allowEditingAfterUpload: true,
				defaultFundingOption: 'Populated',
			} as any,
			unpaidProcessing: {
				unpaidOptionName: 123,
				rows: [],
			} as any,
			customerAgreement: {
				agreementId: '99',
				agreementName: 'Agreement',
				accountId: 'acc',
				accountsBatch: [{ accountKey: 10 }, { accountKey: 20 }],
			},
		});

		expect(payload.action).toBe('CREATE');
		expect(payload.name).toBe('My Payment Type');
		expect(payload.authProfileKey).toBe('7');
		expect(payload.adhocCounterPartyLimit).toBe('12345');
		expect(payload.fileUploadPostingOption).toBe('Consolidated');
		expect(payload.accountKeys).toEqual(['10', '20']);
		expect(payload.unpaidOptionKey).toBe(123);

		expect(payload.statementReferenceListTO).toHaveLength(3);
		const creditCon = payload.statementReferenceListTO.find((x: any) => x.postingOptions === 'Consolidated' && x.appliedtoDebitStatementReference === 'N');
		expect(creditCon.statementReference).toBe('REF001,REF002');
		expect(creditCon.statmentReferenceEditable).toBe('Y');

		const creditItem = payload.statementReferenceListTO.find((x: any) => x.postingOptions === 'Itemized' && x.appliedtoDebitStatementReference === 'N');
		expect(creditItem.statementReference).toBe('REF003');

		const debitItem = payload.statementReferenceListTO.find((x: any) => x.postingOptions === 'Itemized' && x.appliedtoDebitStatementReference === 'Y');
		expect(debitItem.statementReference).toBe('REF004');
	});

	it('defaults unpaidOptionKey to 0 when unpaidOptionName is not a number', () => {
		const payload = transformToPaymentTypeRequest({
			form: { name: 'X', authorisationProfile: '1', allowAdHoc: false, currency: 'ZAR', adHocLimit: '', payAlertsAllowed: false, hostToHostDefault: false } as any,
			fileUploadOptions: { errorRejection: 'rejectBatch', cutoffBreach: 'rejectBatch', posting: 'consolidated', allowEditingAfterUpload: false } as any,
			statementReferencing: { creditConsolidated: { selected: false, references: [], editableReference: false } } as any,
			hostToHostOptions: { batchErrorRejection: 'rejectBatch', cutoffBreach: 'rejectBatch', allowEditingAfterUpload: false, defaultFundingOption: 'Populated' } as any,
			unpaidProcessing: { unpaidOptionName: 'Populated', rows: [] } as any,
			customerAgreement: { agreementId: '1', agreementName: 'A', accountId: '', accountsBatch: [] },
		});

		expect(payload.unpaidOptionKey).toBe(0);
	});
});
