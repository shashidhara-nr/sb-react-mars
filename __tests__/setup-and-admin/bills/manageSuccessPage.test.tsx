import React from 'react';
import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ alt }: any) => <img alt={alt} />,
}));

jest.mock('../../../dist/standard-bank-react', () => {
  const { getMockComponents } = require('../../../test-utils/mocks');
  const mocks = getMockComponents();
  return {
    Breadcrumb: mocks.Breadcrumb,
    Button: ({ children }: any) => <button>{children}</button>,
    Heading: ({ children }: any) => <h1>{children}</h1>,
  };
});

const ManageSuccessPage = require('../../../app/[locale]/setup-and-admin/bills/manage/success/page').default;

describe('BillerManageSuccessPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn(), back: jest.fn() });
    (useTranslations as jest.Mock).mockReturnValue((key: string) => key);
  });

  it('should render the manage success page', () => {
    render(<ManageSuccessPage />);
    expect(screen.getByText('pageHeadingManageBiller')).toBeInTheDocument();
  });

  it('should display the success icon', () => {
    render(<ManageSuccessPage />);
    const successIcon = screen.getByAltText('Success');
    expect(successIcon).toBeInTheDocument();
  });
});
