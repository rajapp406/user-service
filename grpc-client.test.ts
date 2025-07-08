import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

// Path to the proto file
const PROTO_PATH = path.join(__dirname, 'src/modules/grpc/services/protos/user_service.proto');

// gRPC server address
const GRPC_SERVER = '0.0.0.0:50054';

// Load the proto file
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

// Load the package definition
const userProto = grpc.loadPackageDefinition(packageDefinition);

// Get the user package
const userPackage = (userProto as any).user;

// Create a gRPC client
const client = new userPackage.UserService(
  GRPC_SERVER,
  grpc.credentials.createInsecure()
);

// Test createUser
function testCreateUser() {
  const user = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com'
  };

  console.log('Creating user...');
  client.createUser(user, (error: grpc.ServiceError | null, response: any) => {
    if (error) {
      console.error('Error creating user:', error.details);
      return;
    }
    console.log('User created successfully:', response);
    
    // Test getUser with the created user ID
    if (response && response.id) {
      testGetUser(response.id);
    }
  });
}

// Test getUser
function testGetUser(userId: string) {
  console.log(`\nGetting user with ID: ${userId}`);
  client.getUser({ id: userId }, (error: grpc.ServiceError | null, response: any) => {
    if (error) {
      console.error('Error getting user:', error.details);
      return;
    }
    console.log('User details:', response);
  });
}

// Run the tests
console.log('Starting gRPC client tests...');
testCreateUser();

// Keep the process alive to receive responses
setTimeout(() => {
  console.log('\nTests completed');
  process.exit(0);
}, 3000);
