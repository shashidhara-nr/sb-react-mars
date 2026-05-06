// Company utilities: build field configurations for CreateJournyForm

export type FieldOption = { label: string; value: string };

export type FieldConfig = {
	name: string;
	label: string;
	value?: any;
	type: 'text' | 'select' | 'multiChip' | 'phone' | 'amount';
	required?: boolean;
	fullWidth?: boolean;
	rightBlank?: boolean;
	lookupBtn?: boolean;
	options?: FieldOption[];
	chip?: boolean;
	chipOptions?: FieldOption[];
	chipSelectedValues?: string[];
	chipTargetFieldName?: string;
	amountCurrency?: string;
	amountCurrencyOptions?: FieldOption[];
	multiSelectedValues?: string[];
	multiTargetFieldName?: string;
	multiJoin?: string;
	helperText?: string;
	alwaysShowHelperText?: boolean;
};

export function buildPaymentFields(
  t: any,
  transaction: any
): FieldConfig[] {
  return [
    {
      name: 'paymentType',
      label: t('paymentBatchPaymentType'),
      value: transaction?.paymentType || `[${t('paymentType')}]`,
      type: 'text',
    },
    {
      name: 'batchId',
      label: t('paymentBatchBatchId'),
      value: transaction?.batchId || `[${t('batchId')}]`,
      type: 'text',
    },
    {
      name: 'amount',
      label: t('paymentBatchAmount'),
      value: transaction?.amount || `[${t('amount')}]`,
      type: 'text',
    },
    {
      name: 'currency',
      label: t('paymentBatchCurrency'),
      value: transaction?.currency || `[${t('currency')}]`,
      type: 'text',
    },
    {
      name: 'dateCreated',
      label: t('paymentBatchDateCreated'),
      value: transaction?.dateCreated || `[${t('dateCreated')}]`,
      type: 'text',
    },
    {
      name: 'customerBatchReference',
      label: t('customerBatchReference'),
      value: transaction?.customerBatchReference || `[${t('customerBatchReference')}]`,
      type: 'text',
    },
    {
      name: 'status',
      label: t('paymentBatchStatus'),
      value: transaction?.status || `[${t('status')}]`,
      type: 'text',
    },
    {
      name: 'submissionMechanism',
      label: t('submissionMechanism'),
      value: transaction?.submissionMechanism || `[${t('submissionMechanism')}]`,
      type: 'text',
    },
  ];
};

export function buildTransferFields(
  t: any,
  transaction: any
): FieldConfig[] {
  return [
    {
      name: 'ownTransferType',
      label: t('ownTransferType'),
      value: transaction?.ownTransferType || `[${t('ownTransferType')}]`,
      type: 'text',
    },
    {
      name: 'batchId',
      label: t('paymentBatchBatchId'),
      value: transaction?.batchId || `[${t('batchId')}]`,
      type: 'text',
    },
    {
      name: 'amount',
      label: t('paymentBatchAmount'),
      value: transaction?.amount || `[${t('amount')}]`,
      type: 'text',
    },
    {
      name: 'currency',
      label: t('paymentBatchCurrency'),
      value: transaction?.currency || `[${t('currency')}]`,
      type: 'text',
    },
    {
      name: 'dateCreated',
      label: t('paymentBatchDateCreated'),
      value: transaction?.dateCreated || `[${t('dateCreated')}]`,
      type: 'text',
    },
    {
      name: 'customerBatchReference',
      label: t('customerBatchReference'),
      value: transaction?.customerBatchReference || `[${t('customerBatchReference')}]`,
      type: 'text',
    },
    {
      name: 'status',
      label: t('paymentBatchStatus'),
      value: transaction?.status || `[${t('status')}]`,
      type: 'text',
    },
    {
      name: 'submissionMechanism',
      label: t('submissionMechanism'),
      value: transaction?.submissionMechanism || `[${t('submissionMechanism')}]`,
      type: 'text',
    },
  ];
};

export function buildCollectionFields(
  t: any,
  transaction: any
): FieldConfig[] {
  return [
    {
      name: 'collectionType',
      label: t('collectionType'),
      value: transaction?.collectionType || `[${t('collectionType')}]`,
      type: 'text',
    },
    {
      name: 'batchId',
      label: t('paymentBatchBatchId'),
      value: transaction?.batchId || `[${t('batchId')}]`,
      type: 'text',
    },
    {
      name: 'amount',
      label: t('paymentBatchAmount'),
      value: transaction?.amount || `[${t('amount')}]`,
      type: 'text',
    },
    {
      name: 'currency',
      label: t('paymentBatchCurrency'),
      value: transaction?.currency || `[${t('currency')}]`,
      type: 'text',
    },
    {
      name: 'dateCreated',
      label: t('paymentBatchDateCreated'),
      value: transaction?.dateCreated || `[${t('dateCreated')}]`,
      type: 'text',
    },
    {
      name: 'customerBatchReference',
      label: t('customerBatchReference'),
      value: transaction?.customerBatchReference || `[${t('customerBatchReference')}]`,
      type: 'text',
    },
    {
      name: 'status',
      label: t('paymentBatchStatus'),
      value: transaction?.status || `[${t('status')}]`,
      type: 'text',
    },
    {
      name: 'submissionMechanism',
      label: t('submissionMechanism'),
      value: transaction?.submissionMechanism || `[${t('submissionMechanism')}]`,
      type: 'text',
    },
  ];
};

export function buildInstructionDetailsFields(
  t: any,
  instruction: any
): FieldConfig[] {
  return [
    {
      name: 'instructionId',
      label: t('instructionId'),
      value: instruction?.instructionId || `[${t('instructionId')}]`,
      type: 'text',
    },
    {
      name: 'valueDateCreated',
      label: t('valueDateCreated'),
      value: instruction?.valueDateCreated || `[${t('valueDateCreated')}]`,
      type: 'text',
    },
    {
      name: 'numberOfInstructions',
      label: t('numberOfInstructions'),
      value: instruction?.numberOfInstructions || `[${t('numberOfInstructions')}]`,
      type: 'text',
    },
    {
      name: 'status',
      label: t('status'),
      value: instruction?.status || `[${t('status')}]`,
      type: 'text',
    },
    {
      name: 'chargesPaidBy',
      label: t('chargesPaidBy'),
      value: instruction?.chargesPaidBy || `[${t('chargesPaidBy')}]`,
      type: 'text',
    },
    {
      name: 'serviceLevel',
      label: t('serviceLevel'),
      value: instruction?.serviceLevel || `[${t('serviceLevel')}]`,
      type: 'text',
    },
    {
      name: 'submissionMechanism',
      label: t('submissionMechanism'),
      value: instruction?.submissionMechanism || `[${t('submissionMechanism')}]`,
      type: 'text',
    },
    {
      name: 'fundingOptions',
      label: t('fundingOptions'),
      value: instruction?.fundingOptions || `[${t('fundingOptions')}]`,
      type: 'text',
    },
  ];
};

export function buildPayFromFields(
  t: any,
  payFrom: any
): FieldConfig[] {
  return [
    {
      name: 'accountNumber',
      label: t('accountNumber'),
      value: payFrom?.accountNumber || `[${t('accountNumber')}]`,
      type: 'text',
    },
    {
      name: 'debitAmount',
      label: t('debitAmount'),
      value: payFrom?.debitAmount || `[${t('debitAmount')}]`,
      type: 'text',
    },
    {
      name: 'transferCurrency',
      label: t('transferCurrency'),
      value: payFrom?.transferCurrency || `[${t('transferCurrency')}]`,
      type: 'text',
    },
    {
      name: 'iban',
      label: t('iban'),
      value: payFrom?.iban || `[${t('iban')}]`,
      type: 'text',
    },
    {
      name: 'debitReference',
      label: t('debitReference'),
      value: payFrom?.debitReference || `[${t('debitReference')}]`,
      type: 'text',
    },
  ];
};

export function buildPaymentScheduleFields(
  t: any,
  schedule: any
): FieldConfig[] {
  return [
    {
      name: 'singleFirstPaymentDate',
      label: t('singleFirstPaymentDate'),
      value: schedule?.singleFirstPaymentDate || t('singleFirstPaymentDate'),
      type: 'text',
      fullWidth: true,
    },
    {
      name: 'repeatPatternOptional',
      label: t('repeatPatternOptional'),
      value: schedule?.repeatPatternOptional || t('repeatPatternOptional'),
      type: 'text',
      fullWidth: true,
    },
  ];
};

export function buildAuditTrailFields(
  t: any,
  audit: any
): FieldConfig[] {
  return [
    {
      name: 'username',
      label: t('auditUsername'),
      value: audit?.username || 'jsmith',
      type: 'text'
    },
    {
      name: 'eventType',
      label: t('auditEventType'),
      value: audit?.eventType || 'Batch submitted',
      type: 'text'
    },
    {
      name: 'description',
      label: t('auditDescription'),
      value:
        audit?.description ||
        'Batch submitted for approval after validation.',
      type: 'text'
    },
    {
      name: 'dateTime',
      label: t('auditDateTime'),
      value: audit?.dateTime || '14 November 2025 12:07:13',
      type: 'text'
    }
  ];
};



export const company = {
	buildPaymentFields,
  buildTransferFields,
  buildCollectionFields,
	buildInstructionDetailsFields,
	buildPayFromFields,
	buildPaymentScheduleFields
};
