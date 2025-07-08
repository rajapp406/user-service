import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './core/auth/auth.module';
import { KafkaModule } from './core/kafka/kafka.module';
import { GrpcModule } from './modules/grpc/grpc.module';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    KafkaModule,
    GrpcModule.forRoot(),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
