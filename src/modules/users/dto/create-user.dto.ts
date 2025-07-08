import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({
    description: 'User\'s first name',
    example: 'John',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiPropertyOptional({
    description: 'User\'s last name',
    example: 'Doe',
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    description: 'User\'s email address',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User\'s password (will be hashed before storage)',
    example: 'SecurePassword123!',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({
    description: 'User\'s role in the system',
    enum: UserRole,
    enumName: 'UserRole',
    default: UserRole.MEMBER,
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole = UserRole.MEMBER;

  @ApiPropertyOptional({
    description: 'Whether the user\'s email has been verified',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  emailVerified?: boolean = false;

  @ApiPropertyOptional({
    description: 'ID of the user who created this user (for admin-created users)',
  })
  @IsString()
  @IsOptional()
  createdById?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata for the user',
    type: 'object',
    additionalProperties: true,
    example: {
      preferences: { theme: 'dark', notifications: true },
      lastLoginIp: '192.168.1.1',
    },
  })
  @IsOptional()
  metadata?: Record<string, any>;
}
