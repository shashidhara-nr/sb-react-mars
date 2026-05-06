import { get, post } from './httpClient';
import { API_ROUTES } from '../utils/apiRoute';

export interface AuthenticateRequest {
    userId: string;
    password: string;
}

export interface AuthenticateResponse {
    success: boolean;
    digitalKey?: string;
    userList?: any[];
    requiresStrongAuth?: boolean;
    strongAuthType?: 'QR_CODE' | 'PUSH_NOTIFICATION';
    requiresOTP?: boolean;
    requiresToken?: boolean;
    requiresPasswordChange?: boolean;
    qrCodeData?: string;
    sessionId?: string;
    message?: string;
}

export interface CheckBOLUserResponse {
    isBOLUser: boolean;
    requiresPasswordChange: boolean;
}

export interface QRCodeStatusResponse {
    scanStatus: 'SCANNED' | 'APPROVED' | 'UNKNOWN' | 'ERROR' | 'PENDING';
    loginError?: boolean;
    errorMessage?: string;
    digitalKey?: string;
    userList?: any[];
}

export interface CredentialState {
    credentialName: string;
    credentialState: string;
}

export interface CredentialsResponse {
    credentialStates: CredentialState[];
    hasTokenRegistered?: boolean;
    requiresPasswordChange?: boolean;
}

export function hasStrongAuthEnabled(credentialsRes: CredentialsResponse): boolean {
    return credentialsRes.credentialStates.some(
        cred => cred.credentialName === 'VASCOGO3'
    );
}

export interface StartOOBAuthRequest {
    operation: 'START_OOB_AUTH';
    oobMode: {
        qr: boolean;
        push: boolean;
    };
    userName: string;
}

export interface StartOOBAuthResponse {
    statusCode?: number;
    id?: string;
    lifetimeMillis?: number;
    oobStatusHandle?: string;
    modeResult?: {
        qrCode?: {
            qrImage?: string;
        };
    };
    message?: string;
    success?: boolean;
}

export const authenticate = async (
    userId: string,
    password: string
): Promise<AuthenticateResponse> => {
    try {
        const response = await post<AuthenticateResponse>(
            API_ROUTES.LOGIN(userId),
            JSON.stringify({ userId, password }),
            { headers: { 'Content-Type': 'application/json' } }
        );

        return {
            ...response,
            success: true
        };
    } catch (error: any) {
        let errorMessage = 'Authentication failed';
        
        if (error.response?.data?.issues) {
            const issues = error.response.data.issues;
            if (issues.length > 0) {
                errorMessage = issues[0].message || errorMessage;
            }
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        return {
            success: false,
            message: errorMessage
        };
    }
};

export const checkCredentials = async (userId: string): Promise<CredentialsResponse> => {
    return get<CredentialsResponse>(API_ROUTES.CREDENTIALS(userId));
};

export interface CheckOOBStatusResponse {
    statusCode?: number;
    sessionKey?: string;
    sessionData?: {
        sessionKey?: string;
        exp?: number;
    };
    message?: string;
    success?: boolean;
    userList?: any[];
}

export const checkOOBStatus = async (userName: string, oobHandle: string): Promise<CheckOOBStatusResponse> => {
    try {
        const response = await post<CheckOOBStatusResponse>(
            API_ROUTES.CHECK_OOB_STATUS,
            JSON.stringify({
                operation: 'STATUS_OOB_AUTH',
                oobStatusHandle: oobHandle,
                userName
            }),
            {},
            { 'content-type': 'application/json' }
        );

        return {
            ...response,
            success: true
        };
    } catch (error: any) {
        let errorMessage = 'Failed to check authentication status';
        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        return {
            success: false,
            message: errorMessage
        };
    }
};

export const startOOBAuth = async (userName: string): Promise<StartOOBAuthResponse> => {
    try {
        const response = await post<StartOOBAuthResponse>(
            API_ROUTES.START_OOB_AUTH,
            JSON.stringify({
                operation: 'START_OOB_AUTH',
                oobMode: {
                    qr: true,
                    push: false
                },
                userName
            }),
            {},
            { 'content-type': 'application/json' }
        );

        // Extract QR image from nested structure
        const qrImage = response.modeResult?.qrCode?.qrImage;
        
        if (!qrImage) {
            throw new Error('QR code image not found in response');
        }
        
        return {
            ...response,
            success: true
        };
    } catch (error: any) {
        let errorMessage = 'Failed to start authentication';
        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        return {
            success: false,
            message: errorMessage
        };
    }
};

export const checkBOLUser = async (
    userId: string,
    password: string
): Promise<boolean> => {
    try {
        const response = await post<CheckBOLUserResponse>(
            '/bolapi/core/v1/check-bol-user',
            JSON.stringify({ userId, password }),
            {},
            { 'content-type': 'application/json' }
        );

        return response.isBOLUser;
    } catch (error) {
        return false;
    }
};

export const checkUserSelectionRequired = async (): Promise<boolean> => {
    try {
        const response = await get<{ required: boolean }>('/bolapi/core/v1/user-selection-required');
        return response.required;
    } catch (error) {
        return false;
    }
};

export interface UserData {
    userKey: number;
    userName: string;
    lastLoginTimeInMillis: string;
    country: string | null;
    language: string | null;
    timezone: string | null;
    customerUserName: string;
    isSuspended: boolean;
    status: string;
    fapsForUser: any[];
    customerCountry: string;
    bankUser: boolean;
    bankName: string | null;
    departmentName: string | null;
    bankKey: number;
    bankDepartmentKey: number;
    canSwitch: boolean;
    personKey: number;
    personId: string | null;
    customerName: string;
    customerKey: number;
    reasonList: any[];
    cannotSwitchReasonPresent: boolean;
}

export const fetchUserList = async (): Promise<UserData[]> => {
    try {
        const response = await get<UserData[]>(API_ROUTES.GET_USERS);
        return response || [];
    } catch (error: any) {
        throw error;
    }
};

export const fetchUserByKey = async (userKey: string | number): Promise<UserData> => {
    try {
        const response = await get<UserData>(API_ROUTES.GET_USER_BY_KEY(userKey));
        return response;
    } catch (error: any) {
        throw error;
    }
};

export const initializeStrongAuth = async (sessionId: string): Promise<{
    qrCodeData: string;
    timeout: number;
    strongAuthType: 'QR_CODE' | 'PUSH_NOTIFICATION';
}> => {
    try {
        const response = await post<{
            qrCodeData: string;
            timeout: number;
            strongAuthType: 'QR_CODE' | 'PUSH_NOTIFICATION';
        }>(
            '/bolapi/core/v1/strong-auth/initialize',
            JSON.stringify({ sessionId }),
            {},
            { 'content-type': 'application/json' }
        );

        return response;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to initialize strong authentication');
    }
};

export const pollQRCodeStatus = async (sessionId: string, userName: string): Promise<QRCodeStatusResponse> => {
    try {
        const response = await checkOOBStatus(userName, sessionId);
        
        const statusCode = response.statusCode;
        
        let scanStatus: 'PENDING' | 'SCANNED' | 'APPROVED' | 'UNKNOWN' | 'ERROR' = 'PENDING';
        
        if (statusCode === 4000) {
            scanStatus = 'APPROVED';
            
            const sessionKey = response.sessionData?.sessionKey || response.sessionKey;
            
            if (sessionKey) {
                return {
                    scanStatus: 'APPROVED',
                    digitalKey: sessionKey,
                    userList: response.userList || [],
                    loginError: false
                };
            } else {
                return {
                    scanStatus: 'ERROR',
                    loginError: true,
                    errorMessage: 'Authentication approved but no session key received'
                };
            }
        } else if (statusCode === 4100) {
            scanStatus = 'PENDING';
        } else if (statusCode === 4404) {
            scanStatus = 'ERROR';
        } else if (statusCode && statusCode >= 5000) {
            scanStatus = 'ERROR';
        }
        
        return {
            scanStatus,
            loginError: scanStatus === 'ERROR',
            errorMessage: response.message
        };
    } catch (error: any) {
        return {
            scanStatus: 'ERROR',
            loginError: true,
            errorMessage: error.message || 'Failed to check QR code status'
        };
    }
};

export const completeQRLogin = async (userName: string, sessionKey: string, password: string): Promise<AuthenticateResponse> => {
    try {
        try {
            const parts = sessionKey?.split('.');
            if (parts?.length !== 3) {
            }
        } catch (decodeErr) {
        }

        const response = await post<AuthenticateResponse>(
            API_ROUTES.QR_LOGIN(userName),
            JSON.stringify({
                password: password,
                jwtToken: sessionKey,
                loginType: 'Customer'
            }),
            { headers: { 'Content-Type': 'application/json' } }
        );

        return {
            ...response,
            success: (response.success !== false)
        };
    } catch (error: any) {
        const errorCodeHeader = error.response?.headers?.['nbol.login.error.code'];
        if (errorCodeHeader === 'login.error.PasswordExpired;') {
            return {
                success: false,
                message: 'PASSWORD_EXPIRED'
            };
        }

        let errorMessage = 'Failed to complete QR login';
        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.response?.data?.issues?.[0]?.message) {
            errorMessage = error.response.data.issues[0].message;
        } else if (error.message) {
            errorMessage = error.message;
        }
        return {
            success: false,
            message: errorMessage
        };
    }
};

export const cancelStrongAuth = async (sessionId: string): Promise<void> => {
    try {
        await post<void>(
            '/bolapi/core/v1/strong-auth/cancel',
            JSON.stringify({ sessionId }),
            {},
            { 'content-type': 'application/json' }
        );
    } catch (error) {
    }
};

export const verifyOTP = async (
    sessionId: string,
    otp: string,
    otpType: 'SMS' | 'TOKEN'
): Promise<AuthenticateResponse> => {
    try {
        const response = await post<AuthenticateResponse>(
            '/bolapi/core/v1/verify-otp',
            JSON.stringify({ sessionId, otp, otpType }),
            {},
            { 'content-type': 'application/json' }
        );

        return {
            ...response,
            success: true
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'OTP verification failed'
        };
    }
};

export const changePassword = async (
    userId: string,
    oldPassword: string,
    newPassword: string
): Promise<{ success: boolean; message?: string }> => {
    try {
        await post<void>(
            '/bolapi/core/v1/change-password',
            JSON.stringify({ userId, oldPassword, newPassword }),
            {},
            { 'content-type': 'application/json' }
        );

        return { success: true };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Password change failed'
        };
    }
};

export const forgotPasswordSendCode = async (
    userName: string
): Promise<{ success: boolean; message?: string; requiresStrongAuth?: boolean }> => {
    try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
            success: true,
            message: 'Authentication Code was sent',
            requiresStrongAuth: false
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Failed to send authentication code'
        };
    }
};

export const forgotPasswordReset = async (
    userName: string,
    authCode: string,
    newPassword: string,
    tokenOTP?: string
): Promise<{ success: boolean; message?: string }> => {
    try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (!authCode || authCode.length < 6) {
            return {
                success: false,
                message: 'Invalid authentication code'
            };
        }
        
        if (!newPassword || newPassword.length < 8) {
            return {
                success: false,
                message: 'Password must be at least 8 characters'
            };
        }
        
        return {
            success: true,
            message: 'Password reset successfully'
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Password reset failed'
        };
    }
};

export const forgotPasswordResendCode = async (
    userName: string
): Promise<{ success: boolean; message?: string }> => {
    try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
            success: true,
            message: 'Authentication Code was resent'
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Failed to resend authentication code'
        };
    }
};

export const registerToken = async (
    userName: string,
    tokenSerialNumber: string,
    tokenOTP: string
): Promise<{ success: boolean; message?: string }> => {
    try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (!tokenSerialNumber || tokenSerialNumber.length !== 10) {
            return {
                success: false,
                message: 'Token serial number must be 10 characters'
            };
        }
        
        if (!tokenOTP || tokenOTP.length < 6) {
            return {
                success: false,
                message: 'Invalid one-time password'
            };
        }
        
        return {
            success: true,
            message: 'Token registered successfully'
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Token registration failed'
        };
    }
};

export const initiateOneHubSSO = async (): Promise<{ 
    success: boolean; 
    authorizationUrl?: string;
    error?: string;
}> => {
    try {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockAuthUrl = '/bolapi/core/v1/onehub/authorize?client_id=mock&response_type=code&scope=openid+email+profile';
        
        return {
            success: true,
            authorizationUrl: mockAuthUrl
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Failed to initiate OneHub SSO'
        };
    }
};

export const handleOneHubCallback = async (
    code: string,
    state: string
): Promise<AuthenticateResponse> => {
    try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
            success: true,
            digitalKey: 'mock-digital-key-from-onehub',
            userList: [],
            message: 'OneHub SSO successful'
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'OneHub SSO callback failed'
        };
    }
};
