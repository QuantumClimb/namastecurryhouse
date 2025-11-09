import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkImageData() {
  try {
    const items = await prisma.menuItem.findMany({
      select: { id: true, name: true, imageUrl: true, imageData: true, imageMimeType: true }
    });
    
    console.log('Current image data status:');
    console.log('========================');
    
    let placeholderCount = 0;
    let externalCount = 0;
    let dbCount = 0;
    let noImageCount = 0;
    
    items.forEach(item => {
      if (item.imageData) {
        dbCount++;
        console.log(`✅ DB Image: ${item.name} (ID: ${item.id})`);
      } else if (item.imageUrl && item.imageUrl.includes('placeholder')) {
        placeholderCount++;
        console.log(`📍 Placeholder: ${item.name} (ID: ${item.id}) - ${item.imageUrl}`);
      } else if (item.imageUrl) {
        externalCount++;
        console.log(`🔗 External: ${item.name} (ID: ${item.id}) - ${item.imageUrl}`);
      } else {
        noImageCount++;
        console.log(`❌ No Image: ${item.name} (ID: ${item.id})`);
      }
    });
    
    console.log(`\nSummary:`);
    console.log(`Database images: ${dbCount}`);
    console.log(`External URLs: ${externalCount}`);
    console.log(`Placeholders: ${placeholderCount}`);
    console.log(`No images: ${noImageCount}`);
    console.log(`Total items: ${items.length}`);
    
  } catch (error) {
    console.error('Error checking image data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkImageData();