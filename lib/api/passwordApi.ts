import { put } from './httpClient';
import { API_ROUTES } from '../utils/apiRoute';
export interface UpdateExpiredPasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface UpdateExpiredPasswordResponse {
  success: boolean;
  message?: string;
}

export const updateExpiredPassword = async (
  payload: UpdateExpiredPasswordRequest
): Promise<UpdateExpiredPasswordResponse> => {
  try {
    const response = await put<UpdateExpiredPasswordResponse>(
      API_ROUTES.UPDATE_EXPIRED_PASSWORD,
      JSON.stringify(payload)
    );
    
    return {
      success: true,
      message: response?.message || 'Password updated successfully'
    };
  } catch (error: any) {
    let errorMessage = 'Failed to update password';
    
    if (error.response?.data?.issues) {
      const issues = error.response.data.issues;
      if (issues.length > 0) {
        errorMessage = issues[0].message || errorMessage;
      }
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};