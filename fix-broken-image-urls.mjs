import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config();

const prisma = new PrismaClient();

console.log('🔧 Fixing menu items with broken image URLs...\n');

// Find all items that have an /api/images/ URL but no imageData
const brokenItems = await prisma.menuItem.findMany({
  where: {
    imageUrl: {
      startsWith: '/api/images/'
    },
    imageData: null
  },
  select: {
    id: true,
    name: true,
    imageUrl: true
  }
});

console.log(`Found ${brokenItems.length} items with broken image references:\n`);

for (const item of brokenItems) {
  console.log(`  - ID ${item.id}: ${item.name}`);
}

if (brokenItems.length > 0) {
  console.log(`\n📝 Updating these items to use placeholder image...`);
  
  const result = await prisma.menuItem.updateMany({
    where: {
      imageUrl: {
        startsWith: '/api/images/'
      },
      imageData: null
    },
    data: {
      imageUrl: '/images/placeholder-food.svg'
    }
  });
  
  console.log(`\n✅ Updated ${result.count} menu items`);
  console.log(`   Changed: /api/images/{id} → /images/placeholder-food.svg\n`);
} else {
  console.log(`\n✅ No broken image references found!\n`);
}

await prisma.$disconnect();
