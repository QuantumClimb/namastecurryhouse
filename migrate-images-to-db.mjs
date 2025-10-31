import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Sample food images - we'll create a simple placeholder image in base64
const createPlaceholderImageBase64 = (itemName, category) => {
  // This is a minimal 1x1 transparent PNG in base64
  // In a real migration, you'd fetch actual images from a source
  const transparentPng = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77zwAAAABJRU5ErkJggg==';
  
  // For demo purposes, we'll use the same transparent image for all
  // In production, you'd fetch real images from your image sources
  return transparentPng;
};

const getCategoryForItem = (itemName) => {
  const name = itemName.toLowerCase();
  
  if (name.includes('beer') || name.includes('wine') || name.includes('cola') || 
      name.includes('water') || name.includes('coffee') || name.includes('lassi') ||
      name.includes('fanta') || name.includes('icetea') || name.includes('somersby')) {
    return 'beverages';
  }
  
  if (name.includes('naan')) {
    return 'bread';
  }
  
  if (name.includes('tikka') || name.includes('lababdar')) {
    return 'curry';
  }
  
  if (name.includes('vegetable') || name.includes('daal') || name.includes('karahi') || 
      name.includes('chana')) {
    return 'vegetarian';
  }
  
  if (name.includes('salad')) {
    return 'sides';
  }
  
  return 'other';
};

async function migrateImagesToDatabase() {
  try {
    console.log('🔄 Starting image migration to database...');
    console.log('==========================================');
    
    // Get all items with placeholder images
    const items = await prisma.menuItem.findMany({
      where: {
        imageUrl: '/images/placeholder-food.svg',
        imageData: null
      }
    });
    
    console.log(`Found ${items.length} items with placeholder images to migrate`);
    
    let migratedCount = 0;
    
    for (const item of items) {
      try {
        const category = getCategoryForItem(item.name);
        const imageData = createPlaceholderImageBase64(item.name, category);
        
        // Update the item with database-stored image
        await prisma.menuItem.update({
          where: { id: item.id },
          data: {
            imageData: imageData,
            imageMimeType: 'image/png',
            imageSize: Math.floor(imageData.length * 0.75), // Approximate size after base64 decode
            // Keep the original imageUrl as fallback for now
            imageUrl: item.imageUrl
          }
        });
        
        migratedCount++;
        console.log(`✅ Migrated: ${item.name} (ID: ${item.id})`);
        
      } catch (itemError) {
        console.error(`❌ Failed to migrate ${item.name} (ID: ${item.id}):`, itemError.message);
      }
    }
    
    console.log('\n📊 Migration Summary:');
    console.log('====================');
    console.log(`Total items processed: ${items.length}`);
    console.log(`Successfully migrated: ${migratedCount}`);
    console.log(`Failed migrations: ${items.length - migratedCount}`);
    
    if (migratedCount > 0) {
      console.log('\n🎉 Migration completed! All placeholder images are now stored in the database.');
      console.log('💡 Images will now be served via /api/images/:id endpoints');
      console.log('🔗 The frontend will automatically use database-served images');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Alternative: Create actual food category-specific placeholder images
const createCategoryPlaceholderImage = (category) => {
  // These are very basic SVG images converted to base64
  // In production, you'd use actual food images
  
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

// Enhanced migration with category-specific images
async function migrateWithCategoryImages() {
  try {
    console.log('🔄 Starting enhanced image migration with category-specific images...');
    console.log('====================================================================');
    
    const items = await prisma.menuItem.findMany({
      where: {
        imageUrl: '/images/placeholder-food.svg',
        imageData: null
      }
    });
    
    console.log(`Found ${items.length} items to migrate`);
    
    let migratedCount = 0;
    
    for (const item of items) {
      try {
        const category = getCategoryForItem(item.name);
        const imageData = createCategoryPlaceholderImage(category);
        
        await prisma.menuItem.update({
          where: { id: item.id },
          data: {
            imageData: imageData,
            imageMimeType: 'image/svg+xml',
            imageSize: imageData.length,
            // Clear the placeholder URL since we now have database storage
            imageUrl: null
          }
        });
        
        migratedCount++;
        console.log(`✅ Migrated: ${item.name} (ID: ${item.id}) - Category: ${category}`);
        
      } catch (itemError) {
        console.error(`❌ Failed to migrate ${item.name}:`, itemError.message);
      }
    }
    
    console.log(`\n🎉 Enhanced migration completed! ${migratedCount}/${items.length} items migrated`);
    
  } catch (error) {
    console.error('❌ Enhanced migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the enhanced migration
console.log('Choose migration type:');
console.log('1. Basic migration (simple placeholder)');
console.log('2. Enhanced migration (category-specific images)');

// For now, run the enhanced migration
migrateWithCategoryImages();