import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateCollectionTypePage from '../../../app/[locale]/setup-and-admin/collection-types/create/page';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@lib/hooks/useAppDispatch';
import {
	saveForm,
	saveFileUploadOptions,
	saveStatementReferencing,
	saveHostToHostOptions,
	saveCollectionModel,
	saveCustomerAgreement,
	resetCreateCollectionType,
} from '@store/slices/createCollectionTypeSlice';

jest.mock('@lib/icons', () => ({
	AvatarAlert: '/icons/avatar-alert.svg',
}));

jest.mock('../../../dist/standard-bank-react', () => {
	const { getMockComponents } = require('../../../test-utils/mocks');
	const mocks = getMockComponents();
	return {
		Breadcrumb: mocks.Breadcrumb,
	};
});

jest.mock('../../../components/common/CancellationConfirmationDialog', () => ({
	__esModule: true,
	default: (() => {
		const { CancellationConfirmationDialogMock } = require('../../../test-utils/components');
		return CancellationConfirmationDialogMock;
	})(),
}));

jest.mock('../../../components/common/DeleteConfirmationDialog', () => ({
	__esModule: true,
	default: ({ open, onClose, onPrimaryCTA, onSecondaryCTA }: any) => (
		open ? (
			<div data-testid="error-dialog">
				<button data-testid="error-dialog-retry" onClick={onPrimaryCTA}>Retry</button>
				<button data-testid="error-dialog-dismiss" onClick={onSecondaryCTA}>Dismiss</button>
			</div>
		) : null
	),
}));

jest.mock('../../../components/molecules', () => ({
	CollectionTypeFormWrapper: ({ form, status, onFormChange, onSave, onCancel }: any) => (
		<div data-testid="collection-type-form-wrapper">
			<div data-testid="form-name">{form?.name ?? ''}</div>
			<div data-testid="form-status">{status?.message ?? ''}</div>
			<button data-testid="form-change" onClick={() => onFormChange?.({ ...form, name: 'Updated Collection Type' })}>
				Change
			</button>
			{onSave && <button data-testid="form-save" onClick={() => onSave(form)}>Save</button>}
			{onCancel && <button data-testid="form-cancel" onClick={onCancel}>Cancel</button>}
		</div>
	),
	FileUploadOptions: ({ value, onChange, onEdit, onSave, onCancel }: any) => (
		<div data-testid="file-upload-options">
			{onEdit && <button data-testid="file-upload-edit" onClick={onEdit}>Edit</button>}
			<button data-testid="file-upload-change" onClick={() => onChange?.({ ...value, posting: 'itemised' })}>
				Change
			</button>
			{onSave && <button data-testid="file-upload-save" onClick={onSave}>Save</button>}
			{onCancel && <button data-testid="file-upload-cancel" onClick={onCancel}>Cancel</button>}
		</div>
	),
	StatementReferencingOptions: ({ value, onChange, onEdit, onSave, onCancel }: any) => (
		<div data-testid="statement-referencing">
			{onEdit && <button data-testid="statement-ref-edit" onClick={onEdit}>Edit</button>}
			<button data-testid="statement-ref-change" onClick={() => onChange?.({ ...value, debitItemised: { selected: true, references: ['REF1'], editableReference: false } })}>
				Change
			</button>
			{onSave && <button data-testid="statement-ref-save" onClick={onSave}>Save</button>}
			{onCancel && <button data-testid="statement-ref-cancel" onClick={onCancel}>Cancel</button>}
		</div>
	),
	HostToHostOptions: ({ value, onChange, onEdit, onSave, onCancel }: any) => (
		<div data-testid="host-to-host">
			{onEdit && <button data-testid="host-to-host-edit" onClick={onEdit}>Edit</button>}
			<button data-testid="host-to-host-change" onClick={() => onChange?.({ ...value, batchErrorRejection: 'rejectBatch' })}>
				Change
			</button>
			{onSave && <button data-testid="host-to-host-save" onClick={onSave}>Save</button>}
			{onCancel && <button data-testid="host-to-host-cancel" onClick={onCancel}>Cancel</button>}
		</div>
	),
	CollectionModelOptions: ({ value, selectedAccount, hasError, onEdit, onChange, onSave, onCancel }: any) => (
		<div data-testid="collection-model">
			<div data-testid="collection-model-has-error">{hasError ? 'yes' : 'no'}</div>
			<div data-testid="selected-account-present">{selectedAccount ? 'yes' : 'no'}</div>
			{onEdit && <button data-testid="collection-model-edit" onClick={onEdit}>Edit</button>}
			<button data-testid="collection-model-change" onClick={() => onChange?.({ ...value, countryOrRegion: 'ZA', defaultSource: 'Source1' })}>
				Change
			</button>
			{onSave && <button data-testid="collection-model-save" onClick={onSave}>Save</button>}
			{onCancel && <button data-testid="collection-model-cancel" onClick={onCancel}>Cancel</button>}
		</div>
	),
	FormFooterActions: (() => {
		const { FormFooterActionsMock } = require('../../../test-utils/components');
		return FormFooterActionsMock;
	})(),
}));

jest.mock('@molecules/CustomerAgreement/CustomerAgreementWrapper', () => ({
	__esModule: true,
	default: ({ onAgreementChange, onAccountChange }: any) => (
		<div data-testid="customer-agreement">
			<button data-testid="set-agreement" onClick={() => onAgreementChange?.('99')}>
				Set Agreement
			</button>
			<button data-testid="set-account" onClick={() => onAccountChange?.('123')}>
				Set Account
			</button>
		</div>
	),
}));

jest.mock('../../../utils/collectionTypeLogic', () => ({
	__esModule: true,
	default: {
		collectionTypeZodSchema: {
			safeParse: jest.fn(() => ({ success: true, data: {} })),
		},
	},
}));

jest.mock('@molecules/HostToHostOptions/HostToHostOptions', () => ({
	hostToHostOptionsSchema: {
		safeParse: jest.fn(() => ({ success: true, data: {} })),
	},
}));

jest.mock('@molecules/StatementReferencingOptions/StatementReferencingOptions', () => ({
	statementReferencingSchema: {
		safeParse: jest.fn(() => ({ success: true, data: {} })),
	},
}));

jest.mock('@molecules/CollectionModelOptions/CollectionModelOptions', () => ({
	collectionModelSchema: {
		safeParse: jest.fn(() => ({ success: true, data: {} })),
	},
}));

jest.mock('@lib/hooks/useAppDispatch', () => ({
	useAppDispatch: jest.fn(),
	useAppSelector: jest.fn(),
}));

jest.mock('@store/slices/createCollectionTypeSlice', () => ({
	saveForm: jest.fn((payload: any) => ({ type: 'saveForm', payload })),
	saveFileUploadOptions: jest.fn((payload: any) => ({ type: 'saveFileUploadOptions', payload })),
	saveStatementReferencing: jest.fn((payload: any) => ({ type: 'saveStatementReferencing', payload })),
	saveHostToHostOptions: jest.fn((payload: any) => ({ type: 'saveHostToHostOptions', payload })),
	saveCollectionModel: jest.fn((payload: any) => ({ type: 'saveCollectionModel', payload })),
	saveCustomerAgreement: jest.fn((payload: any) => ({ type: 'saveCustomerAgreement', payload })),
	resetCreateCollectionType: jest.fn(() => ({ type: 'resetCreateCollectionType' })),
	createCollectionType: jest.fn((payload: any) => ({
		type: 'createCollectionType',
		payload,
		unwrap: jest.fn().mockResolvedValue({}),
	})),
}));

jest.mock('@store/slices/setup-admin/commonSlice/customerAgreementSlice', () => ({
	fetchCustomerAgreement: jest.fn((payload: any) => ({ type: 'fetchCustomerAgreement', payload })),
}));

jest.mock('@store/slices/setup-admin/commonSlice/agreementAccountSlice', () => ({
	fetchCollectionTypeAccounts: jest.fn((payload: any) => ({ type: 'fetchCollectionTypeAccounts', payload })),
}));

jest.mock('@store/slices/statementReferenceSlice', () => ({
	fetchStatementReferences: jest.fn((payload: any) => ({ type: 'fetchStatementReferences', payload })),
}));

jest.mock('@store/slices/collectionTypesSlice', () => ({
	fetchCollectionTypes: jest.fn(() => ({ type: 'fetchCollectionTypes' })),
}));

global.fetch = jest.fn();

describe('CreateCollectionTypePage', () => {
	const mockPush = jest.fn();
	let dispatchMock: jest.Mock;
	let consoleLogSpy: jest.SpyInstance;

	const makeState = (overrides: any = {}) => ({
		form: {
			name: '',
			authorisationProfile: null,
			allowAdHoc: false,
			hostToHostDefault: false,
			currency: 'ZAR',
			adHocLimit: '',
			enforceAuditing: false,
			auditReportType: undefined,
		},
		fileUploadOptions: {
			errorRejection: 'rejectBatch',
			cutoffBreach: 'rejectBatch',
			posting: 'consolidated',
			allowEditingAfterUpload: false,
		},
		statementReferencing: {
			creditItemised: { selected: false, references: [], editableReference: false },
			creditConsolidated: { selected: false, references: [], editableReference: false },
			debitItemised: { selected: true, references: [], editableReference: false },
			debitConsolidated: { selected: false, references: [], editableReference: false },
		},
		hostToHostOptions: {
			batchErrorRejection: 'rejectBatch',
			cutoffBreach: 'rejectBatch',
			allowEditingAfterUpload: false,
			defaultFundingOption: 'Populated',
		},
		collectionModel: {
			countryOrRegion: '',
			fixedDateValue: false,
			upfrontValue: false,
			valueOfSuccess: false,
			defaultSource: '',
		},
		...overrides,
	});

	beforeEach(() => {
		jest.clearAllMocks();
		dispatchMock = jest.fn((action) => action);
		consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

		const CollectionTypeLogic = require('../../../utils/collectionTypeLogic').default;
		CollectionTypeLogic.collectionTypeZodSchema.safeParse.mockReturnValue({ success: true, data: {} });
		require('@molecules/HostToHostOptions/HostToHostOptions').hostToHostOptionsSchema.safeParse.mockReturnValue({
			success: true,
			data: {},
		});
		require('@molecules/StatementReferencingOptions/StatementReferencingOptions').statementReferencingSchema.safeParse.mockReturnValue({
			success: true,
			data: {},
		});
		require('@molecules/CollectionModelOptions/CollectionModelOptions').collectionModelSchema.safeParse.mockReturnValue({
			success: true,
			data: {},
		});

		(useRouter as jest.Mock).mockReturnValue({ push: mockPush });
		(useTranslations as jest.Mock).mockReturnValue((key: string) => key);
		(useAppDispatch as jest.Mock).mockReturnValue(dispatchMock);
		(useAppSelector as jest.Mock).mockImplementation((selector: any) => {
			const state = {
				createCollectionType: makeState(),
				agreementAccount: { accounts: [] },
				customerAgreement: { data: [] },
				statementReference: {
					data: {
						statementReferenceTypes: [
							{ statementReferenceType: 'Credit reference', postingOption: 'Consolidated', allowedCodes: [{ code: 'CR1' }] },
							{ statementReferenceType: 'Debit reference', postingOption: 'Itemized', allowedCodes: [{ code: 'DR1' }] },
						],
					},
				},
			};
			return selector(state);
		});

		(global.fetch as jest.Mock).mockResolvedValue({
			ok: true,
			json: async () => ({}),
			text: async () => '',
		});
	});

	afterEach(() => {
		consoleLogSpy.mockRestore();
	});

	it('mounts and dispatches init actions', () => {
		render(<CreateCollectionTypePage />);
		expect(screen.getByTestId('collection-types-create-page')).toBeInTheDocument();
		expect(resetCreateCollectionType).toHaveBeenCalled();
		expect(dispatchMock).toHaveBeenCalled();
		const { fetchCustomerAgreement } = require('@store/slices/setup-admin/commonSlice/customerAgreementSlice');
		expect(fetchCustomerAgreement).toHaveBeenCalled();
	});

	it('cancel confirmation dialog flow', async () => {
		const user = userEvent.setup();
		const backSpy = jest.spyOn(window.history, 'back').mockImplementation(() => {});
		render(<CreateCollectionTypePage />);
		await user.click(screen.getByTestId('footer-cancel'));
		expect(screen.getByTestId('collection-types-create-cancel-confirmation-dialog-dialog')).toBeInTheDocument();
		await user.click(screen.getByTestId('collection-types-create-cancel-confirmation-dialog-close'));
		await waitFor(() => expect(screen.queryByTestId('collection-types-create-cancel-confirmation-dialog-dialog')).not.toBeInTheDocument());
		await user.click(screen.getByTestId('footer-cancel'));
		await user.click(screen.getByTestId('collection-types-create-cancel-confirmation-dialog-confirm'));
		expect(backSpy).toHaveBeenCalled();
		backSpy.mockRestore();
	});

	it('save draft success and failure', async () => {
		const user = userEvent.setup();
		(global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({}), text: async () => '' });
		const view1 = render(<CreateCollectionTypePage />);
		await user.click(screen.getByTestId('footer-save-draft'));
		await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/collection-types/draft', expect.any(Object)));
		view1.unmount();

		(global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, text: async () => 'Server error' });
		render(<CreateCollectionTypePage />);
		await user.click(screen.getByTestId('footer-save-draft'));
		await waitFor(() => expect(global.fetch).toHaveBeenCalled());
	});

	it('section edits + section-level save/cancel wiring', async () => {
		const user = userEvent.setup();
		( useAppSelector as jest.Mock ).mockImplementation((selector: any) => {
			const state = {
				createCollectionType: makeState(),
				agreementAccount: { accounts: [{ accountKey: 123, accountName: 'Account 1' }] },
				customerAgreement: { data: [] },
				statementReference: {
					data: {
						statementReferenceTypes: [
							{ statementReferenceType: 'Credit reference', postingOption: 'Consolidated', allowedCodes: [{ code: 'CR1' }] },
							{ statementReferenceType: 'Debit reference', postingOption: 'Itemized', allowedCodes: [{ code: 'DR1' }] },
						],
					},
				},
			};
			return selector(state);
		});

		render(<CreateCollectionTypePage />);
		await user.click(screen.getByTestId('file-upload-edit'));
		await user.click(screen.getByTestId('statement-ref-edit'));
		await user.click(screen.getByTestId('host-to-host-edit'));
		await user.click(screen.getByTestId('collection-model-edit'));
		expect(consoleLogSpy).toHaveBeenCalled();

		expect(screen.getByTestId('selected-account-present')).toHaveTextContent('no');
		await user.click(screen.getByTestId('set-account'));
		await waitFor(() => expect(screen.getByTestId('selected-account-present')).toHaveTextContent('yes'));

		await user.click(screen.getByTestId('form-change'));
		expect(screen.getByTestId('form-name')).toHaveTextContent('Updated Collection Type');
		await user.click(screen.getByTestId('form-cancel'));
		expect(screen.getByTestId('form-name')).toHaveTextContent('');

		await user.click(screen.getByTestId('form-save'));
		await user.click(screen.getByTestId('file-upload-save'));
		await user.click(screen.getByTestId('statement-ref-save'));
		await user.click(screen.getByTestId('host-to-host-save'));
		await user.click(screen.getByTestId('collection-model-save'));
		expect(dispatchMock).toHaveBeenCalled();
		expect(saveForm).toHaveBeenCalled();
		expect(saveFileUploadOptions).toHaveBeenCalled();
		expect(saveStatementReferencing).toHaveBeenCalled();
		expect(saveHostToHostOptions).toHaveBeenCalled();
		expect(saveCollectionModel).toHaveBeenCalled();
	});

	it('review+submit happy path, validation gates, and submit catch path', async () => {
		const user = userEvent.setup();
		const CollectionTypeLogic = require('../../../utils/collectionTypeLogic').default;
		const { hostToHostOptionsSchema } = require('@molecules/HostToHostOptions/HostToHostOptions');
		const { statementReferencingSchema } = require('@molecules/StatementReferencingOptions/StatementReferencingOptions');
		const { collectionModelSchema } = require('@molecules/CollectionModelOptions/CollectionModelOptions');

		( useAppSelector as jest.Mock ).mockImplementation((selector: any) => {
			const state = {
				createCollectionType: makeState({
					form: {
						name: 'Test',
						authorisationProfile: 'Profile',
						allowAdHoc: false,
						hostToHostDefault: false,
						currency: 'ZAR',
						adHocLimit: '1000',
					},
				}),
				agreementAccount: { accounts: [{ accountKey: 123, accountName: 'Account 1' }] },
				customerAgreement: { data: [{ id: '99', label: 'Agreement 99' }] },
				statementReference: {
					data: {
						statementReferenceTypes: [
							{ statementReferenceType: 'Credit reference', postingOption: 'Consolidated', allowedCodes: [{ code: 'CR1' }] },
							{ statementReferenceType: 'Debit reference', postingOption: 'Itemized', allowedCodes: [{ code: 'DR1' }] },
						],
					},
				},
			};
			return selector(state);
		});

		const view1 = render(<CreateCollectionTypePage />);
		await user.click(screen.getByTestId('set-agreement'));
		await user.click(screen.getByTestId('set-account'));
		await user.click(screen.getByTestId('footer-review-submit'));
		await waitFor(() => expect(saveCustomerAgreement).toHaveBeenCalled());
		await user.click(screen.getByTestId('footer-review-submit'));
		await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/setup-and-admin/collection-types/success'));
		view1.unmount();

		const scenarios: Array<() => void> = [
			() => CollectionTypeLogic.collectionTypeZodSchema.safeParse.mockReturnValueOnce({ success: false, error: { issues: [{ path: ['name'], message: 'Name is required' }] } }),
			() => hostToHostOptionsSchema.safeParse.mockReturnValueOnce({ success: false, error: { issues: [{ path: ['x'], message: 'Required' }] } }),
			() => statementReferencingSchema.safeParse.mockReturnValueOnce({ success: false, error: { issues: [{ path: ['x'], message: 'Required' }] } }),
			() => collectionModelSchema.safeParse.mockReturnValueOnce({ success: false, error: { issues: [{ path: ['x'], message: 'Required' }] } }),
		];

		for (const setup of scenarios) {
			mockPush.mockClear();
			setup();
			const v = render(<CreateCollectionTypePage />);
			await user.click(screen.getByTestId('set-agreement'));
			await user.click(screen.getByTestId('set-account'));
			await user.click(screen.getByTestId('footer-review-submit'));
			expect(mockPush).not.toHaveBeenCalled();
			v.unmount();
		}

		mockPush.mockClear();
		const v2 = render(<CreateCollectionTypePage />);
		await user.click(screen.getByTestId('footer-review-submit'));
		expect(mockPush).not.toHaveBeenCalled();
		v2.unmount();

		mockPush.mockClear();
		const v3 = render(<CreateCollectionTypePage />);
		await user.click(screen.getByTestId('set-agreement'));
		await user.click(screen.getByTestId('footer-review-submit'));
		expect(mockPush).not.toHaveBeenCalled();
		v3.unmount();

		collectionModelSchema.safeParse.mockReturnValueOnce({ success: false, error: { issues: [{ path: ['defaultSource'], message: 'Required' }] } });
		const v4 = render(<CreateCollectionTypePage />);
		expect(screen.getByTestId('collection-model-has-error')).toHaveTextContent('no');
		await user.click(screen.getByTestId('footer-review-submit'));
		await waitFor(() => expect(screen.getByTestId('collection-model-has-error')).toHaveTextContent('yes'));
		await user.click(screen.getByTestId('collection-model-change'));
		await waitFor(() => expect(screen.getByTestId('collection-model-has-error')).toHaveTextContent('no'));
		v4.unmount();

		const { createCollectionType } = require('@store/slices/createCollectionTypeSlice');
		createCollectionType.mockReturnValueOnce({
			type: 'createCollectionType',
			unwrap: jest.fn().mockRejectedValue(new Error('Boom')),
		});
		const v5 = render(<CreateCollectionTypePage />);
		await user.click(screen.getByTestId('set-agreement'));
		await user.click(screen.getByTestId('set-account'));
		await user.click(screen.getByTestId('collection-model-change'));
		await user.click(screen.getByTestId('footer-review-submit'));
		await user.click(screen.getByTestId('footer-review-submit'));
		await waitFor(() => expect(screen.getByTestId('form-status')).toHaveTextContent('Boom'));
		v5.unmount();
	});

	it('error dialog flow - dismiss and retry', async () => {
		const user = userEvent.setup();
		const { createCollectionType } = require('@store/slices/createCollectionTypeSlice');
		
		( useAppSelector as jest.Mock ).mockImplementation((selector: any) => {
			const state = {
				createCollectionType: makeState({
					form: {
						name: 'Test',
						authorisationProfile: 'Profile',
						allowAdHoc: false,
						hostToHostDefault: false,
						currency: 'ZAR',
						adHocLimit: '1000',
					},
				}),
				agreementAccount: { accounts: [{ accountKey: 123, accountName: 'Account 1' }] },
				customerAgreement: { data: [{ id: '99', label: 'Agreement 99' }] },
				statementReference: {
					data: {
						statementReferenceTypes: [],
					},
				},
			};
			return selector(state);
		});

		// First attempt fails
		createCollectionType.mockReturnValueOnce({
			type: 'createCollectionType',
			unwrap: jest.fn().mockRejectedValue(new Error('Submit failed')),
		});

		render(<CreateCollectionTypePage />);
		await user.click(screen.getByTestId('set-agreement'));
		await user.click(screen.getByTestId('set-account'));
		await user.click(screen.getByTestId('footer-review-submit'));
		await user.click(screen.getByTestId('footer-review-submit'));

		await waitFor(() => expect(screen.getByTestId('error-dialog')).toBeInTheDocument());
		
		// Dismiss the dialog
		await user.click(screen.getByTestId('error-dialog-dismiss'));
		await waitFor(() => expect(screen.queryByTestId('error-dialog')).not.toBeInTheDocument());

		// Second attempt also fails
		createCollectionType.mockReturnValueOnce({
			type: 'createCollectionType',
			unwrap: jest.fn().mockRejectedValue(new Error('Submit failed again')),
		});
		
		await user.click(screen.getByTestId('footer-review-submit'));
		await waitFor(() => expect(screen.getByTestId('error-dialog')).toBeInTheDocument());

		// Retry and succeed
		createCollectionType.mockReturnValueOnce({
			type: 'createCollectionType',
			unwrap: jest.fn().mockResolvedValue({}),
		});
		
		await user.click(screen.getByTestId('error-dialog-retry'));
		await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/setup-and-admin/collection-types/success'));
	});

	it('fetchStatementReferences dispatched when agreement and account set', async () => {
		const user = userEvent.setup();
		const { fetchStatementReferences } = require('@store/slices/statementReferenceSlice');
		
		( useAppSelector as jest.Mock ).mockImplementation((selector: any) => {
			const state = {
				createCollectionType: makeState(),
				agreementAccount: { accounts: [{ accountKey: 123, accountName: 'Account 1' }] },
				customerAgreement: { data: [{ id: '99', label: 'Agreement 99' }] },
				statementReference: {
					data: {
						statementReferenceTypes: [],
					},
				},
			};
			return selector(state);
		});

		render(<CreateCollectionTypePage />);
		await user.click(screen.getByTestId('set-agreement'));
		await user.click(screen.getByTestId('set-account'));

		await waitFor(() => expect(fetchStatementReferences).toHaveBeenCalledWith({
			agreementKey: '99',
			accountKeys: '123',
			instrumentClassification: 'Collection',
		}));
	});
});
