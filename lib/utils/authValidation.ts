export interface ValidationResult {
    valid: boolean;
    error: string | null;
}

export const INCORRECT_CREDENTIALS_KEY = 'incorrectCredentials';

/** Returns 'PASSWORD_EXPIRED', INCORRECT_CREDENTIALS_KEY, or a fallback message string based on the axios error. */
export function getLoginErrorMessage(error: any): string {
  const header = error?.response?.headers?.['nbol.login.error.code'];
  if (header === 'login.error.PasswordExpired' || header === 'login.error.PasswordExpired;') {
    return 'PASSWORD_EXPIRED';
  }
  if (
    header === 'login.error.IncorrectCredential' ||
    header === 'login.error.IncorrectCredential;' ||
    error?.response?.status === 401
  ) {
    return INCORRECT_CREDENTIALS_KEY;
  }
  if (error?.response?.data?.issues?.length > 0) {
    return error.response.data.issues[0].message || 'loginFailed';
  }
  return error?.message || 'loginFailed';
}

/**
 * Validate user ID field
 * @returns ValidationResult with error key for translation
 */
export function validateUserIdField(userId: string): ValidationResult {
    if (!userId || userId.trim().length === 0) {
        return {
            valid: false,
            error: 'userIdRequired'
        };
    }
    return {
        valid: true,
        error: null
    };
}

/**
 * Validate password field
 * @returns ValidationResult with error key for translation
 */
export function validatePasswordField(password: string): ValidationResult {
    if (!password || password.trim().length === 0) {
        return {
            valid: false,
            error: 'passwordRequired'
        };
    }
    if (password.length > 14) {
        return {
            valid: false,
            error: 'passwordMaxLength'
        };
    }
    return {
        valid: true,
        error: null
    };
}

/**
 * Validate OTP field
 * @returns ValidationResult with error key for translation
 */
export function validateOTPField(otp: string): ValidationResult {
    if (!otp || otp.trim().length === 0) {
        return {
            valid: false,
            error: 'otpRequired'
        };
    }
    if (otp.length > 10) {
        return {
            valid: false,
            error: 'otpMaxLength'
        };
    }
    return {
        valid: true,
        error: null
    };
}

/**
 * Validate token serial number
 * @returns ValidationResult with error key for translation
 */
export function validateTokenSerialNumber(tokenSerialNumber: string): ValidationResult {
    if (!tokenSerialNumber || tokenSerialNumber.trim().length === 0) {
        return {
            valid: false,
            error: 'tokenSerialNumberRequired'
        };
    }
    if (tokenSerialNumber.length > 10) {
        return {
            valid: false,
            error: 'tokenSerialNumberMaxLength'
        };
    }
    return {
        valid: true,
        error: null
    };
}

/**
 * Validate SMS OTP
 * @returns ValidationResult with error key for translation
 */
export function validateSmsOTP(smsOTP: string): ValidationResult {
    if (!smsOTP || smsOTP.trim().length === 0) {
        return {
            valid: false,
            error: 'smsOtpRequired'
        };
    }
    return {
        valid: true,
        error: null
    };
}

/**
 * Validate login fields (userId + password)
 */
export function validateLoginFields(userId: string, password: string): ValidationResult {
    const userIdValidation = validateUserIdField(userId);
    if (!userIdValidation.valid) {
        return userIdValidation;
    }

    const passwordValidation = validatePasswordField(password);
    if (!passwordValidation.valid) {
        return passwordValidation;
    }

    return {
        valid: true,
        error: null
    };
}

/**
 * Validate that two OTP fields match
 */
export function validateOTPMatch(otp1: string, otp2: string): ValidationResult {
    if (otp1 && otp2) {
        if (otp1 === otp2) {
            return {
                valid: true,
                error: null
            };
        } else {
            return {
                valid: false,
                error: 'otpMismatch'
            };
        }
    }
    return {
        valid: true,
        error: null
    };
}

/**
 * Validate new password requirements
 */
export function validateNewPassword(password: string): ValidationResult {
    if (!password || password.trim().length === 0) {
        return {
            valid: false,
            error: 'passwordRequired'
        };
    }
    
    if (password.length < 8) {
        return {
            valid: false,
            error: 'passwordMinLength'
        };
    }
    
    if (password.length > 14) {
        return {
            valid: false,
            error: 'passwordMaxLength'
        };
    }
    
    return {
        valid: true,
        error: null
    };
}

/**
 * Validate password confirmation
 */
export function validatePasswordConfirmation(password: string, confirmation: string): ValidationResult {
    if (password !== confirmation) {
        return {
            valid: false,
            error: 'passwordsDoNotMatch'
        };
    }
    return {
        valid: true,
        error: null
    };
}
