import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import BopThirdPartySuccessPage from '../../../app/[locale]/setup-and-admin/bop-third-parties/success/page';
import '@testing-library/jest-dom';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
  useSearchParams: jest.fn(() => ({ get: jest.fn() })),
}));

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      createIndividualHeading: 'Create Individual',
      createEntityHeading: 'Create Entity',
      createCompanyHeading: 'Create Company',
      manageIndividualHeading: 'Manage Individual',
      manageEntityHeading: 'Manage Entity',
      manageCompanyHeading: 'Manage Company',
      successTitle: 'Success!',
      createSuccessMessage: 'Created successfully',
      editSuccessMessage: 'Updated successfully',
      createAnotherButton: 'Create Another',
      goToListButton: 'Go to List',
      pageTitle: 'BOP Third Parties',
      dashboard: 'Dashboard',
    };
    return translations[key] || key;
  },
}));

jest.mock('@mui/material', () => ({
  Box: ({ children, ...props }: any) => <div data-testid="box" {...props}>{children}</div>,
}));

jest.mock('../../../dist/standard-bank-react', () => ({
  Breadcrumb: ({ 'data-testid': testId, ...props }: any) => <nav data-testid={testId || 'breadcrumb'}></nav>,
  Heading: ({ children, ...props }: any) => <h1 data-testid="heading" {...props}>{children}</h1>,
}));

jest.mock('@molecules/SuccessMessage/SucessMessage', () => {
  return {
    __esModule: true,
    default: ({ title, message, primaryCTALabel, onPrimaryCTA, tertiaryCTALabel, onTertiaryCTA }: any) => (
      <div data-testid="success-message">
        <div data-testid="success-title">{title}</div>
        <div data-testid="success-message-text">{message}</div>
        <button data-testid="primary-cta" onClick={onPrimaryCTA}>{primaryCTALabel}</button>
        <button data-testid="tertiary-cta" onClick={onTertiaryCTA}>{tertiaryCTALabel}</button>
      </div>
    ),
  };
});

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} data-testid="mock-image" />,
}));

jest.mock('../../../app/[locale]/setup-and-admin/bop-third-parties/bopThirdPartyHelper', () => ({
  bopThirdPartiesUrl: {
    dashboard: '/',
    home: '/home',
    create: '/create',
  },
}));

const mockStore = configureStore({
  reducer: {
    bopThirdParty: (state = { bopThirdParty: {} }) => state,
  },
});

describe('BopThirdPartySuccessPage', () => {
  let mockRouter: any;
  let mockSearchParams: any;

  beforeEach(() => {
    mockRouter = { push: jest.fn() };
    mockSearchParams = { get: jest.fn() };
    
    const { useRouter, useSearchParams } = require('next/navigation');
    useRouter.mockReturnValue(mockRouter);
    useSearchParams.mockReturnValue(mockSearchParams);
  });

  const renderWithProvider = (component: React.ReactElement) => {
    return render(<Provider store={mockStore}>{component}</Provider>);
  };

  describe('Rendering', () => {
    it('renders success message', () => {
      mockSearchParams.get.mockReturnValue(null);
      renderWithProvider(<BopThirdPartySuccessPage />);
      
      expect(screen.getByTestId('success-message')).toBeInTheDocument();
      expect(screen.getByTestId('bop-third-parties-success-breadcrumb')).toBeInTheDocument();
      expect(screen.getByTestId('heading')).toBeInTheDocument();
    });
  });

  describe('Create Action', () => {
    beforeEach(() => {
      mockSearchParams.get.mockImplementation((param: string) => {
        if (param === 'action') return 'create';
        if (param === 'type') return 'individual';
        return null;
      });
    });

    it('shows create individual title', () => {
      renderWithProvider(<BopThirdPartySuccessPage />);
      expect(screen.getByText('Create Individual')).toBeInTheDocument();
    });

    it('shows create success message', () => {
      renderWithProvider(<BopThirdPartySuccessPage />);
      expect(screen.getByTestId('success-message-text')).toHaveTextContent('Created successfully');
    });
  });

  describe('Create Entity', () => {
    beforeEach(() => {
      mockSearchParams.get.mockImplementation((param: string) => {
        if (param === 'action') return 'create';
        if (param === 'type') return 'entity';
        return null;
      });
    });

    it('shows create entity title', () => {
      renderWithProvider(<BopThirdPartySuccessPage />);
      expect(screen.getByText('Create Entity')).toBeInTheDocument();
    });
  });

  describe('Create Company', () => {
    beforeEach(() => {
      mockSearchParams.get.mockImplementation((param: string) => {
        if (param === 'action') return 'create';
        if (param === 'type') return 'company';
        return null;
      });
    });

    it('shows create company title', () => {
      renderWithProvider(<BopThirdPartySuccessPage />);
      expect(screen.getByText('Create Company')).toBeInTheDocument();
    });
  });

  describe('Manage Action', () => {
    beforeEach(() => {
      mockSearchParams.get.mockImplementation((param: string) => {
        if (param === 'action') return 'manage';
        if (param === 'type') return 'individual';
        return null;
      });
    });

    it('shows manage individual title', () => {
      renderWithProvider(<BopThirdPartySuccessPage />);
      expect(screen.getByText('Manage Individual')).toBeInTheDocument();
    });

    it('shows edit success message', () => {
      renderWithProvider(<BopThirdPartySuccessPage />);
      expect(screen.getByTestId('success-message-text')).toHaveTextContent('Updated successfully');
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      mockSearchParams.get.mockReturnValue(null);
    });

    it('navigates to create another', () => {
      renderWithProvider(<BopThirdPartySuccessPage />);
      
      fireEvent.click(screen.getByTestId('primary-cta'));
      
      expect(mockRouter.push).toHaveBeenCalledWith('/create');
    });

    it('navigates to list', () => {
      renderWithProvider(<BopThirdPartySuccessPage />);
      
      fireEvent.click(screen.getByTestId('tertiary-cta'));
      
      expect(mockRouter.push).toHaveBeenCalledWith('/home');
    });
  });
});
