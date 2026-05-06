export interface CredentialState {
  credentialName: string;
  credentialState: 'A' | 'T' | 'F' | 'R' | 'M';
  strongAuthState?: {
    strongAuth: 0 | 2;
    deviceRegistered: boolean;
  };
}

export interface CredentialsResponse {
  credentialStates: CredentialState[];
  passwordResetAllowed: boolean;
  [key: string]: any;
}

export interface LoginResponse {
  digitalKey: string;
  userList?: any[];
  [key: string]: any;
}

export interface User {
  customerKey: string;
  userKey: string;
  [key: string]: any;
}

export interface SigninFormState {
  username: string;
  password: string;
  otp: string;
}

export interface SigninAuthState {
  step: 1 | 2 | 'qr' | 'otp';
  loading: boolean;
  attempting: boolean;
  showRetry: boolean;
}

export interface SigninCredentialState {
  hasTokenLogin: boolean;
  vascoState: string;
  strongAuth: 0 | 2;
  deviceRegistered: boolean;
  hasMultipleCredentials: boolean;
  showOTP: boolean;
  passwordResetAllowed: boolean;
}

export interface SigninAuthData {
  qrCodeData: string;
  sessionId: string;
  qrTimeout: number;
  otpLength: number;
}

export interface SnackbarState {
  visible: boolean;
  message: string;
  theme: 'info' | 'warning' | 'success';
}

export interface StartOOBAuthResponse {
  success: boolean;
  message?: string;
  modeResult?: {
    qrCode?: {
      qrImage: string;
    };
  };
  oobStatusHandle?: string;
  lifetimeMillis?: number;
  [key: string]: any;
}

export interface CompleteQRLoginResponse {
  success: boolean;
  message?: string;
  [key: string]: any;
}
