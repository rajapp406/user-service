import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../entities/user.entity';
import { IUserRepository } from '../interfaces/user-repository.interface';
import { FilterQuery } from 'mongoose';

@Injectable()
export class MongoUserRepository implements IUserRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async findOne(where: FilterQuery<User>): Promise<User | null> {
    return this.userModel.findOne(where).exec();
  }

  async find(where: FilterQuery<User> = {}): Promise<User[]> {
    return this.userModel.find(where).exec();
  }

  async create(data: Partial<User>): Promise<User> {
    const user = new this.userModel(data);
    return user.save();
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    return this.userModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userModel.deleteOne({ _id: id }).exec();
    return result.deletedCount > 0;
  }

  async exists(where: FilterQuery<User>): Promise<boolean> {
    const count = await this.userModel.countDocuments(where).exec();
    return count > 0;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userModel
      .updateOne({ _id: userId }, { $set: { lastLoginAt: new Date() } })
      .exec();
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await this.userModel
      .updateOne(
        { _id: userId },
        { $set: { password: hashedPassword } },
      )
      .exec();
  }
}
