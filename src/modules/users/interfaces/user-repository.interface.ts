import { User } from '../entities/user.entity';
import { IRepository } from '../../../core/domain/interfaces/repository.interface';

export interface IUserRepository extends IRepository<User> {
  findByEmail(email: string): Promise<User | null>;
  updateLastLogin(userId: string): Promise<void>;
  updatePassword(userId: string, hashedPassword: string): Promise<void>;
}
