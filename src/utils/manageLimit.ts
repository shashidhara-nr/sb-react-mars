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
	multiSelectedValues?: string[];
	multiTargetFieldName?: string;
	multiJoin?: string;
	helperText?: string;
	alwaysShowHelperText?: boolean;
  hiddenEdit?: boolean;
	disabled?: boolean;
};

export function buildManageLimitFields(t: (key: string) => string, limitDetails: any): FieldConfig[] {
  return [
    {
      name: 'type',
      label: t('limitType'),
      value: limitDetails?.type || '',
      type: 'select',
      required: true,
      options: [
        { label: t('selectLimit'), value: '' },
        { label: t('accountLimit'), value: 'accountLimit' },
        { label: t('instructionTypeLimit'), value: 'instructionTypeLimit' },
        { label: t('overallLimit'), value: 'overallLimit' },
        { label: t('userLimit'), value: 'userLimit' },
      ],
      rightBlank: false,
    },
    {
      name: 'typeName',
      label: t('limitTypeName'),
      value: limitDetails?.typeName || '',
      type: 'select',
      required: true,
      fullWidth: false,
      rightBlank: false,
      options: [
        { label: t('selectTypeName'), value: '' },
        { label: "SBZAZAJJ- 000394122-ZAR", value: 'SBZAZAJJ- 000394122-ZAR' },
        { label: "SBZAZAJJ- 000394123-ZAR", value: 'SBZAZAJJ- 000394123-ZAR' },
        { label: "SBZAZAJJ- 000394124-ZAR", value: 'SBZAZAJJ- 000394124-ZAR' },
        { label: "SBZAZAJJ- 000394125-ZAR", value: 'SBZAZAJJ- 000394125-ZAR' },
        { label: "SBZAZAJJ- 000394126-ZAR", value: 'SBZAZAJJ- 000394126-ZAR' },
      ]
    },
    {
      name: 'periodDays',
      label: t('limitPeriodDays'),
      value: limitDetails?.periodDays || '',
      type: 'select',
      required: true,
      options: [
        { label: t('selectPeriod'), value: '' },
        ...Array.from({ length: 31 }, (_, i) => ({
          label: `${i + 1} day${i === 0 ? '' : 's'}`,
          value: `${i + 1}`,
        })),
      ],
    },
    {
      name: 'productType',
      label: t('productType'),
      value: limitDetails?.productType || '',
      type: 'select',
      required: true,
      options: [
        { label: t('selectProductType'), value: '' },
        { label: 'Product type 1', value: 'productType1' },
        { label: 'Product type 2', value: 'productType2' },
        { label: 'Product type 3', value: 'productType3' },
      ],
    },
    {
      name: 'currencyUpperLimit',
      label: t('currencyUpperLimit'),
      value: limitDetails?.currencyUpperLimit || '',
      type: 'amount',
      required: true,
      rightBlank: true
    },
    {
      name: 'status',
      label: t('status'),
      value: limitDetails?.status || '',
      type: 'text',
      required: false,
      fullWidth: true,
      rightBlank: false,
      hiddenEdit: true
    }
  ];
};

export const manageLimit = {
	buildManageLimitFields
};
