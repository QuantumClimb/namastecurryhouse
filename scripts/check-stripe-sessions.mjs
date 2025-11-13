import dotenv from 'dotenv';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const prisma = new PrismaClient();

console.log('🔍 Comparing recent Stripe sessions with database orders...\n');

try {
  // Get recent Stripe sessions
  const sessions = await stripe.checkout.sessions.list({ limit: 10 });
  
  // Get recent orders from database
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  console.log('📊 Recent Stripe Sessions vs Database Orders:\n');
  
  for (let i = 0; i < Math.min(5, sessions.data.length); i++) {
    const session = sessions.data[i];
    const matchingOrder = orders.find(o => o.stripeSessionId === session.id);
    
    console.log(`${i + 1}. Stripe Session: ${session.id}`);
    console.log(`   Stripe Status: ${session.status} | Payment: ${session.payment_status}`);
    console.log(`   Amount: €${(session.amount_total / 100).toFixed(2)}`);
    console.log(`   Payment Intent: ${session.payment_intent || 'N/A'}`);
    
    if (matchingOrder) {
      console.log(`   ✅ ORDER FOUND: ${matchingOrder.orderNumber}`);
      console.log(`   DB Status: ${matchingOrder.status} | Payment: ${matchingOrder.paymentStatus}`);
      console.log(`   Stripe Session ID in DB: ${matchingOrder.stripeSessionId || 'NOT SET'}`);
      console.log(`   Payment Intent in DB: ${matchingOrder.stripePaymentIntentId || 'NOT SET'}`);
      
      // Check mismatch
      if (session.payment_status === 'paid' && matchingOrder.status === 'PENDING') {
        console.log(`   ⚠️  MISMATCH: Stripe says PAID but DB says PENDING!`);
        console.log(`   → Webhook likely failed or wasn't processed`);
      }
    } else {
      console.log(`   ❌ NO MATCHING ORDER in database`);
    }
    console.log('');
  }

  // Check for pending orders with paid sessions
  console.log('\n🔍 Checking for pending orders that should be confirmed...\n');
  
  const pendingOrders = orders.filter(o => o.status === 'PENDING' && o.stripeSessionId);
  
  for (const order of pendingOrders) {
    try {
      const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
      console.log(`Order ${order.orderNumber}:`);
      console.log(`  Stripe Payment Status: ${session.payment_status}`);
      console.log(`  DB Status: ${order.status}`);
      
      if (session.payment_status === 'paid') {
        console.log(`  ⚠️  Should be CONFIRMED! Payment was completed in Stripe.`);
      }
    } catch (error) {
      console.log(`  Error checking session: ${error.message}`);
    }
  }

} catch (error) {
  console.error('Error:', error.message);
} finally {
  await prisma.$disconnect();
}
