// mockServiceAgreement.ts
const serviceAgreementTypes = ['Payment Processing', 'Account Management', 'Treasury', 'Trade Finance', 'Cash Management', 'Liquidity Services'];
const agreementStatus = ['Active', 'Inactive', 'Pending', 'Expired', 'Suspended'];
const statusColors = { Active: 'success', Inactive: 'error', Pending: 'warning', Expired: 'error', Suspended: 'warning' };

export const mockServiceAgreementData = Array.from({ length: 200 }, (_, i) => {
  const status = agreementStatus[i % agreementStatus.length];
  return {
    id: `${i + 1}`,
    serviceAgreementName: `${serviceAgreementTypes[i % serviceAgreementTypes.length]} - Agreement ${String(i + 1).padStart(3, '0')}`,
    numberOfAccounts: Math.floor(Math.random() * 50) + 1,
    description: `Corporate service agreement for ${serviceAgreementTypes[i % serviceAgreementTypes.length].toLowerCase()} services with comprehensive fee structure and SLA terms`,
    status: { value: status, color: statusColors[status as keyof typeof statusColors] },
    effectiveDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
    expiryDate: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
    clientName: `Client ${String(i + 1).padStart(3, '0')}`,
    agreementType: serviceAgreementTypes[i % serviceAgreementTypes.length],
    links: { href: `/service-agreements/details/${i + 1}`, text: 'viewServiceAgreementDetails' }
  };
});

export const mockServiceAgreementAccountData = Array.from({ length: 200 }, (_, i) => ({
  id: `${i + 1}`,
  owner: `Owner Name ${String(i + 1).padStart(3, '0')}`,
  accountName: `Corporate Account ${String(i + 1).padStart(3, '0')}`,
  accountNumber: `${String(i + 1).padStart(2, '0')}${String(Math.floor(Math.random() * 1000000000)).padStart(8, '0')}`,
  branchSortCode: `${String(Math.floor(Math.random() * 99) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 99) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 99) + 1).padStart(2, '0')}`,
  bicSwift: `SBZAUS3D${String(i + 1).padStart(4, '0')}`,
  iban: `GB${String(Math.floor(Math.random() * 99) + 1).padStart(2, '0')}SBZA${String(Math.floor(Math.random() * 1000000000000000)).padStart(16, '0')}`,
  bankName: `Standard Bank SA - Branch ${String(Math.floor(Math.random() * 50) + 1).padStart(2, '0')}`,
  currency: ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'ZAR'][i % 8],
  accountType: ['Current', 'Savings', 'Transaction', 'Investment'][i % 4],
  status: i % 10 === 0 ? 'Dormant' : 'Active',
}));

export const mockServiceAgreementServiceData = Array.from({ length: 200 }, (_, i) => {
  const serviceTypes = ['Payment Processing', 'Account Management', 'Treasury Services', 'Trade Finance', 'Cash Management', 'Liquidity Management'];
  const modules = ['Core Banking', 'Payments', 'Trade', 'Treasury', 'Cash', 'Analytics'];
  const groups = ['Standard', 'Premium', 'Enterprise', 'Custom'];
  
  return {
    id: `${i + 1}`,
    serviceName: `${serviceTypes[i % serviceTypes.length]} - Service ${String(i + 1).padStart(3, '0')}`,
    serviceModule: modules[i % modules.length],
    serviceGroup: groups[i % groups.length],
    description: `Full-featured ${serviceTypes[i % serviceTypes.length].toLowerCase()} with advanced capabilities and 24/7 support`,
    feeStructure: `${(Math.random() * 0.5 + 0.1).toFixed(2)}% per transaction`,
    monthlyMinimumFee: `USD ${(Math.random() * 4000 + 1000).toFixed(2)}`,
    status: i % 15 === 0 ? 'Inactive' : 'Active',
    links: { href: `/service-agreements/details/service?id=${i + 1}`, text: 'viewServiceDetails' }
  };
});

export const mockServiceAgreementServiceDetailData = Array.from({ length: 200 }, (_, i) => {
  const attributeTypes = ['Throughput Limit', 'File Size Limit', 'API Rate Limit', 'Batch Processing', 'Real-time Processing', 'Settlement Terms', 'Reporting Frequency', 'SLA Uptime'];
  const status = i % 8 === 0 ? 'Inactive' : 'Active';
  const statusColor = status === 'Active' ? 'success' : 'error';
  
  return {
    id: `${i + 1}`,
    attributeName: `${attributeTypes[i % attributeTypes.length]} - Attribute ${String(i + 1).padStart(3, '0')}`,
    attributeValue: i % 4 === 0 ? 'Unlimited' : `${(Math.random() * 100 + 100).toFixed(0)} requests/day`,
    effectiveFrom: new Date(2024, 0, 1).toISOString().split('T')[0],
    effectiveTo: new Date(2025, 11, 31).toISOString().split('T')[0],
    description: `${attributeTypes[i % attributeTypes.length]} configuration for service agreement`,
    status: { value: status, color: statusColor },
  };
});

// Helper function to get specific service agreement by ID
export const getServiceAgreementById = (id: string | number) => {
  const idNum = typeof id === 'string' ? parseInt(id, 10) : id;
  return mockServiceAgreementData[idNum - 1] || mockServiceAgreementData[0];
};

// Helper function to get accounts for a specific service agreement
export const getAccountsByServiceAgreementId = (id: string | number, limit: number = 200) => {
  const idNum = typeof id === 'string' ? parseInt(id, 10) : id;
  return mockServiceAgreementAccountData.slice((idNum - 1) * 5, (idNum - 1) * 5 + limit);
};

// Helper function to get services for a specific service agreement
export const getServicesByServiceAgreementId = (id: string | number, limit: number = 200) => {
  const idNum = typeof id === 'string' ? parseInt(id, 10) : id;
  return mockServiceAgreementServiceData.slice((idNum - 1) * 5, (idNum - 1) * 5 + limit);
};

// Add Service Form Data Structure
export const defaultAddServiceFormData = {
  serviceName: '',
  serviceModule: '',
  serviceGroup: '',
  description: '',
  feeStructure: '',
  monthlyMinimumFee: '',
  status: 'Active',
};

// Service Module Options
export const serviceModuleOptions = [
  { value: 'Core Banking', label: 'Core Banking' },
  { value: 'Payments', label: 'Payments' },
  { value: 'Trade', label: 'Trade' },
  { value: 'Treasury', label: 'Treasury' },
  { value: 'Cash', label: 'Cash' },
  { value: 'Analytics', label: 'Analytics' },
];

// Service Group Options
export const serviceGroupOptions = [
  { value: 'Standard', label: 'Standard' },
  { value: 'Premium', label: 'Premium' },
  { value: 'Enterprise', label: 'Enterprise' },
  { value: 'Custom', label: 'Custom' },
];

// Service Type Options
export const serviceTypeOptions = [
  { value: 'Payment Processing', label: 'Payment Processing' },
  { value: 'Account Management', label: 'Account Management' },
  { value: 'Treasury Services', label: 'Treasury Services' },
  { value: 'Trade Finance', label: 'Trade Finance' },
  { value: 'Cash Management', label: 'Cash Management' },
  { value: 'Liquidity Management', label: 'Liquidity Management' },
];

// Status Options
export const statusOptions = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
  { value: 'Pending', label: 'Pending' },
];

// Self-Service Data Structure
export const mockSelfServiceData = Array.from({ length: 15 }, (_, i) => {
  const serviceTypes = ['Payment Processing', 'Account Management', 'Treasury Services', 'Trade Finance', 'Cash Management', 'Liquidity Management'];
  const modules = ['Core Banking', 'Payments', 'Trade', 'Treasury', 'Cash', 'Analytics'];
  const groups = ['Standard', 'Premium', 'Enterprise', 'Custom'];
  
  return {
    id: `${i + 1}`,
    serviceName: `${serviceTypes[i % serviceTypes.length]} - Service ${String(i + 1).padStart(3, '0')}`,
    subService: modules[i % modules.length],
    comment: groups[i % groups.length],
    description: `Self-service ${serviceTypes[i % serviceTypes.length].toLowerCase()} for client activation`,
    canActivateWithoutBank: true,
    requiresApproval: i % 5 === 0,
    status: 'Available',
  };
});

// Self-Service Form Data Structure
export const defaultSelfServiceFormData = {
  serviceName: '',
  subService: '',
  comment: '',
};

// Helper function to get available self-services
export const getAvailableSelfServices = (limit: number = 10) => {
  return mockSelfServiceData.slice(0, limit);
};

// Helper function to save activated self-services
export const saveSelfServices = (serviceAgreementId: string, activatedServices: Record<string, boolean>) => {
  // Mock implementation - in real app this would call an API
  console.log(`Saving self-services for agreement ${serviceAgreementId}:`, activatedServices);
  return {
    success: true,
    message: 'Self-services activated successfully',
    activatedCount: Object.values(activatedServices).filter(Boolean).length,
  };
};
