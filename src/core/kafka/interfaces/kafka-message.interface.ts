import { UserRole } from '../../../modules/users/entities/user.entity';

export enum KafkaTopics {
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  AUTH_ATTEMPT = 'auth.attempt',
  AUTH_SUCCESS = 'auth.success',
  AUTH_FAILED = 'auth.failed',
}

export interface BaseKafkaMessage<T> {
  eventId: string;
  timestamp: string;
  version: string;
  payload: T;
}

export interface UserCreatedPayload {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface UserUpdatedPayload extends UserCreatedPayload {
  updatedAt: string;
}

export interface UserDeletedPayload {
  id: string;
  deletedAt: string;
}

export interface AuthAttemptPayload {
  email: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface AuthSuccessPayload {
  userId: string;
  email: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface AuthFailedPayload {
  email: string;
  reason: string;
  timestamp: string;
  metadata?: Record<string, any>;
}
