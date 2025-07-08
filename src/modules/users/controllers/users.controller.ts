import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Inject } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/auth/guards/roles.guard';
import { Roles } from '../../../core/auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { IUserService } from '../interfaces/user-service.interface';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { AccountLockStatusDto, UnlockAccountDto } from '../dto/account-lock.dto';
import { USER_SERVICE } from '../users.constants';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(
    @Inject(USER_SERVICE)
    private readonly userService: IUserService
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.userService.create(createUserDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Return all users', type: [UserResponseDto] })
  async findAll(): Promise<UserResponseDto[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'Return user by ID', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.userService.remove(id);
  }

  @Get('account-status/:email')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get account lock status' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns the account lock status',
    type: AccountLockStatusDto
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getAccountStatus(@Param('email') email: string): Promise<AccountLockStatusDto> {
    return this.userService.getAccountLockStatus(email);
  }

  @Post('unlock-account')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Unlock a locked account' })
  @ApiResponse({ 
    status: 200, 
    description: 'Account unlocked successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        resetAttempts: { type: 'boolean', nullable: true }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async unlockAccount(@Body() unlockData: UnlockAccountDto): Promise<{ success: boolean; message: string; resetAttempts?: boolean }> {
    return this.userService.unlockAccount(unlockData);
  }

  @Post('reset-attempts/:email')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Reset failed login attempts counter' })
  @ApiResponse({ status: 200, description: 'Failed attempts counter reset' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async resetFailedAttempts(@Param('email') email: string): Promise<void> {
    return this.userService.resetFailedLoginAttempts(email);
  }
}
