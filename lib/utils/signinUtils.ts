import { AppDispatch } from 'store';
import { setSelectedCustomerKey, fetchUserByKey, setExpiredPassword } from 'store/slices/authSlice';
import { getSigninSubpathUrl } from './localeUtils';

// Translation keys for signin error messages
// These should be used with t() function in components
export const SIGNIN_ERROR_KEYS = {
  CREDENTIALS_LOCKED: 'credentialsLocked',
  USERNAME_VALIDATION_FAILED: 'usernameValidationFailed',
  PASSWORD_REQUIRED: 'passwordRequired',
  OTP_REQUIRED: 'otpRequired',
  LOGIN_FAILED: 'loginFailed',
  OTP_FAILED: 'otpFailed',
  QR_GENERATION_FAILED: 'qrGenerationFailed',
  USER_LIST_FETCH_FAILED: 'userListFetchFailed',
  USER_LIST_ERROR: 'userListError',
  QR_LOGIN_FAILED: 'qrLoginFailed',
  OTP_LOGIN_FAILED: 'otpLoginFailed',
  OTP_RESEND_FAILED: 'otpResendFailed',
  OTP_RESEND_SUCCESS: 'otpResendSuccess',
  LOGIN_SUCCESS: 'loginSuccess',
  PASSWORD_RESET_SUCCESS: 'passwordResetSuccess',
  PASSWORD_RESET_FAILED: 'passwordResetFailed',
  TOKEN_REGISTRATION_SUCCESS: 'tokenRegistrationSuccess',
  LOGIN_CANCELLED: 'loginCancelled',
} as const;

export const CREDENTIAL_STATES = {
  TO_BE: 'T',
  FIRST_ACCESS: 'F',
  ACTIVE: 'A',
  RESYNC: 'R',
  BACKUP_TEMP: 'M',
} as const;

export const STRONG_AUTH_VALUES = {
  FIRST_TIME: 0,
  DEVICE_REGISTRATION: 2,
} as const;

export const DEBOUNCE_DELAY = 1000;
export const ERROR_RECOVERY_DELAY = 3000;
export const QR_DEFAULT_TIMEOUT = 180;

export interface RouteUserParams {
  users: any[];
  router: any;
  dispatch: AppDispatch;
  showSnackbar: (message: string, theme: 'info' | 'warning' | 'success') => void;
  pathname: string;
  loginSuccessMessage: string; // translated message
}

export interface PasswordExpiredErrorParams {
  username: string;
  password: string;
  router: any;
  dispatch: AppDispatch;
  pathname: string;
}

export const routeUserAfterLogin = async ({
  users,
  router,
  dispatch,
  showSnackbar,
  pathname,
  loginSuccessMessage,
}: RouteUserParams): Promise<void> => {
  if (!users || users.length === 0) {
    showSnackbar(loginSuccessMessage, 'success');
    router.push('/setup-and-admin/beneficiary');
    return;
  }

  if (users.length > 1) {
    router.push(getSigninSubpathUrl(pathname, 'user-accounts'));
    return;
  }

  showSnackbar(loginSuccessMessage, 'success');
  dispatch(setSelectedCustomerKey(users[0].customerKey));
  await dispatch(fetchUserByKey(users[0].userKey));
  router.push('/setup-and-admin/beneficiary');
};

export const handlePasswordExpiredError = async ({
  username,
  password,
  router,
  dispatch,
  pathname,
}: PasswordExpiredErrorParams): Promise<void> => {
  dispatch(setExpiredPassword({ username, password }));
  router.push(getSigninSubpathUrl(pathname, 'expired-password'));
};

export const isPasswordExpiredError = (loginError: string | null, errorCodeHeader?: string): boolean => {
  return (
    loginError === 'PASSWORD_EXPIRED' ||
    errorCodeHeader === 'login.error.PasswordExpired' ||
    errorCodeHeader === 'login.error.PasswordExpired;'
  );
};
