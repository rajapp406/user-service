import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { AccountLockStatusDto, UnlockAccountDto } from '../dto/account-lock.dto';

export interface IUserService {
  create(createUserDto: CreateUserDto): Promise<UserResponseDto>;
  findAll(): Promise<UserResponseDto[]>;
  findOne(id: string): Promise<UserResponseDto>;
  update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto>;
  remove(id: string): Promise<void>;
  findByEmail(email: string): Promise<UserResponseDto | null>;
  updateLastActivity(email: string): Promise<void>;
  
  // Account lock management methods
  incrementFailedLoginAttempts(email: string): Promise<void>;
  getAccountLockStatus(email: string): Promise<AccountLockStatusDto>;
  unlockAccount(unlockData: UnlockAccountDto): Promise<{ success: boolean; message: string }>;
  resetFailedLoginAttempts(email: string): Promise<void>;
  
  /**
   * Updates the last login timestamp for a user
   * @param userId The ID of the user
   * @returns Promise that resolves when the update is complete
   */
  updateLastLogin(userId: string): Promise<void>;
}
