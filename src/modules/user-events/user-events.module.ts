import { Module, forwardRef } from '@nestjs/common';
import { UserEventService } from './services/user-event.service';
import { KafkaModule } from '../../core/kafka/kafka.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    KafkaModule, // Import KafkaModule to make KafkaConsumerService available for injection
  ],
  providers: [UserEventService],
  exports: [UserEventService],
})
export class UserEventsModule {}
