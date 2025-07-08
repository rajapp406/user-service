import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserRole } from '../enums/user-role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column({ nullable: true })
  lastName: string | null;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.MEMBER })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ nullable: true })
  lastLoginAt: Date | null;

  @Column({ nullable: true })
  lastActivityAt: Date | null;

  @Column({ default: 0 })
  failedLoginAttempts: number;

  @Column({ nullable: true })
  accountLockedUntil: Date | null;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any> | null;

  @Column({ nullable: true })
  passwordChangedAt: Date | null;

  @Column({ nullable: true })
  createdById: string | null;

  @Column({ nullable: true })
  updatedById: string | null;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdById' })
  createdBy: User | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'updatedById' })
  updatedBy: User | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'deletedById' })
  deletedBy: User | null;
}

export { UserRole };
