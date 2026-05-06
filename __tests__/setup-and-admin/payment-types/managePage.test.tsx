import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { useAppDispatch, useAppSelector } from '@lib/hooks/useAppDispatch';

import {
	fetchPaymentTypeDetails,
	resetPaymentDetails,
	updatePaymentTypeThunk,
} from '../../../store/slices/paymentTypesSlice';

const ManagePaymentTypePage = require('../../../app/[locale]/setup-and-admin/payment-types/manage/[id]/page').default;

jest.mock('@lib/icons', () => ({
	DeleteIcon: '/icons/delete.svg',
	AvatarAlert: '/icons/avatar-alert.svg',
}));

jest.mock('../../../dist/standard-bank-react', () => {
	const { getMockComponents } = require('../../../test-utils/mocks');
	const mocks = getMockComponents();
	return {
		Breadcrumb: mocks.Breadcrumb,
	};
});

jest.mock('../../../components/common/DeleteConfirmationDialog', () => ({
	__esModule: true,
	default: ({ open, testIdPrefix, title, itemLabel2, message, onPrimaryCTA, onSecondaryCTA }: any) => {
		if (!open) return null;
		return (
			<div data-testid={`${testIdPrefix}-dialog`}>
				<div data-testid={`${testIdPrefix}-title`}>{title}</div>
				<div data-testid={`${testIdPrefix}-itemLabel2`}>{itemLabel2}</div>
				<div data-testid={`${testIdPrefix}-message`}>{message}</div>
				<button data-testid={`${testIdPrefix}-confirm`} onClick={onPrimaryCTA}>
					Confirm
				</button>
				<button data-testid={`${testIdPrefix}-cancel`} onClick={onSecondaryCTA}>
					Cancel
				</button>
			</div>
		);
	},
}));

jest.mock('../../../components/molecules', () => ({
	FileUploadOptions: () => <div data-testid="file-upload-options" />,
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
	default: ({ form, onStartEdit, onFormChange }: any) => (
		<div data-testid="payment-type-form-wrapper">
			<div data-testid="form-name">{form?.name ?? ''}</div>
			<button data-testid="start-edit" onClick={() => onStartEdit?.()}>
				Start edit
			</button>
			<button data-testid="change-name" onClick={() => onFormChange?.({ ...form, name: 'Updated Name' })}>
				Change
			</button>
		</div>
	),
}));

jest.mock('@molecules/CustomerAgreement/CustomerAgreementWrapper', () => ({
	__esModule: true,
	default: () => <div data-testid="customer-agreement" />,
}));

jest.mock('@lib/hooks/useAppDispatch', () => ({
	useAppDispatch: jest.fn(),
	useAppSelector: jest.fn(),
}));

jest.mock('../../../store/slices/paymentTypesSlice', () => ({
	fetchPaymentTypeDetails: jest.fn((key: number) => ({ type: 'fetchPaymentTypeDetails', payload: key })),
	resetPaymentDetails: jest.fn(() => ({ type: 'resetPaymentDetails' })),
	updatePaymentTypeThunk: jest.fn((payload: any) => ({ type: 'updatePaymentTypeThunk', payload })),
	fetchUnpaidProcessingOptions: jest.fn(() => ({ type: 'fetchUnpaidProcessingOptions' })),
	selectPaymentDetails: (state: any) => state.paymentTypes.paymentDetails,
	selectPaymentDetailsLoading: (state: any) => state.paymentTypes.loading,
	selectPaymentDetailsError: (state: any) => state.paymentTypes.error,
	selectUpdateLoading: (state: any) => state.paymentTypes.updateLoading,
	selectUpdateError: (state: any) => state.paymentTypes.updateError,
	selectUnpaidProcessingOptions: (state: any) => state.paymentTypes.unpaidProcessingOptions,
	selectUnpaidOptionsLoading: (state: any) => state.paymentTypes.unpaidOptionsLoading,
}));

jest.mock('../../../store/slices/setup-admin/commonSlice/customerAgreementSlice', () => ({
	fetchCustomerAgreement: jest.fn((payload: any) => ({ type: 'fetchCustomerAgreement', payload })),
}));

jest.mock('../../../store/slices/setup-admin/commonSlice/agreementAccountSlice', () => ({
	fetchPaymentTypeAccounts: jest.fn((payload: any) => ({ type: 'fetchPaymentTypeAccounts', payload })),
}));

jest.mock('../../../store/slices/statementReferenceSlice', () => ({
	fetchStatementReferences: jest.fn((payload: any) => ({ type: 'fetchStatementReferences', payload })),
}));

describe('ManagePaymentTypePage', () => {
	const mockPush = jest.fn();
	let dispatchMock: jest.Mock;

	const baseDetails = {
		name: 'Payment Type A',
		authProfileKey: 7,
		authProfileName: 'Profile',
		allowAdhocCounterParty: true,
		adHocCounterPartyLimitCurrency: 'ZAR',
		adhocCounterPartyLimit: '1000',
		payAlertsEnabled: true,
		defaultCustomerHostToHost: false,
		agreementKey: 10,
		agreementName: 'Agreement 10',
		accountKeys: ['100'],
		statementReferenceListTO: [],
		fileUploadRejectionOption: 'REJECT_BATCH',
		cutOffTimeBreachOption: 'REJECT_BATCH',
		fileUploadPostingOption: 'Consolidated',
		rejectionOptionHostToHost: 'REJECT_BATCH',
		cutOffTimeOptionHostToHost: 'REJECT_BATCH',
		h2hFundingOptions: 'Populated',
		unpaidOptionKey: 0,
	};

	const makeState = (overrides: any = {}) => ({
		paymentTypes: {
			paymentDetails: baseDetails,
			loading: false,
			error: null,
			updateLoading: false,
			updateError: null,
			unpaidProcessingOptions: [],
			unpaidOptionsLoading: false,
			...overrides.paymentTypes,
		},
		agreementAccount: {
			accounts: [
				{
					accountKey: 100,
					accountName: 'Acc 100',
					accountNumber: '111',
					currencyCode: 'ZAR',
					currencyDisplayName: 'Rand',
					countryCode: 'ZA',
					countryDisplayName: 'South Africa',
				},
			],
			...overrides.agreementAccount,
		},
		statementReference: {
			data: { statementReferenceTypes: [] },
			loading: false,
			...overrides.statementReference,
		},
	});

	beforeEach(() => {
		jest.clearAllMocks();
		(useRouter as jest.Mock).mockReturnValue({ push: mockPush });
		(useTranslations as jest.Mock).mockReturnValue((key: string) => key);
		(useParams as jest.Mock).mockReturnValue({ id: '123' });

		dispatchMock = jest.fn((action: any) => {
			if (action?.type === 'updatePaymentTypeThunk') {
				return { unwrap: () => Promise.resolve({}) };
			}
			return action;
		});
		(useAppDispatch as jest.Mock).mockReturnValue(dispatchMock);
		(useAppSelector as jest.Mock).mockImplementation((selector: any) => selector(makeState()));
	});

	it('dispatches fetchPaymentTypeDetails on mount and resets on unmount', () => {
		const { unmount } = render(<ManagePaymentTypePage />);
		expect(fetchPaymentTypeDetails).toHaveBeenCalledWith(123);
		expect(dispatchMock).toHaveBeenCalledWith({ type: 'fetchPaymentTypeDetails', payload: 123 });
		unmount();
		expect(resetPaymentDetails).toHaveBeenCalled();
	});

	it('shows system error dialog for invalid id', () => {
		(useParams as jest.Mock).mockReturnValue({ id: 'not-a-number' });
		render(<ManagePaymentTypePage />);

		expect(screen.getByTestId('payment-types-manage-system-error-dialog-dialog')).toBeInTheDocument();
		expect(screen.getByTestId('payment-types-manage-system-error-dialog-itemLabel2')).toHaveTextContent(
			'errors.invalidPaymentTypeIdFormat'
		);
	});

	it('renders delete button by default and opens delete confirmation dialog', async () => {
		const user = userEvent.setup();
		render(<ManagePaymentTypePage />);

		await user.click(screen.getByTestId('payment-types-manage-delete-button'));
		expect(screen.getByTestId('payment-types-manage-delete-dialog-dialog')).toBeInTheDocument();
	});

	it('switches to footer actions when editing starts', async () => {
		const user = userEvent.setup();
		render(<ManagePaymentTypePage />);

		expect(screen.getByTestId('payment-types-manage-delete-button')).toBeInTheDocument();
		await user.click(screen.getByTestId('start-edit'));

		expect(screen.queryByTestId('payment-types-manage-delete-button')).not.toBeInTheDocument();
		expect(screen.getByTestId('footer-actions')).toBeInTheDocument();
	});

	it('submits update and navigates to success page', async () => {
		const user = userEvent.setup();
		render(<ManagePaymentTypePage />);

		await user.click(screen.getByTestId('start-edit'));
		await user.click(screen.getByTestId('footer-review-submit'));

		expect(updatePaymentTypeThunk).toHaveBeenCalled();
		expect(mockPush).toHaveBeenCalledWith(
			'/setup-and-admin/payment-types/success?mode=edit&name=Payment%20Type%20A'
		);
	});

	it('shows loading indicator when fetching payment details', () => {
		(useAppSelector as jest.Mock).mockImplementation((selector: any) =>
			selector(
				makeState({
					paymentTypes: { ...makeState().paymentTypes, loading: true },
				})
			)
		);
		render(<ManagePaymentTypePage />);

		expect(screen.getByTestId('payment-types-manage-loading')).toBeInTheDocument();
	});

	it('shows error alert when fetch fails', () => {
		(useAppSelector as jest.Mock).mockImplementation((selector: any) =>
			selector(
				makeState({
					paymentTypes: { ...makeState().paymentTypes, error: 'Failed to load' },
				})
			)
		);
		render(<ManagePaymentTypePage />);

		expect(screen.getByTestId('payment-types-manage-error')).toHaveTextContent('Failed to load');
	});

	it('handles missing payment type id parameter', () => {
		(useParams as jest.Mock).mockReturnValue({});
		render(<ManagePaymentTypePage />);

		expect(screen.getByTestId('payment-types-manage-system-error-dialog-dialog')).toBeInTheDocument();
		expect(screen.getByTestId('payment-types-manage-system-error-dialog-itemLabel2')).toHaveTextContent(
			'errors.invalidPaymentTypeId'
		);
	});

	it('changes form and triggers edit mode', async () => {
		const user = userEvent.setup();
		render(<ManagePaymentTypePage />);

		await user.click(screen.getByTestId('change-name'));

		expect(screen.getByTestId('form-name')).toHaveTextContent('Updated Name');
		expect(screen.getByTestId('footer-actions')).toBeInTheDocument();
	});

	it('cancels changes and resets to original state', async () => {
		const user = userEvent.setup();
		render(<ManagePaymentTypePage />);

		await user.click(screen.getByTestId('start-edit'));
		await user.click(screen.getByTestId('change-name'));

		expect(screen.getByTestId('form-name')).toHaveTextContent('Updated Name');

		await user.click(screen.getByTestId('footer-cancel'));

		expect(screen.getByTestId('form-name')).toHaveTextContent('Payment Type A');
	});

	it('handles update failure with error dialog', async () => {
		const user = userEvent.setup();
		dispatchMock = jest.fn((action: any) => {
			if (action?.type === 'updatePaymentTypeThunk') {
				return { unwrap: () => Promise.reject(new Error('Update failed')) };
			}
			return action;
		});
		(useAppDispatch as jest.Mock).mockReturnValue(dispatchMock);
		render(<ManagePaymentTypePage />);

		await user.click(screen.getByTestId('start-edit'));
		await user.click(screen.getByTestId('footer-review-submit'));

		expect(screen.getByTestId('payment-types-manage-system-error-dialog-dialog')).toBeInTheDocument();
		expect(screen.getByTestId('payment-types-manage-system-error-dialog-itemLabel2')).toHaveTextContent(
			'Update failed'
		);
	});

	it('retries update after error', async () => {
		const user = userEvent.setup();
		let callCount = 0;
		dispatchMock = jest.fn((action: any) => {
			if (action?.type === 'updatePaymentTypeThunk') {
				callCount++;
				if (callCount === 1) {
					return { unwrap: () => Promise.reject(new Error('Update failed')) };
				}
				return { unwrap: () => Promise.resolve({}) };
			}
			return action;
		});
		(useAppDispatch as jest.Mock).mockReturnValue(dispatchMock);
		render(<ManagePaymentTypePage />);

		await user.click(screen.getByTestId('start-edit'));
		await user.click(screen.getByTestId('footer-review-submit'));

		expect(screen.getByTestId('payment-types-manage-system-error-dialog-dialog')).toBeInTheDocument();

		await user.click(screen.getByTestId('payment-types-manage-system-error-dialog-confirm'));
		expect(updatePaymentTypeThunk).toHaveBeenCalledTimes(2);
	});

	it('dismisses error dialog', async () => {
		const user = userEvent.setup();
		(useAppSelector as jest.Mock).mockImplementation((selector: any) =>
			selector(
				makeState({
					paymentTypes: { ...makeState().paymentTypes, updateError: 'Update error' },
				})
			)
		);
		render(<ManagePaymentTypePage />);

		expect(screen.getByTestId('payment-types-manage-system-error-dialog-dialog')).toBeInTheDocument();

		await user.click(screen.getByTestId('payment-types-manage-system-error-dialog-cancel'));
		expect(screen.queryByTestId('payment-types-manage-system-error-dialog-dialog')).not.toBeInTheDocument();
	});

	it('confirms delete action and navigates', async () => {
		const user = userEvent.setup();
		render(<ManagePaymentTypePage />);

		await user.click(screen.getByTestId('payment-types-manage-delete-button'));
		expect(screen.getByTestId('payment-types-manage-delete-dialog-dialog')).toBeInTheDocument();

		await user.click(screen.getByTestId('payment-types-manage-delete-dialog-confirm'));
		expect(mockPush).toHaveBeenCalledWith('/setup-and-admin/payment-types');
	});

	it('cancels delete action', async () => {
		const user = userEvent.setup();
		render(<ManagePaymentTypePage />);

		await user.click(screen.getByTestId('payment-types-manage-delete-button'));
		expect(screen.getByTestId('payment-types-manage-delete-dialog-dialog')).toBeInTheDocument();

		await user.click(screen.getByTestId('payment-types-manage-delete-dialog-cancel'));
		expect(screen.queryByTestId('payment-types-manage-delete-dialog-dialog')).not.toBeInTheDocument();
	});

	it('initializes accounts batch from payment details', () => {
		const stateWithAccounts = makeState({
			paymentTypes: {
				...makeState().paymentTypes,
				paymentDetails: {
					...baseDetails,
					accountKeys: ['100'],
				},
			},
			agreementAccount: {
				accounts: [
					{
						accountKey: 100,
						accountName: 'Test Account',
						accountNumber: '12345',
						currencyCode: 'ZAR',
						currencyDisplayName: 'Rand',
						countryCode: 'ZA',
						countryDisplayName: 'South Africa',
					},
				],
			},
		});
		(useAppSelector as jest.Mock).mockImplementation((selector: any) => selector(stateWithAccounts));
		render(<ManagePaymentTypePage />);

		expect(screen.getByTestId('customer-agreement')).toBeInTheDocument();
	});

	it('loads unpaid processing options from store', () => {
		const stateWithUnpaid = makeState({
			paymentTypes: {
				...makeState().paymentTypes,
				unpaidProcessingOptions: [
					{
						unpaidOptionKey: 1,
						unpaidOptionName: 'Option 1',
						onUsOption: 'Itemised',
						offUsOption: 'Consolidated',
					},
				],
			},
		});
		(useAppSelector as jest.Mock).mockImplementation((selector: any) => selector(stateWithUnpaid));
		render(<ManagePaymentTypePage />);

		expect(screen.getByTestId('unpaid-processing')).toBeInTheDocument();
	});

	it('loads statement reference types from store', () => {
		const stateWithStatementRef = makeState({
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
		});
		(useAppSelector as jest.Mock).mockImplementation((selector: any) => selector(stateWithStatementRef));
		render(<ManagePaymentTypePage />);

		expect(screen.getByTestId('statement-referencing')).toBeInTheDocument();
	});

	it('saves draft successfully', async () => {
		const user = userEvent.setup();
		render(<ManagePaymentTypePage />);

		await user.click(screen.getByTestId('start-edit'));
		await user.click(screen.getByTestId('footer-save-draft'));

		expect(screen.queryByTestId('footer-actions')).not.toBeInTheDocument();
	});

	it('prevents multiple submissions when already submitting', async () => {
		const user = userEvent.setup();
		let isProcessing = false;
		dispatchMock = jest.fn((action: any) => {
			if (action?.type === 'updatePaymentTypeThunk') {
				return {
					unwrap: async () => {
						isProcessing = true;
						await new Promise((resolve) => setTimeout(resolve, 100));
						isProcessing = false;
						return {};
					},
				};
			}
			return action;
		});
		(useAppDispatch as jest.Mock).mockReturnValue(dispatchMock);
		render(<ManagePaymentTypePage />);

		await user.click(screen.getByTestId('start-edit'));
		const submitButton = screen.getByTestId('footer-review-submit');

		await user.click(submitButton);
		await user.click(submitButton);

		expect(updatePaymentTypeThunk).toHaveBeenCalledTimes(1);
	});

	it('validates form before submission and shows error', async () => {
		const user = userEvent.setup();
		const stateWithInvalidData = makeState({
			paymentTypes: {
				...makeState().paymentTypes,
				paymentDetails: {
					...baseDetails,
					name: '',
				},
			},
		});
		(useAppSelector as jest.Mock).mockImplementation((selector: any) => selector(stateWithInvalidData));
		render(<ManagePaymentTypePage />);

		await user.click(screen.getByTestId('start-edit'));
		await user.click(screen.getByTestId('footer-review-submit'));

		expect(screen.getByTestId('payment-types-manage-system-error-dialog-dialog')).toBeInTheDocument();
		expect(screen.getByTestId('payment-types-manage-system-error-dialog-title')).toHaveTextContent(
			'errors.systemError'
		);
	});

	it('fetches payment type accounts when agreement ID is set', () => {
		const stateWithAgreement = makeState({
			paymentTypes: {
				...makeState().paymentTypes,
				paymentDetails: {
					...baseDetails,
					agreementKey: 10,
				},
			},
		});
		(useAppSelector as jest.Mock).mockImplementation((selector: any) => selector(stateWithAgreement));
		render(<ManagePaymentTypePage />);

		expect(dispatchMock).toHaveBeenCalledWith(
			expect.objectContaining({ type: 'fetchPaymentTypeAccounts' })
		);
	});

	it('fetches statement references when agreement and account keys are selected', () => {
		const stateWithAgreementAndAccounts = makeState({
			paymentTypes: {
				...makeState().paymentTypes,
				paymentDetails: {
					...baseDetails,
					agreementKey: 10,
					accountKeys: ['100'],
				},
			},
		});
		(useAppSelector as jest.Mock).mockImplementation((selector: any) => selector(stateWithAgreementAndAccounts));
		render(<ManagePaymentTypePage />);

		expect(dispatchMock).toHaveBeenCalledWith(
			expect.objectContaining({ type: 'fetchStatementReferences' })
		);
	});
});
