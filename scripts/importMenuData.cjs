// importMenuData.cjs - CommonJS script for importing menu data into Prisma DB
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();


const menuData = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/menuData.json'), 'utf8'));

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
  // Group items by category
  const categories = {};
  menuData.forEach((item) => {
    const category = getCategory(item.Item);
    if (!categories[category]) categories[category] = [];
    categories[category].push(item);
  });

  for (const [categoryName, items] of Object.entries(categories)) {
    // Create category
    const category = await prisma.menuCategory.create({
      data: { name: categoryName }
    });
    // Create items
    for (const item of items) {
      await prisma.menuItem.create({
        data: {
          name: item.Item,
          description: item.Description || '',
          price: parseFloat(item["Price (EUR)"].replace('€','')), // Remove euro sign
          dietary: '', // Not present in this dataset
          spiceLevel: undefined, // Not present in this dataset
          categoryId: category.id
        }
      });
    }
  }
  console.log('Menu data imported successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
