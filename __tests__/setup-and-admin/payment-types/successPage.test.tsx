import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

const SuccessPaymentTypes = require('../../../app/[locale]/setup-and-admin/payment-types/success/page').default;

jest.mock('@lib/icons', () => ({
	PlusIcon: '/icons/plus.svg',
	MoneyUp: '/icons/money-up.svg',
	ListIcon: '/icons/list.svg',
}));

jest.mock('../../../dist/standard-bank-react', () => {
	const { getMockComponents } = require('../../../test-utils/mocks');
	const mocks = getMockComponents();
	return {
		Breadcrumb: mocks.Breadcrumb,
		Heading: mocks.Heading,
	};
});

jest.mock('@molecules/SuccessMessage/SucessMessage', () => ({
	__esModule: true,
	default: ({ title, message, primaryCTALabel, onPrimaryCTA, tertiaryCTALabel, onTertiaryCTA, testIdPrefix }: any) => (
		<section data-testid={`${testIdPrefix}-success-message`}>
			<h2>{title}</h2>
			<p>{message}</p>
			{primaryCTALabel ? (
				<button data-testid={`${testIdPrefix}-primary-cta`} onClick={onPrimaryCTA}>
					{primaryCTALabel}
				</button>
			) : null}
			{tertiaryCTALabel ? (
				<button data-testid={`${testIdPrefix}-tertiary-cta`} onClick={onTertiaryCTA}>
					{tertiaryCTALabel}
				</button>
			) : null}
		</section>
	),
}));

describe('Payment Types success page', () => {
	const mockPush = jest.fn();
	const mockSearchParams = { get: jest.fn() };

	beforeEach(() => {
		jest.clearAllMocks();
		(useRouter as jest.Mock).mockReturnValue({ push: mockPush });
		(useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
		(useTranslations as jest.Mock).mockReturnValue((key: string) => key);
		mockSearchParams.get.mockReturnValue(null);
	});

	it('renders create-mode breadcrumb/heading and success message', () => {
		render(<SuccessPaymentTypes />);

		expect(screen.getByTestId('payment-types-success-page')).toBeInTheDocument();
		expect(screen.getByTestId('breadcrumb')).toBeInTheDocument();
		expect(screen.getByTestId('payment-types-success-heading')).toHaveTextContent('createAPaymentType');
		expect(screen.getByText('successMessage')).toBeInTheDocument();
	});

	it('renders edit-mode heading and edit success message', () => {
		mockSearchParams.get.mockImplementation((key: string) => {
			if (key === 'mode') return 'edit';
			if (key === 'name') return 'Test Name';
			return null;
		});

		render(<SuccessPaymentTypes />);

		expect(screen.getByTestId('payment-types-success-heading')).toHaveTextContent('Manage Test Name');
		expect(screen.getByText('successEditMessage')).toBeInTheDocument();
	});

	it('navigates via primary and tertiary CTAs', async () => {
		const user = userEvent.setup();
		render(<SuccessPaymentTypes />);

		await user.click(screen.getByTestId('payment-types-success-primary-cta'));
		expect(mockPush).toHaveBeenCalledWith('/setup-and-admin/payment-types/create');

		await user.click(screen.getByTestId('payment-types-success-tertiary-cta'));
		expect(mockPush).toHaveBeenCalledWith('/setup-and-admin/payment-types');
	});
});
