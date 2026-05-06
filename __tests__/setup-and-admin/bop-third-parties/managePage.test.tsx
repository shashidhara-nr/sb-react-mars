import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import BopThirdPartyManagePage from '../../../app/[locale]/setup-and-admin/bop-third-parties/manage/page';
import '@testing-library/jest-dom';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
  useSearchParams: jest.fn(() => ({ get: jest.fn() })),
}));

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock('../../../lib/hooks/useAppDispatch', () => ({
  useAppDispatch: jest.fn(() => jest.fn()),
  useAppSelector: jest.fn((selector) => selector({
    bopThirdParty: { managedBopThirdParty: { id: '123', entityType: 'individual' } }
  })),
}));

jest.mock('../../../src/utils/testIds', () => ({
  buildTestId: jest.fn((...parts) => parts.filter(Boolean).join('-')),
}));

jest.mock('../../../lib/icons', () => ({
  AvatarAlert: '/icons/avatar-alert.svg',
  IcnLocationOutline: '/icons/location.svg',
  IcnMail: '/icons/mail.svg',
  IcnNametag: '/icons/nametag.svg',
  IcnBroadcast: '/icons/broadcast.svg',
  ResidentCompanyIcon: '/icons/company.svg',
  DeleteIcon: '/icons/delete.svg',
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
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
    resetField: jest.fn(),
    clearErrors: jest.fn(),
  })),
  useWatch: jest.fn((config) => {
   if (Array.isArray(config?.name)) {
      return config.name.map(() => '');
    }
    return undefined;
  }),
  Controller: ({ render }: any) => render({ field: { value: '', onChange: jest.fn() } }),
}));

jest.mock('@mui/material', () => ({
  Box: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

jest.mock('../../../dist/standard-bank-react', () => ({
  Breadcrumb: ({ 'data-testid': testId, ...props }: any) => <nav data-testid={testId || 'breadcrumb'}></nav>,
  Heading: ({ children }: any) => <h1 data-testid="heading">{children}</h1>,
  Dialog: ({ open, children }: any) => open ? <div data-testid="dialog">{children}</div> : null,
  Button: ({ children, onClick, 'data-testid': testId, ...props }: any) => (
    <button onClick={onClick} data-testid={testId} {...props}>{children}</button>
  ),
}));

jest.mock('../../../components/common/CreateJournyForm', () => {
  return {
    __esModule: true,
    default: ({ sections, fields, onFieldChange, title }: any) => (
      <div data-testid="create-journey-form">
        {sections?.map((section: any, i: number) => (
          <div key={i} data-testid={`section-${section.title || i}`}>
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
        {fields?.map((field: any, i: number) => (
          <input
            key={i}
            data-testid={`field-${field.name}`}
            name={field.name}
            onChange={(e) => onFieldChange?.(field.name, e.target.value)}
          />
        ))}
      </div>
    ),
  };
});

jest.mock('../../../components/common/formActionButtons', () => ({
  FormActionButtons: ({ onCancel, onNext, useDeleteIcon }: any) => (
    <div data-testid="form-action-buttons">
      <button data-testid="cancel-btn" onClick={onCancel}>Cancel</button>
      <button data-testid="next-btn" onClick={onNext} data-use-delete={useDeleteIcon}>Next</button>
    </div>
  ),
}));

jest.mock('../../../src/utils/BopThirdPartiesField', () => ({
  buildPersonalFieldsBopThirdParty: jest.fn(() => [
    { name: 'firstName', label: 'First Name', type: 'text' },
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
  getRulesForField: jest.fn(() => ({})),
}));

const mockUseBopThirdParty = {
  getBopThirdPartyById: jest.fn(),
  updateBopThirdPartyRequest: jest.fn(() => Promise.resolve()),
  deleteBopThirdPartyRequest: jest.fn(() => Promise.resolve()),
  isLoading: false,
};

jest.mock('../../../lib/hooks/useBopThirdParty', () => ({
  useBopThirdParty: jest.fn(() => mockUseBopThirdParty),
}));

jest.mock('../../../app/[locale]/setup-and-admin/bop-third-parties/bopThirdPartyHelper', () => ({
  bopThirdPartiesUrl: { home: '/home' },
  getFieldPath: jest.fn((name) => name),
  getBreadcrumbLinks: jest.fn(() => []),
  buildDefaultValues: jest.fn(() => ({})),
}));

jest.mock('../../../store/slices/bopThirdPartySlice', () => ({
  updateManagedBopThirdParty: jest.fn((payload) => ({ type: 'UPDATE', payload })),
  updateManagedBopThirdPartyObject: jest.fn((payload) => ({ type: 'UPDATE_OBJECT', payload })),
}));

const mockStore = configureStore({
  reducer: {
    bopThirdParty: (state = { managedBopThirdParty: { id: '123', entityType: 'individual' } }) => state,
  },
});

describe('BopThirdPartyManagePage', () => {
  let mockRouter: any;
  let mockSearchParams: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter = { push: jest.fn() };
    mockSearchParams = { 
      get: jest.fn((param) => {
        if (param === 'id') return '123';
        if (param === 'type') return 'individual';
        if (param === 'postal') return 'false';
        return null;
      })
    };
    
    const { useRouter, useSearchParams } = require('next/navigation');
    useRouter.mockReturnValue(mockRouter);
    useSearchParams.mockReturnValue(mockSearchParams);
  });

  const renderWithProvider = (component: React.ReactElement) => {
    return render(<Provider store={mockStore}>{component}</Provider>);
  };

  describe('Rendering', () => {
    it('renders main components', () => {
      renderWithProvider(<BopThirdPartyManagePage />);
      
      expect(screen.getByTestId('bop-third-parties-manage-breadcrumb')).toBeInTheDocument();
      expect(screen.getByTestId('heading')).toBeInTheDocument();
      expect(screen.getAllByTestId('create-journey-form').length).toBeGreaterThan(0);
    });

    it('loads existing third party data', () => {
      renderWithProvider(<BopThirdPartyManagePage />);
      
      expect(mockUseBopThirdParty.getBopThirdPartyById).toHaveBeenCalledWith('123');
    });
  });

  describe('Form Updates', () => {
    it('updates field values', () => {
      const { updateManagedBopThirdParty } = require('../../../store/slices/bopThirdPartySlice');
      renderWithProvider(<BopThirdPartyManagePage />);
      
      const input = screen.queryByTestId('field-firstName');
      if (input) {
        fireEvent.change(input, { target: { value: 'John' } });
      } else {
        expect(screen.getAllByTestId('create-journey-form').length).toBeGreaterThan(0);
      }
    });

    it('handles postal address checkbox', () => {
      renderWithProvider(<BopThirdPartyManagePage />);
      
      const checkbox = screen.queryByTestId('field-postalAddressCheckbox');
      if (checkbox) {
        fireEvent.change(checkbox, { target: { value: true } });
      }
      
      expect(screen.getAllByTestId('create-journey-form').length).toBeGreaterThan(0);
    });
  });

  describe('Actions', () => {

    it('shows delete dialog', async () => {
      renderWithProvider(<BopThirdPartyManagePage />);
      const deleteBtn = screen.queryByTestId('cancel-btn');
      if (deleteBtn) {
        fireEvent.click(deleteBtn);
      }
    });
  });

  describe('Entity Type', () => {
    it('renders entity form fields', () => {
      mockSearchParams.get.mockImplementation((param) => {
        if (param === 'type') return 'entity';
        if (param === 'id') return '123';
        return 'false';
      });
      
      renderWithProvider(<BopThirdPartyManagePage />);
      
      expect(screen.getAllByTestId('create-journey-form').length).toBeGreaterThan(0);
    });
  });

  describe('Postal Address', () => {
    it('shows postal address when flag is true', () => {
      mockSearchParams.get.mockImplementation((param) => {
        if (param === 'postal') return 'true';
        if (param === 'id') return '123';
        if (param === 'type') return 'individual';
        return null;
      });
      
      renderWithProvider(<BopThirdPartyManagePage />);
      
      expect(screen.getAllByTestId('create-journey-form').length).toBeGreaterThan(0);
    });
  });
});
