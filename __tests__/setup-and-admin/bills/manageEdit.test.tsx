import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useDispatch, useSelector } from 'react-redux';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}));

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('../../../lib/hooks/useBillers', () => ({
  useBillers: jest.fn(),
}));

jest.mock('react-hook-form', () => ({
  useForm: jest.fn(() => ({
    register: jest.fn(),
    handleSubmit: jest.fn((cb) => cb),
    watch: jest.fn(),
    formState: { errors: {} },
    reset: jest.fn(),
    trigger: jest.fn(() => Promise.resolve(true)),
  })),
  Controller: ({ render }: any) => render({ field: { value: '', onChange: jest.fn() } }),
}));

jest.mock('../../../dist/standard-bank-react', () => {
  return {
    Breadcrumb: ({ links, ...props }: any) => (
      <nav {...props}>
        {links?.map((link: any, idx: number) => (
          <a key={idx} href={link.href}>{link.label}</a>
        ))}
      </nav>
    ),
    ButtonToggle: ({ buttons, onChange, ...props }: any) => (
      <div {...props}>
        {buttons?.map((btn: any, idx: number) => (
          <button
            key={idx}
            onClick={() => onChange?.(null, btn.toggleValue)}
            data-testid={`toggle-${btn.toggleValue}`}
          >
            {btn.children}
          </button>
        ))}
      </div>
    ),
    Heading: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    Dialog: ({ open, children, ...props }: any) => open ? <div role="dialog" {...props}>{children}</div> : null,
    Button: ({ children, onClick, disabled, ...props }: any) => (
      <button onClick={onClick} disabled={disabled} {...props}>{children}</button>
    ),
    PhoneNumber: ({ value, ...props }: any) => <div data-testid="phone-number" {...props}>{value}</div>,
  };
});

jest.mock('../../../components/organisms/Bills/ManageHistoryTable', () => ({
  __esModule: true,
  default: () => <div data-testid="history-table" />,
}));

jest.mock('../../../components/organisms/Bills/ManageAuditTrail', () => ({
  __esModule: true,
  default: () => <div data-testid="audit-trail" />,
}));

jest.mock('../../../components/common/CreateJournyForm', () => ({
  __esModule: true,
  default: ({ testIdPrefix }: any) => <form data-testid={testIdPrefix || 'journey-form'} />,
}));

jest.mock('../../../components/common/CreatePayAlertsForm', () => ({
  __esModule: true,
  default: ({ testIdPrefix }: any) => <form data-testid={testIdPrefix || 'pay-alerts-form'} />,
}));

jest.mock('../../../components/common/BillerReferenceReview', () => ({
  BillerReferenceReview: ({ testIdPrefix }: any) => <div data-testid={testIdPrefix || 'biller-reference'} />,
}));

jest.mock('../../../components/common/formActionButtons', () => ({
  FormActionButtons: ({ testIdPrefix }: any) => <div data-testid={testIdPrefix || 'form-actions'} />,
}));

jest.mock('../../../components/common/usageChips', () => ({
  UsageChips: () => <div data-testid="usage-chips" />,
}));

const ManageBillerPage = require('../../../app/[locale]/setup-and-admin/bills/manage/page').default;

describe('ManageBiller - Basic Rendering', () => {
  const mockPush = jest.fn();
  const mockDispatch = jest.fn();

  const mockBillerData = {
    billerName: 'Test Biller',
    billerId: 'BL001',
    currency: 'ZAR',
    transactionLimit: '5000.00',
    paymentTypes: ['debit_order'],
    referenceFields: ['ref1'],
    phoneNumber: '+27123456789',
    phoneUsage: ['transaction_confirmation'],
    phoneAlertEnabled: true,
    emailAddress: 'biller@test.com',
    emailUsage: ['statement'],
    emailAlertEnabled: false,
    status: 'Active',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: jest.fn(),
    });

    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn((param: string) => param === 'billerId' ? 'BL001' : null),
    });

    (useTranslations as jest.Mock).mockReturnValue((key: string) => {
      const translations: Record<string, string> = {
        pageHeadingManageBiller: 'Manage Biller',
        tabDetails: 'Details',
        tabHistory: 'History',
        tabAuditTrail: 'Audit Trail',
        stepBillerDetails: 'Biller Details',
        stepBillerReference: 'Biller Reference',
        stepPaymentType: 'Payment Type',
        stepPayAlerts: 'Pay Alerts',
      };
      return translations[key] || key;
    });

    (useDispatch as jest.Mock).mockReturnValue(mockDispatch);

    (useSelector as jest.Mock).mockImplementation((selector) => {
      const mockState = {
        createBiller: { managedBiller: mockBillerData },
      };
      return selector(mockState);
    });

    const { useBillers } = require('../../../lib/hooks/useBillers');
    (useBillers as jest.Mock).mockReturnValue({
      getBillerById: jest.fn().mockResolvedValue(mockBillerData),
      deleteBillerById: jest.fn(),
      managedBiller: mockBillerData,
      error: null,
    });
  });

  it('should render manage page with correct testIds', () => {
    render(<ManageBillerPage />);

    expect(screen.getByTestId('bills-manage-page')).toBeInTheDocument();
    expect(screen.getByTestId('bills-manage-breadcrumbs')).toBeInTheDocument();
    expect(screen.getByTestId('bills-manage-heading')).toBeInTheDocument();
  });

  it('should render tab toggle with all tabs', () => {
    render(<ManageBillerPage />);

    expect(screen.getByTestId('bills-manage-tab-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('toggle-details')).toBeInTheDocument();
    expect(screen.getByTestId('toggle-history')).toBeInTheDocument();
    expect(screen.getByTestId('toggle-audit')).toBeInTheDocument();
  });

  it('should render details tab content by default', () => {
    render(<ManageBillerPage />);

    expect(screen.getByTestId('bills-manage-tab-details')).toBeInTheDocument();
  });
});
