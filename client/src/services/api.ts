import axios, { AxiosError, type AxiosInstance } from 'axios';
import type {
  Alert, AlertFilters, ApiResponse, AuditLog, ConfigureThresholdInput,
  ConsumptionStats, CreateCounterInput, LoginInput, Meter, RecordConsumptionInput,
  RecordResult, RegisterInput, UpdateCounterInput, User,
} from '../types';

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ success: false; message: string }>) => {
    if (error.response?.status === 401) {
      const isAuthPage = typeof window !== 'undefined' &&
        (window.location.pathname === '/login' || window.location.pathname === '/register');
      if (!isAuthPage) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  register: (data: RegisterInput) => api.post<ApiResponse<User>>('/auth/register', data).then((r) => r.data),
  login: (data: LoginInput) => api.post<ApiResponse<{ token: string }>>('/auth/login', data).then((r) => r.data),
  logout: () => api.post<ApiResponse<null>>('/auth/logout').then((r) => r.data),
  me: () => api.get<ApiResponse<User>>('/auth/me').then((r) => r.data),
};

export const resourceApi = {
  getAll: () => api.get<ApiResponse<Meter[]>>('/resources').then((r) => r.data),
  getById: (id: string) => api.get<ApiResponse<Meter>>(`/resources/${id}`).then((r) => r.data),
  create: (data: CreateCounterInput) => api.post<ApiResponse<Meter>>('/resources', data).then((r) => r.data),
  update: (id: string, data: UpdateCounterInput) => api.patch<ApiResponse<Meter>>(`/resources/${id}`, data).then((r) => r.data),
  recordMetric: (data: RecordConsumptionInput) => api.post<ApiResponse<RecordResult>>('/resources/records', data).then((r) => r.data),
  getStats: (id: string) => api.get<ApiResponse<ConsumptionStats>>(`/resources/${id}/stats`).then((r) => r.data),
};

export const alertApi = {
  getAll: (filters?: AlertFilters) => api.get<ApiResponse<Alert[]>>('/alerts', { params: filters }).then((r) => r.data),
  resolve: (id: string) => api.patch<ApiResponse<Alert>>(`/alerts/${id}/resolve`).then((r) => r.data),
  setThreshold: (data: ConfigureThresholdInput) => api.post<ApiResponse<Alert>>('/alerts/thresholds', data).then((r) => r.data),
};

export const auditLogApi = {
  getAll: () => api.get<ApiResponse<AuditLog[]>>('/audit-logs').then((r) => r.data),
};

export default api;
