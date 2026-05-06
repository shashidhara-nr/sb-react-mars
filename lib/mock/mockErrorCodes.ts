export type MockErrorCode = {
  errorCode: string;
  errorDescription: string;
  lastModifiedDate: string;
  status: {
    label: string;
    value: 'New' | 'Updated' | 'Active';
  };
};

export const mockErrorCodes: MockErrorCode[] = [
  {
    errorCode: 'g',
    errorDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    lastModifiedDate: '2025/03/21',
    status: {
      label: 'New',
      value: 'New',
    },
  },
  {
    errorCode: 'i*',
    errorDescription: 'CDI run-tier you provided is not valid',
    lastModifiedDate: '2025/03/21',
    status: {
      label: 'Stalled',
      value: 'Updated',
    },
  },
  {
    errorCode: 'i*',
    errorDescription: 'Total batch number does not match number of batches for file. Total transaction number does...',
    lastModifiedDate: '2025/03/21',
    status: {
      label: 'Active',
      value: 'Active',
    },
  },
  {
    errorCode: 'i*',
    errorDescription: 'Account is currently on Fold',
    lastModifiedDate: '2025/03/21',
    status: {
      label: 'New',
      value: 'New',
    },
  },
  {
    errorCode: 'i*',
    errorDescription: 'Account is currently not in use',
    lastModifiedDate: '2025/03/21',
    status: {
      label: 'Stalled',
      value: 'Updated',
    },
  },
  {
    errorCode: 'i*',
    errorDescription: 'Account has been suspended',
    lastModifiedDate: '2025/03/21',
    status: {
      label: 'Active',
      value: 'Active',
    },
  },
  {
    errorCode: 'i*',
    errorDescription: 'Account is currently unavailable',
    lastModifiedDate: '2025/03/21',
    status: {
      label: 'New',
      value: 'New',
    },
  },
  {
    errorCode: 'i*',
    errorDescription: 'Account is not active at the moment',
    lastModifiedDate: '2025/03/21',
    status: {
      label: 'Stalled',
      value: 'Updated',
    },
  },
  {
    errorCode: 'i*',
    errorDescription: 'Access to account is restricted',
    lastModifiedDate: '2025/03/21',
    status: {
      label: 'Active',
      value: 'Active',
    },
  },
  {
    errorCode: 'i*',
    errorDescription: 'Account is not currently active',
    lastModifiedDate: '2025/03/21',
    status: {
      label: 'New',
      value: 'New',
    },
  },
  {
    errorCode: 'i*',
    errorDescription: 'Account is temporarily disabled',
    lastModifiedDate: '2025/03/21',
    status: {
      label: 'Stalled',
      value: 'Updated',
    },
  },
  {
    errorCode: 'i*',
    errorDescription: 'Account is inactive',
    lastModifiedDate: '2025/03/21',
    status: {
      label: 'Active',
      value: 'Active',
    },
  },
  {
    errorCode: 'i*',
    errorDescription: 'Invalid account currency',
    lastModifiedDate: '2025/03/21',
    status: {
      label: 'New',
      value: 'New',
    },
  },
  {
    errorCode: 'i*',
    errorDescription: 'Submission code mismatch',
    lastModifiedDate: '2025/03/21',
    status: {
      label: 'Stalled',
      value: 'Updated',
    },
  },
  {
    errorCode: 'i*',
    errorDescription: 'Account skipped',
    lastModifiedDate: '2025/03/21',
    status: {
      label: 'Active',
      value: 'Active',
    },
  },
];
