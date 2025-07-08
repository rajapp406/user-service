import { DynamicModule, Module, forwardRef } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GrpcUserService } from './services/grpc-user.service';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({})
export class GrpcModule {
  private static instanceCount = 0;
  private readonly instanceId: number;

  constructor() {
    this.instanceId = ++GrpcModule.instanceCount;
    console.log(`GrpcModule instance ${this.instanceId} created`);
  }
  static forRoot(): DynamicModule {
    return {
      module: GrpcModule,
      imports: [
        ConfigModule,
        PrismaModule,
        forwardRef(() => UsersModule),
      ],
      providers: [
        {
          provide: 'GRPC_USER_SERVICE',
          useClass: GrpcUserService,
        },
      ],
      exports: ['GRPC_USER_SERVICE'],
    };
  }

  static forFeature(): DynamicModule {
    return {
      module: GrpcModule,
      imports: [
        ClientsModule.registerAsync([
          {
            name: 'USER_PACKAGE',
            useFactory: (configService: ConfigService) => ({
              transport: Transport.GRPC,
              options: {
                package: 'user',
                protoPath: join(__dirname, 'protos/user_service.proto'),
                url: configService.get('grpc.url') || 'localhost:50054',
                loader: {
                  keepCase: true,
                  longs: String,
                  enums: String,
                  defaults: true,
                  oneofs: true,
                },
              },
            }),
            inject: [ConfigService],
          },
        ]),
      ],
      exports: [ClientsModule],
    };
  }
}
