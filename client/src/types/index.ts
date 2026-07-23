export type Role = 'ADMIN' | 'MANAGER' | 'RESIDENTIAL';
export type ResourceType = 'WATER' | 'ELECTRICITY';
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AuditAction =
  | 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'LOGOUT' | 'REGISTER'
  | 'RECORD_CREATED' | 'ANOMALY_DETECTED' | 'ALERT_RESOLVED'
  | 'THRESHOLD_CONFIGURED' | 'COUNTER_CREATED' | 'COUNTER_UPDATED' | 'COUNTER_DELETED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}

export interface Meter {
  id: string;
  serialNumber: string;
  type: 'WATER' | 'ELECTRICITY';
  location: string;
  latitude?: number;
  longitude?: number;
  userId: string;
}

export interface ConsumptionRecord {
  id: string;
  meterId: string;
  value: number;
  recordDate: string;
  isAnomaly: boolean;
}

export interface ConsumptionStats {
  count: number;
  total: number;
  average: number | null;
}

export interface Alert {
  id: string;
  meterId: string;
  type: 'WATER' | 'ELECTRICITY';
  message: string;
  severity: AlertSeverity;
  isResolved: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: AuditAction;
  userId?: string;
  email?: string;
  ipAddress: string;
  details?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{ path: string; message: string; code: string }>;
}

export interface RecordResult {
  record: ConsumptionRecord;
  alert: string | null;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  role?: Role;
}

export interface CreateCounterInput {
  type: ResourceType;
  counterNumber: string;
  address: string;
}

export interface UpdateCounterInput {
  type?: ResourceType;
  counterNumber?: string;
  address?: string;
}

export interface RecordConsumptionInput {
  counterId: string;
  value: number;
  timestamp: string;
}

export interface ConfigureThresholdInput {
  counterId: string;
  threshold: number;
  alertType: ResourceType;
}

export interface AlertFilters {
  resolved?: string;
  type?: string;
  severity?: string;
}

export interface WaterPrice {
  threshold: number;
  rate: number;
}
