import { FilterQuery } from 'mongoose';

export interface IRepository<T> {
  findOne(where: FilterQuery<T>): Promise<T | null>;
  find(where?: FilterQuery<T>): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  exists(where: FilterQuery<T>): Promise<boolean>;
}
