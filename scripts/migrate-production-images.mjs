import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Production-safe data migration script
async function migrateProductionImages() {
  try {
    console.log('🚀 Production Database Image Migration');
    console.log('=====================================\n');
    
    // First, verify we have the new schema columns
    console.log('1. Verifying database schema...');
    try {
      const testItem = await prisma.menuItem.findFirst({
        select: { id: true, imageData: true, imageMimeType: true, imageSize: true }
      });
      console.log('   ✅ Database schema includes image storage columns');
    } catch (schemaError) {
      console.error('   ❌ Schema verification failed:', schemaError.message);
      console.log('   🔧 Please run: npx prisma migrate deploy');
      return;
    }
    
    // Check current state
    console.log('\n2. Checking current image state...');
    const totalItems = await prisma.menuItem.count();
    const itemsWithDbImages = await prisma.menuItem.count({
      where: { imageData: { not: null } }
    });
    const itemsWithPlaceholders = await prisma.menuItem.count({
      where: { 
        imageUrl: '/images/placeholder-food.svg',
        imageData: null 
      }
    });
    
    console.log(`   Total items: ${totalItems}`);
    console.log(`   Items with database images: ${itemsWithDbImages}`);
    console.log(`   Items with placeholders: ${itemsWithPlaceholders}`);
    
    if (itemsWithPlaceholders === 0) {
      console.log('\n✅ All items already have database images - no migration needed!');
      return;
    }
    
    // Create category-specific images (same as local migration)
    const createCategoryImage = (category) => {
      const svgImages = {
        beverages: `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="#E3F2FD"/><circle cx="100" cy="100" r="60" fill="#2196F3"/><text x="100" y="110" text-anchor="middle" fill="white" font-size="14">🍺</text></svg>`,
        bread: `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="#FFF3E0"/><circle cx="100" cy="100" r="60" fill="#FF9800"/><text x="100" y="110" text-anchor="middle" fill="white" font-size="14">🍞</text></svg>`,
        curry: `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="#FFF8E1"/><circle cx="100" cy="100" r="60" fill="#FFC107"/><text x="100" y="110" text-anchor="middle" fill="white" font-size="14">🍛</text></svg>`,
        vegetarian: `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="#E8F5E8"/><circle cx="100" cy="100" r="60" fill="#4CAF50"/><text x="100" y="110" text-anchor="middle" fill="white" font-size="14">🥬</text></svg>`,
        sides: `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="#F3E5F5"/><circle cx="100" cy="100" r="60" fill="#9C27B0"/><text x="100" y="110" text-anchor="middle" fill="white" font-size="14">🥗</text></svg>`,
        other: `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="#FAFAFA"/><circle cx="100" cy="100" r="60" fill="#757575"/><text x="100" y="110" text-anchor="middle" fill="white" font-size="14">🍽️</text></svg>`
      };
      return Buffer.from(svgImages[category] || svgImages.other).toString('base64');
    };
    
    const getCategoryForItem = (itemName) => {
      const name = itemName.toLowerCase();
      if (name.includes('beer') || name.includes('wine') || name.includes('cola') || 
          name.includes('water') || name.includes('coffee') || name.includes('lassi') ||
          name.includes('fanta') || name.includes('icetea') || name.includes('somersby')) {
        return 'beverages';
      }
      if (name.includes('naan')) return 'bread';
      if (name.includes('tikka') || name.includes('lababdar')) return 'curry';
      if (name.includes('vegetable') || name.includes('daal') || name.includes('karahi') || 
          name.includes('chana')) return 'vegetarian';
      if (name.includes('salad')) return 'sides';
      return 'other';
    };
    
    // Get items that need migration
    console.log('\n3. Starting data migration...');
    const itemsToMigrate = await prisma.menuItem.findMany({
      where: {
        imageUrl: '/images/placeholder-food.svg',
        imageData: null
      }
    });
    
    let migratedCount = 0;
    const BATCH_SIZE = 5; // Process in small batches for safety
    
    for (let i = 0; i < itemsToMigrate.length; i += BATCH_SIZE) {
      const batch = itemsToMigrate.slice(i, i + BATCH_SIZE);
      
      for (const item of batch) {
        try {
          const category = getCategoryForItem(item.name);
          const imageData = createCategoryImage(category);
          
          await prisma.menuItem.update({
            where: { id: item.id },
            data: {
              imageData: imageData,
              imageMimeType: 'image/svg+xml',
              imageSize: imageData.length,
              imageUrl: null // Clear placeholder URL
            }
          });
          
          migratedCount++;
          console.log(`   ✅ Migrated: ${item.name} (ID: ${item.id}) - ${category}`);
          
        } catch (itemError) {
          console.error(`   ❌ Failed: ${item.name} - ${itemError.message}`);
        }
      }
      
      // Brief pause between batches
      if (i + BATCH_SIZE < itemsToMigrate.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log(`\n🎉 Production migration completed!`);
    console.log(`   Successfully migrated: ${migratedCount}/${itemsToMigrate.length} items`);
    
    // Final verification
    console.log('\n4. Final verification...');
    const finalDbImages = await prisma.menuItem.count({
      where: { imageData: { not: null } }
    });
    const finalPlaceholders = await prisma.menuItem.count({
      where: { imageUrl: '/images/placeholder-food.svg' }
    });
    
    console.log(`   Database images: ${finalDbImages}/${totalItems}`);
    console.log(`   Remaining placeholders: ${finalPlaceholders}`);
    
    if (finalDbImages === totalItems && finalPlaceholders === 0) {
      console.log('\n✅ Production migration 100% successful!');
      console.log('🚀 All images now served from database storage');
      console.log('🌐 Production site ready for testing');
    }
    
  } catch (error) {
    console.error('❌ Production migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateProductionImages();