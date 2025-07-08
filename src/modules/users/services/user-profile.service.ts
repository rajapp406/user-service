import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { 
  CreateUserProfileDto, 
  UpdateUserProfileDto, 
  UserProfileResponseDto,
  Gender,
  FitnessLevel,
  WorkoutFrequency,
  Goal,
  WorkoutType
} from '../dto/user-profile.dto';

// Helper function to convert string to enum
function toEnum<T extends Record<string, string>>(value: string, enumType: T): T[keyof T] | null {
  if (!value) return null;
  return Object.values(enumType).includes(value as any) ? value as T[keyof T] : null;
}

@Injectable()
export class UserProfileService {
  constructor(private prisma: PrismaService) {}

  async createProfile(userId: string, data: CreateUserProfileDto): Promise<UserProfileResponseDto> {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if profile already exists
    const existingProfile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      throw new Error('Profile already exists for this user');
    }

    const profile = await this.prisma.userProfile.create({
      data: {
        userId,
        ...data,
      },
    });

    return this.mapToResponseDto(profile);
  }

  async getProfile(userId: string): Promise<UserProfileResponseDto> {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException(`Profile not found for user with ID ${userId}`);
    }

    return this.mapToResponseDto(profile);
  }

  async updateProfile(userId: string, data: UpdateUserProfileDto): Promise<UserProfileResponseDto> {
    // Check if profile exists
    await this.getProfile(userId);

    const updatedProfile = await this.prisma.userProfile.update({
      where: { userId },
      data: {
        ...data,
      },
    });

    return this.mapToResponseDto(updatedProfile);
  }

  private mapToResponseDto(profile: any): UserProfileResponseDto {
    return {
      id: profile.id,
      userId: profile.userId,
      age: profile.age,
      gender: toEnum(profile.gender, Gender),
      fitnessLevel: toEnum(profile.fitnessLevel, FitnessLevel),
      goals: Array.isArray(profile.goals) 
        ? profile.goals.map((g: string) => toEnum(g, Goal) as Goal) 
        : [],
      preferredWorkouts: Array.isArray(profile.preferredWorkouts) 
        ? profile.preferredWorkouts.map((w: string) => toEnum(w, WorkoutType) as WorkoutType) 
        : [],
      workoutFrequency: toEnum(profile.workoutFrequency, WorkoutFrequency),
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  async deleteProfile(userId: string): Promise<void> {
    await this.prisma.userProfile.delete({
      where: { userId },
    });
  }
}
