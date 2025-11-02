#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function checkImageAccess() {
  try {
    const item = await prisma.menuItem.findUnique({
      where: { id: 1233 },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        imageData: true,
        imageMimeType: true,
        imageSize: true
      }
    });
    
    if (!item) {
      console.log('❌ Item with ID 1233 not found');
      return;
    }
    
    console.log('🍺 Imperial Beer (ID 1233):');
    console.log('  Name:', item.name);
    console.log('  Image URL:', item.imageUrl || 'None');
    console.log('  Has imageData:', !!item.imageData);
    console.log('  MIME Type:', item.imageMimeType);
    console.log('  Size:', item.imageSize, 'bytes');
    console.log('  Should be accessible at: /api/images/1233');
    
    // Check if imageData has content
    if (item.imageData) {
      console.log('  ImageData length:', item.imageData.length, 'characters');
      console.log('  First 50 chars:', item.imageData.substring(0, 50) + '...');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkImageAccess();