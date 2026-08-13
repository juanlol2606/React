import { eShopApi } from '@/api/eShopApi';
import type { AuthResponse } from '../interfaces/auth.response';

export const checkAuthAction = async (): Promise<AuthResponse> => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');

  try {
    const { data } = await eShopApi.get<AuthResponse>('/auth/check-status');

    return data;
  } catch (error) {
    console.error(error);
    throw new Error('Token expired or not valid');
  }
};
