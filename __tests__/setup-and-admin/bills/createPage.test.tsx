import React from 'react';
import { render, screen } from '@testing-library/react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useDispatch, useSelector } from 'react-redux';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('react-hook-form', () => ({
  useForm: jest.fn(() => ({
    register: jest.fn(),
    handleSubmit: jest.fn((cb) => cb),
    watch: jest.fn(),
    setValue: jest.fn(),
    formState: { errors: {} },
    reset: jest.fn(),
    trigger: jest.fn(() => Promise.resolve(true)),
  })),
  Controller: ({ render }: any) => render({ field: { value: '', onChange: jest.fn() } }),
}));

jest.mock('../../../dist/standard-bank-react', () => {
  const { getMockComponents } = require('../../../test-utils/mocks');
  const mocks = getMockComponents();
  return {
    Breadcrumb: mocks.Breadcrumb,
    Heading: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    PhoneNumber: () => <div data-testid="phone-number" />,
  };
});

jest.mock('../../../components/common/CreateJournyForm', () => ({
  __esModule: true,
  default: ({ testIdPrefix, title, fields, mode }: any) => (
    <div data-testid={`${testIdPrefix}-container`}>
      <h3>{title}</h3>
      <div data-testid={`${testIdPrefix}-mode`}>{mode || 'edit'}</div>
      {fields && fields.length > 0 && (
        <div data-testid={`${testIdPrefix}-fields`}>
          {fields.map((field: any, i: number) => (
            <div key={i}>{field.label}</div>
          ))}
        </div>
      )}
    </div>
  ),
}));

jest.mock('../../../components/common/formActionButtons', () => ({
  FormActionButtons: ({ testIdPrefix, onCancel, onNext, nextText }: any) => (
    <div data-testid={`${testIdPrefix}-container`}>
      {onCancel && <button onClick={onCancel} data-testid={`${testIdPrefix}-cancel`}>Cancel</button>}
      {onNext && <button onClick={onNext} data-testid={`${testIdPrefix}-next`}>{nextText || 'Next'}</button>}
    </div>
  ),
}));

jest.mock('../../../components/common/CreatePayAlertsForm', () => ({
  __esModule: true,
  default: ({ testIdPrefix, title }: any) => (
    <div data-testid={`${testIdPrefix}-container`}>
      <h3>{title}</h3>
    </div>
  ),
}));

jest.mock('../../../components/common/BillerReferenceReview', () => ({
  BillerReferenceReview: ({ testIdPrefix, title }: any) => (
    <div data-testid={`${testIdPrefix}-container`}>
      <h3>{title}</h3>
    </div>
  ),
}));

jest.mock('../../../components/common/usageChips', () => ({
  UsageChips: () => <div data-testid="usage-chips" />,
}));

const AddBillerPage = require('../../../app/[locale]/setup-and-admin/bills/create/page').default;

describe('AddBillerPage (Create)', () => {
  const mockPush = jest.fn();
  const mockDispatch = jest.fn();

  const mockBillerState = {
    billerName: '',
    billerId: '',
    currency: 'ZAR',
    transactionLimit: '0.00',
    paymentTypes: [],
    referenceFields: [],
    phoneNumber: '',
    phoneUsage: [],
    phoneAlertEnabled: false,
    emailAddress: '',
    emailUsage: [],
    emailAlertEnabled: false,
  };

  const mockTranslations = {
    'pageHeadingAddBiller': 'Add Biller',
    'stepBillerDetails': 'Biller Details',
    'stepPaymentType': 'Payment Types',
    'stepBillerReference': 'Biller Reference',
    'stepPayAlerts': 'Payment Alerts',
    'stepReviewSubmit': 'Review & Submit',
    'stepDescription': 'Step description',
    'buttonCancel': 'Cancel',
    'buttonNext': 'Next',
    'buttonReviewSubmit': 'Review & Submit',
    'buttonSubmitBillerApproval': 'Submit for Approval',
    'labelBillerName': 'Biller Name',
    'labelBillerId': 'Biller ID',
    'labelCurrency': 'Currency',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: jest.fn(),
    });

    (useParams as jest.Mock).mockReturnValue({ locale: 'en' });

    (useTranslations as jest.Mock).mockReturnValue((key: string) => {
      return mockTranslations[key as keyof typeof mockTranslations] || key;
    });

    (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);

    (useSelector as unknown as jest.Mock).mockImplementation((selector) => {
      const mockState = {
        createBiller: { biller: mockBillerState },
      };
      return selector(mockState);
    });
  });

  it('should render the add biller page', () => {
    render(<AddBillerPage />);
    expect(screen.getByText('Add Biller')).toBeInTheDocument();
  });

  it('should render page with correct test ID', () => {
    render(<AddBillerPage />);
    expect(screen.getByTestId('bills-create-page')).toBeInTheDocument();
  });

  it('should render breadcrumbs with correct test ID', () => {
    render(<AddBillerPage />);
    expect(screen.getByTestId('breadcrumb')).toBeInTheDocument();
  });

  it('should render heading with correct test ID', () => {
    render(<AddBillerPage />);
    expect(screen.getByTestId('bills-create-heading')).toBeInTheDocument();
  });

  it('should render stepper with correct test ID', () => {
    render(<AddBillerPage />);
    expect(screen.getByTestId('bills-create-stepper')).toBeInTheDocument();
  });

  it('should render all four step labels', () => {
    render(<AddBillerPage />);
    expect(screen.getByTestId('bills-create-step-label-0')).toBeInTheDocument();
    expect(screen.getByTestId('bills-create-step-label-1')).toBeInTheDocument();
    expect(screen.getByTestId('bills-create-step-label-2')).toBeInTheDocument();
    expect(screen.getByTestId('bills-create-step-label-3')).toBeInTheDocument();
  });

  it('should render first step content', () => {
    render(<AddBillerPage />);
    expect(screen.getByTestId('bills-create-step-content-0')).toBeInTheDocument();
  });

  it('should dispatch resetBiller on mount', () => {
    render(<AddBillerPage />);
    expect(mockDispatch).toHaveBeenCalled();
  });
});
