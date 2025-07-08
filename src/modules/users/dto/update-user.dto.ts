import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  // Note: Password should be hashed by the Auth Service
  password?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  emailVerified?: boolean;

  @IsOptional()
  lastLoginAt?: Date;

  @IsOptional()
  lastActivityAt?: Date;

  @IsOptional()
  failedLoginAttempts?: number;

  @IsOptional()
  accountLockedUntil?: Date | null;

  @IsOptional()
  metadata?: Record<string, any>;

  @IsString()
  @IsOptional()
  createdById?: string;
}
