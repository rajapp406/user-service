import { DynamicModule, Global, Logger, Module } from '@nestjs/common';
import { KafkaConfigService } from './services/kafka-config.service';
import { KafkaProducerService } from './services/kafka-producer.service';
import { KafkaConsumerService } from './services/kafka-consumer.service';

@Global()
@Module({
  providers: [
    KafkaConfigService,
    KafkaProducerService,
    KafkaConsumerService,
  ],
  exports: [
    KafkaConfigService,
    KafkaProducerService,
    KafkaConsumerService,
  ],
})
export class KafkaModule {
  private static readonly logger = new Logger(KafkaModule.name);

  static forRoot(): DynamicModule {
    return {
      module: KafkaModule,
    };
  }
}
