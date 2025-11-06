import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function restoreChanaMasala() {
  try {
    // Restore Chana Masala imageUrl to the API endpoint
    const updated = await prisma.menuItem.update({
      where: { id: 1474 },
      data: {
        imageUrl: '/api/images/1474'
      }
    });

    console.log('Restored Chana Masala imageUrl to:', updated.imageUrl);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreChanaMasala();
