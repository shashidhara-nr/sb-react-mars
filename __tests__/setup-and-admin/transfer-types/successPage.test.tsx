import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { transferTypesRoute } from '../../../app/[locale]/setup-and-admin/transfer-types/transferTypeHelper';

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
	default: ({
		title,
		message,
		primaryCTALabel,
		onPrimaryCTA,
		tertiaryCTALabel,
		onTertiaryCTA,
		testIdPrefix,
	}: any) => (
		<section data-testid={`${testIdPrefix}-success-message`}>
			<h2>{title}</h2>
			<p>{message}</p>
			{primaryCTALabel && (
				<button type="button" data-testid={`${testIdPrefix}-primary-cta`} onClick={onPrimaryCTA}>
					{primaryCTALabel}
				</button>
			)}
			{tertiaryCTALabel && (
				<button type="button" data-testid={`${testIdPrefix}-tertiary-cta`} onClick={onTertiaryCTA}>
					{tertiaryCTALabel}
				</button>
			)}
		</section>
	),
}));

const SuccessTransferType = require('../../../app/[locale]/setup-and-admin/transfer-types/success/page').default;

describe('SuccessTransferType (page)', () => {
	const mockPush = jest.fn();
	const mockTranslate = jest.fn((key: string) => key);
	const mockSearchParams = {
		get: jest.fn(),
	};

	beforeEach(() => {
		jest.clearAllMocks();
		(useRouter as jest.Mock).mockReturnValue({ push: mockPush });
		(useTranslations as jest.Mock).mockReturnValue(mockTranslate);
		(useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
	});

	describe('CREATE mode (default)', () => {
		beforeEach(() => {
			mockSearchParams.get.mockReturnValue(null);
		});

		it('renders breadcrumbs, heading, and success message content', () => {
			render(<SuccessTransferType />);

			expect(screen.getByTestId('transfer-types-success-page')).toBeInTheDocument();
			expect(screen.getByTestId('breadcrumb')).toBeInTheDocument();
			expect(screen.getByTestId('transfer-types-success-heading')).toHaveTextContent('createTransferTypeLabel');

			const breadcrumb = screen.getByTestId('breadcrumb');
			const items = Array.from(breadcrumb.querySelectorAll('span')).map((n) => n.textContent);
			expect(items).toEqual(['dashboard', 'breadcrumbLabel', 'createTransferTypeLabel']);

			expect(screen.getByText('successTitle')).toBeInTheDocument();
			expect(screen.getByText('successMessage')).toBeInTheDocument();
		});

		it('calls useTranslations with the transferType namespace', () => {
			render(<SuccessTransferType />);
			expect(useTranslations).toHaveBeenCalledWith('transferType');
		});

		it('navigates to create transfer type when primary CTA is clicked', async () => {
			const user = userEvent.setup();
			render(<SuccessTransferType />);

			await user.click(screen.getByTestId('transfer-types-success-primary-cta'));
			expect(mockPush).toHaveBeenCalledWith('/setup-and-admin/transfer-types/create');
		});

		it('navigates to transfer types home when tertiary CTA is clicked', async () => {
			const user = userEvent.setup();
			render(<SuccessTransferType />);

			await user.click(screen.getByTestId('transfer-types-success-tertiary-cta'));
			expect(mockPush).toHaveBeenCalledWith('/setup-and-admin/transfer-types');
		});
	});

	describe('MANAGE mode', () => {
		beforeEach(() => {
			mockSearchParams.get.mockImplementation((param: string) => {
				if (param === 'pageType') return 'MANAGE';
				if (param === 'managePageHeading') return 'Test Transfer Type';
				return null;
			});
		});

		it('renders correct heading for manage mode', () => {
			render(<SuccessTransferType />);

			expect(screen.getByTestId('transfer-types-success-heading')).toHaveTextContent('managePageHeading Test Transfer Type');
		});

		it('renders correct breadcrumbs for manage mode', () => {
			render(<SuccessTransferType />);

			const breadcrumb = screen.getByTestId('breadcrumb');
			const items = Array.from(breadcrumb.querySelectorAll('span')).map((n) => n.textContent);
			expect(items).toEqual(['dashboard', 'breadcrumbLabel', 'managePageBreadcrumb']);
		});

		it('displays manage success message', () => {
			render(<SuccessTransferType />);

			expect(screen.getByText('successTitle')).toBeInTheDocument();
			expect(screen.getByText('manageSuccessMessage')).toBeInTheDocument();
		});

		it('navigates to create transfer type when primary CTA is clicked', async () => {
			const user = userEvent.setup();
			render(<SuccessTransferType />);

			await user.click(screen.getByTestId('transfer-types-success-primary-cta'));
			expect(mockPush).toHaveBeenCalledWith('/setup-and-admin/transfer-types/create');
		});

		it('navigates to transfer types home when tertiary CTA is clicked', async () => {
			const user = userEvent.setup();
			render(<SuccessTransferType />);

			await user.click(screen.getByTestId('transfer-types-success-tertiary-cta'));
			expect(mockPush).toHaveBeenCalledWith('/setup-and-admin/transfer-types');
		});
	});
});

