import userAccountDetails from '@store/slices/userAccountDetails';
import { CreateUserAccountDetails, UserAccountDetails } from 'types/userAccountDetails';

export type FieldOption = { label: string; value: string; icon?: React.ReactNode };

export type FieldConfig = {
  name: string;
  label: string;
  value?: any;
  type: 'text' | 'select' | 'multiChip' | 'phone' | 'amount' | 'date' | 'checkbox';
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
};

export function buildManageUserAccountFields(
  t: (key: string) => string,
  userAccountDetails: UserAccountDetails
): FieldConfig[] {
  return [
    {
      name: 'name',
      label: t('userAccountName'),
      value: userAccountDetails.name || '[user account name]',
      type: 'text',
      required: true,
      rightBlank: true,
    },
    {
      name: 'startDate',
      label: t('startDate'),
      value: userAccountDetails.startDate || 'DD/MM/YYYY',
      type: 'date',
      fullWidth: false,
      rightBlank: false,
    },
    {
      name: 'editDate',
      label: t('endDate'),
      value: userAccountDetails.editDate || 'DD/MM/YYYY',
      type: 'date',
      rightBlank: false,
    },
    {
      name: 'authorisationClass',
      label: t('authClass'),
      value: userAccountDetails.authorisationClass || '[Authorization class]',
      type: 'select',
      fullWidth: false,
      rightBlank: false,
      options: [
        { label: '[Authorization class]', value: '' },
        { label: 'Class A', value: 'A' },
        { label: 'Class B', value: 'B' },
        { label: 'Class C', value: 'C' },
      ],
    },
    {
      name: 'language',
      label: t('language'),
      value: userAccountDetails.language || '[Language]',
      type: 'select',
      options: [
        { label: '[Language]', value: '' },
        { label: 'English', value: 'en', icon: '🇬🇧' },
        { label: 'French', value: 'fr', icon: '🇫🇷' },
        { label: 'Spanish', value: 'es', icon: '🇪🇸' },
        { label: 'South Africa', value: 'za', icon: '🇿🇦' },
      ],
      rightBlank: false,
    },
    {
      name: 'email',
      label: t('emailAddress'),
      value: userAccountDetails.email || '[firstname.lastname@domain.co.za]',
      type: 'text',
    },
    {
      name: 'communicationPermissions',
      label: t('communicationPermissions'),
      value: userAccountDetails.communicationPermissions || 'Use for communication. Use for alerts.',
      type: 'text',
    }
  ];
}

export function buildManageUserAccountRoleFields(
  t: (key: string) => string,
  userAccountDetails: UserAccountDetails
): FieldConfig[] {
  return [
    {
      name: 'userId',
      label: t('userId'),
      value: userAccountDetails.userId || '[User ID]',
      type: 'text',
      fullWidth: false,
      rightBlank: false,
    },
    {
      name: 'status',
      label: t('status'),
      value: userAccountDetails.status || 'Active',
      type: 'text',
    },
    {
      name: 'idNumber',
      label: t('idNumber'),
      value: userAccountDetails.idNumber || '[ID number]',
      type: 'text',
      fullWidth: false,
      rightBlank: false,
    },
    {
      name: 'dateOfBirth',
      label: t('dateOfBirth'),
      value: userAccountDetails.dateOfBirth || 'DD/MM/YYYY',
      type: 'date',
    },
    {
      name: 'firstName',
      label: t('firstName'),
      value: userAccountDetails.firstName || '[First name]',
      type: 'text',
      fullWidth: false,
      rightBlank: false,
    },
    {
      name: 'lastName',
      label: t('lastName'),
      value: userAccountDetails.lastName || '[Last name]',
      type: 'text',
    },
    {
      name: 'gender',
      label: t('gender'),
      value: userAccountDetails.gender || '[Gender]',
      type: 'text',
      fullWidth: false,
      rightBlank: false,
    },
    {
      name: 'lastNameDuplicate',
      label: t('lastName'),
      value: userAccountDetails.lastName || '[Last name]',
      type: 'text',
    },
    {
      name: 'email',
      label: t('emailAddress'),
      value: userAccountDetails.email || 'firstname.lastname@domain.co.za',
      type: 'text',
      fullWidth: false,
      rightBlank: false,
    },
    {
      name: 'mobile',
      label: t('mobilePhoneNumber'),
      value: userAccountDetails.mobile || 'XXXXXXXXXX',
      type: 'phone',
    },
    {
      name: 'adminRole',
      label: t('adminRole'),
      value: userAccountDetails.adminRole || '[Admin role]',
      type: 'text',
      fullWidth: false,
      rightBlank: false,
    },
    {
      name: 'roles',
      label: t('assignedUserRoles'),
      value: userAccountDetails.roles?.length > 0 ? userAccountDetails.roles.join(', ') : '[Role 1], [Role 2], [Role 3]',
      type: 'text',
    },
  ]
};

export function buildManageUserAccountAddressFields(
  t: (key: string) => string,
  userAccountDetails: UserAccountDetails
): FieldConfig[] {
  return [
    {
      name: 'addressLine1',
      label: t('addressLine1'),
      value: userAccountDetails.addressLine1 || '[Address line 1]',
      type: 'text',
      fullWidth: false,
      rightBlank: false,
    },
    {
      name: 'addressLine2',
      label: t('addressLine2'),
      value: userAccountDetails.addressLine2 || '[Address line 2]',
      type: 'text',
    },
    {
      name: 'countryRegion',
      label: t('countryRegion'),
      value: userAccountDetails.countryRegion || '[Country / Region]',
      type: 'text',
    },
  ]
};

export function buildManageUserAccountCommunicationFields(
  t: (key: string) => string,
  userAccountDetails: UserAccountDetails
): FieldConfig[] {
  return [
    {
      name: 'phoneNumber',
      label: t('phoneNumber'),
      value: userAccountDetails.phoneNumber || '+27 XXX XXXX',
      type: 'phone',
      fullWidth: false,
      rightBlank: false,
    },
    {
      name: 'communicationPreference1',
      label: t('communicationPreference'),
      value: userAccountDetails.communicationPreference || 'Use for communication',
      type: 'text',
    },
    {
      name: 'emailAddress',
      label: t('emailAddress'),
      value: userAccountDetails.email || '[Email address]',
      type: 'text',
      fullWidth: false,
      rightBlank: false,
    },
    {
      name: 'communicationPreference2',
      label: t('communicationPreference'),
      value: userAccountDetails.communicationPermissions || 'Use for communication, use for alerts.',
      type: 'text',
    },
  ]
};

export function buildCreateUserSearchAccountFields(
  t: (key: string) => string,
  createUserAccountDetails: CreateUserAccountDetails
): FieldConfig[] {
  return [
    {
      name: 'searchUserAccounts',
      label: t('searchUserAccounts'),
      value: createUserAccountDetails.searchUserAccounts,
      type: 'select',
      required: true,
      fullWidth: true,
      helperText: t('pleaseSelectUserAccount'),
      alwaysShowHelperText: true,
      options: [
        { label: 'Select a user account', value: '' },
        { label: 'Account 1', value: 'account1' },
        { label: 'Account 2', value: 'account2' },
        { label: 'Account 3', value: 'account3' },
      ]
    }
  ];
};

export function buildCreateUserAccountFields(
  t: (key: string) => string,
  createUserAccountDetails: CreateUserAccountDetails
): FieldConfig[] {
  return [
    {
      name: 'userAccountName',
      label: t('userAccountName'),
      value: createUserAccountDetails.userAccountName,
      type: 'text',
      rightBlank: true,
      required: true,
      helperText: t('userAccountNameRequired'),
      alwaysShowHelperText: true,
    },
    {
      name: 'startDate',
      label: t('startDate'),
      value: createUserAccountDetails.startDate,
      type: 'date',
    },
     {
      name: 'endDate',
      label: t('endDate'),
      value: createUserAccountDetails.endDate,
      type: 'date',
    },
    
    {
      name: 'authClass',
      label: t('authClass'),
      value: createUserAccountDetails.authClass,
      type: 'select',
      required: true,
      helperText: t('authClassRequired'),
      alwaysShowHelperText: true,
    },
    {
      name: 'language',
      label: t('language'),
      value: createUserAccountDetails.language,
      type: 'select',
      required: true,
      helperText: t('languageRequired'),
      alwaysShowHelperText: true,
    },
    {
      name: 'emailAddress',
      label: t('emailAddress'),
      value: createUserAccountDetails.email,
      type: 'text',
      required: false,
      helperText: t('emailAddressRequired'),
      chip: true,
      chipOptions: [{ label: t('useForCommunication'), value: 'useForCommunication' }, { label: t('allowMobileAccess'), value: 'allowMobileAccess' }],
      chipSelectedValues: [],
      chipTargetFieldName: 'phoneUsage',
      rightBlank:false
    }
    
  ]
};

export function buildCreateUserAccountAddressFields(
  t: (key: string) => string,
  createUserAccountDetails: CreateUserAccountDetails
): FieldConfig[] {
  return [
    {
      name: 'addressLine1',
      label: t('addressLine1'),
      value: createUserAccountDetails.addressLine1,
      type: 'text'
    },
    {
      name: 'addressLine2',
      label: t('addressLine2'),
      value: createUserAccountDetails.addressLine2,
      type: 'text',
    },
    {
      name: 'countryRegion',
      label: t('countryRegion'),
      value: createUserAccountDetails.countryRegion,
      type: 'text',
    }
  ]
};

export function buildCreateUserAccountCommunicationFields(
  t: (key: string) => string,
  createUserAccountDetails: CreateUserAccountDetails
): FieldConfig[] {
  return [
    {
      name: 'phoneNumber',
      label: t('phoneNumber'),
      value: createUserAccountDetails.phoneNumber,
      type: 'text',
      rightBlank: true,
    },
    {
      name: 'emailAddress',
      label: t('emailAddress'),
      value: createUserAccountDetails.emailAddress,
      type: 'text',
    }
  ]
};

export function buildCreateUserAccountRolesFields(
  t: (key: string) => string,
  createUserAccountDetails: CreateUserAccountDetails
): FieldConfig[] {
  return [
    {
      name: 'roles',
      label: t('rolesAssigned'),
      value: createUserAccountDetails.roles,
      type: 'multiChip',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
        { label: 'Label 1', value: 'label1' },
        { label: 'Label 2', value: 'label2' },
      ],
      multiSelectedValues: ['admin', 'user', 'label1', 'label2'],
      multiTargetFieldName: 'roles',
      multiJoin: ', ',
    }
  ]
};