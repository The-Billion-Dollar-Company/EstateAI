import axios from 'axios';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: { message: string; code: string };
  meta?: Record<string, unknown>;
}

export const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
});

// Interceptor stub — auth token attach + refresh flow lands in the auth phase.
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(error),
);
