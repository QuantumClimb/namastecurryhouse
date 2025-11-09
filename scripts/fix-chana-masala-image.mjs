import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixChanaMasalaImage() {
  try {
    // Update Chana Masala to use placeholder since it has no imageData
    const updated = await prisma.menuItem.update({
      where: { id: 1474 },
      data: {
        imageUrl: null  // Set to null so frontend will use placeholder
      }
    });

    console.log('\n=== Updated Chana Masala Image ===');
    console.log(`Name: ${updated.name}`);
    console.log(`imageUrl: ${updated.imageUrl}`);
    console.log(`Has imageData: ${!!updated.imageData}`);
    console.log('\nThe item will now use the placeholder image.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixChanaMasalaImage();
