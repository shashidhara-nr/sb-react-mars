// mockSFIUploads.ts

export interface SFIUploadRow {
  id: string;
  fileName: string;
  destination: string;
  uploadedBy: string;
  dateTime: string;
  interchangeId: string;
  fileStatus: 'Delivered' | 'Failed';
  errorMessage?: string;
}

const fileTypes = [
  'Payroll_001.csv',
  'Collections_002.csv',
  'Beneficiary_003.xlsx',
  'Returns_004.csv',
  'Suppliers_005.xlsx',
];

const destinations = ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Gqeberha'];
const uploadedByUsers = ['Thabo Mokoena', 'Lerato Ndlovu', 'Ayesha Khan', 'Sipho Dlamini', 'Mia Jacobs'];
const statuses: SFIUploadRow['fileStatus'][] = ['Delivered', 'Failed'];
const errorMessages = [
  'Invalid interchange ID',
  'Routing unavailable',
  'Duplicate batch',
  'Checksum mismatch',
];

export { destinations, uploadedByUsers };

export const mockSFIUploadsData: SFIUploadRow[] = Array.from({ length: 100 }, (_, i) => {
  const day = (i % 28) + 1;
  const hour = 8 + (i % 10);
  const minute = (i * 7) % 60;
  const status = statuses[i % statuses.length];

  return {
    id: String(i + 1),
    fileName: fileTypes[i % fileTypes.length],
    destination: destinations[i % destinations.length],
    uploadedBy: uploadedByUsers[i % uploadedByUsers.length],
    dateTime: `${String(day).padStart(2, '0')}/04/2026 ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
    interchangeId: `INT-${202604070001 + i}`,
    fileStatus: status,
    errorMessage: status === 'Failed' ? errorMessages[i % errorMessages.length] : '',
  };
});
