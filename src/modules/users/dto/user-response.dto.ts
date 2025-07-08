import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class UserResponseDto {
  @ApiProperty({ description: 'Unique identifier of the user' })
  id: string;

  @ApiProperty({ description: 'User\'s first name' })
  firstName: string;

  @ApiProperty({ description: 'User\'s last name', required: false })
  lastName?: string;

  @ApiProperty({ description: 'User\'s email address' })
  email: string;

  @ApiProperty({ 
    enum: UserRole, 
    enumName: 'UserRole',
    description: 'User role (admin, trainer, member)'
  })
  role: UserRole;

  @ApiProperty({ description: 'Whether the user account is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Date when the user was created' })
  createdAt: Date;

  @ApiProperty({ description: 'Date when the user was last updated' })
  updatedAt: Date;

  @ApiProperty({ 
    description: 'Date when the user was last logged in',
    required: false 
  })
  lastLoginAt?: Date;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
