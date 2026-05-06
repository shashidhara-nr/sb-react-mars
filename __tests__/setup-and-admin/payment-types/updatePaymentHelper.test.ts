import { transformToUpdatePaymentTypeRequest } from '../../../app/[locale]/setup-and-admin/payment-types/manage/updatePaymentHelper';

describe('updatePaymentHelper.transformToUpdatePaymentTypeRequest', () => {
	it('spreads currentDetails and overrides updated fields', () => {
		const currentDetails = {
			name: 'Old',
			action: 'NONE',
			authProfileKey: '1',
			authProfileName: 'Old Profile',
			agreementKey: 10,
			agreementName: 'Old Agreement',
			cutOffTimeBreachOption: 'REJECT_BATCH',
			cutOffTimeOptionHostToHost: 'REJECT_BATCH',
			fileUploadPostingOption: 'Itemized',
			fileUploadRejectionOption: 'REJECT_TRANSACTION',
			rejectionOptionHostToHost: 'REJECT_TRANSACTION',
			accountKeys: ['100'],
			accountKeyValues: [100],
			unpaidOptionKey: 55,
			otherFieldToPreserve: 'keep-me',
		};

		const payload = transformToUpdatePaymentTypeRequest({
			form: {
				name: 'New Name',
				authorisationProfile: '7',
				authorisationProfileName: 'New Profile',
				allowAdHoc: true,
				currency: 'ZAR',
				adHocLimit: '9,999',
				payAlertsAllowed: true,
				hostToHostDefault: true,
			} as any,
			fileUploadOptions: {
				errorRejection: 'rejectTransaction',
				cutoffBreach: 'adjustInstruction',
				posting: 'consolidated',
				allowEditingAfterUpload: true,
			} as any,
			statementReferencing: {
				creditConsolidated: { selected: false, references: [], editableReference: false },
				creditItemised: { selected: false, references: [], editableReference: false },
				debitConsolidated: { selected: false, references: [], editableReference: false },
				debitItemised: { selected: false, references: [], editableReference: false },
			} as any,
			hostToHostOptions: {
				batchErrorRejection: 'rejectInstruction',
				cutoffBreach: 'rejectBatch',
				allowEditingAfterUpload: false,
				defaultFundingOption: 'Populated',
			} as any,
			unpaidProcessing: { unpaidOptionName: 999, rows: [] } as any,
			customerAgreement: {
				agreementId: '20',
				agreementName: 'Agreement 20',
				accountsBatch: [{ accountKey: 200 }, { accountKey: 201 }],
			},
			currentDetails,
		});

		expect(payload.otherFieldToPreserve).toBe('keep-me');
		expect(payload.action).toBe('UPDATE');
		expect(payload.name).toBe('New Name');
		expect(payload.authProfileKey).toBe('7');
		expect(payload.authProfileName).toBe('New Profile');
		expect(payload.agreementKey).toBe(20);
		expect(payload.agreementName).toBe('Agreement 20');
		expect(payload.defaultCustomerHostToHost).toBe(true);
		expect(payload.payAlertsEnabled).toBe(true);
		expect(payload.adhocCounterPartyLimit).toBe('9999');

		expect(payload.cutOffTimeBreachOption).toBe('ADJUST_INSTRUCTION');
		expect(payload.cutOffTimeOptionHostToHost).toBe('SAME_DAY');
		expect(payload.fileUploadPostingOption).toBe('Consolidated');
		expect(payload.fileUploadRejectionOption).toBe('REJECT_TRANSACTION');
		expect(payload.rejectionOptionHostToHost).toBe('REJECT_INSTRUCTION');

		expect(payload.accountKeys).toEqual(['200', '201']);
		expect(payload.accountKeyValues).toEqual([200, 201]);
		expect(payload.unpaidOptionKey).toBe(999);
	});
});
