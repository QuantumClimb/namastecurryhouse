import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSpiceItems() {
  try {
    const items = await prisma.menuItem.findMany({
      where: { hasSpiceCustomization: true },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        imageData: true,
        imageMimeType: true
      }
    });

    console.log('\n=== Items with Spice Customization ===');
    if (items.length === 0) {
      console.log('No items found with spice customization enabled');
    } else {
      items.forEach(item => {
        console.log(`\nItem: ${item.name}`);
        console.log(`  ID: ${item.id}`);
        console.log(`  imageUrl: ${item.imageUrl || 'null'}`);
        console.log(`  Has imageData: ${!!item.imageData}`);
        console.log(`  imageMimeType: ${item.imageMimeType || 'null'}`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSpiceItems();
