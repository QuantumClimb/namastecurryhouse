// Script to import menuData.json into Prisma database
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

const menuData = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/menuData.json'), 'utf8'));

async function main() {
  // Group items by category
  const categories = {};
  menuData.forEach((item) => {
    const category = item.Category || 'Other';
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
          name: item.Name,
          description: item.Description || '',
          price: parseFloat(item.Price),
          dietary: item.Dietary ? item.Dietary : '',
          spiceLevel: item.SpiceLevel ? Number(item.SpiceLevel) : undefined,
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
