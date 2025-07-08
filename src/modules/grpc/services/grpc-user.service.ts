import { Injectable, OnModuleInit, OnModuleDestroy, Inject, forwardRef } from '@nestjs/common';
import { USER_SERVICE } from '../../users/users.constants';
import { Server, ServerCredentials, loadPackageDefinition, ServerUnaryCall, sendUnaryData, GrpcObject, ServiceClientConstructor } from '@grpc/grpc-js';
import { ConfigService } from '@nestjs/config';
import { IUserService } from '../../users/interfaces/user-service.interface';
import { loadSync } from '@grpc/proto-loader';
import { join } from 'path';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { CreateUserDto } from '../../users/dto/create-user.dto';

// Define the structure of our gRPC service
type UserServiceDefinition = {
  createUser: any; // Method definition will be dynamically typed
  getUser: any;    // Method definition will be dynamically typed
};

type UserService = {
  service: UserServiceDefinition;
};

type UserPackage = GrpcObject & {
  user: {
    UserService: ServiceClientConstructor | UserService;
  };
};

interface UserServiceHandlers {
  createUser: (
    call: ServerUnaryCall<any, any>,
    callback: sendUnaryData<any>
  ) => void;
  getUser: (
    call: ServerUnaryCall<any, any>,
    callback: sendUnaryData<any>
  ) => void;
}

@Injectable()
export class GrpcUserService implements OnModuleInit, OnModuleDestroy, UserServiceHandlers {
  private server: Server;
  private protoPath = join(__dirname, 'protos/user_service.proto');

  private static instanceCount = 0;
  private readonly instanceId: number;

  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(USER_SERVICE) private readonly userService: IUserService,
  ) {
    this.instanceId = ++GrpcUserService.instanceCount;
    console.log(`GrpcUserService instance ${this.instanceId} created`);
  }

  async onModuleInit() {
    await this.initGrpcServer();
  }

  async onModuleDestroy() {
    await this.shutdownGrpcServer();
  }

  private async initGrpcServer(): Promise<void> {
    try {
      console.log('Loading proto file from:', this.protoPath);
      
      // Load the proto file
      const packageDef = loadSync(this.protoPath, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      });
      
      console.log('Successfully loaded proto file');
      
      // Load the package definition
      const grpcObject = loadPackageDefinition(packageDef) as any;
      
      // Log the structure of the loaded package for debugging
      console.log('Loaded gRPC object keys:', Object.keys(grpcObject));
      
      const userPackage = grpcObject.user;
      if (!userPackage) {
        throw new Error('Could not find "user" package in the proto file');
      }
      
      console.log('User package keys:', Object.keys(userPackage));
      
      // Try to get the service from the package
      let service = userPackage.UserService;
      if (!service) {
        // Try to find the service in the package
        const serviceKey = Object.keys(userPackage).find(key => 
          key.endsWith('Service') && 
          typeof userPackage[key] === 'function'
        );
        
        if (serviceKey) {
          console.log(`Found service with key: ${serviceKey}`);
          service = userPackage[serviceKey];
        } else {
          throw new Error('Could not find UserService in the proto file');
        }
      }

      // Create a new gRPC server
      this.server = new Server({
        'grpc.max_receive_message_length': -1,
        'grpc.max_send_message_length': -1,
      });

      // Get the service definition
      const serviceDefinition = typeof service === 'function'
        ? (service as ServiceClientConstructor).service
        : service.service;

      if (!serviceDefinition) {
        throw new Error('Could not get service definition from the proto file');
      }

      // Add the service implementation
      this.server.addService(serviceDefinition, {
        createUser: this.createUser.bind(this),
        getUser: this.getUser.bind(this),
      });

      // Get the port from config
      const port = this.configService.get<number>('grpc.port', 50051);
      const host = this.configService.get('grpc.host', '0.0.0.0');
      const address = `${host}:${port}`;
      
      console.log(`Attempting to bind gRPC server to ${address}`);

      return new Promise((resolve, reject) => {
        this.server.bindAsync(
          address,
          ServerCredentials.createInsecure(),
          (error, port) => {
            if (error) {
              console.error('Failed to bind gRPC server:', error);
              return reject(error);
            }
            console.log(`gRPC server successfully bound to ${address}`);
            
            // Try to start the server (not needed in newer versions of @grpc/grpc-js)
            try {
              // Remove the explicit start() call as it's not needed with @grpc/grpc-js
              console.log('gRPC server is ready to handle requests');
              resolve();
            } catch (err) {
              console.error('Error starting gRPC server:', err);
              reject(err);
            }
          }
        );
      });
    } catch (error) {
      console.error('Error initializing gRPC server:', error);
      throw error; // Let the caller handle the error
    }
  }

  async createUser(
    call: ServerUnaryCall<any, any>,
    callback: sendUnaryData<any>,
  ) {
    try {
      console.log('Received createUser request with data:', call.request);
      const { userId, email, firstName, lastName, password, role } = call.request;
      console.log('typeof firstName:', typeof firstName, 'value:', firstName);
      
      if (!firstName) {
        console.error('First name is required but not provided in the request');
        throw new Error('First name is required');
      }
      
      if (!email) {
        console.error('Email is required but not provided in the request');
        throw new Error('Email is required');
      }
      
      // Check if user already exists by email
      let existingUser: UserResponseDto | null = null;
      try {
        existingUser = await this.userService.findByEmail(email);
      } catch (error: unknown) {
        // User not found by email, which is expected if it's a new user
        console.debug(`User with email ${email} not found, creating new user`);
      }

      if (existingUser) {
        console.log(`User with email ${email} already exists, returning existing user`);
        return callback(null, this.mapUserToResponse(existingUser));
      }
      
      // Create new user with all required fields
      const createUserDto: CreateUserDto = {
        email: email,
        firstName: firstName,
        lastName: lastName || '',
        password: password || this.generateTemporaryPassword(),
        role: role || 'MEMBER'
      };
      
      console.log('Creating user with DTO:', JSON.stringify(createUserDto, null, 2));

      const newUser = await this.userService.create(createUserDto, userId);
      console.log('Successfully created user:', JSON.stringify(newUser, null, 2));
      callback(null, this.mapUserToResponse(newUser));
    } catch (error) {
      console.error('Error in createUser gRPC method:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create user';
      callback(
        {
          code: 13, // INTERNAL
          message: 'Failed to create user',
          details: errorMessage,
        },
        null,
      );
    }
  }

  async getUser(
    call: ServerUnaryCall<{ id: string }, any>,
    callback: sendUnaryData<any>,
  ) {
    try {
      const { id } = call.request;
      
      // First try to find by ID
      let user = await this.userService.findOne(id).catch(() => null);
      
      // If not found by ID, try to find by email
      if (!user && id.includes('@')) {
        user = await this.userService.findByEmail(id).catch(() => null);
      }

      if (!user) {
        return callback(
          {
            code: 5, // NOT_FOUND
            message: 'User not found',
          },
          null,
        );
      }

      callback(null, this.mapUserToResponse(user));
    } catch (error) {
      console.error('Error in getUser gRPC method:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get user';
      callback(
        {
          code: 13, // INTERNAL
          message: 'Failed to get user',
          details: errorMessage,
        },
        null,
      );
    }
  }

  private mapUserToResponse(user: UserResponseDto): any {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: user.updatedAt?.toISOString() || new Date().toISOString(),
    };
  }

  private generateTemporaryPassword(): string {
    return `tmp_${Math.random().toString(36).substring(2, 15)}`;
  }

  private async shutdownGrpcServer(): Promise<void> {
    if (this.server) {
      return new Promise<void>((resolve, reject) => {
        this.server.tryShutdown((error) => {
          if (error) {
            console.error('Error shutting down gRPC server:', error);
            reject(error);
          } else {
            console.log('gRPC server successfully shut down');
            resolve();
          }
        });
      });
    }
  }
}
