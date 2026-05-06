//

const statuses = [
  { value: 'needsAction', color: 'warning' },
  { value: 'awaitingApproval', color: 'info' },
  { value: 'processing', color: 'info' },
  { value: 'complete', color: 'success' },
  { value: 'declined', color: 'error' },

];


export const mockTrack = Array.from({ length: 50 }, (_, i) => {
  const status = statuses[i % statuses.length];
  
  return {
    id: `${i + 1}`,
    batchId: `Batch${String(i + 1).padStart(4, '0')}`,
    valueDate: new Date(Date.now() - i * 86400000).toLocaleDateString('en-GB'),
    instructions: `Instruction ${i + 1}`,
    amount: `£${(100 + i * 10).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    transferType: `Type ${i + 1}`,
    status,
    quickLinks: {
      href: `/transfers/details?mode=view&authProfileId=${i + 1}`,
      text: 'manageTransfer'
    }
  };
});

export const mockReports = (() => {
  const reportStatuses = [
    { value: 'fullyProcessed', color: 'success' },
    { value: 'awaitingCustomerAudit', color: 'warning' },
    { value: 'processingFailed', color: 'error' },
    { value: 'processedSuccessfully', color: 'success' }
  ];

  const returnTypes = ['Returned', 'Redirects'];

  const reports = [];
  let id = 1;

  // Generate reports for multiple date ranges (20 different dates)
  for (let dateIndex = 0; dateIndex < 20; dateIndex++) {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1);
    const daysPerMonth = 5;
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + Math.floor(dateIndex / daysPerMonth) * 7);
    
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const year = currentDate.getFullYear();
    const dateRangeValue = new Date(year, currentDate.getMonth(), currentDate.getDate());

    // Generate 3-7 batches per date
    const batchesPerDate = 3 + (dateIndex % 5);
    
    for (let batchIndex = 0; batchIndex < batchesPerDate; batchIndex++) {
      reports.push({
        id: `${id}`,
        dateRange: `${day}/${month}/${year}`,
        dateRangeValue,
        batchId: `Batch${String(id).padStart(3, '0')}`,
        processedInstructions: 5 + (id % 5),
        partiallyProcessedInstructions: id % 3,
        batchStatus: reportStatuses[id % reportStatuses.length],
        // New fields for filtering
        accountName: `Batch${String(id).padStart(3, '0')}`,
        transferCurrency: 'All',
        serviceLevel: 'All',
        returnType: returnTypes[id % returnTypes.length]
      });
      id++;
    }
  }

  return reports;
})();

export const mockAuditTrail = Array.from({ length: 50 }, (_, i) => {
  const eventTypes = [
    'Login',
    'Logout',
    'Transfer Created',
    'Transfer Approved',
    'Transfer Declined',
    'User Created',
    'Settings Updated'
  ];
  
  return {
    id: `${i + 1}`,
    username: `User${String(i + 1).padStart(3, '0')}`,
    eventType: eventTypes[i % eventTypes.length],
    description: `Event description for action ${i + 1}`,
    dateAndTime: new Date(Date.now() - i * 3600000).toLocaleString('en-GB')
  };
});

