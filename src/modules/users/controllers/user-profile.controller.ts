import { Controller, Get, Post, Body, Put, Delete, Param, HttpStatus } from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam,
  ApiBody,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse
} from '@nestjs/swagger';
import { UserProfileService } from '../services/user-profile.service';
import { CreateUserProfileDto, UpdateUserProfileDto, UserProfileResponseDto } from '../dto/user-profile.dto';

/**
 * Controller for managing user profiles
 */
@ApiTags('User Profiles')
@Controller('users/:userId/profile')
@ApiResponse({ 
  status: HttpStatus.UNAUTHORIZED, 
  description: 'Unauthorized - Authentication is required' 
})
@ApiResponse({ 
  status: HttpStatus.FORBIDDEN, 
  description: 'Forbidden - User does not have permission to access this resource' 
})
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create a new user profile',
    description: 'Creates a new profile for the specified user. Each user can have only one profile.'
  })
  @ApiParam({
    name: 'userId',
    description: 'ID of the user to create profile for',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiBody({
    type: CreateUserProfileDto,
    description: 'Profile data to create',
    examples: {
      minimal: {
        summary: 'Minimal profile',
        value: {
          fitnessLevel: 'BEGINNER',
          goals: ['weight_loss', 'strength']
        }
      },
      full: {
        summary: 'Full profile',
        value: {
          age: 30,
          gender: 'MALE',
          fitnessLevel: 'INTERMEDIATE',
          goals: ['weight_loss', 'strength', 'flexibility'],
          preferredWorkouts: ['yoga', 'weight_training'],
          workoutFrequency: '3-4 times a week'
        }
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Profile created successfully', 
    type: UserProfileResponseDto 
  })
  @ApiBadRequestResponse({ 
    description: 'Invalid input data' 
  })
  @ApiNotFoundResponse({ 
    description: 'User not found' 
  })
  @ApiConflictResponse({ 
    description: 'Profile already exists for this user' 
  })
  createProfile(
    @Param('userId') userId: string,
    @Body() createUserProfileDto: CreateUserProfileDto,
  ) {
    return this.userProfileService.createProfile(userId, createUserProfileDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get user profile',
    description: 'Retrieves the profile for the specified user.'
  })
  @ApiParam({
    name: 'userId',
    description: 'ID of the user to get profile for',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Profile found', 
    type: UserProfileResponseDto 
  })
  @ApiNotFoundResponse({ 
    description: 'Profile not found for the specified user' 
  })
  getProfile(@Param('userId') userId: string) {
    return this.userProfileService.getProfile(userId);
  }

  @Put()
  @ApiOperation({ 
    summary: 'Update user profile',
    description: 'Updates the profile for the specified user. Only provided fields will be updated.'
  })
  @ApiParam({
    name: 'userId',
    description: 'ID of the user to update profile for',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiBody({
    type: UpdateUserProfileDto,
    description: 'Profile data to update',
    examples: {
      partial: {
        summary: 'Partial update',
        value: {
          fitnessLevel: 'ADVANCED',
          goals: ['strength', 'muscle_gain']
        }
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Profile updated successfully', 
    type: UserProfileResponseDto 
  })
  @ApiBadRequestResponse({ 
    description: 'Invalid input data' 
  })
  @ApiNotFoundResponse({ 
    description: 'Profile not found for the specified user' 
  })
  updateProfile(
    @Param('userId') userId: string,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ) {
    return this.userProfileService.updateProfile(userId, updateUserProfileDto);
  }

  @Delete()
  @ApiOperation({ 
    summary: 'Delete user profile',
    description: 'Deletes the profile for the specified user. This action cannot be undone.'
  })
  @ApiParam({
    name: 'userId',
    description: 'ID of the user to delete profile for',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Profile deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Profile deleted successfully'
        }
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Profile not found for the specified user' 
  })
  async deleteProfile(@Param('userId') userId: string) {
    await this.userProfileService.deleteProfile(userId);
    return { message: 'Profile deleted successfully' };
  }
}
