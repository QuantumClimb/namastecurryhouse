import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config();

const prisma = new PrismaClient();

console.log('🗑️  Cleaning up old test orders...\n');
console.log('═══════════════════════════════════════════\n');

try {
  // Keep only today's succeeded order (ORD-20251108-967)
  const keepOrderNumber = 'ORD-20251108-967';
  
  // Get all orders except the one we want to keep
  const ordersToDelete = await prisma.order.findMany({
    where: {
      orderNumber: { not: keepOrderNumber }
    },
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      total: true,
      paymentStatus: true
    }
  });

  console.log(`Found ${ordersToDelete.length} order(s) to delete:\n`);
  
  ordersToDelete.forEach((order, index) => {
    console.log(`${index + 1}. ${order.orderNumber} - ${order.customerName} - €${order.total} - ${order.paymentStatus}`);
  });
  
  console.log('\nDeleting...\n');
  
  // Delete all orders except the one we're keeping
  const result = await prisma.order.deleteMany({
    where: {
      orderNumber: { not: keepOrderNumber }
    }
  });

  console.log(`✅ Deleted ${result.count} order(s)\n`);
  
  // Show remaining order
  const remainingOrders = await prisma.order.findMany();
  
  console.log('═══════════════════════════════════════════');
  console.log('Remaining orders:');
  console.log('═══════════════════════════════════════════\n');
  
  remainingOrders.forEach(order => {
    console.log(`✅ ${order.orderNumber}`);
    console.log(`   Customer: ${order.customerName}`);
    console.log(`   Total: €${order.total}`);
    console.log(`   Status: ${order.paymentStatus} / ${order.status}`);
    console.log(`   Date: ${order.createdAt.toLocaleString()}\n`);
  });

} catch (error) {
  console.error('❌ Error:', error.message);
} finally {
  await prisma.$disconnect();
}
