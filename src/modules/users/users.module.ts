import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.entity';
import { UserService } from './services/user.service';
import { MongoUserRepository } from './repositories/mongo-user.repository';
import { IUserRepository } from './interfaces/user-repository.interface';
import { IUserService } from './interfaces/user-service.interface';
import { KafkaModule } from '../../core/kafka/kafka.module';
import { UserEventsModule } from '../user-events/user-events.module';
import { UsersController } from './controllers/users.controller';
import { USER_REPOSITORY, USER_SERVICE } from './users.constants';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => KafkaModule),
    forwardRef(() => UserEventsModule),
  ],
  controllers: [UsersController],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: MongoUserRepository,
    },
    {
      provide: USER_SERVICE,
      useFactory: (userRepository: IUserRepository) => {
        return new UserService(userRepository);
      },
      inject: [USER_REPOSITORY],
    },
  ],
  exports: [
    USER_SERVICE,
    MongooseModule,
  ],
})
export class UsersModule {}
