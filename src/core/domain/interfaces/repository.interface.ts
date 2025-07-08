// Generic filter type that can be used with any repository
export type FilterCondition<T> = {
  [P in keyof T]?: T[P] | { [key: string]: any };
};

export interface IRepository<T> {
  findOne(where: FilterCondition<T>): Promise<T | null>;
  find(where?: FilterCondition<T>): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  exists(where: FilterCondition<T>): Promise<boolean>;
  count(where?: FilterCondition<T>): Promise<number>;
}
