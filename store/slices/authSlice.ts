import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { get, post } from '../../lib/api/httpClient';
import { API_ROUTES } from '../../lib/utils/apiRoute';
import { authStorage } from '../../lib/utils/authStorage';
import { getLoginErrorMessage } from '../../lib/utils/authValidation';
import { fetchUserList as fetchUserListAPI, fetchUserByKey as fetchUserByKeyAPI, type UserData } from '../../lib/api/authApi';
import { clearSessionCookies } from '../../lib/utils/cookieUtils';
import type { AuthState } from 'types/redux/auth';

const initialState: AuthState = {
  loggedIn: false,
  userList: [],
  selectedCustomerKey: null,
  digitalKey: null,
  credentials: null,
  error: null,
  loading: false,
  signinForm: undefined,
  forgotPasswordForm: undefined,
  registerTokenForm: undefined,
  requiresStrongAuth: false,
  strongAuthType: undefined,
  strongAuthSessionId: undefined,
  qrCodeData: undefined,
  passwordExpired: false,
  expiredPasswordUsername: undefined,
  expiredPasswordPassword: undefined,
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ userName, password }: { userName: string; password: string }, { rejectWithValue, signal }) => {
    try {
      const loginUrl = API_ROUTES.LOGIN(userName);

      const loginRes = await post<any>(
        loginUrl,
        JSON.stringify({ password })
      );
      if (!loginRes || (typeof loginRes === 'string' && loginRes.trim() === '')) {
        return {
          digitalKey: null,
          userList: [], 
          loggedIn: true,
          credentials: null
        };
      }

      let parsedRes = loginRes;
      if (typeof loginRes === 'string') {
        try {
          parsedRes = JSON.parse(loginRes);
        } catch (e) {
          return {
            digitalKey: null,
            userList: [],
            loggedIn: true,
            credentials: null
          };
        }
      }
      
      return {
        digitalKey: parsedRes?.digitalKey || null,
        userList: parsedRes?.userList || [],
        loggedIn: true,
        credentials: null
      };
    } catch (error: any) {
      const loginError = getLoginErrorMessage(error);
      return rejectWithValue(loginError);
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    const logoutUrl = API_ROUTES.LOGOUT;
    await post<any>(logoutUrl);
    clearSessionCookies();
    return true;
  } catch {
    return true;
  }
});

export const fetchUserList = createAsyncThunk(
  'auth/fetchUserList',
  async (_, { rejectWithValue }) => {
    try {
      const userList = await fetchUserListAPI();
      return userList;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user list');
    }
  }
);

export const fetchUserByKey = createAsyncThunk(
  'auth/fetchUserByKey',
  async (userKey: string | number, { rejectWithValue }) => {
    try {
      const user = await fetchUserByKeyAPI(userKey);
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user details');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetAuth: (state) => {
      state.loggedIn = false;
      state.userList = [];
      state.digitalKey = null;
      state.credentials = null;
      state.error = null;
      state.loading = false;
      state.requiresStrongAuth = false;
      state.strongAuthType = undefined;
      state.strongAuthSessionId = undefined;
      state.qrCodeData = undefined;
    },
    restoreFromStorage: (state, action: any) => {
      state.loggedIn = action.payload.loggedIn;
      state.digitalKey = action.payload.digitalKey;
      state.userList = action.payload.userList;
    },
    updateSigninForm: (state, action: { payload: { username?: string; password?: string; isTokenUser?: boolean } }) => {
      state.signinForm = { ...state.signinForm, ...action.payload } as any;
    },
    updateRegistrationForm: (state, action: { payload: { username?: string; password?: string, confirmPassword?: string } }) => {
      state.newRegistrationForm = { ...state.newRegistrationForm, ...action.payload } as any;
    },
    clearSigninForm: (state) => {
      state.signinForm = undefined;
    },
    clearRegistrationForm: (state) => {
      state.newRegistrationForm = undefined;
    },
    updateForgotPasswordForm: (state, action: { payload: { newPassword?: string; confirmPassword?: string } }) => {
      state.forgotPasswordForm = { ...state.forgotPasswordForm, ...action.payload } as any;
    },
    clearForgotPasswordForm: (state) => {
      state.forgotPasswordForm = undefined;
    },
    updateRegisterTokenForm: (state, action: { payload: { tokenSerialNumber?: string; tokenPassword?: string } }) => {
      state.registerTokenForm = { ...state.registerTokenForm, ...action.payload } as any;
    },
    clearRegisterTokenForm: (state) => {
      state.registerTokenForm = undefined;
    },

    setStrongAuthRequired: (state, action: { 
      payload: { 
        sessionId: string; 
        qrCodeData?: string; 
        strongAuthType: 'QR_CODE' | 'PUSH_NOTIFICATION' 
      } 
    }) => {
      state.requiresStrongAuth = true;
      state.strongAuthType = action.payload.strongAuthType;
      state.strongAuthSessionId = action.payload.sessionId;
      state.qrCodeData = action.payload.qrCodeData;
    },
    clearStrongAuth: (state) => {
      state.requiresStrongAuth = false;
      state.strongAuthType = undefined;
      state.strongAuthSessionId = undefined;
      state.qrCodeData = undefined;
    },
    setAuthSuccess: (state, action: { 
      payload: { 
        digitalKey: string; 
        userList?: any[]; 
        loggedIn: boolean 
      } 
    }) => {
      state.loggedIn = action.payload.loggedIn;
      state.digitalKey = action.payload.digitalKey;
      state.userList = action.payload.userList || [];
      state.requiresStrongAuth = false;
      state.strongAuthType = undefined;
      state.strongAuthSessionId = undefined;
      state.qrCodeData = undefined;
      state.loading = false;
      state.error = null;
      authStorage.save({
        loggedIn: true,
        digitalKey: action.payload.digitalKey,
        userList: action.payload.userList || [],
      });
    },
    setSelectedCustomerKey: (state, action: { payload: string | number | null }) => {
      state.selectedCustomerKey = action.payload;
    },
    setExpiredPassword: (state, action: { payload: { username: string; password: string } }) => {
      state.passwordExpired = true;
      state.expiredPasswordUsername = action.payload.username;
      state.expiredPasswordPassword = action.payload.password;
    },
    clearExpiredPassword: (state) => {
      state.passwordExpired = false;
      state.expiredPasswordUsername = undefined;
      state.expiredPasswordPassword = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.loggedIn = true;
        state.digitalKey = action.payload.digitalKey;
        state.userList = action.payload.userList;
        state.credentials = action.payload.credentials;
        authStorage.save({
          loggedIn: true,
          digitalKey: action.payload.digitalKey,
          userList: action.payload.userList,
        });
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.loggedIn = false;
        state.digitalKey = null;
        state.userList = [];
        state.error = action.payload as string;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loggedIn = false;
        state.userList = [];
        state.digitalKey = null;
        state.credentials = null;
        state.error = null;
        state.loading = false;
        authStorage.clear();
      })
      .addCase(fetchUserList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserList.fulfilled, (state, action) => {
        state.loading = false;
        state.userList = action.payload;
      })
      .addCase(fetchUserList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.userList = [];
      })
      .addCase(fetchUserByKey.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserByKey.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(fetchUserByKey.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
  },
});

export const { 
  clearError, 
  resetAuth, 
  restoreFromStorage,
  updateSigninForm,
  clearSigninForm,
  updateForgotPasswordForm,
  clearForgotPasswordForm,
  updateRegisterTokenForm,
  clearRegisterTokenForm,
  setStrongAuthRequired,
  clearStrongAuth,
  setAuthSuccess,
  updateRegistrationForm,
  clearRegistrationForm,
  setSelectedCustomerKey,
  setExpiredPassword,
  clearExpiredPassword
} = authSlice.actions;
export const authReducer = authSlice.reducer;