export const API_ROUTES = {

  LOGIN: (username: string) => `/bolapi/core/v5/login/${username}`,
  QR_LOGIN: (username: string) => `/bolapi/core/v3/login/${username}`,
  LOGOUT: '/bolapi/core/v1/logout',
  PING: '/bolapi/core/v1/ping',
  CREDENTIALS: (userName: string) => `/bolapi/core/v5/credentials/${userName}`,
  START_OOB_AUTH: '/bolapi/core/v4/login/nnl/auth',
  CHECK_OOB_STATUS: '/bolapi/core/v4/login/nnl/auth',
  FORGOT_PASSWORD_SEND_CODE: '/bolapi/core/v1/forgot-password/send-code',
  PASSWORD_RESET_V1: '/bolapi/core/v1/login/reset',
  UPDATE_EXPIRED_PASSWORD: '/bolapi/core/v1/passwords/expired',
  FORGOT_PASSWORD_RESEND: '/bolapi/core/v1/forgot-password/resend-code',
  OTP_REQUEST: (userName: string) => `/bolapi/core/v2/otp/${userName}/request`,
  PASSWORD_RESET: '/bolapi/core/v3/login/reset',
  REGISTER_TOKEN: '/bolapi/core/v1/register-token',
  ONEHUB_INITIATE: '/bolapi/core/v1/onehub/initiate',
  ONEHUB_CALLBACK: '/bolapi/core/v1/onehub/callback',
  GET_USERS: '/bolapi/core/v1/users',
  GET_USER_BY_KEY: (userKey: string | number) => `/bolapi/core/v1/users/select/${userKey}`,

  // Beneficiaries
  BENEFICIARIES: '/bolapi/payments/v1/beneficiaries',
  CREATE_BENEFICIARY: '/bolapi/payments/v1/beneficiaries',


  // Debtors  DEBTORS: '/bolapi/payments/v1/debtors',
  CREATE_DEBTOR: '/bolapi/core/v1/debtors',
  // DEBTOR_BY_ID: (id: string) => `/bolapi/core/v1/debtors/${id}`,
  BENEFICIARIES_PAYMENT_PROFILES: '/bolapi/payments/v1/beneficiaries/paymentprofiles',
  BENEFICIARIES_ACCOUNT_TYPES: '/bolapi/payments/v1/beneficiaries/accounttypesforbeneficiarybanks',
  BENEFICIARIES_AUDIT: '/bolapi/payments/v1/beneficiaries/audit',
  BENEFICIARIES_AUTHORISE: '/bolapi/payments/v1/beneficiaries/authorise',
  BENEFICIARIES_ACTION: (key: string | number, action: string) => `/bolapi/payments/v1/beneficiaries/${key}/${action}`,
  BENEFICIARIES_BATCH_DETAILS_AVS: '/bolapi/payments/v1/beneficiaries/batchdetailsavs',
  BENEFICIARIES_UPLOAD: '/bolapi/payments/v1/beneficiaries/upload',
  BENEFICIARIES_UPLOAD_DETAILED: '/bolapi/payments/v1/beneficiaries/uploadDetailed',
  BENEFICIARIES_PROCESS_BATCH: '/bolapi/payments/v1/beneficiaries/processbeneficiarybatch',
  BENEFICIARIES_ACTIVE_TEMPLATES: '/bolapi/payments/v1/beneficiaries/activefilemappertemplates',
  BENEFICIARIES_PRINT: '/bolapi/payments/v1/beneficiaries/print',
  BENEFICIARIES_EXPORT: '/bolapi/payments/v1/beneficiaries/export',
  BENEFICIARIES_BILLERS: '/bolapi/payments/v1/beneficiaries/billers',
  BENEFICIARIES_BILLERS_BY_ID: '/bolapi/payments/v1/beneficiaries/billersbybillerid',
  BENEFICIARIES_AUDIT_TRAIL_PRINT: '/bolapi/payments/v1/beneficiaries/audittrailprint',
  BENEFICIARIES_PRINT_HISTORY: '/bolapi/payments/v1/beneficiaries/printhistory',
  BENEFICIARIES_EXPORT_HISTORY: '/bolapi/payments/v1/beneficiaries/exporthistory',
  UNUSABLE_BENEFICIARY: '/bolapi/payments/v1/beneficiaries/unusedbeneficiaries',

  // Debtors
  DEBTORS: '/bolapi/payments/v1/debtors',
  DEBTOR_BY_ID: (id: string | number) => `/bolapi/payments/v1/debtors/${id}`,
  DEBTORS_BATCH_DETAILS_AVS: '/bolapi/payments/v1/debtors/batchdetailsavs',
  DEBTORS_UPLOAD: '/bolapi/payments/v1/debtors/uploaddebtors',
  DEBTORS_PRINT: '/bolapi/payments/v1/debtors/print',
  DEBTORS_EXPORT: '/bolapi/payments/v1/debtors/export',
  DEBTORS_EXPORT_HISTORY: '/bolapi/payments/v1/debtors/exportHistory',
  DEBTORS_PROCESS_BATCH: '/bolapi/payments/v1/debtors/processdebtorbatch',
  UNUSABLE_DEBTORS: '/bolapi/payments/v1/debtors/unuseddebtors',
  
  // BOP Third Parties
  BOP_THIRD_PARTIES: '/bolapi/core/v1/bop-third-parties',
  CREATE_BOP_THIRD_PARTY: '/bolapi/core/v1/bop-third-parties',
  BOP_THIRD_PARTY_BY_ID: (id: string) => `/bolapi/core/v1/bop-third-parties/${id}`,
  
  // Billers (Bills)
  BILLERS: '/bolapi/payments/v1/billers',
  CREATE_BILLER: '/bolapi/payments/v1/billers',
  BILLER_BY_ID: (id: string) => `/bolapi/payments/v1/billers/${id}`,
  ALL_BILLS: '/bolapi/payments/v1/bills/allbills',
  SUBMIT_BILLER: '/bolapi/payments/v1/bills',
  
  // Users
  USER: (userId: string) => `/users/${userId}`,
  USERS: '/users',

  // Collection Types
  COLLECTION_TYPES: '/bolapi/payments/v1/collection-types',
  COLLECTION_TYPES_ACCOUNTS: '/bolapi/payments/v1/collection-types/credit-accounts',
  COLLECTION_TYPES_DELETE: '/bolapi/payments/v1/collection-types',
  COLLECTION_TYPES_CREATE: '/bolapi/payments/v1/collection-types',
  COLLECTION_TYPES_UPDATE: '/bolapi/payments/v1/collection-types',
  COLLECTION_TYPES_BY_ID: (id: string | number) => `/bolapi/payments/v1/collection-types/${id}`,
  
  // Collection History
  COLLECTION_HISTORY: '/bolapi/payments/v1/collection-history',

  // Transfer Types
  TRANSFER_TYPES: '/bolapi/payments/v1/transfertypes',

  // Limits
  LIMITS: '/bolapi/payments/v1/limits',

  // Add more as needed
  COUNTRIES: '/bolapi/admin/v1/countries',
  BANK_LOOKUP: '/bolapi/core/v1/references/banks',
  PAYMENT_TYPES: '/bolapi/payments/v1/beneficiaries/paymentprofiles',
  CURRENCIES: '/bolapi/payments/v1/beneficiaries/initializeforcreate',
  // ACCOUNT_TYPES: 'bolapi/payments/v1/beneficiaries/accounttypesforbeneficiarybanks'
};

export const TRANSFER_API_COLLECTION={
  GET:'/bolapi/payments/v1/transfertypes',
  GET_BY_ID:(id:string|number)=>`/bolapi/payments/v1/transfertypes/${id}`,
  AUTH_PROFILE:'/bolapi/payments/v1/customer/authprofiles',
  CUSTOMER_AGREEMENTS:'/bolapi/payments/v1/customer/agreements',
  ACCOUNTS:'/bolapi/payments/v1/transfertypes/accounts',
  UPDATE:(id:string|number)=>`/bolapi/payments/v1/transfertypes/${id}`,
  ADD:'/bolapi/payments/v1/transfertypes',
  DELETE:'/bolapi/payments/v1/transfertypes'
}

export const PAYMENT_API_COLLECTION={
  LIST:'/bolapi/payments/v1/paymentTypes',
  ACCOUNTS:'/bolapi/payments/v1/paymentTypes/accounts',
  CREATE:'/bolapi/payments/v1/paymentTypes',
   UNPAIDOPTION:'/bolapi/payments/v1/paymentTypes/unpaidProcessingOptions',
   MULTI_DELETE:'/bolapi/payments/v1/paymentTypes',
}

export const AUDIT_AND_APPROVE_COLLECTION={
  LIST: (eventEntityType: string, initiatorUser: string) => {
    const event = encodeURIComponent(eventEntityType);
    const initiator = encodeURIComponent(initiatorUser);
    return `/bolapi/payments/v1/nontransactional?eventEntityType=${event}&initiatorUser=${initiator}`;
  },
  EVENTLIST:'/bolapi/payments/v1/nontransactional/eventtypes',
  BENI_AUDIT:'/bolapi/payments/v1/beneficiaries/audit',
  BENI_AUTHORISE:'/bolapi/payments/v1/beneficiaries/authorise',
  DEBITOR_AUDIT:'/bolapi/payments/v1/debtors/audit',
  DEBITOR_AUTHORISE:'/bolapi/payments/v1/debtors/authorise',
  PAYMENT_AUDIT:'/bolapi/payments/v1/paymentTypes/audit',
  PAYMENT_AUTHORISE:'/bolapi/payments/v1/paymentTypes/authorise',
}
export const STATEMENT_REFERENCE_API = (
  agreementKey: string | number,
  accountKeys: string,
  instrumentClassification: string
) => `/bolapi/payments/v1/customer/statement-references?agreementKey=${agreementKey}&accountKeys=${accountKeys}&instrumentClassification=${instrumentClassification}`
