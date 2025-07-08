import { User } from '../entities/user.entity';

export type FilterCondition<T> = {
  [P in keyof T]?: T[P] | { equals?: T[P]; not?: T[P]; in?: T[P][]; notIn?: T[P][]; };
} & {
  AND?: FilterCondition<T>[];
  OR?: FilterCondition<T>[];
  NOT?: FilterCondition<T> | FilterCondition<T>[];
};

export interface IUserRepository {
  create(user: Partial<User>): Promise<User>;
  findOne(filter: FilterCondition<User>): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  find(filter?: FilterCondition<User>): Promise<User[]>;
  update(id: string, update: Partial<User>): Promise<User | null>;
  delete(id: string): Promise<boolean>;
  
  // Custom methods
  findByEmail(email: string): Promise<User | null>;
  updateLastLogin(userId: string): Promise<void>;
  updatePassword(userId: string, hashedPassword: string): Promise<void>;
  
  // Soft delete
  softDelete(id: string, deletedById: string): Promise<boolean>;
  
  // Account lock/unlock
  incrementFailedLoginAttempts(userId: string): Promise<void>;
  resetFailedLoginAttempts(userId: string): Promise<void>;
  lockAccount(userId: string, until: Date): Promise<void>;
  unlockAccount(userId: string): Promise<void>;
  
  // Email verification
  markEmailAsVerified(userId: string): Promise<void>;
  
  // Count and exists helpers
  count(filter?: Partial<User>): Promise<number>;
  exists(filter: Partial<User>): Promise<boolean>;
}
