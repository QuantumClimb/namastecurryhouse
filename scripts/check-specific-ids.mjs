import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config();

const prisma = new PrismaClient();

const problemIds = [1490, 1486, 1479, 1480, 1468];

console.log('🔍 Checking specific menu item IDs from 404 errors...\n');

for (const id of problemIds) {
  try {
    const item = await prisma.menuItem.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        imageData: true,
        imageMimeType: true,
      }
    });
    
    if (item) {
      console.log(`✅ ID ${id}: ${item.name}`);
      console.log(`   Image URL: ${item.imageUrl || 'None'}`);
      console.log(`   Has imageData: ${item.imageData ? 'Yes' : 'No'}`);
      if (item.imageData) {
        const sizeKB = Math.round(item.imageData.length / 1024);
        console.log(`   Size: ${sizeKB}KB`);
        console.log(`   MIME: ${item.imageMimeType}`);
      }
    } else {
      console.log(`❌ ID ${id}: NOT FOUND in database`);
    }
    console.log('');
    
  } catch (error) {
    console.error(`❌ Error checking ID ${id}:`, error.message);
  }
}

await prisma.$disconnect();
