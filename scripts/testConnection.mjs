// scripts/testConnection.mjs - Test Neon database connection
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing Neon database connection...');
    
    // Simple query to wake up the database
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Connection successful!', result);
    
    // Try to create tables if they don't exist
    console.log('Pushing schema to database...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "MenuCategory" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL
      )
    `;
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "MenuItem" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "price" DOUBLE PRECISION NOT NULL,
        "dietary" TEXT NOT NULL,
        "spiceLevel" INTEGER,
        "categoryId" INTEGER NOT NULL,
        FOREIGN KEY ("categoryId") REFERENCES "MenuCategory"("id")
      )
    `;
    
    console.log('✅ Schema created successfully!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes("Can't reach database server")) {
      console.log('💡 This might be because:');
      console.log('   1. Neon database is sleeping (free tier)');
      console.log('   2. Network connectivity issues');
      console.log('   3. Incorrect connection string');
      console.log('   4. Database needs to be manually activated in Neon dashboard');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();