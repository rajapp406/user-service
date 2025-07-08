import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './services/user.service';
import { PrismaUserRepository } from './repositories/prisma-user.repository';
import { IUserRepository } from './interfaces/user-repository.interface';
import { KafkaModule } from '../../core/kafka/kafka.module';
import { UserEventsModule } from '../user-events/user-events.module';
import { UsersController } from './controllers/users.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { USER_REPOSITORY, USER_SERVICE } from './users.constants';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => KafkaModule),
    forwardRef(() => UserEventsModule),
  ],
  controllers: [UsersController],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    {
      provide: USER_SERVICE,
      useFactory: (userRepository: IUserRepository) => new UserService(userRepository),
      inject: [USER_REPOSITORY],
    },
  ],
  exports: [
    USER_SERVICE,
  ],
})
export class UsersModule {}
