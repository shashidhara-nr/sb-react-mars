// mockReports.ts

export const mockDormantBeneficieriesReports = Array.from({ length: 200 }, (_, i) => {
  return {
    transactionId: `${i + 1}`,
    beneficiaryCode: `Batch${String(i + 1).padStart(3, '0')}`,
    beneficiaryName: `Schedule${String(i + 1).padStart(3, '0')}`,
    paymentsTypes: `type ${i + 1}`,
    beneficiaryReference: i + 1,
    transferCurrency: `£${(1000 + i * 50).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    transferAmount: `£${(1000 + i * 50).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    lastPaymentDate: new Date(Date.now() - (i + 1) * 86400000).toLocaleDateString('en-GB')
  };
});

export const mockReturnedOrRedirectedReports = Array.from({ length: 200 }, (_, i) => {
  return {
    transactionId: `${i + 1}`,
    instructionId: `T${i + 1}`,
    batchId: `Batch${String(i + 1).padStart(3, '0')}`,
    amount:  `£${(1000 + i * 50).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    returnDate: new Date(Date.now() - i * 86400000).toLocaleDateString('en-GB'),
    statementReference: `statement ${i + 1}`,
    serviceLevel: `level ${i + 1}`,
    AccountDetails: `Account ${i + 1}`
  };
});

export const mockConsolidatedUnpaid = Array.from({ length: 200 }, (_, i) => {
  return {
    accountNumber: `${i + 1}`,
    accountName: `Account${i + 1}`,
    returnDate: new Date(Date.now() - i * 86400000).toLocaleDateString('en-GB'),
    valueDate: new Date(Date.now() - (i + 1) * 86400000).toLocaleDateString('en-GB'),
    currency: 'ZAR',
    amount:  `£${(1000 + i * 50).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    standardisedReason: `BEN${String(i + 1).padStart(4, '0')}`,
    statementReference: `Statement ${i + 1}`,
    transactionReference: `Transaction ${i + 1}`
  };
});

export const mockReports = Array.from({ length: 200 }, (_, i) => {
  const statuses = [
    { value: 'Fully processed', color: 'success' },
    { value: 'Processing failed', color: 'error' },
    { value: 'Awaiting customer audit', color: 'info' },
    { value: 'Processed successfully', color: 'success' },
  ];

  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1);
  const daysPerMonth = 5;
  const currentDate = new Date(startDate);
  currentDate.setDate(startDate.getDate() + Math.floor(i / daysPerMonth) * 7);
  
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');
  const year = currentDate.getFullYear();
  const dateRangeValue = new Date(year, currentDate.getMonth(), currentDate.getDate());
  
  return {
    id: i + 1,
    dateRange: `${day}/${month}/${year}`,
    dateRangeValue, 
    batchId: `BATCH-${1000 + i}`,
    processed: 5 + (i % 5),
    partiallyProcessed: i % 3,
    status: statuses[i % statuses.length],
  };
});
