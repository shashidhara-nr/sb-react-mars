import React from 'react';
import { render, screen } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useDispatch } from 'react-redux';

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
    Dialog: ({ children, ...props}: any) => <div {...props}>{children}</div>,
    Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    PhoneNumber: ({ ...props }: any) => <div {...props} />,
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
  default: () => <form data-testid="journey-form" />,
}));

jest.mock('../../../components/common/formActionButtons', () => ({
  FormActionButtons: () => <div data-testid="form-actions" />,
}));

jest.mock('../../../components/common/usageChips', () => ({
  UsageChips: () => <div data-testid="usage-chips" />,
}));

const ManageBillerPage = require('../../../app/[locale]/setup-and-admin/bills/manage/page').default;

describe('ManageBillerPage', () => {
  const mockBillerData = {
    billerName: 'Test Biller',
    billerId: 'BL001',
    currency: 'ZAR',
    transactionLimit: '5000.00',
    paymentTypes: [],
    referenceFields: [],
    phoneNumber: '',
    phoneUsage: [],
    phoneAlertEnabled: false,
    emailAddress: '',
    emailUsage: [],
    emailAlertEnabled: false,
    status: 'Active',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn(), back: jest.fn() });
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn((param: string) => param === 'billerId' ? 'BL001' : null),
    });
    (useTranslations as jest.Mock).mockReturnValue((key: string) => {
      const translations: Record<string, string> = {
        pageHeadingManageBiller: 'Manage Biller',
        details: 'Details',
        history: 'History',
        auditTrail: 'Audit Trail',
      };
      return translations[key] || key;
    });
    (useDispatch as jest.Mock).mockReturnValue(jest.fn());
    
    const { useSelector } = require('react-redux');
    (useSelector as jest.Mock).mockImplementation((selector) => {
      return selector({
        createBiller: { managedBiller: mockBillerData },
      });
    });
    
    const { useBillers } = require('../../../lib/hooks/useBillers');
    (useBillers as jest.Mock).mockReturnValue({
      getBillerById: jest.fn().mockResolvedValue(mockBillerData),
      deleteBillerById: jest.fn(),
      managedBiller: mockBillerData,
      error: null,
    });
  });

  it('should render the manage biller page with correct testIds', () => {
    render(<ManageBillerPage />);
    
    expect(screen.getByTestId('bills-manage-page')).toBeInTheDocument();
    expect(screen.getByTestId('bills-manage-breadcrumbs')).toBeInTheDocument();
    expect(screen.getByTestId('bills-manage-heading')).toBeInTheDocument();
  });

  it('should render tab toggle for details/history/audit', () => {
    render(<ManageBillerPage />);
    
    expect(screen.getByTestId('bills-manage-tab-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('toggle-details')).toBeInTheDocument();
    expect(screen.getByTestId('toggle-history')).toBeInTheDocument();
    expect(screen.getByTestId('toggle-audit')).toBeInTheDocument();
  });
});