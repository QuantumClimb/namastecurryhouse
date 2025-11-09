import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkItem() {
  try {
    const item = await prisma.menuItem.findUnique({
      where: { id: 1474 }
    });

    console.log('\n=== Chana Masala (ID: 1474) ===');
    console.log(JSON.stringify(item, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkItem();
