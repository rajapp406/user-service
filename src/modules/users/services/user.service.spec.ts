import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { UserService } from './user.service';
import { IUserRepository } from '../interfaces/user-repository.interface';
import { User, UserRole } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

// Create a complete mock implementation of IUserRepository
const mockUserRepository: jest.Mocked<IUserRepository> = {
  findOne: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  markEmailAsVerified: jest.fn(),
  updateLastLogin: jest.fn(),
  updatePassword: jest.fn(),
  softDelete: jest.fn(),
  incrementFailedLoginAttempts: jest.fn(),
  resetFailedLoginAttempts: jest.fn(),
  lockAccount: jest.fn(),
  unlockAccount: jest.fn(),
  count: jest.fn(),
  exists: jest.fn(),
};

describe('UserService', () => {
  let service: UserService;
  
  const mockUser: User = {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    role: UserRole.MEMBER,
    isActive: true,
    emailVerified: false,
    failedLoginAttempts: 0,
    lastLoginAt: null,
    lastActivityAt: null,
    accountLockedUntil: null,
    metadata: null,
    passwordChangedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    createdById: null,
    updatedById: null,
    createdBy: null,
    updatedBy: null,
    deletedBy: null,
  };

  const currentUserId = faker.string.uuid();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: 'IUserRepository',
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup default mock implementations
    mockUserRepository.find.mockResolvedValue([]);
    mockUserRepository.findOne.mockResolvedValue(null);
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.exists.mockResolvedValue(false);
    mockUserRepository.count.mockResolvedValue(0);
    mockUserRepository.softDelete.mockResolvedValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        email: faker.internet.email(),
        password: faker.internet.password(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        role: UserRole.USER,
      };

      mockUserRepository.findOne.mockResolvedValueOnce(null);
      mockUserRepository.create.mockResolvedValueOnce({
        ...mockUser,
        ...createUserDto,
      });

      const result = await service.create(createUserDto, mockUser.id);
      
      expect(result).toBeDefined();
      if (result) {
        expect(result.email).toBe(createUserDto.email);
        expect(result.firstName).toBe(createUserDto.firstName);
        expect(result.lastName).toBe(createUserDto.lastName);
      }
    });

    it('should throw ConflictException if email already exists', async () => {
      const createUserDto = {
        email: 'existing@example.com',
        password: faker.internet.password(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      };

mockUserRepository.findOne.mockResolvedValueOnce({
        ...mockUser,
        email: 'existing@example.com',
      });

      await expect(service.create(createUserDto, mockUser.id)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(mockUser);

      const result = await service.findOne(mockUser.id);
      
      expect(result).toBeDefined();
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ id: mockUser.id });
      if (result) {
        expect(result.id).toBe(mockUser.id);
      }
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'User',
      };

mockUserRepository.findOne.mockResolvedValueOnce(mockUser);
      mockUserRepository.update.mockResolvedValueOnce({
        ...mockUser,
        ...updateData,
      });

      const updatedUser = {
        ...mockUser,
        ...updateData,
        updatedById: currentUserId,
        updatedAt: new Date(),
      };
      mockUserRepository.update.mockResolvedValueOnce(updatedUser);

const result = await service.update(mockUser.id, updateData);
      
      expect(result).toBeDefined();
      if (result) {
        expect(result.firstName).toBe(updateData.firstName);
        expect(result.lastName).toBe(updateData.lastName);
      }
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(null);

      await expect(
        service.update('non-existent-id', {} as UpdateUserDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete a user', async () => {
mockUserRepository.findOne.mockResolvedValueOnce(mockUser);
      mockUserRepository.softDelete.mockResolvedValueOnce(true);

      await service.remove(mockUser.id, currentUserId);
      
      expect(mockUserRepository.softDelete).toHaveBeenCalledWith(mockUser.id, currentUserId);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(null);

await expect(service.remove('non-existent-id', currentUserId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
const users = [mockUser, { ...mockUser, id: '2', email: 'test2@example.com' }];
      mockUserRepository.find.mockResolvedValueOnce(users);

      const result = await service.findAll();
      
      expect(result).toHaveLength(2);
      expect(mockUserRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
mockUserRepository.findOne.mockResolvedValueOnce(mockUser);

      const result = await service.findOne(mockUser.id);
      
      expect(result).toBeDefined();
      expect(result?.id).toBe(mockUser.id);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ id: mockUser.id });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
const email = 'test@example.com';
      mockUserRepository.findByEmail.mockResolvedValueOnce(mockUser);

      const result = await service.findByEmail(email);
      
      expect(result).toBeDefined();
      expect(result?.email).toBe(mockUser.email);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
    });

    it('should return null if user not found by email', async () => {
const email = 'nonexistent@example.com';
      mockUserRepository.findByEmail.mockResolvedValueOnce(null);

      const result = await service.findByEmail(email);
      
      expect(result).toBeNull();
    });
  });

  describe('updateLastLogin', () => {
    it('should update the last login timestamp', async () => {
      const userId = mockUser.id;
      const lastLogin = new Date();
      
await service.updateLastLogin(userId);
      
      expect(mockUserRepository.updateLastLogin).toHaveBeenCalledWith(userId);
    });
  });

  describe('account lock management', () => {
    const email = 'test@example.com';
    const userId = mockUser.id;
    const lockUntil = new Date(Date.now() + 3600000); // 1 hour from now

beforeEach(() => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
    });

    it('should increment failed login attempts', async () => {
await service.incrementFailedLoginAttempts(email);
      
      expect(mockUserRepository.incrementFailedLoginAttempts).toHaveBeenCalledWith(userId);
    });

    it('should get account lock status', async () => {
      const lockedUser = {
        ...mockUser,
        failedLoginAttempts: 5, // Above threshold
        accountLockedUntil: lockUntil,
      };
      
      mockUserRepository.findOne.mockResolvedValueOnce(lockedUser);

      const result = await service.getAccountLockStatus(email);
      
      expect(result).toBeDefined();
      expect(result.isLocked).toBe(true);
      expect(result.lockedUntil).toEqual(lockUntil);
    });

    it('should indicate account is not locked when not locked', async () => {
      const unlockedUser = {
        ...mockUser,
        failedLoginAttempts: 2, // Below threshold
        accountLockedUntil: null,
      };
      
      mockUserRepository.findOne.mockResolvedValueOnce(unlockedUser);

      const result = await service.getAccountLockStatus(email);
      
      expect(result).toBeDefined();
      expect(result.isLocked).toBe(false);
      expect(result.lockedUntil).toBeNull();
    });

    it('should unlock account with valid unlock data', async () => {
      const unlockData = {
        email,
      };

      // Mock the repository to return a locked user
      mockUserRepository.findOne.mockResolvedValueOnce({
        ...mockUser,
        accountLockedUntil: new Date(Date.now() + 3600000), // Locked for 1 hour
      });

      const result = await service.unlockAccount(unlockData);
      
      expect(result.success).toBe(true);
      expect(mockUserRepository.unlockAccount).toHaveBeenCalledWith(userId);
    });

    it('should reset failed login attempts', async () => {
await service.resetFailedLoginAttempts(email);
      
      expect(mockUserRepository.resetFailedLoginAttempts).toHaveBeenCalledWith(userId);
    });
  });
});
