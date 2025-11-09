#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function checkSpecificItems() {
  try {
    console.log('🔍 Checking items with IDs 1118 and 1119 (from error messages)...\n');
    
    // Check for items with these specific IDs
    const items = await prisma.menuItem.findMany({
      where: {
        id: { in: [1118, 1119] }
      },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        imageData: true,
        imageMimeType: true,
        imageSize: true
      }
    });
    
    if (items.length === 0) {
      console.log('❌ No items found with IDs 1118 or 1119');
      console.log('These IDs might be from a different database or were rolled back.\n');
      
      // Check the actual ID range in the database
      const [minMax] = await prisma.$queryRaw`
        SELECT MIN(id) as min_id, MAX(id) as max_id, COUNT(*) as total_count 
        FROM "MenuItem"
      `;
      
      console.log(`📊 Current database ID range: ${minMax.min_id} - ${minMax.max_id}`);
      console.log(`📊 Total menu items: ${minMax.total_count}`);
      
    } else {
      console.log(`✅ Found ${items.length} item(s):\n`);
      
      items.forEach(item => {
        console.log(`📋 Item ${item.id}: ${item.name}`);
        console.log(`   Image URL: ${item.imageUrl || 'None'}`);
        console.log(`   Has DB Image: ${item.imageData ? 'Yes (' + Math.round(item.imageSize/1024) + 'KB)' : 'No'}`);
        console.log(`   MIME Type: ${item.imageMimeType || 'None'}`);
        console.log('');
      });
    }
    
    // Also check for any items with actual database images
    console.log('\n🖼️  Checking for items with database-stored images...');
    const itemsWithDbImages = await prisma.menuItem.findMany({
      where: {
        imageData: { not: null }
      },
      select: {
        id: true,
        name: true,
        imageSize: true,
        imageMimeType: true
      }
    });
    
    if (itemsWithDbImages.length === 0) {
      console.log('❌ No items found with database-stored images');
    } else {
      console.log(`✅ Found ${itemsWithDbImages.length} item(s) with database images:`);
      itemsWithDbImages.forEach(item => {
        console.log(`   ${item.id}: ${item.name} (${Math.round(item.imageSize/1024)}KB ${item.imageMimeType})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSpecificItems();