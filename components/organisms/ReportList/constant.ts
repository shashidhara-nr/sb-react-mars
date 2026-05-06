
export const DORMANT_BENEFICIARY_TABLE_COLUMNS = [
    'transactionId',
    'beneficiaryCode',
    'beneficiaryName',
    'paymentsTypes',
    'beneficiaryReference',
    'transferCurrency',
    'transferAmount',
    'lastPaymentDate',
] as const;

export const DORMANT_BENEFICIARY_TABLE_HEAD_CELLS = [
    { id: 'transactionId', labelKey: 'transactionId', numeric: true, colWidth: '150px' },
    { id: 'beneficiaryCode', labelKey: 'beneficiaryCode', numeric: true, colWidth: '150px' },
    { id: 'beneficiaryName', labelKey: 'beneficiaryName', numeric: false, colWidth: '150px' },
    { id: 'paymentsTypes', labelKey: 'paymentsTypes', numeric: false, colWidth: '150px' },
    { id: 'beneficiaryReference', labelKey: 'beneficiaryReference', numeric: false, colWidth: '150px' },
    { id: 'transferCurrency', labelKey: 'transferCurrency', numeric: true, colWidth: '150px' },
    { id: 'transferAmount', labelKey: 'transferAmount', numeric: true, colWidth: '150px' },
    { id: 'lastPaymentDate', labelKey: 'lastPaymentDate', numeric: true, colWidth: '150px' }
] as const;

export const RETURNED_REDIRECTED_TABLE_COLUMNS = [
    'transactionId',
    'instructionId',
    'batchId',
    'amount',
    'returnDate',
    'statementReference',
    'serviceLevel',
    'AccountDetails'
] as const;

export const RETURNED_REDIRECTED_TABLE_HEAD_CELLS = [
    { id: 'transactionId', labelKey: 'transactionId', numeric: true, colWidth: '150px' },
    { id: 'instructionId', labelKey: 'instructionId', numeric: true, colWidth: '150px' },
    { id: 'batchId', labelKey: 'batchId', numeric: true, colWidth: '120px' },
    { id: 'amount', labelKey: 'amount', numeric: true, colWidth: '180px' },
    { id: 'returnDate', labelKey: 'returnDate', numeric: true, colWidth: '100px' },
    { id: 'statementReference', labelKey: 'statementReference', numeric: true, colWidth: '150px' },
    { id: 'serviceLevel', labelKey: 'serviceLevel', numeric: true, colWidth: '150px' },
    { id: 'AccountDetails', labelKey: 'AccountDetails', numeric: true, colWidth: '150px' }
] as const;


export const CONSOLIDATED_UNPAID_TABLE_COLUMNS = [
    'accountNumber',
    'returnDate',
    'valueDate',
    'currency',
    'amount',
    'standardisedReason',
    'statementReference',
    'transactionReference'
] as const;

export const CONSOLIDATED_UNPAID_TABLE_HEAD_CELLS = [
    { id: 'accountNumber', labelKey: 'accountNumber', numeric: true, colWidth: '150px' },
    { id: 'returnDate', labelKey: 'returnDate', numeric: true, colWidth: '120px' },
    { id: 'valueDate', labelKey: 'valueDate', numeric: true, colWidth: '180px' },
    { id: 'currency', labelKey: 'currency', numeric: false, colWidth: '100px' },
    { id: 'amount', labelKey: 'amount', numeric: true, colWidth: '150px' },
    { id: 'standardisedReason', labelKey: 'standardisedReason', numeric: false, colWidth: '150px' },
    { id: 'statementReference', labelKey: 'statementReference', numeric: false, colWidth: '150px' },
    { id: 'transactionReference', labelKey: 'transactionReference', numeric: false, colWidth: '150px' }
] as const;
