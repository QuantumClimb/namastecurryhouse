// Script to manually fix the pending orders
// Run this AFTER we identify and fix the webhook issue

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function fixPendingOrders() {
  console.log('🔧 Fixing pending orders that should be confirmed...\n');
  
  try {
    // The orders we know are paid in Stripe but pending in DB
    const pendingOrders = [
      {
        orderId: 'ORD-20251113-401',
        sessionId: 'cs_test_b1EfzgSkZytGdxqgR9PtqOGVBlGGRcPrUE3LZXbZFFCXAwHV69IqRMJzlm',
        paymentIntentId: 'pi_3SSuhL4AYllAtAxr09JOg4dx',
        amount: 26.48
      },
      {
        orderId: 'ORD-20251113-762',
        sessionId: 'cs_test_b1BL5dBif4qR2j56fXfZxFuW7hJD8Piv8U2XM29VrTPzP0mSkpFaD7LRZ1',
        paymentIntentId: 'pi_3SSuYi4AYllAtAxr2oI1hNel',
        amount: 7.50
      }
    ];
    
    for (const orderInfo of pendingOrders) {
      console.log(`Processing ${orderInfo.orderId}...`);
      
      // Find the order
      const order = await prisma.order.findUnique({
        where: { orderNumber: orderInfo.orderId }
      });
      
      if (!order) {
        console.log(`  ❌ Order not found in database\n`);
        continue;
      }
      
      console.log(`  Current status: ${order.status}`);
      console.log(`  Current payment: ${order.paymentStatus}`);
      
      if (order.status === 'CONFIRMED') {
        console.log(`  ✅ Already confirmed\n`);
        continue;
      }
      
      // Update the order
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'CONFIRMED',
          paymentStatus: 'SUCCEEDED',
          stripePaymentIntentId: orderInfo.paymentIntentId,
          confirmedAt: new Date()
        }
      });
      
      console.log(`  ✅ Updated to: ${updatedOrder.status} / ${updatedOrder.paymentStatus}`);
      console.log(`  Payment Intent: ${updatedOrder.stripePaymentIntentId}`);
      console.log(`  Confirmed at: ${updatedOrder.confirmedAt}\n`);
    }
    
    console.log('✅ All pending orders have been fixed!');
    console.log('\n⚠️  Note: This is a manual fix. You still need to fix the webhook');
    console.log('so future orders are automatically confirmed.\n');
    
  } catch (error) {
    console.error('❌ Error fixing orders:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPendingOrders();
