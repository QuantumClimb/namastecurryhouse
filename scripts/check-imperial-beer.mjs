import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function checkImperialBeer() {
  try {
    console.log('🔍 Querying database for Imperial Beer (ID: 1357)...\n');
    
    const item = await prisma.menuItem.findUnique({
      where: { id: 1357 },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        imageData: true,
        imageMimeType: true,
        imageSize: true
      }
    });
    
    if (!item) {
      console.log('❌ Item with ID 1357 not found!');
      return;
    }
    
    console.log('✅ Found item:');
    console.log('   ID:', item.id);
    console.log('   Name:', item.name);
    console.log('   imageUrl:', item.imageUrl || 'NULL');
    console.log('   imageMimeType:', item.imageMimeType || 'NULL');
    console.log('   imageSize:', item.imageSize || 'NULL');
    console.log('   Has imageData:', item.imageData ? 'YES ✅' : 'NO ❌');
    
    if (item.imageData) {
      console.log('   imageData length:', item.imageData.length, 'characters');
      console.log('   First 100 chars:', item.imageData.substring(0, 100) + '...');
      
      // Check if it's base64 encoded
      if (item.imageData.startsWith('data:image/')) {
        console.log('   ✅ Looks like a data URL (base64)');
      } else if (item.imageData.startsWith('/9j/') || item.imageData.startsWith('iVBOR')) {
        console.log('   ✅ Looks like raw base64 data');
      } else {
        console.log('   ⚠️  Unexpected format!');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkImperialBeer();
