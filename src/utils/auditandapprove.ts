import {AuthorisationItem} from '../../lib/api/nonTransactionalApi';
export type AuditApproveMode = 'audit' | 'approve';
export const API_ENTITY_TYPES = {
  MyBills: 'bill',
  Debtor: 'debtor',
  BOPThirdParty: 'third parties',
  TransferType: 'transfer type',
  AuthorisationProfile: 'authorisation profile',
  Agreement: 'agreement',
  Beneficiary: 'beneficiary',
  PaymentType: 'payment type',
  UnpaidOption: 'unpaid option',
  CollectionType: 'collection type',
} as const;

export interface AuditApproveEventRow {
	id: string;
	mode: AuditApproveMode;
	userAccountName: string;
	eventType: string;
	eventFunction: string;
	entityName: string;
	initiatorUserId: string;
	valueDate: string;
	list?: any[];
	// Optional structured details used by the non-transactional detail panel.
	details?: any;
	status: {
		value: string;
		color: string;
	};
	links: {
		href: string;
		text: string;
	};
}

export interface AuditApproveRawEventRow {
	id: string;
	mode: AuditApproveMode;
	userAccountName: string;
	eventType: string;
	eventFunction: string;
	entityName: string;
	initiatorUserId: string;
	valueDate: string;
	// Optional structured details used by the non-transactional detail panel.
	details?: any;
	statusValue: string;
	statusColor: string;
	linkHref: string;
	linkText: string;
}

export const NON_TRANSACTIONAL_TABLE_COLUMNS = [
	'userAccountName',
	'eventType',
	'eventFunction',
	'entityName',
	'initiatorUserId',
	'valueDate',
	{ key: 'status', type: 'chip' },
	{ key: 'links', type: 'link' },
] as const;

export const NON_TRANSACTIONAL_TABLE_HEAD_CELLS = [
	{ id: 'userAccountName', label: 'User account name', numeric: false },
	{ id: 'eventType', label: 'Event type', numeric: false },
	{ id: 'eventFunction', label: 'Event function', numeric: false },
	{ id: 'entityName', label: 'Entity name', numeric: false },
	{ id: 'initiatorUserId', label: 'Initiator user ID', numeric: false },
	{ id: 'valueDate', label: 'Value date', numeric: false },
	{ id: 'status', label: 'Status', numeric: false },
	{ id: 'links', label: 'Quick links', numeric: false },
];

export const mapRawAuditApproveEvent = (raw: AuditApproveRawEventRow): AuditApproveEventRow => ({
	id: raw.id,
	mode: raw.mode,
	userAccountName: raw.userAccountName,
	eventType: raw.eventType,
	eventFunction: raw.eventFunction,
	entityName: raw.entityName,
	initiatorUserId: raw.initiatorUserId,
	valueDate: raw.valueDate,
	details: raw.details,
	status: {
		value: raw.statusValue,
		color: raw.statusColor,
	},
	links: {
		href: raw.linkHref,
		text: raw.linkText,
	},
});

// Raw API response interfaces for beneficiary audit events
export interface RawAuditRecord {
	auditEventID: string;
	userName: string;
	userId: string;
	userRole: string;
	customerName: string;
	entityType: string;
	entityName: string;
	function: string;
	date: number;
	text: string;
	tokens: (string | null)[];
	messageCategory: string;
	messageDomain: string;
	messageSubCategory: string | null;
}

export interface RawAuditRecordListTO {
	lastPage: boolean;
	pageCount: number;
	postition: number;
	pageSize: number;
	rowCount: number;
	auditRecordList: RawAuditRecord[];
}

export interface RawBeneficiaryAuditEvent extends AuthorisationItem {
	auditRecordListTO: RawAuditRecordListTO;
}

const SUBCATEGORY_FIELD_MAPPING: Record<string, (details: any, value: string) => void> = {
	'addressLine1': (details, value) => details.counterPartyAddress.addressLine1 = value,
	'addressLine2': (details, value) => details.counterPartyAddress.addressLine2 = value,
	'countryCode': (details, value) => details.counterPartyAddress.countryCode = value,
	'counterPartyName': (details, value) => details.counterPartyName = value,
	'Reference.set': (details, value) => details.counterPartyReference = value,
	'AcctId.Id.set': (details, value) => details.accountNumber = value,
	'AcctId.Lmt.set': (details, value) => details.transactionLimit = value,
	'AcctId.LmtCcy.set': (details, value) => {
		details.transactionLimitCurrency = value;
		details.currency = value;
	},
	'FinInstnId.BIC.set': (details, value) => details.bic = value,
	'FinInstnId.Nm.set': (details, value) => details.financialInstitutionName = value,
	'BranchName.set': (details, value) => details.branchName = value,
	'PrtryId.Id.set': (details, value) => details.branchSortCode = value,
	'PstlAdr.Ctry.set': (details, value) => details.bankCountryCode = value,
	'instrumentClassification.set': (details, value) => details.classification = value,
};

const ACTION_TO_EVENT_FUNCTION: Record<string, string> = {
	'C': 'Create',
	'U': 'Update',
	'D': 'Delete',
	'R': 'Repair',
};

const AUTHORISE_STATUS_MAPPING: Record<string, { value: string; color: string }> = {
	'ACA': { value: 'Awaiting Authorization', color: 'warning' },
	'Approved': { value: 'Approved', color: 'success' },
	'Declined': { value: 'Declined', color: 'error' },
};
const getLastSegment = (value: string) =>
  value.substring(value.lastIndexOf('.') + 1);

export const transformRawBeneficiaryAuditEvent = (
	raw: RawBeneficiaryAuditEvent,
	mode: AuditApproveMode = 'audit'
): AuditApproveEventRow => {
	const apiEntityType = getLastSegment(raw.entityType);
	const entityType = API_ENTITY_TYPES[apiEntityType as keyof typeof API_ENTITY_TYPES] || apiEntityType || 'Unknown';
	const auditRecords = raw.auditRecordListTO?.auditRecordList || [];
	const beneficiaryDetails: any = {
		counterPartyName: raw.entityName,
		counterPartyAddress: {},
	};
	auditRecords.forEach((record) => {
		const subCategory = record.messageSubCategory || '';
		const value = record.tokens?.[0] || '';
		const mappingKey = Object.keys(SUBCATEGORY_FIELD_MAPPING).find(key => 
			subCategory.includes(key)
		);
		
		if (mappingKey) {
			SUBCATEGORY_FIELD_MAPPING[mappingKey](beneficiaryDetails, value);
		}
	});
	const eventFunction = ACTION_TO_EVENT_FUNCTION[raw.action] || 'Create';

	const dateObj = new Date(raw.date);
	const valueDate = dateObj.toISOString().split('T')[0]; // Format as YYYY-MM-DD

	const { value: statusValue, color: statusColor } = AUTHORISE_STATUS_MAPPING[raw.authoriseStatus] || 
		{ value: 'Pending', color: 'warning' };

	const beneficiaryTypeFields = [
		{
			name: 'residentialStatus',
			label: 'Residential status',
			value: beneficiaryDetails.classification === 'domestic' ? 'Resident' : 'Non-resident',
			type: 'text',
			disabled: true,
		},
		{
			name: 'beneficiaryType',
			label: 'Beneficiary type',
			value: 'Individual', // Default, can be extracted if available
			type: 'text',
			disabled: true,
		},
	];
	const personalDetailsFields = [
		{
			name: 'beneficiaryName',
			label: 'Beneficiary name',
			value: beneficiaryDetails.counterPartyName,
			type: 'text',
			disabled: true,
		},
		{
			name: 'beneficiaryRef',
			label: 'Beneficiary ref',
			value: beneficiaryDetails.counterPartyReference || '',
			type: 'text',
			disabled: true,
		},
	];
	const addressDetailsFields = [
		{
			name: 'address',
			label: 'Address',
			value: beneficiaryDetails.counterPartyAddress?.addressLine1 || '',
			type: 'text',
			disabled: true,
		},
		{
			name: 'addressLine2',
			label: 'Address line 2',
			value: beneficiaryDetails.counterPartyAddress?.addressLine2 || '',
			type: 'text',
			disabled: true,
		},
		{
			name: 'country',
			label: 'Country',
			value: beneficiaryDetails.counterPartyAddress?.countryCode || '',
			type: 'text',
			disabled: true,
		},
	];
	const bankDetailsFields = [
		{
			name: 'bankName',
			label: 'Bank name',
			value: beneficiaryDetails.financialInstitutionName || '',
			type: 'text',
			disabled: true,
		},
		{
			name: 'branchName',
			label: 'Branch name',
			value: beneficiaryDetails.branchName || '',
			type: 'text',
			disabled: true,
		},
		{
			name: 'bic',
			label: 'BIC (SWIFT)',
			value: beneficiaryDetails.bic || '',
			type: 'text',
			disabled: true,
		},
		{
			name: 'accountNumber',
			label: 'Account number',
			value: beneficiaryDetails.accountNumber || '',
			type: 'text',
			disabled: true,
		},
		{
			name: 'sortCode',
			label: 'Branch sort code',
			value: beneficiaryDetails.branchSortCode || '',
			type: 'text',
			disabled: true,
		},
	];

	const paymentTypeFields = [
		{
			name: 'paymentType',
			label: 'Payment type',
			value: 'Standard Payment', 
			type: 'text',
			disabled: true,
			fullWidth: true,
		},
	];
	const auditAuthoriseList=raw.auditRecordListTO?.auditRecordList || [];

	return {
		id: String(raw.auditEventId),
		mode,
		userAccountName: raw.userUnitName,
		eventType: entityType,
		eventFunction,
		entityName: raw.entityName,
		initiatorUserId: raw.personId,
		valueDate,
		list:auditAuthoriseList,
		details: {
			beneficiary: {
				beneficiaryTypeFields,
				personalDetailsFields,
				addressDetailsFields,
				bankDetailsFields,
				paymentTypeFields,
				...beneficiaryDetails,
			},
		},
		status: {
			value: statusValue,
			color: statusColor,
		},
		links: {
			href: `#`,
			text: 'View Details',
		},
	};
};

