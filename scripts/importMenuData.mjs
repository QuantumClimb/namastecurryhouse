// scripts/importMenuData.mjs - ES module for importing menu data into Prisma DB
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

const menuData = JSON.parse(readFileSync(join(__dirname, '../src/data/menuData.json'), 'utf8'));

// Simple category mapping based on item names
function getCategory(itemName) {
  const lower = itemName.toLowerCase();
  if (lower.includes('tikka masala') || lower.includes('lababdar')) return 'Main Curries';
  if (lower.includes('vegetable') || lower.includes('daal') || lower.includes('chana')) return 'Vegetarian Dishes';
  if (lower.includes('naan')) return 'Breads (Naan)';
  if (lower.includes('beer') || lower.includes('wine') || lower.includes('lassi') || lower.includes('coca') || lower.includes('fanta') || lower.includes('icetea') || lower.includes('water') || lower.includes('somersby') || lower.includes('coffee')) return 'Beverages';
  if (lower.includes('salad')) return 'Sides';
  return 'Other';
}

async function main() {
  console.log('Starting menu data import...');
  
  // Clear existing data
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();
  
  // Group items by category
  const categories = {};
  menuData.forEach((item) => {
    const category = getCategory(item.Item);
    if (!categories[category]) categories[category] = [];
    categories[category].push(item);
  });

  for (const [categoryName, items] of Object.entries(categories)) {
    console.log(`Creating category: ${categoryName}`);
    // Create category
    const category = await prisma.menuCategory.create({
      data: { name: categoryName }
    });
    
    // Create items
    for (const item of items) {
      console.log(`  Adding item: ${item.Item}`);
      await prisma.menuItem.create({
        data: {
          name: item.Item,
          description: item.Description || '',
          price: parseFloat(item["Price (EUR)"].replace('€','')), // Remove euro sign
          dietary: '', // Not present in this dataset
          spiceLevel: undefined, // Not present in this dataset
          categoryId: category.id,
          // Assign a placeholder image; future enhancement: map based on item name
          imageUrl: '/images/placeholder-food.svg'
        }
      });
    }
  }
  console.log('Menu data imported successfully!');
}

main()
  .catch((e) => {
    console.error('Error importing menu data:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());