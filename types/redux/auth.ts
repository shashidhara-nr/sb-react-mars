export interface UserIdentity {
  // Define fields as per your model
  [key: string]: any;
}

export interface AuthState {
  loggedIn: boolean;
  userList: UserIdentity[];
  selectedCustomerKey: string | number | null;
  digitalKey: string | null;
  credentials: any | null;
  error: string | null;
  loading: boolean;
  signinForm?: {
    username: string;
    password: string;
    isTokenUser?: boolean;
  };
  forgotPasswordForm?: {
    newPassword: string;
    confirmPassword: string;
  };
  registerTokenForm?: {
    tokenSerialNumber: string;
    tokenPassword: string;
  };
  newRegistrationForm?: {
    username: string;
    password: string;
    confirmPassword: string;
  };
  // Strong authentication (QR code / 2FA) state
  requiresStrongAuth?: boolean;
  strongAuthType?: 'QR_CODE' | 'PUSH_NOTIFICATION';
  strongAuthSessionId?: string;
  qrCodeData?: string;

  passwordExpired?: boolean;
  expiredPasswordUsername?: string;
  expiredPasswordPassword?: string;
}
