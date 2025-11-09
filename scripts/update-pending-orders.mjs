// Script to manually update pending orders to CONFIRMED status
// Use this for orders that were paid but webhook didn't fire
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function updatePendingOrders() {
  console.log('🔍 Checking for pending orders with Stripe session IDs...\n');
  
  try {
    // Find all pending orders that have a Stripe session ID (meaning they were paid)
    const pendingOrders = await prisma.order.findMany({
      where: {
        status: 'PENDING',
        paymentStatus: 'PENDING',
        stripeSessionId: {
          not: null
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    if (pendingOrders.length === 0) {
      console.log('✅ No pending orders with Stripe sessions found.');
      console.log('   All orders are either already confirmed or haven\'t been paid yet.\n');
      return;
    }
    
    console.log(`Found ${pendingOrders.length} pending order(s) that may have been paid:\n`);
    
    pendingOrders.forEach((order, idx) => {
      console.log(`${idx + 1}. Order: ${order.orderNumber}`);
      console.log(`   Customer: ${order.customerName} (${order.customerEmail})`);
      console.log(`   Total: €${order.total.toFixed(2)}`);
      console.log(`   Created: ${new Date(order.createdAt).toLocaleString()}`);
      console.log(`   Stripe Session: ${order.stripeSessionId}`);
      console.log('');
    });
    
    console.log('⚠️  These orders have Stripe session IDs, which means:');
    console.log('   - Customer was redirected to Stripe checkout');
    console.log('   - Payment may or may not have completed');
    console.log('   - Webhook did not fire to confirm the order\n');
    
    console.log('💡 Options:');
    console.log('   1. Check Stripe dashboard to verify if payments succeeded');
    console.log('   2. Run this with --confirm flag to mark them as CONFIRMED');
    console.log('   3. Use the Stripe CLI to test webhook locally\n');
    
    // Check if --confirm flag is passed
    if (process.argv.includes('--confirm')) {
      console.log('⚡ --confirm flag detected. Updating orders...\n');
      
      for (const order of pendingOrders) {
        try {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: 'CONFIRMED',
              paymentStatus: 'SUCCEEDED',
              confirmedAt: new Date()
            }
          });
          console.log(`✅ Updated ${order.orderNumber} to CONFIRMED`);
        } catch (error) {
          console.error(`❌ Failed to update ${order.orderNumber}:`, error.message);
        }
      }
      
      console.log('\n✅ All orders updated successfully!');
      console.log('\n💡 To send confirmation emails, run:');
      pendingOrders.forEach(order => {
        console.log(`   node test-order-emails.mjs ${order.id}`);
      });
    } else {
      console.log('❌ Not updating orders (dry run mode).');
      console.log('   To update these orders, run: node update-pending-orders.mjs --confirm\n');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updatePendingOrders();
