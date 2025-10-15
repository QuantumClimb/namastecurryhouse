import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  const categories = await prisma.menuCategory.findMany({
    include: { items: true }
  });
  
  console.log('✅ Database connection successful!');
  console.log(`Found ${categories.length} categories`);
  console.log(`Total items: ${categories.reduce((sum, cat) => sum + cat.items.length, 0)}`);
  
  categories.forEach(cat => {
    console.log(`\n${cat.name}: ${cat.items.length} items`);
  });
  
  await prisma.$disconnect();
}

test().catch(console.error);
