import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import beneficiariesReducer from './slices/beneficiariesSlice';
import beneficiaryFiltersReducer from './slices/beneficiaryFiltersSlice';
import createBeneficiaryReducer from './slices/createBeneficiarySlice';
import createDebtorReducer from './slices/createDebtorSlice';
import createPaymentTypeReducer from './slices/createPaymentTypeSlice';
import createCollectionTypeReducer from './slices/createCollectionTypeSlice';
import companyDetailseReducer from './slices/createCollectionTypeSlice';
import { authReducer } from './slices/authSlice';
import debtorReducer from './slices/debtorSlice';
import limitDetailsReducer from './slices/limitDetails';
import userAccountDetailsReducer from './slices/userAccountDetails';
import bankAccountDetailsReducer from './slices/bankAccountDetails';
import userDetailsReducer from './slices/userDetails';
import billingAccountDetailsReducer from './slices/billingAccountDetails';
import createBillingAccountDetailsReducer from './slices/createBillingAccountDetails';
import createAccountGroupReducer from './slices/createAccountGroupDetails';
import nonTransactionalReducer from './slices/nontransactionalauditandapproveslice';
import createBillerReducer from './slices/createBillerSlice';
import manageCollectionTypeReducer from './slices/manageCollectionTypeSlice';
import createTransferTypeReducer from './slices/createTransferTypeSlice';
import createUnpaidOptionReducer from './slices/createUnpaidOptionSlice';
import createAuthRuleReducer from './slices/createAuthRuleSlice';
import authorizationRulesReducer from './slices/authorizationRulesSlice';
import createTransactionalAuthorisationProfileReducer from './slices/createTransactionalAuthorisationProfileSlice';
import bopThirdPartyReducer from './slices/bopThirdPartySlice';
import transactionalAuthorisationProfilesReducer from './slices/transactionalAuthorisationProfilesSlice';
import nonTransactionalAuthRulesReducer from './slices/nonTransactionalAuthRulesSlice';
import authorizationRulesConfigReducer from './slices/authorizationRulesConfigSlice';
import collectionTypesReducer from './slices/collectionTypesSlice';
import collectionReducer from './slices/collectionSlice';
import collectionHistoryReducer from './slices/collectionHistorySlice';
import paymentTypesReducer from './slices/paymentTypesSlice';

import transferTypesReducer from './slices/setup-admin/transferTypes/transferTypesSlice';
import accountsReducer from './slices/setup-admin/commonSlice/accountsSlice';
import agreementAccountReducer from './slices/setup-admin/commonSlice/agreementAccountSlice';
import customerAgreementReducer from './slices/setup-admin/commonSlice/customerAgreementSlice';
import authorisationProfileReducer from './slices/setup-admin/commonSlice/authorisationProfileSlice';
import statementReferenceReducer from './slices/statementReferenceSlice';

const rootReducer = combineReducers({
  beneficiaries: beneficiariesReducer,
  beneficiaryFilters: beneficiaryFiltersReducer,
  auth: authReducer,
  createBeneficiary: createBeneficiaryReducer,
  createDebtor: createDebtorReducer,
  debtor: debtorReducer,
  createPaymentType: createPaymentTypeReducer,
  createCollectionType: createCollectionTypeReducer,
  companyDetails: companyDetailseReducer,
  limitDetails: limitDetailsReducer,
  userAccountDetails: userAccountDetailsReducer,
  bankAccountDetails: bankAccountDetailsReducer,
  userDetails: userDetailsReducer,
  billingAccountDetails: billingAccountDetailsReducer,
  createBillingAccountDetails: createBillingAccountDetailsReducer,
  createAccountGroupDetails: createAccountGroupReducer,
  nonTransactional: nonTransactionalReducer,
  createBiller: createBillerReducer,
  manageCollectionType: manageCollectionTypeReducer,
  createTransferType: createTransferTypeReducer,
  createAuthRule: createAuthRuleReducer,
  authorizationRules: authorizationRulesReducer,
  createUnpaidOption: createUnpaidOptionReducer,
  bopThirdParty: bopThirdPartyReducer,
  collectionTypes: collectionTypesReducer,
  collection: collectionReducer,
  collectionHistory: collectionHistoryReducer,
  paymentTypes: paymentTypesReducer,
  transferTypes: transferTypesReducer,
  accounts: accountsReducer,
  agreementAccount: agreementAccountReducer,
  customerAgreement: customerAgreementReducer,
  authorisationProfile: authorisationProfileReducer,
  createTransactionalAuthorisationProfile: createTransactionalAuthorisationProfileReducer,
  transactionalAuthorisationProfiles: transactionalAuthorisationProfilesReducer,
  nonTransactionalAuthRules: nonTransactionalAuthRulesReducer,
  authorizationRulesConfig: authorizationRulesConfigReducer,
  statementReference: statementReferenceReducer,
});

// Define RootState from rootReducer BEFORE persisting
export type RootState = ReturnType<typeof rootReducer>;

const persistConfig = {
  key: 'root',
  storage,
  whitelist: [
    'auth',
    'createBeneficiary',
    'createDebtor',
    'createPaymentType',
    'createCollectionType',
    'createTransferType',
    'createUnpaidOption',
    'createAuthRule',
    'bopThirdParty',
    'authorizationRules',
    'collectionTypes',
    'transferTypes',
    'createTransactionalAuthorisationProfile',
    'collection',
    'createAccountGroupDetails',
    'createBillingAccountDetails',
    'statementReference',
  ],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist actions
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
