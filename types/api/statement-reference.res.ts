export interface AllowedCode {
  code: string;
  description: string;
  length: number | null;
  example: string;
}

export interface StatementReferenceType {
  statementReferenceType: string;
  postingOption: string;
  applyToDebitStatementReferenceAllowed: boolean;
  allowedCodes: AllowedCode[];
}

export interface AllowedStatementReferenceTypes {
  [key: string]: string[];
}

export interface StatementReferenceResponse {
  allowedPostingOptions: string[];
  allowedStatementReferenceTypes: AllowedStatementReferenceTypes;
  statementReferenceTypes: StatementReferenceType[];
  allCodes: AllowedCode[];
}

export interface StatementReferenceRequest {
  agreementKey: string | number;
  accountKeys: string;
  instrumentClassification: string;
}
