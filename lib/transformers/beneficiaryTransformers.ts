import { get } from 'http';
import { CreateBeneficiaryPayload } from '../../types/beneficiary';

export interface UpdateBeneficiaryPayload {
  action: string;
  versionNumber: number;
  entityKey: number;
  [key: string]: any;
}

export interface DeleteBeneficiaryPayload {
  entityKey: number;
  entityVersionNumber: number;
  beneficiaryName: string;
  endorseStatusCode: string;
  authoriseStatus: string;
  declineReason: string;
  classification: string;
}

 const getAccountTypeCode = (accountType: string | undefined, classification?: string) => {
    if (!accountType) {
      return classification === 'international' ||classification === 'Domestic FX and/or International' 
        ? 'CURR' 
        : '1';
    }
    
    const accountTypeLower = accountType.toLowerCase();
    
    if (classification === 'international' || classification === 'Domestic FX and/or International') {
      if (accountTypeLower.includes('current') || accountTypeLower.includes('cheque')) {
        return 'CURR';
      }
      if (accountTypeLower.includes('saving')) {
        return 'SAV';
      }
      if (accountTypeLower.includes('transmission')) {
        return 'TRAN';
      }
      if (accountTypeLower.includes('bond')) {
        return 'BOND';
      }
      if (accountTypeLower.includes('subscription') || accountTypeLower.includes('share')) {
        return 'SUBS';
      }
      if (accountTypeLower === 'other') {
        return 'OTHR';
      }
      if (accountType.length <= 4 && accountType === accountType.toUpperCase()) {
        return accountType;
      }
      
      return 'CURR';
    }
    
    switch (accountTypeLower) {
      case 'current accounts':
      case 'current (cheque) accounts':
      case 'current':
      case 'cheque':
        return '1';
      case 'savings accounts':
      case 'savings':
      case 'saving':
        return '2';
      case 'transmission accounts':
      case 'transmission':
        return '3';
      case 'bond accounts':
      case 'bond':
        return '4';
      case 'subscription share accounts':
      case 'subscription':
        return '6';
      case 'other':
        return '000';
      default:
        return '210';
    }
  };

const getIdentificationType = (identificationType: string | undefined) => {
  if (!identificationType) return '';
  if (identificationType === 'Identification number') return 'ID';
  if (identificationType === 'Passport number') return 'PASS';
  return identificationType;
};

export function prepareUpdatePayload(
  beneficiary: CreateBeneficiaryPayload,
): UpdateBeneficiaryPayload {
  const payload = JSON.parse(JSON.stringify(beneficiary)) as any;

  payload.classification = payload.beneficiaryType;
  if (payload.classification === 'Domestic FX and/or International') {
    payload.classification = 'international';
    payload.cdiCheck = 'N';
    payload.accountType = null;
    if (payload.entityCategory.startsWith('I')) {
      payload.counterPartyStreetName = payload.counterPartyAddress.addressLine1;
      payload.counterPartyTownName = payload.counterPartyAddress.townName;
      payload.counterPartyCountrySubDivision = payload.counterPartyAddress.countrySubDivision;
      payload.counterPartyPostalCode = payload.counterPartyAddress.postalCode;
      payload.identificationType = getIdentificationType(payload.identificationType);
    }
  } else if (payload.classification === 'Company') {
    payload.classification = 'CDI';
    payload.cdiCheck = 'Y';
  } else if (payload.classification === 'domestic' || payload.classification.toLowerCase() === 'domestic base') {
    payload.cdiCheck = 'N';
    payload.classification = 'DOMESTIC';
    payload.accountCurrency = payload.accountCurrency || payload.transactionLimitCurrency || '';
    delete payload.cin;
  }

  if(!payload.accountType) {
    delete payload.accountType
  } else {
    payload.accountType = getAccountTypeCode(payload.accountType, payload.classification);
  }

  if (payload.alertDetailsListTO && payload.alertDetailsListTO.alertDetailsList) {
    payload.alertDetailsListTO.alertDetailsList = payload.alertDetailsListTO?.alertDetailsList?.map(
      (alert: any) => ({
        alertType: alert.alertType[0].toUpperCase(),
        emailOrNumber: alert.emailOrNumber,
        notify: alert.notify,
        titleAndName: alert.titleAndName,
      }),
    );
  }
  payload.entityCategory = payload.entityCategory ? payload.entityCategory[0].toUpperCase() : '';

  const isDomestic =
    payload.classification === 'domestic' || 
    payload.classification === 'Domestic Base' ||
    payload.classification === 'DOMESTIC';
  const isInternational =
    payload.classification === 'international' ||
    payload.classification === 'Domestic FX and/or International';
  const isCDI = payload.classification === 'CDI';

  if (isCDI) {
    payload.entityCategory = 'E';
    payload.cdiNumber = payload.cdiNumber || payload.billerID;
    payload.cdiName =
      payload.cdiName || payload.beneficiaryName || payload.companyName || payload.counterPartyName;
  }

  delete payload.verifiedAccount;
  delete payload.auditSummaryChangeTOs;
  delete payload.lastAuditDate;
  delete payload.createdBy;
  delete payload.createdDateTime;
  delete payload.lastAuthorisedBy;
  delete payload.lastAuthorisedDateTime;
  delete payload.selectedBank;
  delete payload.selectedCompany;
  
  payload.counterPartyTransactionHistoryList = [];
  
  delete payload.issueLogTO;
  delete payload.canAuthorise;
  delete payload.hasDAPPermission;
  delete payload.initiator;
  delete payload.status;
  delete payload.statusDescription;
  delete payload.beneficiaryType;
  delete payload.phoneNumber;
  delete payload.email;
  delete payload.firstName;
  delete payload.lastName;
  delete payload.branchName;
  delete payload.creationMethod;
  delete payload.displayAccountNumber;
  delete payload.displayBankName;
  delete payload.beneficiaryKey;
  delete payload.beneficiaryCode;
  delete payload.beneficiaryReference;
  delete payload.beneficiaryName;
  delete payload.billerID;
  delete payload.currency;
  delete payload.town;
  delete payload.bankBranchTownName;
  delete payload.idPassportNumber;
  delete payload.bankAddressLine1;
  delete payload.bankAddressLine2;
  delete payload.bankAddressLine3;
  delete payload.bankAddressLine4;
  delete payload.bankAddressLine5;

  if (Array.isArray(payload.paymentType) && payload.paymentType.length > 0) {
    const selectedNames = new Set(payload.paymentType);
    const allProfiles: any[] = payload.paymentProfileListTO?.paymentProfiles || [];
    if (allProfiles.length > 0) {
      payload.linkedPaymentProfiles = allProfiles.filter((p: any) =>
        selectedNames.has(p.customerPaymentProfileName),
      );
    } else {
      payload.linkedPaymentProfiles = (payload.linkedPaymentProfiles || []).filter((p: any) =>
        selectedNames.has(p.customerPaymentProfileName),
      );
    }
  }
  delete payload.paymentType;
  
  if (isDomestic) {
    payload.internationalBankBicCode = null;
  } else {
    payload.internationalBankBicCode = payload.bic || payload.internationalBankBicCode || null;
  }
  delete payload.bic;
  
  if (isDomestic) {
    delete payload.entityCategory;
  } else if (isInternational || isCDI) {
    if (!payload.entityCategory) {
      payload.entityCategory = '';
    }
  }

  if (payload.transactionLimit !== undefined && payload.transactionLimit !== null) {
    const parsed = Number(payload.transactionLimit);
    payload.transactionLimit = isNaN(parsed) ? null : parsed;
  }

  payload.action = 'U';
  payload.versionNumber = beneficiary.versionNumber || 0;
  
  if (payload.counterPartyAddress) {
    if (payload.counterPartyAddress.addressLine1 === '')
      payload.counterPartyAddress.addressLine1 = null;
    if (payload.counterPartyAddress.addressLine2 === '')
      payload.counterPartyAddress.addressLine2 = null;
    if (payload.counterPartyAddress.addressLine3 === '')
      payload.counterPartyAddress.addressLine3 = null;
    if (payload.counterPartyAddress.addressLine4 === '')
      payload.counterPartyAddress.addressLine4 = null;
    if (payload.counterPartyAddress.addressLine5 === '')
      payload.counterPartyAddress.addressLine5 = null;
    if (payload.counterPartyAddress.streetName === '')
      payload.counterPartyAddress.streetName = null;
    if (payload.counterPartyAddress.buildingNumber === '')
      payload.counterPartyAddress.buildingNumber = null;
    if (payload.counterPartyAddress.postalCode === '')
      payload.counterPartyAddress.postalCode = null;
    if (payload.counterPartyAddress.townName === '') payload.counterPartyAddress.townName = null;
    if (payload.counterPartyAddress.countrySubDivision === '')
      payload.counterPartyAddress.countrySubDivision = null;
    if (payload.counterPartyAddress.subUrb === '') payload.counterPartyAddress.subUrb = null;
    delete payload.counterPartyAddress.coreAddressTO;
  }
  
  if (payload.bankBranchAddress) {
    if (payload.bankBranchAddress.addressLine1 === '')
      payload.bankBranchAddress.addressLine1 = null;
    if (payload.bankBranchAddress.addressLine2 === '')
      payload.bankBranchAddress.addressLine2 = null;
    if (payload.bankBranchAddress.addressLine3 === '')
      payload.bankBranchAddress.addressLine3 = null;
    if (payload.bankBranchAddress.addressLine4 === '')
      payload.bankBranchAddress.addressLine4 = null;
    if (payload.bankBranchAddress.addressLine5 === '')
      payload.bankBranchAddress.addressLine5 = null;
    if (payload.bankBranchAddress.streetName === '') payload.bankBranchAddress.streetName = null;
    if (payload.bankBranchAddress.buildingNumber === '')
      payload.bankBranchAddress.buildingNumber = null;
    if (payload.bankBranchAddress.postalCode === '') payload.bankBranchAddress.postalCode = null;
    if (payload.bankBranchAddress.townName === '') payload.bankBranchAddress.townName = null;
    if (payload.bankBranchAddress.countrySubDivision === '')
      payload.bankBranchAddress.countrySubDivision = null;
    if (payload.bankBranchAddress.subUrb === '') payload.bankBranchAddress.subUrb = null;
    delete payload.bankBranchAddress.coreAddressTO;
  }
  
  if (!payload.linkedPaymentProfiles || payload.linkedPaymentProfiles.length === 0) {
    payload.linkedPaymentProfiles = beneficiary.linkedPaymentProfiles || [];
  }
  
  if (payload.linkedPaymentProfiles && payload.linkedPaymentProfiles.length > 0) {
    payload.linkedPaymentProfiles = payload.linkedPaymentProfiles.map((profile: any) => ({
      customerPaymentProfileName: profile.customerPaymentProfileName,
      entityKey: profile.entityKey,
      manualEntryServiceName: profile.manualEntryServiceName,
      payAlertsEnabled: profile.payAlertsEnabled || false,
      active: profile.active || false,
      hidebeneficiaryenabled: profile.hidebeneficiaryenabled || false,
    }));
  }
  
  if (!payload.alertDetailsListTO || !payload.alertDetailsListTO.alertDetailsList) {
    payload.alertDetailsListTO = {
      lastPage: true,
      pageCount: 0,
      postition: 0,
      pageSize: 0,
      rowCount: 0,
      alertDetailsList: [],
    };
  } else if (
    payload.alertDetailsListTO.alertDetailsList.length === 1 &&
    Object.keys(payload.alertDetailsListTO.alertDetailsList[0]).length <= 2
  ) {
    payload.alertDetailsListTO.alertDetailsList = [];
  }
  
  if (payload.beneficiaryAdditionalReferenceListTO) {
    if (
      payload.beneficiaryAdditionalReferenceListTO.additionalRefList &&
      payload.beneficiaryAdditionalReferenceListTO.additionalRefList.length === 1 &&
      Object.keys(payload.beneficiaryAdditionalReferenceListTO.additionalRefList[0]).length === 0
    ) {
      payload.beneficiaryAdditionalReferenceListTO.additionalRefList = [];
    }
  }
  
  payload.declineReason = '';
  payload.declineTimestamp = '';
  payload.declineUserName = '';
  
  if (payload.counterPartyReference === '') payload.counterPartyReference = null;
  if (payload.surname === '') payload.surname = null;
  if (payload.secondReference === '') payload.secondReference = null;
  if (payload.iban === '') payload.iban = null;
  
  if (isDomestic) {
    payload.intermediaryBankBicCode = null;
    payload.intermediaryBankName = null;
    payload.intermediaryBankTownName = null;
    payload.correspondingBankBicCode = null;
    payload.correspondingBankName = null;
    payload.correspondingBankTownName = null;
  } else {
    if (payload.intermediaryBankBicCode === '') payload.intermediaryBankBicCode = null;
    if (payload.intermediaryBankName === '') payload.intermediaryBankName = null;
    if (payload.intermediaryBankTownName === '') payload.intermediaryBankTownName = null;
    if (payload.correspondingBankBicCode === '') payload.correspondingBankBicCode = null;
    if (payload.correspondingBankName === '') payload.correspondingBankName = null;
    if (payload.correspondingBankTownName === '') payload.correspondingBankTownName = null;
  }
  
  if (!payload.bankCountryCode && payload.bankBranchAddress?.countryCode) {
    payload.bankCountryCode = payload.bankBranchAddress.countryCode;
  }
  
  delete payload.paymentProfileListTO;
  delete payload.accountTypeDesc;
  delete payload.auditTrails;
  delete payload.cdinumber;
  return payload as UpdateBeneficiaryPayload;
}

export function extractErrorMessage(error: any): string {
  if (error?.issueLog?.issues && error.issueLog.issues.length > 0) {
    const issues = error.issueLog.issues.map((issue: any) => 
      issue.message || issue.messageCode || 'Unknown issue'
    ).join(', ');
    return `Validation errors: ${issues}`;
  } else if (error?.response?.data) {
    const responseData = error.response.data;
    if (responseData.errorMessage) {
      return responseData.errorMessage;
    } else if (responseData.message) {
      return responseData.message;
    } else if (responseData.issues && Array.isArray(responseData.issues)) {
      const issues = responseData.issues.map((issue: any) => 
        issue.message || issue.messageCode || JSON.stringify(issue)
      ).join(', ');
      return `Backend validation errors: ${issues}`;
    } else {
      return `Server error: ${JSON.stringify(responseData).substring(0, 200)}`;
    }
  } else if (error?.message) {
    return `Error: ${error.message}`;
  }
  
  return 'Failed to update beneficiary. Please try again.';
}

export function prepareDeletePayload(beneficiary: any): any {
  return {
    entityKey: beneficiary.entityKey,
    entityVersionNumber: beneficiary.versionNumber || 0,
    beneficiaryName: beneficiary.counterPartyName || '',
    endorseStatusCode: '',
    authoriseStatus: beneficiary.authoriseStatus || '',
    declineReason: 'hardcode reason',
    classification: beneficiary.classification || ''
  };
}
