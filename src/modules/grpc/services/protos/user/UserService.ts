// Original file: src/modules/grpc/services/protos/user_service.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { CreateUserRequest as _user_CreateUserRequest, CreateUserRequest__Output as _user_CreateUserRequest__Output } from '../user/CreateUserRequest';
import type { CreateUserResponse as _user_CreateUserResponse, CreateUserResponse__Output as _user_CreateUserResponse__Output } from '../user/CreateUserResponse';
import type { DeleteUserRequest as _user_DeleteUserRequest, DeleteUserRequest__Output as _user_DeleteUserRequest__Output } from '../user/DeleteUserRequest';
import type { DeleteUserResponse as _user_DeleteUserResponse, DeleteUserResponse__Output as _user_DeleteUserResponse__Output } from '../user/DeleteUserResponse';
import type { GetUserRequest as _user_GetUserRequest, GetUserRequest__Output as _user_GetUserRequest__Output } from '../user/GetUserRequest';
import type { GetUserResponse as _user_GetUserResponse, GetUserResponse__Output as _user_GetUserResponse__Output } from '../user/GetUserResponse';
import type { UpdateUserRequest as _user_UpdateUserRequest, UpdateUserRequest__Output as _user_UpdateUserRequest__Output } from '../user/UpdateUserRequest';
import type { UpdateUserResponse as _user_UpdateUserResponse, UpdateUserResponse__Output as _user_UpdateUserResponse__Output } from '../user/UpdateUserResponse';

export interface UserServiceClient extends grpc.Client {
  CreateUser(argument: _user_CreateUserRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_user_CreateUserResponse__Output>): grpc.ClientUnaryCall;
  CreateUser(argument: _user_CreateUserRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_user_CreateUserResponse__Output>): grpc.ClientUnaryCall;
  CreateUser(argument: _user_CreateUserRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_user_CreateUserResponse__Output>): grpc.ClientUnaryCall;
  CreateUser(argument: _user_CreateUserRequest, callback: grpc.requestCallback<_user_CreateUserResponse__Output>): grpc.ClientUnaryCall;
  createUser(argument: _user_CreateUserRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_user_CreateUserResponse__Output>): grpc.ClientUnaryCall;
  createUser(argument: _user_CreateUserRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_user_CreateUserResponse__Output>): grpc.ClientUnaryCall;
  createUser(argument: _user_CreateUserRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_user_CreateUserResponse__Output>): grpc.ClientUnaryCall;
  createUser(argument: _user_CreateUserRequest, callback: grpc.requestCallback<_user_CreateUserResponse__Output>): grpc.ClientUnaryCall;
  
  DeleteUser(argument: _user_DeleteUserRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_user_DeleteUserResponse__Output>): grpc.ClientUnaryCall;
  DeleteUser(argument: _user_DeleteUserRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_user_DeleteUserResponse__Output>): grpc.ClientUnaryCall;
  DeleteUser(argument: _user_DeleteUserRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_user_DeleteUserResponse__Output>): grpc.ClientUnaryCall;
  DeleteUser(argument: _user_DeleteUserRequest, callback: grpc.requestCallback<_user_DeleteUserResponse__Output>): grpc.ClientUnaryCall;
  deleteUser(argument: _user_DeleteUserRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_user_DeleteUserResponse__Output>): grpc.ClientUnaryCall;
  deleteUser(argument: _user_DeleteUserRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_user_DeleteUserResponse__Output>): grpc.ClientUnaryCall;
  deleteUser(argument: _user_DeleteUserRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_user_DeleteUserResponse__Output>): grpc.ClientUnaryCall;
  deleteUser(argument: _user_DeleteUserRequest, callback: grpc.requestCallback<_user_DeleteUserResponse__Output>): grpc.ClientUnaryCall;
  
  GetUser(argument: _user_GetUserRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_user_GetUserResponse__Output>): grpc.ClientUnaryCall;
  GetUser(argument: _user_GetUserRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_user_GetUserResponse__Output>): grpc.ClientUnaryCall;
  GetUser(argument: _user_GetUserRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_user_GetUserResponse__Output>): grpc.ClientUnaryCall;
  GetUser(argument: _user_GetUserRequest, callback: grpc.requestCallback<_user_GetUserResponse__Output>): grpc.ClientUnaryCall;
  getUser(argument: _user_GetUserRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_user_GetUserResponse__Output>): grpc.ClientUnaryCall;
  getUser(argument: _user_GetUserRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_user_GetUserResponse__Output>): grpc.ClientUnaryCall;
  getUser(argument: _user_GetUserRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_user_GetUserResponse__Output>): grpc.ClientUnaryCall;
  getUser(argument: _user_GetUserRequest, callback: grpc.requestCallback<_user_GetUserResponse__Output>): grpc.ClientUnaryCall;
  
  UpdateUser(argument: _user_UpdateUserRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_user_UpdateUserResponse__Output>): grpc.ClientUnaryCall;
  UpdateUser(argument: _user_UpdateUserRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_user_UpdateUserResponse__Output>): grpc.ClientUnaryCall;
  UpdateUser(argument: _user_UpdateUserRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_user_UpdateUserResponse__Output>): grpc.ClientUnaryCall;
  UpdateUser(argument: _user_UpdateUserRequest, callback: grpc.requestCallback<_user_UpdateUserResponse__Output>): grpc.ClientUnaryCall;
  updateUser(argument: _user_UpdateUserRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_user_UpdateUserResponse__Output>): grpc.ClientUnaryCall;
  updateUser(argument: _user_UpdateUserRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_user_UpdateUserResponse__Output>): grpc.ClientUnaryCall;
  updateUser(argument: _user_UpdateUserRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_user_UpdateUserResponse__Output>): grpc.ClientUnaryCall;
  updateUser(argument: _user_UpdateUserRequest, callback: grpc.requestCallback<_user_UpdateUserResponse__Output>): grpc.ClientUnaryCall;
  
}

export interface UserServiceHandlers extends grpc.UntypedServiceImplementation {
  CreateUser: grpc.handleUnaryCall<_user_CreateUserRequest__Output, _user_CreateUserResponse>;
  
  DeleteUser: grpc.handleUnaryCall<_user_DeleteUserRequest__Output, _user_DeleteUserResponse>;
  
  GetUser: grpc.handleUnaryCall<_user_GetUserRequest__Output, _user_GetUserResponse>;
  
  UpdateUser: grpc.handleUnaryCall<_user_UpdateUserRequest__Output, _user_UpdateUserResponse>;
  
}

export interface UserServiceDefinition extends grpc.ServiceDefinition {
  CreateUser: MethodDefinition<_user_CreateUserRequest, _user_CreateUserResponse, _user_CreateUserRequest__Output, _user_CreateUserResponse__Output>
  DeleteUser: MethodDefinition<_user_DeleteUserRequest, _user_DeleteUserResponse, _user_DeleteUserRequest__Output, _user_DeleteUserResponse__Output>
  GetUser: MethodDefinition<_user_GetUserRequest, _user_GetUserResponse, _user_GetUserRequest__Output, _user_GetUserResponse__Output>
  UpdateUser: MethodDefinition<_user_UpdateUserRequest, _user_UpdateUserResponse, _user_UpdateUserRequest__Output, _user_UpdateUserResponse__Output>
}
