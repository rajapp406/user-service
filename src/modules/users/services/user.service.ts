import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IUserService } from '../interfaces/user-service.interface';
import { IUserRepository } from '../interfaces/user-repository.interface';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class UserService implements IUserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly userRepository: IUserRepository) {}

  private async toResponseDto(user: User): Promise<UserResponseDto> {
    const { password, _id, ...userData } = user as any;
    return { ...userData, id: _id.toString() } as UserResponseDto;
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const user = await this.userRepository.create(createUserDto);
    return this.toResponseDto(user);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find({});
    return Promise.all(users.map(user => this.toResponseDto(user)));
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.toResponseDto(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    if (updateUserDto.email) {
      const existingUser = await this.userRepository.findByEmail(updateUserDto.email);
      if (existingUser && (existingUser as any)._id.toString() !== id) {
        throw new ConflictException('Email already in use');
      }
    }

    const updatedUser = await this.userRepository.update(id, updateUserDto);
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.toResponseDto(updatedUser);
  }

  async remove(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (!result) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async updateLastActivity(email: string): Promise<void> {
    try {
      const user = await this.userRepository.findByEmail(email);
      if (user) {
        const updatedUser = await this.userRepository.update((user as any)._id.toString(), { lastActivityAt: new Date() });
        if (!updatedUser) {
          throw new NotFoundException(`User with email ${email} not found`);
        }
      }
    } catch (error) {
      this.logger.error(`Error updating last activity for user ${email}:`, error);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<UserResponseDto | null> {
    const user = await this.userRepository.findByEmail(email);
    return user ? this.toResponseDto(user) : null;
  }

  async incrementFailedLoginAttempts(email: string): Promise<void> {
    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        this.logger.warn(`Attempted to increment failed login attempts for non-existent user: ${email}`);
        return;
      }

      const MAX_FAILED_ATTEMPTS = 5;
      const LOCKOUT_DURATION_MINUTES = 30;
      
      // Increment failed attempts
      const updatedFailedAttempts = (user.failedLoginAttempts || 0) + 1;
      
      // Check if account should be locked
      const shouldLockAccount = updatedFailedAttempts >= MAX_FAILED_ATTEMPTS;
      const lockUntil = shouldLockAccount 
        ? new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000) // Lock for 30 minutes
        : null;

      await this.userRepository.update((user as any)._id.toString(), {
        failedLoginAttempts: updatedFailedAttempts,
        accountLockedUntil: lockUntil,
        ...(shouldLockAccount && { isActive: false }) // Deactivate account if locked
      });

      if (shouldLockAccount) {
        this.logger.warn(`Account locked for user ${email} due to too many failed login attempts. Locked until: ${lockUntil}`);
      } else {
        this.logger.debug(`Incremented failed login attempts for user ${email}. Current attempts: ${updatedFailedAttempts}`);
      }
    } catch (error) {
      this.logger.error(`Error incrementing failed login attempts for user ${email}:`, error);
      throw error;
    }
  }

  async getAccountLockStatus(email: string) {
    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw new NotFoundException(`User with email ${email} not found`);
      }

      const now = new Date();
      const isLocked = user.accountLockedUntil ? user.accountLockedUntil > now : false;
      
      return {
        isLocked,
        failedLoginAttempts: user.failedLoginAttempts || 0,
        lockedUntil: isLocked ? user.accountLockedUntil : null,
        email: user.email
      };
    } catch (error) {
      this.logger.error(`Error getting account lock status for ${email}:`, error);
      throw error;
    }
  }

  async unlockAccount({ email, resetAttempts = true }: { email: string; resetAttempts?: boolean }) {
    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      const updateData: any = {
        accountLockedUntil: null,
        isActive: true
      };

      if (resetAttempts) {
        updateData.failedLoginAttempts = 0;
      }

      await this.userRepository.update((user as any)._id.toString(), updateData);
      
      this.logger.log(`Account unlocked for user: ${email}`);
      return { 
        success: true, 
        message: 'Account unlocked successfully',
        resetAttempts
      };
    } catch (error: any) {
      this.logger.error(`Error unlocking account for ${email}:`, error);
      return { 
        success: false, 
        message: 'Failed to unlock account',
        error: error?.message || 'Unknown error'
      };
    }
  }

  async resetFailedLoginAttempts(email: string): Promise<void> {
    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        this.logger.warn(`User not found with email: ${email}`);
        return;
      }
      
      await this.userRepository.update((user as any)._id.toString(), {
        failedLoginAttempts: 0,
        accountLockedUntil: null,
        isActive: true // Reactivate account if it was locked
      });

      this.logger.debug(`Reset failed login attempts for user ${email}`);
    } catch (error) {
      this.logger.error(`Error resetting failed login attempts for user ${email}:`, error);
      throw error;
    }
  }

  async updateLastLogin(userId: string): Promise<void> {
    try {
      await this.userRepository.updateLastLogin(userId);
      this.logger.debug(`Updated last login timestamp for user ${userId}`);
    } catch (error) {
      this.logger.error(`Error updating last login for user ${userId}:`, error);
      throw error;
    }
  }
}
