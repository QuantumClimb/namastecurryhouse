// migrate-portuguese-translations.mjs
// Script to populate Portuguese translations from combined_menu.json

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

// Portuguese translations for common descriptions
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
  "Grilled meat with tikka sauce, yogurt, cream and spices": "Carne grelhada com molho tikka, iogurte, natas e especiarias",
  "Cooked with onion, tomato, garlic, ginger, coriander and cashew sauce": "Cozinhado com cebola, tomate, alho, gengibre, coentros e molho de cajú",
  "Mixed vegetables cooked in special sauce with spices": "Vegetais mistos cozinhados em molho especial com especiarias",
  "Three types of lentils cooked in special sauce and spices": "Três tipos de lentilhas cozinhadas em molho especial e especiarias",
  "Mixed vegetables cooked in thick, flavorful sauce": "Vegetais mistos cozinhados em molho espesso e saboroso",
  "Chickpeas cooked with mild spices, onions and tomatoes": "Grão-de-bico cozinhado com especiarias suaves, cebola e tomate",
  "Leavened bread baked in the tandoor and brushed with butter": "Pão fermentado assado no tandoor e pincelado com manteiga",
  "Leavened tandoori bread with fire-roasted garlic and coriander": "Pão tandoori fermentado com alho assado e coentros",
  "Leavened bread baked in the tandoor with cheese and coriander leaves": "Pão fermentado assado no tandoor com queijo e folhas de coentros",
  "Leavened bread baked in the tandoor with cheese, garlic and coriander": "Pão fermentado assado no tandoor com queijo, alho e coentros",
  "Cucumber, lettuce, tomato, onion, carrots & olives": "Pepino, alface, tomate, cebola, cenoura e azeitonas",
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
  console.log('🌐 Starting Portuguese translation migration...\n');
  
  let updated = 0;
  let notFound = 0;
  let errors = 0;

  for (const menuItem of menuData) {
    try {
      const itemName = menuItem.Item;
      const portugueseName = menuItem["Portuguese Translation"];
      const englishDescription = menuItem.Description;
      
      // Try to find matching item in database by name
      const dbItem = await prisma.menuItem.findFirst({
        where: {
          name: itemName
        }
      });

      if (dbItem) {
        // Get Portuguese description from translations or fallback to English
        const portugueseDescription = descriptionTranslations[englishDescription] || englishDescription;
        
        // Update with Portuguese translations
        await prisma.menuItem.update({
          where: { id: dbItem.id },
          data: {
            namePt: portugueseName,
            descriptionPt: portugueseDescription
          }
        });
        
        console.log(`✅ Updated: ${itemName} → ${portugueseName}`);
        updated++;
      } else {
        console.log(`⚠️  Not found in DB: ${itemName}`);
        notFound++;
      }
    } catch (error) {
      console.error(`❌ Error updating ${menuItem.Item}:`, error.message);
      errors++;
    }
  }

  console.log('\n📊 Migration Summary:');
  console.log(`   ✅ Successfully updated: ${updated} items`);
  console.log(`   ⚠️  Not found in database: ${notFound} items`);
  console.log(`   ❌ Errors: ${errors} items`);
  console.log('\n✨ Portuguese translation migration complete!');
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
