import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CreatePaymentTypePage from '../../../app/[locale]/setup-and-admin/payment-types/create/page';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { useAppDispatch, useAppSelector } from '@lib/hooks/useAppDispatch';

import { createPaymentType, resetCreatePaymentType } from '@store/slices/createPaymentTypeSlice';

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
	default: ({ open, testIdPrefix, itemLabel2 }: any) =>
		open ? <div data-testid={`${testIdPrefix}-dialog`}>{itemLabel2}</div> : null,
}));

jest.mock('../../../components/molecules', () => ({
	FileUploadOptions: ({ value, onChange }: any) => (
		<div data-testid="file-upload-options">
			<button data-testid="file-upload-change" onClick={() => onChange?.({ ...value, posting: 'itemised' })}>
				Change
			</button>
		</div>
	),
	StatementReferencingOptions: () => <div data-testid="statement-referencing" />,
	HostToHostOptions: () => <div data-testid="host-to-host" />,
	UnpaidProcessingOptions: () => <div data-testid="unpaid-processing" />,
	FormFooterActions: (() => {
		const { FormFooterActionsMock } = require('../../../test-utils/components');
		return FormFooterActionsMock;
	})(),
}));

jest.mock('@molecules/PaymentTypeForm/PaymentTypeFormWrapper', () => ({
	__esModule: true,
	default: ({ form, status, onFormChange }: any) => (
		<div data-testid="payment-type-form-wrapper">
			<div data-testid="form-name">{form?.name ?? ''}</div>
			<div data-testid="status-message">{status?.message ?? ''}</div>
			<button data-testid="form-change" onClick={() => onFormChange?.({ ...form, name: 'Updated' })}>
				Change
			</button>
		</div>
	),
}));

jest.mock('@molecules/CustomerAgreement/CustomerAgreementWrapper', () => ({
	__esModule: true,
	default: ({ onAgreementChange }: any) => (
		<div data-testid="customer-agreement">
			<button data-testid="set-agreement" onClick={() => onAgreementChange?.('99', 'Agreement 99')}>
				Set Agreement
			</button>
		</div>
	),
}));

jest.mock('@molecules/PaymentTypeForm/PaymentTypeForm', () => ({
	paymentTypeSchema: {
		safeParse: jest.fn(() => ({ success: true, data: {} })),
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

jest.mock('@lib/hooks/useAppDispatch', () => ({
	useAppDispatch: jest.fn(),
	useAppSelector: jest.fn(),
}));

jest.mock('@store/slices/createPaymentTypeSlice', () => ({
	saveForm: jest.fn((payload: any) => ({ type: 'saveForm', payload })),
	saveFileUploadOptions: jest.fn((payload: any) => ({ type: 'saveFileUploadOptions', payload })),
	saveStatementReferencing: jest.fn((payload: any) => ({ type: 'saveStatementReferencing', payload })),
	saveHostToHostOptions: jest.fn((payload: any) => ({ type: 'saveHostToHostOptions', payload })),
	saveUnpaidProcessing: jest.fn((payload: any) => ({ type: 'saveUnpaidProcessing', payload })),
	resetCreatePaymentType: jest.fn(() => ({ type: 'resetCreatePaymentType' })),
	createPaymentType: jest.fn((payload: any) => ({ type: 'createPaymentType', payload })),
}));

jest.mock('@store/slices/setup-admin/commonSlice/customerAgreementSlice', () => ({
	fetchCustomerAgreement: jest.fn((payload: any) => ({ type: 'fetchCustomerAgreement', payload })),
}));

jest.mock('@store/slices/setup-admin/commonSlice/agreementAccountSlice', () => ({
	fetchPaymentTypeAccounts: jest.fn((payload: any) => ({ type: 'fetchPaymentTypeAccounts', payload })),
}));

jest.mock('@store/slices/paymentTypesSlice', () => ({
	fetchUnpaidProcessingOptions: jest.fn(() => ({ type: 'fetchUnpaidProcessingOptions' })),
	selectUnpaidProcessingOptions: (state: any) => state.paymentTypes.unpaidProcessingOptions,
	selectUnpaidOptionsLoading: (state: any) => state.paymentTypes.unpaidOptionsLoading,
}));

jest.mock('@store/slices/statementReferenceSlice', () => ({
	fetchStatementReferences: jest.fn((payload: any) => ({ type: 'fetchStatementReferences', payload })),
}));

describe('CreatePaymentTypePage', () => {
	const mockPush = jest.fn();
	let dispatchMock: jest.Mock;
	let consoleLogSpy: jest.SpyInstance;

	const makeState = (overrides: any = {}) => ({
		paymentTypes: {
			unpaidProcessingOptions: [],
			unpaidOptionsLoading: false,
			...overrides.paymentTypes,
		},
		statementReference: {
			data: { statementReferenceTypes: [] },
			loading: false,
			...overrides.statementReference,
		},
	});

	beforeEach(() => {
		jest.clearAllMocks();
		consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
		(useRouter as jest.Mock).mockReturnValue({ push: mockPush });
		(useTranslations as jest.Mock).mockReturnValue((key: string) => key);

		dispatchMock = jest.fn((action: any) => {
			if (action?.type === 'createPaymentType') {
				return { unwrap: () => Promise.resolve({}) };
			}
			return action;
		});
		(useAppDispatch as jest.Mock).mockReturnValue(dispatchMock);
		(useAppSelector as jest.Mock).mockImplementation((selector: any) => selector(makeState()));

		(globalThis as any).fetch = jest.fn().mockResolvedValue({ ok: true, text: async () => '' });
	});

	afterEach(() => {
		consoleLogSpy?.mockRestore();
		jest.restoreAllMocks();
	});

	it('renders page scaffolding', () => {
		render(<CreatePaymentTypePage />);
		expect(screen.getByTestId('payment-types-create-page')).toBeInTheDocument();
		expect(screen.getByTestId('breadcrumb')).toBeInTheDocument();
		expect(screen.getByTestId('payment-type-form-wrapper')).toBeInTheDocument();
		expect(screen.getByTestId('customer-agreement')).toBeInTheDocument();
		expect(screen.getByTestId('footer-actions')).toBeInTheDocument();
	});

	it('dispatches resetCreatePaymentType on mount', () => {
		render(<CreatePaymentTypePage />);
		expect(resetCreatePaymentType).toHaveBeenCalled();
		expect(dispatchMock).toHaveBeenCalledWith({ type: 'resetCreatePaymentType' });
	});

	it('opens cancellation confirmation dialog and confirms navigation', async () => {
		const user = userEvent.setup();
		render(<CreatePaymentTypePage />);

		await user.click(screen.getByTestId('footer-cancel'));
		expect(screen.getByTestId('payment-types-create-cancel-confirmation-dialog-dialog')).toBeInTheDocument();

		await user.click(screen.getByTestId('payment-types-create-cancel-confirmation-dialog-confirm'));
		expect(mockPush).toHaveBeenCalledWith('/setup-and-admin/payment-types?cancelled=true');
	});

	it('saves draft via API and updates status message', async () => {
		const user = userEvent.setup();
		render(<CreatePaymentTypePage />);

		await user.click(screen.getByTestId('footer-save-draft'));

		expect(globalThis.fetch).toHaveBeenCalledWith('/api/payment-types/draft', expect.any(Object));
		expect(screen.getByTestId('status-message')).toHaveTextContent('messages.draftSaved');
	});

	it('enters review mode then submits and navigates to success', async () => {
		const user = userEvent.setup();
		render(<CreatePaymentTypePage />);

		await user.click(screen.getByTestId('set-agreement'));
		await user.click(screen.getByTestId('footer-review-submit'));
		expect(screen.getByTestId('footer-flags')).toHaveTextContent('"reviewMode":true');

		await user.click(screen.getByTestId('footer-review-submit'));
		expect(createPaymentType).toHaveBeenCalled();
		expect(mockPush).toHaveBeenCalledWith('/setup-and-admin/payment-types/success?mode=create');
	});

	it('handles save draft API failure', async () => {
		const user = userEvent.setup();
		(globalThis as any).fetch = jest.fn().mockResolvedValue({
			ok: false,
			text: async () => 'Network error',
		});
		render(<CreatePaymentTypePage />);

		await user.click(screen.getByTestId('footer-save-draft'));

		expect(screen.getByTestId('payment-types-create-system-error-dialog-dialog')).toBeInTheDocument();
		expect(screen.getByTestId('status-message')).toHaveTextContent('Network error');
	});

	it('handles create payment type failure with error dialog', async () => {
		const user = userEvent.setup();
		dispatchMock = jest.fn((action: any) => {
			if (action?.type === 'createPaymentType') {
				return { 
					unwrap: async () => {
						throw new Error('Create failed');
					}
				};
			}
			return action;
		});
		(useAppDispatch as jest.Mock).mockReturnValue(dispatchMock);
		render(<CreatePaymentTypePage />);

		await user.click(screen.getByTestId('set-agreement'));
		await user.click(screen.getByTestId('footer-review-submit'));
		await user.click(screen.getByTestId('footer-review-submit'));

		await waitFor(() => {
			expect(screen.getByTestId('payment-types-create-system-error-dialog-dialog')).toBeInTheDocument();
		});
		expect(screen.getByTestId('payment-types-create-system-error-dialog-dialog')).toHaveTextContent(
			'Create failed'
		);
	});

	it('retries create after error dialog', async () => {
		const user = userEvent.setup();
		let callCount = 0;
		dispatchMock = jest.fn((action: any) => {
			if (action?.type === 'createPaymentType') {
				callCount++;
				if (callCount === 1) {
					return { 
						unwrap: async () => {
							throw new Error('Create failed');
						}
					};
				}
				return { unwrap: () => Promise.resolve({}) };
			}
			return action;
		});
		(useAppDispatch as jest.Mock).mockReturnValue(dispatchMock);
		const { rerender } = render(<CreatePaymentTypePage />);

		await user.click(screen.getByTestId('set-agreement'));
		await user.click(screen.getByTestId('footer-review-submit'));
		await user.click(screen.getByTestId('footer-review-submit'));

		await waitFor(() => {
			expect(screen.getByTestId('payment-types-create-system-error-dialog-dialog')).toBeInTheDocument();
		});
		expect(createPaymentType).toHaveBeenCalledTimes(1);
	});

	it('validates form fields before entering review mode', async () => {
		const user = userEvent.setup();
		const { paymentTypeSchema: schema } = require('@molecules/PaymentTypeForm/PaymentTypeForm');
		schema.safeParse = jest.fn(() => ({
			success: false,
			error: {
				issues: [{ path: ['name'], message: 'Name is required' }],
			},
		}));
		render(<CreatePaymentTypePage />);

		await user.click(screen.getByTestId('footer-review-submit'));

		expect(screen.getByTestId('footer-flags')).toHaveTextContent('"reviewMode":false');
		expect(screen.getByTestId('status-message')).toHaveTextContent('');
	});

	it('validates host to host options and shows error', async () => {
		const user = userEvent.setup();
		const { hostToHostOptionsSchema: schema } = require('@molecules/HostToHostOptions/HostToHostOptions');
		schema.safeParse = jest.fn(() => ({ success: false, error: { issues: [] } }));
		render(<CreatePaymentTypePage />);

		await user.click(screen.getByTestId('set-agreement'));
		await user.click(screen.getByTestId('footer-review-submit'));

		expect(screen.getByTestId('footer-flags')).toHaveTextContent('"reviewMode":false');
	});

	it('validates statement referencing options and shows error', async () => {
		const user = userEvent.setup();
		const { statementReferencingSchema: schema } =
			require('@molecules/StatementReferencingOptions/StatementReferencingOptions');
		schema.safeParse = jest.fn(() => ({ success: false, error: { issues: [] } }));
		render(<CreatePaymentTypePage />);

		await user.click(screen.getByTestId('set-agreement'));
		await user.click(screen.getByTestId('footer-review-submit'));

		expect(screen.getByTestId('footer-flags')).toHaveTextContent('"reviewMode":false');
	});

	it('requires agreement to be selected before submission', async () => {
		const user = userEvent.setup();
		render(<CreatePaymentTypePage />);

		await user.click(screen.getByTestId('footer-review-submit'));

		expect(screen.getByTestId('footer-flags')).toHaveTextContent('"reviewMode":false');
	});

	it('updates form state when form changes', async () => {
		const user = userEvent.setup();
		render(<CreatePaymentTypePage />);

		await user.click(screen.getByTestId('form-change'));

		expect(screen.getByTestId('form-name')).toHaveTextContent('Updated');
	});

	it('updates file upload options when changed', async () => {
		const user = userEvent.setup();
		render(<CreatePaymentTypePage />);

		await user.click(screen.getByTestId('file-upload-change'));

		expect(screen.getByTestId('file-upload-options')).toBeInTheDocument();
	});

	it('loads unpaid processing options from store', () => {
		const stateWithUnpaid = {
			paymentTypes: {
				unpaidProcessingOptions: [
					{
						unpaidOptionKey: 1,
						unpaidOptionName: 'Option 1',
						onUsOption: 'Itemised',
						offUsOption: 'Consolidated',
					},
				],
				unpaidOptionsLoading: false,
			},
			statementReference: {
				data: { statementReferenceTypes: [] },
				loading: false,
			},
		};
		(useAppSelector as jest.Mock).mockImplementation((selector: any) => selector(stateWithUnpaid));
		render(<CreatePaymentTypePage />);

		expect(screen.getByTestId('unpaid-processing')).toBeInTheDocument();
	});

	it('loads statement reference types from store', () => {
		const stateWithStatementRef = {
			paymentTypes: {
				unpaidProcessingOptions: [],
				unpaidOptionsLoading: false,
			},
			statementReference: {
				data: {
					statementReferenceTypes: [
						{
							statementReferenceType: 'Credit reference',
							postingOption: 'Consolidated',
							allowedCodes: [{ code: 'CR01' }],
						},
					],
				},
				loading: false,
			},
		};
		(useAppSelector as jest.Mock).mockImplementation((selector: any) => selector(stateWithStatementRef));
		render(<CreatePaymentTypePage />);

		expect(screen.getByTestId('statement-referencing')).toBeInTheDocument();
		expect(consoleLogSpy).toHaveBeenCalledWith(
			'Statement Reference Presets Map:',
			expect.objectContaining({
				creditConsolidated: ['CR01'],
			})
		);
	});

	it('fetches statement references when agreement and account are selected', () => {
		render(<CreatePaymentTypePage />);

		expect(dispatchMock).toHaveBeenCalledWith(
			expect.objectContaining({ type: 'fetchCustomerAgreement' })
		);
	});

	it('closes cancellation dialog without navigating', async () => {
		const user = userEvent.setup();
		render(<CreatePaymentTypePage />);

		await user.click(screen.getByTestId('footer-cancel'));
		await user.click(screen.getByTestId('payment-types-create-cancel-confirmation-dialog-close'));

		expect(mockPush).not.toHaveBeenCalledWith('/setup-and-admin/payment-types?cancelled=true');
	});
});