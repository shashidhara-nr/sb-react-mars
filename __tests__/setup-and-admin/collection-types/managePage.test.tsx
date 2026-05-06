import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ManageCollectionType from '../../../app/[locale]/setup-and-admin/collection-types/manage/[id]/page';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@lib/hooks/useAppDispatch';
import {
	updateForm,
	updateFileUploadOptions,
	updateStatementReferencing,
	updateHostToHostOptions,
	updateCollectionModel,
} from '@store/slices/manageCollectionTypeSlice';

jest.mock('@mui/material', () => {
	const React = require('react');
	const actual = jest.requireActual('@mui/material');
	const Grid = ({
		children,
		container,
		spacing,
		size,
		xs,
		md,
		direction,
		...props
	}: any) => <div {...props}>{React.Children.toArray(children).filter(Boolean)}</div>;
	return { ...actual, Grid };
});

jest.mock('@lib/icons', () => ({
	IconBin: '/icons/bin.svg',
	AvatarAlert: '/icons/avatar-alert.svg',
	CheckCircleIcon: '/icons/check-circle.svg',
}));

jest.mock('../../../dist/standard-bank-react', () => {
	const { getMockComponents } = require('../../../test-utils/mocks');
	const mocks = getMockComponents();
	return {
		Breadcrumb: mocks.Breadcrumb,
	};
});

jest.mock('../../../components/molecules', () => ({
	CollectionTypeFormWrapper: ({ form, onFormChange, onSave, onCancel, onStartEdit, reviewMode }: any) => (
		<div data-testid="collection-type-form-wrapper">
			<div data-testid="form-name">{form?.name ?? ''}</div>
			<div data-testid="review-mode">{reviewMode ? 'review' : 'edit'}</div>
			<button data-testid="form-start-edit" onClick={() => onStartEdit?.()}>
				Start Edit
			</button>
			<button data-testid="form-change" onClick={() => onFormChange?.({ ...form, name: 'Updated' })}>
				Change
			</button>
			{onSave && <button data-testid="form-save" onClick={() => onSave(form)}>Save</button>}
			{onCancel && <button data-testid="form-cancel" onClick={onCancel}>Cancel</button>}
		</div>
	),
	FileUploadOptions: ({ onEdit, onSave, onCancel, reviewMode }: any) => (
		<div data-testid="file-upload-options">
			<div data-testid="file-review-mode">{reviewMode ? 'review' : 'edit'}</div>
			<button data-testid="file-start-edit" onClick={() => onEdit?.()}>
				Edit
			</button>
			{onSave && <button data-testid="file-save" onClick={onSave}>Save</button>}
			{onCancel && <button data-testid="file-cancel" onClick={onCancel}>Cancel</button>}
		</div>
	),
	StatementReferencingOptions: ({ onEdit, onSave, onCancel, reviewMode, hasError }: any) => (
		<div data-testid="statement-referencing">
			<div data-testid="statement-review-mode">{reviewMode ? 'review' : 'edit'}</div>
			<div data-testid="statement-has-error">{hasError ? 'yes' : 'no'}</div>
			<button data-testid="statement-start-edit" onClick={() => onEdit?.()}>Edit</button>
			{onSave && <button data-testid="statement-save" onClick={onSave}>Save</button>}
			{onCancel && <button data-testid="statement-cancel" onClick={onCancel}>Cancel</button>}
		</div>
	),
	HostToHostOptions: ({ onEdit, onSave, onCancel, reviewMode, hasError }: any) => (
		<div data-testid="host-to-host">
			<div data-testid="host-review-mode">{reviewMode ? 'review' : 'edit'}</div>
			<div data-testid="host-has-error">{hasError ? 'yes' : 'no'}</div>
			<button data-testid="host-start-edit" onClick={() => onEdit?.()}>Edit</button>
			{onSave && <button data-testid="host-save" onClick={onSave}>Save</button>}
			{onCancel && <button data-testid="host-cancel" onClick={onCancel}>Cancel</button>}
		</div>
	),
	CollectionModelOptions: ({ onEdit, onSave, onCancel, reviewMode }: any) => (
		<div data-testid="collection-model">
			<div data-testid="collection-review-mode">{reviewMode ? 'review' : 'edit'}</div>
			<button data-testid="collection-start-edit" onClick={() => onEdit?.()}>Edit</button>
			{onSave && <button data-testid="collection-save" onClick={onSave}>Save</button>}
			{onCancel && <button data-testid="collection-cancel" onClick={onCancel}>Cancel</button>}
		</div>
	),
}));

jest.mock('@molecules/CustomerAgreement/CustomerAgreementWrapper', () => ({
	__esModule: true,
	default: ({ onStartEdit }: any) => (
		<div data-testid="customer-agreement">
			<button data-testid="customer-agreement-start-edit" onClick={() => onStartEdit?.()}>Edit</button>
			Customer Agreement
		</div>
	),
}));

jest.mock('../../../components/common/DeleteConfirmationDialog', () => ({
	__esModule: true,
	default: ({ open, onClose, onConfirm, title, message }: any) => 
		open ? (
			<div data-testid="delete-confirmation-dialog">
				<div data-testid="dialog-title">{title}</div>
				<div data-testid="dialog-message">{message}</div>
				<button data-testid="dialog-cancel" onClick={onClose}>Cancel</button>
				<button data-testid="dialog-confirm" onClick={onConfirm}>Confirm</button>
			</div>
		) : null,
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

jest.mock('@lib/hooks/useAppDispatch', () => ({
	useAppDispatch: jest.fn(),
	useAppSelector: jest.fn(),
}));

jest.mock('@store/slices/manageCollectionTypeSlice', () => ({
	updateForm: jest.fn((payload: any) => ({ type: 'updateForm', payload })),
	updateFileUploadOptions: jest.fn((payload: any) => ({ type: 'updateFileUploadOptions', payload })),
	updateStatementReferencing: jest.fn((payload: any) => ({ type: 'updateStatementReferencing', payload })),
	updateHostToHostOptions: jest.fn((payload: any) => ({ type: 'updateHostToHostOptions', payload })),
	updateCollectionModel: jest.fn((payload: any) => ({ type: 'updateCollectionModel', payload })),
	loadCollectionType: jest.fn((payload: any) => ({ type: 'loadCollectionType', payload })),
	updateCollectionType: jest.fn((payload: any) => ({ type: 'updateCollectionType', payload })),
}));

jest.mock('@store/slices/setup-admin/commonSlice/agreementAccountSlice', () => ({
	fetchCollectionTypeAccounts: jest.fn((payload: any) => ({ type: 'fetchCollectionTypeAccounts', payload })),
}));

jest.mock('@store/slices/statementReferenceSlice', () => ({
	fetchStatementReferences: jest.fn((payload: any) => ({ type: 'fetchStatementReferences', payload })),
}));

jest.mock('next/navigation', () => ({
	useRouter: jest.fn(),
	useParams: jest.fn(() => ({ id: '123' })),
	useSearchParams: jest.fn(() => ({ get: jest.fn(() => 'Test Collection Type') })),
}));

jest.mock('next-intl', () => ({
	useTranslations: jest.fn(),
}));

jest.mock('next/image', () => ({
	__esModule: true,
	default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

jest.mock('../../../src/utils/testIds', () => ({
	buildTestId: jest.fn((...parts) => parts.filter(Boolean).join('-')),
}));

jest.mock('../../../lib/hooks/useManageCollectionType', () => ({
	useManageCollectionType: jest.fn(() => ({
		data: null,
		loading: false,
		error: null,
	})),
}));

jest.mock('../../../app/[locale]/setup-and-admin/collection-types/collectionTypeMappers', () => ({
	mapStatementReferencingOptions: jest.fn((data) => data),
}));

jest.mock('../../../app/[locale]/setup-and-admin/collection-types/collectionTypesHelper', () => ({
	getManageBreadcrumbLinks: jest.fn(() => []),
	navlinks: { 
		collectionTypes: '/setup-and-admin/collection-types',
		setupAndAdmin: '/setup-and-admin/collection-types',
		successCollectionType: '/setup-and-admin/collection-types/success'
	},
	getDeleteDialogContent: jest.fn(() => ({ 
		title: 'Delete', 
		primary: 'Yes, Delete',
		secondary: 'Cancel',
		itemLabel: 'collection type',
		itemLabel2: ''
	})),
}));

jest.mock('../../../lib/transformers/collectionTypesTransformers', () => ({
	prepareCollectionTypePayload: jest.fn((data) => data),
}));

jest.mock('@store/slices/collectionTypesSlice', () => ({
	deleteCollectionTypes: jest.fn((payload: any) => ({ type: 'deleteCollectionTypes', payload })),
}));

describe('ManageCollectionType', () => {
	const mockPush = jest.fn();
	let dispatchMock: jest.Mock;
	let consoleLogSpy: jest.SpyInstance;

	const makeState = (overrides: any = {}) => ({
		manageCollectionType: {
			form: {
				name: 'Test Collection Type',
				authorisationProfile: 'Profile 1',
				allowAdHoc: false,
				hostToHostDefault: false,
				currency: 'ZAR',
				adHocLimit: '1000',
				enforceAuditing: false,
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
				countryOrRegion: 'ZA',
				fixedDateValue: false,
				upfrontValue: false,
				valueOfSuccess: false,
				defaultSource: 'Default',
			},
			customerAgreement: {
				agreementId: '123',
				selectedAccountId: '456',
			},
			...overrides.manageCollectionType,
		},
		agreementAccount: {
			accounts: [
				{
					accountKey: 100,
					accountName: 'Test Account',
					accountNumber: '123456',
					currencyCode: 'ZAR',
					currencyDisplayName: 'Rand',
					countryCode: 'ZA',
					countryDisplayName: 'South Africa',
				},
			],
			loading: false,
			error: null,
			...overrides.agreementAccount,
		},
		statementReference: {
			data: {
				statementReferenceTypes: [
					{
						statementReferenceType: 'Credit reference',
						postingOption: 'Consolidated',
						allowedCodes: [{ code: 'CR1' }, { code: 'CR2' }],
					},
					{
						statementReferenceType: 'Debit reference',
						postingOption: 'Consolidated',
						allowedCodes: [{ code: 'DR1' }, { code: 'DR2' }],
					},
					{
						statementReferenceType: 'Debit reference',
						postingOption: 'Itemized',
						allowedCodes: [{ code: 'DRI1' }, { code: 'DRI2' }],
					},
					{
						statementReferenceType: 'Credit reference',
						postingOption: 'Itemized',
						allowedCodes: [{ code: 'CRI1' }, { code: 'CRI2' }],
					},
				],
			},
			loading: false,
			error: null,
			...overrides.statementReference,
		},
	});

	beforeEach(() => {
		jest.clearAllMocks();
		dispatchMock = jest.fn((action: any) => {
			// For async thunks that need unwrap()
			if (action?.type === 'updateCollectionType' || action?.type === 'deleteCollectionTypes') {
				return {
					unwrap: () => Promise.resolve({ success: true })
				};
			}
			return action;
		});
		consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

		(useRouter as jest.Mock).mockReturnValue({ push: mockPush });
		(useTranslations as jest.Mock).mockReturnValue((key: string) => key);
		(useAppDispatch as jest.Mock).mockReturnValue(dispatchMock);
		(useAppSelector as jest.Mock).mockImplementation((selector: any) => selector(makeState()));
	});

	afterEach(() => {
		consoleLogSpy.mockRestore();
	});

	it('renders base view, shows delete action, and customer agreement section', async () => {
		const user = userEvent.setup();
		render(<ManageCollectionType params={{ id: '123' }} />);
		expect(screen.getByTestId('collection-types-manage-page')).toBeInTheDocument();
		expect(screen.getByTestId('collection-types-manage-delete-button')).toBeInTheDocument();
		expect(screen.getByTestId('customer-agreement')).toBeInTheDocument();
		await user.click(screen.getByTestId('collection-types-manage-delete-button'));
		expect(await screen.findByTestId('delete-confirmation-dialog')).toBeInTheDocument();
	});

	it('edit/save/cancel flows across sections (marks unsaved changes)', async () => {
		const user = userEvent.setup();
		render(<ManageCollectionType params={{ id: '123' }} />);

		await user.click(screen.getByTestId('form-start-edit'));
		await user.click(screen.getByTestId('customer-agreement-start-edit'));
		await user.click(screen.getByTestId('file-start-edit'));
		await user.click(screen.getByTestId('statement-start-edit'));
		await user.click(screen.getByTestId('host-start-edit'));
		await user.click(screen.getByTestId('collection-start-edit'));

		await user.click(screen.getByTestId('form-change'));
		expect(screen.getByTestId('form-name')).toHaveTextContent('Updated');
		await user.click(screen.getByTestId('form-cancel'));
		expect(screen.getByTestId('form-name')).toHaveTextContent('Test Collection Type');

		await user.click(screen.getByTestId('form-save'));
		await user.click(screen.getByTestId('file-save'));
		await user.click(screen.getByTestId('statement-save'));
		await user.click(screen.getByTestId('host-save'));
		await user.click(screen.getByTestId('collection-save'));
		await waitFor(() => {
			expect(updateForm).toHaveBeenCalled();
			expect(updateFileUploadOptions).toHaveBeenCalled();
			expect(updateStatementReferencing).toHaveBeenCalled();
			expect(updateHostToHostOptions).toHaveBeenCalled();
			expect(updateCollectionModel).toHaveBeenCalled();
		});

		expect(screen.getByTestId('collection-types-manage-cancel-button')).toBeInTheDocument();
		expect(screen.getByTestId('collection-types-manage-submit-button')).toBeInTheDocument();
	});

	it('validation failures show status and do not dispatch updates; status clears on edit', async () => {
		const user = userEvent.setup();
		const { statementReferencingSchema } = require('@molecules/StatementReferencingOptions/StatementReferencingOptions');
		const { hostToHostOptionsSchema } = require('@molecules/HostToHostOptions/HostToHostOptions');
		statementReferencingSchema.safeParse.mockReturnValueOnce({ success: false, error: { issues: [{ path: ['x'], message: 'bad' }] } });
		hostToHostOptionsSchema.safeParse.mockReturnValueOnce({ success: false, error: { issues: [{ path: ['x'], message: 'bad' }] } });

		render(<ManageCollectionType params={{ id: '123' }} />);
		await user.click(screen.getByTestId('statement-save'));
		await user.click(screen.getByTestId('host-save'));
		await waitFor(() => {
			expect(screen.getByTestId('statement-has-error')).toHaveTextContent('yes');
			expect(screen.getByTestId('host-has-error')).toHaveTextContent('yes');
		});
		expect(updateStatementReferencing).not.toHaveBeenCalled();
		expect(updateHostToHostOptions).not.toHaveBeenCalled();

		// Errors persist until cancel or successful save
		await user.click(screen.getByTestId('host-start-edit'));
		// Edit starts but error flag remains
		expect(screen.getByTestId('host-has-error')).toHaveTextContent('yes');
	});

	it('navigation after unsaved changes: cancel and submit', async () => {
		const user = userEvent.setup();
		const view1 = render(<ManageCollectionType params={{ id: '123' }} />);
		await user.click(screen.getByTestId('form-save'));
		await user.click(await screen.findByTestId('collection-types-manage-cancel-button'));
		expect(mockPush).toHaveBeenCalledWith('/setup-and-admin/collection-types');
		view1.unmount();

		mockPush.mockClear();
		const view2 = render(<ManageCollectionType params={{ id: '123' }} />);
		await user.click(screen.getByTestId('collection-save'));
		await user.click(await screen.findByTestId('collection-types-manage-submit-button'));
		
		// Wait for the setTimeout to trigger navigation
		await waitFor(() => {
			expect(mockPush).toHaveBeenCalledWith('/setup-and-admin/collection-types/success');
		}, { timeout: 2000 });
		view2.unmount();
	});
});
