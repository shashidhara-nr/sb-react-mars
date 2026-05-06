export type BopThirdPartyRow = {
  id: string;
  bopThirdPartyID: string;
  thirdPartyName: string;
  ccn: string;
  entityCategory: string;
  entityType: 'Individual' | 'Company';
  hasPostalAddress: boolean;
  countryRegion: string;
  status: {
    value: 'Active' | 'Needs Action' | 'Awaiting Approval' | 'Inactive';
    color: 'success' | 'warning' | 'error' | 'info';
    bgColor?: string;
    textColor?: string;
    customPalette?: {
      success?: { lighter: string; light: string; main: string };
      warning?: { lighter: string; light: string; main: string };
      error?: { lighter: string; light: string; main: string };
      info?: { lighter: string; light: string; main: string };
    };
  };
  links: { href: string; text: string };
};

export const mockBopThirdParties: BopThirdPartyRow[] = [
  {
    id: '1',
    bopThirdPartyID: 'TP001',
    thirdPartyName: 'John Smith',
    ccn: '10234567',
    entityCategory: 'Importer',
    entityType: 'Individual',
    hasPostalAddress: false,
    countryRegion: 'United States',
    status: {
      value: 'Active',
      color: 'success',
      customPalette: {
        success: { lighter: '#F5FAF7', light: '#BFE0CC', main: '#008545' },
      },
    },
    links: { href: '/setup-and-admin/bop-third-parties/manage', text: 'MANAGE BOP THIRD PARTY' },
  },
  {
    id: '2',
    bopThirdPartyID: 'TP002',
    thirdPartyName: 'Acme Corporation',
    ccn: '20345678',
    entityCategory: 'Exporter',
    entityType: 'Company',
    hasPostalAddress: true,
    countryRegion: 'United Kingdom',
    status: {
      value: 'Awaiting Approval',
      color: 'warning',
      customPalette: { warning: { lighter: '#FFE9C7', light: '#FF8A00', main: '#FF8A00' } },
    },
    links: { href: '/setup-and-admin/bop-third-parties/manage', text: 'MANAGE BOP THIRD PARTY' },
  },

  {
    id: '4',
    bopThirdPartyID: 'TP004',
    thirdPartyName: 'Global Industries Ltd',
    ccn: '40567890',
    entityCategory: 'Manufacturer',
    entityType: 'Company',
    hasPostalAddress: false,
    countryRegion: 'Germany',
    status: {
      value: 'Needs Action',
      color: 'info',
      customPalette: { info: { lighter: '#BFDCFC', light: '#00cafb', main: '#00cafb' } },
    },
    links: { href: '/setup-and-admin/bop-third-parties/manage', text: 'MANAGE BOP THIRD PARTY' },
  },
  {
    id: '5',
    bopThirdPartyID: 'TP005',
    thirdPartyName: 'Michael Johnson',
    ccn: '50678901',
    entityCategory: 'Broker',
    entityType: 'Individual',
    hasPostalAddress: false,
    countryRegion: 'France',
    status: {
      value: 'Active',
      color: 'success',
      customPalette: { success: { lighter: '#F5FAF7', light: '#BFE0CC', main: '#008545' } },
    },
    links: { href: '/setup-and-admin/bop-third-parties/manage', text: 'MANAGE BOP THIRD PARTY' },
  },

  {
    id: '7',
    bopThirdPartyID: 'TP007',
    thirdPartyName: 'Sarah Williams',
    ccn: '70890123',
    entityCategory: 'Importer',
    entityType: 'Individual',
    hasPostalAddress: true,
    countryRegion: 'Canada',
    status: {
      value: 'Active',
      color: 'success',
      customPalette: { success: { lighter: '#F5FAF7', light: '#BFE0CC', main: '#008545' } },
    },
    links: { href: '/setup-and-admin/bop-third-parties/manage', text: 'MANAGE BOP THIRD PARTY' },
  },
  {
    id: '8',
    bopThirdPartyID: 'TP008',
    thirdPartyName: 'Blue Sky Enterprises',
    ccn: '80901234',
    entityCategory: 'Wholesaler',
    entityType: 'Company',
    hasPostalAddress: false,
    countryRegion: 'Germany',
    status: {
      value: 'Awaiting Approval',
      color: 'warning',
      customPalette: { warning: { lighter: '#FFE9C7', light: '#FF8A00', main: '#FF8A00' } },
    },
    links: { href: '/setup-and-admin/bop-third-parties/manage', text: 'MANAGE BOP THIRD PARTY' },
  },
  {
    id: '9',
    bopThirdPartyID: 'TP009',
    thirdPartyName: 'David Brown',
    ccn: '91012345',
    entityCategory: 'Freight Forwarder',
    entityType: 'Individual',
    hasPostalAddress: false,
    countryRegion: 'United States',
    status: {
      value: 'Active',
      color: 'success',
      customPalette: { success: { lighter: '#F5FAF7', light: '#BFE0CC', main: '#008545' } },
    },
    links: { href: '/setup-and-admin/bop-third-parties/manage', text: 'MANAGE BOP THIRD PARTY' },
  },

  {
    id: '11',
    bopThirdPartyID: 'TP011',
    thirdPartyName: 'Emily Davis',
    ccn: '11234567',
    entityCategory: 'Broker',
    entityType: 'Individual',
    hasPostalAddress: true,
    countryRegion: 'Germany',
    status: {
      value: 'Active',
      color: 'success',
      customPalette: { success: { lighter: '#F5FAF7', light: '#BFE0CC', main: '#008545' } },
    },
    links: { href: '/setup-and-admin/bop-third-parties/manage', text: 'MANAGE BOP THIRD PARTY' },
  },
  {
    id: '12',
    bopThirdPartyID: 'TP012',
    thirdPartyName: 'Horizon Group',
    ccn: '12345678',
    entityCategory: 'Manufacturer',
    entityType: 'Company',
    hasPostalAddress: false,
    countryRegion: 'France',
    status: {
      value: 'Active',
      color: 'success',
      customPalette: { success: { lighter: '#F5FAF7', light: '#BFE0CC', main: '#008545' } },
    },
    links: { href: '/setup-and-admin/bop-third-parties/manage', text: 'MANAGE BOP THIRD PARTY' },
  },

  {
    id: '14',
    bopThirdPartyID: 'TP014',
    thirdPartyName: 'Pacific Trading Co',
    ccn: '14567890',
    entityCategory: 'Wholesaler',
    entityType: 'Company',
    hasPostalAddress: true,
    countryRegion: 'United Kingdom',
    status: {
      value: 'Awaiting Approval',
      color: 'warning',
      customPalette: { warning: { lighter: '#FFE9C7', light: '#FF8A00', main: '#FF8A00' } },
    },
    links: { href: '/setup-and-admin/bop-third-parties/manage', text: 'MANAGE BOP THIRD PARTY' },
  },
  {
    id: '15',
    bopThirdPartyID: 'TP015',
    thirdPartyName: 'Lisa Anderson',
    ccn: '15678901',
    entityCategory: 'Importer',
    entityType: 'Individual',
    hasPostalAddress: true,
    countryRegion: 'United States',
    status: {
      value: 'Active',
      color: 'success',
      customPalette: { success: { lighter: '#F5FAF7', light: '#BFE0CC', main: '#008545' } },
    },
    links: { href: '/setup-and-admin/bop-third-parties/manage', text: 'MANAGE BOP THIRD PARTY' },
  },
];

// Detailed mock for Individual BOP Third Party (for manage page)
export const mockIndividualBopThirdParty = {
  entityKey: 1001,
  entityType: 'individual' as const,
  status: 'Active',
  
  // Personal details
  firstName: 'John',
  lastName: 'Smith',
  dateOfBirth: '1985-06-15',
  gender: 'male',
  taxpayerReference: '9876543210',
  vatReference: 'VAT12345',
  customsClientNo: 'CCN10234567',
  idNumber: 'ID123456789',
  idType: 'Passport',
  
  // Physical address
  address: {
    addressLine1: '123 Main Street',
    addressLine2: 'Suite 400',
    postCode: '10001',
    suburb: 'Manhattan',
    townName: 'New York',
    region: 'New York',
    countryCode: 'US',
  },
  
  // Postal address
  hasPostalAddress: true,
  postalAddress: {
    addressLine1: 'PO Box 5678',
    addressLine2: '',
    postCode: '10002',
    suburb: 'Brooklyn',
    townName: 'New York',
    region: 'New York',
    countryCode: 'US',
  },
  
  // Contact details
  contact: {
    contactFirstName: 'Jane',
    contactLastName: 'Doe',
    telephoneNumber: '+27115550100',
    mobileNumber: '+27825550200',
    faxNumber: '+27115550300',
    email: 'john.smith@example.com',
  },
  
  // Metadata
  ccn: '10234567',
  entityCategory: 'Importer',
  countryRegion: 'United States',
  versionNumber: 1,
  createdBy: 'admin@bank.com',
  createdDateTime: '2024-01-15T10:30:00Z',
};

// Detailed mock for Entity BOP Third Party (for manage page)
export const mockEntityBopThirdParty = {
  entityKey: 2001,
  entityType: 'entity' as const,
  status: 'Active',
  
  // Entity details
  entityName: 'Global Trading Partners LLC',
  taxpayerReference: '1234567890',
  vatReference: 'VAT67890',
  customsClientNo: 'CCN20345678',
  idNumber: 'REG987654321',
  idType: 'National ID',
  
  // Physical address
  address: {
    addressLine1: '456 Business Boulevard',
    addressLine2: 'Floor 12',
    postCode: 'SW1A 1AA',
    suburb: 'Westminster',
    townName: 'London',
    region: 'Greater London',
    countryCode: 'GB',
  },
  
  // Postal address
  hasPostalAddress: true,
  postalAddress: {
    addressLine1: 'PO Box 9999',
    addressLine2: '',
    postCode: 'SW1A 2AA',
    suburb: 'Westminster',
    townName: 'London',
    region: 'Greater London',
    countryCode: 'GB',
  },
  
  // Contact details
  contact: {
    contactFirstName: 'Michael',
    contactLastName: 'Johnson',
    telephoneNumber: '+27217946095',
    mobileNumber: '+27791112345',
    faxNumber: '+27217946096',
    email: 'contact@globaltrading.co.uk',
  },
  
  // Metadata
  ccn: '20345678',
  entityCategory: 'Exporter',
  countryRegion: 'United Kingdom',
  versionNumber: 1,
  createdBy: 'admin@bank.com',
  createdDateTime: '2024-02-10T14:20:00Z',
};

// Detailed mock for Company BOP Third Party (for manage page)
export const mockCompanyBopThirdParty = {
  entityKey: 3001,
  entityType: 'company' as const,
  status: 'Active',
  
  // Company details
  entityName: 'Acme Corporation International',
  companyCategory: 'listed_company',
  taxpayerReference: '5555666677',
  vatReference: 'VAT99999',
  customsClientNo: 'CCN30456789',
  idNumber: 'CRN123456789',
  idType: 'Other',
  
  // Physical address
  address: {
    addressLine1: '789 Corporate Drive',
    addressLine2: 'Building A',
    postCode: '75001',
    suburb: '1st Arrondissement',
    townName: 'Paris',
    region: 'Île-de-France',
    countryCode: 'FR',
  },
  
  // Postal address
  hasPostalAddress: true,
  postalAddress: {
    addressLine1: 'PO Box 12345',
    addressLine2: 'Service Courrier',
    postCode: '75002',
    suburb: '2nd Arrondissement',
    townName: 'Paris',
    region: 'Île-de-France',
    countryCode: 'FR',
  },
  
  // Contact details
  contact: {
    contactFirstName: 'Sophie',
    contactLastName: 'Dubois',
    telephoneNumber: '+27112345678',
    mobileNumber: '+27821234567',
    faxNumber: '+27112345679',
    email: 'contact@acmecorp.fr',
  },
  
  // Metadata
  ccn: '30456789',
  entityCategory: 'Manufacturer',
  countryRegion: 'France',
  versionNumber: 1,
  createdBy: 'admin@bank.com',
  createdDateTime: '2024-03-05T09:15:00Z',
};
