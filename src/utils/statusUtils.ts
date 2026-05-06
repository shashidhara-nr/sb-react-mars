export const getStatusDisplayText = (status: string): string => {
	if (status === 'ACT') return 'Active';
	if (status === 'ACA') return 'Awaiting Customer Authorisation';
	if (status === 'ACI') return 'Awaiting Customer Audit';
	if (status === 'ACR') return 'Awaiting Customer Repair';
	if (status === 'PCA') return 'Partially Customer Authorised';
	if (status === 'ABA') return 'Awaiting Bank Authorisation';
	if (status === 'ABI') return 'Awaiting Bank Audit';
	if (status === 'ABR') return 'Awaiting Bank Repair';
	if (status === 'PBA') return 'Partially Bank Authorised';
	return status || 'Unknown';
};
