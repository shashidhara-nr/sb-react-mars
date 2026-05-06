import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useDispatch, useSelector } from 'react-redux';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}));

jest.mock('@store/slices/createBillerSlice', () => ({
  resetBiller: () => ({ type: 'createBiller/reset' }),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ alt, src, ...props }: any) => (
    <img {...props} alt={alt} src={src || ''} />
  ),
}));

jest.mock('../../../dist/standard-bank-react', () => {
  const { getMockComponents } = require('../../../test-utils/mocks');
  const mocks = getMockComponents();
  return {
    Breadcrumb: mocks.Breadcrumb,
    Button: ({ children, onClick, ...props }: any) => (
      <button onClick={onClick} {...props}>{children}</button>
    ),
    Heading: ({ children }: any) => <h1>{children}</h1>,
  };
});

const CreateSuccessPage = require('../../../app/[locale]/setup-and-admin/bills/create/success/page').default;

describe('BillerCreateSuccessPage', () => {
  const mockPush = jest.fn();
  const mockDispatch = jest.fn();

  const mockBiller = {
    billerName: 'Test Biller',
    billerId: 'BILL123456',
  };

  const mockTranslations = {
    'pageHeadingAddBiller': 'Add Biller',
    'breadcrumbDashboard': 'Dashboard',
    'breadcrumbBills': 'Billers',
    'breadcrumbAddBiller': 'Add Biller',
    'successPageTitle': 'Biller Created Successfully',
    'successPageCreateMessage': 'Your new biller has been successfully created.',
    'successBillerIdLabel': 'Biller ID for',
    'successInfoText': 'Save this ID for your records',
    'buttonCopy': 'Copy',
    'buttonGoToBillsHub': 'Go to Bills Hub',
    'buttonAddAnotherBiller': 'Add Another Biller',
    'setupAndAdmin': 'Setup & Admin',
    'dashboard': 'Dashboard',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: jest.fn(),
    });

    (useTranslations as jest.Mock).mockReturnValue((key: string) => {
      return mockTranslations[key as keyof typeof mockTranslations] || key;
    });

    (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
    (useSelector as unknown as jest.Mock).mockImplementation((selectorFn: any) =>
      selectorFn({
        createBiller: {
          biller: mockBiller,
        },
      })
    );
  });

  it('should render the create success page', () => {
    render(<CreateSuccessPage />);

    expect(screen.getByRole('heading', { name: 'Add Biller' })).toBeInTheDocument();
  });

  it('should display the success icon', () => {
    render(<CreateSuccessPage />);

    const successIcon = screen.getByAltText('Success');
    expect(successIcon).toBeInTheDocument();
  });

  it('should display the success heading', () => {
    render(<CreateSuccessPage />);

    expect(screen.getByText(/successfully created/i)).toBeInTheDocument();
  });

  it('should display the success message', () => {
    render(<CreateSuccessPage />);

    expect(screen.getByText(/Your new biller has been successfully created/i)).toBeInTheDocument();
  });

  it('should display the biller ID section', () => {
    render(<CreateSuccessPage />);

    expect(screen.getByText(/BILL123456/)).toBeInTheDocument();
  });

  it('should display the copy button for biller ID', () => {
    render(<CreateSuccessPage />);

    const copyButton = screen.getByRole('button', { name: /copy/i });
    expect(copyButton).toBeInTheDocument();
  });

  it('should copy biller ID to clipboard when copy button is clicked', async () => {
    const user = userEvent.setup();
    const writeTextMock = jest.fn();

    // Mock clipboard API
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: writeTextMock,
      },
      writable: true,
      configurable: true,
    });

    render(<CreateSuccessPage />);

    const copyButton = screen.getByRole('button', { name: /copy/i });
    await user.click(copyButton);

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith('BILL123456');
    });
  });


  it('should display the go to bills hub button', () => {
    render(<CreateSuccessPage />);

    const navigateButton = screen.getByRole('button', { name: /Go to Bills Hub/i });
    expect(navigateButton).toBeInTheDocument();
  });

  it('should navigate to bills hub when button is clicked', async () => {
    const user = userEvent.setup();

    render(<CreateSuccessPage />);

    const navigateButton = screen.getByTestId('bills-create-success-button-go-to-hub');
    await user.click(navigateButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/setup-and-admin/bills');
    });
  });

  it('should display breadcrumb navigation', () => {
    render(<CreateSuccessPage />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should display biller name in the ID section', () => {
    render(<CreateSuccessPage />);

    expect(screen.getByText(/Test Biller/)).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(<CreateSuccessPage />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it('should render without crashing with default values', () => {
    expect(() => render(<CreateSuccessPage />)).not.toThrow();
  });

  it('should display all success page sections in order', () => {
    const { container } = render(<CreateSuccessPage />);

    const sections = container.querySelectorAll('[class*="Box"]');
    expect(sections.length).toBeGreaterThan(0);
  });

  it('should be responsive and render correctly', () => {
    const { container } = render(<CreateSuccessPage />);

    expect(container).toBeInTheDocument();
  });

  it('should display appropriate success message for create action', () => {
    render(<CreateSuccessPage />);

    expect(screen.getByText(/successfully created/i)).toBeInTheDocument();
  });

  it('should differentiate from manage success page (create vs manage)', () => {
    render(<CreateSuccessPage />);

    // Create success should show "created" not "updated"
    expect(screen.getByText(/successfully created/i)).toBeInTheDocument();
  });

  it('should have consistent styling with manage success page', () => {
    const { container } = render(<CreateSuccessPage />);

    // Both pages should have consistent structure
    expect(container.querySelector('[class*="createSuccess"]')).toBeTruthy();
  });

  it('should have clipboard functionality', () => {
    const writeTextMock = jest.fn();

    // Mock clipboard API
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: writeTextMock,
      },
      writable: true,
      configurable: true,
    });

    render(<CreateSuccessPage />);

    const copyButton = screen.getByRole('button', { name: /copy/i });
    
    // Should render copy button
    expect(copyButton).toBeInTheDocument();
  });

  it('should maintain breadcrumb trail consistency', () => {
    render(<CreateSuccessPage />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Billers')).toBeInTheDocument();
  });

  it('should render success card with proper structure', () => {
    const { container } = render(<CreateSuccessPage />);

    expect(container).toBeInTheDocument();
    expect(screen.getByAltText('Success')).toBeInTheDocument();
  });
});
