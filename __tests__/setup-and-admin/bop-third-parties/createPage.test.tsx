import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import BopThirdPartyCreatePage from '../../../app/[locale]/setup-and-admin/bop-third-parties/create/page';
import '@testing-library/jest-dom';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      createPageTitle: 'Create BOP Third Party',
      supportingCopyOptional: 'Select type',
      individualThirdPartyLabel: 'Individual',
      entityThirdPartyLabel: 'Entity',
      optionalDescription: 'Description',
      nextButtonUpper: 'NEXT',
      cancelButton: 'CANCEL',
    };
    return translations[key] || key;
  },
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} data-testid="mock-image" />,
}));

jest.mock('@mui/material', () => ({
  Grid: ({ children, ...props }: any) => <div data-testid="grid" {...props}>{children}</div>,
}));

jest.mock('../../../dist/standard-bank-react', () => ({
  Button: ({ children, onClick, disabled, startIcon, 'data-testid': testId, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} data-testid={testId} {...props}>{children}</button>
  ),
  Heading: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
  Breadcrumb: ({ 'data-testid': testId, links, ...props }: any) => (
    <nav data-testid={testId || 'breadcrumb'} data-links-count={links?.length}></nav>
  ),
}));

jest.mock('../../../components/common/creationMethod', () => ({
  CardSelection: ({ options, selectedValue, onSelect, 'data-testid': testId }: any) => (
    <div data-testid={testId}>
      {options?.map((opt: any) => (
        <button
          key={opt.value}
          data-testid={`card-${opt.value}`}
          onClick={() => onSelect(opt.value)}
          className={selectedValue === opt.value ? 'selected' : ''}
        >
          {opt.label}
        </button>
      ))}
    </div>
  ),
}));

jest.mock('../../../app/[locale]/setup-and-admin/bop-third-parties/bopThirdPartyHelper', () => ({
  bopThirdPartiesUrl: {
    home: '/home',
    details: '/details',
  },
  getBreadcrumbLinks: jest.fn(() => []),
}));

const mockStore = configureStore({
  reducer: {
    bopThirdParty: (state = { bopThirdParty: {} }) => state,
  },
});

describe('BopThirdPartyCreatePage', () => {
  let mockRouter: any;

  beforeEach(() => {
    mockRouter = { push: jest.fn() };
    const { useRouter } = require('next/navigation');
    useRouter.mockReturnValue(mockRouter);
  });

  const renderWithProvider = (component: React.ReactElement) => {
    return render(<Provider store={mockStore}>{component}</Provider>);
  };

  describe('Rendering', () => {
    it('renders main elements', () => {
      renderWithProvider(<BopThirdPartyCreatePage />);
      expect(screen.getByTestId('bop-third-parties-create-breadcrumb')).toBeInTheDocument();
      expect(screen.getByTestId('card-individual')).toBeInTheDocument();
      expect(screen.getByTestId('card-entity')).toBeInTheDocument();
      expect(screen.getByTestId('bop-third-parties-create-button-next')).toBeInTheDocument();
      expect(screen.getByTestId('bop-third-parties-create-button-cancel')).toBeInTheDocument();
    });

    it('renders both card options', () => {
      renderWithProvider(<BopThirdPartyCreatePage />);
      expect(screen.getByTestId('card-individual')).toBeInTheDocument();
      expect(screen.getByTestId('card-entity')).toBeInTheDocument();
    });

    it('next button is disabled initially', () => {
      renderWithProvider(<BopThirdPartyCreatePage />);
      expect(screen.getByTestId('bop-third-parties-create-button-next')).toBeDisabled();
    });
  });

  describe('Selection', () => {
    it('selects individual card', () => {
      renderWithProvider(<BopThirdPartyCreatePage />);
      
      fireEvent.click(screen.getByTestId('card-individual'));
      
      expect(screen.getByTestId('card-individual')).toHaveClass('selected');
      expect(screen.getByTestId('bop-third-parties-create-button-next')).not.toBeDisabled();
    });

    it('selects entity card', () => {
      renderWithProvider(<BopThirdPartyCreatePage />);
      
      fireEvent.click(screen.getByTestId('card-entity'));
      
      expect(screen.getByTestId('card-entity')).toHaveClass('selected');
      expect(screen.getByTestId('bop-third-parties-create-button-next')).not.toBeDisabled();
    });

    it('switches selection', () => {
      renderWithProvider(<BopThirdPartyCreatePage />);
      
      fireEvent.click(screen.getByTestId('card-individual'));
      fireEvent.click(screen.getByTestId('card-entity'));
      
      expect(screen.getByTestId('card-individual')).not.toHaveClass('selected');
      expect(screen.getByTestId('card-entity')).toHaveClass('selected');
    });
  });

  describe('Navigation', () => {
    it('navigates to details with individual type', () => {
      renderWithProvider(<BopThirdPartyCreatePage />);
      
      fireEvent.click(screen.getByTestId('card-individual'));
      fireEvent.click(screen.getByTestId('bop-third-parties-create-button-next'));
      
      expect(mockRouter.push).toHaveBeenCalledWith('/details?type=individual');
    });

    it('navigates to details with entity type', () => {
      renderWithProvider(<BopThirdPartyCreatePage />);
      
      fireEvent.click(screen.getByTestId('card-entity'));
      fireEvent.click(screen.getByTestId('bop-third-parties-create-button-next'));
      
      expect(mockRouter.push).toHaveBeenCalledWith('/details?type=entity');
    });

    it('cancels and returns to home', () => {
      renderWithProvider(<BopThirdPartyCreatePage />);
      
      fireEvent.click(screen.getByTestId('bop-third-parties-create-button-cancel'));
      
      expect(mockRouter.push).toHaveBeenCalledWith('/home');
    });
  });
});
