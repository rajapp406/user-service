import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { User } from '../entities/user.entity';
import { IUserRepository } from '../interfaces/user-repository.interface';

@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findOne(where: FindOptionsWhere<User>): Promise<User | null> {
    return this.userRepository.findOne({ where });
  }

  async find(where?: FindOptionsWhere<User>): Promise<User[]> {
    return this.userRepository.find({ where });
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    await this.userRepository.update(id, data);
    return this.userRepository.findOne({ where: { id } });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userRepository.softDelete(id);
    return (result.affected ?? 0) > 0;
  }

  async exists(where: FindOptionsWhere<User>): Promise<boolean> {
    const count = await this.userRepository.count({ where });
    return count > 0;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ 
      where: { email },
      select: ['id', 'email', 'password', 'role', 'isActive', 'firstName', 'lastName']
    });
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userRepository.update(userId, { lastLoginAt: new Date() });
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await this.userRepository.update(userId, { password: hashedPassword });
  }
}
