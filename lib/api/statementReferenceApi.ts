import { STATEMENT_REFERENCE_API } from "@lib/utils/apiRoute";
import { get } from './httpClient';
import { StatementReferenceResponse } from "types/api/statement-reference.res";

export async function getStatementReferences(
  agreementKey: string | number,
  accountKeys: string,
  instrumentClassification: string
): Promise<StatementReferenceResponse> {
  const url = STATEMENT_REFERENCE_API(agreementKey, accountKeys, instrumentClassification);
  const data = await get<StatementReferenceResponse>(url);
  return data;
}
