import { 
  ConflictException, 
  Inject, 
  Injectable, 
  Logger, 
  NotFoundException 
} from '@nestjs/common';
import { IUserService } from '../interfaces/user-service.interface';
import { IUserRepository } from '../interfaces/user-repository.interface';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { User, UserRole } from '../entities/user.entity';
import { AccountLockStatusDto, UnlockAccountDto } from '../dto/account-lock.dto';
import { USER_REPOSITORY } from '../users.constants';

@Injectable()
export class UserService implements IUserService {
  private readonly logger = new Logger(UserService.name);
  
  constructor(@Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository) {}

  private toResponseDto(user: User): UserResponseDto {
    if (!user) {
      throw new Error('User cannot be null');
    }
    
    const { password, ...result } = user;
    return {
      ...result,
      createdBy: user.createdBy ? this.toResponseDto(user.createdBy) : null,
      updatedBy: user.updatedBy ? this.toResponseDto(user.updatedBy) : null,
    } as UserResponseDto;
  }
  
  private toResponseDtoOrNull(user: User | null): UserResponseDto | null {
    return user ? this.toResponseDto(user) : null;
  }

  async create(createUserDto: CreateUserDto, createdById?: string): Promise<UserResponseDto> {
    // Check if user with the same email already exists
    const existingUser = await this.userRepository.findOne({ email: createUserDto.email });
    if (existingUser) {
      // If createdById is provided, it's coming from gRPC, so return the existing user
      if (createdById) {
        return this.toResponseDto(existingUser);
      }
      throw new ConflictException('Email already in use');
    }

    // Create user data with required fields
    const userData: Partial<User> = {
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName ?? null,
      email: createUserDto.email,
      password: createUserDto.password,
      role: createUserDto.role ?? UserRole.MEMBER,
      isActive: true,
      emailVerified: createUserDto.emailVerified ?? false,
      metadata: createUserDto.metadata ?? null,
      createdById: createdById || null,
      updatedById: createdById || null,
    };

    const user = await this.userRepository.create(userData);
    return this.toResponseDto(user)!;
  }

  async findAll(filter: any = {}): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find({ ...filter, deletedAt: null });
    return users.map(user => this.toResponseDto(user)!);
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.toResponseDto(user);
  }
  
  async findByEmail(email: string): Promise<UserResponseDto | null> {
    const user = await this.userRepository.findByEmail(email);
    return user ? this.toResponseDto(user) : null;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({ 
        email: updateUserDto.email,
        NOT: {
          id: id
        }
      });
      
      if (existingUser) {
        throw new ConflictException('Email already in use');
      }
    }

    const updateData = {
      ...updateUserDto,
      ...(updateUserDto.password && { passwordChangedAt: new Date() }),
    };

    const updatedUser = await this.userRepository.update(id, updateData);
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.toResponseDto(updatedUser)!;
  }

  async remove(id: string, deletedById: string): Promise<void> {
    const result = await this.userRepository.softDelete(id, deletedById);
    if (!result) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }



  async updateLastLogin(userId: string): Promise<void> {
    await this.userRepository.update(userId, { lastLoginAt: new Date() });
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await this.userRepository.update(userId, { 
      password: hashedPassword,
      passwordChangedAt: new Date() 
    });
  }

  async lockAccount(userId: string, until: Date): Promise<void> {
    await this.userRepository.update(userId, { 
      accountLockedUntil: until,
      isActive: false 
    });
  }

  async unlockAccount({ email, resetAttempts = true }: UnlockAccountDto): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    const updateData = {
      accountLockedUntil: null,
      ...(resetAttempts && { failedLoginAttempts: 0 }),
      isActive: true
    };
 
    await this.userRepository.update(user.id, updateData);
    return { success: true, message: 'Account unlocked successfully' };
  }

  async getAccountLockStatus(email: string): Promise<AccountLockStatusDto> {
    const user = await this.userRepository.findOne({ email });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    const isLocked = user.accountLockedUntil ? user.accountLockedUntil > new Date() : false;
    return {
      isLocked,
      failedLoginAttempts: user.failedLoginAttempts || 0,
      lockedUntil: isLocked ? user.accountLockedUntil : null
    };
  }

  async incrementFailedLoginAttempts(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    
    const failedAttempts = (user.failedLoginAttempts || 0) + 1;
    await this.userRepository.update(user.id, { 
      failedLoginAttempts: failedAttempts 
    });
  }

  async resetFailedLoginAttempts(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    
    await this.userRepository.update(user.id, { 
      failedLoginAttempts: 0 
    });
  }

  async updateLastActivity(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    
    await this.userRepository.update(user.id, { 
      lastActivityAt: new Date() 
    });
  }
}
