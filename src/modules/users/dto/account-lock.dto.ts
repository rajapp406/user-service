import { ApiProperty } from '@nestjs/swagger';

export class AccountLockStatusDto {
  @ApiProperty({ description: 'Whether the account is currently locked' })
  isLocked: boolean;

  @ApiProperty({ description: 'Number of failed login attempts', default: 0 })
  failedLoginAttempts: number;

  @ApiProperty({ 
    description: 'When the account will be automatically unlocked',
    nullable: true,
    required: false 
  })
  lockedUntil?: Date | null;
}

export class UnlockAccountDto {
  @ApiProperty({ description: 'Email of the account to unlock', required: true })
  email: string;

  @ApiProperty({ 
    description: 'Whether to reset the failed login attempts counter',
    default: true,
    required: false 
  })
  resetAttempts?: boolean;
}
