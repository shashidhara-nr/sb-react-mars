
import { get, post, put, del } from './httpClient';
import { User } from '../../types/api/user';
import { API_ROUTES } from '../utils/apiRoute';

export async function getUser(userId: string): Promise<User> {
  return get<User>(API_ROUTES.USER(userId));
}

export async function createUser(data: Partial<User>): Promise<User> {
  return post<User>(API_ROUTES.USERS, data);
}

export async function updateUser(userId: string, data: Partial<User>): Promise<User> {
  return put<User>(API_ROUTES.USER(userId), data);
}

export async function deleteUser(userId: string): Promise<void> {
  return del<void>(API_ROUTES.USER(userId));
}
