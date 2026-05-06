import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SuccessCollectionType from '../../../app/[locale]/setup-and-admin/collection-types/success/page';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

jest.mock('next/navigation', () => ({
	useRouter: jest.fn(),
}));

jest.mock('next-intl', () => ({
	useTranslations: jest.fn(),
}));

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
	default: ({
		title,
		message,
		infoNote,
		primaryCTALabel,
		onPrimaryCTA,
		onSecondaryCTA,
		onTertiaryCTA,
		tertiaryCTALabel,
		testIdPrefix,
	}: any) => (
		<div data-testid={`${testIdPrefix}-success-message`}>
			<div data-testid="success-title">{title}</div>
			<div data-testid="success-message">{message}</div>
			<div data-testid="success-info">{infoNote}</div>
			{primaryCTALabel && (
				<button data-testid="primary-cta" onClick={onPrimaryCTA}>
					{primaryCTALabel}
				</button>
			)}
			{onSecondaryCTA && (
				<button data-testid="secondary-cta" onClick={onSecondaryCTA}>
					Secondary
				</button>
			)}
			{tertiaryCTALabel && (
				<button data-testid="tertiary-cta" onClick={onTertiaryCTA}>
					{tertiaryCTALabel}
				</button>
			)}
		</div>
	),
}));

jest.mock('next/image', () => ({
	__esModule: true,
	default: (props: any) => <img {...props} />,
}));

describe('SuccessCollectionType', () => {
	const mockPush = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		(useRouter as jest.Mock).mockReturnValue({ push: mockPush });
		(useTranslations as jest.Mock).mockReturnValue((key: string) => key);
	});

	it('renders success content and navigation CTAs', async () => {
		const user = userEvent.setup();
		render(<SuccessCollectionType />);
		expect(screen.getByTestId('collection-types-success-page')).toBeInTheDocument();
		expect(screen.getByTestId('breadcrumb')).toHaveAttribute('data-links-count', '3');
		expect(screen.getByTestId('breadcrumb')).toHaveTextContent('dashboard');
		expect(screen.getByTestId('breadcrumb')).toHaveTextContent('collectionTypesTitle');
		expect(screen.getByTestId('breadcrumb')).toHaveTextContent('success');

		const heading = screen.getByTestId('collection-types-success-heading');
		expect(heading).toBeInTheDocument();
		expect(heading).toHaveAttribute('aria-label', 'Manage collection type - success confirmation');

		expect(screen.getByTestId('collection-types-success-success-message')).toBeInTheDocument();
		expect(screen.getByTestId('success-title')).toHaveTextContent('success');
		expect(screen.getByTestId('success-message')).toHaveTextContent('collectionTypeSuccessMessage');
		expect(screen.getByTestId('success-info')).toBeInTheDocument();

		expect(screen.getByTestId('primary-cta')).toHaveTextContent('createAnotherCollectionType');
		expect(screen.getByTestId('tertiary-cta')).toHaveTextContent('goToCollectionTypesHub');
		await user.click(screen.getByTestId('primary-cta'));
		expect(mockPush).toHaveBeenCalledWith('/setup-and-admin/collection-types/create');
		await user.click(screen.getByTestId('tertiary-cta'));
		expect(mockPush).toHaveBeenCalledWith('/setup-and-admin/collection-types');
	});
});
