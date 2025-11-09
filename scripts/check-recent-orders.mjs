import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config();

const prisma = new PrismaClient();

console.log('📦 Checking Recent Orders...\n');
console.log('═══════════════════════════════════════════\n');

try {
  // Get all orders, sorted by most recent
  const orders = await prisma.order.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    take: 20 // Show last 20 orders
  });

  if (orders.length === 0) {
    console.log('No orders found in database.\n');
  } else {
    console.log(`Found ${orders.length} order(s):\n`);
    
    orders.forEach((order, index) => {
      const date = new Date(order.createdAt).toLocaleString();
      const isPaid = order.paymentStatus === 'SUCCEEDED';
      const statusEmoji = isPaid ? '✅' : order.paymentStatus === 'PENDING' ? '⏳' : '❌';
      
      console.log(`${index + 1}. ${statusEmoji} Order #${order.orderNumber}`);
      console.log(`   Date: ${date}`);
      console.log(`   Customer: ${order.customerName}`);
      console.log(`   Email: ${order.customerEmail}`);
      console.log(`   Phone: ${order.customerPhone}`);
      console.log(`   Total: €${order.total.toFixed(2)}`);
      console.log(`   Payment: ${order.paymentMethod}`);
      console.log(`   Payment Status: ${order.paymentStatus}`);
      console.log(`   Order Status: ${order.status}`);
      
      if (order.stripePaymentIntentId) {
        console.log(`   Stripe Payment Intent: ${order.stripePaymentIntentId}`);
      }
      
      if (order.stripeChargeId) {
        console.log(`   Stripe Charge: ${order.stripeChargeId}`);
      }
      
      if (order.confirmedAt) {
        console.log(`   Confirmed: ${new Date(order.confirmedAt).toLocaleString()}`);
      }
      
      // Show items
      const items = JSON.parse(JSON.stringify(order.orderItems));
      console.log(`   Items:`);
      items.forEach(item => {
        const spice = item.spiceLevel !== undefined ? ` (${item.spiceLevel}% spice)` : '';
        console.log(`     - ${item.quantity}x ${item.name}${spice} - €${item.totalPrice.toFixed(2)}`);
      });
      
      console.log('');
    });
    
    // Summary statistics
    const succeededOrders = orders.filter(o => o.paymentStatus === 'SUCCEEDED');
    const pendingOrders = orders.filter(o => o.paymentStatus === 'PENDING');
    const failedOrders = orders.filter(o => o.paymentStatus === 'FAILED');
    
    console.log('═══════════════════════════════════════════');
    console.log('Summary:');
    console.log(`  Total Orders: ${orders.length}`);
    console.log(`  ✅ Succeeded: ${succeededOrders.length}`);
    console.log(`  ⏳ Pending: ${pendingOrders.length}`);
    console.log(`  ❌ Failed: ${failedOrders.length}`);
    
    if (succeededOrders.length > 0) {
      const totalRevenue = succeededOrders.reduce((sum, o) => sum + parseFloat(o.total), 0);
      console.log(`  💰 Total Revenue: €${totalRevenue.toFixed(2)}`);
    }
    console.log('═══════════════════════════════════════════\n');
  }
  
} catch (error) {
  console.error('❌ Error fetching orders:', error.message);
} finally {
  await prisma.$disconnect();
}
