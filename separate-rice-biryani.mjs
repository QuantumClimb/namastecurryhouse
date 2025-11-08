// separate-rice-biryani.mjs
// Script to separate Rice and Biryani into different categories

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🍚 Separating Rice and Biryani dishes into different categories...\n');
  
  // Find or create Biryani category
  let biryaniCategory = await prisma.menuCategory.findFirst({
    where: { name: 'Biryani' }
  });

  if (!biryaniCategory) {
    biryaniCategory = await prisma.menuCategory.create({
      data: { name: 'Biryani' }
    });
    console.log('📁 Created new category: Biryani\n');
  }

  // Find Rice category
  const riceCategory = await prisma.menuCategory.findFirst({
    where: { name: 'Rice' }
  });

  if (!riceCategory) {
    console.error('❌ Rice category not found!');
    return;
  }

  // Get all items from Rice category
  const riceItems = await prisma.menuItem.findMany({
    where: {
      categoryId: riceCategory.id
    }
  });

  console.log(`Found ${riceItems.length} items in Rice category\n`);

  let movedToBiryani = 0;
  let stayedInRice = 0;

  // Move Biryani items to Biryani category
  for (const item of riceItems) {
    if (item.name.toUpperCase().includes('BIRYANI')) {
      await prisma.menuItem.update({
        where: { id: item.id },
        data: { categoryId: biryaniCategory.id }
      });
      console.log(`🍛 Moved to Biryani: ${item.name}`);
      movedToBiryani++;
    } else {
      console.log(`🍚 Stays in Rice: ${item.name}`);
      stayedInRice++;
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Summary:');
  console.log(`   🍛 Moved to Biryani category: ${movedToBiryani} items`);
  console.log(`   🍚 Remaining in Rice category: ${stayedInRice} items`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Verify the changes
  const biryaniItems = await prisma.menuItem.findMany({
    where: { categoryId: biryaniCategory.id }
  });

  const remainingRiceItems = await prisma.menuItem.findMany({
    where: { categoryId: riceCategory.id }
  });

  console.log('✅ Verification:');
  console.log(`   Biryani category now has: ${biryaniItems.length} items`);
  console.log(`   Rice category now has: ${remainingRiceItems.length} items`);
  console.log('\n✨ Separation complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
