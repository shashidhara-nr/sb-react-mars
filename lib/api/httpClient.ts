
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { logout } from '../../store/slices/authSlice';
import { getSigninUrl } from '../utils/localeUtils';

let storeInstance: any = null;

export function initializeHttpClient(store: any) {
  storeInstance = store;
}

function getLocale() {
  if (typeof navigator !== 'undefined') {
    return navigator.language || 'en-US';
  }
  return 'en-US';
}

function getTimezone() {
  if (typeof Intl !== 'undefined') {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  }
  return '';
}

function getHeaders(extraHeaders: Record<string, string> = {}) {
  return {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': 'Sat, 01 Jan 2000 00:00:00 GMT',
    'Accept': 'application/json, text/plain, application/pdf',
    'locale': getLocale(),
    'timezone': getTimezone(),
    ...extraHeaders,
  };
}


const http = axios.create({
  baseURL: '/api/proxy',
  withCredentials: true,
  paramsSerializer: (params) => {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, String(item)));
      } else if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    return searchParams.toString();
  }
});

http.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

http.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const errorResponse = error.response?.data;

    if (error.response?.status === 401) {
      const isLoginEndpoint = error.config?.url?.includes('/login') || error.config?.url?.includes('/credentials');
      const isLogoutEndpoint = error.config?.url?.includes('/logout');
      const isUsersEndpoint = error.config?.url?.includes('/users');
      
      if (!isLoginEndpoint && !isLogoutEndpoint && !isUsersEndpoint) {
        if (storeInstance) {
          try {
            storeInstance.dispatch(logout());
            if (typeof window !== 'undefined') {
              window.location.href = getSigninUrl();
            }
          } catch (err) {
          }
        }
      }
    }
    
    if (errorResponse) {
      if (errorResponse.issues && Array.isArray(errorResponse.issues)) {
        const issue = errorResponse.issues[0];
        error.message = issue.message || 'An error occurred';
        error.issueLog = { issues: errorResponse.issues };
      }
    }
    
    return Promise.reject(error);
  }
);

function buildAxiosConfig(config?: AxiosRequestConfig, extraHeaders?: Record<string, string>) {
  return {
    ...config,
    headers: getHeaders({
      ...(config?.headers ? Object.fromEntries(Object.entries(config.headers)) : {}),
      ...(extraHeaders || {})
    }),
    withCredentials: true,
  };
}



export async function get<T>(url: string, config?: AxiosRequestConfig, extraHeaders?: Record<string, string>): Promise<T> {
  const finalConfig = buildAxiosConfig(config, extraHeaders);
  const response: AxiosResponse<T> = await http.get(url, finalConfig);
  return response.data;
}



export async function post<T>(url: string, data?: any, config?: AxiosRequestConfig, extraHeaders?: Record<string, string>): Promise<T> {
  const finalConfig = buildAxiosConfig(config, extraHeaders);
  const response: AxiosResponse<T> = await http.post(url, data, finalConfig);
  return response.data;
}



export async function put<T>(url: string, data?: any, config?: AxiosRequestConfig, extraHeaders?: Record<string, string>): Promise<T> {
  const finalConfig = buildAxiosConfig(config, extraHeaders);
  const response: AxiosResponse<T> = await http.put(url, data, finalConfig);
  return response.data;
}



export async function del<T>(url: string, config?: AxiosRequestConfig, extraHeaders?: Record<string, string>): Promise<T> {
  const finalConfig = buildAxiosConfig(config, extraHeaders);
  const response: AxiosResponse<T> = await http.delete(url, finalConfig);
  return response.data;
}