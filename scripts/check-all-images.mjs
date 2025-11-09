import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAllImagesStatus() {
  try {
    const items = await prisma.menuItem.findMany({
      select: {
        id: true,
        name: true,
        imageUrl: true,
        imageData: true,
        imageMimeType: true
      },
      orderBy: { name: 'asc' }
    });

    console.log('\n=== Image Status for All Items ===\n');
    
    const withImages = items.filter(i => i.imageData);
    const withUrlNoData = items.filter(i => i.imageUrl && !i.imageData);
    const noImage = items.filter(i => !i.imageUrl && !i.imageData);
    
    console.log(`Items with stored imageData: ${withImages.length}`);
    console.log(`Items with imageUrl but no imageData: ${withUrlNoData.length}`);
    console.log(`Items with no image: ${noImage.length}`);
    
    if (withUrlNoData.length > 0) {
      console.log('\n--- Items with imageUrl but no imageData ---');
      withUrlNoData.forEach(item => {
        console.log(`${item.name} (${item.id}): ${item.imageUrl}`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllImagesStatus();
