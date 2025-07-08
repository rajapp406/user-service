import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Successfully connected to the database');

    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`📊 Total users in database: ${userCount}`);

    // List all tables in the public schema
    const result = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `;
    
    console.log('📋 Database tables:');
    console.log(result);
    
  } catch (error) {
    console.error('❌ Error connecting to the database:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
