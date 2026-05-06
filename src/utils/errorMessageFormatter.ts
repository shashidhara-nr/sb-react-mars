import { mapBackendErrors, BackendErrorResponse } from './errorMappingLogic';

export const formatErrorMessages = (issues: any[]): string => {
  const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again or contact your bank representative for assistance.';

  if (!issues || issues.length === 0) {
    return DEFAULT_ERROR_MESSAGE;
  }

  // Convert API issues to BackendErrorResponse format
  const backendErrors: BackendErrorResponse[] = issues.map((issue: any) => ({
    errorCode: issue.errorCode,
    messageCode: issue.messageCode,
    message: issue.message,
    messageParams: issue.messageParams,
    domain: issue.domain,
    constraint: issue.constraint,
    issueType: issue.issueType,
  }));

  // Map errors using the error mapping logic
  const mappedErrors = mapBackendErrors(backendErrors);
  
  // Combine field errors and general errors
  const allErrors = [...mappedErrors.fieldErrors, ...mappedErrors.generalErrors];
  
  if (allErrors.length === 0) {
    return DEFAULT_ERROR_MESSAGE;
  }

  // Check if all errors are unmapped (have "Unknown error code" as reason)
  const allUnmapped = allErrors.every(
    (error) => error.reason === 'Unknown error code - please contact support'
  );
  if (allUnmapped) {
    return DEFAULT_ERROR_MESSAGE;
  }

  // Remove duplicates based on message + reason combination
  const uniqueErrors = allErrors.filter((error, index, self) =>
    index === self.findIndex((e) => e.message === error.message && e.reason === error.reason)
  );

  // Format errors - single error without bullet, multiple errors with bullets
  if (uniqueErrors.length === 1) {
    return uniqueErrors[0].message;
  }

  const errorList = uniqueErrors
    .map((error) => `• ${error.message}`)
    .join('\n');

  return errorList;
};

export const extractErrorIssues = (errorResponse: any): any[] => {
  return (
    errorResponse?.issues ||
    errorResponse?.issueLog?.issues ||
    errorResponse?.error?.issues ||
    errorResponse?.response?.data?.issues ||
    errorResponse?.data?.issues ||
    []
  );
};

export const isDuplicateBeneficiaryError = (issues: any[]): boolean => {
  return issues.some(
    (issue: any) => issue.messageCode === '110450' || issue.errorCode === '110450'
  );
};
