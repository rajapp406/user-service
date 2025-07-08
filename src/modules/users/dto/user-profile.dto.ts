import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString, IsEnum, ArrayMinSize, MaxLength, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY'
}

export enum FitnessLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT'
}

export enum WorkoutFrequency {
  NEVER = 'NEVER',
  RARELY = 'RARELY',
  ONCE_A_WEEK = 'ONCE_A_WEEK',
  TWICE_A_WEEK = 'TWICE_A_WEEK',
  THREE_TIMES_A_WEEK = 'THREE_TIMES_A_WEEK',
  FOUR_TIMES_A_WEEK = 'FOUR_TIMES_A_WEEK',
  FIVE_OR_MORE = 'FIVE_OR_MORE',
  DAILY = 'DAILY'
}

export enum Goal {
  WEIGHT_LOSS = 'WEIGHT_LOSS',
  MUSCLE_GAIN = 'MUSCLE_GAIN',
  STRENGTH = 'STRENGTH',
  ENDURANCE = 'ENDURANCE',
  FLEXIBILITY = 'FLEXIBILITY',
  GENERAL_FITNESS = 'GENERAL_FITNESS',
  EVENT_TRAINING = 'EVENT_TRAINING',
  REHABILITATION = 'REHABILITATION'
}

export enum WorkoutType {
  STRENGTH_TRAINING = 'STRENGTH_TRAINING',
  CARDIO = 'CARDIO',
  HIIT = 'HIIT',
  YOGA = 'YOGA',
  PILATES = 'PILATES',
  CROSSFIT = 'CROSSFIT',
  CYCLING = 'CYCLING',
  RUNNING = 'RUNNING',
  SWIMMING = 'SWIMMING',
  MARTIAL_ARTS = 'MARTIAL_ARTS',
  DANCE = 'DANCE',
  HOME_WORKOUT = 'HOME_WORKOUT'
}

export class CreateUserProfileDto {
  @ApiPropertyOptional({ 
    description: 'Age of the user',
    minimum: 13,
    maximum: 120,
    example: 28,
    nullable: true
  })
  @IsNumber()
  @Min(13, { message: 'User must be at least 13 years old' })
  @Max(120, { message: 'Please enter a valid age' })
  @IsOptional()
  @Transform(({ value }) => (value === null ? undefined : value))
  age?: number | null;

  @ApiPropertyOptional({
    description: 'Gender identity of the user',
    enum: Gender,
    example: Gender.MALE,
    nullable: true
  })
  @IsEnum(Gender, { message: 'Invalid gender value' })
  @IsOptional()
  @Transform(({ value }) => (value === null ? undefined : value))
  gender?: Gender | null;

  @ApiPropertyOptional({
    description: 'Current fitness level of the user',
    enum: FitnessLevel,
    example: FitnessLevel.INTERMEDIATE,
    nullable: true
  })
  @IsEnum(FitnessLevel, { message: 'Invalid fitness level' })
  @IsOptional()
  @Transform(({ value }) => (value === null ? undefined : value))
  fitnessLevel?: FitnessLevel | null;

  @ApiPropertyOptional({
    description: 'User\'s fitness goals',
    type: [String],
    enum: Goal,
    isArray: true,
    example: [Goal.WEIGHT_LOSS, Goal.STRENGTH],
    nullable: true
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one goal is required' })
  @IsEnum(Goal, { each: true, message: 'Each goal must be a valid fitness goal' })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : []))
  goals?: Goal[];

  @ApiPropertyOptional({
    description: 'Types of workouts the user prefers',
    type: [String],
    enum: WorkoutType,
    isArray: true,
    example: [WorkoutType.STRENGTH_TRAINING, WorkoutType.YOGA],
    nullable: true
  })
  @IsArray()
  @IsEnum(WorkoutType, { each: true, message: 'Each workout type must be valid' })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : []))
  preferredWorkouts?: WorkoutType[];

  @ApiPropertyOptional({
    description: 'How often the user works out',
    enum: WorkoutFrequency,
    example: WorkoutFrequency.THREE_TIMES_A_WEEK,
    nullable: true
  })
  @IsEnum(WorkoutFrequency, { message: 'Invalid workout frequency' })
  @IsOptional()
  @Transform(({ value }) => (value === null ? undefined : value))
  workoutFrequency?: WorkoutFrequency | null;
}

export class UpdateUserProfileDto extends CreateUserProfileDto {
  @ApiPropertyOptional({
    description: 'Indicates if the user wants to clear their profile picture',
    default: false
  })
  @IsOptional()
  clearProfilePicture?: boolean;
}

export class UserProfileResponseDto extends CreateUserProfileDto {
  @ApiProperty({
    description: 'Unique identifier for the profile',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'ID of the user this profile belongs to',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  userId: string;

  @ApiProperty({
    description: 'URL to the user\'s profile picture',
    nullable: true,
    example: 'https://example.com/profiles/123e4567-e89b-12d3-a456-426614174000.jpg'
  })
  profilePictureUrl?: string;

  @ApiProperty({
    description: 'Date and time when the profile was created',
    type: Date,
    example: '2023-01-01T00:00:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date and time when the profile was last updated',
    type: Date,
    example: '2023-01-02T12:00:00.000Z'
  })
  updatedAt: Date;
}
