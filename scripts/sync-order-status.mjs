import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { config } from 'dotenv';

config();

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

console.log('🔄 Syncing Order Status with Stripe...\n');
console.log('═══════════════════════════════════════════\n');

try {
  // Get all pending orders
  const pendingOrders = await prisma.order.findMany({
    where: {
      paymentStatus: 'PENDING',
      stripePaymentIntentId: { not: null }
    }
  });

  console.log(`Found ${pendingOrders.length} pending order(s) with Stripe payment intents.\n`);

  let updatedCount = 0;
  let alreadySucceededCount = 0;

  for (const order of pendingOrders) {
    try {
      // Check payment intent status in Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);
      
      console.log(`Order #${order.orderNumber}:`);
      console.log(`  Payment Intent: ${paymentIntent.id}`);
      console.log(`  Stripe Status: ${paymentIntent.status}`);
      console.log(`  Amount: €${(paymentIntent.amount / 100).toFixed(2)}`);
      
      if (paymentIntent.status === 'succeeded') {
        // Update order to succeeded
        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'SUCCEEDED',
            status: 'CONFIRMED',
            confirmedAt: new Date(paymentIntent.created * 1000), // Use Stripe's timestamp
          }
        });
        
        console.log(`  ✅ Updated to SUCCEEDED\n`);
        updatedCount++;
      } else if (paymentIntent.status === 'canceled') {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'FAILED',
            status: 'CANCELLED',
          }
        });
        console.log(`  ❌ Marked as CANCELLED\n`);
      } else {
        console.log(`  ⏳ Still pending (status: ${paymentIntent.status})\n`);
      }
      
    } catch (error) {
      console.log(`  ⚠️  Error checking payment: ${error.message}\n`);
    }
  }

  console.log('═══════════════════════════════════════════');
  console.log('Summary:');
  console.log(`  Orders checked: ${pendingOrders.length}`);
  console.log(`  ✅ Updated to SUCCEEDED: ${updatedCount}`);
  console.log('═══════════════════════════════════════════\n');

} catch (error) {
  console.error('❌ Error:', error.message);
} finally {
  await prisma.$disconnect();
}
