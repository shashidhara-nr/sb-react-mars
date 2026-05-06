export interface Beneficiary {
  // Define the fields based on the API response
  [key: string]: any;
  beneficiaryDetailPerfList?: Beneficiary[];
}

export interface BeneficiariesState {
  data: Beneficiary;
  loading: boolean;
  error: string | null;
}