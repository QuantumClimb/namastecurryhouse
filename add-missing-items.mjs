// add-missing-items.mjs
// Script to add missing menu items from combined_menu.json

import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

// Load combined menu data
const menuData = JSON.parse(
  readFileSync(join(__dirname, 'public/combined_menu.json'), 'utf8')
);

// Category mapping
function getCategory(itemName) {
  const lower = itemName.toLowerCase();
  
  // Starters/Appetizers
  if (lower.includes('papari') || lower.includes('papadum') || 
      lower.includes('samosa') || lower.includes('bhaji') || 
      lower.includes('pakora') || lower.includes('entrada mista')) {
    return 'Starters';
  }
  
  // Rice dishes
  if (lower.includes('biryani') || lower.includes('rice') || 
      lower.includes('arroz') || lower.includes('pulao')) {
    return 'Rice';
  }
  
  // Tandoor dishes
  if (lower.includes('tandoori') || lower.includes('tikka') && 
      !lower.includes('masala') && !lower.includes('biryani')) {
    return 'Tandoor Specialties';
  }
  
  // Main dishes
  if (lower.includes('mix curry') || lower.includes('murg malai') || 
      lower === 'carne') {
    return 'Main Dishes';
  }
  
  // Breads
  if (lower.includes('naan')) {
    return 'Breads (Naan)';
  }
  
  // Curries
  if (lower.includes('tikka masala') || lower.includes('lababdar')) {
    return 'Main Curries';
  }
  
  // Vegetarian
  if (lower.includes('vegetable') || lower.includes('daal') || 
      lower.includes('chana') || lower.includes('paneer tikka')) {
    return 'Vegetarian Dishes';
  }
  
  // Beverages
  if (lower.includes('beer') || lower.includes('wine') || 
      lower.includes('lassi') || lower.includes('coca') || 
      lower.includes('fanta') || lower.includes('icetea') || 
      lower.includes('water') || lower.includes('somersby') || 
      lower.includes('coffee') || lower.includes('cerveja') || 
      lower.includes('água')) {
    return 'Beverages';
  }
  
  // Sides
  if (lower.includes('salad')) {
    return 'Sides';
  }
  
  return 'Other';
}

// Portuguese translations for descriptions
const descriptionTranslations = {
  "Soft drink": "Refrigerante",
  "Flavored iced tea": "Chá gelado com sabor",
  "Mineral water with gas": "Água mineral com gás",
  "Still water": "Água sem gás",
  "Draft beer": "Cerveja de pressão",
  "Beer served in a mug": "Cerveja servida numa caneca",
  "Imported beer from Nepal": "Cerveja importada do Nepal",
  "Imported beer from India": "Cerveja importada da Índia",
  "Cider": "Cidra",
  "House wine": "Vinho da casa",
  "Traditional yogurt drink": "Bebida tradicional de iogurte",
  "Special yogurt drink with mango": "Bebida especial de iogurte com manga",
  "Hot beverage": "Bebida quente",
  "A THIN CRISPY INDIAN FLATBREAD": "Um pão indiano fino e crocante",
  "A CRISPY TRIANGULAR PASTRY STUFFED WITH SAVORY VEGETABLES": "Uma massa triangular crocante recheada com vegetais saborosos",
  "A POPULAR CRISPY PASTRY STUFFED WITH CHICKEN MEAT": "Uma massa crocante popular recheada com carne de frango",
  "A TRADITIONAL INDIAN SNACK: CHOPPED ONION WRAPPED IN CHICKPEA BATTER AND DEEP FRIED": "Um petisco indiano tradicional: cebola picada envolta em massa de grão-de-bico e frita",
  "AROMATIZADAS E FRITO SLICES OF INDIAN CHEESE (PANEER) WRAPPED IN GRAM FLOUR, SPICES AND DEEP FRIED": "Fatias de queijo indiano (paneer) aromatizadas, envolvidas em farinha de grão, especiarias e fritas",
  "AROMATIZADOS E FRITOS BONELESS CHICKEN SEASONED, WRAPPED IN GRAM FLOUR, SPICES AND DEEP FRIED": "Frango desossado temperado, envolvido em farinha de grão, especiarias e frito",
  "NAMASTE CURRY HOUSE MIXED STARTERS-VEG & NON-VEG": "Entradas mistas Namaste Curry House - vegetariano e não vegetariano",
  "BASMATI RICE COOKED WITH MIXED VEGETABLES, CASHEW NUTS, RAISINS, HERBS AND MILD SPICES": "Arroz basmati cozinhado com vegetais mistos, cajú, passas, ervas e especiarias suaves",
  "BASMATI RICE WITH CHICKEN, EGG, CASHEW NUTS, HERBS AND MILD SPICES": "Arroz basmati com frango, ovo, cajú, ervas e especiarias suaves",
  "ERVAS, MOLHO ESPECIAL E ESPECIARIAS SUAVES BASMATI RICE WITH LAMB, CASHEW NUTS, HERBS AND MILD SPICES": "Arroz basmati com borrego, cajú, ervas e especiarias suaves",
  "CAJU, ERVAS, MOLHO ESPECIAL E ESPECIARIAS SUAVES BASMATI RICE WITH GRILLED CHICKEN, CASHEW NUTS, HERBS AND SPICES": "Arroz basmati com frango grelhado, cajú, ervas e especiarias",
  "PLAIN RICE": "Arroz branco",
  "JEERA RICE WITH CUMIN": "Arroz jeera com cominhos",
  "RICE WITH CUMIN, CASHEW NUTS AND PEAS": "Arroz com cominhos, cajú e ervilhas",
  "EGG RICE": "Arroz com ovo",
  "CARNE": "Carne",
  "PRAWN, CHICKEN AND LAMB COOKED IN MILD SAUCE WITH HERBS AND SPICES": "Camarão, frango e borrego cozinhados em molho suave com ervas e especiarias",
  "BASMATI RICE COOKED WITH SHRIMP, CHICKEN AND LAMB, FLAVORED WITH SPICES": "Arroz basmati cozinhado com camarão, frango e borrego, aromatizado com especiarias",
  "TANDOOR HALF CHICKEN MARINATED IN AROMATIC SPICES AND GRILLED IN A TANDOOR": "Meio frango tandoor marinado em especiarias aromáticas e grelhado no tandoor",
  "TANDOOR CHICKEN BREAST MARINATED WITH SPICES AND GRILLED IN THE TANDOOR": "Peito de frango tandoor marinado com especiarias e grelhado no tandoor",
  "TANDOOR INDIAN COTTAGE CHEESE MARINATED IN YOGURT, HERBS AND SPICES, GRILLED IN THE TANDOOR": "Queijo indiano tandoor marinado em iogurte, ervas e especiarias, grelhado no tandoor",
  "TANDOOR CHICKEN BREAST WRAPPED IN CHEESE AND CREAM, GRILLED IN THE TANDOOR": "Peito de frango tandoor envolto em queijo e natas, grelhado no tandoor"
};

async function main() {
  console.log('🍽️  Adding missing menu items from combined_menu.json...\n');
  
  let added = 0;
  let skipped = 0;
  let errors = 0;

  for (const menuItem of menuData) {
    try {
      const itemName = menuItem.Item;
      const portugueseName = menuItem["Portuguese Translation"];
      const englishDescription = menuItem.Description;
      const priceStr = menuItem["Price (EUR)"].replace('€', '').trim();
      const price = parseFloat(priceStr);
      
      // Check if item already exists
      const existingItem = await prisma.menuItem.findFirst({
        where: {
          name: itemName
        }
      });

      if (existingItem) {
        console.log(`⏭️  Skipped (exists): ${itemName}`);
        skipped++;
        continue;
      }

      // Determine category
      const categoryName = getCategory(itemName);
      
      // Find or create category
      let category = await prisma.menuCategory.findFirst({
        where: {
          name: categoryName
        }
      });

      if (!category) {
        category = await prisma.menuCategory.create({
          data: {
            name: categoryName
          }
        });
        console.log(`📁 Created new category: ${categoryName}`);
      }

      // Get Portuguese description
      const portugueseDescription = descriptionTranslations[englishDescription] || englishDescription;

      // Create the item
      await prisma.menuItem.create({
        data: {
          name: itemName,
          namePt: portugueseName,
          description: englishDescription,
          descriptionPt: portugueseDescription,
          price: price,
          dietary: '',
          hasSpiceCustomization: false,
          categoryId: category.id
        }
      });

      console.log(`✅ Added: ${itemName} → ${categoryName} (€${price.toFixed(2)})`);
      added++;
      
    } catch (error) {
      console.error(`❌ Error adding ${menuItem.Item}:`, error.message);
      errors++;
    }
  }

  console.log('\n📊 Import Summary:');
  console.log(`   ✅ Added: ${added} items`);
  console.log(`   ⏭️  Skipped (already exist): ${skipped} items`);
  console.log(`   ❌ Errors: ${errors} items`);
  console.log('\n✨ Import complete!');
}

main()
  .catch((e) => {
    console.error('❌ Import failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
