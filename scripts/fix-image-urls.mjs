// Fix image URLs in the database
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function fixImageUrls() {
  try {
    console.log('🔧 Fixing image URLs in database...\n');
    
    // Get all menu items
    const items = await prisma.menuItem.findMany();
    
    // Check which uploaded images actually exist
    const uploadsDir = path.join(process.cwd(), 'public', 'images', 'uploads');
    const uploadedFiles = fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir) : [];
    
    console.log('📁 Available uploaded files:');
    uploadedFiles.forEach(file => console.log(`  - ${file}`));
    console.log('');
    
    let fixedCount = 0;
    
    for (const item of items) {
      let needsUpdate = false;
      let newImageUrl = item.imageUrl;
      
      // Check if the image file actually exists
      if (item.imageUrl && item.imageUrl.startsWith('/images/uploads/')) {
        const filename = item.imageUrl.replace('/images/uploads/', '');
        if (!uploadedFiles.includes(filename)) {
          // File doesn't exist, use placeholder
          newImageUrl = '/images/placeholder-food.svg';
          needsUpdate = true;
          console.log(`❌ Missing file for ${item.name}: ${filename} -> using placeholder`);
        }
      }
      
      if (needsUpdate) {
        await prisma.menuItem.update({
          where: { id: parseInt(item.id) },
          data: { imageUrl: newImageUrl }
        });
        fixedCount++;
      }
    }
    
    console.log(`\n✅ Fixed ${fixedCount} image URLs`);
    
    // Show final status
    const updatedItems = await prisma.menuItem.findMany();
    const withUploads = updatedItems.filter(item => item.imageUrl?.startsWith('/images/uploads/'));
    const withPlaceholders = updatedItems.filter(item => item.imageUrl === '/images/placeholder-food.svg');
    
    console.log('\n📊 Final image status:');
    console.log(`  - Real uploaded images: ${withUploads.length}`);
    console.log(`  - Placeholder images: ${withPlaceholders.length}`);
    
    if (withUploads.length > 0) {
      console.log('\n📷 Items with real images:');
      withUploads.forEach(item => {
        console.log(`  - ${item.name}: ${item.imageUrl}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error fixing image URLs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixImageUrls();