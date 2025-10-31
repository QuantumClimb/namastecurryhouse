// Examine Neon database structure and data
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function analyzeDatabase() {
  try {
    console.log('🔍 Analyzing Neon Database Structure and Content\n');
    
    // 1. Check database connection
    await prisma.$connect();
    console.log('✅ Connected to Neon database\n');
    
    // 2. Get all categories
    console.log('📂 MENU CATEGORIES:');
    const categories = await prisma.menuCategory.findMany();
    categories.forEach(cat => {
      console.log(`  - ${cat.id}: ${cat.name}`);
    });
    console.log(`  Total: ${categories.length} categories\n`);
    
    // 3. Get all menu items with details
    console.log('🍽️  MENU ITEMS:');
    const items = await prisma.menuItem.findMany({
      include: {
        category: true
      }
    });
    
    console.log(`  Total: ${items.length} menu items\n`);
    
    // 4. Check for image URLs
    console.log('🖼️  IMAGE ANALYSIS:');
    const itemsWithImages = items.filter(item => item.imageUrl);
    const itemsWithoutImages = items.filter(item => !item.imageUrl);
    
    console.log(`  Items with images: ${itemsWithImages.length}`);
    console.log(`  Items without images: ${itemsWithoutImages.length}\n`);
    
    if (itemsWithImages.length > 0) {
      console.log('  Sample image URLs:');
      itemsWithImages.slice(0, 5).forEach(item => {
        console.log(`    - ${item.name}: ${item.imageUrl}`);
      });
      console.log('');
    }
    
    // 5. Sample menu items by category
    console.log('📋 SAMPLE ITEMS BY CATEGORY:');
    for (const category of categories) {
      const categoryItems = items.filter(item => item.categoryId === category.id);
      console.log(`  ${category.name} (${categoryItems.length} items):`);
      categoryItems.slice(0, 3).forEach(item => {
        console.log(`    - ${item.name} - $${item.price} ${item.imageUrl ? '📷' : '❌'}`);
      });
      console.log('');
    }
    
    // 6. Check for missing images in production
    console.log('⚠️  POTENTIAL ISSUES:');
    if (itemsWithoutImages.length > 0) {
      console.log(`  - ${itemsWithoutImages.length} items missing images`);
    }
    
    // Check for local file references
    const localImageRefs = items.filter(item => 
      item.imageUrl && (item.imageUrl.includes('localhost') || item.imageUrl.includes('C:') || item.imageUrl.includes('file:'))
    );
    
    if (localImageRefs.length > 0) {
      console.log(`  - ${localImageRefs.length} items have local file references:`);
      localImageRefs.forEach(item => {
        console.log(`    * ${item.name}: ${item.imageUrl}`);
      });
    }
    
    console.log('\n🎯 RECOMMENDATIONS:');
    if (itemsWithoutImages.length > 0) {
      console.log('  1. Upload missing images through admin panel');
    }
    if (localImageRefs.length > 0) {
      console.log('  2. Fix local file references to use proper URLs');
    }
    console.log('  3. Ensure all images are uploaded to /public/images/uploads/');
    console.log('  4. Update imageUrl paths to be relative: /images/uploads/filename.jpg');
    
  } catch (error) {
    console.error('❌ Database analysis failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeDatabase();