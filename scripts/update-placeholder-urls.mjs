// Update all placeholder image URLs to use a hosted version
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function updatePlaceholderUrls() {
  try {
    console.log('🔄 Updating placeholder image URLs to use hosted version...\n');
    
    // Use a reliable hosted placeholder image URL
    const hostedPlaceholderUrl = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop&crop=center';
    
    // Alternative: Use a simple placeholder service
    const placeholderServiceUrl = 'https://via.placeholder.com/400x300/e2725b/ffffff?text=Namaste+Curry+House';
    
    // Get all items with local placeholder references
    const items = await prisma.menuItem.findMany({
      where: {
        imageUrl: '/images/placeholder-food.svg'
      }
    });
    
    console.log(`📊 Found ${items.length} items using local placeholder`);
    
    if (items.length > 0) {
      // Update all placeholder references to use hosted URL
      const result = await prisma.menuItem.updateMany({
        where: {
          imageUrl: '/images/placeholder-food.svg'
        },
        data: {
          imageUrl: placeholderServiceUrl
        }
      });
      
      console.log(`✅ Updated ${result.count} items to use hosted placeholder`);
      console.log(`🌐 New placeholder URL: ${placeholderServiceUrl}`);
    } else {
      console.log('ℹ️  No items found with local placeholder references');
    }
    
    // Show final status
    const allItems = await prisma.menuItem.findMany();
    const hostedImages = allItems.filter(item => 
      item.imageUrl && !item.imageUrl.startsWith('/images/')
    );
    const localImages = allItems.filter(item => 
      item.imageUrl && item.imageUrl.startsWith('/images/')
    );
    
    console.log('\n📈 Final image distribution:');
    console.log(`  - Hosted images: ${hostedImages.length}`);
    console.log(`  - Local references: ${localImages.length}`);
    
    if (localImages.length > 0) {
      console.log('\n⚠️  Remaining local references:');
      localImages.forEach(item => {
        console.log(`    - ${item.name}: ${item.imageUrl}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error updating placeholder URLs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePlaceholderUrls();