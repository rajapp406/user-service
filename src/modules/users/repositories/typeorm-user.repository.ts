import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, IsNull, Not, UpdateResult, FindOperator, In, Not as NotOp } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { IUserRepository, FilterCondition } from '../interfaces/user-repository.interface';

const mapFilterToTypeORM = <T>(filter: FilterCondition<T>): FindOptionsWhere<T> => {
  const where: any = {};
  
  for (const [key, value] of Object.entries(filter)) {
    if (key === 'AND') {
      where.AND = (value as FilterCondition<T>[]).map(v => mapFilterToTypeORM(v));
    } else if (key === 'OR') {
      where.OR = (value as FilterCondition<T>[]).map(v => mapFilterToTypeORM(v));
    } else if (key === 'NOT') {
      where.NOT = Array.isArray(value)
        ? (value as FilterCondition<T>[]).map(v => mapFilterToTypeORM(v))
        : mapFilterToTypeORM(value as FilterCondition<T>);
    } else if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      // Handle operators like equals, not, in, notIn
      const operators = value as Record<string, any>;
      const conditions: any = {};
      
      for (const [op, opValue] of Object.entries(operators)) {
        if (op === 'equals') conditions[op] = opValue;
        else if (op === 'not') conditions[op] = Not(opValue);
        else if (op === 'in') conditions[op] = In(opValue);
        else if (op === 'notIn') conditions[op] = Not(In(opValue));
      }
      
      where[key] = Object.keys(conditions).length > 0 ? conditions : value;
    } else {
      where[key] = value;
    }
  }
  
  return where;
};

@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private getBaseQuery() {
    return { deletedAt: IsNull() };
  }

  async findOne(filter: FilterCondition<User>): Promise<User | null> {
    const typeOrmWhere = {
      ...this.getBaseQuery(),
      ...mapFilterToTypeORM(filter)
    };
    
    return this.userRepository.findOne({ 
      where: typeOrmWhere,
      relations: ['createdBy', 'updatedBy']
    });
  }

  async find(filter: FilterCondition<User> = {}): Promise<User[]> {
    const typeOrmWhere = {
      ...this.getBaseQuery(),
      ...mapFilterToTypeORM(filter)
    };
    
    return this.userRepository.find({ 
      where: typeOrmWhere,
      relations: ['createdBy', 'updatedBy']
    });
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.userRepository.create({
      ...data,
      isActive: data.isActive ?? true,
      emailVerified: data.emailVerified ?? false,
      failedLoginAttempts: data.failedLoginAttempts ?? 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return this.userRepository.save(user);
  }

  async update(id: string, update: Partial<User>): Promise<User | null> {
    await this.userRepository.update(id, {
      ...update,
      updatedAt: new Date()
    });
    return this.userRepository.findOne({ 
      where: { id, ...this.getBaseQuery() },
      relations: ['createdBy', 'updatedBy'] 
    });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.userRepository.softDelete(id);
    return (result.affected ?? 0) > 0;
  }

  async exists(filter: FilterCondition<User>): Promise<boolean> {
    const typeOrmWhere = {
      ...this.getBaseQuery(),
      ...mapFilterToTypeORM(filter)
    };
    
    const count = await this.userRepository.count({
      where: typeOrmWhere,
    });
    return count > 0;
  }

  async markEmailAsVerified(userId: string): Promise<void> {
    await this.userRepository.update(
      { id: userId },
      { emailVerified: true, updatedAt: new Date() }
    );
  }

  async count(filter: FilterCondition<User> = {}): Promise<number> {
    const typeOrmWhere = {
      ...this.getBaseQuery(),
      ...mapFilterToTypeORM(filter)
    };
    
    return this.userRepository.count({
      where: typeOrmWhere,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ 
      where: { email, ...this.getBaseQuery() },
      select: ['id', 'email', 'password', 'role', 'isActive', 'firstName', 'lastName'],
      relations: ['createdBy', 'updatedBy']
    });
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      lastLoginAt: new Date(),
      lastActivityAt: new Date(),
      updatedAt: new Date()
    });
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await this.userRepository.update(userId, {
      password: hashedPassword,
      passwordChangedAt: new Date(),
      updatedAt: new Date()
    });
  }

  async incrementFailedLoginAttempts(userId: string): Promise<void> {
    await this.userRepository.increment(
      { id: userId },
      'failedLoginAttempts',
      1
    );
  }

  async resetFailedLoginAttempts(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      failedLoginAttempts: 0,
      accountLockedUntil: null,
      updatedAt: new Date()
    });
  }

  async lockAccount(userId: string, until: Date): Promise<void> {
    await this.userRepository.update(userId, {
      accountLockedUntil: until,
      updatedAt: new Date()
    });
  }

  async unlockAccount(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      accountLockedUntil: null,
      failedLoginAttempts: 0,
      updatedAt: new Date()
    });
  }
}
