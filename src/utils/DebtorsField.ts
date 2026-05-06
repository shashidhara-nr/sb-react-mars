// Debtors field utilities: constants and field builders for CreateJournyForm
import { IcnLocationOutline,BankDetails } from '@lib/icons';
import { FieldConfig, FieldOption } from './domesticBase';

// Note: All dropdown options (COUNTRIES, CURRENCIES, ACCOUNT_TYPES) now come from API calls
// No longer hardcoded - options passed dynamically from parent component

export function buildPersonalFieldsDebtor(debtor: any, t: (key: string) => string): FieldConfig[] {
 
  // Disable debtor code field when editing existing debtor (has entityKey)
  const isEditingExistingDebtor = debtor && debtor.entityKey;

  return [
    {
      name: 'counterPartyName',
      label: t('debtorName'),
      value: debtor?.counterPartyName || '',
      type: 'text',
      required: true,
      fullWidth: false,
      rightBlank: true,
    },
    {
      name: 'referenceIDX',
      label: t('debtorCode'),
      value: debtor?.referenceIDX || '',
      type: 'text',
      required: true,
      disabled: isEditingExistingDebtor, // Disable when editing existing debtor
      rightBlank: false,
    },
    {
      name: 'counterPartyReference',
      label: t('debtorReference'),
      value: debtor?.counterPartyReference || '',
      type: 'text',
      required: false,
    },
  ];
}
export function buildPersonalFieldsDebtorExtended(debtor: any, t: (key: string) => string): FieldConfig[] {
  const baseFields = buildPersonalFieldsDebtor(debtor, t);
  const additionalFields: FieldConfig[] = [
     {
      name: 'Address detailsgggg',
      label: 'Address detailsgggg',
      value:'',
      type: 'headerLabel',
      headerIcon: IcnLocationOutline as any,
    },
    {
      name: 'addressLine1',
      label: t('addressLine1'),
      value: debtor?.counterPartyAddress?.addressLine1 || '',
      type: 'text',
      required: true,
    },
    {
      name: 'countryCode',
      label: t('countryRegion'),
      value: debtor?.counterPartyAddress?.countryCode || '',
      type: 'select',
      required: true,
    },
  ];
  return [...baseFields, ...additionalFields];
}
export function buildAddressFieldsDebtor(
  debtor: any,
  t: (key: string) => string,
  countryOptions: FieldOption[] = []
): FieldConfig[] {
  return [
    {
      name: 'addressLine1',
      label: t('addressLine1'),
      value: debtor?.counterPartyAddress?.addressLine1 || '',
      type: 'text',
      required: true,
    },
    /*BARR-1159{
      name: 'addressLine2',
      label: 'Address line 2',
      value: debtor?.counterPartyAddress?.addressLine2 || '',
      type: 'text',
    },*/
    {
      name: 'countryCode',
      label: t('countryRegion'),
      value: debtor?.counterPartyAddress?.countryCode || '',
      type: 'select',
      required: true,
      lookupBtn: false,
      options: countryOptions,
    },
  ];
}

export function buildPhoneEmailFieldsDebtor(debtor: any, t: (key: string) => string): FieldConfig[] {
  return [
    {
      name: 'phoneNumber',
      label: t('phoneNumber'),
      value: debtor?.phoneNumber || '',
      type: 'phone',
      chip: true,
      chipOptions: [{ label: t('useCommunication'), value: 'communication' }],
      chipSelectedValues: debtor?.phoneUsage || [],
      chipTargetFieldName: 'phoneUsage',
    },
    {
      name: 'email',
      label: t('emailAddress'),
      value: debtor?.email || '',
      type: 'text',
      chip: true,
      chipOptions: [
        { label: t('useCommunication'), value: 'communication' },
        { label: t('useAlerts'), value: 'alerts' },
      ],
      chipSelectedValues: debtor?.emailUsage || [],
      chipTargetFieldName: 'emailUsage',
    },
  ];
}

export function buildBankFieldsDebtor(
  debtor: any,
  t: (key: string) => string,
  bankSelectOptions?: FieldOption[],
  includeSelectedBank: boolean = true,
  countryOptions: FieldOption[] = [],
): FieldConfig[] {
  const fields: FieldConfig[] = [
    {
      name: 'financialInstitutionName',
      label: t('bankName'),
      placeholder: t('bankName'),
      value: debtor?.financialInstitutionName || '',
      type: 'text',
      required: true,
    },
    {
      name: 'branchName',
      label: t('branchName'),
      value: (debtor as any)?.bankBranchName || (debtor as any)?.branchName || '',
      type: 'text',
    },
    { name: 'bic', label: t('bicSwift'), value: debtor?.internationalBankBicCode || debtor?.bic || '', type: 'text' },
    {
      name: 'branchSortCode',
      label: t('branchSortCode'),
      value: debtor?.branchSortCode || '',
      type: 'text',
      required: true,
    },
    {
      name: 'town',
      label: t('townCity'),
      value: (debtor as any)?.bankBranchAddress?.townName || (debtor as any)?.town || '',
      type: 'text',
    },
    {
      name: 'bankCountryCode',
      label: t('countryRegion'),
      placeholder: t('countryRegion'),
      value: (debtor as any)?.bankBranchAddress?.countryCode || (debtor as any)?.bankCountryCode || '',
      type: 'select',
      required: true,
      options: countryOptions,
    },
  ];

  if (includeSelectedBank) {
    fields.push({
      name: 'selectedBank',
      label: t('selectBank'),
      value: (debtor as any)?.selectedBank || '',
      type: 'select',
      lookupBtn: true,
      fullWidth: true,
      options:
        bankSelectOptions && bankSelectOptions.length > 0
          ? bankSelectOptions
          : [{ label: t('selectBankBranch'), value: '' }],
    });
  }

  return fields;
}

export function buildBankFieldsDebtorExtended(
  debtor: any,
  t: (key: string) => string,
  bankSelectOptions?: FieldOption[],
  includeSelectedBank: boolean = true,
  countryOptions: FieldOption[] = [],
): FieldConfig[] {
  const baseFields = buildBankFieldsDebtor(debtor, t, bankSelectOptions, includeSelectedBank, countryOptions);
  const additionalFields: FieldConfig[] = [
    {
      name: 'Bank account details',
      label: 'Bank account details',
      value: '',
      type: 'headerLabel',
      headerIcon: BankDetails as any,
    },
    {
      name: 'accountNumber',
      label: t('accountNumber'),
      value: debtor?.accountNumber || '',
      type: 'text',
    },
    {
      name: 'iban',
      label: t('iban'),
      value: debtor?.iban || '',
      type: 'text',
    },
    {
      name: 'currency',
      label: t('currency'),
      value: (debtor as any)?.accountCurrency || (debtor as any)?.currency || '',
      type: 'text',
    },
    {
      name: 'transactionLimit',
      label: t('currencyTransactionLimit'),
      value: String((debtor as any)?.transactionLimit ?? ''),
      type: 'text',
      amountCurrency: (debtor as any)?.transactionLimitCurrency || (debtor as any)?.accountCurrency || 'ZAR',
      amountCurrencyTargetName: 'transactionLimitCurrency',
    },
    {
      name: 'accountType',
      label: t('accountType'),
      value: debtor?.accountType || '',
      type: 'text',  
    },
  ];
  return [...baseFields, ...additionalFields];
}

export function buildAccountFieldsDebtor(
  debtor: any,
  t: (key: string) => string,
  currencyOptions: FieldOption[] = [],
  accountTypeOptions: FieldOption[] = []
): FieldConfig[] {
  // Only use account types from API - no hardcoded fallback
  const accountTypeOpts = accountTypeOptions || [];
  // Make account type required only if:
  // 1. Account type options are available from API
  // 2. OR debtor.accountType already has a value (from verified account)
  const isAccountTypeRequired = accountTypeOpts.length > 0 || Boolean(debtor?.accountType);

  return [
    {
      name: 'accountNumber',
      label: t('accountNumber'),
      value: debtor?.accountNumber || '',
      type: 'text',
      required: true,
      helperText: t('accountIbanRequired'),
      alwaysShowHelperText: true,
    },
    {
      name: 'iban',
      label: t('iban'),
      value: debtor?.iban || '',
      type: 'text',
      required: true,
      helperText: t('accountIbanRequired'),
      alwaysShowHelperText: true,
    },
    {
      name: 'currency',
      label: t('currency'),
      value: (debtor as any)?.accountCurrency || (debtor as any)?.currency || '',
      type: 'select',
      required: true,
      options: currencyOptions,
    },
    {
      name: 'transactionLimit',
      label: t('currencyTransactionLimit'),
      value: String((debtor as any)?.transactionLimit ?? ''),
      type: 'amount',
      amountCurrency: (debtor as any)?.transactionLimitCurrency || (debtor as any)?.accountCurrency || 'ZAR',
      amountCurrencyOptions: currencyOptions,
      amountCurrencyTargetName: 'transactionLimitCurrency',
      required: true,
    },
    {
      name: 'accountType',
      label: t('accountType'),
      value: debtor?.accountType || '',
      type: 'select',
      required: isAccountTypeRequired,
      options: accountTypeOpts,
      // If we have a value but no options, make it a text field instead
      ...(debtor?.accountType && accountTypeOpts.length === 0 ? { type: 'text', disabled: true } : {}),
    },
  ];
}

export function buildCollectionFieldsDebtor(
  debtor: any,
  t: (key: string) => string,
  collectionTypeOptions: FieldOption[] = []
): FieldConfig[] {
  // Prefer collections field if it exists (user has edited it), otherwise use collectionProfiles
  let selected: string[] = [];
  
  const collectionsField = (debtor as any)?.collections;
  if (Array.isArray(collectionsField) && collectionsField.length > 0) {
    selected = collectionsField;
  } else {
    // Try to get collection profiles from collectionProfiles or linkedCollectionProfiles
    let raw = (debtor as any)?.collectionProfiles;
    
    // If collectionProfiles is not available, extract from linkedCollectionProfiles
    if (!raw && (debtor as any)?.linkedCollectionProfiles && Array.isArray((debtor as any).linkedCollectionProfiles)) {
      raw = (debtor as any).linkedCollectionProfiles
        .map((profile: any) => profile.customerPaymentProfileName || profile.customerCollectionProfileName)
        .filter(Boolean)
        .join(', ');
    }
    
    selected = Array.isArray(raw)
      ? raw
      : typeof raw === 'string'
        ? String(raw)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [];
  }

  return [
    {
      name: 'collectionType',
      label: t('collectionTypeLabel'),
      type: 'multiChip',
      required: true,
      options: collectionTypeOptions,
      multiSelectedValues: selected,
      multiTargetFieldName: 'collections',
      multiJoin: ', ',
    },
  ];
}

// Helper function to format date as YYYY/MM/DD for display
function formatMandateDate(dateValue: any): string {
  if (!dateValue) return '-';
  try {
    const date = new Date(dateValue);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  } catch {
    return '-';
  }
}

// Helper function to format date as YYYY-MM-DD for date input
function formatDateForInput(dateValue: any): string {
  if (!dateValue) return '';
  try {
    const date = new Date(dateValue);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
}

// Helper function to format amount with 2 decimal places
function formatMandateAmount(amount: any): string {
  if (amount === null || amount === undefined || amount === '') return '-';
  const numAmount = typeof amount === 'number' ? amount : parseFloat(amount);
  if (isNaN(numAmount)) return '-';
  return numAmount.toFixed(2);
}

export function buildMandateFieldsDebtor(
  debtor: any,
  t: (key: string) => string
): FieldConfig[] {
  // Get mandates from debtor - check both mandateDetails and mozMandateDetails
  const mandates = debtor?.mandateDetails || [];
  const mozMandates = debtor?.mozMandateDetails || [];
  
  // Combine both types of mandates
  const allMandates = [...mandates, ...mozMandates];
  
  if (allMandates.length === 0) {
    return [];
  }

  const fields: FieldConfig[] = [];

  // For each mandate, create read-only fields
  allMandates.forEach((mandate: any, index: number) => {
    // Check if this is a MOZ mandate (has mandateID instead of mandateId)
    const isMozMandate = 'mandateID' in mandate || 'invoiceBeginDate' in mandate;
    
    if (isMozMandate) {
      // MOZ Mandate structure - EDITABLE
      const mozFields: FieldConfig[] = [
        {
          name: `mandate_${index}_id`,
          label: t('mandateIdLabel'),
          value: mandate.mandateID || '',
          type: 'text',
          fullWidth: false,
        },
        {
          name: `mandate_${index}_invoiceBeginDate`,
          label: t('invoiceBeginDate'),
          value: formatDateForInput(mandate.invoiceBeginDate),
          type: 'date',
          fullWidth: false,
        },
        {
          name: `mandate_${index}_invoiceEndDate`,
          label: t('invoiceEndDate'),
          value: formatDateForInput(mandate.invoiceEndDate),
          type: 'date',
          fullWidth: false,
        },
        {
          name: `mandate_${index}_observation`,
          label: t('observation'),
          value: mandate.observation || '',
          type: 'text',
          fullWidth: false,
        },
      ];
      fields.push(...mozFields);
    } else {
      // Regular Mandate structure
      const mandateFields: FieldConfig[] = [
      {
        name: `mandate_${index}_id`,
        label: t('id'),
        value: mandate.mandateId || '',
        type: 'text',
        fullWidth: false,
      },
      {
        name: `mandate_${index}_type`,
        label: t('mandateType'),
        value: mandate.mandateType || '',
        type: 'text',
        fullWidth: false,
      },
      {
        name: `mandate_${index}_frequency`,
        label: t('collectionFrequency'),
        value: mandate.frequency || '',
        type: 'text',
        fullWidth: false,
      },
      {
        name: `mandate_${index}_beginDate`,
        label: t('periodBeginDate'),
        value: formatDateForInput(mandate.beginDate),
        type: 'date',
        fullWidth: false,
      },
      {
        name: `mandate_${index}_endDate`,
        label: t('periodEndDate'),
        value: formatDateForInput(mandate.endDate),
        type: 'date',
        fullWidth: false,
      },
      {
        name: `mandate_${index}_debitDay`,
        label: t('debitDay'),
        value: mandate.debitDay?.toString() || '',
        type: 'text',
        fullWidth: false,
      },
    ];

    // Always add all amount fields - show values based on mandate type
    // Fixed amount
    mandateFields.push({
      name: `mandate_${index}_fixedAmount`,
      label: t('fixedAmount'),
      value: mandate.mandateType === 'Fixed' ? (mandate.fixedAmount?.toString() || '') : '',
      type: 'text',
      fullWidth: false,
    });

    // Minimum amount
    mandateFields.push({
      name: `mandate_${index}_minAmount`,
      label: t('minimumAmount'),
      value: mandate.mandateType !== 'Fixed' ? (mandate.minAmount?.toString() || '') : '',
      type: 'text',
      fullWidth: false,
    });

    // Maximum amount
    mandateFields.push({
      name: `mandate_${index}_maxAmount`,
      label: t('maximumAmount'),
      value: mandate.mandateType !== 'Fixed' ? (mandate.maxAmount?.toString() || '') : '',
      type: 'text',
      fullWidth: false,
    });

    // Currency
    mandateFields.push({
      name: `mandate_${index}_currency`,
      label: t('currency'),
      value: mandate.currency || '',
      type: 'text',
      fullWidth: false,
    });

    // Status (if available)
    if (mandate.status) {
      mandateFields.push({
        name: `mandate_${index}_status`,
        label: t('status'),
        value: mandate.status,
        type: 'text',
        disabled: true,
        fullWidth: true,
      });
    }

      fields.push(...mandateFields);
    }
  });

  return fields;
}

export const DebtorsField = {
  buildPersonalFieldsDebtor,
  buildPersonalFieldsDebtorExtended,
  buildAddressFieldsDebtor,
  buildBankFieldsDebtor,
  buildBankFieldsDebtorExtended,
  buildAccountFieldsDebtor,
  buildCollectionFieldsDebtor,
  buildMandateFieldsDebtor,
};
