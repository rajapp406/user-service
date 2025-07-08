import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IUserRepository, FilterCondition } from '../interfaces/user-repository.interface';
import { User, UserRole } from '../entities/user.entity';

// Simple type for Prisma user with relations
type PrismaUser = any;

// Helper function to convert between UserRole and Prisma's UserRole
const toPrismaRole = (role: UserRole | undefined): string | undefined => {
  return role as string | undefined;
};

const fromPrismaRole = (role: string | undefined | null): UserRole => {
  return role as UserRole || UserRole.MEMBER;
};

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Helper function to safely check for Prisma errors
  private isPrismaError(error: unknown, code: string): boolean {
    return (
      error instanceof Error &&
      'code' in error &&
      typeof error.code === 'string' &&
      error.code === code
    );
  }

  // Convert Prisma user to domain user
  private toDomain(prismaUser: any): User | null {
    if (!prismaUser) return null;

    const user = new User();
    user.id = prismaUser.id;
    user.email = prismaUser.email;
    user.password = prismaUser.password;
    user.firstName = prismaUser.firstName;
    user.lastName = prismaUser.lastName || null;
    user.role = fromPrismaRole(prismaUser.role);
    user.isActive = prismaUser.isActive ?? true;
    user.emailVerified = prismaUser.emailVerified ?? false;
    user.lastLoginAt = prismaUser.lastLoginAt || null;
    user.lastActivityAt = prismaUser.lastActivityAt || null;
    user.failedLoginAttempts = prismaUser.failedLoginAttempts || 0;
    user.accountLockedUntil = prismaUser.accountLockedUntil || null;
    user.metadata = prismaUser.metadata || {};
    user.passwordChangedAt = prismaUser.passwordChangedAt || null;
    user.createdAt = prismaUser.createdAt || new Date();
    user.updatedAt = prismaUser.updatedAt || new Date();
    user.deletedAt = prismaUser.deletedAt || null;

    // Handle relations
    if (prismaUser.createdBy) {
      const createdByUser = this.toDomain(prismaUser.createdBy);
      if (createdByUser) {
        user.createdBy = createdByUser;
      }
    }
    if (prismaUser.updatedBy) {
      const updatedByUser = this.toDomain(prismaUser.updatedBy);
      if (updatedByUser) {
        user.updatedBy = updatedByUser;
      }
    }

    return user;
  }

  // Convert filter conditions to Prisma where clause
  private toPrismaWhere(conditions: FilterCondition<User>): any {
    if (!conditions) return undefined;
    
    const where: any = {};
    
    for (const [key, value] of Object.entries(conditions)) {
      if (value === undefined || value === null) continue;
      
      if (key === 'OR' || key === 'AND' || key === 'NOT') {
        where[key] = Array.isArray(value) 
          ? value.map((v: any) => this.toPrismaWhere(v as FilterCondition<User>)) 
          : this.toPrismaWhere(value as FilterCondition<User>);
      } else if (typeof value === 'object' && value !== null) {
        // Handle operators
        where[key] = {};
        for (const [op, opValue] of Object.entries(value as object)) {
          switch (op) {
            case 'equals':
              where[key].equals = opValue;
              break;
            case 'not':
              where[key].not = opValue;
              break;
            case 'in':
              where[key].in = opValue;
              break;
            case 'notIn':
              where[key].notIn = opValue;
              break;
            case 'lt':
              where[key].lt = opValue;
              break;
            case 'lte':
              where[key].lte = opValue;
              break;
            case 'gt':
              where[key].gt = opValue;
              break;
            case 'gte':
              where[key].gte = opValue;
              break;
            case 'contains':
              where[key].contains = opValue;
              break;
            case 'startsWith':
              where[key].startsWith = opValue;
              break;
            case 'endsWith':
              where[key].endsWith = opValue;
              break;
            case 'mode':
              where[key].mode = opValue;
              break;
            default:
              where[key] = opValue;
          }
        }
      } else {
        where[key] = value;
      }
    }
    
    return where;
  }
  
  // Convert domain user to Prisma user
  private toPrismaUser(user: Partial<User>): any {
    console.log('Converting user to Prisma format:', JSON.stringify(user, null, 2));
    
    // Ensure required fields have defaults
    const userWithDefaults = {
      firstName: '', // Required field with default empty string
      lastName: null,
      role: UserRole.MEMBER,
      isActive: true,
      emailVerified: false,
      ...user, // User-provided values will override defaults
    };
    
    const userData: any = {};
    
    // Map all user properties to Prisma format
    if (userWithDefaults.id !== undefined) userData.id = userWithDefaults.id;
    if (userWithDefaults.email !== undefined) userData.email = userWithDefaults.email;
    if (userWithDefaults.password !== undefined) userData.password = userWithDefaults.password;
    // Ensure firstName is a string (not the String constructor)
    userData.firstName = typeof userWithDefaults.firstName === 'string' ? userWithDefaults.firstName : '';
    if (typeof userWithDefaults.firstName !== 'string') {
      console.error('firstName is not a string! Value:', userWithDefaults.firstName);
    }
    if (userWithDefaults.lastName !== undefined) userData.lastName = userWithDefaults.lastName;
    userData.role = toPrismaRole(userWithDefaults.role);
    userData.isActive = userWithDefaults.isActive;
    userData.emailVerified = userWithDefaults.emailVerified;
    
    console.log('Converted user data:', JSON.stringify(userData, null, 2));
    if (user.lastLoginAt !== undefined) userData.lastLoginAt = user.lastLoginAt;
    if (user.lastActivityAt !== undefined) userData.lastActivityAt = user.lastActivityAt;
    if (user.failedLoginAttempts !== undefined) userData.failedLoginAttempts = user.failedLoginAttempts;
    if (user.accountLockedUntil !== undefined) userData.accountLockedUntil = user.accountLockedUntil;
    if (user.metadata !== undefined) userData.metadata = user.metadata;
    if (user.passwordChangedAt !== undefined) userData.passwordChangedAt = user.passwordChangedAt;
    if (user.createdAt !== undefined) userData.createdAt = user.createdAt;
    if (user.updatedAt !== undefined) userData.updatedAt = user.updatedAt;
    if (user.deletedAt !== undefined) userData.deletedAt = user.deletedAt;
    
    // Handle relations
    if ((user as any).createdById !== undefined) userData.createdById = (user as any).createdById;
    if ((user as any).updatedById !== undefined) userData.updatedById = (user as any).updatedById;
    if ((user as any).deletedById !== undefined) userData.deletedById = (user as any).deletedById;

    return userData;
  }

  // Create a new user
  async create(userData: Partial<User>): Promise<User> {
    console.log('Creating user with data:', JSON.stringify(userData, null, 2));
    
    const userWithDefaults = {
      ...userData,
      role: userData.role || UserRole.MEMBER,
      isActive: userData.isActive ?? true,
      emailVerified: userData.emailVerified ?? false,
    };
    
    console.log('User data with defaults:', JSON.stringify(userWithDefaults, null, 2));
    
    const prismaData = this.toPrismaUser(userWithDefaults);
    console.log('Prisma data before create:', JSON.stringify(prismaData, null, 2));
    
    try {
      const createdUser = await this.prisma.user.create({
        data: prismaData,
        include: {
          createdBy: true,
          updatedBy: true,
        },
      });
      
      console.log('Created user in database:', JSON.stringify(createdUser, null, 2));
      return this.toDomain(createdUser)!;
    } catch (error) {
      console.error('Error creating user in database:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        createdBy: true,
        updatedBy: true,
      },
    });
    return this.toDomain(user);
  }

  // Find a user by filter
  async findOne(filter: FilterCondition<User>): Promise<User | null> {
    const where = this.toPrismaWhere(filter);
    const user = await this.prisma.user.findFirst({
      where,
      include: {
        createdBy: true,
        updatedBy: true,
      },
    });
    return this.toDomain(user);
  }

  // Find users by filter
  async find(filter?: FilterCondition<User>): Promise<User[]> {
    try {
      const users = await this.prisma.user.findMany({
        where: filter as any,
        include: {
          createdBy: true,
          updatedBy: true,
        },
      });
      return users.map(user => this.toDomain(user)!).filter(Boolean) as User[];
    } catch (error) {
      console.error('Error in find:', error);
      throw error;
    }
  }

  // Update a user
  async update(id: string, data: Partial<User>): Promise<User> {
    // Convert domain model to Prisma data model
    const updateData = this.toPrismaUser(data);
    
    // Remove undefined values to avoid Prisma errors
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });
    
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: true,
        updatedBy: true,
      },
    });
    
    const domainUser = this.toDomain(updatedUser);
    if (!domainUser) {
      throw new Error('Failed to convert updated user to domain model');
    }
    return domainUser;
  }

  // Delete a user (hard delete)
  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.user.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      if (this.isPrismaError(error, 'P2025')) {
        // Record not found
        return false;
      }
      throw error;
    }
  }

  // Find a user by email
  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        include: {
          createdBy: true,
          updatedBy: true,
        },
      });
      return this.toDomain(user);
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  // Update last login timestamp
  async updateLastLogin(userId: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          lastLoginAt: new Date(),
          lastActivityAt: new Date(),
        },
      });
    } catch (error) {
      if (this.isPrismaError(error, 'P2025')) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      console.error('Error updating last login:', error);
      throw error;
    }
  }

  // Update user password
  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { 
          password: hashedPassword,
          passwordChangedAt: new Date(),
        },
      });
    } catch (error) {
      if (this.isPrismaError(error, 'P2025')) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      console.error('Error updating password:', error);
      throw error;
    }
  }

  // Soft delete a user
  async softDelete(id: string, deletedById: string): Promise<boolean> {
    try {
      await this.prisma.user.update({
        where: { id },
        data: {
          isActive: false,
          deletedAt: new Date(),
          // Using a type assertion here since we know the field exists in our schema
          ...(deletedById && { deletedBy: { connect: { id: deletedById } } }),
        },
      });
      return true;
    } catch (error) {
      if (this.isPrismaError(error, 'P2025')) {
        return false;
      }
      throw error;
    }
  }

  // Increment failed login attempts
  async incrementFailedLoginAttempts(userId: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          failedLoginAttempts: { increment: 1 },
        },
      });
    } catch (error) {
      if (this.isPrismaError(error, 'P2025')) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      console.error('Error incrementing failed login attempts:', error);
      throw error;
    }
  }

  // Reset failed login attempts
  async resetFailedLoginAttempts(userId: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          failedLoginAttempts: 0,
          accountLockedUntil: null,
        },
      });
    } catch (error) {
      if (this.isPrismaError(error, 'P2025')) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      console.error('Error resetting failed login attempts:', error);
      throw error;
    }
  }

  // Lock user account
  async lockAccount(userId: string, until: Date): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          accountLockedUntil: until,
        },
      });
    } catch (error) {
      if (this.isPrismaError(error, 'P2025')) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      console.error('Error locking account:', error);
      throw error;
    }
  }

  // Unlock user account
  async unlockAccount(userId: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          accountLockedUntil: null,
          failedLoginAttempts: 0,
        },
      });
    } catch (error) {
      if (this.isPrismaError(error, 'P2025')) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      console.error('Error unlocking account:', error);
      throw error;
    }
  }

  // Mark email as verified
  async markEmailAsVerified(userId: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { 
          emailVerified: true,
          // Using metadata to store email verification timestamp
          metadata: {
            set: { ...this.toDomain(await this.prisma.user.findUnique({ where: { id: userId } }))?.metadata, emailVerifiedAt: new Date() },
          },
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Error marking email as verified:', error);
      throw error;
    }
  }

  // Count users matching filter
  async count(filter: Partial<User> = {}): Promise<number> {
    try {
      return await this.prisma.user.count({ 
        where: filter as any 
      });
    } catch (error) {
      console.error('Error counting users:', error);
      throw error;
    }
  }

  // Check if user exists matching filter
  async exists(filter: Partial<User>): Promise<boolean> {
    try {
      const count = await this.prisma.user.count({ 
        where: filter as any,
        take: 1,
      });
      return count > 0;
    } catch (error) {
      console.error('Error checking if user exists:', error);
      throw error;
    }
  }
}
