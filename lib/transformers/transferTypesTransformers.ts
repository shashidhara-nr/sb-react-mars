import { TransferType, TransferTypeLinks, TransferTypeListItem, TransferTypeStatus, TRANSFER_TYPE_STATUS_CODES } from '../../types/redux/transferTypes';

export function transformTransferTypeResponse(items: TransferTypeListItem[]): TransferType[] {
  return items.map((item, index) => ({
    id: item.transferTypeKey?.toString() ?? `${index + 1}`,
    transferTypeName: item.transferTypeName,
    authorisationProfile: item.authorisationProfileName ?? '',
    customerAgreement: item.serviceAgreementName ?? '',
    numberOfAccounts: item.numberOfAccounts,
    status: transformStatus(item.authoriseStatus),
    links: transformLinks(item.authoriseStatus),
    transferTypeKey: item.transferTypeKey,
  }));
}

function transformStatus(authoriseStatus: string): TransferTypeStatus {
  const statusColorMap: Record<string, string> = {
    [TRANSFER_TYPE_STATUS_CODES.ACTIVE]: 'success',
    [TRANSFER_TYPE_STATUS_CODES.AWAITING_APPROVAL]: 'warning',
    [TRANSFER_TYPE_STATUS_CODES.DRAFT]: 'error',
  };

  return {
    value: authoriseStatus || 'UNKNOWN',
    label: authoriseStatus || 'UNKNOWN',
    color: statusColorMap[authoriseStatus] || 'info',
  };
}

function transformLinks(authoriseStatus: string): TransferTypeLinks {
  const linkKeyMap: Record<string, string> = {
    [TRANSFER_TYPE_STATUS_CODES.ACTIVE]: 'transferTypesManage',
    [TRANSFER_TYPE_STATUS_CODES.AWAITING_APPROVAL]: 'transferTypesRemind',
    [TRANSFER_TYPE_STATUS_CODES.DRAFT]: 'transferTypesComplete',
  };

  const linkKey = linkKeyMap[authoriseStatus] || 'transferTypesManage';

  return { text: linkKey, href: '#' };
}

/**
 * Prepare TransferType data for API submission (reverse transformation)
 */
export function prepareTransferTypePayload(transferType: TransferType): TransferTypeListItem {
  return {
    transferTypeName: transferType.transferTypeName,
    transferTypeKey: Number.parseInt(transferType.id || '0', 10),
    authorisationProfileName: transferType.authorisationProfile,
    serviceAgreementName: transferType.customerAgreement,
    numberOfAccounts: transferType.numberOfAccounts,
    statusCode: transferType.status.value,
    displayStatus: transferType.status.label,
    requiresInterimAudit: false, // Default value
    action: null,
    authoriseStatus: transferType.status.value,
    defaultCustomerHostToHost: false, // Default value
  };
}

/**
 * Transform TransferTypeGetDetailsResponse to TransferType for Redux state
 */
export function transformTransferTypeDetail(detail: any): TransferType {
  // Handle if the API returns nested data structure
  const actualDetail = detail?.transferType || detail?.data || detail;
  
  const result = {
    id: actualDetail.transferTypeKey?.toString() ?? '',
    transferTypeName: actualDetail.name ?? '',
    authorisationProfile: actualDetail.authProfileKey?.toString() ?? '',
    customerAgreement: actualDetail.agreementKey?.toString() ?? '',
    numberOfAccounts: (actualDetail.accountKeys?.length ?? 0) + (actualDetail.creditAccountKeys?.length ?? 0),
    status: transformStatus(actualDetail.authoriseStatus),
    links: transformLinks(actualDetail.authoriseStatus),
    accountKeys: actualDetail.accountKeys ?? actualDetail.accountKeyValues ?? [],
    creditAccountKeys: actualDetail.creditAccountKeys ?? actualDetail.creditAccountKeyValues ?? [],
    versionNumber: actualDetail.versionNumber,
    transferTypeKey: actualDetail.transferTypeKey,
  };
  
  return result;
}
