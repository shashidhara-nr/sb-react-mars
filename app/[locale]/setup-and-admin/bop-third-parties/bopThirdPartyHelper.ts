
export { type Section } from "../../../../types/setup-and-admin/bopThirdParty";
import { type FieldPath, type BopThirdPartyT, type BreadcrumbLink } from "../../../../types/setup-and-admin/bopThirdParty";

export const STATUS_TAB_KEYS = [
  'allRecords',
  'needsAction',
  'awaitingApproval',
  'activeTab',
] as const;

export const TAB_STATUS_MAP = [
  undefined,
  'Needs Action',
  'Awaiting Approval',
  'Active',
] as const;

export const TABLE_COLUMNS = [
  'thirdPartyName',
  'bopThirdPartyID',
  'ccn',
  'entityCategory',
  'countryRegion',
  { key: 'status', type: 'chip' },
  { key: 'links', type: 'link' },
] as const;

export const TABLE_HEAD_CELL_KEYS = [
  { id: 'thirdPartyName', labelKey: 'thirdPartyNameHeader', numeric: false },
  { id: 'bopThirdPartyID', labelKey: 'thirdPartyIdHeader', numeric: true },
  { id: 'ccn', labelKey: 'ccnHeader', numeric: false },
  { id: 'entityCategory', labelKey: 'entityCategoryHeader', numeric: false },
  { id: 'countryRegion', labelKey: 'countryRegionHeader', numeric: false },
  { id: 'status', labelKey: 'statusHeader', numeric: false },
  { id: 'links', labelKey: 'quickLinksHeader', numeric: false },
] as const;

export const bopThirdPartiesUrl = {
  dashboard: '/',
  home: '/setup-and-admin/bop-third-parties',
  create: '/setup-and-admin/bop-third-parties/create',
  details: '/setup-and-admin/bop-third-parties/details',
  manage: '/setup-and-admin/bop-third-parties/manage',
} as const;

export const MANAGE_LINKS_KEY='MANAGE BOP THIRD PARTY'

export const BOP_THIRD_PARTY_FIELD_PATH_MAP: Record<string, FieldPath> = {

  addressLine1: ['address', 'addressLine1'],
  addressLine2: ['address', 'addressLine2'],
  postCode: ['address', 'postCode'],
  suburb: ['address', 'suburb'],
  townName: ['address', 'townName'],
  region: ['address', 'region'],
  countryCode: ['address', 'countryCode'],

  postalAddressLine1: ['postalAddress', 'addressLine1'],
  postalAddressLine2: ['postalAddress', 'addressLine2'],
  postalPostCode: ['postalAddress', 'postCode'],
  postalSuburb: ['postalAddress', 'suburb'],
  postalTownName: ['postalAddress', 'townName'],
  postalRegion: ['postalAddress', 'region'],
  postalCountryCode: ['postalAddress', 'countryCode'],

  phoneFirstName: ['phone', 'firstName'],
  phoneLastName: ['phone', 'lastName'],
  mobilePhoneNumber: ['phone', 'mobilePhoneNumber'],
  mobilePhoneUsage: ['phone', 'mobilePhoneUsage'],
  alternatePhoneNumber: ['phone', 'alternatePhoneNumber'],
  alternatePhoneUsage: ['phone', 'alternatePhoneUsage'],

  email: ['contact', 'email'],
  emailUsage: ['contact', 'emailUsage'],
  contactName: ['contact', 'contactName'],
  contactFirstName: ['contact', 'contactFirstName'],
  contactLastName: ['contact', 'contactLastName'],
  telephoneNumber: ['contact', 'telephoneNumber'],
  mobileNumber: ['contact', 'mobileNumber'],
  faxNumber: ['contact', 'faxNumber'],
  jobTitle: ['contact', 'jobTitle'],
  workPhoneNumber: ['contact', 'workPhoneNumber'],
  workPhoneUsage: ['contact', 'workPhoneUsage'],
} as const;


export const getFieldPath = (fieldName: string): FieldPath => {
  return BOP_THIRD_PARTY_FIELD_PATH_MAP[fieldName] || fieldName;
};

export const getBreadcrumbLinks = (
  page: 'home' | 'create' | 'details' | 'manage',
  t: (key: string) => string,
  params?: { id?: string; type?: string; postal?: boolean }
): BreadcrumbLink[] => {
  const baseLinks: BreadcrumbLink[] = [
    { href: bopThirdPartiesUrl.dashboard, label: t('dashboard') },
    { href: bopThirdPartiesUrl.home, label: t('pageTitle') },
  ];

  switch (page) {
    case 'home':
      return baseLinks;

    case 'create':
      return [
        ...baseLinks,
        { href: bopThirdPartiesUrl.create, label: t('createPageTitle') },
      ];

    case 'details':
      return [
        ...baseLinks,
        { href: bopThirdPartiesUrl.details, label: t('createPageTitle') },
      ];

    case 'manage':
      if (params?.id && params?.type !== undefined && params?.postal !== undefined) {
        return [
          ...baseLinks,
          {
            href: `${bopThirdPartiesUrl.manage}?id=${params.id}&type=${params.type}&postal=${params.postal}`,
            label: t('managePageTitle'),
          },
        ];
      }
      return baseLinks;

    default:
      return baseLinks;
  }
};

export const buildDefaultValues = (
  data: BopThirdPartyT | null | undefined,
  isEntity: boolean,
  isCompany: boolean,
  hasPostalAddress: boolean = false
) => {
  return {
    ...(!isEntity && {
      firstName: data?.firstName || '',
      gender: data?.gender || '',
    }),
    ...(isEntity && {
      entityName: data?.entityName || '',
      ...(isCompany && { companyCategory: data?.companyCategory || '' }),
    }),
    lastName: !isEntity ? data?.lastName || '' : undefined,
    dateOfBirth: !isEntity ? data?.dateOfBirth || '' : undefined,

    taxpayerReference: data?.taxpayerReference || '',
    vatReference: data?.vatReference || '',
    customsClientNo: data?.customsClientNo || '',
    idNumber: data?.idNumber || '',
    idType: data?.idType || '',

    addressLine1: data?.address?.addressLine1 || '',
    addressLine2: data?.address?.addressLine2 || '',
    postCode: (data?.address as any)?.postCode || '',
    suburb: (data?.address as any)?.suburb || '',
    townName: data?.address?.townName || '',
    region: data?.address?.region || '',
    countryCode: data?.address?.countryCode || '',

    ...(hasPostalAddress && {
      postalAddressLine1: data?.postalAddress?.addressLine1 || '',
      postalAddressLine2: data?.postalAddress?.addressLine2 || '',
      postalPostCode: (data?.postalAddress as any)?.postCode || '',
      postalSuburb: (data?.postalAddress as any)?.suburb || '',
      postalTownName: data?.postalAddress?.townName || '',
      postalRegion: data?.postalAddress?.region || '',
      postalCountryCode: data?.postalAddress?.countryCode || '',
    }),

    ...(isEntity
      ? {
          contactName: data?.contact?.contactName || '',
          contactFirstName: (data?.contact as any)?.contactFirstName || '',
          contactLastName: (data?.contact as any)?.contactLastName || '',
          telephoneNumber: (data?.contact as any)?.telephoneNumber || '',
          mobileNumber: (data?.contact as any)?.mobileNumber || '',
          faxNumber: (data?.contact as any)?.faxNumber || '',
          jobTitle: data?.contact?.jobTitle || '',
          mobilePhoneNumber: data?.contact?.mobilePhoneNumber || '',
          mobilePhoneUsage: data?.contact?.mobilePhoneUsage || [],
          workPhoneNumber: data?.contact?.workPhoneNumber || '',
          workPhoneUsage: data?.contact?.workPhoneUsage || [],
          email: data?.contact?.email || '',
          emailUsage: data?.contact?.emailUsage || [],
        }
      : {
          contactFirstName: (data?.contact as any)?.contactFirstName || '',
          contactLastName: (data?.contact as any)?.contactLastName || '',
          telephoneNumber: (data?.contact as any)?.telephoneNumber || '',
          mobileNumber: (data?.contact as any)?.mobileNumber || '',
          faxNumber: (data?.contact as any)?.faxNumber || '',
          phoneFirstName: data?.phone?.firstName || '',
          phoneLastName: data?.phone?.lastName || '',
          mobilePhoneNumber: data?.phone?.mobilePhoneNumber || '',
          mobilePhoneUsage: data?.phone?.mobilePhoneUsage || [],
          alternatePhoneNumber: data?.phone?.alternatePhoneNumber || '',
          alternatePhoneUsage: data?.phone?.alternatePhoneUsage || [],
          email: data?.contact?.email || '',
          emailUsage: data?.contact?.emailUsage || [],
        }),
  } as const;
};

export const textMatches = (text: string | undefined, filter: string): boolean => {
  if (!text) return false;
  return text.toLowerCase().includes(filter.toLowerCase());
};

export const textEquals = (text: string | undefined, filter: string): boolean => {
  if (!text) return false;
  return text.toLowerCase() === filter.toLowerCase();
};

export const matchesSearchText = (row: any, searchLower: string): boolean => {
  if (!searchLower) return true;
  const nameMatches = row.thirdPartyName?.toLowerCase().includes(searchLower);
  const idMatches = row.bopThirdPartyID?.toLowerCase().includes(searchLower);
  return nameMatches || idMatches;
};