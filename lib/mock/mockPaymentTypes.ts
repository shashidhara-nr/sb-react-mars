export type MockPaymentType = {
  id: string;
  paymentTypeName: string;
  authorisationProfile: string;
  customerAgreement: string;
  numberOfAccounts: number;
  payAlerts: 'Yes' | 'No';
  status: { value: 'Active' | 'Awaiting Approval' | 'Draft'; color: 'success' | 'warning' | 'default' };
  links: { href: string; text: string };
};

export const mockPaymentTypes: MockPaymentType[] = [
  {
    id: '1',
    paymentTypeName: 'Wire Transfer',
    authorisationProfile: 'Standard',
    customerAgreement: 'Agreement A',
    numberOfAccounts: 3,
    payAlerts: 'Yes',
    status: { value: 'Active', color: 'success' },
    links: { href: '#', text: 'managePaymentType' },
  },
  {
    id: '2',
    paymentTypeName: 'ACH',
    authorisationProfile: 'Premium',
    customerAgreement: 'Agreement B',
    numberOfAccounts: 1,
    payAlerts: 'No',
    status: { value: 'Awaiting Approval', color: 'warning' },
    links: { href: '#', text: 'managePaymentType' },
  },
  {
    id: '3',
    paymentTypeName: 'SEPA',
    authorisationProfile: 'Standard',
    customerAgreement: 'Agreement C',
    numberOfAccounts: 2,
    payAlerts: 'Yes',
    status: { value: 'Active', color: 'success' },
    links: { href: '#', text: 'managePaymentType' },
  },
  {
    id: '4',
    paymentTypeName: 'SWIFT MT101',
    authorisationProfile: 'Standard',
    customerAgreement: 'Agreement D',
    numberOfAccounts: 5,
    payAlerts: 'No',
    status: { value: 'Active', color: 'success' },
    links: { href: '#', text: 'managePaymentType' },
  },
  {
    id: '5',
    paymentTypeName: 'Local EFT',
    authorisationProfile: 'Basic',
    customerAgreement: 'Agreement E',
    numberOfAccounts: 4,
    payAlerts: 'Yes',
    status: { value: 'Awaiting Approval', color: 'warning' },
    links: { href: '#', text: 'managePaymentType' },
  },
  {
    id: '6',
    paymentTypeName: 'Real-Time Gross Settlement',
    authorisationProfile: 'Premium',
    customerAgreement: 'Agreement F',
    numberOfAccounts: 2,
    payAlerts: 'No',
    status: { value: 'Active', color: 'success' },
    links: { href: '#', text: 'managePaymentType' },
  },
  {
    id: '7',
    paymentTypeName: 'International Wire',
    authorisationProfile: 'Premium',
    customerAgreement: 'Agreement G',
    numberOfAccounts: 1,
    payAlerts: 'Yes',
    status: { value: 'Active', color: 'success' },
    links: { href: '#', text: 'managePaymentType' },
  },
  {
    id: '8',
    paymentTypeName: 'SEPA Instant',
    authorisationProfile: 'Standard',
    customerAgreement: 'Agreement H',
    numberOfAccounts: 6,
    payAlerts: 'No',
    status: { value: 'Active', color: 'success' },
    links: { href: '#', text: 'managePaymentType' },
  },
  {
    id: '9',
    paymentTypeName: 'ACH Same Day',
    authorisationProfile: 'Standard',
    customerAgreement: 'Agreement I',
    numberOfAccounts: 3,
    payAlerts: 'Yes',
    status: { value: 'Awaiting Approval', color: 'warning' },
    links: { href: '#', text: 'managePaymentType' },
  },
  {
    id: '10',
    paymentTypeName: 'Faster Payments',
    authorisationProfile: 'Basic',
    customerAgreement: 'Agreement J',
    numberOfAccounts: 2,
    payAlerts: 'No',
    status: { value: 'Active', color: 'success' },
    links: { href: '#', text: 'managePaymentType' },
  },
];
