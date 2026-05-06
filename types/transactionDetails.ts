export interface transactionDetailsPayload {
  transaction: {
    paymentType: string;
    batchID?: string;
    amount: string;
    currency?: string;
    dateCreated: string;
    customerBatchReference?: string;
    status: string;
    submissionMechanism?: string;
  };

  instructionDetails: {
    instructionId: string;
    valueDateCreated: string;
    numberOfInstructions: string;
    status: string;
    serviceLevel: string;
    chargesPaidBy: string;
    submissionMechanism: string;
    fundingOptions: string;
  };

  payFrom: {
    accountNumber: string;
    debitAmount: string;
    transferCurrency: string;
    iban: string;
    debitReference: string;
  };

  paymentSchedule: {
    singleFirstPaymentDate: string;
    repeatPatternOptional: string;
  };

  passwordRenewalSchedule: {
    passwordRenewalRequired?: boolean;
    passwordExpiryDate?: string;
  };
}