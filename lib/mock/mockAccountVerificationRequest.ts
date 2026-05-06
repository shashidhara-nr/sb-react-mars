export const mockAccountVerificationRequest = Array.from({ length: 50 }, (_, i) => {
  return {
    id: `${i + 1}`,
    paymentId: `PAY${String(i + 1).padStart(4, '0')}`,
    batchId: `BATCH${String(i + 1).padStart(4, '0')}`,
    description: `This is a detailed description for verification batch ${i + 1}. The batch contains account verification requests that need to be processed.`,
    created: new Date(Date.now() - i * 86400000).toLocaleDateString('en-GB'),
    serviceType: ['Swift', 'SEPA', 'ACH', '  CHAPS'][i % 4],
    submissionMethod: ['Online', 'API', 'Manual', 'Batch'][i % 4],
    verified: new Date(Date.now() - i * 86400000).toLocaleDateString('en-GB'),
    status: ['Pending', 'Verified', 'Failed', 'In Progress'][i % 4],
    accounts: `${Math.floor(Math.random() * 5) + 1} account${Math.floor(Math.random() * 5) + 1 > 1 ? 's' : ''}`,
    quickLinks: {
      href: `/account-verification-request/details?mode=view&paymentId=${i + 1}`,
      text: 'verificationRequestDetails'
    }
  };
});

// Mock data for verification request batch accounts
export const mockVerificationRequestBatchData = Array.from({ length: 200 }, (_, i) => {
  const accountNumber = `XXXX${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
  const idNumber = `XXXX${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
  const statuses = ['Pending', 'Verified', 'Failed'];
  const status = statuses[i % 3];
  
  return {
    id: `${i + 1}`,
    accountNumber,
    lastName: `Last name / Company name`,
    idNumber,
    status,
    lastNameFixed: `[Last name / Company name]`,
    idNumberValue: `[XXXXXXXX]`,
    emailAddress: `[Verification status]`,
    telephoneNumber: `[Verification status]`,
    accountName: `[Verification status]`,
    accountTypeMatch: `[Account Type]`,
    accountStatus: `[Verification status]`,
    accountTypeMismatch: `[Account Type]`,
    branchSortCode: `[XX-XX-XX]`,
    verificationStatus1: `[Verification status]`,
    verificationStatus2: `[Verification status]`,
    verificationStatus3: `[Verification status]`,
    verificationStatus4: `[Verification status]`,
  };
});