#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function checkRecentChanges() {
  try {
    console.log('🔍 Checking for Imperial Beer and Butter Naan...\n');
    
    // Search for items with names containing these terms
    const items = await prisma.menuItem.findMany({
      where: {
        OR: [
          { name: { contains: 'Imperial', mode: 'insensitive' } },
          { name: { contains: 'Beer', mode: 'insensitive' } },
          { name: { contains: 'Butter', mode: 'insensitive' } },
          { name: { contains: 'Naan', mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        imageData: true,
        imageMimeType: true,
        imageSize: true
      },
      orderBy: { id: 'asc' }
    });
    
    console.log(`Found ${items.length} matching items:\n`);
    
    items.forEach(item => {
      console.log(`📋 ID ${item.id}: ${item.name}`);
      console.log(`   Image URL: ${item.imageUrl || 'None'}`);
      console.log(`   Has DB Image: ${item.imageData ? 'Yes (' + Math.round(item.imageSize/1024) + 'KB)' : 'No'}`);
      console.log(`   MIME Type: ${item.imageMimeType || 'None'}`);
      console.log('');
    });
    
    // Also check the uploaded files against any database entries
    console.log('\n🖼️  Checking uploaded files vs database...');
    
    // Check if any items have imageUrl pointing to uploads directory
    const itemsWithUploads = await prisma.menuItem.findMany({
      where: {
        imageUrl: { contains: '/images/uploads/' }
      },
      select: {
        id: true,
        name: true,
        imageUrl: true
      }
    });
    
    console.log(`Items with upload URLs: ${itemsWithUploads.length}`);
    itemsWithUploads.forEach(item => {
      console.log(`   ${item.id}: ${item.name} -> ${item.imageUrl}`);
    });
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkRecentChanges();