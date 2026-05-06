import { z } from 'zod';
import { collectionTypeFormSchema } from '../../../app/[locale]/setup-and-admin/collection-types/collectionTypeFormSchema';

describe('collectionTypeFormSchema', () => {
	const validData = {
		customerAgreement: 'Agreement123',
		account: 'Account456',
		fileUploadOptions: {
			errorRejection: 'rejectBatch',
			cutoffBreach: 'rejectBatch',
		},
		statementReferencing: {
			references: ['REF1'],
		},
		hostToHostOptions: {
			batchErrorRejection: 'rejectBatch',
			cutoffBreach: 'rejectBatch',
		},
		collectionModel: {
			countryOrRegion: 'ZA',
			hostFileUploadDefault: 'host',
		},
	};

	const expectErrorMessage = (result: any, message: string) => {
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues.some((i: any) => i.message === message)).toBe(true);
		}
	};

	it('accepts a valid payload', () => {
		const result = collectionTypeFormSchema.safeParse(validData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual(validData);
		}
	});

	it('rejects missing required fields with expected messages', () => {
		const cases: Array<{ mutate: (d: any) => any; message: string }> = [
			{ mutate: (d) => ({ ...d, customerAgreement: '' }), message: 'Customer agreement is required' },
			{ mutate: (d) => ({ ...d, account: '' }), message: 'Account is required' },
			{ mutate: (d) => ({ ...d, fileUploadOptions: { ...d.fileUploadOptions, errorRejection: '' } }), message: 'File error rejection option is required' },
			{ mutate: (d) => ({ ...d, fileUploadOptions: { ...d.fileUploadOptions, cutoffBreach: '' } }), message: 'Cut-off time breach option is required' },
			{ mutate: (d) => ({ ...d, statementReferencing: { references: [] } }), message: 'At least one statement reference is required' },
			{ mutate: (d) => ({ ...d, hostToHostOptions: { ...d.hostToHostOptions, batchErrorRejection: '' } }), message: 'Batch error rejection option is required' },
			{ mutate: (d) => ({ ...d, hostToHostOptions: { ...d.hostToHostOptions, cutoffBreach: '' } }), message: 'Cut-off time breach option is required' },
			{ mutate: (d) => ({ ...d, collectionModel: { ...d.collectionModel, countryOrRegion: '' } }), message: 'Country/region is required' },
			{ mutate: (d) => ({ ...d, collectionModel: { ...d.collectionModel, hostFileUploadDefault: '' } }), message: 'Host/file upload default is required' },
		];

		for (const { mutate, message } of cases) {
			const result = collectionTypeFormSchema.safeParse(mutate(validData));
			expectErrorMessage(result, message);
		}
	});
});
