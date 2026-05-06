import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import BopThirdPartyDetailsPage from '../../../app/[locale]/setup-and-admin/bop-third-parties/details/page';
import '@testing-library/jest-dom';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
  useSearchParams: jest.fn(() => ({ get: jest.fn() })),
}));

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock('react-hook-form', () => ({
  useForm: jest.fn(() => ({
    handleSubmit: jest.fn((fn) => fn),
    control: {},
    formState: { errors: {} },
    watch: jest.fn(),
    setValue: jest.fn(),
    getValues: jest.fn(() => ({})),
    reset: jest.fn(),
    trigger: jest.fn(() => Promise.resolve(true)),
    setFocus: jest.fn(),
    clearErrors: jest.fn(),
    resetField: jest.fn(),
  })),
  useWatch: jest.fn(() => []),
}));

jest.mock('@mui/material', () => ({
  Box: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Paper: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Stepper: ({ children, activeStep }: any) => <div data-testid="stepper" data-active-step={activeStep}>{children}</div>,
  Step: ({ children }: any) => <div data-testid="step">{children}</div>,
  StepLabel: ({ children }: any) => <button data-testid="step-label">{children}</button>,
  StepContent: ({ children }: any) => <div data-testid="step-content">{children}</div>,
  Typography: ({ children }: any) => <span>{children}</span>,
}));

jest.mock('../../../dist/standard-bank-react', () => ({
  Breadcrumb: ({ 'data-testid': testId, ...props }: any) => <nav data-testid={testId || 'breadcrumb'}></nav>,
  Heading: ({ children }: any) => <h1 data-testid="heading">{children}</h1>,
  Dialog: ({ open, children }: any) => open ? <div data-testid="dialog">{children}</div> : null,
}));

jest.mock('../../../components/common/CreateJournyForm', () => {
  return {
    __esModule: true,
    default: ({ sections, onFieldChange }: any) => (
      <div data-testid="create-journey-form">
        {sections?.map((section: any, i: number) => (
          <div key={i} data-testid={`form-section-${i}`}>
            {section.fields?.map((field: any, j: number) => (
              <input
                key={j}
                data-testid={`field-${field.name}`}
                name={field.name}
                onChange={(e) => onFieldChange?.(field.name, e.target.value)}
              />
            ))}
          </div>
        ))}
      </div>
    ),
  };
});

jest.mock('../../../components/common/formActionButtons', () => ({
  FormActionButtons: ({ onCancel, onNext }: any) => (
    <div data-testid="form-action-buttons">
      <button data-testid="cancel-btn" onClick={onCancel}>Cancel</button>
      <button data-testid="next-btn" onClick={onNext}>Next</button>
    </div>
  ),
}));

jest.mock('../../../src/utils/BopThirdPartiesField', () => ({
  buildPersonalFieldsBopThirdParty: jest.fn(() => [
    { name: 'firstName', label: 'First Name', type: 'text' },
    { name: 'lastName', label: 'Last Name', type: 'text' },
  ]),
  buildAddressFieldsBopThirdParty: jest.fn(() => [
    { name: 'addressLine1', label: 'Address', type: 'text' },
  ]),
  buildPostalAddressFieldsBopThirdParty: jest.fn(() => [
    { name: 'postalAddressLine1', label: 'Postal Address', type: 'text' },
  ]),
  buildPhoneEmailFieldsBopThirdParty: jest.fn(() => [
    { name: 'mobileNumber', label: 'Mobile', type: 'text' },
  ]),
  buildEntityDetailsFields: jest.fn(() => [
    { name: 'entityName', label: 'Entity Name', type: 'text' },
  ]),
  buildEntityPhoneEmailFields: jest.fn(() => [
    { name: 'telephoneNumber', label: 'Telephone', type: 'text' },
  ]),
}));

jest.mock('../../../src/utils/BopThirdPartiesCreateLogic', () => ({
  getRulesForField: jest.fn(() => ({ required: true })),
}));

jest.mock('../../../lib/hooks/useBopThirdParty', () => ({
  useBopThirdParty: jest.fn(() => ({
    createBopThirdPartyRequest: jest.fn(() => Promise.resolve()),
    isLoading: false,
    error: null,
  })),
}));

jest.mock('../../../app/[locale]/setup-and-admin/bop-third-parties/bopThirdPartyHelper', () => ({
  bopThirdPartiesUrl: { home: '/home' },
  getFieldPath: jest.fn((name) => name),
  getBreadcrumbLinks: jest.fn(() => []),
  buildDefaultValues: jest.fn(() => ({})),
}));

jest.mock('../../../store/slices/bopThirdPartySlice', () => ({
  updateBopThirdParty: jest.fn((payload) => ({ type: 'UPDATE', payload })),
  updateBopThirdPartyObject: jest.fn((payload) => ({ type: 'UPDATE_OBJECT', payload })),
}));

const mockStore = configureStore({
  reducer: {
    bopThirdParty: (state = { bopThirdParty: {} }) => state,
  },
});

describe('BopThirdPartyDetailsPage', () => {
  let mockRouter: any;
  let mockSearchParams: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter = { push: jest.fn() };
    mockSearchParams = { get: jest.fn().mockReturnValue('individual') };
    
    const { useRouter, useSearchParams } = require('next/navigation');
    useRouter.mockReturnValue(mockRouter);
    useSearchParams.mockReturnValue(mockSearchParams);
  });

  const renderWithProvider = (component: React.ReactElement) => {
    return render(<Provider store={mockStore}>{component}</Provider>);
  };

  describe('Rendering', () => {
    it('renders stepper and form for individual', () => {
      renderWithProvider(<BopThirdPartyDetailsPage />);
      
      expect(screen.getByTestId('stepper')).toBeInTheDocument();
    });

    it('renders entity type when specified', () => {
      mockSearchParams.get.mockReturnValue('entity');
      renderWithProvider(<BopThirdPartyDetailsPage />);
      
      expect(screen.getByTestId('stepper')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('moves to next step on valid form', async () => {
      renderWithProvider(<BopThirdPartyDetailsPage />);
      
      const nextBtn = screen.getByTestId('next-btn');
      fireEvent.click(nextBtn);
      
      await waitFor(() => {
        expect(screen.getByTestId('stepper')).toHaveAttribute('data-active-step', '1');
      });
    });

    it('opens cancel dialog', () => {
      renderWithProvider(<BopThirdPartyDetailsPage />);
      
      fireEvent.click(screen.getByTestId('cancel-btn'));
      
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });
  });

  describe('Form Updates', () => {
    it('updates field values', () => {
      const { updateBopThirdParty } = require('../../../store/slices/bopThirdPartySlice');
      renderWithProvider(<BopThirdPartyDetailsPage />);
      
      const input = screen.getByTestId('field-firstName');
      fireEvent.change(input, { target: { value: 'John' } });
      
      expect(updateBopThirdParty).toHaveBeenCalled();
    });
  });

  describe('Submission', () => {
    it('submits and navigates on success', async () => {
      const mockCreate = jest.fn(() => Promise.resolve());
      const { useBopThirdParty } = require('../../../lib/hooks/useBopThirdParty');
      useBopThirdParty.mockReturnValue({
        createBopThirdPartyRequest: mockCreate,
        isLoading: false,
        error: null,
      });

      renderWithProvider(<BopThirdPartyDetailsPage />);
      
      
      fireEvent.click(screen.getByTestId('next-btn'));
      await waitFor(() => {
        expect(screen.getByTestId('stepper')).toHaveAttribute('data-active-step', '1');
      });

      fireEvent.click(screen.getByTestId('next-btn'));
      await waitFor(() => {
        expect(screen.getByTestId('stepper')).toHaveAttribute('data-active-step', '2');
      });

      fireEvent.click(screen.getByTestId('next-btn'));
      await waitFor(() => {
        expect(screen.getByTestId('stepper')).toHaveAttribute('data-active-step', '3');
      });
    });
  });
});
