// check-categories.mjs
// Script to check all categories and their items

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📋 Checking all categories and their items...\n');
  
  const categories = await prisma.menuCategory.findMany({
    include: {
      items: true,
      _count: {
        select: { items: true }
      }
    },
    orderBy: {
      name: 'asc'
    }
  });

  console.log(`Found ${categories.length} categories:\n`);

  for (const category of categories) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📁 Category: ${category.name}`);
    console.log(`   Items count: ${category._count.items}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    
    if (category.items.length === 0) {
      console.log('   ⚠️  EMPTY CATEGORY - No items found!');
    } else {
      category.items.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.name} (€${item.price.toFixed(2)})`);
        if (item.namePt) {
          console.log(`      PT: ${item.namePt}`);
        }
      });
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Summary:');
  console.log(`   Total categories: ${categories.length}`);
  console.log(`   Empty categories: ${categories.filter(c => c._count.items === 0).length}`);
  console.log(`   Total items: ${categories.reduce((sum, c) => sum + c._count.items, 0)}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
