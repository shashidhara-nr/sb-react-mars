/**
 * Authentication Business Logic
 * Core authentication flow and error handling
 * Extracted from JSF login logic
 */

import { validateLoginFields } from './authValidation';

export interface LoginResult {
    success: boolean;
    result?: any;
    errorMessage?: string;
    error?: any;
    requiresStrongAuth?: boolean;
    strongAuthType?: 'QR_CODE' | 'PUSH_NOTIFICATION';
    requiresOTP?: boolean;
    requiresToken?: boolean;
    requiresPasswordChange?: boolean;
}

export interface IssueTO {
    messageCode?: string;
    domain?: string;
    messageParams?: string[];
}

export interface ErrorWithIssues {
    issueLog?: {
        issues: IssueTO[];
    };
    message?: string;
}

export interface BOLUserStatus {
    isBOLUser: boolean;
    requiresPasswordChange: boolean;
    error?: any;
}

export interface LoginFields {
    userId: string;
    password: string;
    oldPassword: string;
    newPassword: string;
    reenterPassword: string;
    smsOTP: string;
    tokenOTP: string;
    tokenOTP2: string;
    tokenSerialNumber: string;
}

export type LogoutReason = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/**
 * Perform login with password validation
 * Step 1: Validates userId and password
 * Step 2: Authenticates with backend
 * Step 3: Backend determines if strong auth (QR code) is required
 * Step 4: If strong auth enabled, returns requiresStrongAuth=true
 *         If not, complete login
 */
export const performLogin = async (
    userId: string,
    password: string,
    authenticateFunction: (userId: string, password: string) => Promise<any>,
    onSuccess?: (result: LoginResult) => void,
    onError?: (error: LoginResult) => void
): Promise<LoginResult> => {
    const validation = validateLoginFields(userId, password);

    if (!validation.valid) {
        const errorResult: LoginResult = {
            success: false,
            errorMessage: validation.error || 'Validation failed'
        };
        if (onError) {
            onError(errorResult);
        }
        return errorResult;
    }

    try {
        // Authenticate with userId + password
        const result = await authenticateFunction(userId, password);

        if (result.success) {
            // Backend will indicate if strong auth (QR code) is required
            // result.requiresStrongAuth = true/false
            // result.strongAuthType = 'QR_CODE' | 'PUSH_NOTIFICATION'
            const loginResult: LoginResult = {
                success: true,
                result: result,
                requiresStrongAuth: result.requiresStrongAuth || false,
                strongAuthType: result.strongAuthType,
                requiresOTP: result.requiresOTP || false,
                requiresToken: result.requiresToken || false,
                requiresPasswordChange: result.requiresPasswordChange || false
            };
            
            if (onSuccess) {
                onSuccess(loginResult);
            }
            return loginResult;
        } else {
            const errorDetails: LoginResult = {
                success: false,
                errorMessage: result.message || 'Authentication failed',
                error: result
            };
            if (onError) {
                onError(errorDetails);
            }
            return errorDetails;
        }
    } catch (error) {
        const errorDetails = handleLoginError(error as ErrorWithIssues);
        if (onError) {
            onError(errorDetails);
        }
        return errorDetails;
    }
};

/**
 * Handle login error
 */
export const handleLoginError = (error: ErrorWithIssues): LoginResult => {
    let errorMessage = 'An error occurred during login';

    if (error?.issueLog?.issues && error.issueLog.issues.length > 0) {
        const issue = error.issueLog.issues[0];
        errorMessage = formatIssueMessage(issue);
    } else if (error?.message) {
        errorMessage = error.message;
    }

    return {
        success: false,
        errorMessage: errorMessage,
        error: error
    };
};

/**
 * Format issue message
 */
export const formatIssueMessage = (issueTO: IssueTO): string => {
    const messageCode = issueTO?.messageCode;
    const params = issueTO?.messageParams;

    // Basic message formatting - can be enhanced with i18n
    let message = messageCode || 'An error occurred';
    
    if (params && params.length > 0) {
        // Replace placeholders [0], [1], etc. with params
        params.forEach((param, index) => {
            message = message.replace(`[${index}]`, param);
        });
    }

    return message;
};

/**
 * Check BOL user status
 */
export const checkBOLUserStatus = async (
    userId: string,
    password: string,
    checkBolUserFunction: (userId: string, password: string) => Promise<boolean>
): Promise<BOLUserStatus> => {
    try {
        const isBOL = await checkBolUserFunction(userId, password);
        return {
            isBOLUser: !isBOL,
            requiresPasswordChange: !isBOL
        };
    } catch (error) {
        return {
            isBOLUser: false,
            requiresPasswordChange: false,
            error: error
        };
    }
};

/**
 * Should navigate to user selection
 */
export const shouldNavigateToUserSelection = async (
    checkUserSelectionFunction: () => Promise<boolean>
): Promise<boolean> => {
    try {
        const result = await checkUserSelectionFunction();
        return result;
    } catch (error) {
        return false;
    }
};

/**
 * Clear login fields
 */
export const clearLoginFields = (): LoginFields => {
    return {
        userId: '',
        password: '',
        oldPassword: '',
        newPassword: '',
        reenterPassword: '',
        smsOTP: '',
        tokenOTP: '',
        tokenOTP2: '',
        tokenSerialNumber: ''
    };
};

/**
 * Navigate to logout with reason
 */
export const navigateToLogout = (reason: LogoutReason, contextPath: string = ''): void => {
    if (typeof window !== 'undefined') {
        window.location.href = `${contextPath}/logout?reason=${reason}`;
    }
};

/**
 * Logout reason codes
 */
export const LOGOUT_REASONS = {
    SESSION_TIMEOUT: 1 as LogoutReason,
    USER_LOGOUT: 2 as LogoutReason,
    INVALID_SESSION: 3 as LogoutReason,
    PASSWORD_EXPIRED: 4 as LogoutReason,
    ACCOUNT_LOCKED: 5 as LogoutReason,
    CONCURRENT_LOGIN: 6 as LogoutReason,
    SECURITY_VIOLATION: 7 as LogoutReason,
    SYSTEM_ERROR: 8 as LogoutReason,
};
