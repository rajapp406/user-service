import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum UserRole {
  ADMIN = 'admin',
  TRAINER = 'trainer',
  MEMBER = 'member',
}

export type UserDocument = User & Document<Types.ObjectId> & {
  _id: Types.ObjectId;
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

@Schema({ timestamps: true })
export class User {
  @Prop({ type: String, required: true })
  firstName: string;

  @Prop({ type: String })
  lastName?: string;

  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ type: String, required: true, select: false })
  password: string;

  @Prop({ type: String, enum: Object.values(UserRole), default: UserRole.MEMBER })
  role: UserRole;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Date })
  lastLoginAt?: Date;

  @Prop({ type: Date })
  lastActivityAt?: Date;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ type: Number, default: 0 })
  failedLoginAttempts: number;

  @Prop({ type: Date, default: null })
  accountLockedUntil: Date | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
