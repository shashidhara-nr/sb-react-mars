// transferTypeLogic.ts
// Logic and validation schema for Transfer Type forms

import { z } from 'zod';

// Define the Zod schema for TransferTypeFormState
export const transferTypeZodSchema = z.object({
  transferTypeName: z.string().min(1, 'Transfer type name is required'),
  authorisationProfile: z.string().min(1, 'Authorisation profile is required'),
  enforceAuditing: z.boolean().optional(),
  payerCustomerAgreement: z.string().min(1, 'Customer agreement is required'),
  payerAccount: z.string().min(1, 'Please select customer agreement first before select account.'),
  paymentCustomerAgreement: z.string().min(1, 'Customer agreement is required'),
  paymentAccount: z.string().min(1, 'Please select customer agreement first before select account.'),
});

const TransferTypeLogic = {
  transferTypeZodSchema,
};

export default TransferTypeLogic;
